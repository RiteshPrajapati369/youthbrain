-- 20241018000005_seed_data.sql
-- Initial seed data for YouTh Brain News Portal

-- Default Owner Profile
INSERT INTO public.profiles (
    id,
    full_name,
    headline,
    bio,
    about_description,
    avatar_url,
    email,
    phone,
    location,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ritesh Prajapati',
    'Editor-in-Chief & Founder, YouTh Brain News',
    'Journalist, technologist, and digital media innovator covering Nepal and the world.',
    'YouTh Brain News is a premier independent digital news portal committed to impartial, verified, and timely news reporting across politics, youth innovation, technology, education, and culture in Nepal.',
    '/logo.jpg',
    'panditritesh005@gmail.com',
    '+977-9800000000',
    'Hetauda, Nepal',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Default Categories
INSERT INTO public.categories (id, profile_id, name_ne, name_en, slug, description_ne, description_en, color, sort_order, is_active)
VALUES 
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'राजनीति', 'Politics', 'politics', 'समसामयिक राजनीतिक घटनाक्रम र नीतिगत विश्लेषण', 'Contemporary political events and policy analysis', '#235DBC', 1, true),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'समाज', 'Society', 'society', 'सामाजिक सरोकार, न्याय, जनजीवन र रूपान्तरण', 'Social issues, justice, grassroots and community development', '#06B6D4', 2, true),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'अर्थ', 'Economy', 'economy', 'अर्थतन्त्र, व्यापार, वित्त र बजार विश्लेषण', 'Economy, business, finance and market insights', '#10B981', 3, true),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'विज्ञान तथा प्रविधि', 'Science & Technology', 'science-tech', 'आर्टिफिसियल इन्टेलिजेन्स, डिजिटल आविष्कार र वैज्ञानिक खोज', 'AI, digital innovation and scientific breakthroughs', '#EA4C89', 4, true),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'खेलकुद', 'Sports', 'sports', 'क्रिकेट, फुटबल र राष्ट्रिय तथा अन्तर्राष्ट्रिय खेल', 'Cricket, football and sporting highlights', '#8B5CF6', 5, true),
    ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'अन्तर्वार्ता', 'Interview', 'interview', 'राजनीतिक नेतृत्व, विज्ञ र प्रेरक व्यक्तित्वहरूसँग विशेष संवाद', 'Exclusive dialogues with policymakers, thinkers and leaders', '#F59E0B', 6, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Articles
