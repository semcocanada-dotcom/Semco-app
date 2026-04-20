-- ============================================================
-- Provider Notes & Organization Update — Part 2
-- Remaining organizations + specialized practices
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── TutorBright Learning Centres ───────────────────────────
UPDATE providers SET
  organization = 'TutorBright Learning Centres',
  notes = 'TutorBright Learning Centres provide customized academic tutoring and learning support for children and adolescents across Saskatchewan. They offer one-on-one tutoring in reading, writing, math, and study skills for students with learning disabilities, ASD, and ADHD.'
WHERE email ILIKE '%tutorbright%'
   OR website ILIKE '%tutorbright%';

-- ── Joshua Tree Learning Centre (Regina) ───────────────────
UPDATE providers SET
  organization = 'Joshua Tree Learning Centre',
  notes = 'Joshua Tree Learning Centre in Regina offers educational therapy, learning assessments, academic tutoring, and counselling services for children and adolescents with learning differences, ASD, ADHD, and developmental challenges.'
WHERE email ILIKE '%joshuatreelearning%'
   OR website ILIKE '%joshuatreelearning%';

-- ── Elements Psychology (Regina / Saskatoon) ────────────────
UPDATE providers SET
  organization = 'Elements Psychology',
  notes = 'Elements Psychology has locations in both Regina and Saskatoon providing psychological assessments, individual therapy, and evidence-based treatment for anxiety, ASD, ADHD, trauma, and depression in children and adults.'
WHERE email ILIKE '%elementspsychology%'
   OR website ILIKE '%elementspsychology%';

-- ── CASA Psychology (Saskatoon) ─────────────────────────────
UPDATE providers SET
  organization = 'CASA Psychology',
  notes = 'CASA Psychology in Saskatoon provides comprehensive psychological assessments and therapy for children, adolescents, and adults. Psychologists specialize in autism spectrum disorder evaluations, psychoeducational assessments, ADHD diagnosis, and cognitive testing.'
WHERE email ILIKE '%casa-psych%'
   OR email ILIKE '%casapsych%'
   OR website ILIKE '%casapsych%';

-- ── Roadways Literacy (Saskatoon) ───────────────────────────
UPDATE providers SET
  organization = 'Roadways Literacy',
  notes = 'Roadways Literacy in Saskatoon provides specialized literacy instruction and reading remediation for children and adults using evidence-based approaches including Orton-Gillingham. They work with individuals with dyslexia, reading disabilities, and learning challenges related to ASD.'
WHERE email ILIKE '%roadwaysliteracy%'
   OR website ILIKE '%roadwaysliteracy%';

-- ── The Village YXE (Saskatoon) ─────────────────────────────
UPDATE providers SET
  organization = 'The Village YXE',
  notes = 'The Village YXE is a collaborative therapy and wellness practice in Saskatoon offering occupational therapy, speech-language pathology, psychology, and counselling. They take a community-centred, family-focused approach to supporting children with ASD and developmental needs.'
WHERE email ILIKE '%thevillageyxe%'
   OR website ILIKE '%thevillageyxe%';

-- ── Branching Out Community Therapy (Prince Albert) ─────────
UPDATE providers SET
  organization = 'Branching Out Community Therapy',
  notes = 'Branching Out Community Therapy (BOCT) in Prince Albert provides occupational therapy, speech-language pathology, and counselling services to children and families in northern Saskatchewan. They specialize in developmental challenges, sensory processing, and community-based therapy.'
WHERE email ILIKE '%branchingout%'
   OR email ILIKE '%boct.ca%'
   OR website ILIKE '%boct.ca%';

-- ── Family Foundations Therapy (Saskatoon) ──────────────────
UPDATE providers SET
  organization = 'Family Foundations Therapy',
  notes = 'Family Foundations Therapy in Saskatoon provides occupational therapy with a trauma-informed, family-centred approach. Their OTs work with children on sensory regulation, self-care, fine motor skills, and daily living activities, building family capacity to support children at home.'
WHERE email ILIKE '%familyfoundationstherapy%'
   OR website ILIKE '%familyfoundationstherapy%';

-- ── Food to Fit Nutrition ────────────────────────────────────
UPDATE providers SET
  organization = 'Food to Fit Nutrition',
  notes = 'Food to Fit Nutrition provides registered dietitian services with expertise in pediatric nutrition, feeding difficulties, and specialized diets. They support children with ASD who have sensory food aversions, selective eating, gastrointestinal issues, and nutritional challenges.'
