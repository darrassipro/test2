-- ============================================
-- Fichier SQL pour remplir les données de test
-- Stories avec StoryViews et Utilisateurs
-- ============================================

-- Nettoyer les données existantes (optionnel - à commenter si vous voulez garder les données existantes)
-- DELETE FROM story_views;
-- DELETE FROM stories;
-- DELETE FROM users WHERE id NOT IN (SELECT DISTINCT user_id FROM posts WHERE user_id IS NOT NULL);

-- ============================================
-- 1. INSERTION DES UTILISATEURS DE TEST
-- ============================================

INSERT INTO users (
    id,
    first_name,
    last_name,
    gmail,
    phone,
    primary_identifier,
    password,
    profile_image,
    banner,
    cloudinary_image_public_id,
    cloudinary_banner_public_id,
    profile_description,
    country,
    total_followers,
    total_communities,
    is_verified,
    is_deleted,
    is_active,
    created_at,
    updated_at
) VALUES
-- Utilisateur 1
('11111111-1111-1111-1111-111111111111', 'Ahmed', 'Benali', 'ahmed.benali@example.com', '+212612345678', 'ahmed.benali@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Travel and photography enthusiast. I love discovering new places and sharing my experiences.', 'Morocco', 1250, 5, true, false, true, NOW(), NOW()),

-- Utilisateur 2
('22222222-2222-2222-2222-222222222222', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+33612345678', 'sarah.johnson@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Urban explorer and street art enthusiast. I capture the beauty of cities.', 'France', 890, 3, false, false, true, NOW(), NOW()),

-- Utilisateur 3
('33333333-3333-3333-3333-333333333333', 'Mohamed', 'Alami', 'mohamed.alami@example.com', '+212698765432', 'mohamed.alami@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Professional tour guide. Specialized in cultural tours in Morocco.', 'Morocco', 2100, 8, true, false, true, NOW(), NOW()),

-- Utilisateur 4
('44444444-4444-4444-4444-444444444444', 'Emma', 'Martinez', 'emma.martinez@example.com', '+34612345678', 'emma.martinez@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Food blogger and Spanish cuisine lover. I share my culinary discoveries.', 'Spain', 1560, 4, false, false, true, NOW(), NOW()),

-- Utilisateur 5
('55555555-5555-5555-5555-555555555555', 'Youssef', 'Idrissi', 'youssef.idrissi@example.com', '+212612345679', 'youssef.idrissi@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Landscape photographer. I capture the natural beauty of Morocco.', 'Morocco', 980, 2, false, false, true, NOW(), NOW()),

-- Utilisateur 6
('66666666-6666-6666-6666-666666666666', 'Sophie', 'Dubois', 'sophie.dubois@example.com', '+33612345679', 'sophie.dubois@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Solo traveler. I explore the world one destination at a time.', 'France', 750, 1, false, false, true, NOW(), NOW()),

-- Utilisateur 7
('77777777-7777-7777-7777-777777777777', 'Carlos', 'Rodriguez', 'carlos.rodriguez@example.com', '+34612345679', 'carlos.rodriguez@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Professional surfer. I share my surf sessions around the world.', 'Spain', 3200, 12, true, false, true, NOW(), NOW()),

-- Utilisateur 8
('88888888-8888-8888-8888-888888888888', 'Fatima', 'Bennani', 'fatima.bennani@example.com', '+212612345680', 'fatima.bennani@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Architect and design enthusiast. I document Moroccan architecture.', 'Morocco', 1450, 6, false, false, true, NOW(), NOW()),

-- Utilisateur 9
('99999999-9999-9999-9999-999999999999', 'Lucas', 'Moreau', 'lucas.moreau@example.com', '+33612345680', 'lucas.moreau@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Hiker and mountaineer. I share my mountain adventures.', 'France', 1100, 3, false, false, true, NOW(), NOW()),

-- Utilisateur 10
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Isabella', 'Garcia', 'isabella.garcia@example.com', '+34612345680', 'isabella.garcia@example.com', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', NULL, NULL, NULL, NULL, 'Artist and content creator. I mix art and travel in my posts.', 'Spain', 1890, 7, true, false, true, NOW(), NOW());

