from __future__ import annotations

import html
import re
import urllib.parse
import urllib.request
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
DOCUMENTATION_URL = "https://www.semcosurfaces.com/documentation"
DOWNLOAD_DIR = ROOT / "tmp" / "semco-documents"
ASSET_DIR = ROOT / "assets" / "document-pages"
MANIFEST_PATH = ROOT / "src" / "knowledge" / "document-page-assets.ts"


EXCLUDED_FOR_PREVIEW = re.compile(r"(sds|safety|brochure|section-09670)", re.IGNORECASE)


def request_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def fetch_pdf_links() -> list[str]:
    text = request_bytes(DOCUMENTATION_URL).decode("utf-8", "ignore")
    patterns = [
        r"https?://[^\"'<>\s]+?\.pdf",
        r"//[^\"'<>\s]+?\.pdf",
        r"/s/[^\"'<>\s]+?\.pdf",
    ]
    links: list[str] = []

    for pattern in patterns:
        for raw in re.findall(pattern, text):
            link = html.unescape(raw).replace("\\/", "/")
            if link.startswith("//"):
                link = f"https:{link}"
            elif link.startswith("/"):
                link = f"https://www.semcosurfaces.com{link}"
            if link not in links:
                links.append(link)

    return links


def source_name_from_url(url: str) -> str:
    path = urllib.parse.urlparse(url).path
    return urllib.parse.unquote(Path(path).name)


def asset_stem(source_document: str) -> str:
    stem = Path(source_document).stem
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-")
    return stem or "document"


def ts_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def render_first_page(pdf_path: Path, source_document: str) -> dict[str, object]:
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    asset_name = f"{asset_stem(source_document)}-p01.jpg"
    asset_path = ASSET_DIR / asset_name
    pix.save(asset_path, jpg_quality=86)
    doc.close()

    return {
        "sourceDocument": source_document,
        "pageNumber": 1,
        "width": pix.width,
        "height": pix.height,
        "assetName": asset_name,
    }


def generate_manifest(assets: list[dict[str, object]], urls: list[tuple[str, str]]) -> None:
    lines: list[str] = [
        "import type { ImageSourcePropType } from 'react-native';",
        "",
        "export type DocumentPageAsset = {",
        "  sourceDocument: string;",
        "  pageNumber: number;",
        "  width: number;",
        "  height: number;",
        "  image: ImageSourcePropType;",
        "};",
        "",
        "export const DOCUMENT_PAGE_ASSETS: DocumentPageAsset[] = [",
    ]

    for asset in sorted(assets, key=lambda item: str(item["sourceDocument"]).lower()):
        lines.append("  {")
        lines.append(f"    sourceDocument: '{ts_string(str(asset['sourceDocument']))}',")
        lines.append(f"    pageNumber: {asset['pageNumber']},")
        lines.append(f"    width: {asset['width']},")
        lines.append(f"    height: {asset['height']},")
        lines.append(f"    image: require('../../assets/document-pages/{asset['assetName']}'),")
        lines.append("  },")

    lines.extend(
        [
            "];",
            "",
            "export const DOCUMENT_SOURCE_URLS: Record<string, string> = {",
        ]
    )

    for source_document, url in sorted(urls, key=lambda item: item[0].lower()):
        lines.append(f"  '{ts_string(source_document)}': '{ts_string(url)}',")

    lines.extend(
        [
            "};",
            "",
            "function normalizeDocumentName(value: string): string {",
            "  return value.toLowerCase().replace(/\\.pdf$/, '').replace(/[^a-z0-9]+/g, '');",
            "}",
            "",
            "const assetLookup = new Map(",
            "  DOCUMENT_PAGE_ASSETS.map((asset) => [",
            "    `${normalizeDocumentName(asset.sourceDocument)}:${asset.pageNumber}`,",
            "    asset,",
            "  ]),",
            ");",
            "",
            "const sourceUrlLookup = new Map(",
            "  Object.entries(DOCUMENT_SOURCE_URLS).map(([sourceDocument, url]) => [",
            "    normalizeDocumentName(sourceDocument),",
            "    url,",
            "  ]),",
            ");",
            "",
            "export function getDocumentPageAsset(sourceDocument: string, pageNumber = 1): DocumentPageAsset | undefined {",
            "  return assetLookup.get(`${normalizeDocumentName(sourceDocument)}:${pageNumber}`);",
            "}",
            "",
            "export function getDocumentSourceUrl(sourceDocument: string): string | undefined {",
            "  return sourceUrlLookup.get(normalizeDocumentName(sourceDocument));",
            "}",
            "",
        ]
    )

    MANIFEST_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)

    links = fetch_pdf_links()
    rendered_assets: list[dict[str, object]] = []
    source_urls: list[tuple[str, str]] = []

    for url in links:
        source_document = source_name_from_url(url)
        source_urls.append((source_document, url))

        if EXCLUDED_FOR_PREVIEW.search(source_document):
            continue

        pdf_path = DOWNLOAD_DIR / source_document
        if not pdf_path.exists():
            pdf_path.write_bytes(request_bytes(url))

        rendered_assets.append(render_first_page(pdf_path, source_document))

    generate_manifest(rendered_assets, source_urls)
    print(f"Rendered {len(rendered_assets)} page previews from {len(links)} Semco PDFs.")


if __name__ == "__main__":
    main()