WHERE email ILIKE '%foodtofit%'
   OR website ILIKE '%foodtofit%';

-- ── YQR Tutors (Regina) ─────────────────────────────────────
UPDATE providers SET
  organization = 'YQR Tutors',
  notes = 'YQR Tutors provides one-on-one academic tutoring and educational support for children and students in Regina. They work with learners who have ASD, learning disabilities, ADHD, and other challenges affecting academic performance in reading, writing, and math.'
WHERE email ILIKE '%yqrtutors%'
   OR website ILIKE '%yqrtutors%';

-- ── M&M Occupational Therapy ────────────────────────────────
UPDATE providers SET
  organization = 'M&M Occupational Therapy',
  notes = 'M&M Occupational Therapy provides pediatric OT services across Saskatchewan. Their therapists work with children on fine motor development, handwriting, sensory processing, self-care skills, and participation in daily activities at home and school.'
WHERE email ILIKE '%mandmoccupationaltherapy%'
   OR website ILIKE '%mandmoccupationaltherapy%';

-- ── Elevate Counselling (Saskatoon) ─────────────────────────
UPDATE providers SET
  organization = 'Elevate Counselling',
  notes = 'Elevate Counselling in Saskatoon provides mental health therapy for children, adolescents, and adults. Their therapists specialize in anxiety, depression, trauma, grief, life transitions, and supporting families navigating autism and neurodevelopmental challenges.'
WHERE email ILIKE '%elevatecounselling%'
   OR website ILIKE '%elevatecounselling%';

-- ── Apex Counselling & Consultation Services (Saskatoon) ────
UPDATE providers SET
  organization = 'Apex Counselling & Consultation Services',
  notes = 'Apex Counselling & Consultation Services in Saskatoon provides psychological counselling and consultation for individuals, families, and organizations. Services include therapy for anxiety, depression, trauma, relationship challenges, and support for families navigating developmental diagnoses.'
WHERE email ILIKE '%apexcounselling%'
   OR website ILIKE '%apexcounselling%';

-- ── Dragonfly Child and Family Wellness Centre (Regina) ─────
UPDATE providers SET
  organization = 'Dragonfly Child and Family Wellness Centre',
  notes = 'Dragonfly Child and Family Wellness Centre in Regina provides psychology and counselling for children, youth, and families. They specialize in trauma-informed therapy, anxiety, behavioural challenges, parenting support, and neurodevelopmental conditions including ASD.'
WHERE email ILIKE '%dragonflycfwc%'
   OR website ILIKE '%dragonflycfwc%';

-- ── Evolve Counselling YXE (Saskatoon) ──────────────────────
UPDATE providers SET
  organization = 'Evolve Counselling YXE',
  notes = 'Evolve Counselling YXE in Saskatoon offers individual, couples, and family therapy. Their counsellors work with anxiety, depression, trauma, life transitions, and provide specialized support for families of children with autism and developmental differences.'
WHERE email ILIKE '%evolvecounsellingyxe%'
   OR website ILIKE '%evolvecounsellingyxe%';

-- ── QB Psychology (Saskatoon) ────────────────────────────────
UPDATE providers SET
  organization = 'QB Psychology',
  notes = 'QB Psychology in Saskatoon offers psychological assessments and therapy for children, adolescents, and adults. Their psychologists provide psychoeducational assessments, ASD evaluations, ADHD testing, cognitive assessments, and evidence-based therapy.'
WHERE email ILIKE '%qbpsychology%'
   OR website ILIKE '%qbpsychology%';

-- ── Carter's Counselling Services (Martensville) ────────────
UPDATE providers SET
  organization = 'Carter''s Counselling Services',
  notes = 'Carter''s Counselling Services in Martensville provides individual and family counselling for adults and youth. Their therapists address anxiety, depression, trauma, relationship challenges, and provide support for families navigating neurodevelopmental diagnoses.'
WHERE email ILIKE '%carterscounselling%'
   OR website ILIKE '%carterscounsellingservices%';

-- ── Oxford Learning (Saskatoon / Regina) ────────────────────
UPDATE providers SET
  organization = 'Oxford Learning',
  notes = 'Oxford Learning provides cognitive enrichment tutoring for students of all ages using proprietary curriculum designed to develop reading, writing, math, and study skills. Their programs address root causes of learning challenges and are suitable for students with ASD and learning disabilities.'
