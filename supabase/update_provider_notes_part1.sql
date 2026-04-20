-- ============================================================
-- Provider Notes & Organization Update — Part 1
-- Organizations identified by shared email domain / website
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Speech and Language Builders Inc. (Regina) ─────────────
UPDATE providers SET
  organization = 'Speech and Language Builders Inc.',
  notes = 'Speech and Language Builders is a team of registered speech-language pathologists providing assessment and therapy for children with ASD, language delays, articulation disorders, AAC (augmentative and alternative communication), and social communication. Serving Regina and surrounding areas.'
WHERE email ILIKE '%speechlanguagebuilders%'
   OR email ILIKE '%speechandlanguagebuilders%'
   OR website ILIKE '%speechlanguagebuilders%';

-- ── Spectrum YXE (Saskatoon) ────────────────────────────────
UPDATE providers SET
  organization = 'Spectrum YXE',
  notes = 'Spectrum YXE is a multidisciplinary team of speech-language pathologists in Saskatoon specializing in autism spectrum disorder, language delays, social communication, and AAC. They offer individualized therapy programs from early intervention through school age.'
WHERE email ILIKE '%spectrumyxe%'
   OR website ILIKE '%spectrumyxe%';

-- ── Theraplay Pediatric Therapies (Saskatoon) ──────────────
UPDATE providers SET
  organization = 'Theraplay Pediatric Therapies',
  notes = 'Theraplay Pediatric Therapies is a full-service pediatric occupational therapy clinic in Saskatoon. OTs work with children experiencing sensory processing differences, fine motor delays, handwriting challenges, self-care skills, and behavioural regulation using child-led, play-based approaches.'
WHERE email ILIKE '%theraplaypeds%'
   OR website ILIKE '%theraplaypeds%';

-- ── Pathways Learning Centre (Regina) ──────────────────────
UPDATE providers SET
  organization = 'Pathways Learning Centre',
  notes = 'Pathways Learning Centre in Regina offers a multidisciplinary team including speech-language pathologists, occupational therapists, and counsellors. They specialize in learning disabilities, autism, developmental delays, and provide assessments plus individualized therapy programs.'
WHERE email ILIKE '%pathwayslearning%'
   OR website ILIKE '%pathwayslearning%';

-- ── Chit Chat Speech Therapy SK ────────────────────────────
UPDATE providers SET
  organization = 'Chit Chat Speech Therapy SK',
  notes = 'Chit Chat Speech Therapy SK provides speech-language pathology services for children across Saskatchewan. Their SLPs specialize in articulation and phonology, language development, fluency (stuttering), and communication challenges related to autism spectrum disorder.'
WHERE email ILIKE '%chitchatspeechtherapysk%'
   OR website ILIKE '%chitchatspeechtherapysk%';

-- ── Speech Therapy Saskatoon ────────────────────────────────
UPDATE providers SET
  organization = 'Speech Therapy Saskatoon',
  notes = 'Speech Therapy Saskatoon is a team of registered speech-language pathologists offering assessment and therapy for children with communication disorders, language delays, and ASD. Services available in clinic, at home, and via teletherapy throughout Saskatoon.'
WHERE email ILIKE '%speechtherapysaskatoon%'
   OR website ILIKE '%speechtherapysaskatoon%';

-- ── Regina Speech Centre ────────────────────────────────────
UPDATE providers SET
  organization = 'Regina Speech Centre',
  notes = 'Regina Speech Centre provides speech-language pathology services for children and adults in Regina and surrounding areas. They specialize in speech sound disorders, language delays, literacy, fluency, and social communication for individuals with autism spectrum disorder.'
WHERE email ILIKE '%reginaspeechcentre%'
   OR website ILIKE '%reginaspeechcentre%';

-- ── The Speech Language Network (Saskatoon) ─────────────────
UPDATE providers SET
  organization = 'The Speech Language Network',
  notes = 'The Speech Language Network (SLN) in Saskatoon is a multidisciplinary practice offering speech-language pathology and occupational therapy. They serve children with ASD, developmental delays, sensory processing challenges, and learning difficulties with a collaborative team approach.'
