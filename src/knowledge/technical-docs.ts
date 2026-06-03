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
    "id": "doc-lm-data-sheet",
    "title": "LM Data Sheet",
    "sourceDocument": "LM+Data+Sheet.pdf",
    "category": "Liquid Membrane",
    "pageCount": 1
  },
  {
    "id": "doc-lm-tech-sheet",
    "title": "LM Tech Sheet",
    "sourceDocument": "LM+Tech+Sheet.pdf",
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
    "id": "doc-open-sip-manual-master-copy-v2019-3-2",
    "title": "Open SIP manual master copy  3 2",
    "sourceDocument": "Open SIP manual - master copy v2019-3 2.pdf",
    "category": "SIP manual",
    "pageCount": 49
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
    "id": "doc-satin-stone-data-sheet",
    "title": "Satin Stone Data Sheet",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "category": "Satin Stone",
    "pageCount": 10
  },
  {
    "id": "doc-satin-stone-tech-sheet",
    "title": "Satin Stone Tech Sheet",
    "sourceDocument": "Satin+Stone+Tech+Sheet.pdf",
    "category": "Satin Stone",
    "pageCount": 3
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
    "sourceDocument": "Shower+Detail+Concrete.pdf",
    "category": "Shower detail",
    "pageCount": 1
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3",
    "title": "Tech Sheet X Bond",
    "sourceDocument": "Tech_Sheet_X-Bond+2024+v3.pdf",
    "category": "X-Bond",
    "pageCount": 3
  }
];

