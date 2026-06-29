-- ============================================================
-- Provider Notes & Organization Update — Part 3
-- Remaining named clinics/practices identified by website
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Chatterbox Therapy Solutions (Saskatoon) ────────────────
UPDATE providers SET
  organization = 'Chatterbox Therapy Solutions',
  notes = 'Chatterbox Therapy Solutions in Saskatoon provides speech-language pathology services for children with articulation disorders, language delays, social communication challenges, and autism spectrum disorder. Their SLPs use evidence-based, play-based approaches tailored to each child.'
WHERE website ILIKE '%chatterboxtherapysolutions%'
   OR email ILIKE '%chatterboxtherapysolutions%';

-- ── Cara Chow OT / CCOT (Moose Jaw / Assiniboia) ───────────
UPDATE providers SET
  organization = 'Cara Chow Occupational Therapy',
  notes = 'Cara Chow Occupational Therapy provides community-based OT services in Moose Jaw and surrounding rural Saskatchewan communities. Services include fine motor development, sensory processing, self-care skills, and school participation for children with developmental differences and ASD.'
WHERE email ILIKE '%ccot.ca%'
   OR website ILIKE '%ccot.ca%';

-- ── ABC Therapy (Regina) ────────────────────────────────────
UPDATE providers SET
  organization = 'ABC Therapy',
  notes = 'ABC Therapy in Regina provides psychological assessment and therapy for children and families. Services include individual therapy for anxiety, behaviour challenges, and autism spectrum disorder, with a strength-based, child-centred approach.'
WHERE website ILIKE '%abctherapy.ca%'
   OR email ILIKE '%abctherapy.ca%';

-- ── YXE Therapy (Saskatoon) ─────────────────────────────────
UPDATE providers SET
  organization = 'YXE Therapy',
  notes = 'YXE Therapy in Saskatoon provides psychological counselling for individuals and families. Services include therapy for anxiety, depression, life transitions, and support for families navigating neurodevelopmental diagnoses including autism spectrum disorder.'
WHERE website ILIKE '%yxetherapy.ca%'
   OR email ILIKE '%yxetherapy.ca%';

-- ── Vandana Psychology (Regina) ─────────────────────────────
UPDATE providers SET
  organization = 'Vandana Psychology',
  notes = 'Vandana Psychology in Regina provides individual psychological therapy and assessment services for children, adolescents, and adults. Services include support for anxiety, depression, trauma, and neurodevelopmental conditions including autism spectrum disorder.'
WHERE website ILIKE '%vandanapsychology.ca%'
   OR email ILIKE '%vandanapsychology.ca%';

-- ── Healthworks Wellness (Regina) ───────────────────────────
UPDATE providers SET
  organization = 'Healthworks Wellness',
  notes = 'Healthworks Wellness in Regina is a multidisciplinary health and wellness centre providing psychological counselling and therapy. Services include individual and family therapy for anxiety, depression, trauma, and neurodevelopmental challenges.'
WHERE website ILIKE '%healthworkswellness.ca%'
   OR email ILIKE '%healthworkswellness.ca%';

-- ── Dimensions Psychology (Saskatoon) ───────────────────────
UPDATE providers SET
  organization = 'Dimensions Psychology',
  notes = 'Dimensions Psychology in Saskatoon provides psychological assessment and therapy for individuals and families. Their services address anxiety, depression, relationship challenges, and neurodevelopmental conditions with an evidence-based, compassionate approach.'
WHERE website ILIKE '%dimensionspsychology.ca%'
   OR email ILIKE '%dimensionspsychology.ca%';

-- ── Cadence Psychology (Saskatoon) ──────────────────────────
UPDATE providers SET
  organization = 'Cadence Psychology',
  notes = 'Cadence Psychology in Saskatoon provides psychological therapy for children, adolescents, and adults. Their therapists specialize in anxiety, depression, trauma, grief, and support for families navigating neurodevelopmental diagnoses including autism spectrum disorder.'
WHERE website ILIKE '%cadencepsych.net%'
   OR email ILIKE '%cadencepsych.net%';