INSERT INTO public.articles (
    id,
    profile_id,
    category_id,
    title_ne,
    title_en,
    slug,
    summary_ne,
    summary_en,
    content_ne,
    content_en,
    cover_image_url,
    status,
    is_breaking,
    is_featured,
    published_at,
    view_count,
    seo_title,
    seo_description
) VALUES 
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'नेपालमा डिजिटल रूपान्तरण र युवा आईटी प्रतिभाहरूको योगदान',
    'Digital Transformation in Nepal: How Youth IT Talent Is Reshaping the Economy',
    'digital-transformation-nepal-youth-tech',
    'नेपाली युवा सफ्टवेयर इन्जिनियरहरू र प्राविधिक उद्यमीहरूले विश्वव्यापी बजारमा नयाँ पहिचान बनाउँदैछन्।',
    'Nepali youth software engineers and tech entrepreneurs are setting new benchmarks in the global IT ecosystem.',
    '# नेपालमा डिजिटल रूपान्तरण र युवा आईटी प्रतिभाहरूको योगदान\n\nकाठमाडौँ — पछिल्ला केही वर्षहरूमा नेपालको सूचना प्रविधि (IT) क्षेत्रमा असाधारण वृद्धि देखिएको छ। हजारौँ युवा प्रोग्रामर, डेटा साइन्टिस्ट, र क्लाउड आर्किटेक्टहरूले अन्तर्राष्ट्रिय स्तरका परियोजनाहरू स्वदेशमै बसेर सफलतापूर्वक सम्पन्न गरिरहेका छन्।\n\n## निर्यातमा आधारित सेवाको विस्तार\n\nनेपाल राष्ट्र बैंकको पछिल्लो प्रतिवेदन अनुसार सूचना प्रविधि सेवा निर्यात नेपालको वैदेशिक मुद्रा आर्जनको मुख्य स्रोतको रूपमा उदाइरहेको छ। रिमोट वर्क संस्कृति र डिजिटल प्लेटफर्महरूले नेपाली प्रतिभालाई भौगोलिक सीमाहरू पार गरेर काम गर्न सक्षम बनाएका छन्।\n\n### सरकार र निजी क्षेत्रको सहकार्य\n\nप्राविधिक शिक्षामा लगानी, उच्च गतिको ब्रोडब्यान्ड विस्तार, र नयाँ स्टार्टअप मैत्री नीतिहरूको निर्माणले यस क्षेत्रलाई थप ऊर्जा दिएको छ।',
    '# Digital Transformation in Nepal: How Youth IT Talent Is Reshaping the Economy\n\nKathmandu — In recent years, Nepal''s Information Technology (IT) sector has experienced exponential growth. Thousands of young software engineers, data scientists, and cloud architects are delivering international projects directly from Kathmandu and beyond.\n\n## Growth of IT Service Exports\n\nAccording to recent economic data, IT service exports have emerged as a significant source of foreign currency earnings for Nepal. The rise of remote work culture and modern digital collaboration platforms has allowed Nepali engineers to integrate seamlessly into global engineering teams.\n\n### Public-Private Partnerships\n\nInvestments in STEM education, expansion of high-speed fiber infrastructure, and supportive policies for tech startups have catalyzed nationwide digital innovation.',
    '/logo.jpg',
    'published',
    true,
    true,
    now() - interval '2 hours',
    1420,
    'Nepal Digital Transformation & Youth IT Talent',
    'How Nepali young software professionals are leading digital transformation and IT export services.'
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000005',
    'राष्ट्रिय क्रिकेट टोलीको उत्कृष्ट प्रदर्शन: युवा खेलाडीहरूको चम्किलो उदय',
    'National Cricket Team Shines: The Rise of Promising Young Players',
    'national-cricket-team-performance-youth-stars',
    'विश्वकप छनोट र अन्तर्राष्ट्रिय सिरिजहरूमा नेपाली युवा खेलाडीहरूको उच्च मनोबल र ऐतिहासिक जित।',
    'Outstanding bowling and batting performances from new talent propel Nepali cricket forward on the international stage.',
    '# राष्ट्रिय क्रिकेट टोलीको उत्कृष्ट प्रदर्शन\n\nनेपाली क्रिकेटले अन्तर्राष्ट्रिय मञ्चमा निरन्तर सफलताको नयाँ उचाइ चुमिरहेको छ। कीर्तिपुरस्थित त्रिवि अन्तर्राष्ट्रिय मैदानमा हजारौँ समर्थकहरूको उत्साहबीच युवा खेलाडीहरूले उत्कृष्ट खेल कौशल प्रदर्शन गरेका छन्।\n\n## रणनीतिक परिवर्तन र अनुशासन\n\nनयाँ प्रशिक्षण पद्धति र टोली भित्रको आपसी समन्वयले खेलाडीहरूको आत्मविश्वास उल्लेखनीय रूपमा बढाएको छ।',
    '# National Cricket Team Shines: The Rise of Promising Young Players\n\nNepal''s national cricket team continues to inspire millions of fans across the country and the diaspora with spirited international performances.\n\n## Strategic Disciplined Approach\n\nModern training methodologies, domestic league competitiveness, and a clear vision from coaching staff have given the younger squad an assertive edge.',
    '/logo.jpg',
    'published',
    false,
    true,
    now() - interval '5 hours',
    890,
    'Nepal National Cricket Team Youth Stars',
    'Historic performances by Nepal''s emerging cricket squad in international competitions.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Social Links
INSERT INTO public.social_links (id, profile_id, platform, url, label, icon_name, is_active, sort_order)
VALUES
    ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'facebook', 'https://facebook.com/youthbrainnews', 'Facebook', 'Facebook', true, 1),
    ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'twitter', 'https://twitter.com/youthbrainnews', 'X (Twitter)', 'Twitter', true, 2),
    ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'youtube', 'https://youtube.com/@youthbrainnews', 'YouTube', 'Youtube', true, 3),
    ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'linkedin', 'https://linkedin.com/company/youthbrainnews', 'LinkedIn', 'Linkedin', true, 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Site Settings
INSERT INTO public.site_settings (
    id,
    profile_id,
    site_name_ne,
    site_name_en,
    tagline_ne,
    tagline_en,
    logo_url,
    og_image_url,
    copyright_ne,
    copyright_en
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'युथ ब्रेन न्युज',
    'YouTh Brain News',
    'सत्य, तथ्य र निष्पक्ष समाचारको विश्वसनीय स्रोत',
    'Your Trusted Source for Truth, Facts and Impartial News',
    '/logo.jpg',
    '/logo.jpg',
    '© २०२६ YouTh Brain News. सर्वाधिकार सुरक्षित।',
    '© 2026 YouTh Brain News. All rights reserved.'
) ON CONFLICT (id) DO NOTHING;
