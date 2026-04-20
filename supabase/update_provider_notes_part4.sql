-- ============================================================
-- Provider Notes & Organization Update — Part 4
-- Facility / institutional rows + final catch-all
-- Run in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Aquatic Facilities ───────────────────────────────────────
UPDATE providers SET
  organization = 'Lawson Aquatic Centre',
  notes = 'Lawson Aquatic Centre in Saskatoon offers therapeutic swimming programs and public aquatics. Swimming instruction through this facility is an eligible expense for children with autism spectrum disorder under the Saskatchewan Autism Funding program.'
WHERE name ILIKE '%Lawson Aquatic%';

UPDATE providers SET
  organization = 'YMCA of Saskatoon',
  notes = 'YMCA of Saskatoon offers aquatics programs, swimming lessons, and recreational swimming for children and families. Adaptive swim programs are available for children with autism spectrum disorder and developmental differences. An approved provider for SK Autism Funding aquatic expenses.'
WHERE name ILIKE '%YMCA of Saskatoon%';

UPDATE providers SET
  organization = 'City of Regina Aquatic Programs',
  notes = 'City of Regina Aquatic Programs provides swimming instruction and leisure swimming at Regina recreation centres. Inclusive swimming programs for children with autism spectrum disorder qualify as an approved expense under the Saskatchewan Autism Funding program.'
WHERE name ILIKE '%City of Regina%Aquatic%';

UPDATE providers SET
  organization = 'Waskimo Swim Club',
  notes = 'Waskimo Swim Club in Saskatoon provides competitive and recreational swimming programs for youth. Swim club membership and instruction for children with autism spectrum disorder is an approved expense under the Saskatchewan Autism Funding program.'
WHERE name ILIKE '%Waskimo%';

UPDATE providers SET
  organization = 'Regina Optimist Dolphins Swim Club',
  notes = 'Regina Optimist Dolphins Swim Club provides competitive and recreational swimming programs for youth in Regina. Swim club participation for children with autism spectrum disorder is an approved expense under the Saskatchewan Autism Funding program.'
WHERE name ILIKE '%Optimist Dolphins%';

-- ── Social Skills Organizations ──────────────────────────────
UPDATE providers SET
  organization = 'The Bridge Youth Resource Centre',
  notes = 'The Bridge Youth Resource Centre in Saskatoon provides social skills programming, youth support, and community-based services for children and adolescents. Programs support youth with autism spectrum disorder in building social connections, peer relationships, and community participation.'
WHERE name ILIKE '%Bridge Youth Resource%';

-- ── Music Therapy Organizations ──────────────────────────────
UPDATE providers SET
  organization = 'Saskatoon Music Therapy',
  notes = 'Saskatoon Music Therapy provides registered music therapy services for children and adults in Saskatoon. Evidence-based music therapy supports communication, social engagement, emotional regulation, and sensory processing for individuals with autism spectrum disorder.'
WHERE name ILIKE '%Saskatoon Music Therapy%';

UPDATE providers SET
  organization = 'Regina Music Therapy Services',
  notes = 'Regina Music Therapy Services provides registered music therapy for children and adults in Regina. Music therapy is an evidence-based practice that supports communication, social skills, emotional regulation, and sensory integration for individuals with autism spectrum disorder.'
WHERE name ILIKE '%Regina Music Therapy%';

UPDATE providers SET
  organization = 'Prairie Music Therapy Association',
  notes = 'Prairie Music Therapy Association in Saskatoon provides music therapy programs and services for individuals with disabilities across Saskatchewan. Their certified music therapists use musical engagement to support communication, behaviour regulation, and social development in children with ASD.'
WHERE name ILIKE '%Prairie Music Therapy%';

-- ── Art Therapy Organizations ────────────────────────────────
UPDATE providers SET
  organization = 'Saskatoon Art Therapy Studio',
  notes = 'Saskatoon Art Therapy Studio provides art therapy services for children, adolescents, and adults using creative processes to support emotional regulation, communication, trauma processing, and self-expression. Art therapy is beneficial for children with autism spectrum disorder.'
WHERE name ILIKE '%Saskatoon Art Therapy%';

UPDATE providers SET
  organization = 'Creative Healing Art Therapy',
  notes = 'Creative Healing Art Therapy in Regina provides therapeutic art-based services for children and individuals with autism spectrum disorder, trauma, anxiety, and developmental differences. Their registered art therapists use creative expression to support healing and growth.'
WHERE name ILIKE '%Creative Healing Art Therapy%';