-- ── Humboldt Community Services (Humboldt) ──────────────────
UPDATE providers SET
  organization = 'Humboldt Community Services',
  notes = 'Humboldt Community Services provides social and psychological support services for children and families in Humboldt and central Saskatchewan. Services include counselling and therapeutic support for families of children with developmental differences and ASD.'
WHERE website ILIKE '%humboldtcommunityservices.com%'
   OR email ILIKE '%humboldtcommunityservices.com%';

-- ── La Ronge Counselling (La Ronge) ─────────────────────────
UPDATE providers SET
  organization = 'La Ronge Counselling',
  notes = 'La Ronge Counselling provides mental health and counselling services to individuals and families in La Ronge and northern Saskatchewan. Services include support for anxiety, depression, trauma, and family challenges, with culturally sensitive approaches for Indigenous communities.'
WHERE website ILIKE '%larongecounselling.com%'
   OR email ILIKE '%larongecounselling.com%'
   OR email ILIKE '%stg.health%';

-- ── FAN Academie (Saskatoon) ────────────────────────────────
UPDATE providers SET
  organization = 'FAN Academie',
  notes = 'FAN Academie in Saskatoon provides tutoring and educational support for children and youth. They offer academic coaching and learning enrichment for students with diverse learning needs including ASD, ADHD, and language learning challenges.'
WHERE website ILIKE '%fanacademie.ca%'
   OR email ILIKE '%fanacademie.ca%'
   OR email ILIKE '%fana.prepmyfuture%';

-- ── The Fun Path (Saskatoon) ────────────────────────────────
UPDATE providers SET
  organization = 'The Fun Path',
  notes = 'The Fun Path in Saskatoon provides speech-language pathology services for children using a playful, child-led approach. Their SLP specializes in language development, articulation, social communication, and supporting children with autism spectrum disorder.'
WHERE website ILIKE '%thefunpath.ca%'
   OR email ILIKE '%thefunpath.ca%';

-- ── Wild Blue Psychology (Craven) ───────────────────────────
UPDATE providers SET
  organization = 'Wild Blue Psychology',
  notes = 'Wild Blue Psychology provides psychological therapy for individuals and families in rural Saskatchewan. Services include therapy for anxiety, depression, trauma, life transitions, and support for families of children with autism spectrum disorder and developmental differences.'
WHERE website ILIKE '%wildbluepsychology.com%'
   OR email ILIKE '%wildbluepsychology.com%';

-- ── Uniquely Me Psychology (Saskatoon) ──────────────────────
UPDATE providers SET
  organization = 'Uniquely Me Psychology',
  notes = 'Uniquely Me Psychology in Saskatoon provides individual therapy and psychological support for children and adults with a focus on neurodivergent individuals. Their services celebrate unique learning and thinking styles while supporting anxiety, self-esteem, and social skills.'
WHERE website ILIKE '%uniquelymepsychology.com%'
   OR email ILIKE '%uniquelymepsychology.com%';

-- ── YXE Awaken (Saskatoon) ───────────────────────────────────
UPDATE providers SET
  organization = 'YXE Awaken',
  notes = 'YXE Awaken in Saskatoon provides psychological therapy and wellness services for individuals and families. Their counsellors offer evidence-based support for anxiety, depression, trauma, and personal growth for adults and adolescents.'
WHERE website ILIKE '%yxeawaken.ca%'
   OR email ILIKE '%yxeawaken.ca%';

-- ── Playful Hearts OT (Warman) ──────────────────────────────
UPDATE providers SET
  organization = 'Playful Hearts Occupational Therapy',
  notes = 'Playful Hearts Occupational Therapy in Warman provides pediatric OT services for children across Saskatchewan. Their therapist uses a child-led, play-based approach to support fine motor development, sensory processing, self-care skills, and school readiness for children with ASD.'
WHERE website ILIKE '%playfulheartsot.ca%'
   OR email ILIKE '%playfulheartsot.ca%';

-- ── Wonder Therapy SK (Yorkton / Melville) ──────────────────
UPDATE providers SET
  organization = 'Wonder Therapy SK',
  notes = 'Wonder Therapy SK provides occupational therapy and speech-language pathology services to children in Yorkton, Melville, and surrounding eastern Saskatchewan communities. Their therapists specialize in developmental delays, sensory processing, language development, and ASD.'