export const TECHNICAL_DOC_PAGES: TechnicalDocPage[] = [
  {
    "id": "doc-lm-data-sheet-p1",
    "docId": "doc-lm-data-sheet",
    "pageNumber": 1,
    "text": "PRODUCT DESCRIPTION\nSEMCO’s Liquid Membrane™ is a single component waterproofing and anti-fracture membrane. The SEMCO\nLiquid Membrane™ is a self-contained elastomeric fluid suspended in a copolymer adhesive, this revolutionary blend\nenables easy application while providing excellent bridging, and waterproofing. When combined with SEMCO’s\nX-Bond Seamless Stone, two-stage waterproofing is achieved, enabling single source protection.\nANSI 118.10 – Breaking Strength (ASTM D751, Procedure B) Pass\nANSI 118.10 – Dimensional Stability (ASTM D1204) Pass\nANSI 118.10 – 7-Day Shear Strength (ASTM C482-9.8) 173 PSI\nANSI 118.10 – 7-Day Water Immersion Shear Strength 132 PSI\nANSI 118.10 – 4-Week Shear Strength 234 PSI\nASTM E96 – Water Vapor Transmission 1.52 (g/hr-m2)\nASTM E96 – Water Vapor Transmission: Permeability 0.135 (perm-in)\nISO 37 – Tensile Strength (ASTM D412): Maximum Stress 453 PSI\nISO 37 – Tensile Strength (ASTM D412): Ultimate Elongation 321%\nASTM D42370 – Tensile Strength: Maximum Stress 184 PSI\nASTM D42370 – Tensile Strength: Ultimate Elongation 1,300%\nSEMCO LIQUID MEMBRANE ™\nWaterproof Adhesive\nTechnical Product Information\nWARRANTY 5 year standard limited warranty, 10 year for non-traffic surfaces\nTEST RESULTS\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. When performing a flood test remove all excess water if test is performed prior to 100% curing. Not for use on humans or animals. Be sure to read container\nlabel and Safety Data Sheet for additional handling requirements before using this product.\nLIMITED WARRANTY NOTICE\nSEMCO Modern Seamless Surface warrants that its products will meet their specifications. There are no other warranties, expressed or implied of merchantability or fitness of use. The only obligation of the seller-manufacturer shall be\nto replace material found to be defective. SEMCO Modern Seamless Surface will not be liable for labor or consequential damage of any kind. The information contained herein is, to the best of our knowledge and belief, true and accurate.\nHowever, since the conditions of handling and use are beyond our control, we make no guarantee of results, and assume no liability for damages incurred by use of this material. It is the responsibility of the user to comply with all applicable\nfederal, state and local laws and regulations. All chemicals may present unknown health hazards and should be used with caution.\n3620 W Reno Avenue / Las Vegas, NV 89118 / 702.222.9495 semcosurfaces.com 2023.V01\nSURFACE ENGINEERING COMPANY\nSUBSTRATES\n• Concrete\n• Plywood\n• Stone\n• Exterior/Interior cladding\n• Residential, industrial, and\ncommercial\nFEATURES / BENEFITS\n• Waterproofing:\ninterior, exterior and below grade\n• Crack bridging\n• Stabilization\n• Anti-fracture\nOpen pore substrates 25-50\nClosed pore substrates 35-65\nX-Bond Scratch Coat 100-150\nApplication 1/2” nap roller, paint brush or airless sprayer with tip size21 at 2,500 PSI (2 coats minimum)\nApplication environment Apply at temperatures from 50°F to 90°F\nDrying time 25 to 30 minutes at 72°F\nCure time 50% in 72 hours, 100% in 7 days\nColor Orange (other colors available upon request)\nChemical type Latex - crossilink hybrid\nClean up SEMCO Stone Soap with water\nShelf life 2 years in controlled environment (60°F - 72°F)\nWater test In 35 minutes after application\nPackaging (base and color activator) 1 gal., 5 gal. and 55 gal.\nVOC content 14 g/L or 0.20%\nAPPLICATION AND SPECIFICATIONS\nCOVERAGE (sq. ft. per gallon of mixture)",
    "sourceDocument": "LM+Data+Sheet.pdf",
    "title": "LM Data Sheet",
    "category": "Liquid Membrane",
    "wordCount": 542
  },
  {
    "id": "doc-lm-tech-sheet-p1",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 1,
    "text": "Product Data SEMCO LIQUID MEMBRANE\nThe SEMCO Liquid Membrane is a single component waterproofing and anti fracture membrane.\nThe SEMCO Liquid Membrane is a self-contained elastomeric fluid suspended in a copolymer\nadhesive, this revolutionary blend enables easy application while providing excellent bridging, and\nwaterproofing. When combined with SEMCO’s X-Bond Seamless Stone, two-stage waterproofing is\nachieved, enabling single source protection.\nPRODUCT\nUSES\nCOVERAGE\nOpen pore substrates 100 - 200\nClosed pore substrates 140 - 250\nX-Bond Scratch Coat 200 - 300\nCOVERAGE sq ft. / gallon @2 coats\nSUBSTRATES\n• Concrete\n• Plywood\n• Stone\n• Exterior/Interior Cladding\n• Residential, Industrial and\nCommercial\nWater-\nproofing\nCrack\nBridging\nAdhesion\n\n\n\nOdorless/Low VOC\nwaterproofing that allows you to pro-\nceed with your finish within 2 hours\nof application enabling a speedier\nproject completion.\nRepair existing surface cracks and\nimperfections to ensure clean and\nsmooth finish\napplication.\nIntegrated chemical adhesion\nenables mechanical cross-linking to\napplied surfaces, creating a perfect\nbond for long lasting\nprotection\nAnti-\nfracture\n\nUp to 400% stretch and\nelongation providing future crack\nsuppression for years to come.\nScan to watch application",
    "sourceDocument": "LM+Tech+Sheet.pdf",
    "title": "LM Tech Sheet",
    "category": "Liquid Membrane",
    "wordCount": 183
  },
  {
    "id": "doc-lm-tech-sheet-p2",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 2,
    "text": "TECHNICAL DATA\nApplication 1/2 “ nap roller ; Airless sprayer with tip size 21 at 2,500 PSI (minimum 2 coats\nApplication environment Apply at temperatures from 50°F to 90°F\nColor Orange ( other colors available on request)\nChemical type Latex - crosslink hybrid\nClean up SEMCO Stone Soap with water\nShelf life 2 year in controlled environment (ambient temperature of 60F - 72F)\nPackaging 1 gal. | 5 gal. | 55gal.\nVOC Content 14 g/L or 0.20%\nDRYING / RECOAT TIME\nTemperature in F\nTime\n72 F\n25 to 30\nminutes\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated individ -\nually.\nThe chart represents the time needed in be -\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n10 days 3 days\n50%\n12 hrs\nTime\n50 F 72 F 90 F\n5 days 7 days\n90 F 77 F 67 F\n1 h\n45 min\nCURE TIME\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.\nASTM TEST RESULTS\nANSI 118.10 - Breaking Strength ( ASTM D751, Procedure B ) Pass\nANSI 118.10 - Dimensional Stability ( ASTM D1204 ) Pass\nANSI 118.10 - 7-Day Shear Strength ( ASTM C482-9.8) 173 PSI / Shear\nANSI 118.10 - 7-Day Water Immerseion Shear Strength 132 PSI\nANSI 118.10 - 4-Week Shear Strength 234 PSI\nASTM E96 - Water Vapor Transmission 1.52 (g/hr-m2)\nASTM E96 -Water Vapor Transmission : Permeability 0.135 (perm-in)\nISO 37 - Tensile Strength ( ASTM D412 ) : Maximum Stress 390 PSI\nISO 37 - Tensile Strength ( ASTM D412 ) : Ultimate Elongation 400 %",
    "sourceDocument": "LM+Tech+Sheet.pdf",
    "title": "LM Tech Sheet",
    "category": "Liquid Membrane",
    "wordCount": 301
  },
  {
    "id": "doc-lm-tech-sheet-p3",
    "docId": "doc-lm-tech-sheet",
    "pageNumber": 3,
    "text": "PROCEDURE\n• Apply minium 2 coats of X-Bond Membrane with a 3/8” roller to achieve a thickness of at least 3 mil to retard future reoccur-\nrence of crack. Wait 30 minutes at 70F before applying next coat.\n• Apply X-Bond Liquid with brush as a primer coat into the crack. Do not allow to dry. Apply mixture of X-Bond 1 part X-Bond\nLiquid to 2 1/2 parts of X-Bond Stone to fill up the crack. Allow mixture to dry, ONCE DRY roll 2 coats of X-Bond Membrane to\nachieve a thickness of at least 3 mil to retard future reoccurrence of crack. 30 min at 70 F between coats.\nCRACKS BETWEEN 1/16 - 1/4 INCH\nFRACTURES UP TO 1/16 INCH CRACKS\nCRACKS OR OPENINGS EXCEEDING 1/4 INCH\n• Roll X-Bond Liquid as a primer coat. Do not Allow to dry. Apply mixture of X-Bond 1 part X-Bond Liquid to 2 1/2 parts of X-Bond\nStone into the crack. Allow mixture to dry, ONCE DRY roll 1 coat of SEMCO Liquid Membrane, while still wet embed Fabric\nMembrane 6” to surface, and immediately roll an additional 2 coats of SEMCO Liquid Membrane to fully encapsulate the Fabric\nMembrane\n• When applying the next line of Fabric Membrane overlap the new sheet over the existing sheet a minimum of 2”\n• Allow surface to dry and proceed to X-Bond Brown Coat in the SEMCO SIP Manual\nSEMCO LIQUID MEMBRANE PROCEDURE\n• Sweep debris off of surface\n• Use a 1/2 ” roller. Allow any pre-treated areas to dry to the touch. Apply a generous coat of SEMCO Liquid Membrane with\nbrush or roller over substrate including pre-treated areas. Apply another generous coat of SEMCO Liquid Membrane over\nthe first coat of SEMCO Liquid Membrane. Let topcoat dry to the touch, approximately 1–2 hours at 70°F (21°C) and 50% RH.\nWhen last coat has dried to the touch, inspect final surface for pinholes, voids, thin spots or other defects. SEMCO Liquid\nMembrane will dry to bright orange color when it’s dry to touch. Use additional X-Bond Membrane to seal the defects.\nRequired thickness is 3 mil\nSEMCO LIQUID MEMBRANE SPRAY APPLICATION\n• Sweep debris off of surface\n• The sprayer being used for the application of SEMCO Liquid Membrane should be capable of producing a minimum of 2,500\npsi (17.2), maximum of 3,300 psi (22.8 MPa) with a flow rate of 0.95 to 1.6 GPM (3.6 to 6.0 LPM) using a 0.521 or a 0.631 reversible\ntip. Keep the unit filled with SEMCO Liquid Membrane to ensure continuous application of liquid. The hose length should\nnot exceed 100’ (30 m) in length and 3/8” (9 mm) in diameter. Required thickness is 3 mil\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual.\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO Liquid Membrane are available upon request.\nSURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nProudly made in USA",
    "sourceDocument": "LM+Tech+Sheet.pdf",
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
    "id": "doc-satin-stone-data-sheet-p1",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 1,
    "text": "SATIN STONE Epoxy Polyaspartic Polyurethane\nUV Stable for Outdoors YES NO YES YES\nResistance to Highly Acidic Chemicals pH < 2 YES NO YES YES\nResistance to Extremely Alkaline Chemicals pH > 12 YES YES NO NO\nExtreme Abrasion Resistance YES YES NO NO\nBond strength exceeds 400 PSI YES YES NO YES",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 53
  },
  {
    "id": "doc-satin-stone-data-sheet-p2",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 2,
    "text": "Abrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nWater permeability EN 1062-3 W3 - low at 0.013\nVOC Emission test according EMICODE EC 1 PLUS\nPerformance test - stain resistance PASSED\nSlip resistance ADA Safety Surface DCOF 0.86\nSlip resistance AS/NZS 4586 - pendulum Slider 96(4S) - P4 = 45 - 54\n3/8” nap, woven",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 59
  },
  {
    "id": "doc-satin-stone-data-sheet-p3",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 3,
    "text": "Acetic Acid, 15% 1 Chloroform 1 Methanol 2\nAcetic Acid, 25% 2 Chromic Acid, 50% *1 Methylene Chloride 3 3\nAcetic Acid, Glacial 3 Citric Acid, 50% 1 Methyl Ethyl Ketone 4\nAcetone 4 Cola Syrup 1 Nitric Acid, 15% *1\nAluminum Chloride 1 Copper Chloride 1 Oleic Acid 1\nAluminum Nitrate 1 Copper Nitrate 1 Phosphoric Acid, 85% 1\nAluminum Sulfate 1 Copper Sulfate 1 Potassium Chloride 1\nAmmonium Hydroxide 1 Diesel Fuel 1 Potassium Cyanide 1\nAmmonium Nitrate 1 Ethyl Acetate 1 Potassium Hydroxide 1\nAmmonium Sulfate 1 Ethyl Alcohol 1 Potassium Nitrate 1\nAniline 3 Formaldehyde 1 Potassium Sulfate 1\nBarium Chloride 1 Formic Acid 25% 1 Skydrol 1\nBarium Hydroxide 1 Hydrobromic Acid, 48% *1 Sodium Hydroxide, 50% 1\n%DULXP\u00036XOƃGH 1 Hydrochloric Acid, 37% *1 Sodium Chloride 1\nBeer 1 +\\GURƄXRULF\u0003$FLG\u000f\u0003\u0015\u0018\b 2 Sulphuric Acid, 50% *1\nBenzene 1 Hydrogen Peroxide, 30% 1 Tetrahydrofuran 1\nBrake Fluid 1 Lactic Acid, 50% 1 Tolulene 1\nBoric Acid 1 Lactic Acid, 85% 2 Trichlorethylene 1\nN-Butyric Acid, 50% 3 Jet Fuel 1 Trichlorethane 1\nCalcium Chloride 1 Isopropyl Alcohol 1 Urea 1\nCalcium Hydroxide 1 Maleic Acid, 40% 2 Xylene 1",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 192
  },
  {
    "id": "doc-satin-stone-data-sheet-p4",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 4,
    "text": "Page 1 / 7\nSAFETY DATA SHEET\nIssue Date 3-04-2016 Revision Date 03-04-2016 Version 1\nProduct identifier\nProduct Name SATIN 6721(\nOther means of identification\nProduct Code XTS1000\nRecommended use of the chemical and restrictions on use\nRecommended Use For Industrial, and Commercial Use\nUses advised against No information available\nDetails of the supplier of the safety data sheet\nManufacturer Address\nSEMCO Modern Seamless Surface\n3620 West Reno Ave\nLas Vegas, NV 89118\nEmergency telephone number\nCompany Phone Number 702-222-9495\nEmergency Telephone Chemtrec 1-800-424-9300\nClassification\nOSHA Regulatory Status\nThis chemical is considered hazardous by the 2012 OSHA Hazard Communication Standard (29 CFR 1910.1200)\nLabel elements\n1. IDENTIFICATION OF THE SUBSTANCE/PREPARATION AND OF THE COMPANY/UNDERTAKING\n2. HAZARDS IDENTIFICATION\nSkin sensitization Category 1\nEmergency Overview\nWarning\nHazard statements\nMay cause an allergic skin reaction\nAppearance P a r t A M i l k y W h i t e P a r t B\nClear Liquid Physical state Liquid Odor Slight",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 160
  },
  {
    "id": "doc-satin-stone-data-sheet-p5",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 5,
    "text": "Page 2 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nPrecautionary Statements - Prevention\nAvoid breathing dust/fume/gas/mist/vapors/spray\nContaminated work clothing should not be allowed out of the workplace\nWear protective gloves\nPrecautionary Statements - Response\nGet medical advice/attention if you feel unwell\nIF ON SKIN: Wash with plenty of soap and water\nIf skin irritation or rash occurs: Get medical advice/attention\nWash contaminated clothing before reuse\nPrecautionary Statements - Disposal\nDispose of contents/container to an approved waste disposal plant\nHazards not otherwise classified (HNOC)\nOther Information\n! \"#$%&'()*+)#,'#*-.)(-&/)0-*1)(+23)(#4*-23)/&&/.*4\n! \"#$%&'()*+)#,'#*-.)(-&/\nUnknown Acute Toxicity 52.60961% of the mixture consists of ingredient(s) of unknown toxicity\nChemical Name CAS No. Weight-% Trade Secret\nAmmonium hydroxide 1336-21-6 <0.10 *\n*The exact percentage (concentration) of composition has been withheld as a trade secret.\nFirst aid measures\nEye contact Rinse thoroughly with plenty of water for at least 15 minutes, lifting lower and upper eyelids.\nConsult a physician.\nSkin Contact Wash skin with soap and water. Wash contaminated clothing before reuse.\nInhalation Remove to fresh air.\nIngestion Clean mouth with water and drink afterwards plenty of water.\nMost important symptoms and effects, both acute and delayed\nSymptoms No information available.\nIndication of any immediate medical attention and special treatment needed\nNote to physicians Treat symptomatically.\nSuitable extinguishing media\nUse extinguishing measures that are appropriate to local circumstances and the surrounding environment. Dry chemical, CO2,\nalcohol-resistant foam or water spray.\nUnsuitable extinguishing media Caution: Use of water spray when fighting fire may be inefficient.\nSpecific hazards arising from the chemical\nNo information available.\nExplosion data\n3. COMPOSITION/INFORMATION ON INGREDIENTS\n4. FIRST AID MEASURES\n5. FIRE-FIGHTING MEASURES",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 267
  },
  {
    "id": "doc-satin-stone-data-sheet-p6",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 6,
    "text": "Page 3 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nSensitivity to Mechanical Impact None.\nSensitivity to Static Discharge None.\nProtective equipment and precautions for firefighters\nAs in any fire, wear self-contained breathing apparatus pressure-demand, MSHA/NIOSH (approved or equivalent) and full\nprotective gear.\nPersonal precautions, protective equipment and emergency procedures\nPersonal precautions Ensure adequate ventilation, especially in confined areas.\nEnvironmental precautions\nEnvironmental precautions See Section 12 for additional ecological information.\nMethods and material for containment and cleaning up\nMethods for containment Prevent further leakage or spillage if safe to do so. Dike far ahead of spill; use dry sand to\ncontain the flow of material.\nMethods for cleaning up Pick up and transfer to properly labeled containers.\nPrecautions for safe handling\nAdvice on safe handling Handle in accordance with good industrial hygiene and safety practice.\nConditions for safe storage, including any incompatibilities\nStorage Conditions Keep containers tightly closed in a dry, cool and well-ventilated place.\nIncompatible materials None known based on information supplied.\nControl parameters\nExposure Guidelines This product, as supplied, does not contain any hazardous materials with occupational\nexposure limits established by the region specific regulatory bodies.\nAppropriate engineering controls\nEngineering Controls Showers\nEyewash stations\nVentilation systems.\nIndividual protection measures, such as personal protective equipment\nEye/face protection No special technical protective measures are necessary.\nSkin and body protection No special technical protective measures are necessary.\nRespiratory protection If exposure limits are exceeded or irritation is experienced, NIOSH/MSHA approved\nrespiratory protection should be worn. Positive-pressure supplied air respirators may be\nrequired for high airborne contaminant concentrations. Respiratory protection must be\nprovided in accordance with current local regulations.\nGeneral Hygiene Considerations Handle in accordance with good industrial hygiene and safety practice.\n6. ACCIDENTAL RELEASE MEASURES\n7. HANDLING AND STORAGE\n8. EXPOSURE CONTROLS/PERSONAL PROTECTION\n9. PHYSICAL AND CHEMICAL PROPERTIES",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 295
  },
  {
    "id": "doc-satin-stone-data-sheet-p7",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 7,
    "text": "Page 4 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nInformation on basic physical and chemical properties\nPhysical state Liquid\nAppearance Milky liquid Part A, Clear Part B Odor Slight\nOdor threshold No information available\nProperty\npH\nValues\n7-8\nRemarks • Method\nMelting point/freezing point 32°F\nBoiling point / boiling range >212°F similar to water\nFlash point Not applicable ,( water-base)\nproduct) Evaporation rate No information available\nFlammability (solid, gas) No information available\nFlammability Limit in Air\nUpper flammability limit:\nLower flammability limit:\nVapor pressure\nNo information available\nNo information available\nNo information available\nVapor density No information available\nWater solubility Dispersible\nSolubility in other solvents No information available\nPartition coefficient No information available\nAutoignition temperature No information available\nDecomposition temperature No information available\nReactivity\nNo data available\nChemical stability\nStable under recommended storage conditions.\nPossibility of Hazardous Reactions\nNone under normal processing.\nConditions to avoid\nProtect from freezing - product stability may be affected.\nIncompatible materials\nNone known based on information supplied.\nHazardous Decomposition Products\nNone known based on information supplied.\nInformation on likely routes of exposure\nProduct Information No data available\nInhalation No data available.\nEye contact No data available.\nSkin Contact No data available.\nIngestion .\n10. STABILITY AND REACTIVITY\n11. TOXICOLOGICAL INFORMATION",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 204
  },
  {
    "id": "doc-satin-stone-data-sheet-p8",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 8,
    "text": "Page 5 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nChemical Name Oral LD50 Dermal LD50 Inhalation LC50\nAmmonium hydroxide\n1336-21-6\n= 140 mg/kg ( Rat ) - -\nInformation on toxicological effects\nSymptoms No information available.\nDelayed and immediate effects as well as chronic effects from short and long-term exposure\nSensitization No information available.\nGerm cell mutagenicity No information available.\nCarcinogenicity No information available.\nReproductive toxicity No information available.\nSTOT - single exposure No information available.\nSTOT - repeated exposure No information available.\nAspiration hazard No information available.\nNumerical measures of toxicity - Product Information\nUnknown Acute Toxicity 20.60961% of the mixture consists of ingredient(s) of unknown toxicity\nEcotoxicity\nHarmful to aquatic life\n14.9100635% of the mixture consists of components(s) of unknown hazards to the aquatic environment\nChemical Name Algae/aquatic plants Fish Crustacea\nAmmonium hydroxide\n1336-21-6\n- 4.1: 96 h Pimephales promelas\nmg/L LC50\n0.33: 24 h water flea mg/L EC50\n0.22: 24 h Daphnia pulex mg/L\nEC50\nPersistence and degradability\nNo information available.\nBioaccumulation\nNo information available.\nOther adverse effects No information available\nWaste treatment methods\nDisposal of wastes Disposal should be in accordance with applicable regional, national and local laws and\nregulations.\nContaminated packaging Do not reuse container.\n12. ECOLOGICAL INFORMATION\n13. DISPOSAL CONSIDERATIONS\n14. TRANSPORT INFORMATION",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 208
  },
  {
    "id": "doc-satin-stone-data-sheet-p9",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 9,
    "text": "Page 6 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nDOT Not regulated\nSea transport Not regulated\nInternational Inventories\nTSCA Complies\nDSL/NDSL Complies\nLegend:\nTSCA - United States Toxic Substances Control Act Section 8(b) Inventory\nDSL/NDSL - Canadian Domestic Substances List/Non-Domestic Substances List\nUS Federal Regulations\nSARA 313\nSection 313 of Title III of the Superfund Amendments and Reauthorization Act of 1986 (SARA). This product contains a chemical\nor chemicals which are subject to the reporting requirements of the Act and Title 40 of the Code of Federal Regulations, Part 372\nChemical Name SARA 313 - Threshold Values %\n6$7,1\u00036721(\nSARA 311/312 Hazard Categories\nAcute health hazard No\nChronic Health Hazard No\nFire hazard No\nSudden release of pressure hazard No\nReactive Hazard No\nCWA (Clean Water Act)\nThis product contains the following substances which are regulated pollutants pursuant to the Clean Water Act (40 CFR 122.21\nand 40 CFR 122.42)\nChemical Name CWA - Reportable\nQuantities\nCWA - Toxic Pollutants CWA - Priority Pollutants CWA - Hazardous\nSubstances\nAmmonium hydroxide\n1336-21-6\n1000 lb - - X\nCERCLA\nThis material, as supplied, contains one or more substances regulated as a hazardous substance under the Comprehensive\nEnvironmental Response Compensation and Liability Act (CERCLA) (40 CFR 302)\nChemical Name Hazardous Substances RQs CERCLA/SARA RQ Reportable Quantity (RQ)\nAmmonium hydroxide\n1336-21-6\n1000 lb - RQ 1000 lb final RQ\nRQ 454 kg final RQ\nUS State Regulations\nCalifornia Proposition 65\nWARNING: This product contains chemicals known to the State of California to cause cancer and birth defects or other\nreproductive harm.\nU.S. State Right-to-Know Regulations\nChemical Name New Jersey Massachusetts Pennsylvania\nAmmonium hydroxide\n1336-21-6\nX X X\nU.S. EPA Label Information\nEPA Pesticide Registration Number Not Applicable\n15. REGULATORY INFORMATION",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 285
  },
  {
    "id": "doc-satin-stone-data-sheet-p10",
    "docId": "doc-satin-stone-data-sheet",
    "pageNumber": 10,
    "text": "Page 7 / 7\n6$7,1\u00036721( Revision Date 3-4-2016\nNFPA Health hazards 1 Flammability 0 Instability 0 Physical and Chemical\nProperties -\nHMIS Health hazards 1 Flammability 0 Physical hazards 0 Personal protection X\nPrepared By Samel Sem\nIssue Date 3-4-2016\nRevision Date 3-4-2016\nRevision Note\nNo information available\nDisclaimer\nThe information provided in this Material Safety Data Sheet is correct to the best of our knowledge, information and belief\nat the date of its publication. The information given is designed only as a guidance for safe handling, use, processing,\nstorage, transportation, disposal and release and is not to be considered a warranty or quality specification. The\ninformation relates only to the specific material designated and may not be valid for such material used in combination\nwith any other materials or in any process, unless specified in the text.\nEnd of Safety Data Sheet\n16. OTHER INFORMATION",
    "sourceDocument": "Satin+Stone+Data+Sheet.pdf",
    "title": "Satin Stone Data Sheet",
    "category": "Satin Stone",
    "wordCount": 146
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
    "sourceDocument": "Shower+Detail+Concrete.pdf",
    "title": "Shower Detail Concrete",
    "category": "Shower detail",
    "wordCount": 121
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p1",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 1,
    "text": "Product Data X-Bond\nMicrocement\nSEMCO’s most innovative custom engineered product is X-Bond Microcement, which is the core\nelement in both the SEMCO Remodel without Removal™ and SEMCO’s ADA Safety Floor\nsystems. It creates chemical bond at the molecular level to any solid surface. X-Bond Microcement\nis a zero VOC hybrid of natural stone and advanced cross-linking technology. Perfect for floors,\nwalls, pool decks and waterproofing.\nPRODUCT\nUSES\nCOVERAGE\nConcrete 60 - 75\nPainted surface 60 - 75\nCeramic tile 55 - 75\nVinyl tile 60 - 75\nNatural stone 50 - 100\nMetal 60 - 75\n(sq. ft. per 2 gallons of X-Bond Liquid and 1 50 lb\nbag of X-Bond Stone, coverage is based on 1/8”\napplication)\nSUBSTRATES\n• Flexible waterproof membrane\n• Breathable and chemical resistant\n• Minimizes remodeling waste\n• disposal\n• Interior, exterior, and below grade\napplication\n• Can be safely used in confined areas\n• UV and freeze-thaw damage resistant\nInterior\nExterior\nWetrooms\nCommercial\nIndustrial\n\n\n\n\n\nSURFACE ENGINEERING COMPANY\nThrough the use of the X-Bond\nMicrocement, which chemically ad-\nheres to any existing surface,\nallows any space to be remodelled\nwithout the removal of the existing\nsubstrate.\nUV-resistant and can be applied to\nany existing hard surface\nWith its low water permeability,\nX-BOND Microcement can be used in\nwetrooms and pools.\nX-Bond Microcement’s extreme\ndurability and resistance to abrasion,\nallows it to be used in high foot traffic\nareas such as commercial spaces.\nExcellent chemical resistance and\nabrasion resistance allow the X-BOND\nMicrocement to be used in\nindustrial applications.",
    "sourceDocument": "Tech_Sheet_X-Bond+2024+v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 258
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p2",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 2,
    "text": "APPLICATION\nApplication Smoother, Magic Trowel, Hopper Texture Gun and compressor\nApplication environment Apply at temperatures from 45°F to 100°F\nColor White powder and white liquid\nChemical type Polymer modified stone\nClean up SEMCO Stone Soap with water\nShelf life 1 year in unopened containers (ambient temperature of 60F - 72F)\nPackaging 1 gal. pail, 5 gal. pail, 55 gal. drum / 50 lb bag\nDRYING / RECOAT TIME\nT emperature in F\nTime\n72 F\n2 hrs\n50 F\nDrying times are affected by temperature and\nrelative humidity. The chart represents guidline\nvalues but each project is to be treated\nindividually.\nThe chart represents the time needed in be-\ntween coats at specified temperature.\nCure / humidity\nTime\n75%\n48 hrs 8 hrs\n50%\n12 hrs\nLight foot\ntraffic\n50 F 72 F 95 F\n14 hrs 24 hrs\n95 F 80 F 60 F\n3.5 hrs\n2.5 hrs\nCURE TIME\nTEST RESULTS\nAbrasion testing ISO 7784 with 10,000 rubs Mass loss of 0.017g only\nASTM D-3960 - Volatile organic content (VOC) 0g / L\nASTM D-3l94 – Water content 48.9 %\nASTM D-2369 – Non volatile residue 25.9 %\nASTM C 1028-6 – Coefficient of friction (mineral) DCOF 0.86\nASTM C 1028-6 – Coefficient of friction (all finishes) 0.78 dry, 0.63 wet\nASTM C 109 / C109M – 8 – Compressive strength 27 MPa = 3,800 PSI\nASTM C 674 – Modulus of rupture 2,200 PSI\nISO 7784 – Abrasion resistance, metal 10,000 cycles with 0.017g mass loss\nASTM D 4060-07 – Abrasion resistance, metal 1022 cycles w/ .05 mil loss\nEN 1062-3 Water permeability test Class W3 - 0,013 kg/(m2.h0.5)\nCuring time is affected by temperature and\nhumidity.\nFor example at only 50F, a full cure would take\n10 days in comparison to at 95 F it would only\ntake 5 days to cure.",
    "sourceDocument": "Tech_Sheet_X-Bond+2024+v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 306
  },
  {
    "id": "doc-tech-sheet-x-bond-2024-v3-p3",
    "docId": "doc-tech-sheet-x-bond-2024-v3",
    "pageNumber": 3,
    "text": "SURFACE ENGINEERING COMPANY\nPRECAUTIONS\nAlways test a small area first to determine ease of application and desired results. Gloves and eye protection should be worn during application. Do not mix with other cleaners. Not for use on\nhumans or animals. If any contact with skin or eyes occurs, wash immediately with plenty of water. Be sure to read container label and Material Safety Data Sheet before using this product.\nLIMITED WARRANTY NOTICE\nThe technical details, recommendations and other information contained in this data sheet are given in good faith and represent the best of our knowledge and experience at the time of printing. It\nis your responsibility to ensure that our products are used and handled correctly and in accordance to SEMCO Post Matrix procedure, recommendations and only for the uses they are intended. We\nalso reserve the right to update information without prior notice to you to reflect our ongoing research and development program. Federal, state and local specific recommendations, depending\non local standards, codes of practice, building regulations or industry guidelines, may effect specific installation recommendations. The supply of our products and services is also subject to certain\nterms, warranties and exclusions, which may have already been disclosed to you in prior dealings or are otherwise available to you on request.\n3620 W Reno Avenue | Las Vegas, NV 89118\nP 800.33.SEMCO | info@semcomfg.com\nNOTES\n• Extended application procedures can be found in the SEMCO SIP Manual. Procedures for cleaning of the flooring system\nduring operations can be found in the SEMCO SIP Manual or upon request\n• Acceptable moisture levels in concrete according to ASTM standard, when testing via ASTM F2170, the rH level of a concrete\nslab needs to be at or below 75% rH, unless otherwise instructed in writing from SEMCO Technical Support Division\n• Procedures for cleaning of the flooring system during operations can be found in the SEMCO SIP Manual or upon request\n• Safety Data Sheets for SEMCO X-BOND Microcement are available upon request.\n• Over time due to normal wear, abrasion, traffic and cleaning. Generally, high gloss coatings are subject to a reduction in\ngloss, while matte finish coatings can increase in gloss level under normal operating conditions.\n• Excessive service conditions, such as steel- or hard plastic-wheeled traffic or dragging heavy metal equipment or loaded\npallets with protruding nails over the surface, are categorized as misuse and abuse.\n• Allowances must be made for scratches or abrasions that occur due to moving or sliding furniture or fixtures over the\nsurface\nProudly made in USA\nPROCEDURE\n• Execute appropriate preparation method to suit your needs before application. Reference to the SEMCO SIP Manual under\nthe Surface Preparation Section.\n• Test pH level after preparation ( optimal pH level is 6.8 - 7.8 )\nSTEP 1 - PREPARATION\n• Mix X-Bond mixture 1 part X-Bond Liquid to 2 parts of X-Bond Stone, in this order, and mix with square mixing paddle at low\nspeed (180-200 RPM)\n• While the X-Bond Liquid is still tacky, pour the mixture to the mud tray, use a hand broom to spread material from left to\nright, NOT up and down\n• Using hand broom spread material tightly, in ONE DIRECTION and allow surface to dry afterwards\nSTEP 2 - SCRATCH COAT / PRIMER COAT\nTOOLS NEEDED\n• X-Bond Smoother\n• Roll X-Bond Liquid as primer coat. Do not allow to dry\n• Mix X-Bond mixture 1 part X-Bond Liquid to 2 1/2 parts of X-Bond Stone, in this order, mix with square mixing paddle at low\nspeed (180-200 RPM) (OPTIONAL) Use integral color with X-Bond Color Activator\n• Using a Trowel or X-Bond smoother for larger areas, tilt smoother with the handle pointing to 10 o’clock, spread material\ntightly, in ONEDIRECTION. Thickness is 1/16 or 2mil\n• Allow coat of X-Bond to dry slightly to the touch (20-30 minutes) before applying second coat. Use shoe covers in between\ncoats\nSTEP 3 - SKIM COATS",
    "sourceDocument": "Tech_Sheet_X-Bond+2024+v3.pdf",
    "title": "Tech Sheet X Bond",
    "category": "X-Bond",
    "wordCount": 658
  }
];