WHERE email ILIKE '%oxfordlearning%'
   OR website ILIKE '%oxfordlearning%';

-- ── Sylvan Learning (Saskatoon / Regina) ────────────────────
UPDATE providers SET
  organization = 'Sylvan Learning',
  notes = 'Sylvan Learning provides supplemental education programs in reading, writing, math, and STEM. Their tutoring programs are designed to build academic confidence and skills for children with learning differences and ASD in an encouraging, individualized environment.'
WHERE email ILIKE '%sylvan%'
   OR website ILIKE '%sylvanlearning%';

-- ── Moose Jaw Psychology ────────────────────────────────────
UPDATE providers SET
  organization = 'Moose Jaw Psychology',
  notes = 'Moose Jaw Psychology provides psychological assessment and therapy services in Moose Jaw and area. Services include psychoeducational assessments, cognitive testing, individual therapy, and support for children and families affected by ASD, ADHD, and learning disabilities.'
WHERE email ILIKE '%moosejawpsychology%'
   OR website ILIKE '%moosejawpsychology%';

-- ── Nalu Psychology (Regina) ────────────────────────────────
UPDATE providers SET
  organization = 'Nalu Psychology',
  notes = 'Nalu Psychology in Regina provides therapy and psychological support for children, teens, and adults. Approaches include CBT, mindfulness-based therapy, and somatic techniques for anxiety, depression, trauma, and neurodevelopmental challenges including ASD.'
WHERE email ILIKE '%nalupsychology%'
   OR website ILIKE '%nalupsychology%';

-- ── Connect Speech Therapy (Regina) ─────────────────────────
UPDATE providers SET
  organization = 'Connect Speech Therapy',
  notes = 'Connect Speech Therapy in Regina provides speech-language pathology services for children and adults with communication disorders, language delays, stuttering, and social communication challenges related to autism spectrum disorder.'
WHERE email ILIKE '%connectspeechtherapy%'
   OR website ILIKE '%connectspeechtherapy%';

-- ── Humboldt Speech Language ─────────────────────────────────
UPDATE providers SET
  organization = 'Humboldt Speech & Language',
  notes = 'Humboldt Speech & Language provides speech-language pathology services to children and families in Humboldt and central Saskatchewan. Services include assessment and therapy for language delays, articulation disorders, and communication challenges associated with ASD.'
WHERE email ILIKE '%humboldtspeech%'
   OR website ILIKE '%humboldtspeechlanguage%';

-- ── Autism Saskatchewan (Regina) ────────────────────────────
UPDATE providers SET
  organization = 'Autism Saskatchewan',
  notes = 'Autism Saskatchewan is the provincial autism advocacy and service organization based in Regina. They provide social skills groups, respite support, family resources, and programming for individuals with autism spectrum disorder and their families across Saskatchewan.'
WHERE email ILIKE '%autismsask%'
   OR website ILIKE '%autismsask%';

-- ── Neil Squire Society — SK ────────────────────────────────
UPDATE providers SET
  organization = 'Neil Squire Society',
  notes = 'Neil Squire Society in Saskatoon provides assistive technology services, computer access solutions, and employment programs for people with disabilities. They help individuals with ASD and physical limitations access technology tools that support communication and independence.'
WHERE email ILIKE '%neilsquire%'
   OR website ILIKE '%neilsquire%';

-- ── Simple Joys OT ──────────────────────────────────────────
UPDATE providers SET
  organization = 'Simple Joys Occupational Therapy',
  notes = 'Simple Joys Occupational Therapy provides pediatric OT services in rural Saskatchewan communities. Their therapists work with children on sensory processing, fine motor skills, self-care, and daily living activities using child-led, strengths-based approaches.'
WHERE email ILIKE '%simplejoysot%'
   OR email ILIKE '%simpleoysOT%'
   OR website ILIKE '%simplejoysot%';

-- ── Regulate and Thrive ─────────────────────────────────────
UPDATE providers SET
  organization = 'Regulate and Thrive',
  notes = 'Regulate and Thrive provides therapeutic support focused on emotional and sensory regulation for children with ASD, ADHD, and developmental differences. Services help children and families develop strategies to manage sensory challenges and build self-regulation skills.'