WHERE website ILIKE '%wondertherapysk.com%'
   OR email ILIKE '%wondertherapysk.com%';

-- ── Toucan Learning (Saskatoon) ─────────────────────────────
UPDATE providers SET
  organization = 'Toucan Learning',
  notes = 'Toucan Learning in Saskatoon provides educational support, academic tutoring, and learning services for children with diverse learning needs. They work with students with ASD, ADHD, learning disabilities, and developmental differences to build academic skills and confidence.'
WHERE website ILIKE '%toucanlearning.ca%'
   OR email ILIKE '%toucanlearning.ca%';

-- ── Prairie View Physiotherapy (Yorkton) ────────────────────
UPDATE providers SET
  organization = 'Prairie View Physiotherapy',
  notes = 'Prairie View Physiotherapy in Yorkton provides physiotherapy services for children and adults in eastern Saskatchewan. Pediatric services include gross motor development, balance, coordination, and rehabilitation support for children with developmental differences and ASD.'
WHERE website ILIKE '%prairieviewphysiotherapy.ca%'
   OR email ILIKE '%prairieviewphysiotherapy.ca%';

-- ── Warman Physio (Warman) ───────────────────────────────────
UPDATE providers SET
  organization = 'Warman Physiotherapy',
  notes = 'Warman Physiotherapy provides physiotherapy services to children and families in Warman and the Saskatoon bedroom communities. Services include pediatric physiotherapy for gross motor delays, injury rehabilitation, and support for children with developmental differences.'
WHERE website ILIKE '%warmanphysio.com%'
   OR email ILIKE '%warmanphysio.com%';

-- ── Summit Sports and Health (Saskatoon) ────────────────────
UPDATE providers SET
  organization = 'Summit Sports and Health',
  notes = 'Summit Sports and Health in Saskatoon provides counselling and psychological support services. Their therapists offer evidence-based therapy for anxiety, depression, performance challenges, and mental health support for children, adolescents, and adults.'
WHERE website ILIKE '%summitsportsandhealth.com%'
   OR email ILIKE '%summitsportsandhealth.com%';

-- ── Kellington Counselling (Saskatoon) ──────────────────────
UPDATE providers SET
  organization = 'Kellington Counselling',
  notes = 'Kellington Counselling in Saskatoon provides individual and family therapy for children, adolescents, and adults. Their counsellors specialize in anxiety, depression, trauma, relationship challenges, and supporting families navigating neurodevelopmental diagnoses.'
WHERE website ILIKE '%kellingtoncounselling.com%'
   OR email ILIKE '%kellingtoncounselling.com%';

-- ── Sweetgrass Assessments (Prince Albert) ──────────────────
UPDATE providers SET
  organization = 'Sweetgrass Assessments',
  notes = 'Sweetgrass Assessments in Prince Albert provides psychoeducational and developmental assessments for children and youth in northern Saskatchewan. Their assessments help identify learning disabilities, ADHD, ASD, and other developmental differences to guide educational planning.'
WHERE website ILIKE '%sweetgrassassessments.com%'
   OR email ILIKE '%sweetgrassassessments.com%';

-- ── Deeply Connected (Saskatoon) ────────────────────────────
UPDATE providers SET
  organization = 'Deeply Connected',
  notes = 'Deeply Connected in Saskatoon provides psychological counselling with a focus on connection, authenticity, and emotional well-being. Services include therapy for anxiety, depression, life transitions, and support for individuals and families with neurodevelopmental differences.'
WHERE website ILIKE '%deeplyconnected.ca%'
   OR email ILIKE '%deeplyconnected.ca%';

-- ── Ispuchaw Therapy (Regina) ────────────────────────────────
UPDATE providers SET
  organization = 'Ispuchaw Therapy',
  notes = 'Ispuchaw Therapy in Regina provides counselling and psychological support for individuals and families. Services include trauma-informed therapy, anxiety support, and mental health counselling with a culturally grounded approach for Indigenous and non-Indigenous clients.'
WHERE website ILIKE '%ispuchawtherapy.ca%'
   OR email ILIKE '%ispuchawtherapy.ca%';