-- ── Assistive Technology Programs ────────────────────────────
UPDATE providers SET
  organization = 'Saskatchewan Assistive Devices Program',
  notes = 'The Saskatchewan Assistive Devices Program (SADP) is a government program providing funding and access to assistive devices for individuals with disabilities. The program supports individuals with autism spectrum disorder in accessing communication devices, AAC technology, and other assistive tools.'
WHERE name ILIKE '%Saskatchewan Assistive Devices%';

-- ── Respite Programs ─────────────────────────────────────────
UPDATE providers SET
  organization = 'Community Living Division — Saskatchewan',
  notes = 'The Community Living Division of the Saskatchewan government provides disability supports, respite services, and community living programs for individuals with autism spectrum disorder and developmental disabilities. Services include respite care, supported living, and community participation programs.'
WHERE name ILIKE '%Community Living Division%';

UPDATE providers SET
  organization = 'CUMFI Respite Services',
  notes = 'CUMFI Respite Services in Saskatoon provides culturally responsive respite care and family support for Indigenous families of children with disabilities including autism spectrum disorder. Services offer temporary relief to caregivers while ensuring children receive appropriate support.'
WHERE name ILIKE '%CUMFI%';

UPDATE providers SET
  organization = 'Family Services Regina',
  notes = 'Family Services Regina provides family counselling, respite care, and community support services for families in Regina. Their respite programs offer temporary relief to parents and caregivers of children with autism spectrum disorder and developmental disabilities.'
WHERE name ILIKE '%Family Services Regina%';

-- ── Final catch-all: independent practitioners ───────────────
-- Sets organization = name and adds category-appropriate notes
-- for any provider row still missing an organization value.
-- This covers solo practitioners with personal email addresses
-- (gmail, hotmail, sasktel, outlook, etc.) who are not part
-- of a named clinic already covered above.
UPDATE providers SET
  organization = name,
  notes = CASE category
    WHEN 'speech_language' THEN
      'Registered speech-language pathologist providing individualized assessment and therapy for children and adults with communication disorders, language delays, articulation difficulties, social communication challenges, and autism spectrum disorder. Services available in Saskatchewan.'
    WHEN 'occupational_therapy' THEN
      'Registered occupational therapist providing individualized pediatric OT services for children with sensory processing differences, fine motor delays, self-care challenges, handwriting difficulties, and developmental differences including autism spectrum disorder in Saskatchewan.'
    WHEN 'psychology' THEN
      'Registered psychologist or counsellor providing assessment and therapy for children, adolescents, and adults. Services include support for anxiety, depression, trauma, ADHD, behaviour challenges, and neurodevelopmental conditions including autism spectrum disorder in Saskatchewan.'
    WHEN 'aba_ibi' THEN
      'Registered behaviour analyst or behaviour therapist providing Applied Behaviour Analysis (ABA) therapy and behaviour support for children with autism spectrum disorder in Saskatchewan. Programs are individualized and evidence-based.'
    WHEN 'physical_therapy' THEN
      'Registered physiotherapist providing pediatric physiotherapy services for children with gross motor delays, coordination challenges, developmental differences, and neurological conditions including autism spectrum disorder in Saskatchewan.'
    WHEN 'swimming' THEN
      'Approved aquatic program providing swimming instruction and aquatic therapy for children and individuals with autism spectrum disorder and developmental differences in Saskatchewan. Swimming is an approved expense under the SK Autism Funding program.'
    WHEN 'social_skills' THEN
      'Approved social skills program providing structured group and individual training in social communication, peer interaction, and community participation for children and individuals with autism spectrum disorder in Saskatchewan.'
    WHEN 'music_therapy' THEN
      'Registered music therapist providing evidence-based music therapy services for children and adults with autism spectrum disorder, developmental differences, and communication challenges. Music therapy supports communication, regulation, and social development in Saskatchewan.'
    WHEN 'art_therapy' THEN
      'Registered art therapist providing therapeutic art-based services for children and individuals with autism spectrum disorder, trauma, anxiety, and developmental differences. Creative arts therapy supports emotional expression and communication in Saskatchewan.'
    WHEN 'assistive_technology' THEN
      'Approved assistive technology service provider offering technology assessments, device recommendations, and training to support communication and independence for individuals with autism spectrum disorder and disabilities in Saskatchewan.'
    WHEN 'respite' THEN
      'Approved respite care provider offering temporary relief and support services for families of children with autism spectrum disorder and developmental disabilities in Saskatchewan. Respite services support family well-being and caregiver health.'
    ELSE
      'Approved service provider offering individualized support and services for individuals with autism spectrum disorder and developmental differences in Saskatchewan. Services are tailored to individual needs and family priorities.'
  END
WHERE (organization IS NULL OR organization = '');