WHERE email ILIKE '%thesln%'
   OR website ILIKE '%thesln%';

-- ── Prairie Basic Speech & Language (Moose Jaw) ────────────
UPDATE providers SET
  organization = 'Prairie Basic Speech & Language',
  notes = 'Prairie Basic Speech & Language provides speech-language pathology services in Moose Jaw and across rural Saskatchewan. Their SLPs work with children on articulation, phonological disorders, language development, and literacy skills.'
WHERE email ILIKE '%prairiebasic%'
   OR website ILIKE '%prairiebasic%';

-- ── Associated Speech Consultants (Saskatoon) ──────────────
UPDATE providers SET
  organization = 'Associated Speech Consultants',
  notes = 'Associated Speech Consultants is a Saskatoon-based speech-language pathology practice offering comprehensive assessment and therapy for children with speech sound disorders, language delays, stuttering, and autism spectrum disorder. Services available in clinic and via teletherapy.'
WHERE email ILIKE '%associatedspeechconsultants%'
   OR website ILIKE '%associatedspeechconsultants%';

-- ── SK Pediatric Therapies (Saskatoon) ─────────────────────
UPDATE providers SET
  organization = 'SK Pediatric Therapies',
  notes = 'SK Pediatric Therapies in Saskatoon provides speech-language pathology and occupational therapy for infants, toddlers, and school-age children. They specialize in early intervention, language development, feeding therapy, sensory processing, and fine motor skill development.'
WHERE email ILIKE '%skpediatrictherapies%'
   OR website ILIKE '%skpediatrictherapies%';

-- ── Bright Horizons Occupational Therapy (Regina) ──────────
UPDATE providers SET
  organization = 'Bright Horizons Occupational Therapy',
  notes = 'Bright Horizons Occupational Therapy in Regina specializes in pediatric OT services including sensory processing, fine and gross motor development, self-care skills, school readiness, and handwriting. Their therapists use evidence-based, child-centred approaches tailored to each child.'
WHERE email ILIKE '%brighthorizonsot%'
   OR website ILIKE '%brighthorizonsot%';

-- ── Milestones Occupational Therapy (Saskatoon) ────────────
UPDATE providers SET
  organization = 'Milestones Occupational Therapy',
  notes = 'Milestones Occupational Therapy in Saskatoon provides pediatric OT services focusing on sensory integration, fine motor skills, self-regulation, daily living activities, and school participation for children with ASD and developmental delays.'
WHERE email ILIKE '%milestonesot%'
   OR website ILIKE '%milestonesot%';

-- ── Outcomes Therapy (Regina) ───────────────────────────────
UPDATE providers SET
  organization = 'Outcomes Therapy',
  notes = 'Outcomes Therapy in Regina offers occupational therapy for children and adults. Their pediatric services address sensory processing, motor development, feeding challenges, self-care independence, and school participation for children with autism and developmental differences.'
WHERE email ILIKE '%outcomestherapy%'
   OR website ILIKE '%outcomestherapy%';

-- ── Wildflowers Therapy (Regina) ────────────────────────────
UPDATE providers SET
  organization = 'Wildflowers Therapy',
  notes = 'Wildflowers Therapy is a psychology and counselling practice in Regina offering services for children, adolescents, and families. Their therapists specialize in anxiety, ASD, ADHD, trauma, behaviour challenges, and family therapy using evidence-based, strengths-based approaches.'
WHERE email ILIKE '%wildflowerstherapy%'
   OR email ILIKE '%wildflowerschild%'
   OR website ILIKE '%wildflowerstherapy%'
   OR website ILIKE '%wildflowerschild%';