-- ── Twin Flame Counselling (Regina) ─────────────────────────
UPDATE providers SET
  organization = 'Twin Flame Counselling',
  notes = 'Twin Flame Counselling in Regina provides individual and couples counselling for adults and adolescents. Services include therapy for anxiety, depression, relationship challenges, and support for families of individuals with autism spectrum disorder and developmental differences.'
WHERE website ILIKE '%twinflamecounselling.com%'
   OR email ILIKE '%twinflamecounselling.com%';

-- ── The Counselling Corner (Martensville) ───────────────────
UPDATE providers SET
  organization = 'The Counselling Corner',
  notes = 'The Counselling Corner in Martensville provides individual and family counselling for children, adolescents, and adults. Their therapists address anxiety, depression, grief, life transitions, and provide support for families navigating neurodevelopmental diagnoses.'
WHERE website ILIKE '%thecounsellingcorner.ca%'
   OR email ILIKE '%thecounsellingcorner.ca%';

-- ── Healthology Consulting (Lloydminster) ───────────────────
UPDATE providers SET
  organization = 'Healthology Consulting',
  notes = 'Healthology Consulting in Lloydminster provides occupational therapy and health consulting services for children and adults in the Lloydminster region. Services include pediatric OT for sensory processing, fine motor development, and daily living skill support.'
WHERE website ILIKE '%healthologyconsulting.ca%'
   OR email ILIKE '%healthologyconsulting.ca%';

-- ── Prairie Sky Speech (Moosomin) ───────────────────────────
UPDATE providers SET
  organization = 'Prairie Sky Speech',
  notes = 'Prairie Sky Speech in Moosomin provides speech-language pathology services for children and families in southeastern Saskatchewan. Their SLP offers assessment and therapy for articulation, language development, and communication challenges associated with ASD.'
WHERE website ILIKE '%prairieskyspeech.com%'
   OR email ILIKE '%prairieskyspeech.com%';

-- ── Babble and Bloom (Lloydminster) ─────────────────────────
UPDATE providers SET
  organization = 'Babble and Bloom',
  notes = 'Babble and Bloom in Lloydminster provides speech-language pathology services for children with language delays, articulation disorders, early communication development, and social communication challenges associated with autism spectrum disorder.'
WHERE website ILIKE '%babbleandbloom.ca%'
   OR email ILIKE '%babbleandbloom.ca%';

-- ── Strides Therapies (Saskatoon) ───────────────────────────
UPDATE providers SET
  organization = 'Strides Therapies',
  notes = 'Strides Therapies in Saskatoon provides psychological therapy and counselling for children, adolescents, and adults. Their therapists specialize in anxiety, depression, trauma, and supporting individuals and families impacted by neurodevelopmental conditions including ASD.'
WHERE website ILIKE '%stridestherapies.ca%'
   OR email ILIKE '%stridestherapies.ca%';

-- ── Aspire Wellness (Regina) ────────────────────────────────
UPDATE providers SET
  organization = 'Aspire Wellness',
  notes = 'Aspire Wellness in Regina provides psychological counselling and wellness services for individuals and families. Services include therapy for anxiety, depression, life transitions, and support for parents and families of children with developmental differences.'
WHERE website ILIKE '%aspire-wellness.ca%'
   OR email ILIKE '%aspire-wellness.ca%';

-- ── Aspire Too (Saskatoon) ───────────────────────────────────
UPDATE providers SET
  organization = 'Aspire Too Counselling',
  notes = 'Aspire Too Counselling in Saskatoon provides individual and family counselling services. Their therapists offer support for anxiety, depression, trauma, grief, and life transitions, with experience supporting families of children with autism spectrum disorder and developmental challenges.'
WHERE website ILIKE '%aspiretoo.ca%'
   OR email ILIKE '%aspiretoo.ca%';

-- ── Stable Solutions (Southey) ──────────────────────────────
UPDATE providers SET
  organization = 'Stable Solutions',
  notes = 'Stable Solutions provides psychological services and equine-assisted therapy in rural Saskatchewan. Their services combine traditional counselling with nature-based and equine-assisted approaches to support children and families with anxiety, trauma, and neurodevelopmental differences.'
