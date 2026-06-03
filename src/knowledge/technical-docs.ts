export interface TechnicalDoc {
  id: string;
  title: string;
  sourceDocument: string;
  category: string;
  pageCount: number;
}

export interface TechnicalDocPage {
  id: string;
  docId: string;
  pageNumber: number;
  text: string;
  sourceDocument: string;
  title: string;
  category: string;
  wordCount: number;
}

export const TECHNICAL_DOCS: TechnicalDoc[] = [
  {
    "id": "doc-ada-mma-system-steps",
    "title": "ADA MMA System Steps",
    "sourceDocument": "ADA-MMA-System-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-basement-waterproofing-2",
    "title": "Basement Waterproofing 2",
    "sourceDocument": "Basement-Waterproofing-2.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-basement-waterproofing-x-bond",
    "title": "Basement Waterproofing X Bond",
    "sourceDocument": "Basement-Waterproofing-X-Bond.pdf",
    "category": "X-Bond",
    "pageCount": 1
  },
  {
    "id": "doc-basement-waterproofing",
    "title": "Basement Waterproofing",
    "sourceDocument": "Basement-Waterproofing.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-broadcast-system-steps",
    "title": "Broadcast System Steps",
    "sourceDocument": "Broadcast-System-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-ceiling-surface-steps",
    "title": "Ceiling Surface Steps",
    "sourceDocument": "Ceiling-Surface-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-color-bond-steps",
    "title": "Color Bond Steps",
    "sourceDocument": "Color-Bond-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-cove-base-detail-plywood",
    "title": "Cove Base Detail Plywood",
    "sourceDocument": "Cove-Base-Detail-Plywood.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-cove-base-detail",
    "title": "Cove Base Detail",
    "sourceDocument": "Cove-Base-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-cracks-joints-wider-14",
    "title": "Cracks Joints wider 14",
    "sourceDocument": "Cracks-Joints-wider-14.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-drain-detail",
    "title": "Drain Detail",
    "sourceDocument": "Drain-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-lm-data-sheet",
    "title": "LM Data Sheet",
    "sourceDocument": "LM-Data-Sheet.pdf",
    "category": "Liquid Membrane",
    "pageCount": 1
  },
  {
    "id": "doc-lm-over-concrete",
    "title": "LM over concrete",
    "sourceDocument": "LM-over-concrete.pdf",
    "category": "Liquid Membrane",
    "pageCount": 1
  },
  {
    "id": "doc-lm-over-gyp-crete",
    "title": "LM over Gyp crete",
    "sourceDocument": "LM-over-Gyp-crete.pdf",
    "category": "Liquid Membrane",
    "pageCount": 1
  },
  {
    "id": "doc-lm-safety-data-sheet",
    "title": "LM Safety Data Sheet",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "category": "Liquid Membrane",
    "pageCount": 6
  },
  {
    "id": "doc-lm-tech-sheet",
    "title": "LM Tech Sheet",
    "sourceDocument": "LM-Tech-Sheet.pdf",
    "category": "Liquid Membrane",
    "pageCount": 3
  },
  {
    "id": "doc-modern-brochure",
    "title": "Modern brochure",
    "sourceDocument": "Modern brochure.pdf",
    "category": "Brochure",
    "pageCount": 28
  },
  {
    "id": "doc-natural-grain-steps",
    "title": "Natural Grain Steps",
    "sourceDocument": "Natural-Grain-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-natural-shield-data-sheet",
    "title": "Natural Shield Data Sheet",
    "sourceDocument": "Natural-Shield-Data-Sheet.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-natural-shield-sds",
    "title": "Natural Shield SDS",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "category": "Technical doc",
    "pageCount": 9
  },
  {
    "id": "doc-natural-shield-tech-sheet",
    "title": "Natural Shield Tech Sheet",
    "sourceDocument": "Natural-Shield-Tech-Sheet.pdf",
    "category": "Technical doc",
    "pageCount": 3
  },
  {
    "id": "doc-nulift-datasheet",
    "title": "NuLift Datasheet",
    "sourceDocument": "NuLift-Datasheet.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-nulift-sds",
    "title": "NuLift SDS",
    "sourceDocument": "NuLift-SDS.pdf",
    "category": "Technical doc",
    "pageCount": 6
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2",
    "title": "Open SIP manual master copy  3 2",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "category": "SIP manual",
    "pageCount": 49
  },
  {
    "id": "doc-polished-bond-steps",
    "title": "Polished Bond Steps",
    "sourceDocument": "Polished-Bond-Steps.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-pool-deck-resurfacing-detail",
    "title": "Pool Deck Resurfacing Detail",
    "sourceDocument": "Pool-Deck-Resurfacing-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-pool-resurfacing-detail-interior-below-grade",
    "title": "Pool Resurfacing Detail Interior Below Grade",
    "sourceDocument": "Pool-Resurfacing-Detail-Interior-Below-Grade.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-power-cleaner-datasheet",
    "title": "Power Cleaner Datasheet",
    "sourceDocument": "Power-Cleaner-Datasheet.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-power-cleaner-sds",
    "title": "Power Cleaner SDS",
    "sourceDocument": "Power-Cleaner-SDS.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-prep-e",
    "title": "PREP E",
    "sourceDocument": "PREP-E.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-prestain-data-sheet",
    "title": "prestain data sheet",
    "sourceDocument": "prestain-data-sheet.pdf",
    "category": "PreStain",
    "pageCount": 1
  },
  {
    "id": "doc-prestain-sds",
    "title": "PreStain SDS",
    "sourceDocument": "PreStain-SDS.pdf",
    "category": "PreStain",
    "pageCount": 9
  },
  {
    "id": "doc-prestain-tech-sheet",
    "title": "prestain tech sheet",
    "sourceDocument": "prestain-tech-sheet.pdf",
    "category": "PreStain",
    "pageCount": 3
  },
  {
    "id": "doc-product-brochure",
    "title": "Product brochure",
    "sourceDocument": "Product brochure.pdf",
    "category": "Brochure",
    "pageCount": 46
  },
  {
    "id": "doc-satin-stone-chemical-resistance",
    "title": "Satin Stone chemical resistance",
    "sourceDocument": "Satin-Stone-chemical-resistance.pdf",
    "category": "Satin Stone",
    "pageCount": 1
  },
  {
    "id": "doc-satin-stone-data-sheet",
    "title": "Satin Stone Data Sheet",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "category": "Satin Stone",
    "pageCount": 10
  },
  {
    "id": "doc-satin-stone-sds",
    "title": "Satin Stone SDS",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "category": "Satin Stone",
    "pageCount": 7
  },
  {
    "id": "doc-satin-stone-tech-data-sheet",
    "title": "Satin Stone Tech Data Sheet",
    "sourceDocument": "Satin-Stone-Tech-Data-Sheet.pdf",
    "category": "Satin Stone",
    "pageCount": 1
  },
  {
    "id": "doc-satin-stone-tech-sheet",
    "title": "Satin Stone Tech Sheet",
    "sourceDocument": "Satin+Stone+Tech+Sheet.pdf",
    "category": "Satin Stone",
    "pageCount": 3
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces",
    "title": "Section 09670 Fluid Applied Surfaces",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "category": "Technical doc",
    "pageCount": 5
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2",
    "title": "SEMCO Surfaces Brochure (digital)",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "category": "Brochure",
    "pageCount": 14
  },
  {
    "id": "doc-shower-detail-concrete",
    "title": "Shower Detail Concrete",
    "sourceDocument": "Shower-Detail-Concrete.pdf",
    "category": "Shower detail",
    "pageCount": 1
  },
  {
    "id": "doc-shower-detail-wood",
    "title": "Shower Detail Wood",
    "sourceDocument": "Shower-Detail-Wood.pdf",
    "category": "Shower detail",
    "pageCount": 1
  },
  {
    "id": "doc-shower-detail",
    "title": "Shower Detail",
    "sourceDocument": "Shower-Detail.pdf",
    "category": "Shower detail",
    "pageCount": 1
  },
  {
    "id": "doc-shower-drain-detail",
    "title": "Shower Drain Detail",
    "sourceDocument": "Shower-Drain-Detail.pdf",
    "category": "Shower detail",
    "pageCount": 1
  },
  {
    "id": "doc-stair-detail",
    "title": "Stair Detail",
    "sourceDocument": "Stair-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-stone-soap-datasheet",
    "title": "Stone Soap Datasheet",
    "sourceDocument": "Stone-Soap-Datasheet.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-stone-soap-sds",
    "title": "Stone Soap SDS",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "category": "Technical doc",
    "pageCount": 6
  },
  {
    "id": "doc-tech-sheet-satin-stone-v5",
    "title": "Tech Sheet Satin Stone",
    "sourceDocument": "Tech_Sheet_Satin-Stone-v5.pdf",
    "category": "Satin Stone",
    "pageCount": 3
  },
  {
    "id": "doc-tech-sheet-titanshield-v8",
    "title": "Tech Sheet TitanShield",
    "sourceDocument": "Tech_Sheet_TitanShield-v8.pdf",
    "category": "Technical doc",
    "pageCount": 3
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3",
    "title": "Tech Sheet X Bond",
    "sourceDocument": "Tech_Sheet_X-Bond-2024-v3.pdf",
    "category": "X-Bond",
    "pageCount": 3
  },
  {
    "id": "doc-titan-gloss-product-sheet",
    "title": "Titan Gloss Product Sheet",
    "sourceDocument": "Titan-Gloss-Product-Sheet.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-titan-gloss-tech-data-sheet",
    "title": "Titan Gloss Tech Data Sheet",
    "sourceDocument": "Titan-Gloss-Tech-Data-Sheet.pdf",
    "category": "Technical doc",
    "pageCount": 3
  },
  {
    "id": "doc-titan-shield-sds",
    "title": "Titan Shield SDS",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "category": "Technical doc",
    "pageCount": 7
  },
  {
    "id": "doc-wall-detail",
    "title": "Wall Detail",
    "sourceDocument": "Wall-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-waterproofing-metal",
    "title": "Waterproofing Metal",
    "sourceDocument": "Waterproofing-Metal.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-wood-detail",
    "title": "Wood Detail",
    "sourceDocument": "Wood-Detail.pdf",
    "category": "Technical doc",
    "pageCount": 1
  },
  {
    "id": "doc-x-bond-additive-sds",
    "title": "X Bond Additive SDS",
    "sourceDocument": "X-Bond-Additive-SDS.pdf",
    "category": "X-Bond",
    "pageCount": 3
  },
  {
    "id": "doc-x-bond-liquid-sds",
    "title": "X Bond Liquid SDS",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "category": "X-Bond",
    "pageCount": 7
  },
  {
    "id": "doc-x-bond-microbond-sds",
    "title": "X Bond Microbond SDS",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "category": "X-Bond",
    "pageCount": 9
  },
  {
    "id": "doc-x-bond-over-tile-detail",
    "title": "X Bond Over Tile Detail",
    "sourceDocument": "X-Bond-Over-Tile-Detail.pdf",
    "category": "X-Bond",
    "pageCount": 1
  },
  {
    "id": "doc-x-bond-stone-sds",
    "title": "X Bond Stone SDS",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "category": "X-Bond",
    "pageCount": 8
  },
  {
    "id": "doc-x-bondmicrocementdatasheet2024",
    "title": "X BondMicrocementDataSheet2024",
    "sourceDocument": "X-BondMicrocementDataSheet2024.pdf",
    "category": "X-Bond",
    "pageCount": 2
  },
  {
    "id": "doc-x-bondoverconcretefloordetail-2025",
    "title": "X BondoverConcreteFloorDetail",
    "sourceDocument": "X-BondoverConcreteFloorDetail-2025.pdf",
    "category": "X-Bond",
    "pageCount": 1
  }
];

export const TECHNICAL_DOC_PAGES: TechnicalDocPage[] = [
  {
    "id": "doc-ada-mma-system-steps-p1",
    "docId": "doc-ada-mma-system-steps",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n20 22 .V01 TYPE A\nSEMCO Stone Soap\nX-BOND ADA MMA SYSTEM\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING SUBSTRATE\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS FLAT\nSEMCO X-Crete 500\nSEMCO Natural Shield\nTYPE B\nSEMCO Power Cleaner\nStone Soap MATTE/GLOSS\nSEMCO X-Crete 400\nSEMCO Titan Shield HIGH GLOSS\nSEMCO Xtra Gloss\nCrystal Coat TYPE D\nSEMCO Nu-Lift Cleaner\nStone Soap\nDEEP GLOSS\nSEMCO Xtreme Gloss\nSCRATCH COAT\nFINISH\nXtreme Gloss sealer\n1/8”\nSEMCO LIQUID M EMBRANE™\nwith fabric reinforcement\n+ BROWN COAT\n(OPTIONAL)\nX-BOND SEAMLESS STONE\nX-BOND ADA MMA SYSTEM\n1/8” - 1/2” TYPE E SATIN\nSEMCO Satin Stone TYPE C\nSEMCO Industrial\nCleaner and Degreaser",
    "sourceDocument": "ADA-MMA-System-Steps.pdf",
    "title": "ADA MMA System Steps",
    "category": "Technical doc",
    "wordCount": 129
  },
  {
    "id": "doc-basement-waterproofing-2-p1",
    "docId": "doc-basement-waterproofing-2",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nconcrete\n1. Existing substrate - concrete\n2. SEMCO Liquid Membrane™ - 2 coats, each coat 15 mil. Total thickness - 30 mil (2 coats).\nLet each coat dry before applying next coat.\n3. Fabric reinforcement\n4. SEMCO Liquid Membrane™ - 2 coats, each coat 15 mil. Total thickness - 30 mil (2 coats).\nLet each coat dry before applying next coat.\nTotal system thickness - 60 mil (approx)\n4 coats of SEMCO Liquid Membrane™\n2 3 4\n2021 .V03 * Drawings are not to scale\nSEMCO LIQUID MEMBRANE™\n1st coat\nFABRIC REINFORCEMENT\n6” wide\nSEMCO LIQUID MEMBRANE™\n2nd coat\n1\nReduces RH up to 75% / vapor transmission rate up to 10 PSI SURFACE ENGINEERING COMPANY\nBASEMENT WATERPROOFING",
    "sourceDocument": "Basement-Waterproofing-2.pdf",
    "title": "Basement Waterproofing 2",
    "category": "Technical doc",
    "wordCount": 120
  },
  {
    "id": "doc-basement-waterproofing-x-bond-p1",
    "docId": "doc-basement-waterproofing-x-bond",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nconcrete\nSCRATCH COAT\nNATURAL SHIELD\nX-BOND SEAMLESS\nSTONE\n1. Existing substrate - concrete\n2. Natural Shield, 2 coats\n3. Scratch Coat\n4. SEMCO Liquid Membrane™ - 2 coats, each 15 mil. Total\nthickness - 30 mil. Let each coat dry before applying next coat.\n5. Fabric R einforcement\n6. SEMCO Liquid Membrane™ - 2 coats, each 15 mil. Total\nthickness - 30 mil. Let each coat dry before applying next coat.\n7. Scratch Coat\n8. X-Bond Seamless Stone - apply in different layers to a total\nthickness of 1/ 8 ” (about 3.175 mm).\nX-Bond layers do not need to be dry\nbefore applying next coat.\nTotal system thickness - 3/16\" (4 . 7 5 mm)\n1/ 8 “ X-Bond + 60 mil SEMCO Liquid Membrane™\n2 3 4 7 8 6 5\n1\n2022 . V01 * Drawings are not to scale\nSCRATCH COAT\nSEMCO LIQUID MEMBRANE™\nwith F abric R einforcement\nReduces RH up to 90%, vapor transmission up to 20 PSI SURFACE ENGINEERING COMPANY\nBASEMENT WATERPROOFING",
    "sourceDocument": "Basement-Waterproofing-X-Bond.pdf",
    "title": "Basement Waterproofing X Bond",
    "category": "X-Bond",
    "wordCount": 171
  },
  {
    "id": "doc-basement-waterproofing-p1",
    "docId": "doc-basement-waterproofing",
    "pageNumber": 1,
    "text": "PROBLEMS: With rain or from other sources such as irrigation or condensation, moisture\ncan creep into your basement through your foundation walls or concrete ground slab.\nSOLUTION: SEMCO LIQUID MEMBRANE™\n2021 .V03 * Drawings are not to scale\nSEMCO Liquid Membrane™ is a single component waterproofing and anti-fracture membrane. SEMCO\nLiquid Membrane™ is a self-contained elastomeric fluid suspended in a copolymer adhesive, this revolutionary\nblend enables easy application while providing excellent bridging, and waterproofing. When combined with\nSEMCO’s X-Bond Seamless Stone, two-stage waterproofing is achieved, enabling single source protection.\nEASY APPLICATION\nNo specialty tools required\nROLLER PAINT BRUSH\nWaterproofing failures can cause the\nfollowing problems:\n1. Mold, mildew, vegetative growth and odors\n2. Stains and rust\n3. Efflorescence and spalling of concrete or\nmasonry that might eventually lead to serious\nstructural concerns\n4. Deteriation of carpet and wood rot\n5. Delamination of existing wall and floor coverings\nSolution for Basement/Submerged Substrate\nWaterproofing Problems\nRainwater\nSaturated soil\nMoisture enters\nbasement by vapor\ndiffusion and cappilary\nsuction through the\nconcrete\nSoil becomes saturated beneath footing and slab\nGroundwater\nSEMCO Liquid Membrane™\nInternal moisture sources\nSURFACE ENGINEERING COMPANY\nBASEMENT WATERPROOFING",
    "sourceDocument": "Basement-Waterproofing.pdf",
    "title": "Basement Waterproofing",
    "category": "Technical doc",
    "wordCount": 187
  },
  {
    "id": "doc-broadcast-system-steps-p1",
    "docId": "doc-broadcast-system-steps",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n20 22 .V01 TYPE A\nSEMCO Stone Soap\nX-BOND ADA BROADCAST SYSTEM\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING SUBSTRATE\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS FLAT\nSEMCO X-Crete 500\nSEMCO Natural Shield\nTYPE B\nSEMCO Power Cleaner\nStone Soap MATTE/GLOSS\nSEMCO X-Crete 400\nSEMCO Titan Shield HIGH GLOSS\nSEMCO Xtra Gloss\nCrystal Coat TYPE D\nSEMCO Nu-Lift Cleaner\nStone Soap\nDEEP GLOSS\nSEMCO Xtreme Gloss\nSCRATCH COAT\nFINISH\nXtreme Gloss sealer\n1/8”\nSEMCO LIQUID M EMBRANE™\nwith fabric reinforcement\n+ BROWN COAT\n(OPTIONAL)\nX-BOND SEAMLESS STONE\nX-BOND ADA BROADCAST SYSTEM\n3/16” - 2” TYPE E SATIN\nSEMCO Satin Stone TYPE C\nSEMCO Industrial\nCleaner and Degreaser",
    "sourceDocument": "Broadcast-System-Steps.pdf",
    "title": "Broadcast System Steps",
    "category": "Technical doc",
    "wordCount": 129
  },
  {
    "id": "doc-ceiling-surface-steps-p1",
    "docId": "doc-ceiling-surface-steps",
    "pageNumber": 1,
    "text": "MATTE\nSEMCO Satin Stone\n3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2021.V01\nCEILING SURFACE\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING\nCEILING\nSUBSTRATE\nJOINTS/SEAMS\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS\nWET ROOMS\nSEMCO Natural Shield\n& Xtre Gloss\nSCRATCH COAT\nSCRATCH COAT\nFINISH\nX-BOND SEAMLESS STONE\n(FOR SHOWERS AND WET ROOMS\nMINIMUM THICKNESS - 1/4”)\nGLOSS\nSEMCO Xtreme Gloss\nSEMCO LIQUID MEMBRANE™ +\nFABRIC REINFORCEMENT\n(OVER JOINTS AND SEAMS)\nTYPE A\nSEMCO Stone Soap\nTYPE E\nOver Wood",
    "sourceDocument": "Ceiling-Surface-Steps.pdf",
    "title": "Ceiling Surface Steps",
    "category": "Technical doc",
    "wordCount": 93
  },
  {
    "id": "doc-color-bond-steps-p1",
    "docId": "doc-color-bond-steps",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n20 22 .V01\nCOLOR BOND\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING SUBSTRATE\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS\nFLAT\nSEMCO X-Crete 500\nSEMCO Natural Shield\nMATTE/GLOSS\nSEMCO X-Crete 400\nSEMCO Titan Shield\nHIGH GLOSS\nSEMCO Xtra Gloss\nCrystal Coat\nDEEP GLOSS\nSEMCO Xtreme Gloss\nCrystal Coat\nFINISH\nSCRATCH COAT\nSEMCO LIQUID MEMBRANE™\nwith fabric reinforcement\n+ BROWN COAT\n(OPTIONAL)\nX-BOND SEAMLESS STONE\nCOLOR BOND\nSATIN\nSEMCO Satin Stone\nTYPE A\nSEMCO All Purpose\nCleaner\nTYPE B\nSEMCO Commercial\nCleaner\nTYPE C\nSEMCO Industrial\nCleaner and Degreaser\nTYPE D\nSEMCO Mineral\nCleanser\nTYPE E\nOver Wood",
    "sourceDocument": "Color-Bond-Steps.pdf",
    "title": "Color Bond Steps",
    "category": "Technical doc",
    "wordCount": 118
  },
  {
    "id": "doc-cove-base-detail-plywood-p1",
    "docId": "doc-cove-base-detail-plywood",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nPLYWOOD\nPREPARATION - TYPE E\nSCRATCH COAT\n1. Existing substrate - plywood\n2. SEMCO Liquid Membrane™\n3. Fabric reinforcement\n4. SEMCO Liquid Membrane™\n5. X-Bond Scratch Coat\n6. X-Bond Mixture (up to 3/4” radius)\n7. X-Bond Seamless Stone - ADA Safety Floor\n8. Satin Stone\nDrawings are not to scale\n6 2 3 4 5 7 8\n1\nFINISH\nSatin Stone\nX-BOND MIXTURE\n1 part of X-Bond Liquid to 3 parts of X-Bond Stone\nup to 3/4” radius\nX-BOND SEAMLESS STONE\nADA Safety Floor\nSEMCO\nLIQUID MEMBRANE™\nwith fabric reinforcement\n2021 .V02 * Drawings are not to scale\nX-Bond Seamless Stone over plywood SURFACE ENGINEERING COMPANY\nCOVE BASE DETAIL",
    "sourceDocument": "Cove-Base-Detail-Plywood.pdf",
    "title": "Cove Base Detail Plywood",
    "category": "Technical doc",
    "wordCount": 111
  },
  {
    "id": "doc-cove-base-detail-p1",
    "docId": "doc-cove-base-detail",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nCONCRETE\nSCRATCH COAT\nPREPARATION - TYPE B\nSEMCO Commercial Cleaner\nFINISH\nSatin Stone\nSCRATCH COAT\nX-BOND MIXTURE\n1 part of X-Bond Liquid to 3 parts of X-Bond Stone\nup to 3/4” radius\nX-BOND SEAMLESS STONE\nADA Safety Floor\n1. Existing substrate\n2. X-Bond Scratch Coat\n3. SEMCO Liquid Membrane™\n4. Fabric reinforcement\n5. SEMCO Liquid Membrane™\n6. X-Bond Scratch Coat\n7. X-Bond Mixture (up to 3/4” radius)\n8. X-Bond Seamless Stone - ADA Safety Floor\n9. Satin Stone\nDrawings are not to scale\n5 2 3 4 6 7 8\n1\n2021 .V02 * Drawings are not to scale\nSEMCO\nLIQUID MEMBRANE™\nwith fabric reinforcement\nX-Bond Seamless Stone over concrete SURFACE ENGINEERING COMPANY\nCOVE BASE DETAIL",
    "sourceDocument": "Cove-Base-Detail.pdf",
    "title": "Cove Base Detail",
    "category": "Technical doc",
    "wordCount": 118
  },
  {
    "id": "doc-cracks-joints-wider-14-p1",
    "docId": "doc-cracks-joints-wider-14",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2019.V02\nCracks wider than 1/4”\nCAUTION! Reopen exterior control joints - 1/4” wide and 1/4” deep.\n2 3 7 6\n4\n1\n5\n* Drawings are not to scale\n1. Existing substrate - concrete\n2. Scratch Coat\n3. Liquid Membrane, apply 2 coats (40 mils)\n4. Fill cracks with X-Bond Brown Coat:\n1 part of X-Bond Liquid to 1 part of X-Bond Additive to 2 1/2 parts of X-Bond Stone\n5. Liquid Membrane, 1st coat\n6. Fabric reinforcement, while Liquid Membrane is still wet, embed fabric reinforcement into it\n7. Liquid Membrane, apply 2nd coat over embedded fabric reinforcement immediately\nLiquid Membrane over cracks wider than 1/4” SURFACE ENGINEERING COMPANY\nCRACKS & CONTROL JOINTS",
    "sourceDocument": "Cracks-Joints-wider-14.pdf",
    "title": "Cracks Joints wider 14",
    "category": "Technical doc",
    "wordCount": 126
  },
  {
    "id": "doc-drain-detail-p1",
    "docId": "doc-drain-detail",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nCONCRETE\nSCRATCH COAT\nPREPARATION - TYPE B\nSEMCO Commercial Cleaner\nFINISH\nSatin Stone\nSCRATCH COAT\nBROWN COAT\nas needed\nX-BOND SEAMLESS STONE\nADA Safety Floor\n1. Existing substrate - concrete\n2. X-Bond Scratch Coat\n3. SEMCO Liquid Membrane™\n4. Fabric reinforcement\n5. SEMCO Liquid Membrane™\n6. X-Bond Scratch Coat\n7. X-Bond Brown Coat (as needed)\n8. X-Bond Seamless Stone - ADA Safety Floor\n9. Satin Stone\n2 3 4 5 6 7 8 9 Drain flange\n1\nSEMCO\nLIQUID MEMBRANE™\nwith fabric reinforcement\n2021 .V02 * Drawings are not to scale\nX-Bond Seamless Stone over concrete SURFACE ENGINEERING COMPANY\nDRAIN DETAIL",
    "sourceDocument": "Drain-Detail.pdf",
    "title": "Drain Detail",
    "category": "Technical doc",
    "wordCount": 103
  },
  {
    "id": "doc-lm-data-sheet-p1",
    "docId": "doc-lm-data-sheet",
    "pageNumber": 1,
    "text": "PRODUCT DESCRIPTION\nSEMCO’s Liquid Membrane™ is a single component waterproofing and anti-fracture membrane. The SEMCO\nLiquid Membrane™ is a self-contained elastomeric fluid suspended in a copolymer adhesive, this revolutionary blend\nenables easy application while providing excellent bridging, and waterproofing. When combined with SEMCO’s\nX-Bond Seamless Stone, two-stage waterproofing is achieved, enabling single source protection.\nANSI 118.10 – Breaking Strength (ASTM D751, Procedure B) Pass\nANSI 118.10 – Dimensional Stability (ASTM D1204) Pass\nANSI 118.10 – 7-Day Shear Strength (ASTM C482-9.8) 173 PSI\nANSI 118.10 – 7-Day Water Immersion Shear Strength 132 PSI\nANSI 118.10 – 4-Week Shear Strength 234 PSI\nASTM E96 – Water Vapor Transmission 1.52 (g/hr-m2)\nASTM E96 – Water Vapor Transmission: Permeability 0.135 (perm-in)\nISO 37 – Tensile Strength (ASTM D412): Maximum Stress 453 PSI\nISO 37 – Tensile Strength (ASTM D412): Ultimate Elongation 321%\nASTM D42370 – Tensile Strength: Maximum Stress 184 PSI\nASTM D42370 – Tensile Strength: Ultimate Elongation 1,300%\nSEMCO LIQUID MEMBRANE ™\nWaterproof Adhesive\nTechnical Product Information\nWARRANTY 5 year standard limited warranty, 10 year for non-traffic surfaces\nTEST RESULTS\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. When performing a flood test remove all excess water if test is performed prior to 100% curing. Not for use on humans or animals. Be sure to read container\nlabel and Safety Data Sheet for additional handling requirements before using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness of use. The only obligation of the seller-manufacturer shall be\nto replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or consequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate.\nHowever, since the conditions of handling and use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply with all applicable\nfederal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2023.V01\nSURFACE ENGINEERING COMPANY\nSUBSTRATES\n• Concrete\n• Plywood\n• Stone\n• Exterior/Interior cladding\n• Residential, industrial, and\ncommercial\nFEATURES / BENEFITS\n• Waterproofing:\ninterior, exterior and below grade\n• Crack bridging\n• Stabilization\n• Anti-fracture\nOpen pore substrates 25-50\nClosed pore substrates 35-65\nX-Bond Scratch Coat 100-150\nApplication 1/2” nap roller, paint brush or airless sprayer with tip size21 at 2,500 PSI (2 coats minimum)\nApplication environment Apply at temperatures from 50°F to 90°F\nDrying time 25 to 30 minutes at 72°F\nCure time 50% in 72 hours, 100% in 7 days\nColor Orange (other colors available upon request)\nChemical type Latex - crossilink hybrid\nClean up SEMCO Stone Soap with water\nShelf life 2 years in controlled environment (60°F - 72°F)\nWater test In 35 minutes after application\nPackaging (base and color activator) 1 gal., 5 gal. and 55 gal.\nVOC content 14 g/L or 0.20%\nAPPLICATION AND SPECIFICATIONS\nCOVERAGE (sq. ft. per gallon of mixture)",
    "sourceDocument": "LM-Data-Sheet.pdf",
    "title": "LM Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 542
  },
  {
    "id": "doc-lm-over-concrete-p1",
    "docId": "doc-lm-over-concrete",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\n(CONCRETE)\n2 3 4\n1. Existing substrate - concrete\n2. SEMCO Liquid Membrane™ - 1 coat at 15 mil\n3. Fabric reinforcement - while wet, embed fabric reinforcement and apply 15 mil to the fabric applied\narea (for expansion joints that do not exceed 1/8” joints must be filled prior to bridging)\n4. SEMCO Liquid Membrane™ - 1 coat at 15 mil\nNOTE: system is based on an application of sound\nand non-delaminating concrete expanded system\nmay be needed depending on existing conditions,\ncontact info@semcosurfaces.com for more details\nSEMCO\nLIQUID MEMBRANE™\nSEMCO\nLIQUID MEMBRANE™\nFABRIC REINFORCEMENT\n2021 .V02 * Drawings are not to scale\n1\nSEMCO Liquid Membrane™ over concrete SURFACE ENGINEERING COMPANY\nSEMCO\nLIQUID MEMBRANE™ DETAIL",
    "sourceDocument": "LM-over-concrete.pdf",
    "title": "LM over concrete",
    "category": "Liquid Membrane",
    "wordCount": 119
  },
  {
    "id": "doc-lm-over-gyp-crete-p1",
    "docId": "doc-lm-over-gyp-crete",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\n(GYP-CRETE)\n2 3\n1. Existing substrate - Gyp-Crete\n2. SEMCO Liquid Membrane™ - 1st coat at 15 mil\n3. SEMCO Liquid Membrane™ - 2nd coat at 15 mil\n1st coat - SEMCO\nLIQUID MEMBRANE™\n2nd coat - SEMCO\nLIQUID MEMBRANE™\n2021 .V01 * Drawings are not to scale\n1\nSEMCO Liquid Membrane™ over Gyp-Crete SURFACE ENGINEERING COMPANY\nSEMCO\nLIQUID MEMBRANE™ DETAIL",
    "sourceDocument": "LM-over-Gyp-crete.pdf",
    "title": "LM over Gyp crete",
    "category": "Liquid Membrane",
    "wordCount": 63
  },
  {
    "id": "doc-lm-safety-data-sheet-p1",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 1,
    "text": "Page 1 / 6\nSAFETY DATA SHEET\nIssue Date 18 - Sept - 2017 Revision Date 18 - Sept - 2017 Version 1\nProduct identifier\nProduct Name SEMCO LIQUID MEMBRANE ™\nOther means of identification\nProduct Code XME 8 00 0 , XME 8 00 , XME801, XME 8 0 5\nSynonyms Liquid Membrane, SEMCO Membrane , SEMCO L iquid Membr ane\nRecommended use of the chemical and restrictions on use\nRecommended Use Water - based emulsion polymers for use in coatings and adhesives. See our product\nl iterature to determine which SEMCO Modern Seamless Surface product(s) would be\nappropriate for a particular application.\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Surfaces Inc\n3620 West Reno Ave Suite J\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702 - 222 - 9495\n800 33 SEMCO\nEmergency Telephone Chemtrec 1 - 800 - 424 - 9300\nClassification\nOSHA Regulatory Status\nThis chemical is not considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.1200)\nNot a dangerous substance or mixture according to the Globally Harmonized System (GHS)\nLabel elements\nEmergency Overview\nHazards not otherwise classified (HNOC)\nOther Information\nUnknown Acute Toxicity 22 .71787 % of the mixture consists of ingredient(s) of unknown toxicity\nThe product contains no substances which at their given concentration, are considered to be hazardous to health\nAppearance Oran ge , Milky White Physical state Liquid Odor Slight\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\n3. COMPOSITION/INFORMATION ON INGREDIENTS",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 261
  },
  {
    "id": "doc-lm-safety-data-sheet-p2",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 2,
    "text": "Page 2 / 6\nSEMCO Liquid Membrane ™ Revision Date 18 - Sept - 2017\nSubstance\nChemical Name CAS No. Weight - % Trade Secret\nAmmonium hydroxide 1336 - 21 - 6 <0. 1 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms No information available.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol - resistant foam or water spray.\nUnsuitable exti nguishing media CAUTION: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo information available.\nExplosion data\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self - contained breathing apparatus pressure - demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See section 12 for additional ecological information.\nMetho ds and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so. Dike far ahead of spill; use dry sand to\ncontain the flow of material.\n5. FIRE - FIGHTING MEASURES\n4. FIRST AID MEASURES\n6. ACCIDENTAL RELEASE MEASURES",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 294
  },
  {
    "id": "doc-lm-safety-data-sheet-p3",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 3,
    "text": "Page 3 / 6\nSEMCO Liquid Membrane ™ Revision Date 18 - Sept - 2017\nMethods for cleaning up Pick up and transfer to properly labeled containers.\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well - ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines This product, as supplied, does not contain any hazardous materials with occupational\nexposure limits established by the region specific regulatory bodies.\nAppropriate engineering cont rols\nEngineering Controls Showers\nEyewash stations\nVentilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection No special technical protective measures are necessary.\nSkin and body protection No special technical protective measures are necessary.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive - pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Considerations Handle in accordance with good industrial hygiene and safety practice.\nInformation on basic physical and chemical properties\nPhysical state\nAppearance\nOdor threshold\nProperty\nLiquid\nOrange\nNo information available\nValues\nOdor Slight\nRemarks • Method\npH\nMelting point/freezing point\nBoiling point / boiling range\nFlash point\nEvaporation rate\nFlammability (solid, gas)\n8 - 9\n32°F\n>200°F\n>200°F\nNo information available\nNo information available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nVapor density\nRelative density\nWater solubility\nNo information available\nNo information available\nNo information available\nNo information available\nNo information available\nDispersible\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 294
  },
  {
    "id": "doc-lm-safety-data-sheet-p4",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 4,
    "text": "Page 4 / 6\nSEMCO Liquid Membrane ™ Revision Date 18 - Sept - 2017\nSolubility in other solvents No information available\nPartition coefficient No information available\nAutoignition temperature No information available\nDecomposition temperature No information available\nDynamic viscosity 510 Centipoise\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nProtect from freezing - product stability may be affected.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProduct I nformation No data available\nInhalation No data available.\nEye contact No data available.\nSkin Contact No data available.\nIngestion No data available.\nComponent Information\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\nAmmonium hydroxide\n1336 - 21 - 6\n= 12 0 mg/kg ( Rat ) - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long - term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 221
  },
  {
    "id": "doc-lm-safety-data-sheet-p5",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 5,
    "text": "Page 5 / 6\nSEMCO Liquid Membrane ™ Revision Date 18 - Sept - 2017\nUnknown Acute Toxicity 2 2.71787 % of the mixture consists of ingredient(s) of unknown toxicity\nEcotoxicity\nToxic to aquatic life with long lasting effects\n22 .8668762 % of the mixture consists of component(s) of unknown hazards to the aquatic environment\nPersistence and degradabilit y\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\nChemical Name California Hazardous Waste Status\nAmmonium\nhydroxide 1336 - 21 - 6\nToxic\nCorrosive\nDOT Not regulated\nInternational Inventories\nTSCA On the inventory, or in compliance with the inventory.\nDSL/NDSL All components of this product are on the DSL.\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non - Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains a chemical\nor chemical s which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 372\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS\n14. TRANSPORT INFORMATION\n15. REGULATORY INFORMATION",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 221
  },
  {
    "id": "doc-lm-safety-data-sheet-p6",
    "docId": "doc-lm-safety-data-sheet",
    "pageNumber": 6,
    "text": "Page 6 / 6\nSEMCO Liquid Membrane ™ Revision Date 18 - Sept - 2017\nChemical Name SARA 313 - Threshold Values %\nAmmonium hydroxide - 1336 - 21 - 6 1.0\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\nAmmonium hydroxide\n1336 - 21 - 6\n1000 lb - - X\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances RQs CERCLA/SARA RQ Reportable Quantity (RQ)\nAmmonium hydroxide\n1336 - 21 - 6\n1000 lb - RQ 1000 lb final RQ\nRQ 454 kg final RQ\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\nreproductive harm.\nU.S. State Right - to - Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nAmmonium hydroxide\n1336 - 21 - 6\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\nNFPA Health hazards 1 Flammability 0 Instability 0 Physical and Chemical\nProperties -\nHMIS Health hazards 1 Flammability 0 Physical hazards 0 Personal protection X\nPrepared By SAR\nIssue Date 18 - Sept - 2017\nRevision Date 18 - Sept - 2017\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Safety Data Sheet is correct to the best of our knowledge, information and belief at the\ndate of its publi cation. The information given is designed only as a guidance for safe handling, use, processing, storage,\ntransportation, disposal and release and is not to be considered a warranty or quality specification. The information\nrelates only to the specific mat erial designated and may not be valid for such material used in combination with any other\nmaterials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION",
    "sourceDocument": "LM-Safety-Data-Sheet.pdf",
    "title": "LM Safety Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 378
  },
  {
    "id": "doc-lm-tech-sheet-p1",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 1,
    "text": "Product Data SEMCO LIQUID MEMBRANE\nThe SEMCO Liquid Membrane is a single component waterproofing and anti fracture membrane.\nThe SEMCO Liquid Membrane is a self-contained elastomeric fluid suspended in a copolymer\nadhesive, this revolutionary blend enables easy application while providing excellent bridging, and\nwaterproofing. When combined with SEMCO’s X-Bond Seamless Stone, two-stage waterproofing is\nachieved, enabling single source protection.\nPRODUCT\nUSES\nCOVERAGE\nOpen pore substrates 100 - 200\nClosed pore substrates 140 - 250\nX-Bond Scratch Coat 200 - 300\nCOVERAGE sq ft. / gallon @2 coats\nSUBSTRATES\n• Concrete\n• Plywood\n• Stone\n• Exterior/Interior Cladding\n• Residential, Industrial and\nCommercial\nWater-\nproofing\nCrack\nBridging\nAdhesion\n\n\n\nOdorless/Low VOC\nwaterproofing that allows you to pro-\nceed with your finish within 2 hours\nof application enabling a speedier\nproject completion.\nRepair existing surface cracks and\nimperfections to ensure clean and\nsmooth finish\napplication.\nIntegrated chemical adhesion\nenables mechanical cross-linking to\napplied surfaces, creating a perfect\nbond for long lasting\nprotection\nAnti-\nfracture\n\nUp to 400% stretch and\nelongation providing future crack\nsuppression for years to come.\nScan to watch application",
    "sourceDocument": "LM-Tech-Sheet.pdf",
    "title": "LM Tech Sheet",
    "category": "Liquid Membrane",
    "wordCount": 183
  },
  {
    "id": "doc-lm-tech-sheet-p2",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 2,
    "text": "TECHNICAL DATA\nApplication 1/2 “ nap roller ; Airless sprayer with tip size 21 at 2,500 PSI (minimum 2 coats\nApplication environment Apply at temperatures from 50°F to 90°F\nColor Orange ( other colors available on request)\nChemical type Latex - crosslink hybrid\nClean up SEMCO Stone Soap with water\nShelf life 2 year in controlled environment (ambient temperature of 60F - 72F)\nPackaging 1 gal. | 5 gal. | 55gal.\nVOC Content 14 g/L or 0.20%\nDRYING / RECOAT TIME\nTemperature in F\nTime\n72 F\n25 to 30\nminutes\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated individ -\nually.\nThe chart represents the time needed in be -\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n10 days 3 days\n50%\n12 hrs\nTime\n50 F 72 F 90 F\n5 days 7 days\n90 F 77 F 67 F\n1 h\n45 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.\nASTM TEST RESULTS\nANSI 118.10 - Breaking Strength ( ASTM D751, Procedure B ) Pass\nANSI 118.10 - Dimensional Stability ( ASTM D1204 ) Pass\nANSI 118.10 - 7-Day Shear Strength ( ASTM C482-9.8) 173 PSI / Shear\nANSI 118.10 - 7-Day Water Immerseion Shear Strength 132 PSI\nANSI 118.10 - 4-Week Shear Strength 234 PSI\nASTM E96 - Water Vapor Transmission 1.52 (g/hr-m2)\nASTM E96 -Water Vapor Transmission : Permeability 0.135 (perm-in)\nISO 37 - Tensile Strength ( ASTM D412 ) : Maximum Stress 390 PSI\nISO 37 - Tensile Strength ( ASTM D412 ) : Ultimate Elongation 400 %",
    "sourceDocument": "LM-Tech-Sheet.pdf",
    "title": "LM Tech Sheet",
    "category": "Liquid Membrane",
    "wordCount": 301
  },
  {
    "id": "doc-lm-tech-sheet-p3",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 3,
    "text": "PROCEDURE\n• Apply minium 2 coats of X-Bond Membrane with a 3/8” roller to achieve a thickness of at least 3 mil to retard future reoccur-\nrence of crack. Wait 30 minutes at 70F before applying next coat.\n• Apply X-Bond Liquid with brush as a primer coat into the crack. Do not allow to dry. Apply mixture of X-Bond 1 part X-Bond\nLiquid to 2 1/2 parts of X-Bond Stone to fill up the crack. Allow mixture to dry, ONCE DRY roll 2 coats of X-Bond Membrane to\nachieve a thickness of at least 3 mil to retard future reoccurrence of crack. 30 min at 70 F between coats.\nCRACKS BETWEEN 1/16 - 1/4 INCH\nFRACTURES UP TO 1/16 INCH CRACKS\nCRACKS OR OPENINGS EXCEEDING 1/4 INCH\n• Roll X-Bond Liquid as a primer coat. Do not Allow to dry. Apply mixture of X-Bond 1 part X-Bond Liquid to 2 1/2 parts of X-Bond\nStone into the crack. Allow mixture to dry, ONCE DRY roll 1 coat of SEMCO Liquid Membrane, while still wet embed Fabric\nMembrane 6” to surface, and immediately roll an additional 2 coats of SEMCO Liquid Membrane to fully encapsulate the Fabric\nMembrane\n• When applying the next line of Fabric Membrane overlap the new sheet over the existing sheet a minimum of 2”\n• Allow surface to dry and proceed to X-Bond Brown Coat in the SEMCO SIP Manual\nSEMCO LIQUID MEMBRANE PROCEDURE\n• Sweep debris off of surface\n• Use a 1/2 ” roller. Allow any pre-treated areas to dry to the touch. Apply a generous coat of SEMCO Liquid Membrane with\nbrush or roller over substrate including pre-treated areas. Apply another generous coat of SEMCO Liquid Membrane over\nthe first coat of SEMCO Liquid Membrane. Let topcoat dry to the touch, approximately 1–2 hours at 70°F (21°C) and 50% RH.\nWhen last coat has dried to the touch, inspect final surface for pinholes, voids, thin spots or other defects. SEMCO Liquid\nMembrane will dry to bright orange color when it’s dry to touch. Use additional X-Bond Membrane to seal the defects.\nRequired thickness is 3 mil\nSEMCO LIQUID MEMBRANE SPRAY APPLICATION\n• Sweep debris off of surface\n• The sprayer being used for the application of SEMCO Liquid Membrane should be capable of producing a minimum of 2,500\npsi (17.2), maximum of 3,300 psi (22.8 MPa) with a flow rate of 0.95 to 1.6 GPM (3.6 to 6.0 LPM) using a 0.521 or a 0.631 reversible\ntip. Keep the unit filled with SEMCO Liquid Membrane to ensure continuous application of liquid. The hose length should\nnot exceed 100’ (30 m) in length and 3/8” (9 mm) in diameter. Required thickness is 3 mil\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO Liquid Membrane are available upon request.\nSURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nProudly made in USA",
    "sourceDocument": "LM-Tech-Sheet.pdf",
    "title": "LM Tech Sheet",
    "category": "Liquid Membrane",
    "wordCount": 727
  },
  {
    "id": "doc-modern-brochure-p1",
    "docId": "doc-modern-brochure",
    "pageNumber": 1,
    "text": "Living Modern",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 2
  },
  {
    "id": "doc-modern-brochure-p2",
    "docId": "doc-modern-brochure",
    "pageNumber": 2,
    "text": "Page 2\nSEMCO SEAMLESS SURFACES – IT WORKS!\nINNOVATION-DRIVEN SURFACE SOLUTIONS SINCE 1991",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 13
  },
  {
    "id": "doc-modern-brochure-p3",
    "docId": "doc-modern-brochure",
    "pageNumber": 3,
    "text": "Page 3\nSEMCO Modern Seamless Surface is an innovation-driven surface engineering company.\nWe specialize in the creation of surfacing products for floors, walls, decks and waterproofing.\nSEMCO is known for its ability to design, create, and deliver customized surface solutions for\nclients and projects of all sizes, worldwide. Each of our custom projects ensures lasting\ndurability, waterproofing, and proper ADA safety compliance.\nMore detail, please visit our website : www.semcosurfaces.com",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 70
  },
  {
    "id": "doc-modern-brochure-p4",
    "docId": "doc-modern-brochure",
    "pageNumber": 4,
    "text": "Page 4\nRemodel Without Removal ™",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 6
  },
  {
    "id": "doc-modern-brochure-p5",
    "docId": "doc-modern-brochure",
    "pageNumber": 5,
    "text": "Page 5\nInvented by Samel Sem in 1991 the “Pure X-Link” chemical technology is the core\nelement of all SEMCO surfacing, coloring and protective coatings.\nThe Pure X-Link is a core bond with universal chemical compatibility; enabling\nintegration, a extra-ordinary function, in nearly every facet of mechanical and chemical\nsurface bonding.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 51
  },
  {
    "id": "doc-modern-brochure-p6",
    "docId": "doc-modern-brochure",
    "pageNumber": 6,
    "text": "Page 6\nMECHANICALLY INTERLOCKING MOLECULES\nThe key to the success of any surface is the method in which it connects with a subsurface. SEMCO’s X-Bond Seamless Stone forms a mechanically bond,\nwhile interlocking its own molecules to the surface it is applied creating a “Perfect Bond”.\nSURFACE STRENGTH\nSurface strength is relative based on need. X-Bond Seamless Stone principle strength is 27 MPa (4,000 PSI) while still retaining flexibility. However to\nmeet all conditions; X-Bond Seamless Stone can be enhanced to meet or exceed 70 MPa (10,000 PSI).\nFLEXIBLE WATERPROOF MEMBRANE\nExceptional pliable strength/ modulus of rupture coupled with SEMCO’s specially formulated stone system creates a surface that can withstand the\nrigors of moving substrates while still being 100% waterproof.\nBREATHABLE AND CHEMICAL RESISTANT\nChanges in the environment affect all surfaces, the need for a surface to allow vapor transmission is crucial for ongoing adhesion and performance.\nWhile vapor transmission protects the unseen surface, the visual surface of the X-Bond Seamless Stone reinforces its\nquality by being resistant to the caustic strain of acids, to the penetrating qualities of low viscosity liquids.\nOne System,\nApplied Anywhere\nX-Bond Seamless Stone is a zero VOC hybrid of natural stone and advanced cross-linking technology. It mechanically interlocks molecules of the X-Bond Stone\nto any solid surface enabling Remodel without Removal™.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 217
  },
  {
    "id": "doc-modern-brochure-p7",
    "docId": "doc-modern-brochure",
    "pageNumber": 7,
    "text": "Page 7",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 2
  },
  {
    "id": "doc-modern-brochure-p8",
    "docId": "doc-modern-brochure",
    "pageNumber": 8,
    "text": "1\nPage 8\nStriking and expressive, SEMCO living spaces unite modern\nand spacious design elements through a seamless and\nstunning coalescence of features. Creating an airy\nenvironment that permits absolute freedom of movement\ncompelled by a minimalistic lifestyle, SEMCO transforms any\nliving space into your private sanctuary where beauty,\naccessibility, and pristine comfort await.\nForgoing traditional building materials such as tiles and wood,\nthe secret behind SEMCO’s persistent and polished\nenvironments is a perfected synthesis of natural materials\ncalled the X-Bond Seamless Stone, which can be applied\nvirtually anywhere to form smooth, durable, and flawless\nsurfaces. With unmatched freedom in design choices,\nstructural patterns, shades and colors, homeowners can\nexperience a newfound ability to transform their personal\nspaces to breathtaking effect.\nIdeal for living areas, kitchens, bathrooms, and outdoor areas,\nSEMCO allows you to ‘model’ any area of your home without\nhaving to remove and remodel existing substrate or renovate\nwith traditional materials. Our process has been perfected to\ncreate an unyielding bond between the material and its\nsubstrate, which will never need treatment and have a\npermanent bond that requires 800 psi to separate. Whether\nyou wish to transform an old space into a new one or simply\nadd a modern touch of elegance to your home, SEMCO is\na designer experience complete with unique textures, color\nschemes, styles, and even temperatures that soothe the sens -\nes and reveal a fresh, inviting atmosphere with every step –\nwelcome to Remodel with Removal™ .\nSEMCO\nLiving Spaces",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 248
  },
  {
    "id": "doc-modern-brochure-p9",
    "docId": "doc-modern-brochure",
    "pageNumber": 9,
    "text": "2 3\n4 5\nPage 9",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 6
  },
  {
    "id": "doc-modern-brochure-p10",
    "docId": "doc-modern-brochure",
    "pageNumber": 10,
    "text": "6\nPage 10",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 3
  },
  {
    "id": "doc-modern-brochure-p11",
    "docId": "doc-modern-brochure",
    "pageNumber": 11,
    "text": "7\n8\nPage 11\nAn Immaculate\nKitchen Experience\nThe kitchen is a cornerstone of every home interior, where functionality\nmeets aesthetic desires across a diverse range of fixtures, appliances,\nand materials — each with their own distinct profiles, colors, and\nexpressions. This unique part of your home requires an equal measure\nof accessibility and visual balance, where compactness and sweeping\ndimensions share the same space and grant authority over every move\nand need.\nSEMCO gives your kitchen a bold and spacious aesthetic through\nmatching and contrasting shades and surfaces, offering creative\nflexibility that leaves very little to be desired in the way of style and\ndesign. Our masterful technique gives permissive sway to kitchen featu\nres, where color palettes and materials take on a seamless and\nsophisticated form between cabinets, countertops, appliances, and\nfixtures.\nWhether you seek to create a warm or cool tone, add a finished and\nminimalistic touch, or bring a visionary design to life, SEMCO gives your\nkitchen a natural quality that blends its details together with seamless\nelegance, where open spaces will feel bigger, and its features closer to\nyour reach. Delivering superior performance and ease-of-care,\nour product maintains its beauty and eliminates the need to look\nafter every surface for a spotless polish. The SEMCO kitchen experience\noffers countless designs and structures to choose from with over 1000\ncolor shades that showcase a comfortable at-home lifestyle.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 231
  },
  {
    "id": "doc-modern-brochure-p12",
    "docId": "doc-modern-brochure",
    "pageNumber": 12,
    "text": "9\n10\nPage 12\nMinimalist Bathroom\nThere’s no limit to what you can achieve with SEMCO’s minimalist bath -\nroom designs, where the elements are reduced to their basics — but the\nluxury is anything but. Semco is the perfect accent for built-in\nbathroom features, fixtures, and cabinetry, creating a simple\nenvironment furnished by pristine and durable surfaces that emphasize\ncolors, textures, and tones for a strikingly-modern aesthetic.\nExperience private luxury highlighted by natural and ambient lighting,\nwhere the workmanship of every detail is brought out by the time of day\nor an angled reflection. Create a functional area built for relaxation in\nthe comforts of your own personal space - with X-Bond Seamless Stone\nfloors and walls, create a sleek and refined atmosphere perfect for the\nbeginning and end of your day.\nOur distinctive surfaces pave the way for uncluttered and stylish\ndesigns, leaving your bathroom feeling roomy and inviting with\neffortless efficiency as a permanent feature of your decor. Unlimited\ngeometric customizations and seamless blending from one furnishing\nto the next allow you to add a creative touch to any rustic, modern, or\nartistic theme with handcrafted precision and imaginative freedom of\nstructures. From the floors to the walls and ceiling, bathrooms outfitted\nwith Semco materials create a tidy presentation of warm, cool, or vivid\ncolor tones that harmonize with fixtures, cabinetry, and lighting while\ngiving you the comfort of durability and undemanding ease of care even\nwith extensive use.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 242
  },
  {
    "id": "doc-modern-brochure-p13",
    "docId": "doc-modern-brochure",
    "pageNumber": 13,
    "text": "11\nPage 13",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 3
  },
  {
    "id": "doc-modern-brochure-p14",
    "docId": "doc-modern-brochure",
    "pageNumber": 14,
    "text": "12\nPage 14",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 3
  },
  {
    "id": "doc-modern-brochure-p15",
    "docId": "doc-modern-brochure",
    "pageNumber": 15,
    "text": "13\n14 15 16\nPage 15",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 6
  },
  {
    "id": "doc-modern-brochure-p16",
    "docId": "doc-modern-brochure",
    "pageNumber": 16,
    "text": "17\nPage 16\nElegant Exterior\nLiving Spaces\nWith high-quality surface coatings from SEMCO,\nenvisioning exterior designs that blend vision with reality\nis as exciting as it sounds. Our architectural craftsmanship\nand finesse mingles indoor and outdoor settings through\na seamless fusion of colors, textures, and styles that let you\ndecide where the home ends and the exterior begins.\nSEMCO transforms your exterior environment into a\nhigh-value space where features blend and contrast to\ncaptivating effect, and every material, element, and hue has\nits essential place in the overall ambience and\naesthetic whether under the canopy or sun, at day or night.\nFrom refining cosy interior enclaves that extends outdoors\nto harmonizing open exterior spaces with modern interiors,\nSEMCO’s ability to optimize your existing architecture and\nhelp you create entirely original concepts results in\nsensational residential luxury.\nOur high-performance surface coating materials reveal an\neven greater level of beauty and durability outdoors, where\ntime and the elements are challenged to affect their pristine\nappearance in any climate and weather. Browse our\neclectic selection of elegant color palettes or allow us to\npersonalise your design and help you match existing\nfeatures, furniture, decor, and structures using templates\nand themes from our vast experience of exterior living spac -\nes. Partnering with SEMCO is a unique opportunity to in -\ncrease the value of your home and furnish it with premier\nmaterials that modernize its spaces and give it a luxurious\ntouch accentuated by elegant and minimalistic designs.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 245
  },
  {
    "id": "doc-modern-brochure-p17",
    "docId": "doc-modern-brochure",
    "pageNumber": 17,
    "text": "18\n19 20\nPage 17",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 5
  },
  {
    "id": "doc-modern-brochure-p18",
    "docId": "doc-modern-brochure",
    "pageNumber": 18,
    "text": "21 22\nPage 18",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 4
  },
  {
    "id": "doc-modern-brochure-p19",
    "docId": "doc-modern-brochure",
    "pageNumber": 19,
    "text": "23\n24\n25\nPage 19",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 5
  },
  {
    "id": "doc-modern-brochure-p20",
    "docId": "doc-modern-brochure",
    "pageNumber": 20,
    "text": "For more available colors, visit our website www.semcosurfaces.com\nPage 20\nOur Finishes\nWe offer our X-Bond Seamless Stone in four signature finishes and a wide range of colors.\nPOLISHED BOND\nNATURAL GRAIN\nCOLOR BOND\nGrey Marble Dried Herb Espresso Bean Montego Stone Modern Grey Rawhide\nGrey Marble Dried Herb Espresso Bean Montego Stone Phantom Rawhide\nBlack Pearl Blanco Brown Slate Copper Slate Sandy Beach Silver Stone",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 66
  },
  {
    "id": "doc-modern-brochure-p21",
    "docId": "doc-modern-brochure",
    "pageNumber": 21,
    "text": "Page 21\nBuilding GREEN Projects since 1991\nSEMCO’s Modern Seamless Surface products allow you to create a vibrant, natural-looking aesthetic without harming\nthe earth. Our commitment to the environment applies to both our use of natural products, and our earth-friendly\ninstallment procedures.\nEarth-friendly installations are low in VOC* emissions, complying with requirements for indoor air quality. Our\nX-BOND Seamless Stone has been additionally tested according to the European Standard for indoor air quality,\nmeeting the strictest standards and emissions standards which are recognized internationally.\n• Environmentally-responsible, water-based pigments create vibrant and limitless color possibilities\n• Systems can be safely applied in confined areas over existing surfaces, minimizing waste disposal",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 109
  },
  {
    "id": "doc-modern-brochure-p22",
    "docId": "doc-modern-brochure",
    "pageNumber": 22,
    "text": "Page 22\nA Case Study\nSUMMARY\nWhen internationally famous New York fashion designer purchased a new home off Sunset\nBoulevard, high in the fashionable Hollywood Hills, some aspects of the home didn’t meet his\nhigh standards: namely, its stone floors and exterior walls. Seeking a more modern look for his\ncontemporary residence, the\nrenowned designer turned to SEMCO.\nSEMCO was the obvious choice for the project, as we’ve been providing efficient and\nsuccessful engineering and service solutions to the City for over 18 years.\nEXPLORING ALTERNATIVES\nThe home featured two expansive walls – 15×20’ and 25×30’ – made of black absolute granite\n– an expensive material – and travertine stone, neither of which met the\ndesigner’s conceptual vision. His first thought was to use ARDX gray concrete, but this option\nwas not feasible due to the product’s thickness.\nComplete demolition was another option, but a costly and time-consuming one, requiring the\nfollowing:\n• Architectural/engineering drawings for permits (estimated time 10 days).\n• Check Approval (up to 2-3 weeks).\n• Stone Removal (estimated 2 weeks).\n• Stud Replacement (estimated 3 weeks) *as needed.\n• Cement Board Installation (estimated 1 week).\n• Waterproof Membrane Installation (estimated 4 days).\n• Stone installation (estimated 2 weeks).\n• Inspections, municipal approval, HOA approval (3-5 weeks).\n• Constraints of removal of demolition debris due to location of property on narrow\nwinding mountain road.\nWith a projected demolition timeline of 12-15 weeks, this option was quickly abandoned.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 240
  },
  {
    "id": "doc-modern-brochure-p23",
    "docId": "doc-modern-brochure",
    "pageNumber": 23,
    "text": "Page 23\nSTRATEGY\nThe engineers faced three main challenges with this residential renovation:\n• Creating a consistent surface on immense, 25 foot walls.\nSolution : Using a scaffolding with three men on top, three in the middle, and\nthree on the on the bottom allowed the engineers to apply a smooth, even coat of\nX-Bond.\n• Creating a solution for the silicon-caulked wall seams.\nSolution : When the sun hit the walls, the silicone seams got warm and expanded,\ncreating a vein-like appearance. To remedy the problem, we cut out the silicone and\nfilled it with SEMCO’s X- Bond Seamless Stone.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 101
  },
  {
    "id": "doc-modern-brochure-p24",
    "docId": "doc-modern-brochure",
    "pageNumber": 24,
    "text": "Page 24\nLEVELING A SLOPED FLOOR\nSolution : To correct significant sloping in the floor surface, SEMCO’s\nX-Bond system was used to bring the floor up by four inches, while\nensuring a secure, molecular bond to the existing slab.\nSOLUTION\nA total of 12,000 square feet of SEMCO’s Seamless Stone was installed\nthroughout the designer’s home, including the exterior granite walls, the\nbathroom, bedroom, kitchen, living room, hallways, pool deck, house\nexterior, and white marble bathroom. SEMCO engineers also grinded\ndown improperly sloped roof deck drains and built them up using X-bond,\nensuring proper water flow.",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 96
  },
  {
    "id": "doc-modern-brochure-p25",
    "docId": "doc-modern-brochure",
    "pageNumber": 25,
    "text": "SUCCESS\nNot only has the fashion designer since added seamless stone to two downstairs\nbaths, a downstairs kitchen, and inside fountain, he has also inspired several\ncelebrity friends and close family members to choose SEMCO for their surface and\nremodeling projects.\nProject Information\nPreparation: SEMCO Nu-Lift Cleaner and Stone Soap\nFloors and walls: SEMCO X-Bond Seamless Stone, Polished Bond and ADA Safety\nFloor – Phantom color, sealed with Satin Stone\nProject size: 12,000 sq ft\nProject year: 2016\nPage 25",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 80
  },
  {
    "id": "doc-modern-brochure-p26",
    "docId": "doc-modern-brochure",
    "pageNumber": 26,
    "text": "Page 26\nProjects Around The World For Over 25+ Years",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 10
  },
  {
    "id": "doc-modern-brochure-p27",
    "docId": "doc-modern-brochure",
    "pageNumber": 27,
    "text": "LA Concrete Works\nX-Bond Seamless Stone\nPolished Bond\nColor : Concrete Grey\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : X-Crete 400\nLA Concrete Works\nX-Bond Seamless Stone\nPolished Bond\nColor : Concrete Grey\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : Satin Stone\nSEMCO\nX-Bond Seamless Stone\nPolished Bond\nColor : Blanco\nSealer : Satin Stone\nLA Concrete Works\nX-Bond Seamless Stone\nNatural Grain\nColor : Rockslide\nSealer : Satin Stone\nSEMCO Europe\nX-Bond Seamless Stone\nPolished Bond\nColor : Phantom\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Phantom\nSealer : X-Crete 400\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Phantom\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Modern Grey\nSealer : Satin Stone\nSBW Pools\nX-Bond Seamless Stone\nPolished Bond\nColor : Modern Grey\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : Satin Stone\nSEMCO\nX-Bond Seamless Stone\nADA Safety Floor\nColor : Blanco\nSealer : Satin Stone\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : X-Crete 500\nAlternative Surfaces\nX-Bond Seamless Stone\nPolished Bond\nColor : Grey Marble\nSealer : Satin Stone\nSEMCO\nX-Bond Seamless Stone\nColor Bond\nColor : Custom Color\nSealer : Satin Stone\nSEMCO\nX-Bond Seamless Stone\nNatural Grain\nColor : Grey Marble\nSealer : X-Tra Gloss\nSEMCO\nX-Bond Seamless Stone\nPolished Bond\nColor : Rawhide\nSealer : Satin Stone\nSBW Pools\nX-Bond Seamless Stone\nADA Safety Floor\nColor : Sandy Beach\nSealer : Satin Stone\n1 2 3 4 5\n6 7 8 9 10 11 12\n13-- 15 16 17 18 17\nSBW Pools\nX-Bond Seamless Stone\nPolished Bond\nColor : Modern Grey\nSealer : Satin Stone\n19 20 21 + 22\n23 24 25\nPage 27\nAppendix",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 352
  },
  {
    "id": "doc-modern-brochure-p28",
    "docId": "doc-modern-brochure",
    "pageNumber": 28,
    "text": "FIND MORE INSPIRATION\nwww.semcosurfaces.com\n@semcosurfaces SEMCO.Remodel.Without.Remodel SemcoSeamlessSurface",
    "sourceDocument": "Modern brochure.pdf",
    "title": "Modern brochure",
    "category": "Brochure",
    "wordCount": 7
  },
  {
    "id": "doc-natural-grain-steps-p1",
    "docId": "doc-natural-grain-steps",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n20 22 .V01\nNATURAL GRAIN\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING SUBSTRATE\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS\nFLAT\nSEMCO X-Crete 500\nSEMCO Natural Shield\nMATTE/GLOSS\nSEMCO X-Crete 400\nSEMCO Titan Shield\nHIGH GLOSS\nSEMCO Xtra Gloss\nCrystal Coat\nDEEP GLOSS\nSEMCO Xtreme Gloss\nCrystal Coat\nFINISH\nSCRATCH COAT\nSEMCO LIQUID MEMBRANE™\nwith fabric reinforcement\n+ BROWN COAT\n(OPTIONAL)\nX-BOND SEAMLESS STONE\nNATURAL GRAIN\nSATIN\nSEMCO Satin Stone\nTYPE A\nSEMCO All Purpose\nCleaner\nTYPE B\nSEMCO Commercial\nCleaner\nTYPE D\nSEMCO Mineral\nCleanser\nTYPE E\nOver Wood\nTYPE C\nSEMCO Industrial\nCleaner and Degreaser",
    "sourceDocument": "Natural-Grain-Steps.pdf",
    "title": "Natural Grain Steps",
    "category": "Technical doc",
    "wordCount": 118
  },
  {
    "id": "doc-natural-shield-data-sheet-p1",
    "docId": "doc-natural-shield-data-sheet",
    "pageNumber": 1,
    "text": "PRODUCT DESCRIPTION\nSEMCO’s Natural Shield is an exceptional waterproofing sealer that excels under the most demanding\ncircumstances. Natural Shield’s low molecular weight allows for excellent penetration. Natural Shield fills\ninto the pores of the substrate, in which chemical reaction follows, that creates a solid, but breathable\nmembrane. Natural Shield provides long lasting protection for a vast array of surfaces in which it leaves a\nnatural finish. It has durability and performance of a solvent-based system, but with the easy application\nand clean-up of water-based products. Natural Shield’s performance allows to be used in commercial\nareas to protect your surface and decrease maintenance efforts.\nUsed automobile oil Good\nTransmission fluid Good\nWater Excellent\nAlkali resistance Excellent\nHydrochloric acid (10%) Good\nPolished Concrete 150-250\nArtificial Stone 200-250\nStamped Concrete 300-350\nBelow Grade 150-200\nApplication procedure Apply wet on wet require 3 coats, do not allow each coat to dry\nDrying time 30 min at 72°F, 10 min between coats at 72°F\nCure time 4 days at 100°F, 7 days at 72°F\nColor Milky white\nChemical type Silane and Siloxane\nClean up SEMCO Stone Soap with water\nShelf life 3 years\nUseful life 3 years\nPackaging 1 Gal. pail, 5 gal. pail, 55 gal. drum\nNATURAL SHIELD\nIndustrial Flat Finish Sealer\nTechnical Product Information\nAPPLICATION AND SPECIFICATIONS\nCOVERAGE (sq. ft. per gallon, 3 coats)\nTEST RESULTS*\nFEATURES / BENEFITS\n• Excellent penetration\n• Can be applied on damp surfaces\n• Highly alkaline resistant\n• Effective against freeze-thaw damage\n• Unaffected by ultra-violet rays\n• Increases life of mortar, tiles, stucco, brick and natural stone\nAPPLICATION\nSUBSTRATES\n• Existing concrete\n• X-Bond System\n• Natural Stain\n• Stucco\n• Slump block\n• Block wall\n• Tilt-up wall\n• Porous natural stone\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2019.V01\nSURFACE ENGINEERING COMPANY\nAIRLESS SPRAYER\ntip size 15\n400 PSI\nROLLER\n3 coats minimum\nPUMP SPRAYER\n3 coats minimum",
    "sourceDocument": "Natural-Shield-Data-Sheet.pdf",
    "title": "Natural Shield Data Sheet",
    "category": "Technical doc",
    "wordCount": 319
  },
  {
    "id": "doc-natural-shield-sds-p1",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 1,
    "text": "Safety Data Sheet\nPage: 1 /9\n1. Product and company identification\n2. Hazards identification\n1.1 Identification of the substance or preparation:\nCommercial product name: NATURAL SHIELD\nUse of substance / preparation Industrial.\nModifying agent for: Building materials\n1.2 Company/undertaking identification:\nManufacturer/distributor: SEMCO Modern Seamless Surface Inc\n3620 West Reno Avenue\nLas Vegas, NV 8118\nUSA\nCustomer information: InfoLine:\nTel (702) 222 - 9495, info@semcosurfaces.com\nHours of operation:\nMonday - Friday,8 am to 5 pm (pacific standard time)\nCorporate website: www.semcosurfaces.com\nEmergency telephone no. (24h):\nTransportation emergency: (800) 424 - 9300 (CHEMTREC, USA)\n(703) 527 - 3887 (CHEMTREC, international)\nThis SDS was prepared by the Product Safety Department (RAPS) of SEMCO Modern Seamless Surface Inc.\n2.1 Classification of the substance or mixture\nClassification (GHS):\nClass Category Route of\nexposure\nHazardous to the aquatic environment acute, category 3\nSerious eye damage / eye irritation Category 2\nSkin corrosion/irritation Category 2\n2.2 Label elements\nLabelling (GHS):\nPictogram(s):\nSignal Word: Warning\nH - Code Hazard Statements\nH315+H320 Causes skin and eye irritation.\nH402 Harmful to aquatic life.\nP - Code Precautionary Statements\nP103 Read label before use.\nP273 Avoid release to the environment.\nP280 Wear protective gloves/protective clothing/eye protection/face protection.\nP303+P361+P353 IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water/shower.\nP305+P351+P338 IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to\ndo. Continue rinsing.\nP333+P313 If skin irritation or rash occurs: Get medical advice/attention.\nP403+P235 Store in a well - ventilated place. Keep cool.\nP404 Store in a closed container.\nP501 Dispose of contents/container to waste disposal.",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 267
  },
  {
    "id": "doc-natural-shield-sds-p2",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 2,
    "text": "Safety Data Sheet\nPage: 2 /9\n4. First - aid measures\n2.3 Other hazards\nNo data available.\n3.1 Chemical characterization (preparation)\n3.2 Information on ingredients:\nType CAS No. Substance Content [wt. %] Note\nLower Upper\nINHA 64 - 19 - 7 Acetic acid 0.0001 <=1.4088\nINHA 104780 - 78 - 1 Alkylalkoxy siloxane 0.3474 <=0.5198\nINHA 35435 - 21 - 3 Octyl triethoxy silane 0.9619 <=2.7226\nINHA 2867 - 47 - 2 Proprietary Monomer <=2.347\nType: HYD - by - product upon hydrolysis, INHA - ingredient, NEBE - by - product, MONO - residual monomer, VERU - impurity,\nVUL - by - product upon vulcanization. *** Note: C1 - IARC carcinogen, C2 - NTP carcinogen, C3 - OSHA carcinogen, NH - non -\nhazardous, R - repro ductive toxin.\nSubstances listed in the Subsections \"HAPS\" and \"California Proposition 65 Carcinogens / Reproductive Toxins\" that are not\nlisted in this section are only present at quantities below 0.1% for California Proposition 65 listed toxins or below 1% for non -\ncarcinogenic HAPS or they are inextricably bound in the product.\n4.1 General information:\nGet medical attention if irritation occurs or if breathing becomes difficult. Remove contaminated clothing and shoes.\n4.2 After inhalation\nIf inhaled remove to fresh air. If not breathing, give artificial respiration. If breathing is difficult give oxygen.\n4.3 Aft er contact with the skin\nFor skin contact, immediately wipe away excess material. Use a waterless hand cleaner to remove as much of the remaining\nmaterial as possible. Wash with soap and water.\n4.4 After contact with the eyes\nIf contact with eyes, immediately hold eyelids apart and flush with plenty of water for at least 15 min.\n4.5 After swallowing\nFor ingestion, if conscious, give several glasses of water but do not induce vomiting. If vomiting does occur, give additiona l fluids.\n4.6 Advice for the physician\nTreat sy mptomatically.\n5.1 Flammable properties:\nProperty:\nFlash point...............................................................:\nBoiling point / boiling range .....................................:\nLower explosion limit (LEL) .....................................:\nUpper explosion limit (UEL).....................................:\nIgnition temperature ................................................:\nNFPA Hazard Class (comb./flam.liquid) .............. ....:\n5.2 Fire and explosion hazards:\nValue:\n> 93 °C (> 199 °F)\nnot determined\nnot determined\nnot determined\nnot determined\nIIIB\nMethod:\n(ASTM D3278, DIN\n55680, ISO 3679)\nThis material does not present any unusual fire or explosion hazards.",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 381
  },
  {
    "id": "doc-natural-shield-sds-p3",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 3,
    "text": "Safety Data Sheet\nPage: 3 /9\n6. Accidental release measures\n5.3 Recommended extinguishing media:\ncarbon dioxide, dry sand, dry chemical or foam - type extinguishing media Water may be used to cool tanks and structures\nadjacent to the fire.\n5.4 Unsuitable extinguishing media:\nNone.\n5.5 Special exposure hazards arising from the substance or preparation itself, co mbustion products, resulting gases\nHazardous decomposition products: carbon monoxide , carbon dioxide , silicon dioxide , formaldehyde , Various hydrocarbon\nfragments .\n5.6 Fire fighting procedures:\nFull turn - out gear and Self Contained Breathing Apparatus (SCBA) should be worn when fighting large fires.\n6.1 Precautions:\nWear personal protection equipment (see section 8). Avoid contact with eyes and skin. Avoid inhaling mists and vapours. If\nmaterial is released indicate risk of slipping.\nHAZWOPER PPE Level: C\n6.2 Containment:\nPrevent material from entering sewers or surface waters. Contain any fluid that runs out using suitable material (e.g. earth) .\nRetain contaminated water/extinguishing water. Dispose of in prescribed marked containers.\nSpills of material which could reach s urface waters must be reported to the United States Coast Guard National Response\nCenter's toll free phone number (800) 424 - 8802.\n6.3 Methods for cleaning up\nTake up mechanically and dispose of according to local/state/federal regulations. For small amounts: Absorb with a liquid bin ding\nmaterial such as diatomaceous earth and dispose of according to local/state/federal regulations. Contain larger amounts and\npu mp up into suitable containers. Clean any slippery coating that remains using a detergent / soap solution or another\nbiodegradable cleaner.\n6.4 Further information:\nEliminate all sources of ignition.\n7.1 General information:\nAvoid expos ure by technical measures or personal protective equipment. Always stir well before use.\n7.2 Handling\nPrecautions for safe handling:\nKeep away from heat, sparks and flame. Avoid contact with eyes, skin and clothing. Ensure adequate ventilation. Avoid breathi ng\ndust/vapor/mist/gas/aerosol. Keep container closed when not in use. When transferring flammable liquids between metal\ncontainers, ground and bond the containers to drain off and equalize their static electric charges and reduce the potential f or static\nsp arks to occur.\nPrecautions against fire and explosion:\nDo not weld, cut, or grind on empty containers. Where feasible maintain the temperature of flammable or combustible liquids a t\nleast 30° F below their flash point. Flammable, combustible or explosive a ir - vapor mixtures may be present in partial or uncleaned\nempty containers.\n7.3 Storage\nConditions for storage rooms and vessels:\nDo not store flammable liquids in plastic IBCs (i.e. Intermediate Bulk Containers or plastic tote tanks). Protect against fro st.\nAdvice for storage of incompatible materials:\nnone known .\n7. Handling and storage",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 439
  },
  {
    "id": "doc-natural-shield-sds-p4",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 4,
    "text": "Safety Data Sheet\nPage: 4 /9\nFurther information for storage:\nProtect against sun. Keep container tightly closed and store in a cool, well ventilated place. Protect against frost.\nMinimum temperature allowed during storage and transportation: 0 °C (32 °F)\nDo not allow this material to freeze.\nMaximum temperature allowed during storage and transportation: 50 °C (122 °F)\n8.1 Engineering controls\nVentilation:\nUse with adequate ventilation.\nLocal exhaust:\nIf spraying or other aerosol generating operations are performed, local exhaust ventilation designed to capture mists and spr ays,\nsuch as a paint spray booth, is recommended.\n8.2 Associate substances with specific control parameters such as limit values\nMaximum airborne concentrations at the workplace:\nRe Ethanol (CAS no. 64 - 17 - 5): STEL is 1000 ppm; carcinogenicity: A3 (ACGIH).\nRe Acetic acid (CAS - no. 64 - 19 - 7): STEL is 15 ppm ( ACGIH).\nnone known\n8.3 Personal protection equipment (PPE)\nRespiratory protection:\nIf spraying or other operations which generate an aerosol mist are conducted, respiratory protection for exposed personnel is\nrecommended. A NIOSH approved air purifying respira tor equipped with universal multi - contaminant, multi - gas/vapor cartridges\nand at least P - 99 solid/aerosol particulate filters is recommended if overexposure to dusts, mists, or vapors could occur.\nHand protection:\nAny liquid - tight rubber or vinyl gloves.\nEye protection:\nSafety glasses with side shields or chemical safety goggles.\nOther protective clothing or equipment:\nAdditional skin protection, such as SARANEX coated Tyvek apron, over - sleeves, lab coat, coveralls, or protective suit should be\nworn if spl ashing could occur. Provide eye bath and safety shower.\n8.4 General hygiene and protection measures:\nFollow standard industrial hygiene practices when using this material. When handling do not eat, drink, smoke or apply cosmet ics.\nWash thoroughly after handlin g.\n9.1 Appearance\nPhysical state / form ................................................: liquid (23 °C (73 °F))\nColour .....................................................................: milky white\nOdour ........... ...........................................................: aromatic\n9.2 Safety parameters\nProperty: Value: Method:\nMelting point / melting range ...................................: not determined\nBoiling point / boiling range .....................................: not determined\nFlash point...............................................................: > 93 °C (> 199 °F) (ASTM D3278, DIN\n55680, ISO 3679)\nIgnition temperature ................................................: not determined\n9. Physical and chemical properties\nCAS No. Material Type mg/m 3 ppm Dust fract.\n64 - 17 - 5 Ethanol OSHA PEL 1,900.0 1,000.0\n64 - 19 - 7 Acetic acid OSHA PEL 25.0 10.0\n64 - 19 - 7 Acetic acid ACGIH TWA 10.0",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 404
  },
  {
    "id": "doc-natural-shield-sds-p5",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 5,
    "text": "Safety Data Sheet\nPage: 5 /9\nLower explosion limit (LEL) .....................................: not determined\nUpper explosion limit (UEL).....................................: not determined\nVapour pressure......................................................: not determined\nDensity ....................................................................: 1.05 g/cm³ at 23 °C (73 °F), at 1015 hPa\nWater solubility / miscibility.................. ....................: completely miscible\npH - Value .................................................................: 4.5 at 23 °C (73 °F) (1000 g/l H 2 O)\nViscosity (dynamic) .................................................: 55 mPa.s at 23 °C (73 °F)\n9.3 Furth er information\nCorrosive to Steel or Aluminum...............................: Not corrosive to steel or aluminum.\n10.1 General information:\nStable under normal conditions of use.\nIf stored and handled in accordance with standard industrial practices no hazardous reactions are known.\n10.2 Conditions to avoid\nAlthough this product is not expected to react with commonly used materials of construction and process equipment, it is advi sed\nth at any rubber or plastic items such as hoses and gaskets be tested prior to large scale processing to ensure there is no\ndegradation of performance or durability. Heat, open flames, and other sources of ignition. Protect against frost.\n10.3 Materials to avoid\nR eacts with: acids and alkalis . Reaction causes the formation of: ethanol , methanol .\n10.4 Hazardous decomposition products\nBy hydrolysis: ethanol , methanol . Measurements have shown the formation of small amounts of formaldehyde at temperatures\nabove about 1 50 °C (302 °F) through oxidation.\n10.5 Further information:\nHazardous polymerization cannot occur.\n11.1 Information on toxicological effects\n11.1.1 General information\nData derived for the product as a whole are of higher priority than data for single ingredients.\n11.1.2 Acute toxicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product. No data on acute inhalation toxicity is avai lable f or\nthis product. In case of aerosol formation: Avoid inhalative exposure!\nAcute toxicity estimate (ATE):\nATE mix (oral): > 2000 mg/kg\n11.1.3 Skin corrosion/irritation\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.4 Serious eye damage / eye irritation\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.5 Respiratory or skin sensitization\nAssessment :\nFor this endpoint no toxicological test data is available for the whole product.\n10. Stability and reactivity\n11. Toxicological information",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 367
  },
  {
    "id": "doc-natural-shield-sds-p6",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 6,
    "text": "Page: 6 /9\nSafety Data Sheet\nMaterial: 20071922 NATURAL SH IE LD\nVersion: 2.5 (US) Date of print: 02 / 20 /201 7 Date of last alteration: 04/11/2016\nData related to ingredients:\n5 - Chloro - 2 - methyl - 4 - isothiazoline - 3 - on and 2 - methyl - 4 - isothiazoline - 3 - on (mixture in a ratio of 3:1):\nBased on the proven low sen sitization induction threshold in human, mixtures containing ≥15 ppm are classified as skin\nsensitizing in Europe.\n11.1.6 Germ cell mutagenicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.7 Carcinogenicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.8 Reproductive toxicity\nAssessment:\nFor this endpoint no toxicolog ical test data is available for the whole product.\n11.1.9 Specific target organ toxicity (single exposure)\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.10 Specific target organ toxicity (repeated exposure)\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.11 Aspiration hazard\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.12 Further toxicological information\nNo component of this product p resent at levels greater than or equal to 0.1% is identified as a known or anticipated carcinogen by\nNTP. No component of this product present at levels greater than or equal to 0.1% is identified as probable, possible or conf irmed\nhuman carcinogen by IARC . No component of this product present at levels greater than or equal to 0.1% is identified as a\ncarcinogen or potential carcinogen by OSHA.\nData related to ingredients:\nProduct of hydrolysis (Methanol):\nMethanol (CAS 67 - 56 - 1) is readily and rapidly absor bed at all exposure routes and is toxic by all routes. Methanol may cause\nirritation of the mucosa, as well as nausea, vomiting, headaches, vertigo and visual disorders, including blindness (irrevers ible\ndamage to the optic nerve), acidosis, spasms, narcos is and coma. There may be a delay in the onset of these effects after\nexposure.\n12.1 Toxicity\nAssessment:\nFor the product as a whole, no test data is available.\n12.2 Persistence and degradability\nAssessment:\nFor the product as a whole, no test data is available.\nData related to ingredients:\n12. Ecological information",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 391
  },
  {
    "id": "doc-natural-shield-sds-p7",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 7,
    "text": "Page: 7 /9\nSafety Data Sheet\nMaterial: 20071922 NATURAL SH IE LD\nVersion: 2.5 (US) Date of print: 02 / 20 /201 7 Date of last alteration: 04/11/2016\nProduct of hydrolysis (Methanol):\nThe product of hydrolysis (methanol) is readily biodegradable.\n12.3 Bioaccumulative potential\nAssessment:\nNo data known.\n12.4 Mobility in soil\nAssessme nt:\nNo data known.\n12.5 Other adverse effects\nnone known\n13.1 Product disposal\nRecommendation:\nDispose of according to regulations by incineration in a special waste incinerator. Observe local/state/federal regulations.\n13.2 Packaging disposal\nRecommendation:\nCompletely discharge containers (no tear drops, no powder rest, scraped carefully). Containers may be recycled or re - used.\nObserve local/state/federal regulations. Uncleaned packaging should be treated with the same precautions as the material.\n14.1 US DOT & CANADA TDG SURFACE\nValuation ................................................: Not regulated for transport\nOther Information ...................................: Protect from freezing, when exposed to cold temperatures approaching 0 °C (32 °F) or\nbelow.\n14.2 Transport by sea IMDG - Code\nValuation ................................................: Not regulated for tran sport\n14.3 Air transport ICAO - TI/IATA - DGR\nValuation ................................................: Not regulated for transport\n15.1 U.S. Federal regulations\nTSCA inventory status and TSCA information:\nThis material or its components are listed on or are in compliance with the requirements of the TSCA Chemical Substance\nInventory. This material or its component(s) is in compliance with TSCA under a Low Volume Exemption.\nTSCA 12(b) Export Notification:\nTh is material does not contain reportable amounts of any TSCA 12(b) listed chemicals.\nCERCLA Regulated Chemicals:\nCAS No. Chemical RQ Upper limit wt. %\n64 - 19 - 7 Acetic acid 5,000 lbs <=1.4088\nSARA 302 EHS Chemicals:\nThis material does not contain any SARA extremely hazardous substances.\nSARA 311/312 Hazard Class:\nDelayed (chronic) health hazard.\nSARA 313 Chemicals:\nThis material does not contain any SARA 313 chemicals above de minimus levels.\n13. Disposal considerations\n14. Tran sport information",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 308
  },
  {
    "id": "doc-natural-shield-sds-p8",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 8,
    "text": "Page: 8 /9\nSafety Data Sheet\nMaterial: 20071922 NATURAL SH IE LD\nVersion: 2.5 (US) Date of print: 02 / 20 /201 7 Date of last alteration: 04/11/2016\nHAPS (Hazardous Air Pollutants):\nCAS No. Chemical Upper limit wt. %\n67 - 56 - 1 Methanol <=0.0005\n15.2 U.S. State regulations\nCalifornia Proposition 65 Carcinogens:\nThis material does not contain any chemicals known to the State of California to cause cancer.\nCalifornia Proposition 65 Reproductive Toxins:\n67 - 56 - 1 Methanol\nMassachusetts Substance List:\n64 - 19 - 7 Acetic acid\n2867 - 47 - 2 Proprietary Monomer\nNew Jersey Right - to - Know Hazardous Substance List:\n64 - 19 - 7 Acetic acid\n2867 - 47 - 2 Proprietary Monomer\nPennsylvania Right - to - Know Hazardous Substance List:\n64 - 19 - 7 Acetic acid\n57 - 55 - 6 Propylene glycol\n2867 - 47 - 2 Proprietary Monomer\n15.3 Canadian regulations\nThis product has been classified in accordance with the Hazard criteria of the CPR and the SDS contains all the information\nrequired by the CPR.\nWHMIS Hazard Classes:\nNone.\nDSL Status:\nThis material or one or more of its components is not listed on the Canadian Domestic Substances List.\nNon - DSL Chemicals:\nCAS No. Chemical Upper limit wt. %\nConfidential Vendor Trade Secret Polymer (Not Disclosed, Proprietary, Unknown) <= 9.388\n15.4 Details of international registration status\nRelevant information about individual substance inventories, where available, is given below.\nEuropean Economic Area (EEA)................. : REACH (Regulation (EC) No 1907/2006):\nGeneral note: the registration obligations for substances imported into the EEA or\nmanufactured within the EEA by the supplier mentioned in section 1 are fulfilled by\nthe said supplier. The registration obligations for substances imported into the EEA\nby customers or other downstream us ers must be fulfilled by the latter.\n16.1 Additional information:\nThis Safety Data Sheet (SDS) meets the requirements of the Federal OSHA Hazard Communication Standard (29 CFR\n1910.1200). This product has been classified according to the hazard criteria of the Controlled Products Regulations (CPR) an d\nthe SDS contains al l of the information required by the CPR. This information relates to the specific material designated and may\nnot be valid for such material used in combination with any other materials or in any process. Such information is to the bes t of\nour knowledge and belief accurate and reliable as of the date compiled. However, no representation, warranty or guarantee\nexpressed or implied, is made as to its accuracy, reliability or completeness. It is the user's responsibility to satisfy him self as to\nthe suitabil ity and completeness of such information for his own particular use. We do not accept liability for any loss or damage\nthat may occur from the use of this information. Nothing herein shall be construed as a recommendation for uses which infring e\nvalid pate nts or as extending a license under valid patents. This SDS provides selected regulatory information on this product,\nincluding its components. This is not intended to include all regulations. It is the responsibility of the user to know and c omply with\nal l applicable rules, regulations and laws relating to the product being used.\nVertical lines in the left - hand margin indicate changes compared with the previous version.\n16. Other information",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 551
  },
  {
    "id": "doc-natural-shield-sds-p9",
    "docId": "doc-natural-shield-sds",
    "pageNumber": 9,
    "text": "Page: 9 /9\nSafety Data Sheet\nMaterial: 20071922 NATURAL SH IE LD\nVersion: 2.5 (US) Date of print: 02 / 20 /201 7 Date of last alteration: 04/11/2016\nAll deliveries are subject to the SEMCO Health Care Policy.\n16.2 Glossary of Terms:\nACGIH - American Conference of Governmental Industrial\nHygienists\nDOT - Department of Transportation\nhPa - Hectopascals\nmPa*s - Milli Pascal - Seconds\nOSHA - Occupational Safety and Health Administration\nPEL - Permissible Exposure Limit\nppm - Parts per Million\nSARA - Superfund Amendments and Reauthorization Act\nSTEL - Short Term Exposure Limit\nTSCA - Toxic Substances Control Act\nTWA - Time Weighted Average\nWHMIS - Canadian Workplace Hazardous Materials\nIdentification System\nFlash point determination methods ................................ ........... Common name\nASTM D56 ................................ ................................ ...................... Tagliabue (Tag) closed cup\nASTM D92, DIN 51376, ISO 2592 ................................ ................. Cleveland open cup\nASTM D93, DIN 51758, ISO 2719 ................................ ................. Pensky - Martens closed cup\nASTM D3278, DIN 55680, ISO 3679 ................................ ............. Setaflash o r Rapid closed cup\nDIN 51755 ................................ ................................ ...................... Abel - Pensky closed cup\n16.3 Conversion table:\nPressure:....................: 1 hPa * 0.75 = 1 mm Hg = 1 torr; 1 bar = 1000 hPa\nViscosity: ....................: 1 mPa*s = 1 centipoise (cP)",
    "sourceDocument": "Natural-Shield-SDS.pdf",
    "title": "Natural Shield SDS",
    "category": "Technical doc",
    "wordCount": 206
  },
  {
    "id": "doc-natural-shield-tech-sheet-p1",
    "docId": "doc-natural-shield-tech-sheet",
    "pageNumber": 1,
    "text": "Product Data\nNatural Shield\nSEMCO’s natural Shield is an exceptional waterproofing sealer that excels under\nthe most demanding circumstances. Natural Shield’s low molecular weight al -\nlows for excellent penetration. Natural Shield fills into the pores of the substrate,\nin which chemical reaction follows, that creates a solid, but breathable mem -\nbrane. Natural Shield provides long lasting protection for a vast array of surfaces\nin which it leaves a natural finish.\nPRODUCT\nUSES\nCOVERAGE\nArtifical stone 200 - 250\nPolished concrete 150 - 250\nStamped Concrete 300 - 350\nCOVERAGE sq ft. / 1 gal @ 3 coats\nBENEFITS\n• Excellent penetration\n• Can be applied on damp\nsurfaces\n• Highly alkaline resistant\n• Effective against freeze-thaw\ndamage\n• Unaffected by ultra-violet rays\n• New and existing stamped\n• Increase life of mortar, tiles,\nstucco, brick and natural\nstone\nInterior\nExterior\nWetrooms\nCommercial\nIndustrial\n\n\n\n\n\nSURFACE ENGINEERING COMPANY\nGet the durability and\nperformance of a solvent-based\nsystem, but with the easy\napplication and clean-up of\nwater-based products.\nUV-resistant and can be applied\nto multiple surfaces to give\nextra protection.\nWith its low water permeability,\nNatural Shield can be used in\nshowers.\nNatural Shield’s performance\nallows to be used in commercial\nareas to protect your surface and\ndecrease maintanance efforts\nExcellent chemical resistance and\nindustrial strength finish allow\nNatural Shield to be used in an\nindustrial environment.",
    "sourceDocument": "Natural-Shield-Tech-Sheet.pdf",
    "title": "Natural Shield Tech Sheet",
    "category": "Technical doc",
    "wordCount": 231
  },
  {
    "id": "doc-natural-shield-tech-sheet-p2",
    "docId": "doc-natural-shield-tech-sheet",
    "pageNumber": 2,
    "text": "PRODUCT DATA\nApplication Apply wet on wet require 3 coats, do not allow each coat to dry\nApplication environment Apply at temperatures from 50°F to 90°F\nColor Milky white\nChemical type Silane and Siloxane\nClean up SEMCO Stone Soap with water\nShelf life 3 years (ambient temperature of 60F - 72F)\nPackaging 1 pint, 1 gallon, 5 gallons\nVOC Content 15.4 g/L\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n1 min\n45 F\nDrying times are affected by temperature\nand relative humidity. The chart represents\nguidline values but each project is to be\ntreated individually.\nThe chart represents the time needed in\nbetween coats at specified temperature.\nCure / humidity\nTime\n100%\n10 days 48 hrs\n50%\n0 hrs\nLight foot traffic\n45 F 72 F 100 F\n4 days 7 days\n100 F 80 F 60 F\n30 min\n10 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 45 F, a full cure would\ntake 10 days in comparison to at 100 F it\nwould only take 4 days to cure.",
    "sourceDocument": "Natural-Shield-Tech-Sheet.pdf",
    "title": "Natural Shield Tech Sheet",
    "category": "Technical doc",
    "wordCount": 183
  },
  {
    "id": "doc-natural-shield-tech-sheet-p3",
    "docId": "doc-natural-shield-tech-sheet",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or\nupon request\n• Safety Data Sheets for SEMCO Natural Shield are available upon request.\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP\nManual under the Surface Preparation Section.\n• Sweep debris off surface\nSTEP 1\n• Apply the sealer with a 1/4” nap roller, HVLP sprayer, pump sprayer, or airless sprayer with tip size 17. Minimum of\n3 coats are required to ensure maximum performance\n• Apply the first coat and DO NOT ALLOW THE SEALER TO DRY BEFORE APPLYING SECOND AND THIRD COATS.\nDo not allow to puddle\n• Repeat the application to a minimum of 3 coats. Additional coats may be required depending on the porosity of\nthe surface (X-Bond requires, 3 coats only, other surfaces such as concrete or block may require additional coats)\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 17 @ 400 PSI\n• 1/4” nap roller\n• OPTIONAL : fine tip pump sprayer\nScan to watch application",
    "sourceDocument": "Natural-Shield-Tech-Sheet.pdf",
    "title": "Natural Shield Tech Sheet",
    "category": "Technical doc",
    "wordCount": 427
  },
  {
    "id": "doc-nulift-datasheet-p1",
    "docId": "doc-nulift-datasheet",
    "pageNumber": 1,
    "text": "Magnesium deposit Excellent\nAlkali resistance Excellent\nRust Good\nDrying time 2 hours\nCure time 72 hours\nColor Blue\nChemical type Mineral acid\nClean up Water\nShelf life 1 year\nUseful life 3 years\nPackaging (base and color activator) 1 quart, 1 gal. pail, 5 gal. pail\nNU-LIFT CLEANER\nMineral Cleanser\nTechnical Product Information\nSPECIFICATIONS\nTEST RESULTS*\n*Tests are based on Semco Modern Seamless Surface experience unless otherwise noted.\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners.\nNot for use on humans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet\nbefore using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness\nof use. The only obligation of the seller-manufacturer shall be to replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or\nconsequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate. However, since the conditions of handling\nand use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply\nwith all applicable federal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2016.V02\nSURFACE ENGINEERING COMPANY\nPRODUCT DESCRIPTION\nNu-Lift Cleaner is a formulated with an environmentally-responsible mineral acid that is user friendly. Nu-Lift\nCleaner does exactly what its name implies: it lifts out and removes dirt, alkalinity, efflorescence, hard water\ndeposits, magnesium, and stains from surfaces like grout and natural stone without harming or discoloring.\nFEATURES / BENEFITS\n• Removes organic deposits\n• Balances low pH\n• Safely dissolves: efflorescence, magnesium,\nlime deposits, soap scum\n• 100% Biodegradable\n• Can be safely used in confined areas\nSUBSTRATES\n• Concrete surfaces\n• Masonry surfaces\n• Natural and cultured stone\n• Grout\n• Pool decks\n• Walkways\n• Driveways",
    "sourceDocument": "NuLift-Datasheet.pdf",
    "title": "NuLift Datasheet",
    "category": "Technical doc",
    "wordCount": 389
  },
  {
    "id": "doc-nulift-sds-p1",
    "docId": "doc-nulift-sds",
    "pageNumber": 1,
    "text": "Revised on 06/02/2017 Page 1 of 6\nSafety Data Sheet\n1. PRODUCT AND COMPANY IDENTIFICATION\nProduct Name: Nu Lift Cleaner\nProduct Number: NL100, NL101, NL105, NL155\nProduct Use: Industrial, Commercial, and Residential\nManufacturer: SEMCO Modern Seamless Surface Inc.\n3620 West Reno Ave.\nLas Vegas, NV 89118\nFor More Information Call: 702 - 222 - 9495 (Monday - Friday 9:00 - 4:00 PST)\nIn Case of Emergency Call: CHEMTREC - 800 - 424 - 9300 or 703 - 527 - 3887 (24 Hours/Day, 7 Days/Week)\n2. HAZARDS IDENTIFICATION\nOSHA Hazards: Corrosive\nTarget Organs: Liver, Blood, Bone marrow\nSignal Words: Danger\nPictograms:\nGHS Classification:\nCorrosive to metals Category 5\nSkin corrosion Category 4\nSerious eye damage Category 4\nAcute toxicity, Dermal Category 5\nAcute toxicity, Oral Category 4\nGHS Label Elements, including precautionary statements:\nHazard Statements:\nNu Lift Cleaner\nH290 May be corrosive to metals.\nH302 Harmful if swallowed.\nH313 May be harmful in contact with skin.\nH314 Causes severe skin burns and eye damage.",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 163
  },
  {
    "id": "doc-nulift-sds-p2",
    "docId": "doc-nulift-sds",
    "pageNumber": 2,
    "text": "Revised on 06/02/2017 Page 2 of 6\nPrecautionary Statements:\nP234 Keep only in original container.\nP260 Do not breathe dusts or mists.\nP264 Wash hands thoroughly after handling.\nP270 Do not eat, drink or smoke when using this product.\nP280 Wear protective gloves/protective clothing/eye protection/face protection.\nP301+P330+P331 IF SWALLOWED: Rinse mouth. Do not induce vomiting.\nP303+P361+P353\nIF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse\nskin with water/shower.\nP304+P340 IF INHALED: Remove person to fresh air and keep comfortable for breathing.\nP305+P351+P338\nIF IN EYES: Rinse cautiously with water for several minutes. Remove contact\nlenses, if present and easy to do. Continue rinsing.\nP310 Immediately call a POISON CENTER/doctor/physician.\nP363 Wash contaminated clothing before reuse.\nP390 Avoid spillage to prevent material damage.\nP405 Store locked up.\nP406 Store in corrosive resistant container with a resistant liner.\nP501 Dispose of contents/container in accordance with local regulations.\nPotential Health Effects\nEyes Causes eye irritation.\nInhalation May be harmful if inhaled. Causes respiratory tract irritation.\nSkin May be harmful if absorbed through skin. Causes skin irritation.\nIngestion May be harmful if swallowed.\nNFPA Ratings HMIS Ratings\n3. COMPOSITION/INFORMATION ON INGREDIENTS\nComponent Weight % CAS # EINECS# /\nELINCS# Formula Molecular\nWeight\nPhosphoric Acid 15 7664 - 38 - 2 231 - 633 - 2 H 3 PO 4 98.00 g/mol\n4. FIRST - AID MEASURES\nEyes Rinse with plenty of water for at least 15 minutes and seek medical attention immediately.\nInhalation Move casualty to fresh air and keep at rest. If breathing is difficult, give oxygen. If not\nbreathing, give artificial respiration. Get medical attention immediately.\nSkin Immediately flush with plenty of water for at least 15 minutes while removing contaminated\nclothing and wash using soap. Get medical attention immediately.\nIngestion Do Not Induce Vomiting! Never give anything by mouth to an unconscious person. If\nconscious, wash out mouth with water. Get medical attention immediately.\nHealth\nFlammability\nReactivity\nSpecific hazard N/A\nHealth\nFire\nReactivity\nPersonal",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 326
  },
  {
    "id": "doc-nulift-sds-p3",
    "docId": "doc-nulift-sds",
    "pageNumber": 3,
    "text": "Revised on 06/02/2017 Page 3 of 6\n5. FIRE - FIGHTING MEASURES\nSuitable (and unsuitable)\nextinguishing media\nProduct is not flammable. Use appropriate media for adjacent fire. Cool\ncontainers with water.\nSpecial protective equipment\nand precautions for firefighters\nWear self - contained, approved breathing apparatus and full protective\nclothing, including eye protection and boots.\nSpecific hazards arising from\nthe chemical\nEmits toxic fumes (phosphorus oxi des) under fire conditions. (See also\nStability and Reactivity section).\n6. ACCIDENTAL RELEASE MEASURES\nPersonal precautions,\nprotective equipment and\nemergency procedures\nSee section 8 for recommendations on the use of personal protective\nequipment.\nEnvironmental precautions Prevent spillage from entering drains. Any release to the environment\nmay be subject to federal/national or local reporting requirements.\nMethods and materials for\ncontainment and cleaning up\nNeutralize spill with sodium bicarbonate or lime. Absorb spill with\nnoncombustible absorbent material, then place in a suitable container for\ndisposal. Clean surfaces thoroughly with water to remove residual\ncontamination. Dispose of all waste and cleanup materials in accordance\nwith regulations.\n7. HANDLING AND STORAGE\nPrecautions for safe handling\nSee section 8 for recommendations on the use of personal protective equipment. Use with adequate\nventilation. Wash thoroughly after using. Keep container closed when not in use. Avoid formation of aerosols.\nConditions for safe storage, including any incompatibilities\nStore in cool, dry well ventilated area. Keep away from incompatible materials (see section 10 for\nincompatibilities).\n8. EXPOSURE CONTROLS / PERSONAL PROTECTION\nOccupatio nal exposure controls:\nComponent Exposure Limits Basis Entity\nPhosphoric Acid 1 mg/m 3 TLV ACGIH\n3 mg/m 3 STEL ACGIH\n1 mg/m 3 PEL OSHA\n1 mg/m 3 REL NIOSH\n3 mg/m 3 STEL NIOSH\n1000 mg/m 3 IDLH OSHA\nTWA: Time Weighted Average over 8 hours of work.\nTLV: Threshold Limit Value over 8 hours of work.\nREL: Recommended Exposure Limit\nPEL: Permissible Exposure Limit\nSTEL: Short Term Exposure Limit during x minutes.\nIDLH: Immediately Dangerous to Life or Health\nWEEL: Workplace Environmental Exposure Levels\nCEIL: Ceiling",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 326
  },
  {
    "id": "doc-nulift-sds-p4",
    "docId": "doc-nulift-sds",
    "pageNumber": 4,
    "text": "Revised on 06/02/2017 Page 4 of 6\nPersonal Protection\nEyes Wear chemical safety glasses or goggles, and face shield.\nInhalation Provide local exhaust, preferably mechanical. If exposure levels are excessive, use an\napproved respirator.\nSkin Wear nitrile or rubber gloves, and full body covering. The type of protective equipment\nmust be selected according to the concentration and amount of the dangerous substance\nat the specific workplace.\nOther Not Available\nOther Recommendations\nProvide eyewash stations, quick - drench showers and washing facilities accessible to areas of use and\nhandling.\n9. PHYSICAL AND CHEMICAL PROPERTIES\nAppearance (physical state, color, etc.) Syrupy, viscous, clear liquid.\nOdor Odorless.\nOdor threshold Not Available\npH Acidic.\nMelting point/freezing point 21°C (70°F)\nInitial boiling point and boiling range 158°C (316°F)\nFlash point Not Flammable\nEvaporation rate Not Available\nFlammability (solid, gas) Not Flammable\nUpper/lower flammability or explosive limit Not Explosive\nVapor pressure 0.3 kPa at 20°C\nVapor density 3.4 (air=1)\nDensity 1.5740\nSolubility (ies) Soluble in water.\nPartition coefficient: n - octanol/water Not Available\nAuto - ignition temperature Not Available\nDecomposition temperature Not Available\n10. STABILITY AND REACTIVITY\nChemical Stability Stable\nPossibility of Hazardous Reactions Will not occur.\nConditions to Avoid Not Available\nIncompatible Materials Strong bases, powdered metals.\nHazardous Decomposition Products Phosphorus oxides.\n11. TOXICOLOGICAL INFORMATION\nAcute Toxicity\nPhosphoric Acid\nSkin LD50 – Rabbit – 2,740 mg/kg\nEyes Not Available\nRespiratory Not Available\nIngestion LD50 – Rat – 1,530 mg/kg",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 234
  },
  {
    "id": "doc-nulift-sds-p5",
    "docId": "doc-nulift-sds",
    "pageNumber": 5,
    "text": "Revised on 06/02/2017 Page 5 of 6\nCarcinogenicity\nIARC No components of this product present at levels greater than or equal to 0.1% is identified\nas probable, possible or confirmed human carcinogen by IARC.\nACGIH No components of this product present at levels greater than or equal to 0.1% is identified\nas a carcinogen or potential carcinogen by ACGIH.\nNTP No components of this product present at levels greater than or equal to 0.1% is identified\nas a known or anticipated carcinogen by NTP.\nOSHA No components of this product present at levels greater than or equal to 0.1% is identified\nas a carcinogen or potential carcinogen by OSHA.\nSigns & Symptoms of Exposure\nSkin Burning, itching, redness, inflammation, swelling of exposed tissue.\nEyes Eye burns, watering eyes.\nRespiratory Burning, choking, coughing, wheezing, laryngitis, shortness of breath, headache or\nnausea.\nIngestion Burning, choking, nausea, vomiting, severe pain.\nChronic Toxicity Damage to organs.\nTeratogenicity Not Available\nMutagenicity Not Available\nEmbryotoxicity Not Available\nSpecific Target Organ Toxicity Blood, liver, skin, eyes, bone marrow.\nReproductive Toxicity Not Available\nRespiratory/Skin Sensitization Not Available\n12. ECOLOGICAL INFORMATION\nEcotoxicity\nPhosphoric Acid\nAquatic Vertebrate Not Available\nAquatic Invertebrate Not Available\nTerrestrial Not Available\nPersistence and Degradability Not Available\nBioaccumulative Potential Not Available\nMobility in Soil Not Available\nPBT and vPvB Assessment Not Available\nOther Adverse Effects Not Available\n13. DISPOSAL CONSIDERATIONS\nWaste Product or\nResidues\nUsers should review their operations in terms of the applicable federal/national or\nlocal regulations and consult with appropriate regulatory agencies if necessary before\ndisposing of waste product or residue.\nProduct\nContainers\nUsers should revi ew their operations in terms of the applicable federal/national or\nlocal regulations and consult with appropriate regulatory agencies if necessary\nbefore disposing of waste product container.\nThe information offered in section 13 is for the product as shi pped. Use and/or alterations to the product may\nsignificantly change the characteristics of the material and alter the waste classification and proper disposal\nmethods.",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 324
  },
  {
    "id": "doc-nulift-sds-p6",
    "docId": "doc-nulift-sds",
    "pageNumber": 6,
    "text": "Revised on 06/02/2017 Page 6 of 6\n14. TRANSPORTATION INFORMATION\nUS DOT Transportation Regulation: 49 CFR (USA): This material is not classified.\nTDG Transportation Regulation: 49 CFR (USA): This material is not classified.\nIMDG Transportation Regulation: 49 CFR (USA): This material is not classified.\nMarine Pollutant No\nIATA/ICAO Transportation Regulation: 49 CFR (USA): This material is not classified.\n15. REGULATORY INFORMATION\nTSCA Inventory Status All ingredients are listed on the TSCA inventory.\nDSCL (EEC) All ingredients are listed on the DSCL inventory.\nCalifornia Proposition 65 Not Listed\nSARA 302 Not Listed\nSARA 304 Not Listed\nSARA 311 Acute health hazard, Chronic health hazard.\nSARA 312 Acute health hazard, Chronic health hazard.\nSARA 313 Not Listed\nWHMIS Canada Class E: Corrosive liquid.\n16. OTHER INFORMATION\nRevision Date\nRevision 1 12/03/2014\nRevision 2 06/02/2017\nDisclaimer: SEMCO Modern Seamless Surface, Inc. (“SEMCO”) believes that the information herein is factual but is not intended to be all\ninclusive. The information relates only to the specific material designated and does not relate to its use in combination wit h other\nmaterials or its use as to any particular process. Because safety standards and regulations are subject to change and because SEMCO\nhas no continuing control over the material, those handling, storing or using the material should satisfy themselves that the y have current\ninformation regarding the particular way th e material is handled, stored or used and that the same is done in accordance with federal,\nstate and local law. SEMCO MAKES NO WARRANTY, EXPRESS OR IMPLIED, INCLUDING (WITHOUT LIMITATION) WARRANTIES\nWITH RESPECT TO THE COMPLETENESS OR CONTINUING ACCURACY OF THE INFORMATION CONTAINED HEREIN OR WITH\nRESPECT TO FITNESS FOR ANY PARTICULAR USE.",
    "sourceDocument": "NuLift-SDS.pdf",
    "title": "NuLift SDS",
    "category": "Technical doc",
    "wordCount": 278
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p1",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 1,
    "text": "semcosurfaces.com\nSEMCO Integration Program\n1 2019.V03\nCONTENTS\nAbout Semco ................................................................................................................................. 2\nSemco Timeline ........................................................................................................................... 3\nProject Detail Form .................................................................................................................... 4\nProject Requirement Form .................................................................................................... 5\nProject Mockup Approval / Color Acceptance Form .................................................. 6\nProject Change Order Form ................................................................................................... 7\nProject Phase Acceptance Form .......................................................................................... 8\nFinal Project Acceptance Form ............................................................................................. 9\nProject Surface Protection Sign O ff Form ..................................................................... 10\nProject Maintenance Procedure Sign-O ff Form for Exterior Floor ................... 11\nProject Maintenance Procedure Sign-O ff Form for Interior Floor .................... 12\nProject Maintenance Procedure Sign-O ff Form for Countertop ....................... 13\nProduct Descriptions ............................................................................................................. 14\nPreparation System ................................................................................................................ 15\nMasking ........................................................................................................................... 17\nCove Base ...................................................................................................................... 18\nCracks & Control Joints (A)........................................................................................ 19\nPreparation A ............................................................................................................... 20\nPreparation B ................................................................................................................ 21\nPreparation C................................................................................................................. 22\nPreparation D ................................................................................................................23\nPreparation E ................................................................................................................ 24\nX-Bond System ........................................................................................................................... 25\nScratch Coat ....................................................................................................................27\nCracks & Control Joints (B) .........................................................................................28\nLiquid Membrane .........................................................................................................29\nBrown Coat .....................................................................................................................30\nPolished Bond A .......................................................................................................... 31\nNatural Grain B.............................................................................................................. 32\nColor Bond C ................................................................................................................ 33\nADA Safety Floor D ..................................................................................................... 34\nVertical Surface / Cove Base E ................................................................................. 35\nFinish System ............................................................................................................................. 36\nNatural Stain ................................................................................................................. 39\nFlat A (X-Crete 500 & Natural Shield) ................................................................... 40\nWater Containment .....................................................................................................41\nMatte & Gloss B (X-Crete 400) ................................................................................ 42\nHigh Gloss C (X-Tra Gloss) ........................................................................................ 43\nXtreme Gloss D (Xtreme Gloss) .............................................................................. 44\nSatin E (Satin Stone) ....................................................................................................45\nColor Grain F ................................................................................................................. 46\nColor Green G ............................................................................................................... 47\nColour Coat & Color Gloss H ................................................................................... 48\nCrystal Coat ................................................................................................................... 49",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 248
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p2",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 2,
    "text": "2 2019.V03\nSEMCO surfacing products create a chemical bond\nat the molecular level to any solid surface\nSTONE\nWATERPROOF SEAMLESS STONE\nUV RESISTANT\nRAPID APPLICATION\nCOST EFFECTIVE\nPROVEN DURABILITY\nMODERN LOOK\nWOOD\nTILE\nCONCRETE\nVINYL\nEPOXY\nsemcosurfaces.com\nSEMCO Modern Seamless Surface is an innovative surfacing manufacturer that specializes in developing coatings and\nwaterproo fi ng products for \" oors, walls above and below grade. SEMCO has provided materials and installations for\nresidential, major commercial, and public projects throughout the world, with o # ces in US, Australia, New Zealand,\nHong Kong, Japan, Spain, Switzerland, Germany, United Kingdom, Mexico, South Korea, Puerto Rico and Cambodia.\nSEMCO focuses on developing products that achieve multiple bene fi ts with using a single system to achieve\nvirtually any solid surface fi nish. Individually SEMCO products achieve seamless stone surfaces, new or enhancing\nsurface colors, and sealers designed to ensure long lasting fi nishes.\nREMODEL WITHOUT REMOVAL\nSEMCO revolutionized the way the world looks at remodeling. Imagine being able to remodel any solid surface\nwithout having to demolish the current fi nish. SEMCO has perfected a method of utilizing the X ‐ Bond System to\nchemically link to any solid surface. The X-Bond System goes beyond the standards of resurfacing in being able\nto resurface any solid surface without removal. Eliminate the time and cost of demolition and remodel without\nremoval using SEMCO X-Bond System.\nFor over 25 years SEMCO continues to manufacture top of the line water based concrete stains and sealers. It\nhas always been our goal to produce environmentally responsible GREEN MATERIALS. SEMCO Modern Seamless\nSurface has an entire line of surfacing materials that can help qualify your project for GREEN certi fi cation in\nalmost any country.\nSEMCO Modern Seamless Surface\nSURFACE ENGINEERING COMPANY\nSEMCO Integration Program",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 296
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p3",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 3,
    "text": "3 2019.V03\nSEMCO TIMELINE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 4
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p4",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 4,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2018.V01\nSURFACE ENGINEERING COMPANY\nPROJECT DETAIL FORM\nProject Name:\nAddress:\nSurface Engineer:\nDate Started: Date Finished:\nTechnicians:\nContact Name:\nPreparation of Existing Substrate:\nScratch Coat\nX-Bond Brown Coat\nLiquid Membrane Anti-fracture Fabric\nX-Bond Seamless Stone:\nFinish:\nObjectives:\nNotes:\n1. Area:\nArea: sq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nsq ft\nArea:\nArea:\nArea:\nArea:\nArea:\nArea:\nArea:\nTotal:\nTotal:\nTotal:\n1.\nColor:\n1.\n1.\n1.\n2.\nColor:\n3.\n2.\n2.\n2.\n3.\n3.\n3.\n2.\nColor:\n3.\nPhone number:\nIntegrator:\nTeam Leader:\nStarting Time: Finish Time:\nEXISTING SUBSTRATE\nSCRATCH COAT\nFINISH\nLIQUID MEMBRANE\nwith anti-fracture fabric\nX- BOND BROWN COAT\nX-BOND SEAMLESS STONE\n0\n0\n0",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 133
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p5",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 5,
    "text": "semcosurfaces.com\nSEMCO Integration Program\n5 2019.V03\nPROJECT REQUIREMENT FORM\nProject Name: Order Date:\nArea: Approved By: Due Date:\nEQUIPMENT MATERIALS AND SUPPLIES\nPREPARATION Qty Qty Qty\nScrub mac. / Attach / extension Masking tape brown 1.5” PC 20 ___ Power Cleaner\nVacuum & 50’ extension cord Masking red tape 2” NL 10 ___ Nu Lift\nWater Hose / Nozzle Masking tape blue 1/5” SS 10 ___ Stone Soap\nPump Sprayer (Prep System) Masking paper Anti-fracture membrane _____”\nFloor hand grinder 6” disc Masking plastic 72” roller Visqueen / vinyl\nFloor Fan # _____ Roller set for X-Bond Trash bag\nFloor scrapper with 3 blades X-Bond mixture/smooth set Rags\nX-Bond Qty Qty Qty\nPolished Trowel XB 80 ___ X-Bond Liquid AT 10 ___ Acetone\n8 Pads & 4 sprayer bottles XBT 50 ___ X-Bond Stone XBM 50 Micro Bond Stone\nPalm sander / disc grit XBA 80 ___ Color Activator Spray texture/hopper/gas\n4” Grind with diamond blade XBAD 80 ___ X-Bond Additive WD40\nSand attachment and 20” screen XMA 8 ___ Liquid Membrane\nFINISHING Qty Qty Qty\nHVLP Set # PSB 30 ___ Pre-stain Base XG70 ___ Xtra Gloss\nAirless Sprayer # ___ tip # ___ PS 30 ___ Pre-stain Color CC20 ___ Colour Coat ___\nMicro set application # ___ PSA 30 ___ Pre-stain Act NAS5 ___ Flat\nMagic trowel XC 40 ___ Xcrete 400 CC60 ___ Crystal Coat ___\nXtreme Gloss squeegee/notch paddle MFA 10___ Matte Agent XC50 ___ Xcrete 500\nCordless drill XTG ___ Xtreme Gloss parts A&B XTS100 ___ Satin Stone\nOTHER Qty Qty Qty\nMATERIALS, TOOLS AND SUPPLIES",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 262
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p6",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 6,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n6 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nSemco Modern Seamless Surface\n3620 W Reno Ave, Suite J / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 / semcosurfaces.com\nIt is mutually agreed and accepted that colors chosen from SEMCO color charts are subject to variation\ndependent upon lighting in which its viewed and/or the substrate in which it is applied. SEMCO\nModern Seamless Surface applies the stains by hand. Color variations and patterns within the color\ncoat are natural and we believe this adds to the natural, original, and beautiful look of the final\nproduct. Substrate texture, hand troweling of an overlay, poured concrete, substrate angles, substrate\nthickness, stain mixture, humidity, climate, and aftercare also cause variations in the final product.\nThe undersigned, by signing below, accepts the color as shown on the sample provided by SEMCO\nMo d ern Seamless Surface. / ƚŚĞ ƵŶdĞƌƐŝŐŶĞd͕ ĂƵƚŚŽƌŝǌĞ ƚŚĞ ƚŚĞ ĐŽŵƉůĞƚŝŽŶ ŽĨ ƚŚĞ ƐƵƌĨĂĐĞ\nĂƉƉůŝĐĂƚŝŽŶ ďĞůŽǁ͘\nColor:\nFinish Coat Sealer:\nAccepted by:\nPrint Name Title\nMOCKUP APPROVAL / COLOR ACCEPTANCE\nCOLOR ACCEPTANCE\n0\n0\nSignature Date\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 210
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p7",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 7,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n7 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nCHANGE ORDER:\nCOST OF CHANGE ORDER:\nDescription of the phase:\nAccepted by:\nSemco Modern Seamless Surface\n3620 W Reno Ave, Suite J / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 / semcosurfaces.com\nPROJECT CHANGE ORDER\nThe undersigned, by signing below, agrees that the description, above, accurately states the\nadditional work requested and hereby agrees to pay all costs associated with the change, in the\namount referenced above.\nTitle Print Name\n0\n0\nSignature Date\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 118
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p8",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 8,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n8 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nWe undersigned approve:\nDescription of the phase:\nAccepted by:\nSemco Modern Seamless Surface\n3620 W Reno Ave, Suite J / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 / semcosurfaces.com\nPrint Name Title\n0\n0\nPROJECT PHASE ACCEPTANCE\nWe approve that the phase work has been completed in an acceptable fashion, and the phase work\ncompleted as agreed upon in our contract/proposal.\nSignature Date\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 107
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p9",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 9,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n9 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nAccepted by:\nSemco Modern Seamless Surface\n3620 W Reno Ave, Suite J / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 / semcosurfaces.com\nPrint Name\n0\n0\ncompleted to the “scope of work” as agreed upon in our contract and/or proposal.\nFINAL PROJECT ACCEPTANCE\nPROJECT ACCEPTANCE LETTER\nWe the undersigned approve the color, finish, and workmanship as seen on the project. We\napprove that all work has been completed in an acceptable fashion, and the work has been\nIt is mutually agreed and accepted that colors chosen from SEMCO color charts are subject to variation\ndependent upon lighting in which its viewed and/or the substrate in which it is applied. SEMCO\nModern Seamless Surface applies the stains by hand. Color variations and patterns within the color\ncoat are natural and we believe this adds to the natural, original, and beautiful look of the final\nproduct. Substrate texture, hand troweling of an overlay, poured concrete, substrate angles,\nsubstrate thickness, stain mixture, humidity, climate, and aftercare also cause variations in the final\nproduct.\nTitle\nSignature Date\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 217
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p10",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 10,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n10 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nProtecting SEMCO Surfaces Requirements:\n1) Cover SEMCO surface with k raft paper and plastic to protect from heavy traffic during\nconstruction\nWhat Not to Use On SEMCO Surfaces:\n1) NO duct tape on surface\n2) NO masking tape on surface\nAccepted by:\nSemco Modern Seamless Surface\n3620 W Reno Ave, Suite J / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 / semcosurfaces.com\nSURFACE PROTECTION SIGN OFF\nI understand the requirements of protecting SEMCO surfaces while additional construction is being\ndone. I fully accept responsibility for any damages that are inflicted on the surface after the final\nproject acceptance. Any repairs to the surface due to damages incurred after final completion is not\nincluded within the scope of work stated on our contract.\nDate\n0\n0\nPrint Name\nSignature\nTitle\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 173
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p11",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 11,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n11 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nPRODUCTS REQUIRED SUGGESTED QUANTITY\n1) Stone Soap 1 part STONE SOAP to 9 parts water\n2) Nu Lift Cleaner 1 part NU LIFT CLEANER to 1 part water\nEQUIPMENT REQUIRED\n1) Rayon Mop, Mop Bucket, Scrub Brush\nOPTIONAL EQUIPMENT - USE AS NEEDED ON LARGE AREAS (OVER 2,000 SQ.FT.)\n1) Auto Scrubber / Buffer, with white pad\n2) Soft bristle scrub brush\nDAILY/WEEKLY MAINTENANCE\n1) Thoroughly dust mop and sweep area and/or vacuum\n2)\nMONTHLY MAINTENANCE\n1)\n2)\n3)\nAccepted by:\nDilute 1 part STONE SOAP to 9 parts water in to pump sprayer and apply over the surface use scrub soft brush\nmachine or deck broom to agitate with solution and rinse off with water\nSignature\nI, _____________________________________, been educated on the Maintenance Procedures for the SEMCO\nSystem. I acknowledge that I understand all that has been explained to me.\nMAINTENANCE PROCEDURE SIGN Ͳ OFF\nFOR EXTERIOR SEMCO FLOOR\nDate\n0\n0\nThoroughly sweep and rinse area w/ hose. For better cleaning use a light pressure washer\nIf the surface contains magnesium (black residue) or calcium (white residue), apply NU LIFT CLEANER (1:1 ratio).\nAllow to set 3-5 minutes and scrub areas with a soft bristle brush. Apply STONE SOAP w/pump sprayer on entire area\nwith a dilution ratio of 1:9. Scrub area with an auto scrubber and/or low speed floor machine or with a soft bristle\nbrush.\nRinse off surface area with up to 3000 psi Pressure Washer, keep the tip minimum 6” from surface\nRecommendations:\nFor hard or sharp tipped chairs, tables, benches, etc., please utilize felt or soft tip attachments in order to avoid scratching\nand premature wear of f the top coat.\nTHE FOLLOWING CLEANING METHODS MAY DAMAGE THE ARCHITECTURAL CONCRETE COATING AND\nVOID YOUR WARRANTY WITH SEMCO\nDO NOT USE: Green, brown or black floor pads, Nylon-Grit or Strata-Grit rotary brushes, high alkaline cleaners, degreasers,\nstrippers or high pressure washer equipment. Semco cannot warrant the use of high pressure washers due to varying\npressures and the unknown nature of the individual job-site substrate, which may contribute to damage from the use of such\nequipment. SEMCO cannot warrant against abuse and misuse.\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 399
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p12",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 12,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n12 2019.V03\nPROJECT NAME:\nPROJECT LOCATION:\nSURFACE AREA:\nPRODUCTS REQUIRED SUGGESTED QUANTITY\n1) Stone Soap (Cleaner) Mix 1 part STONE SOAP to 9 parts water\n2) Crystal Coat (Finish Coat) Apply 3 coats of CRYSTAL COAT\nEQUIPMENT REQUIRED\n1) Rayon Mop, Mop Bucket, scrub brush\n2) SEMCO Microfiber Applicator Set - use blue pad to scrub clean the surface then tan pad to apply CRYSTAL COAT\nOPTIONAL EQUIPMENT - USE AS NEEDED ON LARGE AREAS (OVER 2,000 SQ.FT.)\n1) Auto Scrubber / Buffer, with white pad\n2) Soft bristle scrub brush\nDAILY/WEEKLY MAINTENANCE\n1) Thoroughly dust mop and sweep area and/or vacuum\n2)\nMONTHLY/QUARTERLY MAINTENANCE 237,21$/\n1)\n2)\nAccepted by:\nRecommendations:\nDO NOT USE: Green, brown or black floor pads, Nylon-Grit or Strata-Grit rotary brushes, high alkaline cleaners, degreasers,\nstrippers or high pressure washer equipment. Semco cannot warrant the use of high pressure washers due to varying\npressures and the unknown nature of the individual job-site substrate, which may contribute to damage from the use of such\nequipment. SEMCO cannot warrant against abuse and misuse.\nMAINTENANCE PROCEDURE SIGN OFF\nFOR INTERIOR SEMCO FLOOR\nDate\n0\n0\nDilute 1 part STONE SOAP to 9 parts water in to pump sprayer and apply over the surface use scrub soft brush\nmachine or deck broom to agitate with solution and rinse off with water\nSignature\nUse a SEMCO dust mop pad to remove debris. Apply STONE SOAP mix to the surface scrub area with SEMCO blue\npad or use auto scrubber on low speed with white pad for a large area. Some areas may require scraping by hand\nwith a stiff brush.\nApply a light coat of CRYSTAL COAT with a SEMCO Microfiber pad (3 coats). Allow 20 minutes drying time between\ncoats. Re-coat high traffic areas every 4-12 weeks.\nFor hard or sharp tipped chairs, tables, benches, etc., please utilize felt or soft tip attachments in order to avoid scratching\nand premature wear of the top coat.\nTHE FOLLOWING CLEANING METHODS MAY DAMAGE THE ARCHITECTURAL CONCRETE COATING AND\nVOID YOUR WARRANTY WITH SEMCO\nI, _____________________________________, been educated on the Maintenance Procedures for the SEMCO\nSystem. I acknowledge that I understand all that has been explained to me.\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 399
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p13",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 13,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n13 2019.V03\nPROJECT NAME:\nJOB SITE ADDRESS:\nAREA:\nPRODUCTS REQUIRED SUGGESTED QUANTITY\n1) Stone Soap (Cleaner) Mix 1 part STONE SOAP to 9 parts water\n2) X-Cel (Finish Coat) Apply 3 coats of X-CEL\nDAILY/WEEKLY MAINTENANCE\n1)\nANNUALLY MAINTENANCE\n1)\n2) Apply 3 coats of X-CEL with a roller. Allow 20 minutes drying time between coats.\nAccepted by:\nTHE FOLLOWING CLEANING METHODS MAY DAMAGE THE ARCHITECTURAL CONCRETE COATING AND\nVOID YOUR WARRANTY WITH SEMCO\nI, _____________________________________, been educated on the Maintenance Procedures for the SEMCO\nSystem. I acknowledge that I understand all that has been explained to me.\nDO NOT USE: Green, brown or black floor pads, Nylon-Grit or Strata-Grit rotary brushes, high alkaline cleaners, degreasers,\nstrippers or high pressure washer equipment. Semco cannot warrant the use of high pressure washers due to varying\npressures and the unknown nature of the individual job-site substrate, which may contribute to damage from the use of such\nequipment. SEMCO cannot warrant against abuse and misuse.\nMAINTENANCE PROCEDURE SIGN OFF\nFOR COUNTER TOP\nDate\n0\n0\nDilute 1 part STONE SOAP to 9 parts water in to pump sprayer and apply over the surface use scrub soft brush\nmachine or deck broom to agitate with solution and rinse off with water\nSignature\nUse a SEMCO dust mop pad to remove debris. Apply STONE SOAP mix to the surface scrub area with SEMCO blue\npad or use auto scrubber on low speed with white pad for a large area. Some areas may require scraping by hand\nwith a stiff brush.\n3620 W Reno Ave, Suite J • Las Vegas, NV 89118 • Tel 702-222-9495 • Fax 702-965-2577 • www.semcomfg.com",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 289
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p14",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 14,
    "text": "semcosurfaces.com\nSEMCO Integration Program\n14 2019.V03\nSTONE SOAP\nStone Soap is a highly concentrated Neutral Cleaner.\nIt is excellent for both general purpose and industrial\ngrade surface cleaning\nPOWER CLEANER\nPower Cleaner is a Biodegradable Degreaser. It comes\nhighly concentrated and will remove oil, and other\npetroleum based contaminates\nNU-LIFT CLEANER\nNu-Lift Cleaner is a Biodegradable Reactive Mineral\nCleanser. It is engineered to clear deposits created from\nhard water or mineral residue\nPRODUCTS\nPREPARATION PRODUCTS\nX-BOND SEAMLESS STONE\nCOLORING SYSTEMS\nSEALERS\nCOLOUR COAT\nColour Coat is a water-based all-in-one primer, color, and\npolyurethane sealer. It works for all levels of foot tra # c and is\nideal for interior and exterior applications. Standard\nSemi-Gloss fi nish, with Matte and Satin options available\nCOLOR GLOSS\nColor Gloss is a solvent based all-in-one primer, color, and\npolyurethane sealer. It is engineered for heavy motor tra # c capable\nof withstanding interior and exterior industrial grade use. Standard\nfi nish is a High Gloss fi nish, with Matte and Satin options available\nCOLOR GREEN\nFor specialized application over diamond polished concrete,\nprecast concrete, tilt-up concrete walls and new green slab\nconcrete, with permanent color e % ect. Can be used on indoor,\noutdoor, and below-grade surfaces\nCOLOR GRAIN\nHighly effective wood protection, restoration, and coloring system.\nDesigned to cross-link into the pores of wood, enabling maximum\ncolor penetration. It solidifies and colors wood to enhance Natural\nWood Finish. Engineered for indoor, outdoor, and submerged surfaces\nX-CRETE 500\nX-Crete 500 is a solvent based flat finish Silane/Siloxane\npenetrating sealer. X-Crete 500 performs in the most rigorous\nenvironments; adding waterproofing to any applied substrate\nX-TRA GLOSS\nX-Tra Gloss is a solvent membrane forming polyurethane\nsurface sealer. It is engineered for heavy motor tra # c capable of\nwithstanding interior and exterior industrial grade use. Standard\nfi nish is a high gloss fi nish, with Matte and Satin options available\nX-CRETE 400\nX-Crete 400 is a water-based membrane forming polyurethane\nsurface sealer. It works for all levels of foot tra # c and is ideal for\ninterior and exterior applications. Standard Semi-Gloss fi nish, with\nMatte and Satin options available\nXTREME GLOSS\nXtreme Gloss is a two part resinous membrane forming water-\nbased sealer. Built for rapid curing to enable fast installation;\nengineered for extreme chemical resistance and commercial\nkitchen tra # c. Interior use only\nSATIN STONE\nSatin Stone sealer is a unique water-based, cross-linking product\nengineered to integrate with its applied substrate. This complete\nbond ensures total surface protection. Excellent for interior and\nexterior use while handling rigorous surface conditions including\nhigh tra # c commercial, and industrial environments\nCRYSTAL COAT\nCrystal Coat is a water-based acrylic sacri fi cial coating. It surpasses\nall forms of surface maintenance wax by eliminating the need to\nremove standing Crystal Coat. It protects surface up to four times\nlonger than conventional waxes. Standard Semi-Gloss fi nish, with\nMatte and Satin options available\nNATURAL SHIELD\nNatural Shield is water-based hybrid waterproo fi ng sealer, that\nexcels under the most demanding circumstances. It’s very fi ne\nmolecular weight allows for excellent penetration. Natural Shield\nfi lls into the pores of the substrate where it creates a solid, but\nbreathable membrane with hydrophobic properties\nX-BOND STONE\nX-Bond Stone is part one of two for the X-Bond\nSeamless Stone , used only in conjunction with\nX-Bond Liquid (part 1 of 2)\nX-BOND COLOR ACTIVATOR\nX-Bond Color Activator is a UV stable color additive,\nblended speci fi cally for use with X-Bond Seamless Stone\nX-BOND MICRO\nFor use with with X-Bond Liquid to create Polished\nBond texture or a smoother surface\nLIQUID MEMBRANE\nLiquid Membrane waterproofs and prevents cracks (up to\n1/8”) in concrete slab, plywood, tile and stone \" oors due\nto surface movement.\nX-BOND LIQUID\nX-Bond Liquid is part two of two for the X-Bond\nSeamless Stone , used only in conjunction with\nX-Bond Stone (part 2 of 2)\nPRE-STAIN COLOR ACTIVATOR\nPre-Stain Color Activator is a UV stable color additive,\nblended speci fi cally for use with Pre-Stain\nX-BOND ADDITIVE\nX-Bond Additive can be added to X-Bond Seamless\nStone to increase a single application thickness of the\nX-Bond Seamless Stone i.e. Brown Coat up to 4”\nPRE-STAIN COLOR ACTIVATOR\nPre-Stain Color Activator is a UV stable color additive,\nblended speci fi cally for use with Pre-Stain",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 717
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p15",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 15,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n15 2019.V03\nSURFACE PREPARATION 8. Plaster Inside Pool and Jacuzzi\n9. Sealed Concrete - No Wax\n10. Surface - Wax\n11. Terrazzo Floor\n12. Tile\n13. Water-based Carpet Glue\n14. Wood\n1. Commercial Kitchen\n* Add water to dilute a solution, all ratios are SEMCO PRODUCT : WATER\n1. Order required materials, tools and supplies.\n2. Pre-mobilize the project team to ensure total understanding.\n3. Masking is required.\n2. Concrete Stamp\n3. Concrete Unsealed\n4. Epoxy\n5. Exterior Stucco\n6. Glass, Metal and Formica\n7. Natural Stone - No Wax\nOrganize workstation,\ncheck inventory\nPreparation Type Required\nCrack & Joint Control, Sweep,\nRemove Debris, Dampen\nNu-Lift Cleaner 100%\nPower Cleaner 1:4\nStone Soap 1:4\nScrub\nRinse with Water\nNu-Lift Cleaner 1:1\nPower Cleaner 1:9\nRinse with Water\nREQUIRED PREPARATION:\n1. Open any cracks over 1/8” and all\ncontrol joints with 4” angle grinder\n2. Sweep the surface and dampen with water\n3. Apply the solution with pump sprayer\nTYPE A:\n1. Stone Soap Solution 1:4\nTYPE B:\n1. Power Cleaner Solution 1:4\n2. Stone Soap Solution 1:4\nTYPE C:\n1. Power Cleaner Solution 1:4\n2. Nu-Lift Cleaner Solution 1:1\n3. Power Cleaner Solution 1:9\nTYPE E:\n1. Wood surface - apply\nLiquid Membrane.\n2. Apply X-Bond Mixture\n(Brown Coat)\nTYPE D:\n1. Nu-Lift Cleaner: no dilution\n2. Stone Soap Solution 1:4\nProject Name:\nProject Location:\nSurface Area: Total duration: Crew:",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 245
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p16",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 16,
    "text": "Masking paper\nMasking fi lm\nPump sprayer (4)\nPush broom, broom set,\nhand broom Empty 5 gal bucket\nScrub machine\n4” angle grinder with diamond\nblade, safety glasses, mask\nVacuum and dust bag\nWater hose w/nozzle 12 gauge, multiple plug (1)\n12 gauge extension cord (2)\nBox of rags\nPop-up trash bin\nLiquid Membrane Masking tape Red masking tape Blue masking tape\npH pencil Hand masker (2)\nPower Cleaner Stone Soap Nu-Lift Cleaner\nwith nylon concrete brush\nAnti-fracture fabric\nsemcosurfaces.com\nSEMCO Integration Program\n16 2019.V03\nSURFACE PREPARATION\nMATERIALS, TOOLS AND SUPPLIES",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 91
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p17",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 17,
    "text": "semcosurfaces.com 17 2019.V03\nPOLISHED BOND\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1\nMask area with masking plastic and 1 1/2” brown\ntape, place 1” above surface\nProtects from overspray\nSTAGE 2\nUse masking paper to cover area 1/2” above surface When spraying color, this prevents excess dripping\ninto the edges of the \" oor underneath\nSTAGE 3\nUse brown tape 1/8“ above surface Forms a straight line and reduces clean up and\ndetailing post completion\nFor painted walls, use blue masking tape To prevent peeling and damage to existing surface\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1\nUse masking paper to cover area 1/2” above surface When spraying color, this prevents excess dripping\nonto the edges of the \" oor underneath\nSTAGE 2\nUse brown tape 1/8“ above surface Forms a straight line and removes each step after\ncompletion\nFor painted walls, use blue masking tape To form a straight line. Remove and replace after\neach step\nSURFACE PREPARATION PROCEDURE / MASKING\nNATURAL GRAIN, COLOR BOND & ADA SAFETY SURFACE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 174
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p18",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 18,
    "text": "semcosurfaces.com\nSEMCO Integration Program\n18 2019.V03\nSURFACE PREPARATION PROCEDURE\nCOVE BASE FLOORS / WALLS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1\nApply Liquid Membrane with roller. Do not allow to\ndry. While still wet press the anti-fracture membrane\ninto fresh coat of Liquid Membrane until you don’t\nsee the fi ber. Allow 20 to 40 minutes to dry before\napplying second coat\nEmbeds Fabric membrane into wet SEMCO Liquid\nMembrane, to become one element\nMix X-Bond mixture: 1 part of X-Bond Liquid and 1\npart of X-Bond Additive, mix this fi rst. Then add 3\nparts X-Bond Stone, mix with Square Mixing Paddle at\nlow speed (180-200 RPM)\nAllows for the X-Bond application to be used as a\nbuild up coat, allows for a maximum thickness of 3/4”\nWhile the X-Bond Liquid is still tacky, pour the mixture\nto the corner of surface\nEnsures clean fi nish application\nUsing a cove base tool to spread the X-Bond mix\nevenly. Use a 6” trowel to even the surface. Use X-Bond\nsmoother to spread X-Bond mix on \" oor evenly.\nCove base tool controls the thickness, use trowel and\nX-Bond smoother for even spreading\nRemove tape before the surface is completely dry.\nRemove the 1” of tape but do not sweep the debris.\nThen allow surface to totally dry and remove debris\nfrom the surface. Detail the edges as required and\nre-apply the tape before proceeding to next step X-\nBond system\nMakes tape easier to remove rather than waiting till\nafter product has dried\nAllow cove base to dry for a minimum of 20 minutes\n(depending on weather)\nAllows product to fully cure. Ensures that it is thor-\noughly solid\nSTAGE 2\nApply Primer Coat of X-Bond Liquid. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix colored X-Bond mixture: 1 part of X-Bond Liquid\nto 3 parts of X-Bond Stone, mix with Square Mixing\nPaddle at low speed (180-200 RPM)\nEnsures proper consistency and prevents air from get-\nting into the mix ensuring more working time\nUsing a cove base tool spread the X-Bond mix evenly.\nUse a 6” trowel to even the surface. Use X-Bond\nsmoother to spread X-Bond mix on \" oor and farther\nout . Make sure the suface is smooth\nCove base tool controls the thickness, use trowel and\nX-Bond smoother for even spreading",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 393
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p19",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 19,
    "text": "semcosurfaces.com\nSEMCO Integration Program\n19 2019.V03\nSURFACE PREPARATION PROCEDURE\nCRACKS & CONTROL JOINTS (A) FLOORS / WALLS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Opening existing cracks\nOpen cracks over 1/8” and all control joints with\n4” diamond angle grinder. Use vacuum to\nimmediately remove debris while grinding\nAllows X-Bond mixture to penetrate and ensures\nsurface is properly cleaned",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 62
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p20",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 20,
    "text": "semcosurfaces.com 20 2019.V03\nA CONCRETE (UNSEALED OR NON WAXED) , NATURAL STONE (NON WAXED) , VINYL (NON\nWAXED) , METAL, FORMICA & GLASS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Allows molecular bond directly to the substrate\nDampen surface with water Prevents cleaner from penetrating into deep pores\nSTAGE 2 - Wash\nApply Stone Soap solution lightly with pump\nsprayer and allow to sit for 2-3 minutes\nAllows the cleaner to react with surface\nScrub/agitate surface using scrub machine with a\nconcrete nylon brush or hand scrub brush in tight\nareas\nAgitates the cleaner with surface\nRinse surface; for interiors use wet vacuum Removes residue\nSTAGE 3 - Repeat if needed\nRepeat rinse and vacuum if needed Ensures no particles are remaining on surface\nAllow surface to dry Ensures no bubbles appear in next step procedure\nRatio reminder:\nStone Soap Solution\n1 part Stone Soap : 4 parts water\nSURFACE PREPARATION PROCEDURE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 163
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p21",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 21,
    "text": "semcosurfaces.com 21 2019.V03\nSURFACE PREPARATION PROCEDURE\nCOMMERCIAL KITCHEN, EPOXY, TERRAZZO, CARPET GLUE & WAXED SURFACES\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Allows molecular bond directly to the substrate\nDampen surface with water Prevents cleaner from penetrating into deep pores\nSTAGE 2 - Wash\nApply Power Cleaner solution lightly with pump\nsprayer and allow to sit for 2-3 minutes\nHigh performance cleaner that removes water-\nbased glue, paint; additionally waxes, sealers, and\nnon permanent topical coatings\nScrub/agitate surface using scrub machine with a\nconcrete nylon brush or hand scrub brush in tight\nareas\nAgitates the cleaner with surface\nRinse surface, for interiors use wet vacuum to\nremove residue\nRemoves residue\nRepeat all steps in this task with Stone Soap\nSolution to clean chemical residue\npH balances the surface and cleans it of additional\ncontaminates\nSTAGE 3 - Repeat if needed\nRepeat rinse and vacuum if needed Ensures no particles are remaining on surface\nAllow surface to dry Ensures no bubbles appear in next step procedure\nRatio reminder:\nPower Cleaner Solution\n1 part Power Cleaner : 4 parts water\nStone Soap Solution\n1 part Stone Soap : 4 parts water\nB",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 201
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p22",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 22,
    "text": "semcosurfaces.com 22 2019.V03\nSURFACE PREPARATION PROCEDURE\nFOR ALL UNSURE PRE-EXISTING SURFACE CONDITIONS, STAMPED CONCRETE & EXTERIORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Allows molecular bond directly to the substrate\nDampen surface with water Prevents cleaner from penetrating into deep pores\nSTAGE 2 - Wash\nApply Power Cleaner solution 1 lightly with pump\nsprayer and allow to sit for 2-3 minutes\nHigh performance degreaser, removes water-based\nglue, paint; additionally waxes, sealers, and non\npermanent topical coatings\nScrub/agitate surface using scrub machine with\nnylon brush or hand scrub brush\nAgitates the cleaner with surface\nRinse surface; for interiors use wet vacuum Removes residue\nApply Nu-lift Cleaner solution and repeat all steps Removes mineral deposit , e & orescence, alkali and\nmagnesium deposits\nApply Power Cleaner solution 2 and repeat steps\nfor the procedure\npH balances the surface and cleans it of additional\ncontaminates\nSTAGE 3 - Repeat if needed\nRepeat rinse and vacuum if needed Ensures no particles are remaining on surface\nAllow surface to dry Ensures no bubbles appear in next step procedure\nRatio reminder:\nPower Cleaner Solution 1\n1 part Power Cleaner : 4 parts water\nNu-Lift Cleaner Solution\n1 part Nu-Lift : 1 part water\nPower Cleaner Solution 2\n1 part Power Cleaner : 9 parts water\nC",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 221
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p23",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 23,
    "text": "semcosurfaces.com 23 2019.V03\nSURFACE PREPARATION PROCEDURE\nEXTERIOR BLOCK WALL, STUCCO, BELOW GRADE PLASTER, TILE, AND MAGNESIUM\nOR EFFLORESCENCE CONTAMINATED SURFACES\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Allows molecular bond directly to the substrate\nDampen surface with water Prevents cleaner from penetrating into deep pores\nSTAGE 2 - Wash\nApply Nu-Lift Cleaner solution lightly with pump\nsprayer and allow to sit for 2-3 minutes\nRemoves mineral deposit , e & orescence, alkali and\nmagnesium deposits\nScrub/agitate surface using scrub machine with\nnylon brush or hand scrub brush\nAgitates the cleaner with surface\nRinse surface, for interiors use wet vacuum Removes residue\nRepeat all steps in this task with Stone Soap\nSolution to clean chemical residue\npH balances the surface and cleans it of additional\ncontaminates\nSTAGE 3 - Repeat if needed\nRepeat rinse and vacuum if needed Ensures no particles are remaining on surface\nAllow surface to dry Ensures no bubbles appear in next step procedure\nRatio reminder:\nNu-Lift Cleaner Solution\nNon diluted Nu-Lift Cleaner\nStone Soap Solution\n1 part Stone Soap : 4 parts water\nD",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 188
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p24",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 24,
    "text": "semcosurfaces.com 24 2019.V03\nSURFACE PREPARATION PROCEDURE WOOD SURFACES\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Allows molecular bond directly to the substrate\nRoll the Liquid Membrane to the surface and allow\nto dry - 1 coat\nSeals the wood substrate\nSTAGE 2 - Application of Membrane Fabric\nApply Liquid Membrane . While still wet press the\nanti-fracture fabric into the Liquid Membrane and\nuse a 18” smoother, trowel, or roller to embed the\nanti-fracture fabric. Immediately, roll with pressure\ntwo additional coats of Liquid Membrane\nEmbeds anti-fracture fabric into wet Liquid\nMembrane to become one element\nWhen applying the next line of anti-fracture fabric\noverlap the new sheet over the existing sheet a\nminimum of 2”\nCreates one surface to prevent it from opening in\nthe future\nAllow surface to dry and proceed with X-Bond fi nish Ensures there are no imprints and the surface is\nready for X-Bond\nSTAGE 3 - Brown Coat\nRoll X-Bond Liquid as primer coat, do not allow to dry Penetrates surface pores and ensures molecular\nbond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid, 1 part\nX-Bond Additive, mix this fi rst. Then add 2 1/2 parts\nX-Bond Stone, mix with Square Mixing Paddle at low\nspeed (180-200 RPM)\nMaking the X-Bond mixture. Square Mixing Paddle\nreduces air within the X-Bond mixture\nWhile the X-Bond Liquid is still tacky, pour the\nmixture to the far edge of surface\nPrepares for scratch coat\nUsing a Gauge Rake spread the Brown Coat evenly\nto the desired thickness. Use a X-Bond smoother\nto even the surface. Spike shoes are recommended\nfor walking on X-Bond surface\nGauge Rake controls the thickness, and it is easy to\nuse for even spreading\nAllow surface to dry, 12 hours minimum. QC to ensure scratch coat is completely dry, and\nallow for a cross linking bond avoid bubbles\nE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 320
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p25",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 25,
    "text": "3620 W Reno Ave / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com\n25 2019.V03\nX-BOND SEAMLESS STONE Project Name:\nProject Location:\nSurface Area: Total duration: Crew:\n1. Prior to start, con fi rm that all X-Bond supplies are on hand\nfor project completion.\n2. Check the surface to ensure surface consistency.\nX-BOND SCRATCH COAT:\n1. Prime X-Bond Liquid with roller\n2. Apply X-Bond mix 1:2 ratio with concrete broom\nBROWN COAT (OPTIONAL):\n1 part X-Bond Liquid mix with 1 part additive and 2 1/2 X-Bond Stone\nC. COLOR BOND:\n1. Apply primer coat of\nX-Bond Liquid with roller.\n2. Apply 2 coats of X-Bond\nmixture (smoother handle\ntilted at 10 o'clock).\n3. Sand surface to achieve\na smoother texture.\n4. Allow surface to dry, apply\nPre-Stain Color or Color Coat\nF. X-BOND\nCOUNTER TOP\n(OVER PLYWOOD) :\n1. Apply 2 coats of\nLiquid Membrane.\n2. Apply X-Bond Mixture\nwith trowel or hopper gun\nE. VERTICAL\nSURFACE:\n1. Apply primer coat of\nX-Bond Liquid with roller.\n2. Apply 2 coats of\nColor Bond.\n3. Optional: SEMCO\nMicrobond can be used to\nachieve a smoother texture.\nD. ADA SAFETY\nFLOOR:\n1. Apply Color Bond with\nhopper gun smallest tip size /\ncompressor at 15 psi.\n2. Multiple colors can be\napplied as desired.\n* No primer coat is required\nfor additional coats.\nSemco Modern Seamless Surface • 3620 W Reno Ave • Las Vegas, NV 89118 • 702.222.9495 • fax: 702.222.1788 • semcosurfaces.com\nA. POLISHED\nBOND:\n1. Apply primer coat of\nX-Bond Liquid with roller.\n2. Apply 2 coats of X-Bond\nmixture (smoother handle\ntilted at 10 o'clock).\n3. Allow surface to dry\ncompletely and apply 2 coats\nof X-Bond Micro Bond\n8. Over Foam\n9. Shower Pan and Balcony\n10. Counter and Table Top\n6. Inside Pool and Jacuzzi\n7. Over Plywood\nFill Cracks with X-Bond Mix and apply Liquid\nMembrane with 6” anti-fracture fabric\nApply X-Bond Scratch Coat\nLiquid Membrane with anti-fracture 36” Fabric\nX-Bond Build up \"Brown Coat\"\nApply Color Bond\nAllow to Semi Dry and Hand Polished\nApply Micro Bond\nDetail and Sand Down\nApply Pre Stain Color Uniformly\nApply Pre Stain Color with Base\nSpray X-Bond Mixture with Hopper Gun\nApply Natural X-Bond\n1. Polished Bond\n2. Natural Grain\n3. Color Bond\n4. ADA Safety Floor\n5. Vertical Surface\nB. NATURAL\nGRAIN:\n1. Apply primer coat of\nX-Bond Liquid with roller.\n2. Apply 2 coats of X-Bond\nmixture (smoother handle\ntilted at 10 o'clock).\n3. Optional: Sand surface to\nachieve a smoother texture.",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 419
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p26",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 26,
    "text": "Measuring containers\n1/2 gal, quart, pint (2)\nX-Bond Stone Tray set\n14” square trowel (2)\n12” round trowel (2)\n6” trowel (2)\nSanding stone (2)\nSanding handle (2)\n6” trowel (2)\nEmpty 5 gal bucket Mixing set (1) Plastic visqueen 6 mil\nRam board\nPre-Stain System Color\nPre-Stain System Base\nX-Bond wall tool set\nMixing tray (3)\nSponge trowel (2)\nConcrete broom (2)\nHand broom (2)\nSpoon (1)\n8” margin trowel (2)\nX-Bond Liquid Micro-Bond X-Bond Color Activator Liquid Membrane X-Bond Stone X-Bond Additive\n24” gauge rake 1/8”\nSpike shoes (2)\nX-Bond smoother and pole (2 each)\nHVLP\nCove base trowel\nX-Bond texture sprayer Paint strainer Hopper gun with prea-\nsure gauge (2), WD-40\nFine pump sprayer Fan (2)\nMATERIALS\nTOOLS AND SUPPLIES\n9” roller set (2)\n4” hand brush (2)\n20” magic trowel (2)\n10” magic trowel (2)\n26 2019.V03\nX-BOND\nMATERIALS, TOOLS AND SUPPLIES",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 146
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p27",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 27,
    "text": "27 2019.V03\nX-BOND PROCEDURE / SCRATCH COAT FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Creatingof initial bonding coat\nRoll X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 parts\nof X-Bond Stone, in this order, and mix with square\nmixing paddle at low speed (180-200 RPM)\nMakes the X-Bond mixture\nWhile the X-Bond Liquid is still tacky, pour the\nmixture to the far edge of surface\nPrepares for scratch coat\nUsing concrete broom spread material tightly, in\nONE DIRECTION\nAgitates to the substrate, creates molecular bond\nAllow surface to dry. Scrape surface of any loose\nparticles, and sweep clean\nTo avoid bubbles. Ensures smooth fi nish coats\nwithout debris\nWALLS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Creating initial bonding coat\nRoll X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 parts\nof X-Bond Stone, in this order, and mix with square\nmixing paddle at low speed (180-200 RPM)\nMakes the X-Bond mixture\nWhile the X-Bond Liquid is still tacky, pour the\nmixture to the mud tray, use a hand broom to\nspread material from left to right, NOT up and\ndown\nPrepares to do scratch coat\nUsing hand broom spread material tightly, in ONE\nDIRECTION\nAgitates to the substrate, creates molecular bond\nAllow surface to dry. Scrape surface of any loose\nparticles, and sweep clean\nTo avoid bubbles. Ensures smooth fi nish coats\nwithout debree",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 265
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p28",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 28,
    "text": "28 2019.V03\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nTYPE A: FRACTURES UP TO 1/16 INCH CRACKS\nApply minium 2 coats of Liquid Membrane to\nachieve a thickness of at least 3 mil to retard future\nreoccurrence of crack. 30 min at 70 °F between coats\nRepair process will aid lessening the chance for a\ncrack to reform\nTYPE B: CRACKS BETWEEN 1/16 - 1/4 INCH\nRoll or brush Liquid Membrane inside the crack.\nALLOW IT TO DRY. Roll X-Bond Liquid as a primer\ncoat. DO NOT ALLOW IT TO DRY. Apply X-Bond\nmixture* to fi ll up the cracks. ALLOW MIXTURE*\nTO DRY. ONCE DRY roll 2 coats of Liquid\nMembrane to achieve a thickness of at least 3 mil\nto prevent future reoccurrence of crack. 30 min at\n70 °F between coats\nRepair process will aid lessening the chance for a\ncrack to reform\nTYPE C: CRACKS OR OPENINGS EXCEEDING 1/4 INCH\nRoll or brush Liquid Membrane inside the crack.\nALLOW IT TO DRY. Roll X-Bond Liquid as a primer\ncoat. DO NOT ALLOW IT TO DRY. Apply X-Bond\nmixture* to fi ll up the cracks. ALLOW MIXTURE* TO\nDRY. ONCE DRY roll 1 coat of Liquid Membrane .\nWhile still wet imbed 6” wide anti-fracture fabric to\nsurface, and immediately roll an additional 2 coats\nof Liquid Membrane to fully encapsulate anti-\nfracture fabric\nRepair process will aid lessening the chance for a\ncrack to reform\nWhen applying the next line of anti-fracture fabric\noverlap the new sheet over the existing sheet a\nminimum of 2”\nCreates a single surface to deter future reopening’s\nAllow surface to dry and proceed to X-Bond\nBrown Coat\nEnsures there are no imprints and the surface is\nready to receive the next step\n*X-Bond mixture: 1 part of X-Bond Liquid to 3 parts of X-Bond Stone\nX-BOND PROCEDURE\nCRACKS & CONTROL JOINTS (B) FLOORS / WALLS",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 315
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p29",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 29,
    "text": "29 2019.V03\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % of surface and loose surface Ensure proper bond to substrate\nROLLING APPLICATION\nUse a 1/2 nap roller.\nAllow any pre-treated areas to dry to the touch. Apply\na generous coat of Liquid Membrane with brush or\nroller over substrate including pre-treated areas.\nApply another generous coat of Liquid Membrane\nover the fi rst coat of Liquid Membrane . Let topcoat\ndry to the touch, approximately 1–2 hours at 70 °F\n(21 °C) and 50% RH. When last coat has dried to the\ntouch, inspect fi nal surface for pinholes, voids, thin\nspots or other defects. Liquid Membrane will dry\nto bright orange color when it’s dry to touch. Use\nadditional Liquid Membrane to seal the defects.\nRequired thickness is 3 mil\nSuitable of all sizes of installations, and ensures\nbest performance of the Liquid Membrane\nSPRAYING APPLICATION\nThe sprayer being used for the application of Liquid\nMembrane should be capable of producing a mini-\nmum of 2,500 psi (17.2), maximum of 3,300 psi (22.8\nMPa) with a \" ow rate of 0.95 to 1.6 GPM (3.6 to 6.0\nLPM) using a 0.521 or a 0.631 reversible tip. Keep the\nunit fi lled with Liquid Membrane to ensure con-\ntinuous application of liquid. The hose length should\nnot exceed 100’ (30 m) in length and 3/8” (9 mm) in\ndiameter. Required thickness is 3 mil\nReserved for exceptionally large areas, and ensures\nbest performance of the Liquid Membrane\nLIQUID MEMBRANE PROCEDURE FLOORS / WALLS FOR WATERPROOFING AND CRACK-MITIGATION",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 266
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p30",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 30,
    "text": "30 2019.V03\nX-BOND PROCEDURE / BROWN COAT FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1\nApply Primer Coat of X-Bond Liquid. Do not allow\nto dry\nEnsures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid, 1 part\nX-Bond Additive, mix this fi rst. Then add 2 1/2 parts\nX-Bond Stone, mix with Square Mixing Paddle at low\nspeed (180-200 RPM)\nAllows for the X-Bond application to be used as a\nbuild up coat, allows for a maximum thickness of 4”\nWhile the X-Bond Liquid is still tacky, pour the\nmixture to the far edge of surface\nEnsures clean fi nish application\nUsing a Gauge Rake spread the Brown Coat evenly\nto the desired thickness. Use a X-Bond smoother\nto even the surface. Spike shoes are recommended\nfor walking on X-Bond surface\nGauge Rake controls the thickness, and it is easy to\nuse for even spreading\nRemove tape before the surface is completely\ndry. Use red tape to mask o ff the bottom of\nshoe treads to walk on surface. Remove the\n1” of tape but do not sweep the debris. Then\nallow surface to totally dry and remove debris\nfrom the surface. Detail the edges as required\nand re-apply the tape before proceeding to\nnext step\nMakes tape easier to remove rather than\nwaiting till after product has dried\nAllow Brown Coat to dry for a minimum of 12 hours\n(depending on thickness)\nAllows product to fully cure. Ensures that it is\nthoroughly solid\n* SEMCO Brown Coat mixture required for the following circumstances:\n1. To level surface after anti-fracture membrane application\n2. When leveling a tile, VCT, textured or stamped surface, prior to fi nishing with X-Bond\n3. Any application from ¼ ” to 4”\n4. To fi ll any other voids in substrate over 1/8”\n5. For application over anti-fracture membrane in an application over wood\n6. To level transitions or di % erent hights in surfaces\nOPTIONAL*",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 326
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p31",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 31,
    "text": "31 2019.V03\nX-BOND PROCEDURE / POLISHED BOND FLOORS\nA\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - X-Bond mixing\nMix X-Bond Color Activator into the X-Bond Liquid Ensures integral color\nRoll colored X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts of\nX-Bond Stone, in this order, mix with Square Mixing Paddle at\nlow speed (180-200 RPM)\nEnsures proper consistency and prevents air from getting into\nthe mix for more working time\nSTAGE 2 - Skim coat application\nWhile the X-Bond Liquid is still tacky, pour the mixture to the\nfar edge of surface\nEnsures even fi nish application\nUsing a Trowel or X-Bond smoother for larger areas, tilt\nsmoother with the handle pointing to 10 o’clock, spread\nmaterial tightly, in ONE DIRECTION. Thickness is 1/16 or 2 mil\nOne direction\nAllow coat of X-Bond to dry slightly to the touch (20 -30 minutes)\nbefore applying second coat. Use shoe covers in between coats\nNeeds total of 1/8” (two coats, allow even and faster dry time\nand to maintain a consistency)\nOPTIONAL: to get a smoother surface, let the X-Bond dry\ncompletlely (2 - 4 hours) and then sand surface with 80 grit\nsand paper\nCreates a smoother surface to apply the micro bond,\nresulting in a fi ne pro fi le in the fi nish\nSTAGE 3 - Creating Polished Bond e ff ect\nMix MicroBond mixture: 1 part X-Bond Color to 2 parts of\nMicroBond in this order. Mix with Square Mixing Paddle at low\nspeed (180-200 RPM)\nEnsures the tools are ready for polishing procedure. Ensures\nproper consistency and prevents air from getting into\nthe mix for more working time\nPrime surface with a natural X-Bond (no X-Bond Color Activator\nin it). Pour the mixture to the far edge of the surface\nEnsures even application\nUsing a 10” Magic Trowel, tilt trowel with the handle pointing\nto 10 o’clock, spread material tightly, within a 3-4 feet radius.\nThickness is 1/32” or a maximum of 1/16”. Two coats required. (Do\nnot allow fi rst coat to dry completely). To achieve more e % ects on\nsurface, swirl Magic Trowel in di % erent directions\nCreates Polished Bond e % ect and color variations\nRemove tape before the surface is completely dry. Use\nred tape to mask o ff the bottom of shoe treads to walk on\nsurface. Remove the 1” of tape but do not sweep the debris.\nThen allow surface to totally dry and remove debris from\nthe surface. Detail the edges as required and re-apply the\ntape before proceeding to next step\nMakes tape easier to remove rather than waiting till after\nproduct has dried\nAllow to dry completely for at least 12 hours prior to sealing (get\nFinal Project Acceptance form signed o % ), in colder climates\nallow to dry for a minimum of 24 hours\nAvoids bubbles and ensures proper sealer application",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 499
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p32",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 32,
    "text": "32 2019.V03\nX-BOND PROCEDURE / NATURAL GRAIN FLOORS\nB\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - X-Bond mixing\nRoll X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts\nof X-Bond Stone, in this order, mix with square mixing\npaddle at low speed (180-200 RPM)\n(OPTIONAL) Use integral color with X-Bond Color Activator\nEnsures proper consistency and prevents air from getting\ninto the mix for more working time\nSTAGE 2 - Skim coat application\nWhile the X-Bond Liquid is still tacky, pour the mixture to the\nfar edge of surface\nEnsures even fi nish application\nUsing a Trowel or X-Bond smoother for larger areas, tilt\nsmoother with the handle pointing to 10 o’clock, spread\nmaterial tightly, in ONE DIRECTION. Thickness is 1/16 or 2 mil\nEnsures correct consistency of fi nish for Stage 3\nprocedure\nAllow coat of X-Bond to dry slightly to the touch (20-30 minutes)\nbefore applying second coat. Use shoe covers in between coats\nEnsures the surface is drying evenly\nRemove tape before the surface is completely dry. Use\nred tape to mask o ff the bottom of shoe treads to walk on\nsurface. Remove the 1” of tape but do not sweep the debris.\nThen allow surface to totally dry and remove debris from\nthe surface. Detail the edges as required and re-apply the\ntape before proceeding to next step\nMakes tape easier to remove rather than waiting till after\nproduct has dried\nAllow surface to dry completely prior to proceeding to the\nnext step (2-4 hours)\nEnsures nice fi nish\nSTAGE 3 - Creating Natural Grain e ff ect\nLightly sand the surface with a 60 grit sanding disk.\nClean all debris Removes excess texture\nUsing fi ne pump sprayer, spray light coat of Pre Stain Base\non to surface and avoid large drops. Work in 2 man teams\nside by side(1 with Pump Sprayer and 1 with HVLP)\nEnsures chemical reaction of Natural Grain e % ect\nWhile still wet apply Pre-Stain Color (Pre-Stain Base and\nPre-Stain Activator combined, always stir the contents,\navoid shaking) with an HVLP, airless sprayer with tip size\n17, or a sprayer that is capable of atomizing liquids. (DO\nNOT ALLOW PUDDLING)\nDo not shake to avoid in container reaction. No puddles\nfor even color, must spray with low pressure for a\npigment reaction\nMove across area from left to right as you work your\nway down the surface, avoid missing any areas of the\nsurface. Avoid stepping in Pre-Stain base\nEnsures the fi nish and color stay consistent\nThe Pre-Stain will then begin to dissipate and as the\nproduct forms to the contours of the X-Bond surface Chemical reaction creates the Natural Grain look\nAfter drying, check if any area requires touch up. If necessary,\nlightly fog Pre-Stain color over areas that require touch up Ensures a nice fi nish",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 492
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p33",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 33,
    "text": "33 2019.V03\nX-BOND PROCEDURE / COLOR BOND FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - X-Bond mixing\nMix X-Bond Color Activator into the X-Bond Liquid Ensures integral color\nRoll colored X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts of\nX-Bond Stone, in this order, mix with square mixing paddle\nat low speed (180-200 RPM)\nEnsures proper consistency and prevents air from getting\ninto the mix for more working time\nSTAGE 2 - Skim coat application\nWhile the X-Bond Liquid is still tacky, pour the mixture to\nthe far edge of surface\nEnsures even fi nish application\nUsing a trowel or X-Bond smoother for larger areas, tilt\nsmoother with the handle pointing to 10 o’clock, spread\nmaterial tightly, in ONE DIRECTION. Thickness is 1/16 or 2 mil\nEnsures pattern continues in one direction to maintain the\nColor Bond Finish\nAllow coat of X-Bond to dry slightly to the touch (20 -30\nminutes) before applying second coat. Use shoe covers in\nbetween coats\nEnsures the surface is drying evenly\nRemove tape before the surface is completely dry.\nUse red tape to mask o ff the bottom of shoe treads\nto walk on surface. Remove the 1” of tape but do not\nsweep the debris. Then allow surface to totally dry\nand remove debris from the surface. Detail the edges\nas required and re-apply the tape before proceeding\nto next step\nMakes tape easier to remove rather than waiting till\nafter product has dried\nAllow surface to dry completely prior to proceeding to the\nnext step (2-4 hours)\nEnsures nice fi nish\nSTAGE 3 - Finish\n(OPTIONAL) If a smoother surface is desired use SEMCO\nMicroBond (mix ratio: 1 part X-Bond Liquid to 2 parts\nMicroBond Stone) with a Magic trowel prior to color\napplication. Prime surface with X-Bond Liquid before\napplying Micro Bond\nCreates a smoother fi nish and two tone e % ect\n(OPTIONAL) Apply Pre-Stain with HVLP, airless sprayer with\ntip size 17, or a sprayer that is capable of atomizing liquids\nSolidi fi es surface coloring as desired\nHold the gun with tip size 17 approximately 18” away from\nsurface and spray as desired\nEnsures even spread / application of color\nSpray even overlapping coats, for a more transparent fi nish\nspray 2 coats of Pre-Stain Color, for a very opaque fi nish\nspray Colour Coat, up to 7 coats\nConsistency to maintain the Color Bond Finish\nC",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 421
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p34",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 34,
    "text": "34 2019.V03\nX-BOND PROCEDURE / ADA SAFETY FLOOR FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - X-Bond mixing\nMix X-Bond Color Activator into the X-Bond Liquid Ensures integral color\nRoll colored X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts of X-Bond Stone,\nin this order, mix with Square Mixing Paddle at low speed (180-200 RPM)\nEnsures proper consistency and prevents air from getting into the\nmix for more working time\nSTAGE 2 - Skim coat application\nWhile the X-Bond Liquid is still tacky, pour the mixture to the far edge of surface Ensures even fi nish application\nUsing a Trowel or X-Bond smoother for larger areas, tilt smoother\nwith the handle pointing to 10 o’clock, spread material tightly, in ONE\nDIRECTION. Thickness is 1/16 or 2 mil\nEnsures pattern continues in one direction to maintain even and\nsmooth fi nished surface\nAllow coat of X-Bond to dry slightly to the touch (20 -30 minutes) before\napplying second coat. Use shoe covers in between coats\nNeeds total of 1/8” (two coats, allow even and faster dry time and to\nmaintain a consistency)\nSTAGE 3 - X-Bond mixing for textured coat\nDO NOT apply primer coat of X-Bond Liquid Not required to avoid splattering of the X-Bond mixture\nMix X-Bond mixture 1 part X-Bond Liquid to 2 parts of X-Bond Stone,\nin this order, and mix with square mixing paddle at low speed (180-\n200 RPM), SEMCO X-Bond Color Activator can be added\nEnsures proper consistency and prevents air from getting into the\nmix for more working time\nSTAGE 4 - Creating textured coat\nSet up compressor, using an air gauge set the air pressure to 15 PSI.\nPour X-Bond mixture into hopper gun in small amounts. Use 4mm\nnozzle. Test spray to gauge consistency in small area prior to working\non surface\nToo much air will cause splatter instead of mineral fi nish consistency\nHold the gun parallel to the surface (do not angle the sprayer to spray directly\non to surface). Allow X-Bond to land on the surface evenly. Spray at a distance\nof 3-5’ from the area where X-Bond mixture is desired to be applied\nEnsures the X-Bond does not splatter as it hits the surface\nUsing a scrub machine with a sanding disc attachment, sand the surface with\n36 grit sandpaper until surface has profile of a 60 grit sandpaper, use a sanding\nstone for smaller areas and corners. Remove all debris after sanding\nTo ensure proper surface texture. Provides an easy way to maintain\nsurface, and that surface meets ADA Coe # cient or Friction\nRequirements\nSTAGE 3 - Multicolor OPTION\nFor multicolored applications repeat step per color, ensure to sweep surface\nclean prior to repeating Stage 2\nAesthetics\nBe sure to clean equipment between each color Ensures consistent color\nRemove tape before the surface is completely dry. Use red tape\nto mask o ff the bottom of shoe treads to walk on surface. Remove\nthe 1” of tape but do not sweep the debris. Then allow surface to\ntotally dry and remove debris from the surface. Detail the edges\nas required and re-apply the tape before proceeding to next step\nMakes tape easier to remove rather than waiting till after product\nhas dried\nRemove excess X-Bond mixture debris 100% from surface with a\nBroom, prior to applying optional second coat of X-Bond or sealers\nAvoids sealing any loose unbinded particles that may cause\npremature surface degradation\nD",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 593
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p35",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 35,
    "text": "35 2019.V03\nWALLS\nE\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - X-Bond mixing\nRoll X-Bond Liquid as primer coat. Do not allow to dry Ensures molecular bond with X-Bond mixture\nMix X-Bond mixture*: 1 part of X-Bond Liquid to 3\nparts of X-Bond Stone, in this order, and mix with\nsquare mixing paddle at low speed (180-200 RPM),\nSEMCO X-Bond Color Activator can be added\nEnsures proper consistency and prevents air from\ngetting into the mix for more working time\nSTAGE 2 - Application and visual appearance\nPlace X-Bond mixture* on to a plaster hawk, then move\na portion of the mixture to a stainless steel pool trowel\nand apply evenly, bottom-up, to the vertical surface\nEnsures easy wall application\n(OPTIONAL SPRAY TECHNIQUE) U se X-Bond texture\nsprayer at 15 PSI with large tip. Pour X-Bond mixture* into\nhopper gun. Test spray to gauge consistency in small\narea prior to working on surface. Spray from the bottom,\nup when applying fi nish coats\nSpeeds up the application. Use only on exterior or\nunoccupied project\nSecond coat can be applied while X-Bond surface is still\ndamp. Utilize procedure above. Use stainless steel trowel\nto spread the X-bond mixture* evenly. To get smooth\nfi nish (before X-Bond surface is dry) use a Polished Trowel\nto agitate the surface with damp trowel to get a cream\nand apply over surface\nAchieves the surface consistency\nRemove tape before the surface is completely dry.\nUse red tape to mask o ff the bottom of shoe treads\nto walk on surface. Remove the 1” of tape but do\nnot sweep the debris. Then allow surface to totally\ndry and remove debris from the surface. Detail the\nedges as required and re-apply the tape before\nproceeding to next step\nMakes tape easier to remove rather than\nwaiting till after product has dried\n(OPTIONAL ULTRA SMOOTH SURFACE) To obtain\nan ultra smooth surface use SEMCO MicroBond\nmixture**. Spread evenly with a with a Magic trowel\n(2 coats) , if needed use 200-grit sandpaper to\nsmoother surface\nFills in surface texture for smoother fi nish\n*X-Bond mixture: 1 part of X-Bond Liquid to 3 parts of X-Bond Stone\n**MicroBond mixture: 1 part of X-Bond Liquid to 2 parts of MicroBond\nX-BOND PROCEDURE / VERTICAL SURFACE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 379
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p36",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 36,
    "text": "36 2019.V03\nSURFACE COLOR & FINISHING 8. Counter and Table Top\n10. Diamond Grind Polished\n11. Wood Color Seal\n9. Color, Hardener and Sealer\nProject Name:\nProject Location:\nSurface Area: Total duration: Crew:\n1. Obtain a Final Approval Sign O ff prior to applying the fi nish coat.\n2. Remove all tape and detail the edges prior to applying the fi nish coat.\n6. Inside Pool and Jacuzzi\n7. Shower Pan and Balcony\nRemove Tape Detail\nFlat fi nish X-Crete 500 & Natural Shield\nX-Crete 400, Matte & Non Skid\nX-Tra Gloss & Non Skid\nXtreme Gloss\nColour Coat Matte & Non Skid\nSatin Stone Color & Non Skid\nColor Gloss, Matte & Non Skid\nCrystal Coat Gloss or Matte\nColor Green Sealer, Densi fi er & Color\nColor Grain Seal, Preserve & Color\nSEMCO FINISH:\nA. FLAT FINISH:\n1. Natural Shield:\nWater based sealer.\n2. X-Crete 500: Mineral\nbased sealer (ideal for\nbelow grade and solvent\nprotection).\n3. Interior and exterior use.\nB. MATTE/GLOSS:\n1. X-Crete 400 Gloss or\nMatte: (non-skid additive\navailable).\n2. Crystal Coat\n(matte and non skid\nadditives available).\n3. Interior and exterior use.\nC & D. HIGH/\nDEEP GLOSS:\n1. Xtra Gloss (semi-gloss\nand non-skid additives\navailable) - interior and\nexterior use.\n2. Xtreme Gloss -\nfor interior use only.\n3. Crystal Coat\nE. SATIN STONE:\n1. Satin Stone is industrial\nSatin Finish Sealer\n(available in color and\nwith non-skid additive)\n- interior and\nexterior use.\nH. COLOUR COAT &\nCOLOR GLOSS:\n1. Color, Hardener and\nSealer All in One.\n2. Colour Coat water\nbased product.\n3. Color Gloss solvent\nbased product ideal for\ngoing over sealed surfaces.\nG. COLOR GREEN:\n1. Densi fi er.\n2. Coloring System.\n3. Concrete densi fi er can\nbe applied to freshly\npoured \"green\" concrete.\nF. WOOD FINISH:\n1. Color Grain (Coloring\nSystem, Preservation, and\nProtection).\n2. Interior and exterior use.\n1. Polished Bond\n2. Natural Grain\n3. Color Bond\n4. ADA Safety Floor\n5. Vertical Surface",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 328
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p37",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 37,
    "text": "Satin Stone ( optional - Non-Skid Additive and/or Color Activator )\nCrystal Coat ( optional - Matte Additive ) X-Tra Gloss ( optional - Solvent Matte ad/or Non-Skid Additives )\nExtreme Gloss A+B Colour Coat \" # Color Gloss \" #\nX-Crete 500 Natural Shield Natural Stain\noptional - Matte Additive\noptional -Non-Ski Additve optional - Matte Additive\noptional -Non-Ski Additve\nsemcosurfaces.com\nSEMCO Integration Program\n37 2019.V03\nSATIN\nOptional Matte\nand/or Color\nFLAT COLOR\nGLOSS\nOptional Matte\nand/or Non-Skid\n+ +\n+\n+\n+\n+\n+\n+\n+\n+ +\n+ +\nHIGH\nGLOSS\nOptional Matte\nor Non-Skid\nXTREME\nGLOSS\nCOLOR & FINISHING\nMATERIALS\nX-Crete 400 ( optional - Matte ad/or Non-Skid Additives )",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 114
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p38",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 38,
    "text": "Extension cord Metal pump spray\nX-Crete 400, X-Tra Gloss & Xtreme Gloss gauge level\nMagic trowel Squeegee 1/16” notch\nExtension pole\nMicro applicator\nfor applying Crystal Coat for Xtreme Gloss air release\ntip size 15, 17 & 21\nSpiked roller\nAirless sprayer\n1/2 gal. and 1/4 gal.\nmeasuring containers\nHVLP\nWoven roller set Permanent marker Mixing drill Satin Stone\nmixing paddle\n1 gal. or 2 gal. empty\ncontainer for mixing\nsemcosurfaces.com\nSEMCO Integration Program\n38 2019.V03\nCOLOR & FINISHING\nTOOLS AND SUPPLIES",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 82
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p39",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 39,
    "text": "semcosurfaces.com 39 2019.V03\nCOLOR PROCEDURE / NATURAL STAIN FLOORS/WALLS\n√ TASK / PROCEDURE\nSTAGE 1 - Surface preparation\nSweep debris o % surface and loose surface\nRemoval of any contaminants, unwanted stains, or sealers will be necessary prior to application\nTo ensure maximum penetration of Natural Stain the surface will need to be at 6.9 – 7.8 pH level\nVERY IMPORTANT: Upon receiving the Natural Stain, DO NOT SHAKE THE CONTENTS , briskly stir until\nall \" uids are of an equal consistency\nSTAGE 2 - Application\nRoller application: use a 1/4 inch nap roller. Pour the Natural Stain into a roller pan, avoid dipping roller\ninto container as with continued use the roller may contaminate the Natural Stain with unwanted debris\nor dried residue\nSprayer application: An HVLP or airless sprayer can be used. For HVLP’s manipulation of volume and air\ncan be adjusted to best meet the requirements of the fi nish. For an airless sprayer a tip size 17 will yield\nthe best results. Run clean water through sprayer to avoid clogging or curing of product within sprayer\nInitial coat: roll or spray even coat across the surface, ensure to back roll/spray 25% over the each\npreviously rolled/sprayed area. Application of the Natural Stain in heavier coats may result in a darker\ncolor fi nish, alternatively lighter coats will also result in a lighter color fi nish\nConsecutive coats: Once surface is dry to the touch an additional coat may be applied. It is important\nto adhere to the same principle of heavier will equal darker, and less will equal to lighter as stated in the\ninitial application. It is recommended to not exceed 8 coats\nVERTICAL APPLICATION\nVertical applications can be achieved with the same procedures as described above. It is important not\nto over saturate the surface. Runs of the Natural Stain will not disappear and will remain present. If this\ndoes occur, use SEMCO Power Cleaner at a ratio of 1:4 (Power Cleaner to water) to remove excess or an\nunwanted e % ect\nAdditional notes:\nNatural Stain contains a weather-proof sealer however in instances of foot tra # c it is recommended to apply the\nSEMCO Natural Shield for a \" at fi nish or X-Crete 400 for a semi gloss fi nish. In the event of vehicle tra # c SEMCO Satin\nStone for a satin fi nish, or Xtra Gloss for a gloss fi nish can be applied to protect the surface and Natural Stain from\npremature wear.\nLASTING COLOR FOR CONCRETE SURFACES",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 422
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p40",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 40,
    "text": "semcosurfaces.com 40 2019.V03\nFINISHING PROCEDURE / FLAT FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface and loose surface No debris in sealer\nUse Natural Shield (water-based penetrating\nsealer)\nCreates \" at fi nish:\n1. Penetrating seal w/ chemical reaction\n2. Waterproof\n3. Moisture mitigation\nSTAGE 2 - Sealer application\nApply the sealer with a 1/4” nap roller, HVLP\nsprayer, pump sprayer, or airless sprayer with tip\nsize 17. Minimum of 3 coats are required to ensure\nmaximum performance\nEnsures proper application. Does not allow to\npuddle, will create a white haze if puddled\nApply the fi rst coat and DO NOT ALLOW THE\nSEALER TO DRY BEFORE APPLYING SECOND\nAND THIRD COATS . Do not allow to puddle\nEnsures penetration. If sealer dries before\nadditional coats it may not bond properly\nRepeat the application to a minimum of 3 coats.\nAdditional coats may be required depending on\nthe porosity of the surface (X-Bond requires, 3\ncoats only, other surfaces such as concrete or block\nmay require additional coats)\nAvoids hazing - ensures penetration\nVERTICAL APPLICATION\nApply the sealer with a 1/4” nap roller, HVLP\nsprayer, or airless sprayer with tip size 15. Start\napplication from bottom to top to avoid runs in the\nsealer. Avoid overspraying. Minimum of 3 coats is\nrequired to ensure maximum performance.\nEnsures proper sealing application, avoids runs in\nthe sealer\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 100 °F Allows penetration and avoids product\ndrying on surface before penetrating surface\n• Allow surface to cure for a minimum of 48 hours before cleaning. Maximum strength achieved in 7 days\nA",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 285
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p41",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 41,
    "text": "semcosurfaces.com 41 2019.V03\nWATER CONTAINMENT / FLAT FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface and loose surface No debris in sealer\nUse X-Crete 500 (solvent-based penetrating sealer) Creates \" at fi nish:\n1. Penetrating seal w/ chemical reaction\n2. Waterproof/hydrophobic e % ect\n3. Moisture mitigation\n4. Anti-gra # ti\nSTAGE 2 - Sealer application\nApply the sealer with a 1/4” nap roller, HVLP\nsprayer, pump sprayer, or airless sprayer with tip\nsize 17\nEnsures proper application. Does not allow to\npuddle, will create a white haze if puddled\nRepeat the application to a minimum of 4 coats.\nAdditional coats may be required depending on\nthe porosity of the surface (X-Bond requires, 3\ncoats only, other surfaces such as concrete or block\nmay require additional coats)\nAvoids hazing - ensures penetration\nVERTICAL APPLICATION\nApply the sealer with a 1/4” nap roller, HVLP\nsprayer, or airless sprayer with tip size 15. Start\napplication from bottom to top to avoid runs in the\nsealer. Avoid overspraying. Minimum of 3 coats is\nrequired to ensure maximum performance.\nEnsures proper sealing application, avoids runs in\nthe sealer\nA POOLS, FOUNTAINS, ANTI-GRAFFITI",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 199
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p42",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 42,
    "text": "semcosurfaces.com 42 2019.V03\nFLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures there will be no debris in the sealer\nX-Crete 400 Gloss or (OPTIONAL) mix X-Crete 400 Gloss with\nMatte Additive for desired sheen e % ect\nSingle Matte Additive will reduce to a Satin Finish, or double\nMatte Additives will provide similar to Eggshell Finish\n(OPTIONAL) X-Crete 400 Gloss + Non-Skid Additive = X-Crete\n400 Non-Skid\nAdds non-slip properties to the surface / enhances coe # cient\nof friction\nSTAGE 2 - Sealer application and maintenance coat\nUse a Magic trowel application for standard application for\nminimum 0.5 ml thickness per coat\nTo spread and allow the product penetrate 30 % of the\nsurface build up .5 mil per coat (minimum 3 coats)\nPour the product on surface. Use the Magic trowel to spread\nthe X-Crete 400\nProvides consistency and to avoids puddles\nApply the fi rst coat and allow the sealer to dry for at least 30\nminutes , up to 2 hours in high humidity conditions, or until\nsurface is completely dry\nAvoids trapping moisture, allows vapor to escape, faster\ncuring, and avoids white hazing\nRepeat the application to a minimum of 3 coats. Additional\ncoats may be required depending on the porosity of the surface\n(X-Bond 3 coats only, other surfaces such as concrete or block\nmay require additional coats)\nEnsures proper curing and even coverage\nFor larger areas X-Crete 400 Non-Skid can be applied with\nairless sprayer with tip size 21. Adjust sprayer to the lowest\npossible air setting\nEnsure faster application for larger areas and expedited\ncompletion\nAfter the fi nal coat of X-Crete 400 apply 3 coats of the Crystal\nCoat using micro fi ber pad with matching additives to the\nX-Crete 400. Follow the same instructions\nCrystal Coat provides long lasting surface protection.\nDO NOT apply in wet areas\nVERTICAL APPLICATION\nApply the X-Crete 400 with a micro fi ber pad or HVLP\nsprayer and use micro fi ber pad to spread material evenly. Start\napplication from top to bottom to avoid runs. Minimum of 3\ncoats is required to ensure maximum performance, avoid\noverspraying a section\nEnsures proper sealing application, avoids runs in the sealer\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 100 °F. Avoids \" ash drying or freezing on the surface\n• Allow surface to cure for a minimum of 48 hours before cleaning with water to avoid damage to the sealer before curing\nFINISHING PROCEDURE / MATTE & GLOSS B",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 433
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p43",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 43,
    "text": "semcosurfaces.com 43 2019.V03\nFINISHING PROCEDURE / HIGH GLOSS FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures there is no debris in the sealer\nX-Tra Gloss or (OPTIONAL) X-Tra Gloss mixed with\nSolvent Matte Additive for matte fi nish\nCreates gloss, matte and non-skid fi nish\nSTAGE 2 - Sealer application and maintenance coat\nX-Tra Gloss can be applied with an airless sprayer\nwith tip size 21, adhesive roller, or with an Magic\ntrowel\n21 tip for the airless ensures proper volume, Magic\ntrowel and adhesive rollers will not disintegrate\nwith solvents\n(OPTIONAL) Use X-Tra Gloss Reducer to retard\ndrying time. No more than 1 pint of reducer to each\n1 gallon of X-Tra Gloss\nFor warmer temperature application and fi ner\nconsistency for when using a sprayer\nApply the sealer in one direction, when moving\nforward slightly overlap 4\" the previous application.\nAllow to dry 35-45 minutes prior to additional coat\nAvoids lines in the sealer\nRepeat the application to a minimum of 3 coats.\nAdditional coats may be required depending on the\nporosity of the surface (X-Bond 3 coats only, other surfaces\nsurface as concrete or block may require additional coats)\nEnsures complete coverage\nAfter the fi nal coat of the X-Tra Gloss apply 3 coats\nof the Crystal Coat with a micro fi ber pad\nCrystal Coat provides long lasting surface\nprotection\nVERTICAL APPLICATION\nApply the sealer with an X-Tra Gloss roller, HVLP\nsprayer or airless sprayer with tip size 21. Start\napplication from top to bottom to avoid runs in the\nsealer (OPTIONAL) Use X-Tra Gloss Reducer to retard\ndrying time. No more than 1 pint of reducer to each 1\ngallon of X-Tra Gloss. Minimum of 3 coats is required\nEnsures maximum performance, avoids runs in the\nsealer\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 100 °F. Avoids \" ash drying or freezing on the surface\n• Allow surface to cure for a minimum of 48 hours before cleaning with water to avoid damage to the sealer before curing\n• Maximum cure time is 72 hours at 75% humidity\nC",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 365
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p44",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 44,
    "text": "semcosurfaces.com 44 2019.V03\nFINISHING PROCEDURE / XTREME GLOSS FLOORS\nD\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures there is no debris in the sealer\nUse Xtreme Gloss (for interior use only) Creates deep gloss fi nish for commercial \" oors,\nkitchens, medical and industrial spaces\nSTAGE 2 - Sealer mixing\nMix 2 parts of Part A and 1 part of Part B (included\nin your product order) with a low speed mixer\nand speci fi ed low air paddle, stirring thoroughly,\navoid mixing more product than can be applied.\nProduct pot life is 15 – 25 minutes depending on\ntemperature (MIX SMALL BATCHES ONLY)\nLow speed mixture, less air in mix reduces dry time\nto avoid wasted product\nFLOORS - Sealer application\nPour Xtreme Gloss to the surface and use a\nsqueegee with a 1/16 notch or 2 mm gauge rake\nSpreads properly and ensures consistent thickness\nPull the Xtreme Gloss evenly across the surface, back roll\nwith spiked roller and use Magic trowel to smooth ridges\nAllows product to self level and avoids bubbles\nTo apply over ADA Safety Floor pour Xtreme\nGloss on surface, use sqeezee to spread the\nproduct evenly and than back roll\nSpreads product properly and ensures consistent\nthickness\nVERTICAL APPLICATION\nApply the Xtreme Gloss with a woven 3/8” roller from\nbottom up. Use a magic trowel to spread the product.\nStart from top to bottom, use a spiked roller to back\nroll the entire area. Minimum of 2 coats required. Do\nnot let previous coat dry all the way\nMinimum of 2 coats ensures maximum\nperformance. Spiked roller ensures that all gassing\nbubbles are eliminated\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 85 °F. Avoids \" ash drying or freezing on the surface\n• Allow surface to cure for a minimum of 6 hours before allowing foot tra # c to avoid damage to the sealer before curing\n• Mix small batches. Do not allow any product to remain in bucket once mixed\n• When mixing batches ensure full 1:2 ratios by scraping all material out of measuring cups with a stick or spatula\n• For interior use only. Do not expose to UV\n• Full cure at 7 days at 75% humidity",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 390
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p45",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 45,
    "text": "semcosurfaces.com 45 2019.V03\nFINISHING PROCEDURE / SATIN STONE FLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures there is no debris in the sealer\nUse Satin Stone (for interior and exterior surfaces) Creates natural satin fi nish for commercial \" oors and\nwalls, kitchens, medical and industrial spaces\nSTAGE 2 - Sealer mixing and application\nMix 2 parts of Part A and 1 part of Part B (included\nin your product order) with a low speed mixer\nand speci fi ed low air paddle, stirring thoroughly,\navoid mixing more product than can be applied.\nProduct pot life is up to 35 minutes depending on\ntemperature (MARK TIME ON CONTAINER)\nLow speed mixture, less air in mix reduces dry time\nto avoid wasted product. Since product is water-\nbase will not get hard in container\nUse airless sprayer with tip size 21 at 850-1,000 PSI. Position\nthe airless sprayer gun at 18” away from the floor\nSmaller tip size and high pressure can cause a lot\noverspray. Allows product to lay down evenly on\nthe surface\nOPTIONAL: use magic trowel to spread the product.\nDo not go back and forth\nAllows product to lay down evenly on the surface\nMinimum of 3 coats is required to ensure 1.5 mil\nfi lm thickness\nEnsures long lasting surface protection from\nindustrial and commercial vehicle and foot tra # c\nVERTICAL APPLICATION\nApply Satin Stone with a woven 1/4” nap roller and\nuse Magic trowel to spread it evenly. Start from top\nto bottom. Use HVLP with a large tip to apply Satin\nStone on large surface areas\nEnsures maximum performance on vertical\nsurfaces\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 90 °F. Ensures proper set time and allows to\ncure from the inside (no hazing)\n• Allow surface to cure for a minimum of 48 hours before allowing foot tra # c to avoid damage to the sealer before curing\n• Mix small batches. Write down time on container to ensure product usability\n• When mixing batches ensure full 1:2 ratios by scraping all material out of measuring cups with a stick or spatula\n• Clean your tools and equipment with SEMCO Stone Soap and water\n• Full cure at 7 days at 75% humidity\nE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 393
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p46",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 46,
    "text": "semcosurfaces.com 46 2019.V03\nFINISHING PROCEDURE / COLOR GRAIN FLOORS / WALLS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nHand-sand all wood surfaces with a fi ne, 180-grit\nsandpaper, until all shine disappears (coarser grit\npaper will remove more than necessary). Use 80 to\n120-grit sandpaper to smooth imperfections such\nas heavy globs of a previous coating\nRemoves contaminants, and prepares surface to\nreceive Color Grain\nSweep debris o % surface Ensures there is no debris on the surface\nSTAGE 2 - Application\nApply Color Grain using an airless sprayer with\ntip size 15, fi ne pump sprayer, or 3/4” nap roller.\nCould be applied with color or clear (to enhance\nthe natural color and beauty of the wood and/or to\nwaterproof the wood)\nEnsures best consistency and dispersion of Color\nGrain\nApply Color Grain in the same direction as the\nwood’s grain\nFor maximum color consistency and best fi nish\naesthetic\nRepeat 2 - 3 times for a more opaque fi nish. When\napplying the Color Grain without color\nSolid color fi nish appearance\nAdditional tips:\n• Multiple coats may be applied to reach desired color or waterproo fi ng\n• For waterproo fi ng number of coats will be dependent upon porosity of wood surface. Additional coats may\nbe applied until rejection of water occurs\n• Avoid oversaturating the surface since it can cause inconsistent results\nF",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 234
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p47",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 47,
    "text": "semcosurfaces.com 47 2019.V03\nFINISHING PROCEDURE / COLOR GREEN FLOORS / WALLS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures removal of all topical debris\nAPPLICATION FOR “GREEN” CONCRETE\nSpray Color Green with pump sprayer, HVLP or\nairless sprayer with tip size 17. When spraying apply\nthe Color Green heavily. Approximate coverage per\ngallon is 200 sq ft\nEnsures proper and consistent coverage, heavy\napplication of the Color Green will retard the\ndehydration of the concrete, in addition densify\nthe concrete during curing\nAPPLICATION FOR CONCRETE POLISHING\nStart with the initial sheering of the concrete, and\nproceed though the standard polishing with a\n50, 200 grit diamond pad. Dry or wet application\nis at the contractors’ discretion; however prior to\nproceeding with the following step please ensure\nthat the surface is dry and free of moisture\nOpens the concrete substrate, standard\nincremental procedures for achieving a high\nquality concrete polishing fi nish\nUpon completing the 200 grit stage apply the Color\nGreen to the surface using a pump sprayer, HVLP or\nairless sprayer with tip size 17. Avoid overspraying\nColor Green to avoid oversaturation or puddling\nThis will enable the best penetration of the color,\nhardener, and densi fi er\nAllow the Color Green to dry (4-6 hours) depending\non weather conditions (4 hours for hot conditions\nand 6 hours for cooler conditions)\nProper curing will ensure maximum color value,\nand strength in the fi nish\nProceed with remaining concrete polishing stages\nup to 3,000 grit. DRY POLISHING ONLY. Use a\nbu % diamond polishing pad as the fi nal fi nish.\nOnce fi nished you will have a surface with exposed\naggregate and semi transparent color fi nish\nDry polishing is preferred, because it does not\nintroduce moisture\n(OPTIONAL) To achieve an opaque/solid color\nconsistency, apply the Color Green one additional time\nafter completing the fi nal stage of polishing, do not\noverspray Color Green to avoid saturation or puddling.\nIf you are planning for a semi gloss fi nish complete\npolishing with 1,500 grit, for a high gloss complete\npolishing with 3,000 grit, once done, apply one coat\nof the Color Green. Allow surface to dry (2-4 hours),\ndepending on weather conditions. Polish surface with a\nresin bu # ng pad to complete the application\nCreates an opaque fi nish, will mask the majority of\nexposed aggregate\nG",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 400
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p48",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 48,
    "text": "semcosurfaces.com 48 2019.V03\nFINISHING PROCEDURE /\nCOLOUR COAT & COLOR GLOSS FLOOR\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nCOLOUR COAT\nSweep debris o % surface Ensures there is no debris in the sealer\nApply the Colour Coat with a short nap roller, HVLP\nsprayer, or airless sprayer with tip size 21\nEnsures that the product is applied evenly\nthroughout the surface\nApply the fi rst coat and allow the sealer to dry for\nat least 30 minutes or until surface is dry\nEnsures proper adhesion prior to proceeding to\nfurther coats\nRepeat the application to a minimum of 3 coats.\nAdditional coats may be required depending on\nthe porosity of the surface (X-Bond 3 coats only,\nother surfaces such as concrete or block may\nrequire additional coats)\n3 coats ensures that the surface is evenly colored\nand fully sealed\nCOLOR GLOSS\nSweep debris o % surface Ensures there is no debris in the sealer\nApply the Color Gloss with a HVLP sprayer or airless\nsprayer with tip size 21\nEnsures that the product is applied evenly\nthroughout the surface\nApply the fi rst coat and allow the sealer to dry for\nat least 30 minutes or until surface is dry\nEnsures proper adhesion prior to proceeding to\nfurther coats\nRepeat the application to a minimum of 3 coats.\nAdditional coats may be required depending on\nthe porosity of the surface (X-Bond 3 coats only,\nother surfaces surface as concrete or block may\nrequire additional coats)\n3 coats ensures that the surface is evenly colored\nand fully sealed\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 90 °F\n• COLOR COAT: Avoid heavy tra # c on the surface for a minimum of 12 hours after the fi nal coat and avoid\nwater or other chemicals to make contact for a minimum of 72 hours\n• COLOR GLOSS : Avoid heavy tra # c on the surface for a minimum of 6 hours after the fi nal coat and avoid\nwater or other chemicals to make contact for a minimum of 24 hours\n• Avoid oversaturating the surface since it can cause inconsistent results\nH",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 363
  },
  {
    "id": "doc-open-sip-manual-master-copy-v2019-3-2-p49",
    "docId": "doc-open-sip-manual-master-copy-v2019-3-2",
    "pageNumber": 49,
    "text": "semcosurfaces.com 49 2019.V03\nFLOORS\n√ TASK / PROCEDURE PURPOSE / BENEFIT\nSTAGE 1 - Removal of debris\nSweep debris o % surface Ensures there is no debris in the sealer\nSTAGE 2 - Application\nUse a Micro application pad for standard\napplication. Minimum 3 coats\nSpreads and distributes product evenly over the\nsurface\nDip the Micro pad into 24” pan fi lled to 1” of the\nCrystal Coat\nEvenly coats the micro application pad\nLightly stain the pad and place it directly to the\nsurface, moving in one direction\nEnsures that surface is coated evenly\nApply the fi rst coat and allow the sealer to dry for\nat least 30 minutes or until surface is dry\nEnsures proper adhesion prior to proceeding to\nfurther coats\nRepeat the application for a minimum of 3 coats.\nAdditional coats may be required depending on\nthe porosity of the surface\n3 coats ensures that the surface is evenly and fully\nsealed\nAdditional tips:\n• Only apply product when the air temperature is above 45 °F or below 90 °F. Ensures proper set time and allows\nto cure from the inside (no hazing)\n• Allow surface to cure for a minimum of 48 hours before allowing foot tra # c to ensure full chemical cure\nFINISHING PROCEDURE / CRYSTAL COAT MAINTENANCE & CARE",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "title": "Open SIP manual master copy  3 2",
    "category": "SIP manual",
    "wordCount": 218
  },
  {
    "id": "doc-polished-bond-steps-p1",
    "docId": "doc-polished-bond-steps",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n20 22 .V01\nPOLISHED BOND\nSTEP 2 - X-BOND SEAMLESS STONE\nEXISTING SUBSTRATE\nSTEP 3 - FINISHING\nSTEP 1 - PREPARATION OF EXISTING SUBSTRATE\nAPPLICATION IN 3 EASY STEPS\nFLAT\nSEMCO X-Crete 500\nSEMCO Natural Shield\nMATTE/GLOSS\nSEMCO X-Crete 400\nSEMCO Titan Shield\nHIGH GLOSS\nSEMCO Xtra Gloss\nCrystal Coat\nDEEP GLOSS\nSEMCO Xtreme Gloss\nCrystal Coat\nFINISH\nSCRATCH COAT\nSEMCO LIQUID MEMBRANE™\nwith fabric reinforcement\n+ BROWN COAT\n(OPTIONAL)\nX-BOND SEAMLESS STONE\nPOLISHED BOND\nSATIN\nSEMCO Satin Stone\nTYPE A\nSEMCO All Purpose\nCleaner\nTYPE B\nSEMCO Commercial\nCleaner\nTYPE D\nSEMCO Mineral\nCleanser\nTYPE E\nOver Wood\nTYPE C\nSEMCO Industrial\nCleaner and Degreaser",
    "sourceDocument": "Polished-Bond-Steps.pdf",
    "title": "Polished Bond Steps",
    "category": "Technical doc",
    "wordCount": 118
  },
  {
    "id": "doc-pool-deck-resurfacing-detail-p1",
    "docId": "doc-pool-deck-resurfacing-detail",
    "pageNumber": 1,
    "text": "1. Existing substrate\n2. Preparation Type C on substrate to balance pH level\n3. X-Bond Scratch Coat\n4. Liquid Membrane™ with fabric reinforcement\nover joints\n5. X-Bond Brown Coat (up o 3/4”)\n6. X-Bond Microcement - Solid, Vellum, ADA Safety\nSurface\n7. Sealers - Natural Shield, Satin Stone, Titan Shield\nGloss with Non-Skid (3 coats)\nTotal thickness 1/4” to 1”\n3 2 4 5\n1\n6 7\nSEMCO\nLIQUID MEMBRANE ™\nwith fabric reinforcement\nX-BOND\nMICROCEMENT\nSolid, Vellum, ADA Safety Surface\nFINISH\nNatural Shield, Satin Stone,\nTitan Shield Gloss with Non-Skid\nBROWN COAT\nup to 3/4”\nExterior application\nPOOL DECK\nRESURFACING DETAIL\n2025 .V6 * Drawings are not to scale\n3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\nFLOORS | WALLS | POOL DECKS | WATERPROOFING\nREDEFINING THE ART OF SURFACE CREATIVITY FOR OVER 25 YEARS USING GREEN MATERIALS\nPREPARATION - TYPE C\nSEMCO Commercial Cleaner\nSCRATCH COAT\nEXISTING\nSUBSTRATE",
    "sourceDocument": "Pool-Deck-Resurfacing-Detail.pdf",
    "title": "Pool Deck Resurfacing Detail",
    "category": "Technical doc",
    "wordCount": 154
  },
  {
    "id": "doc-pool-resurfacing-detail-interior-below-grade-p1",
    "docId": "doc-pool-resurfacing-detail-interior-below-grade",
    "pageNumber": 1,
    "text": "Interior below grade application\nPOOL RESURFACING DETAIL\n1. Existing substrate - concrete\n2. Preparation Type C on substrate to balance pH level\n3. Scratch Coat\n4. SEMCO Liquid Membrane™ - 4 coats, each coat 15\nmil. Total thickness - 60 mil (4 coats). Let each coat\ndry before applying next coat.\n5. Scratch Coat\n6. OPTIONAL : X-Bond Brown Coat\n7. X-Bond Microcement - apply in different layers to a\ntotal thickness of 1/4” (about 6 mm). X-Bond layers\ndo not need to be dry before applying next coat.\n8. Natural Shield - apply with sprayer or roller 4 even\nlayers. After application of the first coat apply the\nproceeding coats prior to full dry. Yield per 1 gallon\nis 175 sq ft for a 4-coat application. Allow the\nsurface to cure to a rH of greater than 75% and\nat least 7 days prior to filling with water.\nTotal system thickness - 7.5 mm (approx)\n1/4” X-Bond + 60 mil SEMCO Liquid Membrane™\nSEMCO\nLIQUID MEMBRANE ™\nX-BOND\nMICROCEMENT\nPREPARATION - TYPE C\nSEMCO Commercial Cleaner\nFINISH\nSEMCO Natural Shield\nSCRATCH COAT\nSCRATCH COAT\nFLOORS | WALLS | POOL DECKS | WATERPROOFING\nREDEFINING THE ART OF SURFACE CREATIVITY FOR OVER 25 YEARS USING GREEN MATERIALS\nEXISTING\nSUBSTRATE\nCONCRETE\n2025 .V6 * Drawings are not to scale\n3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2 3 4 5 6 7\n1\n8",
    "sourceDocument": "Pool-Resurfacing-Detail-Interior-Below-Grade.pdf",
    "title": "Pool Resurfacing Detail Interior Below Grade",
    "category": "Technical doc",
    "wordCount": 237
  },
  {
    "id": "doc-power-cleaner-datasheet-p1",
    "docId": "doc-power-cleaner-datasheet",
    "pageNumber": 1,
    "text": "PRODUCT DESCRIPTION\nPower Cleaner is a highly concentrated commercial strength cleaner, degreaser, and wax remover for commercial\nand industrial use. Power Cleaner has been formulated with a distinct blend of water softening agents and\nnonionic surfactants that allow you to clean and dissolve the toughest grease/oil stains from almost any surface,\nincluding concrete. Power Cleaner works by penetrating, suspending, emulsifying, and dissolving surface\ncontaminants. This remarkable product is so versatile, it can be used to clean everything from degreasing the\ndirtiest substrate to removing oil stains and/or wax from commercial and industrial surfaces.\nUsed automobile oil Excellent\nTransmission fluid Good\nWater Excellent\nDilution ratios with water Stripper - 1:4, heavy duty cleaner and pH balance - 1:9\nDrying time N/A\nCure time N/A\nColor Pink\nChemical type Degreaser\nClean up Water\nShelf life 1year\nUseful life 3 years\nPackaging (base and color activator) 1 quart, 1 gal. pail, 55 gal. drum\nPOWER CLEANER\nIndustrial Cleaner & Biodegradable Degreaser\nTechnical Product Information\nAPPLICATION AND SPECIFICATIONS\nTEST RESULTS*\nFEATURES / BENEFITS\n• Proficient industrial wax remover\n• Removes most water based acrylic sealers\n• Effectively degreases commercial kitchens\n• Removes tar, tire marks, and gum from most surfaces\n• 100% Biodegradable\n• Can be safely used in confined areas\nSUBSTRATES\n• Concrete surfaces\n• Ceramic tile and grout\n• Natural and cultured stone\n• Commercial\n• Pool decks\n• Walkways\n• Driveways\n*Tests are based on Semco Modern Seamless Surface experience unless otherwise noted.\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners.\nNot for use on humans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet\nbefore using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness\nof use. The only obligation of the seller-manufacturer shall be to replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or\nconsequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate. However, since the conditions of handling\nand use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply\nwith all applicable federal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2016.V02\nSURFACE ENGINEERING COMPANY",
    "sourceDocument": "Power-Cleaner-Datasheet.pdf",
    "title": "Power Cleaner Datasheet",
    "category": "Technical doc",
    "wordCount": 462
  },
  {
    "id": "doc-power-cleaner-sds-p1",
    "docId": "doc-power-cleaner-sds",
    "pageNumber": 1,
    "text": "MATERIAL SAFETY DATA SHEET\nHazard Rating:\n4- Extreme\n3- High\n2- Moderate\n1- Slight\n0- Insignificant\nSECTION I- PRODUCT INFORMATION\nFire 0\nHealth 2\nReactivity 0\nSpecial Hazard 0\nPOWER CLEANER\nMANUFACTURER: SEMCO, INC. ADDRESS: 4180 W. Desert Inn Road #A1, Las Vegas, NV 89102\nPRODUCT NAME: Power Cleaner PREPARED BY: Samel Sem\nCHEMICAL FAMILY: Degreaser DATE PREPARED: 12/13/01\nCHEMICAL NAME: Industrial Strength Degreaser EMERGENCY PHONE NO. 1-800-424-9300\nSECTION II-- CHEMICAL IDENTITY INFORMATION\nProprietary mixture containing:\nSodium Hydroxide <1% CAS#1310-73-2 OSHA PEL TWA=2mg/m 3 ACGIH TLV ceiling=2mg/m 3\nEthylene Glycol Monobutyl Ether <7.5% CAS#111-76-2 OSHA PEL TWA=50 ppm ACGIH TLV ceiling=25 ppm.\nSECTION III-- PHYSICAL & CHEMICAL CHARACTERISTICS (Fire & Explosion)\nAppearance: Red Liquid Specific Gravity: 1.054\nSolubility in water: Soluble Odor: Mild\nFlash Point: >210 ° F pH (1% solution): 13\nVapor Pressure: Unknown Boiling Point: 210 ° F\nFlammability: Non-Flammable (PMCC) Unusual Fire or Explosion Hazard: None Known\nExtinguishing Media: N/A\nSECTION IV -- SPECIAL PROTECTION INFORMATION\nProtective Gloves: Rubber or neoprene gloves.\nEye Protection: Goggles.\nRespiratory Protection: Not needed.\nLocal Exhaust: N/A.\nOther Equipment: Optional apron. Water showers, Eye flush stations.\nSECTION V--SPECIAL SPILL OR LEAK PROCEDURES\nClean up spill immediately with absorbing material such as sawdust. Flush area with water. Avoid getting into sewerage. Place the remainder in non-leak container.\nFloor will be slippery, use caution. Dispose of in accordance with city-state, and federal regulations.\nSECTION VI--EMERGENCY AND FIRST AID PROCEDURES\nEye Contact: Flush eye socket with fresh, cool, running water for at least 15 minutes. If irritation persists, seek medical assistance at once.\nSkin Contact: Remove contaminated clothing immediately. Wash affected skin areas thoroughly with soap and water. See a physician.\nIngestion: If swallowed, drink large volumes of weak vinegar or lemon juice. DO NOT induce vomiting. IMMEDIATELY see a physician.\nSECTION VII-- REACTIVITY DATA\nIncompatible Materials: None known.\nStability: Stable.\nHazardous Polymerization: Product will not undergo polymerization.\nHazardous Decomposition: None known.\nSECTION VIII-- SPECIAL INFORMATION\nStore in dry well ventilated place away from excessive heat. Avoid temperatures below -10 ° C. Avoid contact with skin or eyes. Do not take internally. Use with\nadequate ventilation. Avoid getting into sewerage.\nKeep out of reach of children. Keep container closed when not in use.\nThe information contained herein is, to the best of our knowledge and belief, accurate. However, since the conditions of handling and use are beyond our control, we\nmake no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply with all applicable\nfederal, state, and local laws and regulations. All chemicals may present unknown hazards and should be used with caution. Although certain hazards are described\nherein, we cannot guarantee that these are the only hazards, which exist. Users of any chemical should satisfy themselves that the conditions and methods of use assure\nthat the chemical is used safely.",
    "sourceDocument": "Power-Cleaner-SDS.pdf",
    "title": "Power Cleaner SDS",
    "category": "Technical doc",
    "wordCount": 481
  },
  {
    "id": "doc-prep-e-p1",
    "docId": "doc-prep-e",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\n(WOOD)\nTotal thickness 1/2” to 1”\n2 3 4 5 6\n1. Existing substrate - wood\n2. SEMCO Liquid Membrane™\n3. Fabric reinforcement\n4. SEMCO Liquid Membrane™\n5. X-Bond Scratch Coat\n6. X-Bond Brown Coat (1/4” minimum)\n1\nSEMCO\nLIQUID MEMBRANE™\nSEMCO\nLIQUID MEMBRANE™\nPREPARATION - TYPE E\nLiquid Membrane over wood\nFABRIC REINFORCEMENT\nX-BOND SCRATCH COAT\nBROWN COAT\n1/4” minimum\n2021 .V02 * Drawings are not to scale\nSEMCO Liquid Membrane™ over wood SURFACE ENGINEERING COMPANY\nPREPARATION TYPE E",
    "sourceDocument": "PREP-E.pdf",
    "title": "PREP E",
    "category": "Technical doc",
    "wordCount": 82
  },
  {
    "id": "doc-prestain-data-sheet-p1",
    "docId": "doc-prestain-data-sheet",
    "pageNumber": 1,
    "text": "UV resistance Excellent\nSurface penetration (4000 psi concrete, broom finish) Up to 0.75 cm\nUsed automobile oil Excellent\nTransmission fluid Good\nWater Excellent\nAlkali resistance Good\nHydrochloric acid (10%) Good\nGreen Concrete 250-300\nPolished Concrete 300-350\nArtificial Stone 250-300\nStamped Concrete 250-350\nBelow Grade 200-250\nDrying time 30 minutes (depending on temperature)\nCure time 48 hours\nColor White/milky liquid\nChemical type Water based reactive latex\nClean up Water\nShelf life 1 year\nUseful life 5 years\nPackaging (base and color activator) 1 gal. pail, 5 gal. pail, 55 gal. drum",
    "sourceDocument": "prestain-data-sheet.pdf",
    "title": "prestain data sheet",
    "category": "PreStain",
    "wordCount": 90
  },
  {
    "id": "doc-prestain-sds-p1",
    "docId": "doc-prestain-sds",
    "pageNumber": 1,
    "text": "Safety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nPage: 1 /9\n1. Product and company identification\n1.1 Identification of the substance or preparation:\nCommercial product name: PRE STAIN BASE\nUse of substance / preparation Industrial.\nModifying agent for: Building materials\n1.2 Company/undertaking identification:\nManufacturer/distributor: SEMCO Modern Seamless Surface Inc\n3620 West Reno Avenue\nLas Vegas, NV 8118\nUSA\nCustomer information: InfoLine:\nTel (702) 222 - 9495, info@semcosurfaces.com\nHours of operation:\nMonday - Friday,8 am to 5 pm (pacific standard time)\nCorporate website: www.semcosurfaces.com\nEmergency telephone no. (24h):\nTransportation emergency: (800) 424 - 9300 (CHEMTREC, USA)\n(703) 527 - 3887 (CHEMTREC, international)\nThis SDS was prepared by the Product Safety Department (RAPS) of SEMCO Modern Seamless Surface Inc.\n2. Hazards identification\n2.1 Classification of the substance or mixture\nClassification (GHS):\nClass Category Route of\nexposure\nSerious eye damage / eye irritation Category 2\n2.2 Label elements\nLabelling (GHS):\nPictogram(s):\nSignal Word: Warning\nH - Code Hazard Statements\nH315+H320 Causes skin and eye irritation.\nP - Code Precautionary Statements\nP103 Read label before use.\nP273 Avoid release to the environment.\nP280 Wear protective gloves/protective clothing/eye protection/face protection.\nP303+P361+P353 IF ON SKIN (or hair): Take off immediately all contaminated clothing. Rinse skin with water/shower.\nP305+P351+P338 IF IN EYES: Rinse cautiously with water for several minutes. Remove contact lenses, if present and easy to\ndo. Continue rinsing.\nP333+P313 If skin irritation or rash occurs: Get medical advice/attention.\nP403+P235 Store in a well - ventilated place. Keep cool.\nP404 Store in a closed container.\nP501 Dispose of contents/container to waste disposal.",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 268
  },
  {
    "id": "doc-prestain-sds-p2",
    "docId": "doc-prestain-sds",
    "pageNumber": 2,
    "text": "Safety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nPage: 2 /9\n2.3 Other hazards\nNo data available.\n3.1 Chemical characterization (preparation)\n3.2 Information on ingredients:\nType CAS No. Substance Content [wt. %] Note\nLower Upper\nINHA 2867 - 47 - 2 Proprietary Monomer <=2.347\nType: HYD - by - product upon hydrolysis, INHA - ingredient, NEBE - by - product, MONO - residual monomer, VERU - impurity,\nVUL - by - product upon vulcanization. *** Note: C1 - IARC carcinogen, C2 - NTP carcinogen, C3 - OSHA carcinogen, NH - non -\nhazardous, R - repro ductive toxin.\nSubstances listed in the Subsections \"HAPS\" and \"California Proposition 65 Carcinogens / Reproductive Toxins\" that are not\nlisted in this section are only present at quantities below 0.1% for California Proposition 65 listed toxins or below 1% for non -\ncarcinogenic HAPS or they are inextricably bound in the product.\n4. First - aid measures\n4.1 General information:\nGet medical attention if irritation occurs or if breathing becomes difficult. Remove contaminated clothing and shoes.\n4.2 After inhalation\nIf inhaled remove to fresh air. If not breathing, give artificial respiration. If breathing is difficult give oxygen.\n4.3 After contact with the skin\nFor skin contact, immediately wipe away excess material. Use a waterless hand cleaner to remove as much of the remaining\nmaterial as possible. Wash with soap and water.\n4.4 After contact with the eyes\nIf contact with eyes, immediately hold eyelids apart and flush with plenty of water for at least 15 min.\n4.5 After swallowing\nFor ingestion, if conscious, give several glasses of water but do not induce vomiting. If vomiting does occur, give additiona l fluids.\n4.6 Advice for the physician\nTreat symptomatically.\n5. Fire - fighting measures\n5.1 Flammable properties:\nProperty:\nFlash point...............................................................:\nBoiling point / boiling range .....................................:\nLower explosion limit (LEL) .....................................:\nUpper explosion limit (UEL).....................................:\nIgnition temperature ................................................:\nNFPA Hazard Class (comb./flam.liquid) ..................:\nValue:\n> 93 °C (> 199 °F)\nnot determined\nnot determined\nnot determined\nnot determined\nIIIB\nMethod:\n(ASTM D3278, DIN\n55680, ISO 3679)\n5.2 Fire and explosion hazards:\nThis material does not present any unusual fire or explosion hazards.\nChemical characteristics\nPolysiloxane with functional groups + Fluoropolymer + organosilane (dispersion in water)\n3. Composition/information on ingredients",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 386
  },
  {
    "id": "doc-prestain-sds-p3",
    "docId": "doc-prestain-sds",
    "pageNumber": 3,
    "text": "Safety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nPage: 3 /9\n5.3 Recommended extinguishing media:\ncarbon dioxide, dry sand, dry chemical or foam - type extinguishing media Water may be used to cool tanks and structures\nadjacent to the fire.\n5.4 Unsuitable extinguishing media:\nNone.\n5.5 Special exposure hazards arising from the substance or preparation itself, combustion products, resulting gases\nHazardous decomposition products: carbon monoxide , carbon dioxide , silicon dioxide , formaldehyde , Various hydrocarbon\nfragments .\n5.6 Fire fighting procedures:\nFull turn - out gear and Self Contained Breathing Apparatus (SCBA) should be worn when fighting large fires.\n6. Accidental release measures\n6.1 Precautions:\nWear personal protection equipment (see section 8). Avoid contact with eyes and skin. Avoid inhaling mists and vapours. If\nmaterial is released indicate risk of slipping.\nHAZWOPER PPE Level: C\n6.2 Containment:\nPrevent material from entering sewers or surface waters. Contain any fluid that runs out using suitable material (e.g. earth).\nRetain contaminated water/extinguishing water. Dispose of in prescribed marked containers.\nSpills of material which could reach surface waters must be reporte d to the United States Coast Guard National Response\nCenter's toll free phone number (800) 424 - 8802.\n6.3 Methods for cleaning up\nTake up mechanically and dispose of according to local/state/federal regulations. For small amounts: Absorb with a liquid binding\nmaterial such as diatomaceous earth and dispose of according to local/state/federal regulations. Contain larger amounts and\npump up into suitable containers. Clean any slippery coating that remains using a detergent / soap solution or anothe r\nbiodegradable cleaner.\n6.4 Further information:\nEliminate all sources of ignition.\n7. Handling and storage\n7.1 General information:\nAvoid exposure by technical measures or personal protective equipment. Always stir well before use.\n7.2 Handling\nPrecautions for safe handling:\nKeep away from heat, sparks and flame. Avoid contact with eyes, skin and clothing. Ensure adequate ventilation. Avoid breathi ng\ndust/vapor/mist/gas/aerosol. Keep container closed when not in use. When transferring flammable liquids between metal\ncontainers, ground and bond the containers to drain off and equalize their static electric charges and reduce the potential f or static\nsparks to occur.\nPrecautions against fire and explosion:\nDo not weld, cut, or grind on empty containers. Where feasible maintain the temperature of flammable or combustible liquids at\nleast 30° F below their flash point. Flammable, combustible or explosive air - vapor mixtures may be present in partial or uncleaned\nempty containers.\n7.3 Storage\nConditions for storage rooms and vessels:\nDo not store flammable liquids in plastic IBCs (i.e. Intermediate Bulk Containers or plastic tote tanks). Protect against fro st.\nAdvice for storage of incompatible materials:\nnone known .",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 449
  },
  {
    "id": "doc-prestain-sds-p4",
    "docId": "doc-prestain-sds",
    "pageNumber": 4,
    "text": "Safety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nPage: 4 /9\nFurther information for storage:\nProtect against sun. Keep container tightly closed and store in a cool, well ventilated place. Protect against frost.\nMinimum temperature allowed during storage and transportation: 0 °C (32 °F)\nDo not allow this material to freeze.\nMaximum temperature allowed during storage and transportation: 50 °C (122 °F)\n8.1 Engineering controls\nVentilation:\nUse with adequate ventilation.\nLocal exhaust:\nIf spraying or other aerosol generating operations are performed, local exhaust ventilation designed to capture mists and spr ays,\nsuch as a paint spray booth, is recommended.\n8.2 Associate substances with specific control parameters such as limit values\nMaximum airborne concentrations at the workplace:\nRe Acetic acid (CAS - no. 64 - 19 - 7): STEL is 15 ppm (ACGIH).\nnone known\n8.3 Personal protection equipment (PPE)\nRespiratory protection:\nIf spraying or other operations which generate an aerosol mist are conducted, respiratory protection for exposed personnel is\nrecommended. A NIOSH approved air purifying respirator equipped with universal multi - contaminant, multi - gas/vapor cartridges\nand at least P - 99 solid/aerosol particulate filters is recommended if overexposure to dusts, mists, or vapors could occur.\nHand protection:\nAny liquid - tight rubber or vinyl gloves.\nEye protection:\nSafety glasses with side shields or chemical safety goggles.\nOther protective clothing or equipment:\nAdditional skin protection, such as SARAN EX coated Tyvek apron, over - sleeves, lab coat, coveralls, or protective suit should be\nworn if splashing could occur. Provide eye bath and safety shower.\n8.4 General hygiene and protection measures:\nFollow standard industrial hygiene practices when using this material. When handling do not eat, drink, smoke or apply cosmetics.\nWash thoroughly after handling.\n9. Physical and chemical properties\n9.1 Appearance\nPhysical state / form ................................................: liquid (23 °C (73 °F))\nColour .....................................................................: milky white\nOdour ......................................................................: aromatic\n9.2 Safety parameters\nProperty: Value: Method:\nMelting point / melting range ...................................: not determined\nBoiling point / boiling range .....................................: not determined\nFlash point...............................................................: > 93 °C (> 199 °F) (ASTM D3278, DIN\n55680, ISO 3679)\nIgnition temperature ................................................: not determined\n8. Exposure controls and personal protection\nCAS No. Material Type mg/m 3 ppm Dust fract.\n64 - 19 - 7 Acetic acid OSHA PEL 25.0 10.0\n64 - 19 - 7 Acetic acid ACGIH TWA 10.0",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 396
  },
  {
    "id": "doc-prestain-sds-p5",
    "docId": "doc-prestain-sds",
    "pageNumber": 5,
    "text": "Safety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nPage: 5 /9\nLower explosion limit (LEL) .....................................: not determined\nUpper explosion limit (UEL).....................................: not determined\nVapour pressure......................................................: not determined\nDensity ....................................................................: 1.05 g/cm³ at 23 °C (73 °F), at 1015 hPa\nWater solubility / miscibility......................................: completely miscible\npH - Value .................................................................: 4.5 at 23 °C (73 °F) (1000 g/l H 2 O)\nViscosity (dynamic) .................................................: 55 mPa.s at 23 °C (73 °F)\n9.3 Further information\nCorrosive to Steel or Aluminum...............................: Not corrosive to steel or aluminum.\n10. Stability and reactivity\n10.1 General information:\nStable under normal conditions of use.\nIf stored and handled in accordance with standard industrial practices no hazardous reactions are known.\n10.2 Conditions to avoid\nAlthough this product is not expected to react with commonly used materials of construction and process equipment, it is advi sed\nthat any rubber or plastic items such as hoses and gaskets be tested prior to large scale processing to ensure there is no\ndegradation of performance or durability. Heat, open flames, and other sources of ignition. Protect against frost.\n10.3 Materials to avoid\nReacts with: acids and alkalis . Reaction causes the formation of: ethanol , methanol .\n10.4 Hazardous decomposition products\nBy hydrolysis: ethanol , methanol . Measurements have shown the formation of small amounts of formaldehyde at temperatures\nabove about 150 °C (302 °F) through oxidation.\n10.5 Further information:\nHazardous polymerization cannot occur.\n11. Toxicological information\n11.1 Information on toxicological effects\n11.1.1 General information\nData derived for the product as a whole are of higher priority than data for single ingredients.\n11.1.2 Acute toxicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product. No data on acute inhalation toxicity is avai lable for\nthis product. In case of aerosol formation: Avoid inhalative exposure!\nAcute toxicity estimate (ATE):\nATE mix (oral): > 2000 mg/kg\n11.1.3 Skin corrosion/irritation\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.4 Serious eye damage / eye irritation\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.5 Respiratory or skin sensitization\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 377
  },
  {
    "id": "doc-prestain-sds-p6",
    "docId": "doc-prestain-sds",
    "pageNumber": 6,
    "text": "Page: 6 /9\nSafety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nData related to ingredients:\n5 - Chloro - 2 - methyl - 4 - isothiazoline - 3 - on and 2 - methyl - 4 - isothiazoline - 3 - on (mixture in a ratio of 3:1):\nBased on the proven low sensitization induction threshold in human, mixtures containing ≥15 ppm are classified as skin\nsensitizing in Europe.\n11.1.6 Germ cell mutagenicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.7 Carcinogenicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.8 Reproductive toxicity\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.9 Specific target organ toxicity (single exposure)\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.10 Specific target organ toxicity (repeated exposure)\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.11 Aspiration hazard\nAssessment:\nFor this endpoint no toxicological test data is available for the whole product.\n11.1.12 Further toxicological information\nNo component of this product present at levels greater than or equal to 0.1% is identified as a known or anticipated carcinogen by\nNTP. No component of this product present at levels greater than or equal to 0.1% is identified as probable, possible or conf irmed\nhuman carcinogen by IARC. No component of this product present at levels greater than or equal to 0 .1% is identified as a\ncarcinogen or potential carcinogen by OSHA.\nData related to ingredients:\nProduct of hydrolysis (Methanol):\nMethanol (CAS 67 - 56 - 1) is readily and rapidly absorbed at all exposure routes and is toxic by all routes. Methanol may cause\nirritation of the mucosa, as well as nausea, vomiting, headaches, vertigo and visual disorders, including blindness (irrevers ible\ndamage to the optic nerve), acidosis, spasms, narcosis and coma. There may be a delay in the onset of these effects afte r\nexposure.\n12. Ecological information\n12.1 Toxicity\nAssessment:\nFor the product as a whole, no test data is available.\n12.2 Persistence and degradability\nAssessment:\nFor the product as a whole, no test data is available.\nData related to ingredients:",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 382
  },
  {
    "id": "doc-prestain-sds-p7",
    "docId": "doc-prestain-sds",
    "pageNumber": 7,
    "text": "Page: 7 /9\nSafety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nProduct of hydrolysis (Methanol):\nThe product of hydrolysis (methanol) is readily biodegradable.\n12.3 Bioaccumulative potential\nAssessment:\nNo data known.\n12.4 Mobility in soil\nAssessment:\nNo data known.\n12.5 Other adverse effects\nnone known\n13. Disposal considerations\n13.1 Product disposal\nRecommendation:\nDispose of according to regulations by incineration in a special waste incinerator. Observe local/state/federal regulations.\n13.2 Packaging disposal\nRecommendation:\nCompletely discharge containers (no tear drops, no powder rest, scraped carefully). Containers may be recycled or re - used.\nObserve local/state/federal regulations. Uncleaned packaging should be treated with the same precautions as the material.\n14. Transport information\n14.1 US DOT & CANADA TDG SURFACE\nValuation ................................................: Not regulated for transport\nOther Information ...................................: Protect from freezing, when exposed to cold temperatures approaching 0 °C (32 °F) or\nbelow.\n14.2 Transport by sea IMDG - Code\nValuation ................................................: Not regulated for transport\n14.3 Air transport ICAO - TI/IATA - DGR\nValuation ................................................: Not regulated for transport\n15.1 U.S. Federal regulations\nTSCA inventory status and TSCA information:\nThis material or its components are listed on or are in compliance with the requirements of the TSCA Chemical Substance\nInventory. This material or its component(s) is in compliance with TSCA under a Low Volume Exemption.\nTSCA 12(b) Export Notification:\nThis material does not contain reportable amounts of any T SCA 12(b) listed chemicals.\nCERCLA Regulated Chemicals:\nCAS No. Chemical RQ Upper limit wt. %\n64 - 19 - 7 Acetic acid 5,000 lbs <=1.4088\nSARA 302 EHS Chemicals:\nThis material does not contain any SARA extremely hazardous substances.\nSARA 311/312 Hazard Class:\nDelayed (chronic) health hazard.\nSARA 313 Chemicals:\nThis material does not contain any SARA 313 chemicals above de minimus levels.\n15. Regulatory information",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 303
  },
  {
    "id": "doc-prestain-sds-p8",
    "docId": "doc-prestain-sds",
    "pageNumber": 8,
    "text": "Page: 8 /9\nSafety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nHAPS (Hazardous Air Pollutants):\nThis material does not contain any HAPS substances\n15.2 U.S. State regulations\nCalifornia Proposition 65 Carcinogens:\nThis material does not contain any chemicals known to the State of California to cause cancer.\nCalifornia Proposition 65 Reproductive Toxins:\n67 - 56 - 1 Methanol\nMassachusetts Substance List:\n64 - 19 - 7 Acetic acid\n2867 - 47 - 2 Proprietary Monomer\nNew Jersey Right - to - Know Hazardous Substance List:\n64 - 19 - 7 Acetic acid\n2867 - 47 - 2 Proprietary Monomer\nPennsylvania Right - to - Know Hazardous Substance List:\n64 - 19 - 7 Acetic acid\n57 - 55 - 6 Propylene glycol\n2867 - 47 - 2 Proprietary Monomer\n15.3 Canadian regulations\nThis product has been classified in accordance with the Hazard criteria of the CPR and the SDS contains all the information\nrequired by the CPR.\nWHMIS Hazard Classes:\nNone.\nDSL Status:\nThis material or one or more of its components is not listed on the Canadian Domestic Substances List.\nNon - DSL Chemicals:\nCAS No. Chemical Upper limit wt. %\nConfidential Vendor Trade Secret Polymer (Not Disclosed, Proprietary, Unknown) <= 9.388\n15.4 Details of international registration status\nRelevant information about individual substance inventories, where available, is given below.\nEuropean Economic Area (EEA)................. : REACH (Regulation (EC) No 1907/2006):\nGeneral note: the registration obligations for substances imported into the EEA or\nmanufactured within the EEA by the supplier mentioned in section 1 are fulfilled by\nthe said supplier. The registration obligations for substances imported into the EEA\nby customers or other downstream users must be fulfilled by the latter.\n16. Other information\n16.1 Additional information:\nThis Safety Data Sheet (SDS) meets the requirements of the Federal OSHA Hazard Communication Standard (29 CFR\n1910.1200). This product has been classified according to the hazard criteria of the Controlled Products Regulations (CPR) and\nthe SDS contains all of the information required by the CPR. This information relates to the specific material designated and may\nnot be valid for such material us ed in combination with any other materials or in any process. Such information is to the best of\nour knowledge and belief accurate and reliable as of the date compiled. However, no representation, warranty or guarantee\nexpressed or implied, is made as to i ts accuracy, reliability or completeness. It is the user's responsibility to satisfy himself as to\nthe suitability and completeness of such information for his own particular use. We do not accept liability for any loss or d amage\nthat may occur from the us e of this information. Nothing herein shall be construed as a recommendation for uses which infringe\nvalid patents or as extending a license under valid patents. This SDS provides selected regulatory information on this produc t,\nincluding its components. T his is not intended to include all regulations. It is the responsibility of the user to know and comply with\nall applicable rules, regulations and laws relating to the product being used.\nVertical lines in the left - hand margin indicate changes compared wit h the previous version.",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 537
  },
  {
    "id": "doc-prestain-sds-p9",
    "docId": "doc-prestain-sds",
    "pageNumber": 9,
    "text": "Page: 9 /9\nSafety Data Sheet\nMaterial: 20071922 PRE STAIN BASE\nVersion: 2.5 (US) Date of print: 02/20/2017 Date of last alteration: 04/11/2016\nAll deliveries are subject to the SEMCO Health Care Policy.\n16.2 Glossary of Terms:\nACGIH - American Conference of Governmental Industrial\nHygienists\nDOT - Department of Transportation\nhPa - Hectopascals\nmPa*s - Milli Pascal - Seconds\nOSHA - Occupational Safety and Health Administration\nPEL - Permissible Exposure Limit\nppm - Parts per Million\nSARA - Superfund Amendments and Reauthorization Act\nSTEL - Shor t Term Exposure Limit\nTSCA - Toxic Substances Control Act\nTWA - Time Weighted Average\nWHMIS - Canadian Workplace Hazardous Materials\nIdentification System\nFlash point determination methods ........................................ Common name\nASTM D56................................................................................... Tagliabue (Tag) closed cup\nASTM D92, DIN 51376, ISO 2592 .............................................. Cleveland open cup\nASTM D93, DIN 51758, ISO 2719 .............................................. Pensky - Martens closed cup\nASTM D3278, DIN 55680, ISO 3679 .......................................... Setaflash or Rapid closed cup\nDIN 51755 ................................................................................... Abel - Pensky closed cup\n16.3 Conversion table:\nPressure:....................: 1 hPa * 0.75 = 1 mm Hg = 1 torr; 1 bar = 1000 hPa\nViscosity: ....................: 1 mPa*s = 1 centipoise (cP)",
    "sourceDocument": "PreStain-SDS.pdf",
    "title": "PreStain SDS",
    "category": "PreStain",
    "wordCount": 192
  },
  {
    "id": "doc-prestain-tech-sheet-p1",
    "docId": "doc-prestain-tech-sheet",
    "pageNumber": 1,
    "text": "Product Data PRESTAIN COLOR\nPre-Stain Color is a water-based, reactive/penetrating color system that provides\nrich, lasting color on exterior, interior and below grade CONCRETE and X-BOND\nsurfaces. This environmentally responsible system creates lasting surface colors.\nUnique catalytic reactions provide natural, vivid, one-of-a-kind visual designs.\nArtistry and practicality combine to create beautiful and functional applications.\nPRODUCT\nSUBSTRATES\nCOVERAGE\nGreen concrete 250 - 300\nPolished concrete 300 - 350\nArtificial Stone 300 - 350\nStamped Concrete 250 - 350\nBelow Grade 200 - 250\nCOVERAGE sq ft. / 1 gal\nBENEFITS\n• Unlimited creativity\n• Provides a natural and grain\nfinish\n• UV Resistant\n• Leaves a natural look\n• Solidifies crumbling surfaces\n• Odorless\n• Low VOC’s to meet indoor\nairquality standards\n• Resistant to freeze-thaw\ndamage\nConcrete\nX-Bond\nBrick\nNatural\nStone\n\n\n\n\nSURFACE ENGINEERING COMPANY\nStain any concrete surfaces on\ninterior or exterior. Long lasting\nand UV resistant color for your\nconcrete without degrading it.\nCreate stunning natural grain\neffects for your X-Bond Seamless\nStone surfaces\nGive your brick a new look with\nour water-based Pre-Stain\nwithout altering the look of brick.\nChange colors on on pore natural\nstone without the need for\nscarifying",
    "sourceDocument": "prestain-tech-sheet.pdf",
    "title": "prestain tech sheet",
    "category": "PreStain",
    "wordCount": 197
  },
  {
    "id": "doc-prestain-tech-sheet-p2",
    "docId": "doc-prestain-tech-sheet",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Use fine pump sprayer or airless sprayer, tip size 17\nApplication environment Apply at temperatures from 50°F to 90°F\nColor White/milky liquid\nChemical type Water based reactive latex\nClean up Stone Soap and water\nShelf life 5 years (ambient temperature of 60F - 72F)\nPackaging 1 gallon, 5 gallons, 55 gallon drum\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n20 min\n45 F\nDrying times are affected by temperature\nand relative humidity. The chart represents\nguidline values but each project is to be\ntreated individually.\nThe chart represents the time needed in\nbetween coats at specified temperature.\nCure / humidity\nTime\n75%\n10 days 48 hrs\n50%\n0 hrs\nLight foot traffic\n45 F 72 F 90 F\n4 days 7 days\n90 F 80 F 60 F\n1 h\n30 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 45 F, a full cure would\ntake 10 days in comparison to at 90 F it\nwould only take 4 days to cure.",
    "sourceDocument": "prestain-tech-sheet.pdf",
    "title": "prestain tech sheet",
    "category": "PreStain",
    "wordCount": 175
  },
  {
    "id": "doc-prestain-tech-sheet-p3",
    "docId": "doc-prestain-tech-sheet",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or\nupon request\n• Safety Data Sheets for SEMCO Pre-Stain Color are available upon request.\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP\nManual under the Surface Preparation Section.\n• Sweep debris off surface\nSTEP 1\n• Apply Pre Stain with HVLP, airless sprayer with tip size 17, or a sprayer that is capable of atomizing liquids\n• Hold the gun with tip size 17 approximately 18” away from surface and spray as desired\n• Spray even overlapping coats, for a more transparent finish spray 2 coats, for a very opaque finish spray Colour\nCoat, up to 7 coats\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 17 @400 PSI\n• OPTIONAL : fine tip pump sprayer",
    "sourceDocument": "prestain-tech-sheet.pdf",
    "title": "prestain tech sheet",
    "category": "PreStain",
    "wordCount": 389
  },
  {
    "id": "doc-product-brochure-p1",
    "docId": "doc-product-brochure",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue\nLas Vegas, NV 89118\nToll Free: 800.33.SEMCO (800.337.3626)\nSEMCO\nPRODUCT\nBROCHURE\nOver 25 years of excellence",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 20
  },
  {
    "id": "doc-product-brochure-p2",
    "docId": "doc-product-brochure",
    "pageNumber": 2,
    "text": "A little history about us\nStarting out as a small business in 1991 specialised in producing cleaning agents\nfor concrete surfaces. Soon we expanded our product line with sealers to protect\nyour surface from water and stains.\nShortly after we introduced our X-BOND, a surfacing solution that can be applied\nto almost any hard surface. For over 25 years we have now developed and expand\nour product line with high quality performance products.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 73
  },
  {
    "id": "doc-product-brochure-p3",
    "docId": "doc-product-brochure",
    "pageNumber": 3,
    "text": "Contents\nPreparation\nX-BOND\nSEAMLESS STONE\n1\nSealers\nTechnical\n5\n13 35\nColors 17",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 13
  },
  {
    "id": "doc-product-brochure-p4",
    "docId": "doc-product-brochure",
    "pageNumber": 4,
    "text": "1\nI t’s well-documented that the longevity of a flooring\ninstallation is dependent on the quality of the subfloor.\nSometimes we find ourselves more concerned with the\nfinal result, and so may spend less time ensuring the\nsubfloor preparation is perfect.\nWith our special blend of biodegrable cleaning\nconcentrates any surface can be cleaned and pH balanced\nin order to ensure a long lasting finish with our X-BOND\nSeamless Stone.\nPREPARATION",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 71
  },
  {
    "id": "doc-product-brochure-p5",
    "docId": "doc-product-brochure",
    "pageNumber": 5,
    "text": "2\nPower Cleaner is a highly concentrated, commercial strength cleaner,\ndegreaser, and wax remover for commercial and industrial use.\nPower Cleaner has been formulated with a distinct blend of water\nsoftening agents and nonionic surfactants that allow you to clean and\ndissolve the toughest grease /oil stains from almost any surface,\nincluding concrete.\nPower Cleaner works by penetrating, suspending, emulsifying, and dis-\nsolving surface contaminants. This remarkable product is so versatile it\ncan be used to clean everything from degreasing the dirtiest\nsubstrate to removing oil stains and/or wax from commercial and\nindustrial surfaces.\nDrying time 2 hours\nCure time 72 hours\nColor Pink\nChemical type Degreaser\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete\nPolished concrete\nArtificial stone\nStamped Concrete\nBelow grade\nSPECIFICATIONS\nCOVERAGE\nTEST RESULTS *\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Excellent\nVOC 64 g/L\nFEATURES / BENEFITS\n• industrial wax remover\n• degreases commercial\nkitchens\n• Removes tar, tire marks and\ngum from most surfaces\n• 100% biodegradable\n• can be safely used in\nconfined areas\nSUBSTRATES\n• concrete surfaces\n• ceramic tiles and grout\n• natural and cultured stone\n• commercial\n• pooldecks\n• walkways\n• driveways\n* Tests are based on Semco Systems experience unless otherwise noted.\nPOWER CLEANER",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 227
  },
  {
    "id": "doc-product-brochure-p6",
    "docId": "doc-product-brochure",
    "pageNumber": 6,
    "text": "3\nSTONE SOAP\nStone Soap is a highly concentrated, heavy duty cleaner formulated for\ncleaning without harming finished surfaces.\nStone Soap is a 100% biodegradable product which does not need to\nbe rinsed off. Stone Soap is a user friendly, environmentally-responsible\nproduct that is excellent for cleaning any surface.\nFEATURES / BENEFITS\n• user friendly\n• effective with hard or soft\nwater\n• neutral pH cleaner\n• 100% biodegradable\n• can be safely used in con-\nfined areas\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• existing concrete or sealers\n• ceramic tiles and grout\n• natural stone\nDrying time\nCure time\nColor Green\nChemical type Industrial cleaner\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete\nPolished concrete\nArtificial stone\nStamped Concrete\nBelow grade\nSPECIFICATIONS\nCOVERAGE\nTEST RESULTS *\nUsed automobile oil Good\ntransmission fluid Good\nWater Good\nAlkali resistance Excellent\nVOC 10 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 172
  },
  {
    "id": "doc-product-brochure-p7",
    "docId": "doc-product-brochure",
    "pageNumber": 7,
    "text": "4\nNU-LIFT CLEANER\nNu-Lift Cleaner is a formulated with an environmentally-responsible\nmineral acid that is user friendly.\nNu-Lift Cleaner does exactly what its name implies it lifts out and\nremoves dirt, alkalinity, efflorescence, hard water deposits, magnesium,\nand stains from surfaces like grout and natural stone without harming\nor discoloring.\nFEATURES / BENEFITS\n• removes organic deposits\n• balances low pH\n• safely dissolves\n• Efflorescence\n• Magnesium\n• Lime deposits\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• existing concrete or sealers\n• ceramic tiles and grout\n• natural stone\n• pool decks\n• masonry surfaces\nDrying time 2 hours\nCure time 72 hours\nColor Blue\nChemical type Mineral acid\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete\nPolished concrete\nArtificial stone\nStamped Concrete\nBelow grade\nSPECIFICATIONS\nCOVERAGE\nTEST RESULTS *\nUsed automobile oil Fair\ntransmission fluid Fair\nWater Good\nAlkali resistance Excellent\nVOC 72 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 175
  },
  {
    "id": "doc-product-brochure-p8",
    "docId": "doc-product-brochure",
    "pageNumber": 8,
    "text": "5\nX-BOND Seamless Stone\nSEMCO X-Bond Seamless Stone is a zero VOC hybrid of\nnatural stone and advanced cross-linking technology. It\nmechanically interlocks molecules of the X-Bond Stone to\nany solid surface enabling Remodel without Removal™.\nWith only our two core products, the X-BOND Liquid and\nX-BOND Stone, we can create a bespoke seamless surface\non almost any existing hard surface for interior and exterior\napplications.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 66
  },
  {
    "id": "doc-product-brochure-p9",
    "docId": "doc-product-brochure",
    "pageNumber": 9,
    "text": "6\ntrue versatility and performance\nwith our\nX-BOND Seamless Stone",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 10
  },
  {
    "id": "doc-product-brochure-p10",
    "docId": "doc-product-brochure",
    "pageNumber": 10,
    "text": "7\nX-BOND Seamless Stone\nSEMCO’s innovative X-Bond is a waterproof, lightweight, cementatious\nproduct that virtually resurfaces any surface. The X-Bond system offers\nthe ultimate in durable, environmentally responsible creative design\ncapability.\nThis superior bonding system adheres directly to any existing\nsurface. X-Bond can be safely applied in confined areas over existing\nsurfaces minimizing waste disposal. Unlimited texture possibilities allow\nfor complete creative freedom.\nThis durable, waterproof system is designed for both interior, exterior\nand below grade use.\nFEATURES / BENEFITS\n• waterproof cementious\nsystem\n• minimizes waste disposal\n• interior, exterior, below\ngrade\n• durable floors, walls and\ncountertops\n• can be used safely in\nconfined spaces\n• UV-resistant\n• resistant to freeze and thaw\ndamages\nSUBSTRATES\n• concrete surfaces\n• coated surfaces\n• wood surfaces / decks\n• ceramic tiles\n• Vinyl / VCT surfaces\n• natrual stone\n• glass\nDrying time 8 hours\nCure time 24 hours\nColor White powder and white liquid\nChemical type Modified polymer cement\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum | 50 lb bag\nOpen pore substrate 50 - 100\nClosed pore substrate 70 - 125\nX-Bond Scratch Coat 100 - 150\nSPECIFICATIONS\nCOVERAGE per gallon mixture\nTEST RESULTS *\nEMICODE EC 1 PLUS\nWear resistance\nISO 7784\n0.09 g after 20.000 cycles (approx. of 20 years use)\nSlip resistance\nAS 4586:2013\nP3, P4 ,P5 depending on texture\nAdhesion > 600 PSI\nVOC 24 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 259
  },
  {
    "id": "doc-product-brochure-p11",
    "docId": "doc-product-brochure",
    "pageNumber": 11,
    "text": "8\nMECHANICALLY INTERLOCKING MOLECULES\nThe key to the success of any surface is the method in which it connects with a sub-\nsurface. SEMCO’s X-Bond Seamless Stone forms a mechanically bond, while inter-\nlocking its own molecules to the surface it is applied creating a “Perfect Bond”.\nFLEXIBLE WATERPROOF MEMBRANE\nExceptional pliable strength/ modulus of rupture coupled with SEMCO’s specially\nformulated stone system creates a surface that can withstand the rigors of moving\nsubstrates while still being 100% waterproof.\nSURFACE STRENGTH\nSurface strength is relative based on need. X-Bond Seamless Stone principle strength\nis 27 MPa (4,000 PSI) while still retaining flexibility. However to meet all conditions;\nX-Bond Seamless Stone can be enhanced to meet or exceed 70 MPa (10,000 PSI).\nBREATHABLE AND CHEMICAL RESISTANT\nChanges in the environment affect all surfaces, the need for a surface to allow vapor\ntransmission is crucial for ongoing adhesion and performance. While vapor\ntransmission protects the unseen surface, the visual surface of the X-Bond Seamless\nStone reinforces its quality by being resistant to the caustic strain of acids, to the\npenetrating qualities of low viscosity liquids.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 183
  },
  {
    "id": "doc-product-brochure-p12",
    "docId": "doc-product-brochure",
    "pageNumber": 12,
    "text": "9\nAreas of application",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 4
  },
  {
    "id": "doc-product-brochure-p13",
    "docId": "doc-product-brochure",
    "pageNumber": 13,
    "text": "10\n1 X-BOND Seamless STONE\n2 Pre-Stain Base\n3 X-CRETE 400\n4 X-CRETE 500\n5 XTREME GLOSS\n6 X-TRA GLOSS\n7 Satin Stone\n8 Natural Shield\n9 Color Grain\n10 Color Green\n11 Crystal Coat\n12 X-Bond Membrane\nInterior\nExterior\nResidential\nCommercial\nIndustrial\nWetrooms\nFind your product\nSEMCO offers a wide range products for your different needs which can also be used apart\nfrom our flag ship product X-BOND Seamless Stone. Discover our versatile range of\ncoloring products to our high performance sealers.\nFind out which product suits your needs with the table below:\nProducts marked in yellow are penetration sealers which means they do not leave a\nprotective membrane on your surface. X-CRETE 500 and Natural Shield leave your surface\nin its natural look while protecting it from moisture.\nProducts marked in green are sealers which leave a protective membrane on top of your\nsurface. All products are UV- stable and do not turn yellow over time.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 158
  },
  {
    "id": "doc-product-brochure-p14",
    "docId": "doc-product-brochure",
    "pageNumber": 14,
    "text": "11\nVertical Surface\nin 3 easy steps",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 7
  },
  {
    "id": "doc-product-brochure-p15",
    "docId": "doc-product-brochure",
    "pageNumber": 15,
    "text": "12\nOur products follow a long line of\ntradition. We develop our products to\ncreate the perfect solution for our\nclients. Endless design possibilities\nand easy to apply.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 28
  },
  {
    "id": "doc-product-brochure-p16",
    "docId": "doc-product-brochure",
    "pageNumber": 16,
    "text": "13\nDiscover our 4 signature textures\nColor Bond Natural Grain\nPolished Bond\nADA Safety Floor",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 15
  },
  {
    "id": "doc-product-brochure-p17",
    "docId": "doc-product-brochure",
    "pageNumber": 17,
    "text": "14\nHorizontal Surface\nin 3 easy steps",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 7
  },
  {
    "id": "doc-product-brochure-p18",
    "docId": "doc-product-brochure",
    "pageNumber": 18,
    "text": "15\nRemodel without Removal™\nS EMCO’s most innovative custom engineered product is X-Bond Seamless Stone, which is the core ele-\nment in both the SEMCO Remodel without Removal™ and SEMCO’s ADA Safety Floor systems. It creates\nchemical bond at the molecular level to any solid surface.\nWith SEMCO’s unique REMODEL WITHOUT REMOVALTM™ system you can remodel any solid surface\nwithout the cost, inconvenience and potential environmental damage associated with the removal of the\nexisting surface. SEMCO surface engineers have perfected this method through the use of the X-Bond\nSeamless Stone, which chemically adheres to any existing surface. This system saves clients time and cost on\ntheir projects, while offering significant GREEN benefits.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 112
  },
  {
    "id": "doc-product-brochure-p19",
    "docId": "doc-product-brochure",
    "pageNumber": 19,
    "text": "16\nADA safety floor\nThe SEMCO ADA Safety Floor\nis engineered to assist in\nremodeling projects that\nrequire ADA compliance in\nCoefficient of Friction\nSLIP AND FALL RISK REDUCTION\nSlip resistant flooring is an important element of\nensuring a public access floor is compliant with ADA\nregulations. Our ADA Safety Floor has a dynamic\ncoefficient of friction (DCOF) of 0.86 exceeding the\nminimum requirement. Utilizing the SEMCO ADA\nSafety Floor an ADA compliant flooring can be created\non any solid flooring product. The SEMCO ADA Safety\nFloor provides a slip resistant floor that can be used for\nstandard flooring or ramped surfaces. The SEMCO ADA\nSafety Floor maintains the same dry slip resistance\nwhen wet.\nMEET SUB-SURFACE MOVEMENT AND ADA\nREQUIREMENTS\nPublic access flooring that has drains, grout lines, to\ncontrol joints, must not have any apertures\nexceeding 1/4”. A specific concern is control joints,\nconcrete control joints are specifically\ndesigned to control concrete cracking, and it is very\ncommon for a control joint to easily exceed an\naperture of 1/4”. SEMCO ADA Safety Floor can\nresolve this situation. Having a strength reaching up\nto 10,000 PSI, the SEMCO ADA Safety Floor can fill an\naperture while still maintaining floor strength and\nintegrity.\nREGRADING WITHOUT THE NEED FOR DEMOLITION\nOF EXISTING SURFACE\nTo be in compliance with ADA regulations, a public\naccess floor must not exceed a slope of 2%. A common\narea floor that has sloping exceeding 2% must be\naddressed as a ramp, which will require flooring rated\nno less than 0.80 COF. The SEMCO ADA Safety Floor is\napplicable from as thin as 1/32” to 6”. With the SEMCO\nADA Safety Floor a floor slope can be adjusted without\nextensive demolition or removal of existing flooring.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 289
  },
  {
    "id": "doc-product-brochure-p20",
    "docId": "doc-product-brochure",
    "pageNumber": 20,
    "text": "17\nColors\nOver the years, Semco has continuously manufactured\npremium sealers to keep its surfaces protected for longevity\nand waterproofing.\nEach product was designed for multi-purpose use to ex-\ntend the life of the desired space by protecting it from:\nultraviolet rays, contaminants, high traffic, and chemical\nstaining.\nMany of the sealers manufactured are water based, which\nfeature minimal to no odor and are sold in:\nGloss, Matte, Flat or a Satin Finish.\nEach of our sealers have rapid application, fast dry times for\nwalkability, and can be applied in different methods:\nspray, rolled, or magic trowel.\nOur sealers are not only limited for use within our products,\nbut as well as to restore existing solid surfaces.\nRapid applications, fast dry times, and UV resistant- What\nmore could you ask for?",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 131
  },
  {
    "id": "doc-product-brochure-p21",
    "docId": "doc-product-brochure",
    "pageNumber": 21,
    "text": "18\nPRE-STAIN BASE\nSEMCO’s unique Pre-Stain Color is a water-based chemical bonding\ncompound that provides rich, lasting color on exterior, interior and\nbelow grade concrete & X-BOND surfaces.\nThis environmentally-Responsible system creates lasting surface\ncolors. Unique color reactions provide unlimited, vivid,\none-of-a-kind visual designs. Artistry and practicality combine\nto create beautiful and functional applications.\nFEATURES / BENEFITS\n• one of a kind effect\n• UV resistant\n• odorless\n• can be applied on any po-\nrous or semi porous surface\n• exceeds indoor air quality\nstandards\nSUBSTRATES\n• X-BOND System\n• unsealed concrete surfaces\n• exposed concrete\n• countertops\n• warehouse floors\n• Vertical & horizontal\nsurfaces\n• masonry surfaces\nDrying time 2 hours\nCure time 72 hours\nColor Blue\nChemical type Mineral acid\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 200 - 250\nPolished concrete 200 - 250\nArtificial stone 200 - 250\nStamped Concrete 100 - 175\nBelow grade\nUsed automobile oil Fair\ntransmission fluid Fair\nWater Good\nAlkali resistance Excellent\nVOC 72 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 202
  },
  {
    "id": "doc-product-brochure-p22",
    "docId": "doc-product-brochure",
    "pageNumber": 22,
    "text": "19\nCOLOR GREEN\nSEMCO’s exclusive Color Green System is a developed from green\nmaterials and designed for specialized application in polished concrete\ncoloring and densifying, with permanent color effect. It features Green\nAdvantage application that can be used on indoor, outdoor, and\nbelow-grade projects within indoor air quality compliance and with\nminimal VOC emissions.\nColor Green is colorant, sealer, primer and curing agent all-in-one. This\nsystem provides time saving benefits that allow for permanent coloring\nwithin your existing procedures without additional costs!\nFEATURES / BENEFITS\n• permanent color\n• indoor/outdoor use\n• leaves a natural look\n• exceeds indoor air quality\nspecifications\nSUBSTRATES\n• green concrete\n• polished concrete\nDrying time 1 hours\nCure time 4 hours\nColor 12 Colors Available + additional colors per spec\nChemical type Water Based Permanent Color-SIlicone\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 200 - 250\nPolished concrete 200 - 250\nArtificial stone 200 - 250\nStamped Concrete 100 - 175\nBelow grade 200 - 250\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 7 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 213
  },
  {
    "id": "doc-product-brochure-p23",
    "docId": "doc-product-brochure",
    "pageNumber": 23,
    "text": "20\nCOLOR GRAIN\nSEMCO’s Color Grain is a highly effective wood protection, restoration,\nand coloring system. The Color Grain is designed to penetrate, solidify,\nand color wood to enhance the natural woodfinish. SEMCO uses a\nspecialty blend of green materials and color additives, which enables\nthe Color Grain to outlast waxes and other pigmenting options for\nwood.\nThe intrinsic property of the Color Grain protects wood from\nultraviolet rays and water damage without forming a membrane to\nprovide a natural nish.\nFEATURES / BENEFITS\n• never peels\n• UV resistant\n• leaves a natural look\n• eliminate the need for\nsanding or grinding\n• meets and exceeds indoor\nair quality specifications\n• VOC compliant\n• available in clear and 12\nstandard colors\nSUBSTRATES\n• Cedar\n• Teak\n• Maple\n• Oak\n• Mahagony\n• Walnut\nDrying time 15 minutes\nCure time 3 hours\nColor Clear and 12 standard colors\nChemical type water based\nShelf life 1 year\nUseful life 3 years\nPackaging 1 quart | 1 Gal pail | 5 Gal pail\nGreen concrete n/a\nPolished concrete n/a\nArtificial stone n/a\nStamped Concrete n/a\nBelow grade n/a\nUsed automobile oil n/a\ntransmission fluid n/a\nWater Excellent\nAlkali resistance Excellent\nHydrocloric Acid (10%) Good\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 221
  },
  {
    "id": "doc-product-brochure-p24",
    "docId": "doc-product-brochure",
    "pageNumber": 24,
    "text": "21\nSealers\nOver the years, Semco has continuously manufactured\npremium sealers to keep its surfaces protected for longevity\nand waterproofing.\nEach product was designed for multi-purpose use to ex-\ntend the life of the desired space by protecting it from:\nultraviolet rays, contaminants, high traffic, and chemical\nstaining.\nMany of the sealers manufactured are water based, which\nfeature minimal to no odor and are sold in:\nGloss, Matte, Flat or a Satin Finish.\nEach of our sealers have rapid application, fast dry times for\nwalkability, and can be applied in different methods:\nspray, rolled, or magic trowel.\nOur sealers are not only limited for use within our products,\nbut as well as to restore existing solid surfaces.\nRapid applications, fast dry times, and UV resistant- What\nmore could you ask for?",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 131
  },
  {
    "id": "doc-product-brochure-p25",
    "docId": "doc-product-brochure",
    "pageNumber": 25,
    "text": "22\nour premium sealers give\nyour X-BOND surface\nthe extra protection.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 11
  },
  {
    "id": "doc-product-brochure-p26",
    "docId": "doc-product-brochure",
    "pageNumber": 26,
    "text": "23\n1 COMMERCIAL NEUTRAL CLEANER > STONE SOAP\n2 MINERAL CLEANSER > NU-LIFT CLEANER\n3 INDUSTRIAL CLEANER/BIODEGRADABLE DEGREASER > POWER CLEANER\n1 COMMERCIAL PRIMER, COLORANT & SEALER > COLOR COAT\n2 INDUSTRIAL PRIMER, COLORANT & SEALER > COLOR GLOSS\n3 COMMERCIAL COLORANT > PRE-STAIN COLOR\n4 WOOD PRESERVER > COLOR GRAIN\n5 CONCRETE COLOR IMPREGNATOR > COLOR GREEN\n1 PREMIUM GLOSS FINISH SEALER > X-CRETE 400\n2 INDUSTRIAL FLAT FINISH SEALER > X-CRETE 500\n3 INDUSTRIAL GLOSS FINISH SEALER > XTREME GLOSS\n4 COMMERCIAL GLOSS FINISH SEALER > X-TRA GLOSS\n5 SURFACE REJUVENATOR > CRYSTAL COAT\n6 FLAT FINISH SEALER > NATURAL SHIELD\n7 PREMIUM MATTE FINISH SEALER > SATIN STONE\n1 COMMERCIAL GRADE WATERPROOFING > X-BOND MEMBRANE\nSUBSTRATES\nConcrete\nGreen (Fresh) Concre\nSeal\nProduct and Substrate\nCompatibility Chart",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 129
  },
  {
    "id": "doc-product-brochure-p27",
    "docId": "doc-product-brochure",
    "pageNumber": 27,
    "text": "24\nete\ned Concrete\nPolished Concrete\nConcrete Micro Topping\nX-Bond Seamless Stone\nNatural Stone (Unpolished)\nNatrual Stone (Polished)\nPool Deck Coatings\nWood (Treated)\nWood (untreated)",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 25
  },
  {
    "id": "doc-product-brochure-p28",
    "docId": "doc-product-brochure",
    "pageNumber": 28,
    "text": "25\nX-CRETE 400\nX-Crete 400 is formulated with the latest technology in polyurethane\nblend resin to provide the most environmentally-responsible,\nwater-based sealer available in today’s market.\nX-Crete 400 is a high quality, multi-faceted product. It dries clear,\ncreating a shinny look as it simultaneously seals, dust proofs, and\nprotects.\nX-Crete 400 is a unique, one-of-a-kind high-gloss topcoat, which\nprovides a durable barrier resistant to stains and chemicals while\nproviding a polished look for exterior and interior use.\nFEATURES / BENEFITS\n• withstand commercial foot\nand vehicle traffic\n• enhances color\n• resistant to chemicals\n• self-priming,sealer and\nhardener\n• also available in matte and\nnon-skid\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• concrete surfaces\n• countertops\n• stamped concrete\nDrying time 8 hours\nCure time 72 hours\nColor Blue\nChemical type White milky liquid\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 200 - 250\nPolished concrete 200 - 250\nArtificial stone 200 - 250\nStamped Concrete 100 - 175\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 54 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 213
  },
  {
    "id": "doc-product-brochure-p29",
    "docId": "doc-product-brochure",
    "pageNumber": 29,
    "text": "26\nSATIN STONE\nSatin Stone provides exceptional durability for exterior & interior for\nindustrial applications in a naturally satin finish.\nIt has excellent resistance to corrosive food acids, industrial solvents,\nstains, many chemicals and vehicle traffic.\nUV Stable allowing for both interior and exterior use. Satin Stone\nfeatures a low viscosity matrix, and can apply with airless sprayer, roller,\nor magic trowel.\nFEATURES / BENEFITS\n• withstand commercial foot\nand vehicle traffic\n• for interior and exterior\napplications\n• Resistant to chemicals,\nused in: hospitals, laborato-\nries, food preparation areas,\nautomotive facilities\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• New and existing concrete\n• New and existing coatings\n• warehouse floors\n• New and existing stamped\n• concrete\nDrying time 1 hours\nCure time 7 days\nColor Part A: Milky White, Part B: Clear\nChemical type Polyurethane Hybrid\nShelf life 35 Minutes after mixing\nUseful life 35 Minutes after mixing\nPackaging Part A 1.0 gal. to Part B 0.5 gal.\nGreen concrete 200 - 250\nPolished concrete 200 - 250\nArtificial stone 200 - 250\nStamped Concrete 300 - 350\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Excellent\nHydrocloric Acid (10%) Good\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 217
  },
  {
    "id": "doc-product-brochure-p30",
    "docId": "doc-product-brochure",
    "pageNumber": 30,
    "text": "27\nX-TRA GLOSS\nX-Tra Gloss is a one-part solvent-based polyurethane sealer, able to\nprovide exceptional durability and shine for interior, exterior, and\nbelow grade use.\nX-Tra Gloss is a high quality, multi-faceted product: which dries clear,\ncreating a wet look, as it simultaneously seals, dust proofs, and protects\nfor long lasting durability.\nX-Tra Gloss is a unique, high-gloss top coat which provides superior and\ndurable resistance to stains, many chemicals and vehicle traffic.\nFEATURES / BENEFITS\n• withstand commercial foot\nand vehicle traffic\n• for interior, exterior, and\nbelow grade\n• resistant to chemicals\n• deep gloss finish\n• also available in non-skid\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• concrete surfaces\n• countertops\n• stamped concrete\n• new & existing Concrete\nand Coatings\n• commercial driveways\nDrying time 2 hours\nCure time 72 hours\nColor Clear\nChemical type Solvent Base Resins\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 150 -200\nPolished concrete 150 -200\nArtificial stone\nStamped Concrete 150 -200\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 275 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 215
  },
  {
    "id": "doc-product-brochure-p31",
    "docId": "doc-product-brochure",
    "pageNumber": 31,
    "text": "28\nNATURAL SHIELD\nSEMCO’s Natural Shield is an exceptional waterproofing sealer that\nexcels under the most demanding circumstances.\nNatural Shield’s low molecular weight allows for excellent penetration.\nNatural Shield fills into the pores of the substrate, in which chemical\nreaction follows, that creates a solid, but breathable membrane.\nNatural Shield provides long lasting protection for a vast array of\nsurfaces in which it leaves a natural finish.\nFEATURES / BENEFITS\n• withstand commercial foot\nand vehicle traffic\n• for interior, exterior, and\nbelow grade\n• resistant to chemicals\n• deep gloss finish\n• also available in non-skid\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• concrete surfaces\n• countertops\n• stamped concrete\n• new & existing Concrete\nand Coatings\n• commercial driveways\nDrying time 1 hours\nCure time 48 hours\nColor Clear\nChemical type Silane and Siloxane\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nApplication Apply wet on wet require 3 coats, do not allow each\ncoat to dry\nGreen concrete\nPolished concrete 150 - 200\nArtificial stone 200 -250\nStamped Concrete 300 - 350\nBelow grade 150 - 200\nUsed automobile oil Good\ntransmission fluid Good\nWater Excellent\nAlkali resistance Excellent\nHydrocloric Acid (10%) Good\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 230
  },
  {
    "id": "doc-product-brochure-p32",
    "docId": "doc-product-brochure",
    "pageNumber": 32,
    "text": "29\nX-CRETE 500\nX-Crete 500 is an exceptional waterproofing sealer that excels\nunder the most demanding circumstances.\nX-Crete 500’s low molecular weight allows for excellent penetration.\nX-Crete 500 fills into the pores of the substrate, in which chemical\nreaction follows, that creates a solid, but breathable membrane.\nX-Crete 500 provides long lasting protection for a vast array of\nsurfaces in which it leaves a natural finish.\nFEATURES / BENEFITS\n• excellent Penetration\n• can be applied on damp\nsurfaces\n• highly alkaline resistant\n• effective against freeze-\nthaw damage\nSUBSTRATES\n• existing Concrete\n• Pre-Stain System\n• X-Bond System\n• ceramic Tile\n• Stucco\n• slump block\n• brick\nDrying time 2 hours\nCure time 72 hours\nColor Clear\nChemical type Silane and Siloxanne\nShelf life 3 years\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 150 -200\nPolished concrete 150 -200\nArtificial stone\nStamped Concrete 150 -200\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 245 g/L (*non-VOC Version : Natural Shield)\n* Tests are based on Semco Systems experience unless otherwise noted.\nTEST RESULTS *\nCOVERAGE sq ft./gallon\nSPECIFICATIONS",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 201
  },
  {
    "id": "doc-product-brochure-p33",
    "docId": "doc-product-brochure",
    "pageNumber": 33,
    "text": "30\nCRYSTAL COAT\nCrystal Coat is formulated with the latest water-based technology\nin latex polymers, and is able to link to most top coats.\nCrystal Coat provides a quick drying, environmentally-responsible,\ndurability and shine, for interior and exterior use.\nCrystal Coat is a quality, multi-faceted product which dries clear\ncreating a deep gloss finish, as it simultaneously seals and protects.\nCrystal Coat provides a durable barrier, resistant to stains and high foot\ntraffic.\nFEATURES / BENEFITS\n• resistant to chemicals\n• withstands heavy foot\ntraffic\n• easy to Maintain\n• also Available in Matte\nFinish\nSUBSTRATES\n• most Sealed Surfaces\n• Pre-Stain System\n• X-Bond System\n• ceramic tile\n• stamped concrete\nDrying time 2 hours\nCure time 72 hours\nColor Clear\nChemical type Water Base Polyurethane\nShelf life 1 year\nUseful life 3 years\nPackaging 1 pint | 1 Gal pail | 5 Gal pail | 55 Gal drum\nGreen concrete 300 - 450\nPolished concrete 300 - 400\nArtificial stone 300 - 450\nStamped Concrete 250 - 350\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 36 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nTEST RESULTS *\nCOVERAGE sq ft./gallon\nSPECIFICATIONS",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 205
  },
  {
    "id": "doc-product-brochure-p34",
    "docId": "doc-product-brochure",
    "pageNumber": 34,
    "text": "31\nX-TREME GLOSS\nX-TREME GLOSS is a two-part solvent-free resin sealer, able to provide\nexceptional durability and shine for interior surfaces. It has excellent\nresistance to corrosive food acids, most solvents, stains, many\nchemicals and vehicle traffic.\nXTREME GLOSS features low viscosity,good troweling characteristics,\nblush-free cures and good resistance to ambering for an epoxy materi-\nal. The regular cure material bonds to damp concrete.\nXTREME GLOSS Is ideal for all interior surfaces.\nFEATURES / BENEFITS\n• X-Bond System\n• Pre Stain System\n• New & Existing Concrete\n• Warehouse Floors\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• New and existing concrete\n• New and existing coatings\n• warehouse floors\n• New and existing stamped\n• concrete\nDrying time 5 hours\nCure time 7 days\nColor Clear\nChemical type 2 Part Resins\nShelf life 35 Minutes after mixing\nUseful life 35 Minutes after mixing\nPackaging Part A 1.0 gal. to Part B 0.5 gal.\nGreen concrete 100 - 150\nPolished concrete 100 - 150\nArtificial stone\nStamped Concrete 100 - 150\nBelow grade\nUsed automobile oil Excellent\ntransmission fluid Good\nWater Excellent\nAlkali resistance Good\nVOC 110 g/L\n* Tests are based on Semco Systems experience unless otherwise noted.\nSPECIFICATIONS\nCOVERAGE sq ft./gallon\nTEST RESULTS *",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 206
  },
  {
    "id": "doc-product-brochure-p35",
    "docId": "doc-product-brochure",
    "pageNumber": 35,
    "text": "32\nWith up 10,000 PSI surface\nstrength , X-BOND has\nproven itself for over\n25 years world wide.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 18
  },
  {
    "id": "doc-product-brochure-p36",
    "docId": "doc-product-brochure",
    "pageNumber": 36,
    "text": "33\nX-BOND MEMBRANE\nThe X-Bond Membrane is a single component waterproofing and anti-\nfracture membrane.\nThe X-Bond Membrane is a self-contained elastomeric fluid suspended\nin a copolymer adhesive, this revolutionary blend enables easy\napplication while providing excellent bridging, and waterproofing.\nWhen combined with SEMCO’s X-Bond Seamless Stone, two-stage\nwaterproofing is achieved, enabling single source protection.\nFEATURES / BENEFITS\n• Waterproofing: interior,\nexterior and below grade\n• Crack bridging\n• Anti-fracture membrane\nSUBSTRATES\n• concrete\n• plywood\n• stone\n• exterior/Interior cladding\n• residential, industrial, and-\ncommercial\nApplication Airless sprayer tip size 21 at 2,500 PSI or roller (2\ncoats minimum)\nApplication environment Apply at temperatures from 50°F to 90°F\nDrying time 25 to 30 minutes at 72°F\nCuring time 50% in 72 Hours, 100% in 7 Days\nColor Orange (Special Order: White Haze)\nChemical type Latex - cross-link hybrid\nClean up Water\nShelf life 2 years\nWater test In 35 minutes after application\nPackaging 1 Gal pail | 5 Gal pail | 55 Gal drum\nOpen pore substrate 50 - 100\nClosed pore substrates 70 - 125\nX-Bond Scratch Coat 100 -150\nSPECIFICATIONS\nCOVERAGE sq ft./gallon",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 186
  },
  {
    "id": "doc-product-brochure-p37",
    "docId": "doc-product-brochure",
    "pageNumber": 37,
    "text": "34\nANSI 118.10 – Breaking Strength (ASTM D751, Procedure B) Pass\nANSI 118.10 – Dimensional Stability (ASTM D1204) Pass\nANSI 118.10 – 7-Day Shear Strength (ASTM C482-9.8) 173 immersion\nANSI 118.10 – 7-Day Water Immersion Shear Strength 132 PSI\nANSI 118.10 – 4-Week Shear Strength 234 PSI\nASTM E96 – Water Vapor Transmission 1.52 (g/hr-m2)\nASTM E96 – Water Vapor Transmission: Permeability 0.135 (perm-in)\nISO 37 – Tensile Strength (ASTM D412): Maximum Stress 390 PSI\nISO 37 – Tensile Strength (ASTM D412): Ultimate Elongation 400 %\nTEST RESULTS",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 88
  },
  {
    "id": "doc-product-brochure-p38",
    "docId": "doc-product-brochure",
    "pageNumber": 38,
    "text": "35\nCASE STUDY FASHION DESIGNER’S RESIDENCE\nFrom covering immense slab walls to correcting sloping roof decks, see how X-Bond\nhelped transform fashion designer’s beautiful home in the Hollywood Hills.\nSummary\nW hen internationally famous New York\nfashion designer purchased a new home off\nSunset Boulevard, high in the fashionable Hollywood\nHills, some aspects of the home didn’t meet his high\nstandards: namely, its stone floors and exterior walls.\nSeeking a more modern look for his contemporary\nresidence, the renowned designer turned to SEMCO.\nSEMCO was the obvious choice for the project, as\nwe’ve been providing efficient and successful\nengineering and service solutions to the City for over\n18 years.\nExisting travertine tile floors needed an upgrade. Existing black granite tile floors in the shower needed an\nupgrade.\nExploring Alternatives\nT he home featured two expansive walls – 15 ! 20 ′ and 25 ! 30 ′ –\nmade of black absolute granite – an expensive material – and\ntravertine stone, neither of which met the designer’s conceptual\nvision. His first thought was to use ARDX gray concrete, but this\noption was not feasible due to the product’s thickness.\nComplete demolition was another option, but a costly and\ntime-consuming one, requiring the following:\n• Architectural/engineering drawings for permits (estimated\ntime 10 days).\n• Check Approval (up to 2-3 weeks).\n• Stone Removal (estimated 2 weeks).\n• Stud Replacement (estimated 3 weeks) *as needed.\n• Cement Board Installation (estimated 1 week).\n• Waterproof Membrane Installation (estimated 4 days).\n• Stone installation (estimated 2 weeks).\n• Inspections, municipal approval, HOA approval (3-5 weeks).\n• Constraints of removal of demolition debris due to location of\nproperty on narrow winding mountain road.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 277
  },
  {
    "id": "doc-product-brochure-p39",
    "docId": "doc-product-brochure",
    "pageNumber": 39,
    "text": "36\nStrategy\nThe engineers faced three main challenges with this resi-\ndential renovation:\n• Creating a consistent surface on immense, 25 foot\nwalls.\nSolution: Using a scaffolding with three men on top,\nthree in the middle, and three on the bottom allowed the\nengineers to apply a smooth, even coat of X-Bond.\n• Creating a solution for the silicon-caulked wall seams.\nSolution: When the sun hit the walls, the silicone seams got\nwarm and expanded, creating a vein-like appearance. To remedy\nthe problem, we cut out the silicone and filled it with SEMCO’s\nX- Bond Seamless Stone.\n• Leveling a sloped floor.\nSolution: To correct significant sloping in the floor surface,\nSEMCO’s X-Bond system was used to bring the floor up by four\ninches, while ensuring a secure, molecular bond to the existing\nslab.\nSuccess\nN ot only has the fashion designer since added seamless\nstone to two downstairs baths, a downstairs kitchen, and\ninside fountain, he has also inspired several celebrity friends\nand close family members to choose SEMCO for their surface\nand remodeling projects.\nProject Information\n• Preparation: SEMCO Nu-Lift Cleaner and\nStone Soap\n• Floors and walls: SEMCO X-Bond Seam-\nless Stone, ADA Safety Floor and Satin\nStone Color\n• Project size: 1’150 sqm\n• Project year: 2016",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 211
  },
  {
    "id": "doc-product-brochure-p40",
    "docId": "doc-product-brochure",
    "pageNumber": 40,
    "text": "37\nTechnical\nWhat does ” REMODEL WITHOUT REMOVAL™” mean?\nWith SEMCO’s unique REMODEL WITHOUT REMOVAL™ system you can\nremodel any solid surface without the cost, inconvenience and potential\nenvironmental damage associated with the removal of the existing surface.\nSEMCO surface engineers have perfected this method through the use of the\nX-Bond Seamless Stone, which chemically adheres to any existing surface.\nThis system saves clients time and cost on their projects, while offering\nsignificant “GREEN” benefits.\nWhere can SEMCO’s X-BOND be used?\nOur seamless surfaces can be used for floors, walls for interior and exterior\nuse. You can even have it in your wet-rooms as it is waterproof. We are also\none of the very few manufacturers that allow an application in steam rooms.\nOn page 9 and 10 we are presenting the areas of application.\nWhat is X-Bond?\nA fluid applied seamless stone and polymer based surface coating that can\nbe used interior/exterior, vertical/horizontal, above and below grade. SEMCO’s\nX-Bond Seamless Stone forms a mechanically bond, while interlocking its\nown molecules to the surface it is applied creating a “Perfect Bond” on any\nexisting hard surface.\nWhat is the thickness of the X-BOND Seamless Stone?\nThe total thickness of the X-BOND Seamless Stone is normally 1/4” to 1/2”\nwhich makes it ideal for any remodelling projects as the height of your\nexisting doors do not need to be adjusted with the new floor.\nThe Green benefits of the X-BOND Seamless Stone.\nOur X-BOND Seamless Stone is designed mainly with water-based products\nand are environmental friendly. There is almost no odor present and low in\nVOC content. Green materials that can provide LEED points for the U.S. Green\nBuilding Council. Furthermore our products have been tested according to\nthe strict regulations of the European Union and lab results present an equiv-\nalent to the EC 1 PLUS which is the best result for green building and indoor\nair quality.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 318
  },
  {
    "id": "doc-product-brochure-p41",
    "docId": "doc-product-brochure",
    "pageNumber": 41,
    "text": "38\nFloor Details\nCrack Bridging",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 5
  },
  {
    "id": "doc-product-brochure-p42",
    "docId": "doc-product-brochure",
    "pageNumber": 42,
    "text": "39\nShower / Drain Details",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 5
  },
  {
    "id": "doc-product-brochure-p43",
    "docId": "doc-product-brochure",
    "pageNumber": 43,
    "text": "40\nCove Base Details",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 4
  },
  {
    "id": "doc-product-brochure-p44",
    "docId": "doc-product-brochure",
    "pageNumber": 44,
    "text": "41\nCove Base Details",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 4
  },
  {
    "id": "doc-product-brochure-p45",
    "docId": "doc-product-brochure",
    "pageNumber": 45,
    "text": "42\nPortfolio\nW ith almost 30 years on the market, we are proud to present some of rewarding projects from all\nover the world which display the versatility and performance of our X-BOND Seamless Stone.\nFor more projects with details, simply visit our website by scanningthe QR-Code on the back page.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 51
  },
  {
    "id": "doc-product-brochure-p46",
    "docId": "doc-product-brochure",
    "pageNumber": 46,
    "text": "3620 W Reno Avenue\nLas Vegas, NV 89118\nToll Free: 800.33.SEMCO (800.337.3626)\nFor more information,\nscan our QR-code\n@SEMCO.Remodel.Without.Removal\n@semcosurfaces\nMade in U.S.A.",
    "sourceDocument": "Product brochure.pdf",
    "title": "Product brochure",
    "category": "Brochure",
    "wordCount": 23
  },
  {
    "id": "doc-satin-stone-chemical-resistance-p1",
    "docId": "doc-satin-stone-chemical-resistance",
    "pageNumber": 1,
    "text": "Acetic Acid, 15% 1 Chloroform 1 Methanol 2\nAcetic Acid, 25% 2 Chromic Acid, 50% *1 Methylene Chloride 3 3\nAcetic Acid, Glacial 3 Citric Acid, 50% 1 Methyl Ethyl Ketone 4\nAcetone 4 Cola Syrup 1 Nitric Acid, 15% *1\nAluminum Chloride 1 Copper Chloride 1 Oleic Acid 1\nAluminum Nitrate 1 Copper Nitrate 1 Phosphoric Acid, 85% 1\nAluminum Sulfate 1 Copper Sulfate 1 Potassium Chloride 1\nAmmonium Hydroxide 1 Diesel Fuel 1 Potassium Cyanide 1\nAmmonium Nitrate 1 Ethyl Acetate 1 Potassium Hydroxide 1\nAmmonium Sulfate 1 Ethyl Alcohol 1 Potassium Nitrate 1\nAniline 3 Formaldehyde 1 Potassium Sulfate 1\nBarium Chloride 1 Formic Acid 25% 1 Skydrol 1\nBarium Hydroxide 1 Hydrobromic Acid, 48% *1 Sodium Hydroxide, 50% 1\nBarium Sulfide 1 Hydrochloric Acid, 37% *1 Sodium Chloride 1\nBeer 1 Hydrofluoric Acid, 25% 2 Sulphuric Acid, 50% *1\nBenzene 1 Hydrogen Peroxide, 30% 1 Tetrahydrofuran 1\nBrake Fluid 1 Lactic Acid, 50% 1 Tolulene 1\nBoric Acid 1 Lactic Acid, 85% 2 Trichlorethylene 1\nN-Butyric Acid, 50% 3 Jet Fuel 1 Trichlorethane 1\nCalcium Chloride 1 Isopropyl Alcohol 1 Urea 1\nCalcium Hydroxide 1 Maleic Acid, 40% 2 Xylene 1",
    "sourceDocument": "Satin-Stone-chemical-resistance.pdf",
    "title": "Satin Stone chemical resistance",
    "category": "Satin Stone",
    "wordCount": 195
  },
  {
    "id": "doc-satin-stone-data-sheet-p1",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 1,
    "text": "SATIN STONE Epoxy Polyaspartic Polyurethane\nUV Stable for Outdoors YES NO YES YES\nResistance to Highly Acidic Chemicals pH < 2 YES NO YES YES\nResistance to Extremely Alkaline Chemicals pH > 12 YES YES NO NO\nExtreme Abrasion Resistance YES YES NO NO\nBond strength exceeds 400 PSI YES YES NO YES",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 53
  },
  {
    "id": "doc-satin-stone-data-sheet-p2",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 2,
    "text": "Abrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nWater permeability EN 1062-3 W3 - low at 0.013\nVOC Emission test according EMICODE EC 1 PLUS\nPerformance test - stain resistance PASSED\nSlip resistance ADA Safety Surface DCOF 0.86\nSlip resistance AS/NZS 4586 - pendulum Slider 96(4S) - P4 = 45 - 54\n3/8” nap, woven",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 59
  },
  {
    "id": "doc-satin-stone-data-sheet-p3",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 3,
    "text": "Acetic Acid, 15% 1 Chloroform 1 Methanol 2\nAcetic Acid, 25% 2 Chromic Acid, 50% *1 Methylene Chloride 3 3\nAcetic Acid, Glacial 3 Citric Acid, 50% 1 Methyl Ethyl Ketone 4\nAcetone 4 Cola Syrup 1 Nitric Acid, 15% *1\nAluminum Chloride 1 Copper Chloride 1 Oleic Acid 1\nAluminum Nitrate 1 Copper Nitrate 1 Phosphoric Acid, 85% 1\nAluminum Sulfate 1 Copper Sulfate 1 Potassium Chloride 1\nAmmonium Hydroxide 1 Diesel Fuel 1 Potassium Cyanide 1\nAmmonium Nitrate 1 Ethyl Acetate 1 Potassium Hydroxide 1\nAmmonium Sulfate 1 Ethyl Alcohol 1 Potassium Nitrate 1\nAniline 3 Formaldehyde 1 Potassium Sulfate 1\nBarium Chloride 1 Formic Acid 25% 1 Skydrol 1\nBarium Hydroxide 1 Hydrobromic Acid, 48% *1 Sodium Hydroxide, 50% 1\n%DULXP\u00036XOƃGH 1 Hydrochloric Acid, 37% *1 Sodium Chloride 1\nBeer 1 +\\GURƄXRULF\u0003$FLG\u000f\u0003\u0015\u0018\b 2 Sulphuric Acid, 50% *1\nBenzene 1 Hydrogen Peroxide, 30% 1 Tetrahydrofuran 1\nBrake Fluid 1 Lactic Acid, 50% 1 Tolulene 1\nBoric Acid 1 Lactic Acid, 85% 2 Trichlorethylene 1\nN-Butyric Acid, 50% 3 Jet Fuel 1 Trichlorethane 1\nCalcium Chloride 1 Isopropyl Alcohol 1 Urea 1\nCalcium Hydroxide 1 Maleic Acid, 40% 2 Xylene 1",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 192
  },
  {
    "id": "doc-satin-stone-data-sheet-p4",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 4,
    "text": "Page 1 / 7\nSAFETY DATA SHEET\nIssue Date 3-04-2016 Revision Date 03-04-2016 Version 1\nProduct identifier\nProduct Name SATIN 6721(\nOther means of identification\nProduct Code XTS1000\nRecommended use of the chemical and restrictions on use\nRecommended Use For Industrial, and Commercial Use\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702-222-9495\nEmergency Telephone Chemtrec 1-800-424-9300\nClassification\nOSHA Regulatory Status\nThis chemical is considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.1200)\nLabel elements\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nSkin sensitization Category 1\nEmergency Overview\nWarning\nHazard statements\nMay cause an allergic skin reaction\nAppearance P a r t A M i l k y W h i t e P a r t B\nClear Liquid Physical state Liquid Odor Slight",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 160
  },
  {
    "id": "doc-satin-stone-data-sheet-p5",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 5,
    "text": "Page 2 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out of the workplace\nWear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get medical advice/attention\nWash contaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant\nHazards not otherwise classified (HNOC)\nOther Information\n! \"#$%&'()*+)#,'#*-.)(-&/)0-*1)(+23)(#4*-23)/&&/.*4\n! \"#$%&'()*+)#,'#*-.)(-&/\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Weight-% Trade Secret\nAmmonium hydroxide 1336-21-6 <0.10 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms No information available.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol-resistant foam or water spray.\nUnsuitable extinguishing media Caution: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo information available.\nExplosion data\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE-FIGHTING MEASURES",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 267
  },
  {
    "id": "doc-satin-stone-data-sheet-p6",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 6,
    "text": "Page 3 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self-contained breathing apparatus pressure-demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See Section 12 for additional ecological information.\nMethods and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so. Dike far ahead of spill; use dry sand to\ncontain the flow of material.\nMethods for cleaning up Pick up and transfer to properly labeled containers.\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well-ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines This product, as supplied, does not contain any hazardous materials with occupational\nexposure limits established by the region specific regulatory bodies.\nAppropriate engineering controls\nEngineering Controls Showers\nEyewash stations\nVentilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection No special technical protective measures are necessary.\nSkin and body protection No special technical protective measures are necessary.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive-pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Considerations Handle in accordance with good industrial hygiene and safety practice.\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 295
  },
  {
    "id": "doc-satin-stone-data-sheet-p7",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 7,
    "text": "Page 4 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nInformation on basic physical and chemical properties\nPhysical state Liquid\nAppearance Milky liquid Part A, Clear Part B Odor Slight\nOdor threshold No information available\nProperty\npH\nValues\n7-8\nRemarks • Method\nMelting point/freezing point 32°F\nBoiling point / boiling range >212°F similar to water\nFlash point Not applicable ,( water-base)\nproduct) Evaporation rate No information available\nFlammability (solid, gas) No information available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Dispersible\nSolubility in other solvents No information available\nPartition coefficient No information available\nAutoignition temperature No information available\nDecomposition temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nProtect from freezing - product stability may be affected.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProduct Information No data available\nInhalation No data available.\nEye contact No data available.\nSkin Contact No data available.\nIngestion .\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 204
  },
  {
    "id": "doc-satin-stone-data-sheet-p8",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 8,
    "text": "Page 5 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\nAmmonium hydroxide\n1336-21-6\n= 140 mg/kg ( Rat ) - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long-term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity 20.60961% of the mixture consists of ingredient(s) of unknown toxicity\nEcotoxicity\nHarmful to aquatic life\n14.9100635% of the mixture consists of components(s) of unknown hazards to the aquatic environment\nChemical Name Algae/aquatic plants Fish Crustacea\nAmmonium hydroxide\n1336-21-6\n- 4.1: 96 h Pimephales promelas\nmg/L LC50\n0.33: 24 h water flea mg/L EC50\n0.22: 24 h Daphnia pulex mg/L\nEC50\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS\n14. TRANSPORT INFORMATION",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 208
  },
  {
    "id": "doc-satin-stone-data-sheet-p9",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 9,
    "text": "Page 6 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nDOT Not regulated\nSea transport Not regulated\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non-Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains a chemical\nor chemicals which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 372\nChemical Name SARA 313 - Threshold Values %\n6$7,1\u00036721(\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\nAmmonium hydroxide\n1336-21-6\n1000 lb - - X\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances RQs CERCLA/SARA RQ Reportable Quantity (RQ)\nAmmonium hydroxide\n1336-21-6\n1000 lb - RQ 1000 lb final RQ\nRQ 454 kg final RQ\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\nreproductive harm.\nU.S. State Right-to-Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nAmmonium hydroxide\n1336-21-6\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\n15. REGULATORY INFORMATION",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 285
  },
  {
    "id": "doc-satin-stone-data-sheet-p10",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 10,
    "text": "Page 7 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nNFPA Health hazards 1 Flammability 0 Instability 0 Physical and Chemical\nProperties -\nHMIS Health hazards 1 Flammability 0 Physical hazards 0 Personal protection X\nPrepared By Samel Sem\nIssue Date 3-4-2016\nRevision Date 3-4-2016\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation relates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION",
    "sourceDocument": "Satin-Stone-Data-Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 146
  },
  {
    "id": "doc-satin-stone-sds-p1",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 1,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 1 of 7\nPage 1 / 7\nSAFETY DATA SHEET\nIssue Date 3-04-2016 Revision Date 03-04-2016 Version 1\nProduct identifier\nProduct Name SATIN STONE\nOther means of identification\nProduct Code XTS1000\nRecommended use of the chemical and restrictions on use\nRecommended Use For Industrial, and Commercial Use\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702-222-9495\nEmergency Telephone Chemtrec 1-800-424-9300\nClassification\nOSHA Regulatory Status\nThis chemical is considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.1200)\nLabel elements\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nSkin sensitization Category 1\nEmergency Overview\nWarning\nHazard statements\nMay cause an allergic skin reaction\nAppearance P a r t A M i l k y w h i t e P a r t B\nC l e a t liquid Physical state Liquid Odor Slight\nSATIN STONE\nSAFETY DATA SHEET",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 187
  },
  {
    "id": "doc-satin-stone-sds-p2",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 2,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 2 of 7\nPage 2 / 7\nSATIN STONE Revision Date 3-4-2016\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out of the workplace\nWear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get medical advice/attention\nWash contaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant\nHazards not otherwise classified (HNOC)\nOther Information\n• Harmful to aquatic life with long lasting effects\n• Harmful to aquatic life\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Weight-% Trade Secret\nAmmonium hydroxide 1336-21-6 <0.10 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms No information available.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol-resistant foam or water spray.\nUnsuitable extinguishing media Caution: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo information available.\nExplosion data\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE-FIGHTING MEASURES\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 301
  },
  {
    "id": "doc-satin-stone-sds-p3",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 3,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 3 of 7\nPage 3 / 7\nSATIN STONE Revision Date 3-4-2016\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self-contained breathing apparatus pressure-demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See Section 12 for additional ecological information.\nMethods and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so. Dike far ahead of spill; use dry sand to\ncontain the flow of material.\nMethods for cleaning up Pick up and transfer to properly labeled containers.\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well-ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines This product, as supplied, does not contain any hazardous materials with occupational\nexposure limits established by the region specific regulatory bodies.\nAppropriate engineering controls\nEngineering Controls Showers\nEyewash stations\nVentilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection No special technical protective measures are necessary.\nSkin and body protection No special technical protective measures are necessary.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive-pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Considerations Handle in accordance with good industrial hygiene and safety practice.\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 319
  },
  {
    "id": "doc-satin-stone-sds-p4",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 4,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 4 of 7\nPage 4 / 7\nSATIN STONE Revision Date 3-4-2016\nInformation on basic physical and chemical properties\nPhysical state Liquid\nAppearance Milky liquid Part A, Clear Part B Odor Slight\nOdor threshold No information available\nProperty\npH\nValues\n7-8\nRemarks • Method\nMelting point/freezing point 32°F\nBoiling point / boiling range >212°F similar to water\nFlash point Not applicable ,( water-base)\nproduct) Evaporation rate No information available\nFlammability (solid, gas) No information available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Dispersible\nSolubility in other solvents No information available\nPartition coefficient No information available\nAutoignition temperature No information available\nDecomposition temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nProtect from freezing - product stability may be affected.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProduct Information No data available\nInhalation No data available.\nEye contact No data available.\nSkin Contact No data available.\nIngestion .\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 228
  },
  {
    "id": "doc-satin-stone-sds-p5",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 5,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 5 of 7\nPage 5 / 7\nSATIN STONE Revision Date 3-4-2016\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\nAmmonium hydroxide\n1336-21-6\n= 140 mg/kg ( Rat ) - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long-term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity 20.60961% of the mixture consists of ingredient(s) of unknown toxicity\nEcotoxicity\nHarmful to aquatic life\n14.9100635% of the mixture consists of components(s) of unknown hazards to the aquatic environment\nChemical Name Algae/aquatic plants Fish Crustacea\nAmmonium hydroxide\n1336-21-6\n- 4.1: 96 h Pimephales promelas\nmg/L LC50\n0.33: 24 h water flea mg/L EC50\n0.22: 24 h Daphnia pulex mg/L\nEC50\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS\n14. TRANSPORT INFORMATION\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 232
  },
  {
    "id": "doc-satin-stone-sds-p6",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 6,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 6 of 7\nPage 6 / 7\nSATIN STONE Revision Date 3-4-2016\nDOT Not regulated\nSea transport Not regulated\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non-Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains a chemical\nor chemicals which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 372\nChemical Name SARA 313 - Threshold Values %\nSATIN STONE\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\nAmmonium hydroxide\n1336-21-6\n1000 lb - - X\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances RQs CERCLA/SARA RQ Reportable Quantity (RQ)\nAmmonium hydroxide\n1336-21-6\n1000 lb - RQ 1000 lb final RQ\nRQ 454 kg final RQ\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\nreproductive harm.\nU.S. State Right-to-Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nAmmonium hydroxide\n1336-21-6\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\n15. REGULATORY INFORMATION\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 310
  },
  {
    "id": "doc-satin-stone-sds-p7",
    "docId": "doc-satin-stone-sds",
    "pageNumber": 7,
    "text": "3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 / fax: 702.222.1788 semcosurfaces.com 7 of 7\nPage 7 / 7\nSATIN STONE Revision Date 3-4-2016\nNFPA Health hazards 1 Flammability 0 Instability 0 Physical and Chemical\nProperties -\nHMIS Health hazards 1 Flammability 0 Physical hazards 0 Personal protection X\nPrepared By Samel Sem\nIssue Date 3-4-2016\nRevision Date 3-4-2016\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation relates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION\nSATIN STONE Revision Date 3-4-2016",
    "sourceDocument": "Satin-Stone-SDS.pdf",
    "title": "Satin Stone SDS",
    "category": "Satin Stone",
    "wordCount": 170
  },
  {
    "id": "doc-satin-stone-tech-data-sheet-p1",
    "docId": "doc-satin-stone-tech-data-sheet",
    "pageNumber": 1,
    "text": "PRODUCT DESCRIPTION\nSatin Stone is the latest technology in SEMCO Cross Linking sealers. It interlocks with applied substrates solidifying\nand creating total surface protection with a density enhancement of up to 85%. Excellent for interior and exterior\nuse while handling rigorous surface conditions including high traffic commercial and industrial environments.\nUsed automobile oil Excellent\nTransmission fluid Good\nWater Excellent\nCooking oil Excellent\nWine Excellent\nAlkali resistance Excellent\nHydrochloric acid (10%) Good\nPolished concrete 200-250\nX-Bond Seamless Stone 250-300\nArtificial stone 200-250\nStamped concrete 300-350\nBelow grade N/A\nApplication Airless sprayer tip size 21 at 1,000 PSI\nApplication environment Apply at temperatures from 50°F to 90°F\nDrying time 1 hour at 72°F\nCure time 12 hours light foot traffic, 7 days full cure at 72°F\nColor Part A - milky white, Part B - light amber\nChemical type Polyurethane hybrid\nClean up SEMCO Stone Soap with water\nShelf life 1 year\nUseful life after mixing Part A with Part B 35 minutes after mixing\nPackaging (base and color activator) Part A - 1 gal. pail, Part B - 0.5 gal. pail\nSATIN STONE\nIndustrial Satin Finish Sealer\nTechnical Product Information\nAPPLICATION AND SPECIFICATIONS\nCOVERAGE (sq. ft. per gallon of mixture)\nTEST RESULTS*\nFEATURES / BENEFITS\n• Withstands industrial and commercial vehicle traffic\n• Rejuvenates color, leaves natural look\n• For interior and exterior surfaces\n• Resistant to chemicals: can be used in hospitals, laboratories, food\npreparation areas and automotive facilities\n*Also available with a non-skid additive\n*Available in color\nSUBSTRATES\n• X-Bond Seamless Stone\n• Pre-Stain Color\n• Color Green\n• New and existing concrete\n• Stamped concrete\n• Natural stone\n• Industrial and commercial floors\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2018.V01\nSURFACE ENGINEERING COMPANY\nMIXING RATIO: 2 Parts A : 1 Part B\nConcrete or X-BOND substrate\nCatalyst\nResin",
    "sourceDocument": "Satin-Stone-Tech-Data-Sheet.pdf",
    "title": "Satin Stone Tech Data Sheet",
    "category": "Satin Stone",
    "wordCount": 306
  },
  {
    "id": "doc-satin-stone-tech-sheet-p1",
    "docId": "doc-satin-stone-tech-sheet",
    "pageNumber": 1,
    "text": "Product Data\nSATIN STONE\nSatin Stone is the latest technology in SEMCO Cross Linking sealers. It interlocks with applied\nsubstrates solidifying and creating total surface protection with a density enhancement of up to\n85%. Excellent for interior and exterior use while handling rigorous surface conditions including\nhigh traffic commercial and industrial environments.\nPRODUCT\nUSES\nCOVERAGE\nConcrete 200 - 250\nPolished concrete 250 - 300\nArtificial stone 200 - 250\nStamped Concrete 150 - 250\nNatural stone 150 - 250\nSEMCO ADA 150 - 250\nCOVERAGE sq ft. / 1,5 gal Kit @ min 2 coats at 20\nmils total thickness\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• New and existing concrete\n• New and existing coatings\n• Polished concrete\n• New and existing stamped\n• Concrete\nInterior\nExterior\nWetrooms\nCommercial\nIndustrial\n\n\n\n\n\nSURFACE ENGINEERING COMPANY\nGet the durability and\nperformance of a solvent-based\nsystem, but with the easy\napplication and clean-up of\nwater-based products.\nUV-resistant and can be applied to\nmultiple surfaces to give\nextra protection.\nWith its low water permeability, Satin\nStone can be used in showers.\nSatin Stone’s extreme durability and\nresistance to abrasion, allows it to be\nused in high foot traffic areas such as\ncommercial spaces.\nExcellent chemical resistance and\nindustrial strength finish allow Satin\nStone to be used in an industrial\nenvironment.",
    "sourceDocument": "Satin+Stone+Tech+Sheet.pdf",
    "title": "Satin Stone Tech Sheet",
    "category": "Satin Stone",
    "wordCount": 222
  },
  {
    "id": "doc-satin-stone-tech-sheet-p2",
    "docId": "doc-satin-stone-tech-sheet",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Airless sprayer tip size 21 at 1,000 PSI , Magic Trowel, 3/8” soft woven roller\nApplication environment Apply at temperatures from 50°F to 90°F\nColor Part A - milky white, Part B - light amber\nChemical type Polyurethane hybrid\nClean up SEMCO Stone Soap with water\nShelf life 1 year in controlled environment (ambient temperature of 60F - 72F)\nPackaging Part A - 1 gal. pail, Part B - 0.5 gal. pail\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n1 h\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated\nindividually.\nThe chart represents the time needed in be -\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n10 days 3 days\n50%\n12 hrs\nLight foot traffic\n50 F 72 F 95 F\n5 days 7 days\n95 F 80 F 60 F\n2.5 h\n2 h\nCURE TIME\nTEST RESULTS\nAbrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nWater permeability EN 1062-3 W3 - low at 0.013\nVOC Emission test according EMICODE EC 1 PLUS\nPerformance test - stain resistance passed\nSlip resistance ADA Safety Surface DCOF 0.86\nSlip resistance AS/NZS 4586 - pendulum Slider 96(4S) - P4 = 45 - 54\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.",
    "sourceDocument": "Satin+Stone+Tech+Sheet.pdf",
    "title": "Satin Stone Tech Sheet",
    "category": "Satin Stone",
    "wordCount": 254
  },
  {
    "id": "doc-satin-stone-tech-sheet-p3",
    "docId": "doc-satin-stone-tech-sheet",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO Satin Stone are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a reduction in\ngloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment or loaded\npallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures over the sur -\nface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP Manual under\nthe Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1\n• Mix 2 parts of Part A and 1 part of Part B (included in your product order) with a low speed mixer and epoxy mixing paddle\n(at 200 - 300 RPM for 20 seconds), stirring thoroughly, avoid mixing more product than can be applied. Product pot life is up\nto 35 minutes depending on temperature (MARK TIME ON CONTAINER)Test pH level after preparation\n• Use airless sprayer with tip size 21 at 850-1,000 PSI. Position the airless sprayer gun at 18” away from the floor\n• OPTIONAL: use magic trowel to spread the product. Do not go back and forth\n• Minimum of 2 coats is required to ensure a 20 mils total thickness\n• On vertical surfaces : Apply Satin Stone with a 3/8” soft woven roller and use Magic trowel to spread it evenly. Start from top\nto bottom. Minimum of 3 coats is required. Use HVLP with a large tip to apply Satin Stone on large surface areas.\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 21\n• Optional : Magic Trowel\n• Woven nap roller for vertical surfaces\nScan to watch application",
    "sourceDocument": "Satin+Stone+Tech+Sheet.pdf",
    "title": "Satin Stone Tech Sheet",
    "category": "Satin Stone",
    "wordCount": 595
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces-p1",
    "docId": "doc-section-09670-fluid-applied-surfaces",
    "pageNumber": 1,
    "text": "SECTION 9700 – SEAMLESS STONE FINISH 1\nSEMCO Modern Seamless Surfa ce\n3620West Reno Avenue Suite J\nLas Vegas, Nevada 89118\nSECTION 0967 0\nFLUID APPLIED SURFACING\nPART 1 – GENERAL\n1.01 SUMMARY\nA. Section includes: Cleaning, preparation and color finishing of\nspecified concrete surfaces. This work shall include providing and\napplying special concrete Natural Finish coloration system\nin accordance with the provisions of the plan documents and other\nsections of the project specifications.\nB. Related Documents: The conditions of the Contract apply to this\nsection as fully as if repeated herein.\nC. Related Work: Se ction 9700\n1.02 SUBMITTALS\nA. Submit proposed construction material SDS sheets for materials\nto be used for the coloring, and/or etching of concrete surfaces.\n1.03 TEST PANEL (S)\nA. The Contractor shall demonstrate his workmanship by constructing\ntest panel(s) fo r coloring types specified using approved coloring\nmaterials.\nB. The architectural surface treatments of the finished work shall\nachieve the same final effect as demonstrated on the approved test panel(s).\nC. The material used in construction of the jobsi te test panel(s) shall comply\nwith the related concrete specification sections applicable to the project work.\nThe mix utilized for the test panel(s) shall be same pounds per square inch (PSI)\nconcrete mix as specified for the project work. The color sh all produce the same\ncolor intended for use on the finished surface and shall be incorporated into the\nfinal work. The test panel(s) shall be un - reinforced concrete; constructed to\ndetermine the surface coloring result by use of approved coloring material s. The\nsize of the concret e test panel(s) shall be three (3) feet wide by three (3 ) feet\nlong, (unless noted otherwise). Unsatisfactory panel(s) shall be removed and\nreplaced with satisfactory panel(s). Disposal of test panel(s) when work is\ncomplete to be done by General Contractor.",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "title": "Section 09670 Fluid Applied Surfaces",
    "category": "Technical doc",
    "wordCount": 307
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces-p2",
    "docId": "doc-section-09670-fluid-applied-surfaces",
    "pageNumber": 2,
    "text": "SECTION 9700 – SEAMLESS STONE FINISH 2\nSEMCO Modern Seamless Surfa ce\n3620West Reno Avenue Suite J\nLas Vegas, Nevada 89118\n1.04 QUALITY ASSURANCE\nA. Quality Standards: The standards named herein are specified to\nestablish standards of quality, performance, and compliance with the design\nconcept which is to duplicate the color of the approved “r eferee sample”.\nB. Test Panels: Provide a minimum of two test panels utilizing the\nsame concrete materials as provided at the project site with the same finish as\nconcrete areas to receive coloring and etching. Each panel will be a minimum of\n9 square feet in size (unless noted otherwise), and found in unobtrusive location\nas selected by the Architect’s representative, to demonstrate color and texture of\nthe designed surface. Obtain the Architect’s representative’s acceptance of\nvis ual qualities of the test panels before start of the project coloring. Retain test\npanels during construction as standards for judging completed work.\nC. Experience and Qualifications:\n1. The products and work shall be supplied by a subcontractor h aving\nexperience in sandblast etching and coloring, being a Licensed and\nCertified Contractor by the manufacturer, and having two (2) years\nexperience with the “X - BOND” System, preparation, coloring and finish\nsystems.\n2. Contractor shall furnish evidence to the satisfaction of the\nArchitect that proposed products have been successfully used in other\nsimilar scale coloring applications.\nD. System Performance shall meet the following requirements:\n1. Standard Guide for Testing Industrial Protective C oatings:\nASTM – D6577 - 00a\n2. Standard Test Method for chipping resistance of coatings:\nASTM _ D3170 - 03\n3. Standard Test Method for bond strength adhesive systems used with\nconcrete as measured by direct tension:\nASTM – C1404/C1404M - 98(2003)\n4. Standard Test Met hod for pull off strength of coatings using portable\nadhesion testers:\nASTM – D541 - 02\n5. Determination of depth of penetration of clear penetrating water\nrepellents on concrete.\nASTM – WK5956\n6. Standard Test Method Volatile Organic Content\nASTM D - 3960\n7. Stan dard Test Method Water Content\nASTM D - 3792\n8. Standard Test Method Solvent Content\nASTM D - 4457",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "title": "Section 09670 Fluid Applied Surfaces",
    "category": "Technical doc",
    "wordCount": 354
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces-p3",
    "docId": "doc-section-09670-fluid-applied-surfaces",
    "pageNumber": 3,
    "text": "SECTION 9700 – SEAMLESS STONE FINISH 3\nSEMCO Modern Seamless Surfa ce\n3620West Reno Avenue Suite J\nLas Vegas, Nevada 89118\n9. Standard Test Method Non Volatile Residue\nASTM D - 2369\n10. Standard Test Method Density\nASTM D - 1457\n1.05 WARRANTY\nA. SEMCO pr ovides a standard fi ve yea r warranty on the X - Bond System against\ndelamination when installed by a n approved in staller or installer that has received\na training course for use by SEMCO Surfaces Inc. ,\nPART 2 – PRODUCTS\n1.06 MATERIALS\nA. Specifications are based on products as manufactured by SEMCO, Inc.\n3620 W. Reno Ave Suite J , Las Vegas, Nevada 89118 . Phone: (702) 222 - 9495\nFax: (702) 222 - 1788.\nB. X - BOND SYSTEM with integral color to match final approved surface color.\nSuperior Adhesion, UV Resistance, Waterproof seamless stone system.\nTT - P - 001411 (Waterproofing below grade). Integration of SEMCO X - Bond\nLiquid Membrane and Re i nforcing F abric to meet ANSI 118 - 10 -\nW aterproofness ASTM D4068 - 01\nC. U se of the X - Bond Seamless Stone , Liquid Memb rane , and Reinforcing Fabric\ncan be used over interior joints to create a continuous surf ac e . Expansion j oints ,\ncold joints and/ or submerged joints in an exterior environment should be hono red\ndue to continuous fluctuations in temperatures and o ther exterior conditions .\nD. In accordance with the desired thickness, the use of the SEMCO X - BOND\nBROWN COAT will be necessary as a rap id 24 hour cure surface filler /level .\nSEMCO Brown Coat forms a mechanical cross link with the substrate enabling a\nperfe ct bond. The Brown Coat also has an integrated waterproofing system. TT -\nP - 001411 (Waterproofing below grade). Application can be done up to 6 inches\nin a single pour.\nE. Special surface colors shall be performed using approved colors\nsuitable for the purpos e intended and applied in a manner consistent with the\ndesign intent of the project. The Architects approved “test panel” shall act as the\nbasis for determining the appropriate color application.\nF. The color agent shall be a penetrating mix, compatible col or finish\nfor the exterior application on new concrete with field evidence of resistance to\nmoisture, alkali, acid and mildew, mold and fungus, or degradation. The\ncoloring agent shall be breathable, allowing moisture and vapor transmission.",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "title": "Section 09670 Fluid Applied Surfaces",
    "category": "Technical doc",
    "wordCount": 411
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces-p4",
    "docId": "doc-section-09670-fluid-applied-surfaces",
    "pageNumber": 4,
    "text": "SECTION 9700 – SEAMLESS STONE FINISH 4\nSEMCO Modern Seamless Surfa ce\n3620West Reno Avenue Suite J\nLas Vegas, Nevada 89118\nG. All materia ls shall be furnished, prepared, applied, cured, and\nstored according to Product Manufacturer directions with special attention given\nt o recommended temperature range for finish systems.\nPART 3 – EXECUTION\n1.07 APPLICATION OF SEAMLESS STONE AND FINISH\nA. Concrete should be at least 28 days old, free from dark alkali spots,\na nd clean from grease, paint, oil, soap, and other foreign matter, which would\nprevent necessary bonding, penetration and subsequent reac tion of the color with\nthe concrete surface to be colored.\nB. Preparation: Clean concrete to ensure the surface is free of all\nlatency, dirt, dust, grease, efflorescence, paint, and any foreign material prior to\nthe color application in accordance with SEMCO manufacturer’s\nrecommendations. All surfaces must check pH balance and use solution to meet\nSEMCO manufacturer’s recommendations. The subcontractor shall correct, at\nhis own cost, any surface problems cr eated as a direct result of the surface\npreparation methods used.\nC. While substrate is damp apply STONE SOAP to all areas receiving X - BON D.\nUse a low speed scrubber with a blue nylon concrete cleaning brush to help\nagitate the surface and then pressure wash clean. Mixture ratio of (4:1) for\nnormal cleaning of newly cured concrete. Do not use hydrochloric acids or other\nchemicals that may r eact or allow discoloration of the substrate.\nD. Remove oil, wax, and grease by use of SEMCO Power Cleaner – Biodegradable\nDegreaser . Remov e mineral or calcium de posits by use of SEM CO NuLift\nClean er – Biodegradable Mineral Cleanser\nE. X - Bond Seamless Stone Thickness FOR WATERPROOFING required:\nminimum 8 mm. This includes the Brown Coat. For de tails of the installation\ntechniq ue of the X - Bond , please re fer to manufacturer insta llation instructions.\nF. Apply SEMCO X - Bond System to achieve desired texture; according to\napproved sample; only to areas or graphics intended to receive color. Apply\ncolor to provide coverage as recommended b y manufacturer or to achieve the\ncolors selected and to match the approved “test panel” for coloration. Apply\neach coat thin and evenly. ALWAYS TEST A SMALL AREA FIRST. Allow\nPRE STAIN SYSTEM to completely dry.\n1.08 SEALER",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "title": "Section 09670 Fluid Applied Surfaces",
    "category": "Technical doc",
    "wordCount": 389
  },
  {
    "id": "doc-section-09670-fluid-applied-surfaces-p5",
    "docId": "doc-section-09670-fluid-applied-surfaces",
    "pageNumber": 5,
    "text": "SECTION 9700 – SEAMLESS STONE FINISH 5\nSEMCO Modern Seamless Surfa ce\n3620West Reno Avenue Suite J\nLas Vegas, Nevada 89118\nA. Consult SEMCO Surfaces Inc for the best suitable sealer . number (702) 22 2 -\n9495 , info@semco surfaces.com\n1.09 CLEAN - UP\nA. During the progress, and at the completion of work, Contractor is t o remove all\ntrash, debris, and all other foreign objects from the project site an d leaves the site\nclean and in an orderly condition.\n1.10 PROTECTION\nA. Protect applied colors from adverse climatic conditions during application and\ncuring stages. Apply only if weather conditions are between 50 and 100 degre es.\nDo not store in excessive heat or leave containers in direct sunlight.\nB. A ll special finishes and surfaces shall be protected prior to and up until\nfinal acceptance of the project.\n***END OF SECTION***",
    "sourceDocument": "Section-09670-Fluid-Applied-Surfaces.pdf",
    "title": "Section 09670 Fluid Applied Surfaces",
    "category": "Technical doc",
    "wordCount": 145
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p1",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 1,
    "text": "S U R F A C E S",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 8
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p2",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 2,
    "text": "SEMCO Surfaces is an innovation-driven surface\nengineering company responsible for the creation\nof industry-leading building materials — including\nthe world’s first microcement, X-Bond.\nFor over three decades, SEMCO has brought\ndesigns to life for clients worldwide across major\nhospitality, industrial, commercial, public and\nresidential projects.\nNow, there are SEMCO offices in major cities in the\nUnited States, Australia, New Zealand, Switzerland,\nChina, Japan, Spain, Mexico, Puerto Rico and\nCambodia.\nOur products have been\nrevolutionizing the surfacing\nindustry since 1991\n30 years of engineering excellence",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 84
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p3",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 3,
    "text": "The original microcement.\nScan to\nlearn more.\nWhen it was first developed in 1991, X-Bond\ndisrupted the surfacing industry; a\ngroundbreaking alternative to traditional floor,\nwall, or joinery materials made of natural stone\nand latex polymer. Our advanced microcement\nsystem can be seamlessly applied over almost any\nexisting surface.\nA sleek, smooth finish with\nsubtle tonal variations\ncreated using a trowel.\nX-Bond Corsa\nA delicately textured finish\nwhere elegance meets\nslip-resistant functionality.\nX-Bond Vellum\nDISCOVER OUR TWO MOST POPULAR TEXTURES\nX-Bond Microcement\n3620 W Reno Avenue | Las Vegas, NV 89118 | 800.33 SEMCO | info@semcosurfaces.com | semcosurfaces.com",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 98
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p4",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 4,
    "text": "Solutions\nSEMCO Surfaces combines\nengineering with aesthetics to\ndeliver customized surface solutions.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 12
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p5",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 5,
    "text": "Remodel Without Removal ™\nUsing innovative science, our engineers have developed a solution to resurfacing almost any solid substrate\nwithout the need for its removal. The SEMCO Remodel Without Removal™ system saves clients the cost,\ninconvenience, and potential environmental damage associated with demolition. The result is a versatile,\nmodern, and beautiful new surface built to last.\nX-Bond is mixed with polymer bonding agents to ensure a long-lasting resurfacing job that maintains\nexceptional quality in the future. The X-Bond system is applied at approximately 1/8” thick over a wide range\nof substrates, including; concrete, tiles, compressed sheeting, plasterboard, villaboard, MDF, and more.\nResurfacing made easy\n3620 W Reno Avenue | Las Vegas, NV 89118 | 800.33 SEMCO | info@semcosurfaces.com | semcosurfaces.com\nRemodel Without Removal ™\nScan to\nlearn more.\nEsperanza, An Auberge Resort, Cabo San Lucas",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 135
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p6",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 6,
    "text": "Remodel Without Removal ™\nIf you’re seeking to replace damaged or discolored\nconcrete, our surface engineers have devised an\nalternative solution to ripping up and re-laying it. Bypass\nthis costly, messy, and time consuming process using\nSEMCO’s trademark anti-fracture membrane and X-\nBond Microcement. Achieve the concrete look you love,\nwith a quicker and easier application.\nGive old concrete new life\n3620 W Reno Avenue | Las Vegas, NV 89118 | 800.33 SEMCO | info@semcosurfaces.com | semcosurfaces.com\nConcrete Resurfacing\nScan to\nlearn more.\n✓ Durable\n✓ Versatile design options\n✓ Seamless installation\n✓ Diverse applications\n✓ Concrete aesthetic",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 98
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p7",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 7,
    "text": "Remodel Without Removal ™\nX-Bond Microcement is suitable for walls, floors,\nand joinery throughout your entire bathroom —\nincluding inside the shower.\nWith a hand-troweled installation process, the\nresult is a seamless surface with no grout lines.\nApplied at a minimal thickness and with\nexcellent adhesion to almost any substrate, X-\nBond is the easiest way to remodel old tiles. Our\nprofessional-grade sealers and advanced\nwaterproofing ensure durability in all wet areas.\nSeamless solutions for bathroom\nsurfaces\n3620 W Reno Avenue | Las Vegas, NV 89118 | 800.33 SEMCO | info@semcosurfaces.com | semcosurfaces.com\nSeamless Bathroom\nScan to\nlearn more.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 99
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p8",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 8,
    "text": "Remodel Without Removal ™\nThe SEMCO Liquid Membrane™ is a single\ncomponent water-based waterproofing and anti-\nfracture membrane. This revolutionary blend\nenables easy application while providing excellent\ncrack bridging and waterproofing for long-lasting\nprotection.\nAdvanced waterproofing membrane and\ncrack bridging protection\n3620 W Reno Avenue | Las Vegas, NV 89118 | 800.33 SEMCO | info@semcosurfaces.com | semcosurfaces.com\nFix Leaks: SEMCO Liquid Membrane™\nOur ready-to-use waterproofing and anti-fracture\nmembrane in one, safe to use both indoors and\noutdoors. The formula contains and boasts plenty of\nother benefits too:\n✓ Easy to apply in 2 coats with a roller, sprayer or brush\n✓ Up to 1300% elongation\n✓ Exceptional adhesion on almost any hard surface\n✓ No solvents, non-toxic, and VOC-free\nScan to\nlearn more.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 123
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p9",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 9,
    "text": "Case Studies\nA selection of residential,\ncommercial, hospitality, and public\nprojects featuring X-Bond\nMicrocement.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 14
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p10",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 10,
    "text": "An original limestone cottage built in 1877, upgraded for 21st century living. Creating\nseamless continuity from inside to out, X-Bond is on display almost everywhere.\nSorrento Residence\nVictoria, Australia\nResidential\nScan to view\nmore.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 34
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p11",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 11,
    "text": "This iconic, world-class shopping destination received a stunning surface-lift with SEMCO\nproducts, resurfacing 130,000 square feet of existing flooring.\nThe Venetian Grand Canal Shoppes\nLas Vegas, USA\nCommercial\nScan to view\nmore.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 32
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p12",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 12,
    "text": "A renovation of ten suites in need of a durable new floor surface that\ncould be applied straight over cracked concrete. X-Bond was the only\noption for withstanding a high volume of visitor traffic, and meeting the\naesthetic standards of a five-star luxury resort\nEsperanza Resort\nCabo San Lucas, MEX\nHospitality\nScan to view\nmore.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 55
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p13",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 13,
    "text": "The YMCA at Centennial Hills Community Center experiences heavy foot traffic across\ntheir pool deck and bathroom / locker room facilities. As a result of the extensive daily use,\nthe seven-year old surfaces needed an upgrade.\nYMCA at Centennial Hills Community Center\nLas Vegas\nPublic\nScan to view\nmore.\nBEFORE\nAFTER",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 51
  },
  {
    "id": "doc-semco-surfaces-brochure-digital-v2-p14",
    "docId": "doc-semco-surfaces-brochure-digital-v2",
    "pageNumber": 14,
    "text": "info@semcosurfaces.com\nPhone 702.222.9495\nEmail\nGet in touch Learn more\nScan the QR code to visit our\nSEMCO Surfaces website and\nlearn more about our products.",
    "sourceDocument": "SEMCO Surfaces Brochure (digital)V2.pdf",
    "title": "SEMCO Surfaces Brochure (digital)",
    "category": "Brochure",
    "wordCount": 25
  },
  {
    "id": "doc-shower-detail-concrete-p1",
    "docId": "doc-shower-detail-concrete",
    "pageNumber": 1,
    "text": "EXISTING\nSUBSTRATE\nconcrete or construction\nboards/panels\n1. Existing substrate - concrete or construction boards/panels\n2. Scratch Coat\n3. SEMCO Liquid Membrane™ (Fabric Reinforcement at joints and inside corners)\n4. Scratch Coat\n5. Brown Coat (optional build)\n6. X-Bond Seamless Stone\n7. Satin Stone or Titan Shield Gloss\nTotal system thickness - 3/16” (4.75mm)\n1/8” X-Bond + 60 mil SEMCO Liquid Membrane™\n3 2 7 4\n1\n2021 .V02 * Drawings are not to scale\nSCRATCH COAT\nSEMCO\nLIQUID MEMBRANE™\nwith Fabric Reinforcement\nSCRATCH COAT\nBROWN COAT\noptional build\nX-BOND SEAMLESS\nSTONE\nX-Bond over concrete or construction boards/panels SURFACE ENGINEERING COMPANY\nSHOWER DETAIL\n5 6\nFINISH\nSatin Stone or Titan Shield Gloss\n*Xtra Gloss for steam showers\n*Xtra Gloss for steam showers",
    "sourceDocument": "Shower-Detail-Concrete.pdf",
    "title": "Shower Detail Concrete",
    "category": "Shower detail",
    "wordCount": 121
  },
  {
    "id": "doc-shower-detail-wood-p1",
    "docId": "doc-shower-detail-wood",
    "pageNumber": 1,
    "text": "2 6 3\n1\n2021 .V02 * Drawings are not to scale\n1. Existing substrate - wood (plywood and/or OSB boards)\n2. SEMCO Liquid Membrane™ (Fabric Reinforcement at joints and inside corners)\n3. Scratch Coat\n4. Brown Coat (optional build)\n5. X-Bond Seamless Stone\n6. Satin Stone or Titan Shield Gloss\nTotal system thickness - 3/16” (4.75mm)\n1/8” X-Bond + 60 mil SEMCO Liquid Membrane™\nEXISTING\nSUBSTRATE\nwood (plywood and/or\nOSB boards)\nSEMCO\nLIQUID MEMBRANE™\nwith Fabric Reinforcement\nSCRATCH COAT\nBROWN COAT\noptional build\nX-BOND SEAMLESS\nSTONE\nX-Bond over wood (plywood and/or OSB boards) SURFACE ENGINEERING COMPANY\nSHOWER DETAIL\n4 5\nFINISH\nSatin Stone or Titan Shield Gloss\n*Xtra Gloss for steam showers\n*Xtra Gloss for steam showers",
    "sourceDocument": "Shower-Detail-Wood.pdf",
    "title": "Shower Detail Wood",
    "category": "Shower detail",
    "wordCount": 118
  },
  {
    "id": "doc-shower-detail-p1",
    "docId": "doc-shower-detail",
    "pageNumber": 1,
    "text": "2 5 4 6 7 3\n1\n2021 .V02 * Drawings are not to scale\nEXISTING\nSUBSTRATE\ntile or grouted substrates\n(including block or CMU)\n1. Existing substrate - tile or grouted substrates (including block or CMU)\n2. Scratch Coat\n3. SEMCO Liquid Membrane™ (Fabric Reinforcement at joints and inside corners)\n4. Scratch Coat\n5. Brown Coat (required for leveling and grout elimination)\n6. X-Bond Seamless Stone\n7. Satin Stone or Titan Shield Gloss SCRATCH COAT\nTotal system thickness - 3/16” (4.75mm)\n1/8” X-Bond + 60 mil SEMCO Liquid Membrane™\nSEMCO\nLIQUID MEMBRANE™\nwith Fabric Reinforcement\nSCRATCH COAT\nBROWN COAT\nrequired for leveling and\ngrout elimination\nX-BOND SEAMLESS\nSTONE\nFINISH\nSatin Stone or Titan Shield Gloss\nX-Bond over tile or grouted substrates (including block or CMU) SURFACE ENGINEERING COMPANY\nSHOWER DETAIL\n*Xtra Gloss for steam showers\n*Xtra Gloss for steam showers",
    "sourceDocument": "Shower-Detail.pdf",
    "title": "Shower Detail",
    "category": "Shower detail",
    "wordCount": 141
  },
  {
    "id": "doc-shower-drain-detail-p1",
    "docId": "doc-shower-drain-detail",
    "pageNumber": 1,
    "text": "X-Bond Seamless Stone will bond directly\nto the drain enclosure, ensure application\nto drain enclosure only not the strainer\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10 X-Bond Seamless Stone\nX-Bond Brown Coat\nFabric reinforcement encapsulated in X-Bond Brown Coat\n1. Strainer\n2. Drain head adapter\n3. X-Bond Seamless Stone (minimum thickness 1/8”), sloped for proper drainage\n4. X-Bond Brown Coat (minimum thickness 1/4”), sloped for proper drainage\n5. Fabric reinforcement encapsulated in X-Bond Brown Coat. Applied directly to substrate, over drain flange and\nclamping collar. Extended 24” radius on substrate around the drain.\n6. Concrete substrate\n7. Flange\n8. Clamping collar\n9. Drain base\n10. Plumbing waste line\nScale 6”=1’-0”\nSHOWER DRAIN DETAIL\nX-Bond Seamless Stone over concrete substrate SURFACE ENGINEERING COMPANY\n3620 W Reno Avenue / Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2019.V01",
    "sourceDocument": "Shower-Drain-Detail.pdf",
    "title": "Shower Drain Detail",
    "category": "Shower detail",
    "wordCount": 138
  },
  {
    "id": "doc-stair-detail-p1",
    "docId": "doc-stair-detail",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nPLYWOOD\nPREPARATION - TYPE E\nSEMCO\nLIQUID MEMBRANE™\n1st coat\nFABRIC REINFORCEMENT\n6” wide\nSEMCO\nLIQUID MEMBRANE™\n2nd coat\n2021 .V02 * Drawings are not to scale\nLiquid Membrane over plywood SURFACE ENGINEERING COMPANY\nSTAIR DETAIL",
    "sourceDocument": "Stair-Detail.pdf",
    "title": "Stair Detail",
    "category": "Technical doc",
    "wordCount": 38
  },
  {
    "id": "doc-stone-soap-datasheet-p1",
    "docId": "doc-stone-soap-datasheet",
    "pageNumber": 1,
    "text": "Used automobile oil Good\nTransmission fluid Good\nWater N/A\nDilution ratios with water Heavy duty cleaner - 1:4, regular cleaner - 1:9\nDrying time N/A\nCure time N/A\nColor Green\nChemical type Industrial cleaner\nClean up Water\nShelf life 1 year\nUseful life 3 years\nPackaging (base and color activator) 1 quart, 1 gal. pail, 5 gal. pail\nSTONE SOAP\nCommercial Neutral Cleaner\nTechnical Product Information\nPRODUCT DESCRIPTION\nStone Soap is a highly concentrated, heavy duty cleaner formulated for cleaning without harming\nfinished surfaces. Stone Soap is a 100% biodegradable product. Stone Soap is a user friendly,\nenvironmentally-responsible product that is excellent for cleaning any surface.\nAPPLICATION AND SPECIFICATIONS\nTEST RESULTS*\nFEATURES / BENEFITS\n• User friendly\n• Equally effective in hard or soft water\n• Neutral pH cleaner\n• 100% biodegradable\n• Can be safely used in confined environment\nSUBSTRATES\n• X-Bond Seamless Stone\n• Pre-Stain Color\n• Existing concrete or sealers\n• Ceramic tile and grout\n• Natural stone\n*Tests are based on Semco Modern Seamless Surface experience unless otherwise noted.\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners.\nNot for use on humans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet\nbefore using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness\nof use. The only obligation of the seller-manufacturer shall be to replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or\nconsequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate. However, since the conditions of handling\nand use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply\nwith all applicable federal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2016.V02\nSURFACE ENGINEERING COMPANY",
    "sourceDocument": "Stone-Soap-Datasheet.pdf",
    "title": "Stone Soap Datasheet",
    "category": "Technical doc",
    "wordCount": 393
  },
  {
    "id": "doc-stone-soap-sds-p1",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 1,
    "text": "Revised on 05 /10 /2017 Page 1 of 6\nSafety Data Sheet\n1. PRODUCT AND COMPANY IDENTIFICATION\nProduct Name: Stone Soap\nProduct Number: SS100, SS101, SS105, SS 155\nProduct Use: Industrial, Commercial, and Residential\nManufacturer: SEMCO Modern Seamless Surface I nc.\n3620 West Reno Ave.\nLas Vegas, NV 89118\nFor More Information Call: 702 - 222 - 9495 (Monday - Friday 9:00 - 4:00 PST)\nIn Case of Emergency Call: CHEMTREC - 800 - 424 - 9300 or 703 - 527 - 3887 (24 Hours/Day, 7 Days/Week)\n2. HAZARDS IDENTIFICATION\nOSHA Hazards : None\nTarget Organs: N/A\nSignal Words: None\nPictograms:\nN/A\nGHS Classification:\nNot a hazardous substance or mixture\nCarcinogenicity :\nSTONE SOAP",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 114
  },
  {
    "id": "doc-stone-soap-sds-p2",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 2,
    "text": "Revised on 05 /10 /2017 Page 2 of 6\n3. COMPOSITION/INFORMATION ON INGREDIENTS\nHazardous components\nChemical Name CAS - No. Concentration [%]\nAlc ohols, C10 - 14, ethoxylated 66455 - 15 - 0 >= 1 - < 5\n1 - (1 - methyl - 2 - propoxyethoxy)propan - 2 - ol 29911 - 27 - 1 >= 1 - < 5\n4. FIRST - AID MEASURES\nEyes Rinse with plenty of water for at least 15 minutes and seek medical attention immediately.\nInhalation Move casual ty to fresh air and keep at rest. If breathing is difficult, give oxygen. If not\nbreathing, give artificial respiration. Get medical attention immediately.\nSkin Immediately flush with plenty of water for at least 15 minutes while removing contaminated\nclo thing and wash using soap. Get medical attention immediately.\nIngestion Do Not Induce Vomiting! Never give anything by mouth to an unconscious person. If\nconscious wash out mouth with water. Get medical attention immediately.\n5. FIRE - FIGHTING MEASURES\nS uitable (and unsuitable)\nextinguishing media\nDry chemical\nCarbon dioxide (CO2) Alcohol - resistant foam\nWater spray jet\nUnsuitable extinguishing media High Volume water jet\nSpecific hazards arising from\nthe chemical\nUse extinguishing measures that are app ropriate to local\ncircumstances and the surrounding environment.\n6. ACCIDENTAL RELEASE MEASURES\nPersonal precautions,\nprotective equipment and\nemergency procedures\nUse personal protective equipment. Ensure adequate\nventilation.\nRefer to protective measu res listed in sections 7 and 8.\nEnvironmental precautions Use personal protective equipment. Ensure adequate ventilation.\nRefer to protective measures listed in sections 7 and 8.\nMethods and materials for\ncontainment and cleaning up\nUse personal protecti ve equipment. Ensure adequate\nventilation.\nRefer to protective measures listed in sections 7 and 8.\n7. HANDLING AND STORAGE\nAdvice on safe handling : For personal protection see section 8.\nSmoking, eating and drinking should be prohibited\nin the applicat ion area.\nConditions for safe\nstorage\n: Electrical installations / working materials must comply\nwith the technological safety standards.\nMaterials to avoid : Keep away from oxidising agents and strongly acid or\nalkaline materials.",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 342
  },
  {
    "id": "doc-stone-soap-sds-p3",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 3,
    "text": "Revised on 05 /10 /2017 Page 3 of 6\n8. EXPOSURE CONTROLS / PERSONAL PROTECTION\nOccupational exposure controls:\nComponents with workplace control parameters\nContains no substances with occupational exposure limit values.\nPersonal protective equipment\nRespiratory protection : In case of insufficient ventilatio n, wear suitable\nrespiratory\nequipment.\nHand protection\nRemarks : For prolonged or repeated contact use protective gloves.\nThe\nsuitability for a specific workplace should be discussed\nwith the producers of the protective gloves.\nEye protection : Safety glasses\nEnsure that eyewash stations and\nsafety showers are close to the\nworkstation location.\nSkin and body protection : impervious clothing\nChoose body protection according to the amount and\nconcentration of the dangerous substance at the work\nplace.\nHygiene measures : General industrial hygiene\npractice.\n9. PHYSICAL AND CHEMICAL PROPERTIES\nAppearance (physical state, color, etc.) Green liquid\nOdor Odorless.\nOdor threshold Not Available\npH 7.5\nMelting point/freezing point N/A\nInitia l boiling point and boiling range 100°C (212 °F)\nFlash point Not Flammable\nEvaporation rate Not Available\nFlammability (solid, gas) Not Flammable\nUpper/lower flammability or explosive limit Not Explosive\nVapor pressure Not determined\nVapor density 1. 03 g/cm3\nDensity 1. 01\nSolubility (ies) Soluble in water.\nPartition coefficient: n - octanol/water Not Available\nAuto - ignition temperature Not Available\nDecomposition temperature Not Available",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 212
  },
  {
    "id": "doc-stone-soap-sds-p4",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 4,
    "text": "Revised on 05 /10 /2017 Page 4 of 6\n10. STABILITY AND REACTIVITY\nChemical Stability Stable\nPos sibility of Hazardous Reactions Will not occur.\nConditions to Avoid Not Available\nIncompatible Materials Acids and bases, oxidizing agents\nHazardous Decomposition Products No decomposition if stored and applied as directed\n11. TOXICOLOGICAL INFORMATION\nAcute Toxicity\nPhosphoric Acid\nSkin May cause skin irritation\nEyes Not Available\nRespiratory Not Available\nCarcinogenicity\nIARC No components of this product present at levels greater than or equal to 0.1% is identified\nas probable, possible or conf irmed human carcinogen by IARC.\nACGIH No components of this product present at levels greater than or equal to 0.1% is identified\nas a carcinogen or potential carcinogen by ACGIH.\nNTP No components of this product present at levels greater than or equal to 0.1% is identified\nas a known or anticipated carcinogen by NTP.\nOSHA No components of this product present at levels greater than or equal to 0.1% is identified\nas a carcinogen or potential carcinogen by OSHA.\nSigns & Symptoms of Exposure\nSkin Burning , itching, redness, inflammation, swelling of exposed tissue.\nEyes Eye burns, watering eyes.\nRespiratory Burning, choking, coughing, wheezing, laryngitis, shortness of breath, headache or\nnausea.\nIngestion Burning, choking, nausea, vomiting, severe pain .\nChronic Toxicity Damage to organs.\nTeratogenicity Not Available\nMutagenicity Not Available\nEmbryotoxicity Not Available\nSpecific Target Organ Toxicity Not Available\nReproductive Toxicity Not Available\nRespiratory/Skin Sensitization Not Available\n12. ECOLOGICAL INFORMATION\nEcotoxicity\nPhosphoric Acid\nAquatic Vertebrate Not Available\nAquatic Invertebrate Not Available\nTerrestrial Not Available\nPersistence and Degradability Not Available\nBioaccumulative Potential Not Available\nMobility in Soil Not Available\nPBT and vPvB Assessment Not Available\nOther Adverse Effects Not Available",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 278
  },
  {
    "id": "doc-stone-soap-sds-p5",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 5,
    "text": "Revised on 05 /10 /2017 Page 5 of 6\n13. DISPOSAL CONSIDERATIONS\nWaste Product or\nResidues\nUsers should review their operations in terms of the applicable federal/national or\nlocal regulations and con sult with appropriate regulatory agencies if necessary before\ndisposing of waste product or residue.\nProduct\nContainers\nUsers should review their operations in terms of the applicable federal/national or\nlocal regulations and consult with appropriate regu latory agencies if necessary\nbefore disposing of waste product container.\nThe information offered in section 13 is for the product as shipped. Use and/or alterations to the product may\nsignificantly change the characteristics of the material and alter the waste classification and proper disposal\nmethods.",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 112
  },
  {
    "id": "doc-stone-soap-sds-p6",
    "docId": "doc-stone-soap-sds",
    "pageNumber": 6,
    "text": "Revised on 05 /10 /2017 Page 6 of 6\n14. TRANSPORTATION INFORMATION\nUS DOT Transportation Regulation: 49 CFR (USA): This material is not classified.\nTDG Transportation Regulation: 49 CFR (USA): This material is not classified.\nIMDG Transpo rtation Regulation: 49 CFR (USA): This material is not classified.\nMarine Pollutant No\nIATA/ICAO Transportation Regulation: 49 CFR (USA): This material is not classified.\n15. REGULATORY INFORMATION\nTSCA Inventory Status All ingredients are listed on th e TSCA inventory.\nDSCL (EEC) All ingredients are listed on the DSCL inventory.\nCalifornia Proposition 65 Not Listed\nSARA 302 Not Listed\nSARA 304 Not Listed\nSARA 311 Acute health hazard, Chronic health hazard.\nSARA 312 Acute health hazard, Chronic hea lth hazard.\nSARA 313 Not Listed\nWHMIS Canada Class E: Corrosive liquid.\n16. OTHER INFORMATION\nDisclaimer: SEMCO Modern Seamless Surface, Inc. (“SEMCO”) believes that the information herein is factual but is not intended to be all\ninclusive. The information relates only to the specific material designated and does not relate to its use in combination with other\nmaterials or its use as to any particular process. Because safety standards and regulations are subject to change and because SEMCO\nhas no continuing control over the material, those handling, storing or using the material should satisfy themselves that they have current\ninformation regarding the particular way the material is handled, stored or used and that the same is done in accordance with federal,\nstate and local law. SEMCO MAKES NO WARRANTY, EXPRESS OR IMPLIED, INCLUDING (W ITHOUT LIMITATION) WARRANTIES\nWITH RESPECT TO THE COMPLETENESS OR CONTINUING ACCURACY OF THE INFORMATION CONTAINED HEREIN OR WITH\nRESPECT TO FITNESS FOR ANY PARTICULAR USE.",
    "sourceDocument": "Stone-Soap-SDS.pdf",
    "title": "Stone Soap SDS",
    "category": "Technical doc",
    "wordCount": 273
  },
  {
    "id": "doc-tech-sheet-satin-stone-v5-p1",
    "docId": "doc-tech-sheet-satin-stone-v5",
    "pageNumber": 1,
    "text": "Product Data\nSATIN STONE\nSatin Stone is the latest technology in SEMCO Cross Linking sealers. It interlocks with applied\nsubstrates solidifying and creating total surface protection with a density enhancement of up to\n85%. Excellent for interior and exterior use while handling rigorous surface conditions including\nhigh traffic commercial and industrial environments.\nPRODUCT\nUSES\nCOVERAGE\nConcrete 200 - 250\nPolished concrete 250 - 300\nArtificial stone 200 - 250\nStamped Concrete 150 - 250\nNatural stone 150 - 250\nSEMCO ADA 150 - 250\nCOVERAGE sq ft. / 1,5 gal Kit @ min 2 coats at 20\nmils total thickness\nSUBSTRATES\n• X-BOND System\n• Pre-Stain System\n• New and existing concrete\n• New and existing coatings\n• Polished concrete\n• New and existing stamped\n• Concrete\nInterior\nExterior\nWetrooms\nCommercial\nIndustrial\n\n\n\n\n\nSURFACE ENGINEERING COMPANY\nGet the durability and\nperformance of a solvent-based\nsystem, but with the easy\napplication and clean-up of\nwater-based products.\nUV-resistant and can be applied to\nmultiple surfaces to give\nextra protection.\nWith its low water permeability, Satin\nStone can be used in showers.\nSatin Stone’s extreme durability and\nresistance to abrasion, allows it to be\nused in high foot traffic areas such as\ncommercial spaces.\nExcellent chemical resistance and\nindustrial strength finish allow Satin\nStone to be used in an industrial\nenvironment.",
    "sourceDocument": "Tech_Sheet_Satin-Stone-v5.pdf",
    "title": "Tech Sheet Satin Stone",
    "category": "Satin Stone",
    "wordCount": 222
  },
  {
    "id": "doc-tech-sheet-satin-stone-v5-p2",
    "docId": "doc-tech-sheet-satin-stone-v5",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Airless sprayer tip size 21 at 1,000 PSI , Magic Trowel, 3/8” soft woven roller\nApplication environment Apply at temperatures from 50°F to 90°F\nColor Part A - milky white, Part B - light amber\nChemical type Polyurethane hybrid\nClean up SEMCO Stone Soap with water\nShelf life 1 year in controlled environment (ambient temperature of 60F - 72F)\nPackaging Part A - 1 gal. pail, Part B - 0.5 gal. pail\nVOC Content 35 g/l (Part A+B)\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n1 h\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated\nindividually.\nThe chart represents the time needed in be -\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n10 days 3 days\n50%\n12 hrs\nLight foot traffic\n50 F 72 F 95 F\n5 days 7 days\n95 F 80 F 60 F\n2.5 h\n2 h\nCURE TIME\nTEST RESULTS\nAbrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nWater permeability EN 1062-3 W3 - low at 0.013\nVOC Emission test according EMICODE EC 1 PLUS\nPerformance test - stain resistance passed\nSlip resistance ADA Safety Surface DCOF 0.86\nSlip resistance AS/NZS 4586 - pendulum Slider 96(4S) - P4 = 45 - 54\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.",
    "sourceDocument": "Tech_Sheet_Satin-Stone-v5.pdf",
    "title": "Tech Sheet Satin Stone",
    "category": "Satin Stone",
    "wordCount": 260
  },
  {
    "id": "doc-tech-sheet-satin-stone-v5-p3",
    "docId": "doc-tech-sheet-satin-stone-v5",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO Satin Stone are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a reduction in\ngloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment or loaded\npallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures over the sur -\nface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP Manual under\nthe Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1\n• Mix 2 parts of Part A and 1 part of Part B (included in your product order) with a low speed mixer and epoxy mixing paddle\n(at 200 - 300 RPM for 20 seconds), stirring thoroughly, avoid mixing more product than can be applied. Product pot life is up\nto 35 minutes depending on temperature (MARK TIME ON CONTAINER)Test pH level after preparation\n• Use airless sprayer with tip size 21 at 850-1,000 PSI. Position the airless sprayer gun at 18” away from the floor\n• OPTIONAL: use magic trowel to spread the product. Do not go back and forth\n• Minimum of 2 coats is required to ensure a 20 mils total thickness\n• On vertical surfaces : Apply Satin Stone with a 3/8” soft woven roller and use Magic trowel to spread it evenly. Start from top\nto bottom. Minimum of 3 coats is required. Use HVLP with a large tip to apply Satin Stone on large surface areas.\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 21\n• Optional : Magic Trowel\n• Woven nap roller for vertical surfaces\nScan to watch application",
    "sourceDocument": "Tech_Sheet_Satin-Stone-v5.pdf",
    "title": "Tech Sheet Satin Stone",
    "category": "Satin Stone",
    "wordCount": 595
  },
  {
    "id": "doc-tech-sheet-titanshield-v8-p1",
    "docId": "doc-tech-sheet-titanshield-v8",
    "pageNumber": 1,
    "text": "Product Data Titan Shield Gloss\nThe Titan Shield Gloss is an advanced single component water-based polyurethane hybrid sealer.\nThe perfect sealer solution for cementitious surfaces such as concrete, micro toppings, pavers, block, and/\nor polished concrete.\nThe Titan Shield Gloss is a UV stable sealer making it great for residential and commercial interior and\nexterior applications. The Titan Shield Gloss provides superior protection; outperforming acrylic, urethane,\nand polyurea sealers with a high-density film forming topical membrane reducing degradation from all\nforms of foot, chemical, and/or vehicle traffic. The Titan Shield Gloss is easily applied with brush, roller, and/\nor sprayer. With its fast-drying system, a 3 coat application can be easily completed in a single day.\nPRODUCT\nSUBSTRATES\nCOVERAGE\nPolished concrete 150 - 200\nArtificial Stone 150 - 200\nStamped Concrete 250 - 300\nX-Bond 200 - 250\nCOVERAGE sq ft. / 1 gal @ min 3 coats\nat 6 - 8 mils total thickness\nBENEFITS\n• Withstand commercial foot\nand vehicle traffic\n• Enhances color\n• UV Resistant\n• Resistant to chemicals\n• Self-priming, sealer and\nhardener\n• Odorless\n• Low VOC’s to meet indoor\nairquality standards\nConcrete\nX-Bond\nDriveways\n\n\n\nSURFACE ENGINEERING COMPANY\nGet the durability and perfor-\nmance of a solvent-based system,\nbut with the easy application and\nclean-up of water-based\nproducts.\nEnhance the vivid colors of your\nX-Bond surface\nProtect your artifical stone from\nweathering and prolong its life\nspan with extra protection.",
    "sourceDocument": "Tech_Sheet_TitanShield-v8.pdf",
    "title": "Tech Sheet TitanShield",
    "category": "Technical doc",
    "wordCount": 239
  },
  {
    "id": "doc-tech-sheet-titanshield-v8-p2",
    "docId": "doc-tech-sheet-titanshield-v8",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Airless sprayer, tip size 17, 1/4” woven short nap roller or Magic Trowel\nApplication environment Apply at temperatures from 50°F to 90°F\nColor White/milky liquid\nChemical type Polyurethane hybrid\nClean up Stone Soap and water\nShelf life 1 year (ambient temperature of 60F - 72F)\nPackaging 1 gallon, 5 gallons\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n12 min\n45 F\nDrying times are affected by temperature\nand relative humidity. The chart represents\nguidline values but each project is to be\ntreated individually.\nThe chart represents the time needed in\nbetween coats at specified temperature.\nCure / humidity\nTime\n75%\n48 hrs 12 hrs\n50%\n0 hrs\nLight foot traffic\n45 F 72 F 90 F\n18 hrs 24 hrs\n100 F 80 F 60 F\n1.5 hrs\n20 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 45 F, a full cure would\ntake 48 hours in comparison to at 90 F it\nwould only take 18 hours to cure.",
    "sourceDocument": "Tech_Sheet_TitanShield-v8.pdf",
    "title": "Tech Sheet TitanShield",
    "category": "Technical doc",
    "wordCount": 173
  },
  {
    "id": "doc-tech-sheet-titanshield-v8-p3",
    "docId": "doc-tech-sheet-titanshield-v8",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or\nupon request\n• Safety Data Sheets for SEMCO Titan Shield Gloss are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a re -\nduction in gloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment\nor loaded pallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures\nover the surface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP\nManual under the Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1\n• Use airless sprayer with tip size 17 at 850-1,000 PSI. Position the airless sprayer gun at 18” away from the floor\n• OPTIONAL: use magic trowel or 1/4” woven short nap roller to apply the product. Do not go back and forth\n• Minimum of 3 coats is required to ensure 6 - 8 mils total film thickness\nVERTICAL SURFACES\n• Apply the Titan Shield Gloss with a woven 1/4” nap roller and use Magic trowel to spread it evenly. Start from top to\nbottom. Minimum of 3 coats is required. Use HVLP with a large tip size 17 to apply Titan Shield Gloss on large surface\nareas.\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 17\n• Magic Trowel\n• 1/4” woven short nap roller roller",
    "sourceDocument": "Tech_Sheet_TitanShield-v8.pdf",
    "title": "Tech Sheet TitanShield",
    "category": "Technical doc",
    "wordCount": 537
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p1",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 1,
    "text": "Product Data X-Bond\nMicrocement\nSEMCO’s most innovative custom engineered product is X-Bond Microcement, which is the core\nelement in both the SEMCO Remodel without Removal™ and SEMCO’s ADA Safety Floor\nsystems. It creates chemical bond at the molecular level to any solid surface. X-Bond Microcement\nis a zero VOC hybrid of natural stone and advanced cross-linking technology. Perfect for floors,\nwalls, pool decks and waterproofing.\nPRODUCT\nUSES\nCOVERAGE\nConcrete 60 - 75\nPainted surface 60 - 75\nCeramic tile 55 - 75\nVinyl tile 60 - 75\nNatural stone 50 - 100\nMetal 60 - 75\n(sq. ft. per 2 gallons of X-Bond Liquid and 1 50 lb\nbag of X-Bond Stone, coverage is based on 1/8”\napplication)\nSUBSTRATES\n• Flexible waterproof membrane\n• Breathable and chemical resistant\n• Minimizes remodeling waste\n• disposal\n• Interior, exterior, and below grade\napplication\n• Can be safely used in confined areas\n• UV and freeze-thaw damage resistant\nInterior\nExterior\nWetrooms\nCommercial\nIndustrial\n\n\n\n\n\nSURFACE ENGINEERING COMPANY\nThrough the use of the X-Bond\nMicrocement, which chemically ad-\nheres to any existing surface,\nallows any space to be remodelled\nwithout the removal of the existing\nsubstrate.\nUV-resistant and can be applied to\nany existing hard surface\nWith its low water permeability,\nX-BOND Microcement can be used in\nwetrooms and pools.\nX-Bond Microcement’s extreme\ndurability and resistance to abrasion,\nallows it to be used in high foot traffic\nareas such as commercial spaces.\nExcellent chemical resistance and\nabrasion resistance allow the X-BOND\nMicrocement to be used in\nindustrial applications.",
    "sourceDocument": "Tech_Sheet_X-Bond-2024-v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 258
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p2",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Smoother, Magic Trowel, Hopper Texture Gun and compressor\nApplication environment Apply at temperatures from 45°F to 100°F\nColor White powder and white liquid\nChemical type Polymer modified stone\nClean up SEMCO Stone Soap with water\nShelf life 1 year in unopened containers (ambient temperature of 60F - 72F)\nPackaging 1 gal. pail, 5 gal. pail, 55 gal. drum / 50 lb bag\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n2 hrs\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated\nindividually.\nThe chart represents the time needed in be-\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n48 hrs 8 hrs\n50%\n12 hrs\nLight foot\ntraffic\n50 F 72 F 95 F\n14 hrs 24 hrs\n95 F 80 F 60 F\n3.5 hrs\n2.5 hrs\nCURE TIME\nTEST RESULTS\nAbrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nASTM D-3960 - Volatile organic content (VOC) 0g / L\nASTM D-3l94 – Water content 48.9 %\nASTM D-2369 – Non volatile residue 25.9 %\nASTM C 1028-6 – Coefficient of friction (mineral) DCOF 0.86\nASTM C 1028-6 – Coefficient of friction (all finishes) 0.78 dry, 0.63 wet\nASTM C 109 / C109M – 8 – Compressive strength 27 MPa = 3,800 PSI\nASTM C 674 – Modulus of rupture 2,200 PSI\nISO 7784 – Abrasion resistance, metal 10,000 cycles with 0.017g mass loss\nASTM D 4060-07 – Abrasion resistance, metal 1022 cycles w/ .05 mil loss\nEN 1062-3 Water permeability test Class W3 - 0,013 kg/(m2.h0.5)\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.",
    "sourceDocument": "Tech_Sheet_X-Bond-2024-v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 306
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p3",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual. Procedures for cleaning of the flooring system\nduring operations can be found in the SEMCO SIP Manual or upon request\n• Acceptable moisture levels in concrete according to ASTM standard, when testing via ASTM F2170, the rH level of a concrete\nslab needs to be at or below 75% rH, unless otherwise instructed in writing from SEMCO Technical Support Division\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO X-BOND Microcement are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a reduction in\ngloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment or loaded\npallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures over the\nsurface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP Manual under\nthe Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1 - PREPARATION\n• Mix X-Bond mixture 1 part X-Bond Liquid to 2 parts of X-Bond Stone, in this order, and mix with square mixing paddle at low\nspeed (180-200 RPM)\n• While the X-Bond Liquid is still tacky, pour the mixture to the mud tray, use a hand broom to spread material from left to\nright, NOT up and down\n• Using hand broom spread material tightly, in ONE DIRECTION and allow surface to dry afterwards\nSTEP 2 - SCRATCH COAT / PRIMER COAT\nTOOLS NEEDED\n• X-Bond Smoother\n• Roll X-Bond Liquid as primer coat. Do not allow to dry\n• Mix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts of X-Bond Stone, in this order, mix with square mixing paddle at low\nspeed (180-200 RPM) (OPTIONAL) Use integral color with X-Bond Color Activator\n• Using a Trowel or X-Bond smoother for larger areas, tilt smoother with the handle pointing to 10 o’clock, spread material\ntightly, in ONEDIRECTION. Thickness is 1/16 or 2mil\n• Allow coat of X-Bond to dry slightly to the touch (20-30 minutes) before applying second coat. Use shoe covers in between\ncoats\nSTEP 3 - SKIM COATS",
    "sourceDocument": "Tech_Sheet_X-Bond-2024-v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 658
  },
  {
    "id": "doc-titan-gloss-tech-data-sheet-p1",
    "docId": "doc-titan-gloss-tech-data-sheet",
    "pageNumber": 1,
    "text": "Product Data Titan Shield Gloss\nThe Titan Shield Gloss is an advanced single component water-based polyurethane hybrid sealer.\nThe perfect sealer solution for cementitious surfaces such as concrete, micro toppings, pavers, block, and/\nor polished concrete.\nThe Titan Shield Gloss is a UV stable sealer making it great for residential and commercial interior and\nexterior applications. The Titan Shield Gloss provides superior protection; outperforming acrylic, urethane,\nand polyurea sealers with a high-density film forming topical membrane reducing degradation from all\nforms of foot, chemical, and/or vehicle traffic. The Titan Shield Gloss is easily applied with brush, roller, and/\nor sprayer. With its fast-drying system, a 3 coat application can be easily completed in a single day.\nPRODUCT\nSUBSTRATES\nCOVERAGE\nPolished concrete 150 - 200\nArtificial Stone 150 - 200\nStamped Concrete 250 - 300\nX-Bond 200 - 250\nCOVERAGE sq ft. / 1 gal @ min 3 coats\nat 20 mils total thickness\nBENEFITS\n• Withstand commercial foot\nand vehicle traffic\n• Enhances color\n• UV Resistant\n• Resistant to chemicals\n• Self-priming, sealer and\nhardener\n• Odorless\n• Low VOC’s to meet indoor\nairquality standards\nConcrete\nX-Bond\nDriveways\n\n\n\nSURFACE ENGINEERING COMPANY\nGet the durability and perfor -\nmance of a solvent-based system,\nbut with the easy application and\nclean-up of water-based\nproducts.\nEnhance the vivid colors of your\nX-Bond surface\nProtect your artifical stone from\nweathering and prolong its life\nspan with extra protection.",
    "sourceDocument": "Titan-Gloss-Tech-Data-Sheet.pdf",
    "title": "Titan Gloss Tech Data Sheet",
    "category": "Technical doc",
    "wordCount": 238
  },
  {
    "id": "doc-titan-gloss-tech-data-sheet-p2",
    "docId": "doc-titan-gloss-tech-data-sheet",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Airless sprayer, tip size 17, 1/4” woven short nap roller or Magic Trowel\nApplication environment Apply at temperatures from 50°F to 90°F\nColor White/milky liquid\nChemical type Polyurethane hybrid\nClean up Stone Soap and water\nShelf life 1 year (ambient temperature of 60F - 72F)\nPackaging 1 gallon, 5 gallons\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n12 min\n45 F\nDrying times are affected by temperature\nand relative humidity. The chart represents\nguidline values but each project is to be\ntreated individually.\nThe chart represents the time needed in\nbetween coats at specified temperature.\nCure / humidity\nTime\n75%\n48 hrs 12 hrs\n50%\n0 hrs\nLight foot traffic\n45 F 72 F 90 F\n18 hrs 24 hrs\n100 F 80 F 60 F\n1.5 hrs\n20 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 45 F, a full cure would\ntake 48 hours in comparison to at 90 F it\nwould only take 18 hours to cure.",
    "sourceDocument": "Titan-Gloss-Tech-Data-Sheet.pdf",
    "title": "Titan Gloss Tech Data Sheet",
    "category": "Technical doc",
    "wordCount": 173
  },
  {
    "id": "doc-titan-gloss-tech-data-sheet-p3",
    "docId": "doc-titan-gloss-tech-data-sheet",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or\nupon request\n• Safety Data Sheets for SEMCO Titan Shield Gloss are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a re -\nduction in gloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment\nor loaded pallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures\nover the surface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP\nManual under the Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1\n• Use airless sprayer with tip size 17 at 850-1,000 PSI. Position the airless sprayer gun at 18” away from the floor\n• OPTIONAL: use magic trowel or 1/4” woven short nap roller to apply the product. Do not go back and forth\n• Minimum of 3 coats is required to ensure 20 mils total film thickness\nVERTICAL SURFACES\n• Apply the Titan Shield Gloss with a woven 1/4” nap roller and use Magic trowel to spread it evenly. Start from top to\nbottom. Minimum of 3 coats is required. Use HVLP with a large tip size 17 to apply Titan Shield Gloss on large surface\nareas.\nSTEP 2\nTOOLS NEEDED\n• Airless sprayer with tip size 17\n• Magic Trowel\n• 1/4” woven short nap roller roller",
    "sourceDocument": "Titan-Gloss-Tech-Data-Sheet.pdf",
    "title": "Titan Gloss Tech Data Sheet",
    "category": "Technical doc",
    "wordCount": 535
  },
  {
    "id": "doc-titan-shield-sds-p1",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 1,
    "text": "Page 1 / 7\nSAFETY DATA SHEET\nIssue Date 21 - Mar - 201 7 Revision Date 22 - Sept - 20 18 Version 2\nProduct identifier\nProduct Name T ITAN SH IELD GLOSS – TITAN S H IELD MATTE\nOther means of identification\nProduct Code T SG700, 70 1, 705, 755\nDetails of the supplier of the safety data sheet\nCompany Name SEMCO Modern Seamless Surface Inc\n3620 West Reno Ave\nLas Vegas, NV 89118\n702 - 222 - 9495\nEmergency telephone number\nEmergency Telephone 1 - 800 - 424 - 9300\nClassification\nOSHA Regulatory Status\nThis chemical is not considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.122)\nLabel elements\nEmergency Overview\nAppearance Opaque Physical state Liquid Odor Acrylic\nPrecautionary Statements - Response\nIF exposed or concerned: Get medical advice/attention\nHazards not otherwise classified (HNOC)\nOther Information\n• Harmful to aquatic life with long lasting effects\nUnknown Acute Toxicity 0.70755868% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Weight - % Trade Secret\nAcrylic CoPolymer Proprietary 7 - 15 *\n1 - Phenoxy - 2 - propanol 770 - 35 - 4 3 - 5 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\n1. PRODUCT AND COMPANY IDENTIFICATION\n2. HAZARDS IDENTIFICATION\nAcute toxicity - Oral Not classified\nAcute toxicity - Dermal Not classified\n3. COMPOSITION/INFORMATION ON INGREDIENTS",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 233
  },
  {
    "id": "doc-titan-shield-sds-p2",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 2,
    "text": "Page 2 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - Sept - 201 8\n4. FIRST AID MEASURES\nFirst aid measures\nSkin Contact Wash off immediately with plenty of water. Wash skin with soap and water.\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms Any additional important symptoms and effects are described in Section 11: Toxicology\nInformation.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\n5. FIRE - FIGHTING MEASURES\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment.\nUnsuitable extinguishing media Caution: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo Information available.\nExplosion data\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self - contained breathing apparatus pressure - demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\n6. ACCIDENTAL RELEASE MEASURES\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See Section 12 for additional ecological information.\nMethods and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so.\nMethods for cleaning up Pick up and transfer to properly labeled containers.\n7. HANDLING AND STORAGE",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 268
  },
  {
    "id": "doc-titan-shield-sds-p3",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 3,
    "text": "Page 3 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - S ept - 2018\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well - ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines Exposure guidelines noted for ingredient(s).\nChemical Name ACGIH TLV OSHA PEL NIOSH IDLH\nSodium Hydroxide\n1310 - 73 - 2\nCeiling: 2 mg/m 3 TWA: 2 mg/m 3\n(vacated) Ceiling: 2 mg/m 3\nIDLH: 10 mg/m 3\nCeiling: 2 mg/m 3\nEthanol\n64 - 17 - 5\nSTEL: 1000 ppm TWA: 1000 ppm\nTWA: 1900 mg/m 3\n(vacated) TWA: 1000 ppm\n(vacated) TWA: 1900 mg/m 3\nIDLH: 3300 ppm\nTWA: 1000 ppm\nTWA: 1900 mg/m 3\nAmmonia\n7664 - 41 - 7\nSTEL: 35 ppm\nTWA: 25 ppm\nTWA: 50 ppm\nTWA: 35 mg/m 3\n(vacated) STEL: 35 ppm\n(vacated) STEL: 27 mg/m 3\nIDLH: 300 ppm\nTWA: 25 ppm\nTWA: 18 mg/m 3\nSTEL: 35 ppm\nSTEL: 27 mg/m 3\nNIOSH IDLH Immediately Dangerous to Life or Health\nOther Information Vacated limits revoked by the Court of Appeals decision in AFL - CIO v. OSHA, 965 F.2d\n962 (11th Cir., 1992).\nAppropriate engineering controls\nEngineering Controls Showers, Eyewash stations & Ventilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection Wear safety glasses with side shields (or goggles).\nSkin and body protection No special technical protective measures are necessary. Wear protective gloves and\nprotective clothing. Prolonged contact may cause redness and irritation. Wear protective\ngloves and protective clothing if needed.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive - pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Handle in accordance with good industrial hygiene and safety practice.\nInformation on basic physical and chemical properties\nPhysical state Liquid\nAppearance Opaque\nColor Off - white\nOdor Acrylic /Urethane\nOdor threshold No Information available\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 373
  },
  {
    "id": "doc-titan-shield-sds-p4",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 4,
    "text": "Page 4 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - S ept - 2018\nProperty Values Remarks • Method\npH 8.6 - 9.4\nSpecific Gravity 1.055\nViscosity <300 cP @ 25°C\nMelting point/freezing point No Information available\nFlash point Above 200°F\nBoiling point / boiling range >= 212 ° F (at 760 mm Hg)\nEvaporation rate No Information available\nFlammability (solid, gas) No data available\nFlammability Limits in Air\nUpper flammability limit: No Information available\nLower flammability limit: No Information available\nVapor pressure No Information available\nVapor density No Information available\nWater solubility Complete\nPartition coefficient No Information available\nAutoignition temperature No Information available\nDecomposition temperature No Information available\nOther Information\nDensity Lbs/Gal 8.80\nVOC Content (%) 0. 14 058 / 28 .2 g/L\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nExtremes of temperature and direct sunlight.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProdu ct Information\nInhalation No data available. Avoid breathing vapors or mists.\nEye contact No data available. Avoid contact with eyes.\nSkin Contact No data available. No known hazard in contact with skin.\nIngestion No data available. Do not taste or swallow. Not an expected route of exposure.\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\n1 - Phenoxy - 2 - propanol = 2830 mg/kg ( Rat ) > 2 g/kg ( Rabbit ) -\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 264
  },
  {
    "id": "doc-titan-shield-sds-p5",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 5,
    "text": "Page 5 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - S ept - 2018\n770 - 35 - 4\nInformation on toxicological effects\nSymptoms No Information available.\nDelayed and immediate effects as well as chronic effects from short and long - term exposure\nSensitization No Information available.\nGerm cell mutagenicity No Information available.\nCarcinogenicity Ethanol has been shown to be carcinogenic in long - term studies only when consumed as\nalcoholic beverage.\nReproductive toxicity No Information available.\nSTOT - single exposure No Information available.\nSTOT - repeated exposure No Information available.\nChronic toxicity Ethanol has been shown to be a reproductive toxin only when consumed as an alcoholic\nbeverage. Ethanol has been shown to be carcinogenic in long - term studies only when\nconsumed as alcoholic beverage.\nAspiration hazard No Information available.\nNumerical measures of t oxicity - Product Information\nUnknown Acute Toxicity 0.30355868% of the mixture consists of ingredient(s) of unknown toxicity\nThe following values are calculated based on chapter 3.1 of the GHS document .\nATEmix (oral) 11,430.00 mg/kg\nATEmix (dermal) 26,658.00 mg/kg\nEcotoxicity\n45.18747% of the mixture consists of components(s) of unknown haz ards to the aquatic environment\nChemical Name Algae/aquatic plants Fish Crustacea\nSodium Hydroxide\n1310 - 73 - 2\n- 45.4: 96 h Oncorhynchus mykiss\nmg/L LC50 static\n-\nEthanol\n64 - 17 - 5\n- 12.0 - 16.0: 96 h Oncorhynchus\nmykiss mL/L LC50 static 100: 96 h\nPimephales promelas mg/L LC50\nstatic 13 400 - 15100: 96 h\nPimephales promelas mg/L LC50\nflow - through\n10800: 24 h Daphnia magna mg/L\nEC50 9268 - 14221: 48 h Daphnia\nmagna mg/L LC50 2: 48 h Daphnia\nmagna mg/L EC50 Static\nAmmonia\n7664 - 41 - 7\n- 0.44: 96 h Cyprinus carpio mg/L\nLC50 1.5: 96 h Poecilia reticulata\nmg/L LC50 0.26 - 4.6: 96 h Lepomis\nmacrochirus mg/L LC50 5.9: 96 h\nPimephales promelas mg/L LC50\nstatic 1.19: 96 h Poecilia reticulata\nmg/L LC50 static 0.73 - 2.35: 96 h\nPimephales promelas mg/L LC50\n1.17: 96 h Lepomis macrochirus\nmg/L LC50 flow - through\n25.4: 48 h Daphnia magna mg/L\nLC50\nMethyl Chloro Isothiazolinone\n26172 - 55 - 4\n0.11 - 0.16: 72 h\nPseudokirchneriella subcapitata\nmg/L EC50 static 0.03 - 0.13: 96 h\nPseudokirchneriella subcapitata\nmg/L EC50 static 0.31: 120 h\nAnabaena flos - aquae mg/L EC50\n1.6: 96 h Oncorhynchus mykiss\nmg/L LC50 semi - static\n4.71: 48 h Daphnia magna mg/L\nEC50 0.12 - 0.3: 48 h Daphnia\nmagna mg/L EC50 Flow through\n0.71 - 0.99: 48 h Daphnia magna\nmg/L EC50 Static\nPersistence and degradability\nNo Information available.\n12. ECOLOGICAL INFORMATION",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 438
  },
  {
    "id": "doc-titan-shield-sds-p6",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 6,
    "text": "Page 6 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - Sept - 201 8\nBioaccumulation\nNo Information available.\nOther adverse effects No Information available\n13. DISPOSAL CONSIDERATIONS\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\n14. TRANSPORT INFORMATION\nThe basic description below is specific to the container size. This information is provided for at a glance DOT information.\nPlease refer to the container and/or shipping papers for the appropriate shipping description before tendering this material for\nshipment. For additional information, please contact the distributor listed in section 1 of this SDS.\nDOT Not regulated\n15. REGULATORY INFORMATION\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non - Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product does not contain any\nchemicals which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 37 2\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product does not contain any substances regulated as pollutants pursuant to the Clean Water Act (40 CFR 122.21 and 40\nCFR 122.42)\nCERCLA\nThis material, as supplied, does not contain any substances regulated as hazardous substances under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302) or the Superfund Amendments and\nReauthorization Act (SARA) (40 CFR 355). There may be specific reporting requirements at the local, regional, or state level\npertaining to releases of this material\nUS State Regulations\nCalifornia Proposition 65",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 312
  },
  {
    "id": "doc-titan-shield-sds-p7",
    "docId": "doc-titan-shield-sds",
    "pageNumber": 7,
    "text": "Page 7 / 7\nTITAN S HIELD GLO S S - MATTE Revision Date 22 - Sept - 201 8\nThis product contains the following Proposition 65 chemicals\nU.S. State Right - to - Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nSodium Hydroxide\n1310 - 73 - 2\nX X X\nEthanol\n64 - 17 - 5\nX X X\nAmmonia\n7664 - 41 - 7\nX X X\nMagnesium Nitrate\n10377 - 60 - 3\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\nNFPA Health hazards 0 Flammability 0 Instability 0 Physical and Chemical\nProperties Yes\nHMIS Health hazards 0 Flammability 0 Physical hazards 0 Personal protection X\nIssue Date 21 - Mar - 201 7\nRevision Date 22 - S ept - 201 8\nRevision Note\nNo Information available\nDisclaimer\nThe information provided in this Safety Data Sheet is correct to the best of our knowledge, information and belief at the\ndate of its publication. The information given is designed only as a gui dance for safe handling, use, processing, storage,\ntransportation, disposal and release and is not to be considered a warranty or quality specification. The information\nrelates only to the specific material designated and may not be valid for such material used in combination with any other\nmaterials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\nChemical Name\nEthanol - 64 - 17 - 5\nCalifornia Proposition 65\nCarcinogen\nDevelopmental\n16. OTHER INFORMATION",
    "sourceDocument": "Titan-Shield-SDS.pdf",
    "title": "Titan Shield SDS",
    "category": "Technical doc",
    "wordCount": 249
  },
  {
    "id": "doc-wood-detail-p1",
    "docId": "doc-wood-detail",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\n(WOOD)\nJOINTS\n2 3 4\n1. Existing substrate - wood\n2. SEMCO Liquid Membrane™ - 1st coat at 15 mil\n3. Fabric reinforcement over joints\n4. SEMCO Liquid Membrane™ - 2nd coat at 15 mil\n1\nFABRIC REINFORCEMENT\n2021 .V05 * Drawings are not to scale\nSEMCO\nLIQUID MEMBRANE™\nSEMCO\nLIQUID MEMBRANE™\nSURFACE ENGINEERING COMPANY\nSEMCO Liquid Membrane™ over wood\nSEMCO\nLIQUID MEMBRANE™ DETAIL",
    "sourceDocument": "Wood-Detail.pdf",
    "title": "Wood Detail",
    "category": "Technical doc",
    "wordCount": 66
  },
  {
    "id": "doc-x-bond-additive-sds-p1",
    "docId": "doc-x-bond-additive-sds",
    "pageNumber": 1,
    "text": "SECTION 1: PRODUCT IDENTIFICATION\nSECTION 2: HAZARDS IDENTIFICATION\nSECTION 3: COMPOSITION & INFORMATION ON INGREDIENTS\nSECTION 4: FIRST AID MEASURES\nSafety Data Sheet\nVersion: 3 (U S ) Date of print: 0 1 /20/201 6 Date of last alteration: 04/11/2016\nProduct Name : X - Bond Additive\nChemical Name: Sodium Potassium Aluminum Silicate\nCAS #: 93763 - 70 - 3\nUses: Industrial Mineral for Horticulture, Construction, Industrial, Insulation, and\nEnvironmental Applications\nManufacturer : SEMCO Modern Seamless Surface Inc\n3620 West R eno Ave\nLas Vegas , N V 89118\nPhone: 702 2 22 - 9495\nOSHA Classification: Considered a nuisance dust only\nSignal Word: None required\nPictograms: None required\nHazard Statements: None required\nHNOC: None required\nSupplemental Statements:\n* Inhalation may cause throat irritation resulting in coughing or sneezing and may aggravate\npre - existing respiratory conditions.\n* Direct eye contact may cause mechanical irritation.\n* Direct skin contact may cause drying and roughness.\nSupplemental Recommenda tions:\n* Avoid creating unnecessary dust, and wear NIOSH approved dust protection mask.\n* Wear NIOSH approved eye protection when encountering perlite dust.\n* Apply skin creams or lotions to prevent drying.\n* Dispose of waste in accordance with applicable local, State, and Federal regulations.\nPerlite CAS #: 93763 - 70 - 3 – 100%\nQuartz : none detected\n(crystalline silica)\nInhalation: Remove to fresh air. Blow nose. Consult physician if symptoms persist.\nEyes: Flush with water. DO NOT rub eyes. Consult physician if symptoms persist.\nSkin: Wash with water. Apply creams or lotions to prevent dry ing.",
    "sourceDocument": "X-Bond-Additive-SDS.pdf",
    "title": "X Bond Additive SDS",
    "category": "X-Bond",
    "wordCount": 254
  },
  {
    "id": "doc-x-bond-additive-sds-p2",
    "docId": "doc-x-bond-additive-sds",
    "pageNumber": 2,
    "text": "SECTION 6: ACCIDENTAL RELEASE MEASURES\nSECTION 7: HANDLING & STORAGE\nSECTION 8: EXPOSURE CONTROLS/PERSONAL PROTECTION\nSECTION 9: PHYSICAL AND CHEMICAL PROPERTIES\nSECTION 10: STABILITY AND REACTIVITY\nNon – Flammable\nSpill or Leak Procedures: Use appropriate Personal Protective Equipment (PPE) and avoid creating\nunnecessary dust using normal cleanup methods: shovels brooms, vacuum with HEPA\nfilter, or wet material prior to cleanup.\nHandling Precautions: Avoid creating unnecessary dust and use appropriate respiratory and eye prote ction.\nStorage Precautions: Keep material dry\nIncompatible Materials: Hydrofluoric acid\nExposure Limits: OSHA PEL – 15 mg/m3 ACGIH TLV – 10 mg/m3\nEngineering Controls: Adequate ventilation to keep concentrations below exposure limits.\nRecommended PPE: Appropriate NIOSH/OSHA approved dust respirator, NIOSH/OSHA tight - fitting\nsafety glasses or goggles and gloves.\nPhysical S tate (Appearance): Solid white or gray powder or granules.\nOdor: Odorless\npH: 6 - 9 (10% slurry in water)\nFlash Point: N/A\nBoiling Point: N/A\nAuto - ignition Temperature: N/A\nFlash Point: N/A\nMelting Point: 2,100 F – 2,300 F\nBoiling & Decomposition\nPoints: N/A\nSpecific Gravity: 2.3\nBulk Density: less than 10 lbs per cubic foot\nWater Solubility: Negligible\nCo - efficient of Water/Oil\nDistribution: N/A\nStability: Stable under normal use and conditions.\nReactivity Hazards: Hydrofluoric Acid\nHazardous Decomposition\nProducts: Will react with hydrofluoric acid to produce toxic silicon tetrafluoride.\nHazardous Polymerization: None\nSECTION 5: FIRE FIGHTING MEASURES",
    "sourceDocument": "X-Bond-Additive-SDS.pdf",
    "title": "X Bond Additive SDS",
    "category": "X-Bond",
    "wordCount": 223
  },
  {
    "id": "doc-x-bond-additive-sds-p3",
    "docId": "doc-x-bond-additive-sds",
    "pageNumber": 3,
    "text": "SECTION 12: ECOLOGICAL INFORMATION\nSECTION 13: DISPOSAL CONSIDERATIONS\nSECTION 14: TRANSPORTATION INFORMATION\nSECTION 15: REGULATORY INFORMATION\nSECTION 16: OTHER INFORMATION\nPrepared b y: SEMCO M o der n Seamless Surface Inc., — 3620 W est Reno Ave nue\nLas Vegas , NV 89118 — January 20 , 201 6\nAcute Toxicity Information: None\nLD50/LC50/LDLo (Oral, Dermal, Inhalation): Not established\nSymptoms:\n* Inhalation may cause throat irritation resulting in coughing or sneezing and may aggravate\npre - respiratory conditions.\n* Direct eye contact will cause mechanical irritation.\n* Direct skin contact may cause drying and roughness.\n* Ingestion – no symptoms known\n* A spiration Hazard – none\nDelayed Effects of Short and Long - term Exposure: None known\nMutagenic Effects: None\nCarcinogenic Effects: None\nReproductive Toxicity (reproductive, developmental, teratogenic): None\nSpecific Target Organ Toxicity (single or repeated exposure): None\nPerlite is a natural occurring mineral and has no known ecotoxic effects.\nPerlite, by itself, is a non - hazardous waste and should be disposed of in accordance with applicable local,\nState and Federal regulations.\nProper Name: Expanded Perlite\nDOT: Not Regulated\nTDG/IMO/ICAO: Not Regulat ed\nOSHA: Perlite is NOT considered a hazardous or toxic substance.\nWHMIS: N/A\nSERA: Not Listed\nTSCA: Not Listed\nThe information provided in this document is correct to the best of our knowledge as of the publication date. This\ninformation pertains only to the material specified and may not be valid when this material is combined with other\nmaterials or subjected to other processes. No warranty or quality specification is implied by this information. It is\nthe responsibility of the user to handle the designated material in a safe manner and comply with all applicable local,\nState and Federal regulations .\nSECTION 11: TOXICOLOGICAL INFORMATION",
    "sourceDocument": "X-Bond-Additive-SDS.pdf",
    "title": "X Bond Additive SDS",
    "category": "X-Bond",
    "wordCount": 289
  },
  {
    "id": "doc-x-bond-liquid-sds-p1",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 1,
    "text": "Page 1 / 7\nSAFETY DATA SHEET\nIssue Date 16 - Dec - 2015 Revision Date 16 - Dec - 2015 Version 1\nProduct identifier\nProduct Name X - BOND LIQUID\nOther means of identification\nProduct Code XB800\nRecommended use of the chemical and restrictions on use\nRecommended Use Water - based emulsion polymers for use in coatings and adhesives. Only for use with the\nSEMCO X - Bond Stone\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702 - 222 - 9495\nEmergency Telephone Chemtrec 1 - 800 - 424 - 9300\nClassification\nOSHA Regulatory Status\nThis chemical is considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.1200)\nLabel elements\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nSkin sensitization Category 1\nEmergency Overview\nWarning\nHazard statements\nMay cause an allergic skin reaction\nAppearance Milky liquid Physical state Liquid Odor Slight",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 176
  },
  {
    "id": "doc-x-bond-liquid-sds-p2",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 2,
    "text": "Page 2 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out of the workplace\nWear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get medical advice/attention\nWash contaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant\nHazards not otherwise classified (HNOC)\nOther Information\n• Harmful to aquatic life with long lasting effects\n• Harmful to aquatic life\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Weight - % Trade Secret\nAmmonium hydroxide 1336 - 21 - 6 <0.20 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms No information available.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol - resistant foam or water spray.\nUnsuitable extinguishing media Caution: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo information available.\nExplosion data\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE - FIGHTING MEASURES",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 294
  },
  {
    "id": "doc-x-bond-liquid-sds-p3",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 3,
    "text": "Page 3 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self - contained breathing apparatus pressure - demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See Section 12 for additional ecological information.\nMethods and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so. Dike far ahead of spill; use dry sand to\ncontain the flow of material.\nMethods for cleaning up Pick up and transfer to properly labeled containers.\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well - ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines This product, as supplied, does not contain any hazardous materials with occupational\nexposure limits established by the region specific regulatory bodies.\nAppropriate engineering controls\nEngineering Controls Showers\nEyewash stations\nVentilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection No special technical protective measures are necessary.\nSkin and body protection No special technical protective measures are necessary.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive - pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Considerations Handle in accordance with good industrial hygiene and safety practice.\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 310
  },
  {
    "id": "doc-x-bond-liquid-sds-p4",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 4,
    "text": "Page 4 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nInformation on basic physical and chemical properties\nPhysical state Liquid\nAppearance Milky liquid Odor Slight\nOdor threshold No information available\nProperty\npH\nValues\n9 - 10\nR ema rk s • M e t hod\nMelting point/freezing point 32°F\nBoiling point / boiling range >200°F\nFlash point >200°F\nEvaporation rate No information available\nFlammability (solid, gas) No information available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Dispersible\nSolubility in other solvents No information available\nPartition coefficient No information available\nAutoignition temperature No information available\nDecomposition temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nProtect from freezing - product stability may be affected.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProduct Information No data available\nInhalation No data available.\nEye contact No data available.\nSkin Contact No data available.\nIngestion .\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 207
  },
  {
    "id": "doc-x-bond-liquid-sds-p5",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 5,
    "text": "Page 5 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\nAmmonium hydroxide\n1336 - 21 - 6\n= 140 mg/kg ( Rat ) - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long - term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity 20 .60961% of the mixture consists of ingredient(s) of unknown toxicity\nEcotoxicity\nHarmful to aquatic life\n14 .9100635% of the mixture consists of components(s) of unknown hazards to the aquatic environment\nChemical Name Algae/aquatic plants Fish Crustacea\nAmmonium hydroxide\n1336 - 21 - 6\n- 4.1 : 96 h Pimephales promelas\nmg/L LC50\n0.33 : 24 h water flea mg/L EC50\n0.22 : 24 h Daphnia pulex mg/L\nEC50\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\nChemical Name California Hazardous Waste Status\nAmmonium hydroxide\n1336 - 21 - 6\nToxic\nCorrosive\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS\n14. TRANSPORT INFORMATION",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 245
  },
  {
    "id": "doc-x-bond-liquid-sds-p6",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 6,
    "text": "Page 6 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nDOT Not regulated\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non - Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains a chemical\nor chemicals which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 372\nChemical Name SARA 313 - Threshold Values %\nAmmonium hydroxide - 1336 - 21 - 6 1.0\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\nAmmonium hydroxide\n1336 - 21 - 6\n1000 lb - - X\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances RQs CERCLA/SARA RQ Reportable Quantity (RQ)\nAmmonium hydroxide\n1336 - 21 - 6\n1000 lb - RQ 1000 lb final RQ\nRQ 454 kg final RQ\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\nreproductive harm.\nU.S. State Right - to - Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nAmmonium hydroxide\n1336 - 21 - 6\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\n15. REGULATORY INFORMATION",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 314
  },
  {
    "id": "doc-x-bond-liquid-sds-p7",
    "docId": "doc-x-bond-liquid-sds",
    "pageNumber": 7,
    "text": "Page 7 / 7\nX - BOND LIQUID Revision Date 16 - Dec - 2015\nNFPA Health hazards 1 Flammability 0 Instability 0 Physical and Chemical\nProperties -\nHMIS Health hazards 1 Flammability 0 Physical hazards 0 Personal protection X\nPrepared By Samel Sem\nIssue Date 16 - Dec - 201 5\nRevision Date 16 - Dec - 201 5\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation relates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION",
    "sourceDocument": "X-Bond-Liquid-SDS.pdf",
    "title": "X Bond Liquid SDS",
    "category": "X-Bond",
    "wordCount": 163
  },
  {
    "id": "doc-x-bond-microbond-sds-p1",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 1,
    "text": "1\nSAFETY DATA SHEET\nIssue Date 01 - Mar - 2015 Revision Date 1 2 - September - 202 3 Version 4\nProduct identifier\nProduct Name MICROBOND\nOther means of identification\nProduct Code XBM50 , XBM25\nRecommended use of the chemical and restrictions on use\nRecommended Use Only for use with the SEMCO X - Bond Liquid.\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702 - 222 - 9495\nEmergency Telephone 1 - 800 - 424 - 9300\nClassification\nOSHA Regulatory Status\nNot Regulated\nLabel elements\nEmergency Overview\nMay cause cancer (inhalation) (Category 1A)\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nCategory 1B Skin sensitization",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 138
  },
  {
    "id": "doc-x-bond-microbond-sds-p2",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 2,
    "text": "2\nMICRO BOND\nPage 1 of 7\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out\nof the workplace Wear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get\nmedical advice/attention Wash\ncontaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant. Keep out of drains, sewers, ditches and\nwaterways. Minimize use of water to prevent environmental contamination.\n2.2 Potential Health Effects\nRelevant routes of exposure : Eye contact, skin contact, inhalation\nPotential Acute Health Effects:\nEye : Exposure to airborne concentrations above statutory or recommended exposure limits may cause irritation of\nthe eyes.\nSkin : May cause irritation on prolonged or repeated contact.\nInhalation : Exposure to airborne concentrations above statutory or recommended exposure limits may cause\nirritation of the nose, throat of the nose, throat and lungs. Chronic unprotected exposure may lead to silicosis.\nIngestion : Ingest of material may cause vomiting and/or stomach pains.\nCarcinogenicity: IARC: SiO2 NTP: Not Regulated OSHA: Not Regulated\nPotential Chronic Health Effects\nChronic effects : Contains Material that can cause target organ damage (lungs / respiratory system).\nTarget Organs : Contains material which causes damage to the following organs: lungs. Review Section 2\nand 11 for any additional assessments.\nOver - Exposure Signs/Symptoms\nInhalation : Adverse symptoms may include the following: respiratory tract irritation and coughing\n2.3 Potential Environmental Effects\n• Not considered to be harmful to aquatic and terrestrial life.",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 263
  },
  {
    "id": "doc-x-bond-microbond-sds-p3",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 3,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n3\nHazards not otherwise classified (HNOC)\nOther Information\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Lower Weight - % Upper Weight - %\nHollow Glass Micro s p heres 65997 - 17 - 3 46 49\nPortland Cement White 65997 - 15 - 1 4 7 .0 49 .0\nCalcium Carbonate 1317 - 65 - 3 0. 5 1\nCalcium Hydroxide 1305 - 62 - 0 1 3 .0\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Immediately flush eyes with plenty of water for at least 15 minutes. Check for and remove\nany contact lenses. Get medical attention if irritation occurs.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse. Consult a\nphysician or other qualified medical personnel if the condition persists.\nInhalation Remove to fresh air. Check for clear airway, breathing and presence of pulse. Provide\nCardiopulmonary resuscitation for persons without pulse or respirations. Consult a physician\nor other medical personnel.\nIngestion If swallowed, dilute by drinking large amounts of water, give at least 2 glasses of water to\ndrink. Consult a physician or other qualified medical personnel. Never give anything by\nmouth to an unconscious person.\nMost important symptoms and effects, both acute and delayed\nSymptoms\nInhalation Adverse symptoms may include the following: respiratory tract irritation and coughing\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol - resistant foam or water spray.\nUnsuitable extinguishing media: None\nProducts of Combustions: None\nUnusual Hazards: None\nSpecific hazards arising from the chemical\nNo information available\nExplosion Data\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nFirefighters should wear self - containing breathing apparatus (pressure demand MSHA/NIOSH\napproved or equivalent) and full fire - fighting turnout gear.\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE - FIGHTING MEASURES",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 359
  },
  {
    "id": "doc-x-bond-microbond-sds-p4",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 4,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n4\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Use personal protection recommended in section 8.\nEnvironmental precautions\nEnvironmental precautions Keep out of drains, sewers, ditches and waterways. Minimize use of water to prevent\nenvironmental contamination.\nMethods and material for containment and cleaning up\nMethods for containment Handle as a nuisance dust. Use respiratory protection if dust becomes airborne.\nMethods for cleaning up Dispose of in accordance with applicable Federal, State, and Local regulations. Keep\nspills and runoff out of municipal sewers and open bodies of water.\nPrecautions for safe handling\nAdvice on safe handling Do not get in eyes. Avoid contact with skin. Use in well ventilated areas. Wash\nthoroughly after handling.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Store in a cool, dry location and out of direct sunlight. Protect sacks from weather and\nother damage.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines\nCHEMICAL NAME OSHA PEL ACGIH TLV NIOSH REL\nHollow Glass Microspheres Not Esta bli shed Not Established 0.05 mg/m 3 TWA\nPortland Cement 15 mg/m 3 TWA 10 mg/m 3 TWA 10 mg/m 3 TWA\nCalcium Carbonate 15 mg/m 3 TWA 10 mg/m 3 TWA 10 mg/m 3 TWA\nCalcium Hydroxide 15 mg/m 3 TWA 5 mg/m 3 TWA 5 mg/m 3 TWA\nAppropriate engineering controls\nEngineering Controls\nUse local ventilation, if needed.\nIndividual protection measures, such as personal protective equipment\nEye/face protection: Use chemical splash goggles (ANSI 287.1 or approved equivalent)\nSkin Protection: Use rubber or neoprene gloves to provide protection against wet material.\nRespiratory Protection: None required for normal use of this product. If material is sanded or ground when dry, NIOSH/MSHA\napproved respirators for dust should be provided and used. As with any safety product, workers using\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 316
  },
  {
    "id": "doc-x-bond-microbond-sds-p5",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 5,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n5\nrespirators should be trained in the proper selection, use and care of such equipment.\nGeneral Hygiene Considerations: Wash thoroughly after handling. Have eye - wash facilities immediately available.\nInformation on basic physical and chemical properties\nPhysical state Solid\nAppearance Powder Odor None\nOdor threshold Not available\nProperty\npH\nValues\nNot available\nRemarks •\nMethod\nMelting point/freezing point Not available\nBoiling point / boiling range Not applicable\nFlash point Noncombustible\nEvaporation rate Not applicable\nFlammability (solid, gas) Not available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Slightly\nSolubility in other solvents No information available\nPartition Coefficient No information available\nAuto ignition temperature No information available\nDecomposition Temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under normal conditions of storage and use, hazardous polymerization will not occur.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nNone\nIncompatible materials\nNone\nHazardous Decomposition Products\nNone under normal conditions of storage and use.\nInformation on likely routes of exposure\nProduct Information No data available\n9. PHYSICAL AND CHEMICAL PROPERTIES\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 210
  },
  {
    "id": "doc-x-bond-microbond-sds-p6",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 6,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n6\nInhalation No specific hazard known. May cause transient irritation, headache, nausea, and /or\ninflammation of the nose, throat or lungs.",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 32
  },
  {
    "id": "doc-x-bond-microbond-sds-p7",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 7,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n7\nEye contact No specific hazard known. May cause transient irritation or alkali burns.\nSkin Contact No specific hazard known. May cause transient irritation or alkali burns.\nIngestion No specific hazard known.\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\n- - - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long - term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity\nEcotoxicity\nNot harmful to aquatic life\nAquatic Toxicity: No data available.\nTerrestrial Toxicity: No data available.\nMobility: No data available.\nChemical Name Algae/aquatic plants Fish Crustacean\n- - - -\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations. Local regulations may be more stringent than regional or national requirements.\nThe information presented below only applies to the material as supplied. The identification\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 223
  },
  {
    "id": "doc-x-bond-microbond-sds-p8",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 8,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n8\nbased on characteristic(s) or listing may not apply if the material has been used or otherwise\ncontaminated.\nContaminated packaging It is the responsibility of the waste generator to determine toxicity and physical properties of\nthe material generated to determine the proper waste identification and disposal methods in\ncompliance with applicable regulations.\n.\nDOT Not regulated\nLand transport U S D O T Not classified as a dangerous good under transport regulations Sea transport IMDG\nNot classified as a dangerous good under transport regulations Air transport IATA/ICAO\nNot classified as a dangerous good under transport regulations\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non - Domestic Substances List\nUS Federal Regulations\nHCS Classification: Target organ\neffects US Federal Regulations\nSARA 311/312 Classification Immediate (acute) health hazard, Delayed (chronic) health hazard\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains\nthe following toxic chemical(s) subject to the reporting requirements of Section 313 of Title III of the Superfund\nAmendments and Reauthorization Act of 1986, and Subpart C - Supplier Notification Requirement of 40 CFR Part 372.\nNone required.\nSARA 302 Extremely Hazardous Substances None required.\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\n- - - - -\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances CERCLA/SARA RQ Reportable Quantity (RQ)\n- - - -\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\n14. TRANSPORT INFORMATION\n15. REGULATORY INFORMATION",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 344
  },
  {
    "id": "doc-x-bond-microbond-sds-p9",
    "docId": "doc-x-bond-microbond-sds",
    "pageNumber": 9,
    "text": "Re Revision Date 12 - Sept - 202 3 MICRO BOND\n9\nU.S. State Right - to - Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\n- - - -\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\nNFPA Health Hazards 1 Flammability 0 Instability 0 Physical and\nChemical\nProperties -\nHMIS Health Hazards 1 Flammability 0 Physical hazards 0 Personal\nProtection -\nPrepared By Samel Sem\nIssue Date 01 - Jan - 2015\nRevision Date 12 - S eptember - 2023\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation r elates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\n*See Section 2 Hazards Identification\nCaution: HMIS® ratings are based on a 0 - 4 rating scale, with 0 representing minimal hazards or risks, and 4 representing significant\nhazards or risks Although HMIS® ratings are not required on SDSs under 29 CFR 1910.1200, the preparer may choose to provide\nthem. HMIS® ratings are to be used with a fully implemented HMIS® program. HMIS® is a registered mark of the National Paint &\nCoatings Association (NPCA). HMIS® materials may be purchased exclusively from J. J. Keller (800) 327 - 6868.\nThe customer is responsible for determining the PPE code for this material. Legend\nThis information is furnished without warranty, representation, inducement or license if any kind, except that it is accurate to the\nbest of SEMCO Modern Seamless Surface Inc., knowledge or is obtained from sources believed to be accurate. SEMCO\nModern Seamless Surface Inc., does not assume any legal responsibility for its use or reliance upon same/ Customers are encouraged\nto conduct their own tests. Before using any product, read its label.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION\nACGIH American Conference of Government Industrial Hygienists\nNTP National Toxicology Program\nOSHA Occupational Safety and Health Administration\nTWA Time Weighted Average",
    "sourceDocument": "X-Bond-Microbond-SDS.pdf",
    "title": "X Bond Microbond SDS",
    "category": "X-Bond",
    "wordCount": 381
  },
  {
    "id": "doc-x-bond-over-tile-detail-p1",
    "docId": "doc-x-bond-over-tile-detail",
    "pageNumber": 1,
    "text": "EXISTING SUBSTRATE\nSCRATCH COAT\nFINISH\nSatin Stone\nX-BOND SEAMLESS STONE\nper specification\n1. Existing substrate - tile\n2. X-Bond Scratch Coat\n3. SEMCO Liquid Membrane™ with fabric reinforcement\n4. X-Bond Scratch Coat\n5. X-Bond Brown Coat (up to 3/4”)\n6. X-Bond Seamless Stone - per specification\n7. Satin Stone (3 coats)\nTotal thickness 1/2” to 1”\n2 3 4\n1\n5 6 7\nSCRATCH COAT\nSEMCO\nLIQUID MEMBRANE™\nwith fabric reinforcement\nBROWN COAT\nup to 3/4”\n2021 .V02 * Drawings are not to scale\nX-Bond Seamless Stone over tile SURFACE ENGINEERING COMPANY\nFLOOR DETAIL",
    "sourceDocument": "X-Bond-Over-Tile-Detail.pdf",
    "title": "X Bond Over Tile Detail",
    "category": "X-Bond",
    "wordCount": 94
  },
  {
    "id": "doc-x-bond-stone-sds-p1",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 1,
    "text": "Page 1 / 7\nSAFETY DATA SHEET\nIssue Date 01 - Mar - 2015 Revision Date 01 - Mar - 2015 Version 1\nProduct identifier\nProduct Name X - BOND STONE TEXTURE\nOther means of identification\nProduct Code XB T50\nRecommended use of the chemical and restrictions on use\nRecommended Use F or use with the SEMCO X - Bond Liquid .\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702 - 222 - 9495\nEmergency Telephone Chemtrec 1 - 800 - 424 - 9300\nClassification\nOSHA Regulatory Status\nNot Regulated\nLabel elements\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nSkin sensitization Category 1B\nEmergency Overview\nAppearance Gray, White or Tan Sandy Powder Physical state Powder Odor None\nDANGER\nCauses severe skin burns and eye damage (Category 1B)\nMay cause allergy or asthma symptoms or breathing difficulties if inhaled\n(Category 1)\nMay cause cancer (inhalation) (Category 1A)\nCauses damage to organs (lung/respiratory system) through prolonged or\nrepeated exposure (inhalation). (Category 1)\nChronic unprotected exposure may lead to silicosis.",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 200
  },
  {
    "id": "doc-x-bond-stone-sds-p2",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 2,
    "text": "Page 1 / 7\nX - BOND STONE\nPage 1 of 7\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out\nof the workplace Wear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get\nmedical advice/attention Wash\ncontaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant. Keep out of drains, sewers, ditches and\nwaterways. Minimize use of water to prevent environmental contamination.\n2.2 Potential Health Effects\nRelevant routes of exposure : Eye contact, skin contact, inhalation\nPotential Acute Health Effects:\nEye : Exposure to airborne concentrations above statutory or recommended exposure limits may cause irritation\nof the eyes .\nSkin : May cause irritation on prolonged or repeated contact.\nInhalation : Exposure to airborne concentrations above statutory or recommended exposure limits may\ncause irritation of the nose, throat of the nose, throat and lungs. Chronic unprotected exposure may lead to\nsilicosis.\nIngestion : Ingest of material may cause vomiting and/or stomach pains.\nCarcinogenicity: IARC: SiO2 NTP: Not Regulated OSHA: Not Regulated\nPotential Chronic Health Effects\nChronic effects : Contains Material that can cause target organ damage (lungs / respiratory system).\nTarget Organs : Contains material which causes damage to the following organs: lungs. Review Section 2\nand 11 for any additional assessments.\nOver - Exposure Signs/Symptoms\nInhalation : Adverse symptoms may include the following: respiratory tract irritation and coughing\n2.3 Potential Environmental Effects\n• Not considered to be harmful to aquatic and terrestrial life.",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 269
  },
  {
    "id": "doc-x-bond-stone-sds-p3",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 3,
    "text": "Page 2 / 7\nX-BOND STONE Revision Date 01-Mar-2015\nRe\nHazards not otherwise classified (HNOC)\nOther Information\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Lower Weight-% Upper Weight-%\nSilica, Crystalline Quartz 14808-60-7 10.0 8.0\nPortland Cement 65997-15-1 15.0 55.0\nCalcium Carbonate 1317-65-3 0.0 7.0\nCalcium Hydroxide 1305-62-0 0.0 15.0\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Immediately flush eyes with plenty of water for at least 15 minutes. Check for and remove\nany contact lenses. Get medical attention if irritation occurs.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse. Consult a\nphysician or other qualified medical personnel if the condition persists.\nInhalation Remove to fresh air. Check for clear airway, breathing and presence of pulse. Provide\nCardiopulmonary resuscitation for persons without pulse or respirations. Consult a physician\nor other medical personnel.\nIngestion If swallowed, dilute by drinking large amounts of water, give at least 2 glasses of water to\ndrink. Consult a physician or other qualified medical personnel. Never give anything by\nmouth to an unconscious person.\nMost important symptoms and effects, both acute and delayed\nSymptoms\nInhalation Adverse symptoms may include the following: respiratory tract irritation and coughing\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol-resistant foam or water spray.\nUnsuitable extinguishing media: None\nProducts of Combustions: None\nUnusual Hazards: None\nSpecific hazards arising from the chemical\nNo information available\nExplosion Data\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nFirefighters should wear self-containing breathing apparatus (pressure demand MSHA/NIOSH\napproved or equivalent) and full fire-fighting turnout gear.\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE-FIGHTING MEASURES",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 320
  },
  {
    "id": "doc-x-bond-stone-sds-p4",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 4,
    "text": "Page 3 / 7\nX - BOND STONE Revision Date 01 - Mar - 2015\nRe\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Use personal protection recommended in section 8.\nEnvironmental precautions\nEnvironmental precautions Keep out of drains, sewers, ditches and waterways. Minimize use of water to prevent\nenvironmental contamination.\nMethods and material for containment and cleaning up\nMethods for containment Handle as a nuisance dust. Use respiratory protection if dust becomes airborne.\nMethods for cleaning up Dispose of in accordance with applicable Federal, State, and Local regulations. Keep\nspills and runoff out of municipal sewers and open bodies of water.\nPrecautions for safe handling\nAdvice on safe handling Do not get in eyes. Avoid contact with skin. Use in well ventilated areas. Wash\nthoroughly after handling.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Store in a cool, dry location and out of direct sunlight. Protect sacks from weather and\nother damage.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines\nCHEMICAL NAME OSHA PEL ACGIH TLV NIOSH REL\nSilica, Crystalline Quartz 30 mg/m 3\n%SiO +2\nNot Established 0.05 mg/m 3 TWA\nPortland Cement 15 mg/m 3 TWA 10 mg/m 3 TWA 10 mg/m 3 TWA\nCalcium Carbonate 15 mg/m 3 TWA 10 mg/m 3 TWA 10 mg/m 3 TWA\nCalcium Hydroxide 15 mg/m 3 TWA 5 mg/m 3 TWA 5 mg/m 3 TWA\nAppropriate engineering controls\nEngineering Controls\nUse local ventilation , if needed.\nIndividual protection measures, such as personal protective equipment\nEye/face protection : Use chemical splash goggles (ANSI 287.1 or approved equivalent)\nSkin Protection: Use rubber or neoprene gloves to provide protection against wet material.\nRespiratory Protection: None required for normal use of this product. If material is sanded or ground when dry , NIOSH/MSHA\napproved respirators for dust should be provided and used. As with any safety product, workers using\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 324
  },
  {
    "id": "doc-x-bond-stone-sds-p5",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 5,
    "text": "Page 4 / 7\nX - BOND STONE Revision Date 01 - Mar - 2015\nRe\nrespirators should be trained in th e proper selection, use and care of such equipment.\nGeneral Hygiene Considerations: Wash thoroughly after handling. Have eye - wash facilities immediately available.\nInformation on basic physical and chemical properties\nPhysical state Solid\nAppearance Powder Odor None\nOdor threshold Not available\nProperty\npH\nValues\nNot available\nR ema rk s •\nM e t hod\nMelting point/freezing point Not available\nBoiling point / boiling range Not applicable\nFlash point Noncombustible\nEvaporation rate No t applicable\nFlammability (solid, gas) Not available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Slightly\nSolubility in other solvents No information available\nPartition Coefficient No information available\nAuto ignition temperature No information available\nDecomposition Temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under normal conditions of storage and use, hazardous polymerization will not occur.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nNone\nIncompatible materials\nNone\nHazardous Decomposition Products\nNone under normal conditions of storage and use .\nInformation on likely routes of exposure\nProduct Information No data available\nInhalation No specific hazard known. May cause transient irritation, headache, nausea, and /or\ninflammation of the nose, throat or lungs.\n9. PHYSICAL AND CHEMICAL PROPERTIES\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 243
  },
  {
    "id": "doc-x-bond-stone-sds-p6",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 6,
    "text": "Page 5 / 7\nX - BOND STONE Revision Date 01 - Mar - 2015\nRe\nEye contact No specific hazard known. May cause transient irritation or alkali burns.\nSkin Contact No specific hazard known. May cause transient irritation or alkali burns.\nIngestion No specific hazard known.\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\n- - - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long - term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity\nEcotoxicity\nNot harmful to aquatic life\nAquatic Toxicity: No data available.\nTerrestrial Toxicity: No data available.\nMobility: No data available.\nChemical Name Algae/aquatic plants Fish Crustacean\n- - - -\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations. Local regulations may be more stringent than regional or national requirements.\nThe information presented below only applies to the material as supplied. The identification\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 227
  },
  {
    "id": "doc-x-bond-stone-sds-p7",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 7,
    "text": "Page 6 / 7\nX - BOND STONE Revision Date 01 - Mar - 2015\nRe\nbased on characteristic(s) or listing may not apply if the material has been used or otherwise\ncontaminated.\nContaminated packaging It is the responsibility of the waste generator to determine toxicity and physical properties of\nthe material generated to determine the proper waste identification and disposal methods in\ncompliance with applicable regulations.\n.\nDOT Not regulated\nLand transport U S D O T Not classified as a dangerous good under transport regulations Sea transport IMDG\nNot classified as a dangerous good under transport regulations Air transport IATA/ICAO\nNot classified as a dangerous good under transport regulations\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non - Domestic Substances List\nUS Federal Regulations\nHCS Classification: Target organ\neffects US Federal Regulations\nSARA 311/312 Classification Immediate (acute) health hazard, Delayed (chronic) health hazard\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains\nthe following toxic chemical(s) subject to the reporting requirements of Section 313 of Title III of the Superfund\nAmendments and Reauthorization Act of 1986, and Subpart C - Supplier Notification Requirement of 40 CFR Part 372.\nNone required.\nSARA 302 Extremely Hazardous Substances None required.\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\n- - - - -\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances\nRQs\nCERCLA/SARA RQ Reportable Quantity (RQ)\n- - - -\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\n14. TRANSPORT INFORMATION\n15. REGULATORY INFORMATION",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 349
  },
  {
    "id": "doc-x-bond-stone-sds-p8",
    "docId": "doc-x-bond-stone-sds",
    "pageNumber": 8,
    "text": "Page 7 / 7\nX - BOND STONE Revision Date 01 - Mar - 2015\nRe\nU.S. State Right - to - Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\n- - - -\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\nPrepared By Samel Sem\nIssue Date 01 - Jan - 2015\nRevision Date 01 - Mar - 2015\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation relates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\n*See Section 2 Hazards Identification\nCaution: HMIS® ratings are based on a 0 - 4 rating scale, with 0 representing minimal hazards or risks, and 4 representing significant\nhazards or risks Although HMIS® ratings are not required on SDSs under 29 CFR 1910.1200, the preparer may choose to provide\nthem. HMIS® ratings are to be used with a fully implemented HMIS® program. HMIS® is a registered mark of the National Paint &\nCoatings Association (NPCA). HMIS® materials may be purchased exclusively from J. J. Keller (800) 327 - 6868.\nThe customer is responsible for determining the PPE code for this material. Legend\nThis information is furnished without warranty, representation, inducement or license if any kind, except that it is accurate to the\nbest of SEMCO Modern Seamless Surface Inc., knowledge or is obtained from sources believed to be accurate. SEMCO\nModern Seamless Surface Inc., does not assume any legal responsibility for its use or reliance upon same/ Customers are\nencouraged to conduct their own tests. Before using any product, read its label.\nEnd of Safety Data Sheet\nNFPA Health Hazards 1 Flammability 0 Instability 0 Physical and\nChemical\nProperties -\nHMIS Health Hazards 1 Flammability 0 Physical hazards 0 Personal\nProtection -\n16. OTHER INFORMATION\nACGIH American Conference of Government Industrial Hygienists\nHMIS Hazardous Material Identification System\nN T P National Toxicology Program\nOSHA Occupational Safety and Health Administration\nSTEL Short Term Exposure Limit\nT W A Time Weighted Average\nNIOSH National Institute for Occupational Safety and Health\nPEL Permissible Exposure Limit",
    "sourceDocument": "X-Bond-Stone-SDS.pdf",
    "title": "X Bond Stone SDS",
    "category": "X-Bond",
    "wordCount": 409
  },
  {
    "id": "doc-x-bondmicrocementdatasheet2024-p1",
    "docId": "doc-x-bondmicrocementdatasheet2024",
    "pageNumber": 1,
    "text": "2024.V01 Page 1 of 2 Technical Product Information\nPRODUCT DESCRIPTION\nSEMCO’s most innovative custom engineered product is X-Bond Microcement , which is the core element in\nboth the SEMCO Remodel without Removal™ and SEMCO’s ADA Safety Floor systems. It creates\nchemical bond at the molecular level to any solid surface. X-Bond Microcement is a zero VOC hybrid of\nnatural stone and advanced cross-linking technology. Perfect for floors, walls, pool decks and waterproofing.\nFEATURES / BENEFITS\n• Flexible waterproof membrane\n• Breathable and chemical resistant\n• Minimizes remodeling waste disposal\n• Interior, exterior, and below grade application\n• Can be safely used in confined areas\n• UV and freeze-thaw damage resistant\nSUBSTRATES\nConcrete surfaces\nCoated surfaces\nCeramic tile\nWood surfaces / decks\nVinyl / VCT surfaces\nNatural stone\nMetal, glass and plexiglass\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2018.V01 Page 1 of 2\nSURFACE ENGINEERING COMPANY\nX-BOND MICROCEMENT\nResurfacing Made Easy\nX-Bond Seamless Stone creates chemical bond\nat the molecular level to any solid surface\nWATERPROOF SEAMLESS STONE\nPRODUCT DESCRIPTION\nSEMCO’s most innovative custom engineered product is X-Bond Seamless Stone, which is the core element\nin both the SEMCO Remodel without Removal™ and SEMCO’s ADA Safety Floor systems. It creates\nchemical bond at the molecular level to any solid surface. X-Bond Seamless Stone is a zero VOC hybrid of\nnatural stone and advanced cross-linking technology. Perfect for floors, walls, pool decks and waterproofing.\nResurfacing Made Easy\nTechnical Product Information\nFEATURES / BENEFITS\n• Flexible waterproof membrane\n• Breathable and chemical resistant\n• Minimizes remodeling waste disposal\n• Interior, exterior, and below grade application\n• Can be safely used in confined areas\n• UV and freeze-thaw damage resistant\nSUBSTRATES\nConcrete surfaces\nCoated surfaces\nCeramic tile\nWood surfaces / decks\nVinyl / VCT surfaces\nNatural stone\nMetal, glass and plexiglass\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2018.V01 Page 1 of 2\nSURFACE ENGINEERING COMPANY\nX-BOND SEAMLESS STONE\nX-Bond Microcement creates chemical bond at\nthe molecular level to any solid surface\nWATERPROOF X-Bond Microcement",
    "sourceDocument": "X-BondMicrocementDataSheet2024.pdf",
    "title": "X BondMicrocementDataSheet2024",
    "category": "X-Bond",
    "wordCount": 342
  },
  {
    "id": "doc-x-bondmicrocementdatasheet2024-p2",
    "docId": "doc-x-bondmicrocementdatasheet2024",
    "pageNumber": 2,
    "text": "AASTM E84 Test Method for Surface Burning Class A\nASTM D635 Test Method for Rate of Burning Met passing criteria for HB classification\nASTM D-3960 - Volatile organic content (VOC) 0 g / L\nASTM D-3l94 – Water content 48.9%\nASTM D-2369 – Non volatile residue 25.9%\nASTM C 1028-6 – Coefficient of friction (mineral) 0.93 dry, 0.92 wet\nASTM C 1028-6 – Coefficient of friction (all finishes) 0.78 dry, 0.63 wet\nASTM C 109 / C109M – 8 – Compressive strength 27 MPa = 3,800 PSI\nASTM C 674 – Modulus of rupture 2,200 PSI\nASTM D 4060-07 – Abrasion resistance, metal 1022 cycles w/ .05 mil loss\nWater permeability test No dampness or formation of water\nSurface temperature reduction Up to 32°F versus standard concrete surface\nUsed automobile oil Excellent\nTransmission fluid Good\nBrake fluid Good\nWater Excellent\nAlkali resistance Excellent\nHydrochloric acid (10%) Good\nCorrosive Chemicals Good\nTechnical Product Information\nTEST RESULTS*\nLABORATORY RESULTS*\n*Tests are based on Semco Modern Seamless Surface experience unless otherwise noted.\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners.\nNot for use on humans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet\nbefore using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness\nof use. The only obligation of the seller-manufacturer shall be to replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or\nconsequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate. However, since the conditions of handling\nand use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply\nwith all applicable federal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 20 22 .V01\nSURFACE ENGINEERING COMPANY Page 2 of 2\nX-BOND MICROCEMENT\nResurfacing Made Easy\nColor Bond Creates a smooth and seamless surface. A generally solid color with very slight variations. Suitable for floors and walls\nNatural Grain Creates a vibrant and moving surface, unseen by any other material. Suitable for floors only\nPolished Bond Designed to create multiple color variations within itself. Suitable for floors and walls\nADA Safety Floor Engineered to assist in remodeling projects which is require ADA compliance in Coefficient of Friction\n(slip resistance), Surface Slope Regrading, and Surface Aperture Closure\nExisting concrete 60-75\nPainted surface 60-75\nCeramic tile 55-75\nVinyl tile 60-75\nNatural stone 50-100\nMetal 60-75\nDrying time 2 hours at 72°F\nCure time 24 hours\nColor White powder and white liquid\nChemical type Polymer modified stone\nClean up Water\nShelf life 1 year in unopened containers\nPackaging (X-Bond Liquid and X-Bond Stone) 1 gal. pail, 5 gal. pail, 55 gal. drum / 50 lb bag\nSPECIFICATIONS\nCOVERAGE (sq. ft. per 2 gallons of X-Bond Liquid and 1 50 lb bag of X-Bond Stone, coverage is based on 1/8” application)\nTEXTURE OPTIONS 2024.V01 Page 2 of 2",
    "sourceDocument": "X-BondMicrocementDataSheet2024.pdf",
    "title": "X BondMicrocementDataSheet2024",
    "category": "X-Bond",
    "wordCount": 578
  },
  {
    "id": "doc-x-bondoverconcretefloordetail-2025-p1",
    "docId": "doc-x-bondoverconcretefloordetail-2025",
    "pageNumber": 1,
    "text": "FLOOR DETAIL SEMCO modern seamless surface\nX-Bond Seamless Stone over concrete or\nconcrete boards/panels\nSURFACE ENGINEERING COMPANY\n... .. <'1 .. ... . . ... ... 4·\n... 4 . ...\n...\nTotal thickness 1/8 \" - 6 \"\n...\n.. 4 4\nD\nD\nD\nD\nD\nD\nIT WORKS!\nSEMCO SURFACES\n�\n. . ...\n.. . <'1 41. ... . '11111\n... - .... • . .. .. <'1\n4 · . ·. . ... �'q\n.. <'1 . .. • <'1 . ..... 4\n·<'1\n4\n. ...\n... 4·\n.. ....\nExisting substrate - concrete or concrete boards/panels\nX-Bond Scratch Coat\nSEMCO Liquid Membrane ™\n(fabric reinforcement at joints and corners)\nSecond X-Bond Scratch Coat\nX-Bond Brown Coat (starting at 1/8\") - optional\nX-Bond Seamless Stone texture - per specification\nColor Bond, Polished Bond, Natural Grain or\nADA Safety Floor\nSatin Stone or Titan Shield Gloss (3 coats)\nSCRATCH COAT\nX·BOND SEAMLESS\nSTONE TEXTURE\nFINISH � .,.,.----j\nSatin Stone or Titan Shield Gloss\n3620 W Reno Avenue/ Las Vegas, NV 89118 / 800.33.SEMCO semcosurfaces.com\n2022 .VOl • Drawings are not to scale\nCJ (/)\nz <(\n- LJ.J\nLL. �\n0 ::!E\n0 z LJ.J\nLJ.J\na::: c::\na. Cl\na::: Cl\nz\nw 1ii\n�\n::::,\n(/)\nc::\n3: <(\nLJ.J\n>-\n-IO\n(/) C'I\nc::\n� LJ.J\n0 0\nc::\nw 0\nC u..\n>-\n...J 5\n0 �\n0 LJ.J\nc::\na. �\n-0\n(/) �\n...J ::::,\n...J (/)\n<t u..\n0\n3: <(\n-w\n(/) �\nC::: Cl\n0�\nOffi ...J Cl\nLL. �\nMADE IN USA\nDISTRIBUTED GLOBALLY",
    "sourceDocument": "X-BondoverConcreteFloorDetail-2025.pdf",
    "title": "X BondoverConcreteFloorDetail",
    "category": "X-Bond",
    "wordCount": 269
  }
];