-- ── Hunt Psychological Services (Lloydminster) ─────────────
UPDATE providers SET
  organization = 'Hunt Psychological Services',
  notes = 'Hunt Psychological Services is a multidisciplinary clinic in Lloydminster providing psychology, speech-language pathology, occupational therapy, and physiotherapy for children and adults. They specialize in ASD assessments, learning disabilities, ADHD, and developmental challenges.'
WHERE email ILIKE '%huntpsychologicalservices%'
   OR website ILIKE '%huntpsychologicalservices%';

-- ── Saskatchewan Behaviour Consulting (Saskatoon) ──────────
UPDATE providers SET
  organization = 'Saskatchewan Behaviour Consulting',
  notes = 'Saskatchewan Behaviour Consulting provides Applied Behaviour Analysis (ABA) therapy and behaviour consulting for individuals with autism spectrum disorder in Saskatoon and surrounding areas. Their Board Certified Behaviour Analysts (BCBAs) design individualized, evidence-based intervention programs.'
WHERE email ILIKE '%saskbc%'
   OR website ILIKE '%saskbehaviourconsulting%';

-- ── Saskatchewan Autism Center (Saskatoon) ─────────────────
UPDATE providers SET
  organization = 'Saskatchewan Autism Center',
  notes = 'Saskatchewan Autism Center in Saskatoon specializes in Applied Behaviour Analysis (ABA) and Intensive Behaviour Intervention (IBI) programs for children with autism spectrum disorder. They offer clinic-based and home-based therapy delivered by qualified behaviour therapists.'
WHERE email ILIKE '%saskautismcenter%'
   OR website ILIKE '%saskautismcenter%';

-- ── ABACS Behaviour Consulting (Regina) ────────────────────
UPDATE providers SET
  organization = 'ABACS Behaviour Consulting',
  notes = 'ABACS Behaviour Consulting in Regina provides Applied Behaviour Analysis (ABA) services for children with autism spectrum disorder. Their team of registered behaviour analysts and therapists designs and implements individualized, evidence-based behaviour intervention programs.'
WHERE email ILIKE '%abacs%'
   OR website ILIKE '%abacs%';

-- ── Prairie Hope Wellness (northern SK) ────────────────────
UPDATE providers SET
  organization = 'Prairie Hope Wellness',
  notes = 'Prairie Hope Wellness is a psychology and mental health practice serving communities across northern Saskatchewan including Melfort, Nipawin, and Warman. They provide counselling, psychological assessments, and therapy for children, adolescents, and families including those with ASD.'
WHERE email ILIKE '%prairiehopewellness%'
   OR website ILIKE '%prairiehopewellness%';

-- ── Kids Physio Group (Saskatoon) ───────────────────────────
UPDATE providers SET
  organization = 'Kids Physio Group',
  notes = 'Kids Physio Group in Saskatoon is a pediatric physiotherapy clinic specializing in motor development, gross motor delays, orthopaedic conditions, neurological rehabilitation, and physical activity promotion for children from infancy through adolescence.'
WHERE email ILIKE '%kidsphysio%'
   OR website ILIKE '%kidsphysio%';

-- ── Develop Physiotherapy (Saskatoon) ──────────────────────
UPDATE providers SET
  organization = 'Develop Physiotherapy',
  notes = 'Develop Physiotherapy in Saskatoon focuses on pediatric physiotherapy for children with developmental delays, gross motor challenges, neurological conditions, and autism spectrum disorder. Their physiotherapists use play-based approaches to improve strength, balance, coordination, and movement.'
WHERE email ILIKE '%developt.ca%'
   OR website ILIKE '%developt.ca%';

-- ── Holistic Physio & Wellness (Saskatoon) ─────────────────
UPDATE providers SET
  organization = 'Holistic Physio & Wellness',
  notes = 'Holistic Physio & Wellness in Saskatoon offers physiotherapy with a whole-person approach. Their pediatric services address gross motor development, postural issues, core strength, balance, and mobility for children with developmental delays and autism spectrum disorder.'
WHERE email ILIKE '%holisticphysiowellness%'
   OR website ILIKE '%holisticphysiowellness%';