WHERE website ILIKE '%stablesolutions.website%'
   OR email ILIKE '%stablesolutions.website%';

-- ── Evergreen Sask (Prince Albert) ──────────────────────────
UPDATE providers SET
  organization = 'Evergreen Saskatchewan',
  notes = 'Evergreen Saskatchewan in Prince Albert provides psychological and mental health services for children and families in northern Saskatchewan. Services include assessment, therapy, and community-based support for individuals with anxiety, trauma, and developmental differences.'
WHERE website ILIKE '%evergreensask.com%'
   OR email ILIKE '%evergreensask.com%';

-- ── Halcyon Psychology (Yorkton) ────────────────────────────
UPDATE providers SET
  organization = 'Halcyon Psychology',
  notes = 'Halcyon Psychology in Yorkton provides psychological assessment and therapy for individuals and families in eastern Saskatchewan. Services include psychoeducational assessments, therapy for anxiety and depression, and support for individuals with neurodevelopmental differences.'
WHERE website ILIKE '%halcyonpsychology.ca%'
   OR email ILIKE '%halcyonpsychology.ca%';

-- ── Shearer Wellness & Counselling Services (Yorkton) ───────
UPDATE providers SET
  organization = 'Shearer Wellness & Counselling Services',
  notes = 'Shearer Wellness & Counselling Services in Yorkton provides psychological therapy and counselling for individuals, children, and families in eastern Saskatchewan. Services include therapy for anxiety, depression, trauma, and support for families navigating developmental diagnoses.'
WHERE website ILIKE '%shearerwcs.com%'
   OR email ILIKE '%shearerwcs.com%';

-- ── Insightful Growth Pathways (Langenburg) ─────────────────
UPDATE providers SET
  organization = 'Insightful Growth Pathways',
  notes = 'Insightful Growth Pathways in Langenburg provides Applied Behaviour Analysis (ABA) therapy and behavioural support for children with autism spectrum disorder in rural eastern Saskatchewan. Services are designed to build communication, social, and adaptive skills.'
WHERE website ILIKE '%insightfulgrowthpathways.org%'
   OR email ILIKE '%insightfulgrowthpathways.org%';

-- ── Minogue Physiotherapy (Elrose) ──────────────────────────
UPDATE providers SET
  organization = 'Minogue Physiotherapy',
  notes = 'Minogue Physiotherapy in Elrose provides physiotherapy services for children and adults in rural west-central Saskatchewan. Pediatric services address gross motor delays, coordination challenges, and physical development support for children with developmental differences.'
WHERE website ILIKE '%minoguephysiotherapy.ca%'
   OR email ILIKE '%minoguephysiotherapy.ca%';

-- ── Custom Speech Therapy (Saskatoon) ───────────────────────
UPDATE providers SET
  organization = 'Custom Speech Therapy',
  notes = 'Custom Speech Therapy in Saskatoon provides individualized speech-language pathology services for children and adults. Their SLP delivers assessment and therapy for articulation, language, fluency, voice, and social communication challenges including those related to autism spectrum disorder.'
WHERE website ILIKE '%customspeechtherapy.ca%'
   OR email ILIKE '%customspeechtherapy.ca%';

-- ── Prairie Child Development (Saskatoon) ───────────────────
UPDATE providers SET
  organization = 'Prairie Child Development',
  notes = 'Prairie Child Development in Saskatoon provides psychological assessment and therapy for children with developmental differences, learning disabilities, ADHD, and autism spectrum disorder. Their psychologist offers comprehensive evaluations and individualized intervention planning.'
WHERE website ILIKE '%prairiechilddevelopment.com%'
   OR email ILIKE '%prairiechilddevelopment.com%';

-- ── Thrive Counselling (Saskatoon) ──────────────────────────
UPDATE providers SET
  organization = 'Thrive Counselling',
  notes = 'Thrive Counselling in Saskatoon provides online and in-person psychological therapy for individuals and families. Services include support for anxiety, depression, life transitions, and counselling for families navigating autism spectrum disorder and neurodevelopmental diagnoses.'
