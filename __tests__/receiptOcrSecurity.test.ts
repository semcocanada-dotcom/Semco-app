import fs from 'fs'
import path from 'path'

const root = path.join(__dirname, '..')
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const dynamicConfigSource = fs.readFileSync(path.join(root, 'app.config.ts'), 'utf8')
const clientSource = fs.readFileSync(path.join(root, 'lib', 'ocr.ts'), 'utf8')
const expenseSource = fs.readFileSync(path.join(root, 'app', '(tabs)', 'expenses.tsx'), 'utf8')
const serverSource = fs.readFileSync(
  path.join(root, 'supabase', 'functions', 'receipt-ocr', 'index.ts'),
  'utf8',
)

describe('authenticated receipt OCR boundary', () => {
  it('does not ship a Google service credential or call Vision directly from the app', () => {
    expect(appConfig.expo.extra.googleVisionApiKey).toBeUndefined()
    expect(JSON.stringify(appConfig)).not.toContain('AIza')
    expect(dynamicConfigSource).not.toContain('GOOGLE_VISION_API_KEY')
    expect(dynamicConfigSource).not.toContain('googleVisionApiKey')
    expect(clientSource).not.toContain('vision.googleapis.com')
    expect(expenseSource).toContain("supabase.functions.invoke('receipt-ocr'")
  })

  it('requires an authenticated user and validates receipt size and type server-side', () => {
    expect(serverSource).toContain('authClient.auth.getUser(accessToken)')
    expect(serverSource).toContain('MAX_BASE64_CHARACTERS')
    expect(serverSource).toContain('allowedMimeTypes.has(mimeType)')
    expect(serverSource).toContain("'Cache-Control': 'no-store'")
    expect(serverSource).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
  })
})