-- ============================================
-- 2. INSERTION DES STORIES DE TEST
-- ============================================
-- Les stories expirent dans 24 heures (par défaut)
-- Certaines stories sont récentes (créées il y a quelques heures)
-- D'autres sont plus anciennes (créées il y a 12-18 heures)

INSERT INTO stories (
    id,
    user_id,
    media_url,
    cloudinary_public_id,
    caption,
    expires_at,
    is_active,
    created_at,
    updated_at
) VALUES
-- Stories de l'utilisateur 1 (Ahmed)
('story-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, NULL, 'Beautiful sunset in Chefchaouen 🏔️', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('story-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', NULL, NULL, 'Exploring the blue alleys of the medina', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('story-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', NULL, NULL, 'Panoramic view from the mountains', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),

-- Stories de l'utilisateur 2 (Sarah)
('story-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', NULL, NULL, 'Street art in Montmartre district 🎨', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('story-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NULL, NULL, 'Discovering a new mural fresco', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- Stories de l'utilisateur 3 (Mohamed)
('story-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', NULL, NULL, 'Guided tour of Fez medina 🕌', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('story-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', NULL, NULL, 'Traditional Moroccan craftsmanship', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('story-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NULL, NULL, 'Mint tea tasting experience', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR)),

-- Stories de l'utilisateur 4 (Emma)
('story-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444444', NULL, NULL, 'Authentic tapas in Barcelona 🍤', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('story-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444444', NULL, NULL, 'Secret recipe for Valencian paella', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR)),

-- Stories de l'utilisateur 5 (Youssef)
('story-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', NULL, NULL, 'Sahara desert at sunset 🌅', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('story-5555-5555-5555-555555555552', '55555555-5555-5555-5555-555555555555', NULL, NULL, 'Camel caravan in the desert', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR)),

-- Stories de l'utilisateur 6 (Sophie)
('story-6666-6666-6666-666666666661', '66666666-6666-6666-6666-666666666666', NULL, NULL, 'Solo adventure in Tokyo 🇯🇵', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('story-6666-6666-6666-666666666662', '66666666-6666-6666-6666-666666666666', NULL, NULL, 'Discovering temples and zen gardens', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),

-- Stories de l'utilisateur 7 (Carlos)
('story-7777-7777-7777-777777777771', '77777777-7777-7777-7777-777777777777', NULL, NULL, 'Surf session in Biarritz 🏄', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('story-7777-7777-7777-777777777772', '77777777-7777-7777-7777-777777777777', NULL, NULL, 'Perfect waves this morning', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('story-7777-7777-7777-777777777773', '77777777-7777-7777-7777-777777777777', NULL, NULL, 'Sunset surf session 🌊', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 11 HOUR)),

-- Stories de l'utilisateur 8 (Fatima)
('story-8888-8888-8888-888888888881', '88888888-8888-8888-8888-888888888888', NULL, NULL, 'Modern architecture in Casablanca 🏛️', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('story-8888-8888-8888-888888888882', '88888888-8888-8888-8888-888888888888', NULL, NULL, 'Architectural details of Hassan II Mosque', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR)),

-- Stories de l'utilisateur 9 (Lucas)
('story-9999-9999-9999-999999999991', '99999999-9999-9999-9999-999999999999', NULL, NULL, 'Climbing Mont Blanc ⛰️', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('story-9999-9999-9999-999999999992', '99999999-9999-9999-9999-999999999999', NULL, NULL, 'Breathtaking view from the summit', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR)),

-- Stories de l'utilisateur 10 (Isabella)
('story-aaaa-aaaa-aaaa-aaaaaaaaaa1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'Artistic creation inspired by Seville 🎨', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('story-aaaa-aaaa-aaaa-aaaaaaaaaa2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'Art workshop in the streets of Madrid', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('story-aaaa-aaaa-aaaa-aaaaaaaaaa3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NULL, NULL, 'Contemporary art exhibition', DATE_ADD(NOW(), INTERVAL 24 HOUR), true, DATE_SUB(NOW(), INTERVAL 13 HOUR), DATE_SUB(NOW(), INTERVAL 13 HOUR));

-- ============================================
-- 3. INSERTION DES VUES DE STORIES (StoryViews)
-- ============================================
-- Chaque vue représente un utilisateur qui a regardé une story
-- Un utilisateur ne peut voir une story qu'une seule fois (contrainte unique)

INSERT INTO story_views (
    id,
    story_id,
    viewer_id,
    created_at,
    updated_at
) VALUES
-- Vues pour les stories de l'utilisateur 1 (Ahmed)
('view-1111-1111-1111-111111111111', 'story-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
('view-1111-1111-1111-111111111112', 'story-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
('view-1111-1111-1111-111111111113', 'story-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', DATE_SUB(NOW(), INTERVAL 70 MINUTE), DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
('view-1111-1111-1111-111111111114', 'story-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222222', DATE_SUB(NOW(), INTERVAL 270 MINUTE), DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
('view-1111-1111-1111-111111111115', 'story-1111-1111-1111-111111111112', '55555555-5555-5555-5555-555555555555', DATE_SUB(NOW(), INTERVAL 260 MINUTE), DATE_SUB(NOW(), INTERVAL 260 MINUTE)),
('view-1111-1111-1111-111111111116', 'story-1111-1111-1111-111111111113', '66666666-6666-6666-6666-666666666666', DATE_SUB(NOW(), INTERVAL 450 MINUTE), DATE_SUB(NOW(), INTERVAL 450 MINUTE)),

-- Vues pour les stories de l'utilisateur 2 (Sarah)
('view-2222-2222-2222-222222222221', 'story-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('view-2222-2222-2222-222222222222', 'story-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('view-2222-2222-2222-222222222223', 'story-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', DATE_SUB(NOW(), INTERVAL 230 MINUTE), DATE_SUB(NOW(), INTERVAL 230 MINUTE)),
('view-2222-2222-2222-222222222224', 'story-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', DATE_SUB(NOW(), INTERVAL 220 MINUTE), DATE_SUB(NOW(), INTERVAL 220 MINUTE)),

-- Vues pour les stories de l'utilisateur 3 (Mohamed)
('view-3333-3333-3333-333333333331', 'story-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', DATE_SUB(NOW(), INTERVAL 150 MINUTE), DATE_SUB(NOW(), INTERVAL 150 MINUTE)),
('view-3333-3333-3333-333333333332', 'story-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444444', DATE_SUB(NOW(), INTERVAL 140 MINUTE), DATE_SUB(NOW(), INTERVAL 140 MINUTE)),
('view-3333-3333-3333-333333333333', 'story-3333-3333-3333-333333333331', '88888888-8888-8888-8888-888888888888', DATE_SUB(NOW(), INTERVAL 130 MINUTE), DATE_SUB(NOW(), INTERVAL 130 MINUTE)),
('view-3333-3333-3333-333333333334', 'story-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', DATE_SUB(NOW(), INTERVAL 330 MINUTE), DATE_SUB(NOW(), INTERVAL 330 MINUTE)),
('view-3333-3333-3333-333333333335', 'story-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', DATE_SUB(NOW(), INTERVAL 570 MINUTE), DATE_SUB(NOW(), INTERVAL 570 MINUTE)),

-- Vues pour les stories de l'utilisateur 4 (Emma)
('view-4444-4444-4444-444444444441', 'story-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
('view-4444-4444-4444-444444444442', 'story-4444-4444-4444-444444444441', '77777777-7777-7777-7777-777777777777', DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
('view-4444-4444-4444-444444444443', 'story-4444-4444-4444-444444444442', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', DATE_SUB(NOW(), INTERVAL 390 MINUTE), DATE_SUB(NOW(), INTERVAL 390 MINUTE)),

-- Vues pour les stories de l'utilisateur 5 (Youssef)
('view-5555-5555-5555-555555555551', 'story-5555-5555-5555-555555555551', '11111111-1111-1111-1111-111111111111', DATE_SUB(NOW(), INTERVAL 210 MINUTE), DATE_SUB(NOW(), INTERVAL 210 MINUTE)),
('view-5555-5555-5555-555555555552', 'story-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 200 MINUTE), DATE_SUB(NOW(), INTERVAL 200 MINUTE)),
('view-5555-5555-5555-555555555553', 'story-5555-5555-5555-555555555552', '88888888-8888-8888-8888-888888888888', DATE_SUB(NOW(), INTERVAL 510 MINUTE), DATE_SUB(NOW(), INTERVAL 510 MINUTE)),

-- Vues pour les stories de l'utilisateur 6 (Sophie)
('view-6666-6666-6666-666666666661', 'story-6666-6666-6666-666666666661', '99999999-9999-9999-9999-999999999999', DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('view-6666-6666-6666-666666666662', 'story-6666-6666-6666-666666666662', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', DATE_SUB(NOW(), INTERVAL 270 MINUTE), DATE_SUB(NOW(), INTERVAL 270 MINUTE)),

-- Vues pour les stories de l'utilisateur 7 (Carlos)
('view-7777-7777-7777-777777777771', 'story-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222222', DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
('view-7777-7777-7777-777777777772', 'story-7777-7777-7777-777777777771', '44444444-4444-4444-4444-444444444444', DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
('view-7777-7777-7777-777777777773', 'story-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666666', DATE_SUB(NOW(), INTERVAL 330 MINUTE), DATE_SUB(NOW(), INTERVAL 330 MINUTE)),
('view-7777-7777-7777-777777777774', 'story-7777-7777-7777-777777777773', '99999999-9999-9999-9999-999999999999', DATE_SUB(NOW(), INTERVAL 630 MINUTE), DATE_SUB(NOW(), INTERVAL 630 MINUTE)),

-- Vues pour les stories de l'utilisateur 8 (Fatima)
('view-8888-8888-8888-888888888881', 'story-8888-8888-8888-888888888881', '33333333-3333-3333-3333-333333333333', DATE_SUB(NOW(), INTERVAL 150 MINUTE), DATE_SUB(NOW(), INTERVAL 150 MINUTE)),
('view-8888-8888-8888-888888888882', 'story-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555555', DATE_SUB(NOW(), INTERVAL 450 MINUTE), DATE_SUB(NOW(), INTERVAL 450 MINUTE)),

-- Vues pour les stories de l'utilisateur 9 (Lucas)
('view-9999-9999-9999-999999999991', 'story-9999-9999-9999-999999999991', '66666666-6666-6666-6666-666666666666', DATE_SUB(NOW(), INTERVAL 210 MINUTE), DATE_SUB(NOW(), INTERVAL 210 MINUTE)),
('view-9999-9999-9999-999999999992', 'story-9999-9999-9999-999999999992', '77777777-7777-7777-7777-777777777777', DATE_SUB(NOW(), INTERVAL 690 MINUTE), DATE_SUB(NOW(), INTERVAL 690 MINUTE)),

-- Vues pour les stories de l'utilisateur 10 (Isabella)
('view-aaaa-aaaa-aaaa-aaaaaaaaaa1', 'story-aaaa-aaaa-aaaa-aaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
('view-aaaa-aaaa-aaaa-aaaaaaaaaa2', 'story-aaaa-aaaa-aaaa-aaaaaaaaaa1', '44444444-4444-4444-4444-444444444444', DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('view-aaaa-aaaa-aaaa-aaaaaaaaaa3', 'story-aaaa-aaaa-aaaa-aaaaaaaaaa2', '88888888-8888-8888-8888-888888888888', DATE_SUB(NOW(), INTERVAL 330 MINUTE), DATE_SUB(NOW(), INTERVAL 330 MINUTE)),
('view-aaaa-aaaa-aaaa-aaaaaaaaaa4', 'story-aaaa-aaaa-aaaa-aaaaaaaaaa3', '99999999-9999-9999-9999-999999999999', DATE_SUB(NOW(), INTERVAL 750 MINUTE), DATE_SUB(NOW(), INTERVAL 750 MINUTE));

-- ============================================
-- VÉRIFICATION DES DONNÉES INSÉRÉES
-- ============================================
-- Vous pouvez exécuter ces requêtes pour vérifier les données :

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_stories FROM stories;
-- SELECT COUNT(*) as total_views FROM story_views;

-- SELECT u.first_name, u.last_name, COUNT(s.id) as story_count
-- FROM users u
-- LEFT JOIN stories s ON u.id = s.user_id
-- GROUP BY u.id, u.first_name, u.last_name
-- ORDER BY story_count DESC;

-- SELECT s.id, CONCAT(u.first_name, ' ', u.last_name) as author, COUNT(sv.id) as view_count
-- FROM stories s
-- JOIN users u ON s.user_id = u.id
-- LEFT JOIN story_views sv ON s.id = sv.story_id
-- GROUP BY s.id, u.first_name, u.last_name
-- ORDER BY view_count DESC;