WHERE website ILIKE '%thrive-counselling.online%'
   OR email ILIKE '%thrive-counselling%';

-- ── Clear Health Solutions (Saskatoon) ──────────────────────
UPDATE providers SET
  organization = 'Clear Health Solutions',
  notes = 'Clear Health Solutions in Saskatoon provides psychological therapy and wellness services for individuals and families. Their therapists support anxiety, depression, trauma, and neurodevelopmental challenges with an integrative, evidence-based approach.'
WHERE website ILIKE '%clearhealthsolutions.ca%'
   OR email ILIKE '%clearhealthsolutions.ca%';

-- ── Whimsy Counselling (Saskatoon) ──────────────────────────
UPDATE providers SET
  organization = 'Whimsy Counselling',
  notes = 'Whimsy Counselling in Saskatoon provides psychological counselling for children, adolescents, and adults using creative, play-based, and narrative therapy approaches. Services support anxiety, self-esteem, trauma, and families of children with autism spectrum disorder.'
WHERE website ILIKE '%whimsycounselling.com%'
   OR email ILIKE '%whimsycounselling.com%';

-- ── Cultivate Wellness YQR (Regina) ─────────────────────────
UPDATE providers SET
  organization = 'Cultivate Wellness YQR',
  notes = 'Cultivate Wellness YQR in Regina provides psychological therapy and wellness services for individuals and families. Their therapists offer support for anxiety, depression, life transitions, grief, and provide counselling for families navigating developmental diagnoses.'
WHERE website ILIKE '%cultivatewellnessyqr.ca%'
   OR email ILIKE '%cultivatewellnessyqr.ca%';

-- ── Family Counselling SK (Saskatoon) ───────────────────────
UPDATE providers SET
  organization = 'Family Counselling',
  notes = 'Family Counselling provides psychological therapy and counselling for individuals and families in Saskatoon. Services address anxiety, depression, relationship challenges, parenting support, and counselling for families of children with autism spectrum disorder.'
WHERE website ILIKE '%family-counselling.ca%'
   OR email ILIKE '%family-counselling.ca%';

-- ── Elry Academics (Prince Albert) ──────────────────────────
UPDATE providers SET
  organization = 'Elry Academics',
  notes = 'Elry Academics in Prince Albert provides academic tutoring and educational support for children and youth in northern Saskatchewan. They work with students with learning disabilities, ASD, and ADHD to build reading, writing, and math skills in a supportive environment.'
WHERE website ILIKE '%elryacademics.com%'
   OR email ILIKE '%elryacademics.com%';

-- ── Equilibrium TR (Saskatoon) ──────────────────────────────
UPDATE providers SET
  organization = 'Equilibrium TR',
  notes = 'Equilibrium TR in Saskatoon provides therapeutic recreation and wellness services for individuals with disabilities, including autism spectrum disorder. Their programs use recreation and leisure activities to build social skills, community participation, and quality of life.'
WHERE website ILIKE '%equilibriumtr.com%'
   OR email ILIKE '%equilibriumtr.com%';

-- ── Webb Sprout (Saskatoon) ──────────────────────────────────
UPDATE providers SET
  organization = 'Webb Sprout',
  notes = 'Webb Sprout in Saskatoon provides educational support and tutoring services for children with diverse learning needs. Their programs support children with ASD, learning disabilities, and developmental differences in building academic skills and learning confidence.'
WHERE website ILIKE '%webbsprout.com%'
   OR email ILIKE '%webbsprout.com%';

-- ── Next Bite Nutrition ──────────────────────────────────────
UPDATE providers SET
  organization = 'Next Bite Nutrition',
  notes = 'Next Bite Nutrition provides registered dietitian services specializing in pediatric nutrition, selective eating, and feeding challenges. They support children with ASD who have sensory food aversions, restricted diets, gastrointestinal concerns, and nutritional deficiencies.'
WHERE website ILIKE '%nextbitenutrition%'
   OR email ILIKE '%nextbitenutrition%';

-- ── In the Howse (Regina) ────────────────────────────────────
UPDATE providers SET
  organization = 'In the Howse',
  notes = 'In the Howse in Regina provides family support, parenting education, and therapeutic programming for families with children who have special needs and developmental differences. Services focus on building family resilience and supporting children with ASD and developmental challenges.'
