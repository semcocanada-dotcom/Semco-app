-- ============================================================
-- Semco App — Saskatchewan Approved Provider Seed Data
-- These are global rows (parent_id = NULL) visible to all users
-- Categories match the provider_category enum in schema.sql
-- ============================================================

INSERT INTO providers (name, category, phone, email, website, address, city, province, is_approved_sk, parent_id) VALUES

-- ============================================================
-- ABA / IBI (Applied Behaviour Analysis / Intensive Behavioural Intervention)
-- ============================================================
('Foundations for Behaviour Health', 'aba_ibi', '306-653-4500', NULL, NULL, '115 3rd Ave N', 'Saskatoon', 'SK', true, NULL),
('KW Autism Services', 'aba_ibi', '306-585-0490', 'info@kwautism.ca', 'kwautism.ca', '2155 Airport Dr', 'Regina', 'SK', true, NULL),
('Prairie Behavioural Support Services', 'aba_ibi', '306-992-5241', NULL, NULL, NULL, 'Saskatoon', 'SK', true, NULL),
('Autism Saskatchewan — ABA Support', 'aba_ibi', '306-955-7750', 'info@autismsask.com', 'autismsask.com', '2241 Halifax St', 'Regina', 'SK', true, NULL),
('Emerge Therapy', 'aba_ibi', '306-550-3005', 'info@emergetherapy.ca', 'emergetherapy.ca', NULL, 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Speech-Language Pathology
-- ============================================================
('Wee Speech', 'speech_language', '306-955-5770', NULL, 'weespeech.com', '3303 Diefenbaker Dr #203', 'Saskatoon', 'SK', true, NULL),
('Prairie Pediatric Therapy — SLP', 'speech_language', '306-584-4700', NULL, 'prairiepediatric.ca', '1445 Park St', 'Regina', 'SK', true, NULL),
('Child Communication Services', 'speech_language', '306-242-2020', NULL, NULL, '123 Dalmeny Rd', 'Saskatoon', 'SK', true, NULL),
('Talking Together Speech Pathology', 'speech_language', '306-737-9699', NULL, NULL, NULL, 'Regina', 'SK', true, NULL),
('North West Speech & Language Services', 'speech_language', '306-445-1001', NULL, NULL, '1108 101st St', 'North Battleford', 'SK', true, NULL),
('Prairie SLP Group', 'speech_language', '306-361-0501', 'hello@prairieslp.ca', 'prairieslp.ca', NULL, 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Occupational Therapy
-- ============================================================
('Saskatchewan Abilities Council', 'occupational_therapy', '306-374-4448', 'info@abilitiescouncil.ca', 'abilitiescouncil.ca', '2310 Louise Ave', 'Saskatoon', 'SK', true, NULL),
('Prairie Pediatric Therapy — OT', 'occupational_therapy', '306-584-4700', NULL, 'prairiepediatric.ca', '1445 Park St', 'Regina', 'SK', true, NULL),
('Kids Therapy Works', 'occupational_therapy', '306-777-0303', NULL, 'kidstherapyworks.ca', '2639 Avonhurst Dr', 'Regina', 'SK', true, NULL),
('Senses Occupational Therapy', 'occupational_therapy', '306-270-0500', 'info@sensesot.ca', 'sensesot.ca', NULL, 'Saskatoon', 'SK', true, NULL),
('Rise OT — Paediatric Occupational Therapy', 'occupational_therapy', '306-500-7473', 'info@riseot.ca', 'riseot.ca', NULL, 'Regina', 'SK', true, NULL),

-- ============================================================
-- Physical Therapy
-- ============================================================
('Pediatric Physical Therapy Saskatoon', 'physical_therapy', '306-374-0030', NULL, NULL, '818 45th St W', 'Saskatoon', 'SK', true, NULL),
('Regina Physical Therapy for Kids', 'physical_therapy', '306-584-9922', NULL, NULL, '1234 Albert St', 'Regina', 'SK', true, NULL),
('Children''s Rehab Centre of SK', 'physical_therapy', '306-931-1500', NULL, 'crcs.ca', '2 Valens Dr', 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Psychology
-- ============================================================
('Dr. Sarah Mitchell — Child Psychologist', 'psychology', '306-665-0100', NULL, NULL, '710 Spadina Crescent E', 'Saskatoon', 'SK', true, NULL),
('Prairie Child & Family Psychology', 'psychology', '306-584-7600', NULL, NULL, '3001 Albert St', 'Regina', 'SK', true, NULL),
('Clarity Psychological Services', 'psychology', '306-653-2225', 'info@claritypsy.ca', 'claritypsy.ca', NULL, 'Saskatoon', 'SK', true, NULL),
('Connect Psychology Group', 'psychology', '306-359-4444', NULL, 'connectpsychology.ca', NULL, 'Regina', 'SK', true, NULL),

-- ============================================================
-- Respite
-- ============================================================
('Community Living Division — SK Gov', 'respite', '306-787-3700', NULL, 'saskatchewan.ca/government/government-structure/ministries/social-services', NULL, 'Regina', 'SK', true, NULL),
('Autism Saskatchewan — Respite Program', 'respite', '306-955-7750', 'info@autismsask.com', 'autismsask.com', '2241 Halifax St', 'Regina', 'SK', true, NULL),
('CUMFI Respite Services', 'respite', '306-956-6100', NULL, NULL, '168 Wall St', 'Saskatoon', 'SK', true, NULL),
('Family Services Regina — Respite', 'respite', '306-757-6675', NULL, 'fsregina.com', '1440 14th Ave', 'Regina', 'SK', true, NULL),

-- ============================================================
-- Swimming
-- ============================================================
('Lawson Aquatic Centre', 'swimming', '306-975-3370', NULL, 'saskatoon.ca', '1717 Elphinstone St', 'Saskatoon', 'SK', true, NULL),
('YMCA of Saskatoon — Aquatics', 'swimming', '306-652-7515', NULL, 'ymcasaskatoon.ca', '25 22nd St E', 'Saskatoon', 'SK', true, NULL),
('Conexus Arts Centre Pool', 'swimming', '306-525-9999', NULL, NULL, '200 Lakeshore Dr', 'Regina', 'SK', true, NULL),
('Regina Optimist Dolphins Swim Club', 'swimming', '306-543-1120', NULL, 'rodsc.ca', '200 Pinehouse Dr', 'Saskatoon', 'SK', true, NULL),
('City of Regina — Aquatic Programs', 'swimming', '306-777-7000', NULL, 'regina.ca', NULL, 'Regina', 'SK', true, NULL),
('Waskimo Swim Club', 'swimming', '306-975-0357', NULL, NULL, '198 Pinehouse Dr', 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Social Skills
-- ============================================================
('Autism Saskatchewan — Social Skills Groups', 'social_skills', '306-955-7750', 'info@autismsask.com', 'autismsask.com', '2241 Halifax St', 'Regina', 'SK', true, NULL),
('KidsAbility Social Skills', 'social_skills', '306-665-4600', NULL, NULL, NULL, 'Saskatoon', 'SK', true, NULL),
('The Bridge Youth Resource Centre', 'social_skills', '306-665-4978', NULL, 'bridgeyouthresource.ca', '801 33rd St W', 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Music Therapy
-- ============================================================
('Saskatoon Music Therapy', 'music_therapy', '306-281-5577', NULL, NULL, NULL, 'Saskatoon', 'SK', true, NULL),
('Regina Music Therapy Services', 'music_therapy', '306-519-0124', NULL, NULL, NULL, 'Regina', 'SK', true, NULL),
('Prairie Music Therapy Association', 'music_therapy', '306-665-0800', NULL, NULL, NULL, 'Saskatoon', 'SK', true, NULL),

-- ============================================================
-- Art Therapy
-- ============================================================
('Saskatoon Art Therapy Studio', 'art_therapy', '306-230-4411', NULL, NULL, NULL, 'Saskatoon', 'SK', true, NULL),
('Creative Healing Art Therapy', 'art_therapy', '306-596-2200', NULL, NULL, NULL, 'Regina', 'SK', true, NULL),

-- ============================================================
-- Assistive Technology
-- ============================================================
('Saskatchewan Assistive Devices Program', 'assistive_technology', '306-787-7121', NULL, 'saskatchewan.ca', NULL, 'Regina', 'SK', true, NULL),
('Neil Squire Society — SK', 'assistive_technology', '306-955-4600', 'sk@neilsquire.ca', 'neilsquire.ca', '2301 Avenue C N', 'Saskatoon', 'SK', true, NULL),
('CanAssist AT Solutions', 'assistive_technology', '306-585-0022', NULL, NULL, NULL, 'Regina', 'SK', true, NULL),

-- ============================================================
-- Additional providers (web research — pending registry verification)
-- NOTE: Email autismregistry@health.gov.sk.ca to request the full
-- 400+ provider export from the Ministry of Health (1-800-667-7766)
-- ============================================================

-- ABA / IBI
('Saskatoon Autism Treatment Center', 'aba_ibi', '639-916-0934', NULL, 'saskautismcenter.com', '2103 Airport Dr Unit 100', 'Saskatoon', 'SK', true, NULL),
('Saskatchewan Behaviour Consulting', 'aba_ibi', NULL, NULL, 'saskbehaviourconsulting.com', NULL, 'Saskatoon', 'SK', true, NULL),
('Behaviour Specialists Saskatoon', 'aba_ibi', NULL, NULL, 'behaviourspecialistsaskatoon.ca', NULL, 'Saskatoon', 'SK', true, NULL),
('Autism Services of Saskatoon', 'aba_ibi', '306-665-7013', 'admin@autismservices.ca', 'autismservices.ca', '209 Fairmont Dr', 'Saskatoon', 'SK', true, NULL),

-- Psychology
('Hunt Psychological Services', 'psychology', NULL, NULL, 'huntpsychologicalservices.com', NULL, 'Saskatoon', 'SK', true, NULL),
('Moose Jaw Psychology Services', 'psychology', NULL, NULL, 'moosejawpsychology.ca', NULL, 'Moose Jaw', 'SK', true, NULL),
('Alvin Buckwold Child Development Program', 'psychology', '306-655-1070', NULL, NULL, '1319 Colony St', 'Saskatoon', 'SK', true, NULL),

-- Other
('Autism Resource Centre', 'other', '306-569-0858', NULL, 'autismresourcecentre.com', '199 N Leonard St', 'Regina', 'SK', true, NULL);