WHERE email ILIKE '%regulateandthrive%'
   OR website ILIKE '%regulateandthrive%';

-- ── Living Sky Speech (Saskatoon) ───────────────────────────
UPDATE providers SET
  organization = 'Living Sky Speech',
  notes = 'Living Sky Speech in Saskatoon provides speech-language pathology services for children with communication disorders, language delays, articulation difficulties, and social communication challenges. Services are tailored to each child''s individual goals and family priorities.'
WHERE email ILIKE '%livingskyspeech%'
   OR website ILIKE '%livingskyspeech%';

-- ── Heartland Psychology (Nipawin) ──────────────────────────
UPDATE providers SET
  organization = 'Heartland Psychology',
  notes = 'Heartland Psychology serves northern Saskatchewan communities providing psychological services including assessments and therapy for anxiety, depression, grief, and trauma. They offer specialized services to children and families in underserved rural and northern areas of Saskatchewan.'
WHERE email ILIKE '%heartlandpsychology%'
   OR website ILIKE '%heartlandpsychology%';

-- ── Miskihnak (North Battleford) ────────────────────────────
UPDATE providers SET
  organization = 'Miskihnak Therapy',
  notes = 'Miskihnak Therapy in North Battleford provides occupational therapy services to Indigenous and rural communities in northwestern Saskatchewan. They specialize in culturally informed, family-centred care for children with developmental differences and ASD.'
WHERE email ILIKE '%miskihnak%'
   OR website ILIKE '%miskihnak%';

-- ── Horizon Psychology (Saskatoon) ──────────────────────────
UPDATE providers SET
  organization = 'Horizon Psychology',
  notes = 'Horizon Psychology in Saskatoon provides individual psychological therapy for children, adolescents, and adults. Services include evidence-based treatment for anxiety, depression, trauma, life transitions, and support for individuals and families navigating ASD diagnoses.'
WHERE email ILIKE '%horizonpsychology%'
   OR website ILIKE '%horizonpsychology%';

-- ── Boreal Voices Therapy (Prince Albert) ───────────────────
UPDATE providers SET
  organization = 'Boreal Voices Therapy',
  notes = 'Boreal Voices Therapy in Prince Albert provides speech-language pathology services for children and adults in northern Saskatchewan. Their SLPs specialize in language development, articulation, voice, fluency, and communication challenges associated with ASD.'
WHERE email ILIKE '%borealvoicestherapy%'
   OR website ILIKE '%borealvoicestherapy%';

-- ── Cove Therapies (Saskatoon) ──────────────────────────────
UPDATE providers SET
  organization = 'Cove Therapies',
  notes = 'Cove Therapies in Saskatoon provides speech-language pathology with a warm, family-centred approach. Their SLPs work with children on language delays, articulation, social communication, and AAC for individuals with complex communication needs and ASD.'
WHERE email ILIKE '%covetherapies%'
   OR website ILIKE '%covetherapies%';

-- ── Anderson Dupuis Psychology (Saskatoon) ──────────────────
UPDATE providers SET
  organization = 'Anderson Dupuis Psychology',
  notes = 'Anderson Dupuis Psychology in Saskatoon provides psychological assessments, psychoeducational testing, and therapy services for children and adults. They specialize in complex assessments including ASD evaluations, ADHD testing, and learning disability diagnoses.'
WHERE email ILIKE '%andersondupuis%'
   OR website ILIKE '%andersondupuis%';

-- ── Stapleford Health (Regina) ──────────────────────────────
UPDATE providers SET
  organization = 'Stapleford Health',
  notes = 'Stapleford Health in Regina is a multidisciplinary health centre offering occupational therapy, physiotherapy, and other health services for children and adults. Their OTs support children with developmental delays, sensory processing differences, and daily living skill development.'
WHERE email ILIKE '%staplefordhealth%'
   OR website ILIKE '%staplefordhealth%';

-- ── Connect Therapy (Regina) ────────────────────────────────
UPDATE providers SET
  organization = 'Connect Therapy',
  notes = 'Connect Therapy in Regina provides occupational therapy services for children and youth. Their OTs use evidence-based, relationship-focused approaches to support sensory processing, motor development, self-regulation, and participation in school and daily life.'
WHERE email ILIKE '%connecttherapy%'
   OR website ILIKE '%connecttherapy%';