WHERE website ILIKE '%inthehowse.com%'
   OR email ILIKE '%inthehowse.com%';

-- ── It''s a Speech Thing (Prince Albert / Saskatoon) ─────────
UPDATE providers SET
  organization = 'It''s a Speech Thing',
  notes = 'It''s a Speech Thing provides speech-language pathology services for children and adults in northern and central Saskatchewan. Their SLPs offer assessment and therapy for articulation, language development, fluency, and communication challenges related to autism spectrum disorder.'
WHERE website ILIKE '%itsaspeechthing.com%'
   OR email ILIKE '%itsaspeechthing.com%'
   OR email ILIKE '%itsaspeeching.com%';

-- ── Pure Harmony Equine (Duck Lake) ─────────────────────────
UPDATE providers SET
  organization = 'Pure Harmony Equine',
  notes = 'Pure Harmony Equine near Duck Lake, SK provides equine-assisted therapy and activities for children and individuals with autism spectrum disorder and developmental differences. Their horse-assisted programs build confidence, sensory regulation, communication, and emotional well-being.'
WHERE website ILIKE '%pureharmonyequine.com%'
   OR email ILIKE '%pureharmonyequine.com%';

-- ── Thoosa Therapy (Southwest SK) ───────────────────────────
UPDATE providers SET
  organization = 'Thoosa Therapy',
  notes = 'Thoosa Therapy provides occupational therapy services to children and families in southwest Saskatchewan. Their OT offers assessment and individualized therapy for sensory processing, fine motor development, self-care skills, and school participation for children with ASD.'
WHERE website ILIKE '%thoosatherapy.com%'
   OR email ILIKE '%thoosatherapy.com%';

-- ── Ranch Ehrlo Society (Regina) ────────────────────────────
UPDATE providers SET
  organization = 'Ranch Ehrlo Society',
  notes = 'Ranch Ehrlo Society in Regina provides therapeutic residential care, counselling, and community-based mental health services for children and youth with complex needs. Services include psychological therapy, behaviour support, and trauma-informed care for youth with ASD.'
WHERE website ILIKE '%ranchehrlo.ca%'
   OR email ILIKE '%ranchehrlo.ca%'
   OR website ILIKE '%ehrlo.com%';

-- ── Arcadian Counselling (Regina) ───────────────────────────
UPDATE providers SET
  organization = 'Arcadian Counselling',
  notes = 'Arcadian Counselling in Regina provides psychological therapy and counselling for individuals and families. Services include support for anxiety, depression, trauma, cultural adjustment, and counselling for families of children with autism spectrum disorder and developmental differences.'
WHERE website ILIKE '%arcadiancounselling.ca%'
   OR email ILIKE '%arcadiancounselling.ca%';

-- ── Innergy Comprehensive (Saskatoon) ───────────────────────
UPDATE providers SET
  organization = 'Innergy Comprehensive',
  notes = 'Innergy Comprehensive in Saskatoon provides psychological assessment and therapy services for children, adolescents, and adults. Services include psychoeducational assessments, ASD evaluations, psychotherapy, and support for families navigating complex neurodevelopmental diagnoses.'
WHERE website ILIKE '%innergycomprehensive.ca%'
   OR email ILIKE '%innergycomprehensive.ca%';

-- ── Moose Jaw Military Family Resource Centre ────────────────
UPDATE providers SET
  organization = 'Moose Jaw Military Family Resource Centre',
  notes = 'The Moose Jaw Military Family Resource Centre provides mental health and counselling services for military families at CFB Moose Jaw. Services include family counselling, psychological support, and specialized programs for families of children with developmental differences and ASD.'
WHERE website ILIKE '%cfmws.ca%'
   OR email ILIKE '%moosejawmfrc.ca%';

-- ── Alara Learning (Estevan) ────────────────────────────────
UPDATE providers SET
  organization = 'Alara Learning',
  notes = 'Alara Learning provides speech-language pathology and educational support services in Estevan and southeast Saskatchewan. Their SLP offers assessment and therapy for language development, communication disorders, and social communication challenges related to autism spectrum disorder.'
WHERE website ILIKE '%alaralearning.com%'
   OR email ILIKE '%alaralearning.com%';

-- ── Habermehl Reading ────────────────────────────────────────
UPDATE providers SET
  organization = 'Habermehl Reading',
  notes = 'Habermehl Reading provides specialized reading instruction and literacy support using evidence-based approaches including Orton-Gillingham. Services are available across Saskatchewan for children with dyslexia, reading disabilities, and language processing challenges associated with ASD.'
WHERE website ILIKE '%habermehlreading.com%'
   OR email ILIKE '%habermehlreading.com%';

-- ── Paige Bautz (province-wide) ─────────────────────────────
UPDATE providers SET
  organization = 'Paige Bautz',
  notes = 'Paige Bautz provides independent therapeutic and support services across Saskatchewan for individuals with autism spectrum disorder and developmental differences. Services are tailored to the individual needs of each client and family.'
WHERE website ILIKE '%paigebautz.com%'
   OR email ILIKE '%paigebautz.com%';

-- ── Treehouse Speech Therapy (Arcola) ───────────────────────
UPDATE providers SET
  organization = 'Treehouse Speech Therapy',
  notes = 'Treehouse Speech Therapy in Arcola provides speech-language pathology services for children in southeastern Saskatchewan. Their SLP specializes in language development, articulation, fluency, and communication support for children with autism spectrum disorder and developmental delays.'
WHERE website ILIKE '%treehousespeechtherapy%'
   OR email ILIKE '%treehousespeechtherapy%'
   OR email ILIKE '%speechtherapyforkids%';

-- ── Lifemark Alta-Sask Wellness (Lloydminster) ──────────────
UPDATE providers SET
  organization = 'Lifemark Alta-Sask Wellness',
  notes = 'Lifemark Alta-Sask Wellness in Lloydminster provides physiotherapy and rehabilitation services for children and adults. Pediatric physiotherapy services support gross motor development, injury recovery, and physical rehabilitation for children with developmental differences.'
WHERE website ILIKE '%lifemark.ca%'
   OR email ILIKE '%lifemark.ca%';

-- ── Smooth Sailing Speech (Weyburn) ─────────────────────────
UPDATE providers SET
  organization = 'Smooth Sailing Speech',
  notes = 'Smooth Sailing Speech in Weyburn provides speech-language pathology services for children in southeastern Saskatchewan. Services include assessment and therapy for articulation, language delays, and communication challenges in children with autism spectrum disorder.'
WHERE website ILIKE '%smoothsailingspeech%'
   OR email ILIKE '%smoothsailingspeech%';

-- ── OT Kindred Care (Saskatoon) ──────────────────────────────
UPDATE providers SET
  organization = 'OT Kindred Care',
  notes = 'OT Kindred Care in Saskatoon provides occupational therapy services for children and families. Their OT uses a relationship-based, family-centred approach to support sensory processing, fine motor development, self-care, and participation in daily life for children with ASD.'
WHERE website ILIKE '%otkindredcare.com%'
   OR email ILIKE '%otkindredcare.com%';

-- ── Exceptionally Educated (Lloydminster) ───────────────────
UPDATE providers SET
  organization = 'Exceptionally Educated',
  notes = 'Exceptionally Educated in Lloydminster provides Applied Behaviour Analysis (ABA) therapy and educational support for children with autism spectrum disorder. Their certified behaviour analyst designs individualized programs to build communication, social, and adaptive skills.'
WHERE website ILIKE '%exceptionallyeducated.ca%'
   OR email ILIKE '%exceptionallyeducated.ca%';

-- ── Miss Kayla''s Star Students (Saskatoon) ──────────────────
UPDATE providers SET
  organization = 'Miss Kayla''s Star Students',
  notes = 'Miss Kayla''s Star Students in Saskatoon provides individualized tutoring and educational support for children with diverse learning needs. Services are designed to build academic skills, confidence, and love of learning for students with ASD, ADHD, and learning disabilities.'
WHERE website ILIKE '%misskaylasstarstudents%'
   OR email ILIKE '%misskaylasstarstudents%';
