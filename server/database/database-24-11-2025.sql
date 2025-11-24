-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 24 nov. 2025 à 12:48
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ajiw`
--

-- --------------------------------------------------------

--
-- Structure de la table `admins`
--

CREATE TABLE IF NOT EXISTS `admins` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `role` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `admins`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

CREATE TABLE IF NOT EXISTS `comments` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `reply_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `comment_text` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comments`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `comment_likes`
--

CREATE TABLE IF NOT EXISTS `comment_likes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `comment_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `comment_likes`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `communities`
--

CREATE TABLE IF NOT EXISTS `communities` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `creator_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `total_members` int(11) NOT NULL DEFAULT 0,
  `total_products` int(11) NOT NULL DEFAULT 0,
  `total_posts` int(11) NOT NULL DEFAULT 0,
  `price` decimal(10,2) DEFAULT NULL,
  `is_premium` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `communities`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `community_categories`
--

CREATE TABLE IF NOT EXISTS `community_categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `community_categories`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `community_files`
--

CREATE TABLE IF NOT EXISTS `community_files` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_principale` tinyint(1) NOT NULL DEFAULT 0,
  `url` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `cloudinary_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `community_files`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `community_memberships`
--

CREATE TABLE IF NOT EXISTS `community_memberships` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `community_memberships`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `email_verifications`
--

CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `favorite_posts`
--

CREATE TABLE IF NOT EXISTS `favorite_posts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `favorite_posts`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `follows`
--

CREATE TABLE IF NOT EXISTS `follows` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `follower_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `following_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `follows`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `labels`
--

CREATE TABLE IF NOT EXISTS `labels` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `content_type` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_vr` tinyint(1) NOT NULL DEFAULT 0,
  `vr_url` varchar(255) DEFAULT NULL,
  `publication_date` datetime NOT NULL,
  `is_visible_outside_community` tinyint(1) NOT NULL DEFAULT 0,
  `is_boosted` tinyint(1) NOT NULL DEFAULT 0,
  `sponsor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_category` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `hotel_nuitee_id` varchar(255) DEFAULT NULL,
  `visited_trace_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `posts`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `post_categories`
--

CREATE TABLE IF NOT EXISTS `post_categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `post_categories`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `post_files`
--

CREATE TABLE IF NOT EXISTS `post_files` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `post_files`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `post_likes`
--

CREATE TABLE IF NOT EXISTS `post_likes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `post_likes`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `post_shares`
--

CREATE TABLE IF NOT EXISTS `post_shares` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `post_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `share_text` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `post_shares`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE IF NOT EXISTS `products` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `price` decimal(10,2) DEFAULT NULL,
  `is_free` tinyint(1) NOT NULL DEFAULT 0,
  `total_commands` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `product_categories`
--

CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product_categories`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `product_files`
--

CREATE TABLE IF NOT EXISTS `product_files` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_video` tinyint(1) NOT NULL DEFAULT 0,
  `time` int(11) DEFAULT NULL,
  `cloudinary_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product_files`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `product_images`
--

CREATE TABLE IF NOT EXISTS `product_images` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_principal` tinyint(1) NOT NULL DEFAULT 0,
  `url` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `cloudinary_id` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `product_images`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `ratings`
--

CREATE TABLE IF NOT EXISTS `ratings` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `product_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `score` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `ratings`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `routes`
--

CREATE TABLE IF NOT EXISTS `routes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `is_live` tinyint(1) NOT NULL DEFAULT 0,
  `publish_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `creator_user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `routes`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `r_community_categories`
--

CREATE TABLE IF NOT EXISTS `r_community_categories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `community_category_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `r_community_categories`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `stories`
--

CREATE TABLE IF NOT EXISTS `stories` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `media_url` varchar(255) NOT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `caption` text DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `story_highlights`
--

CREATE TABLE IF NOT EXISTS `story_highlights` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `story_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `label_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `story_views`
--

CREATE TABLE IF NOT EXISTS `story_views` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `story_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `viewer_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `gmail` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `facebook_id` varchar(255) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `primary_identifier` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `cloudinary_image_public_id` varchar(255) DEFAULT NULL,
  `cloudinary_banner_public_id` varchar(255) DEFAULT NULL,
  `profile_description` text DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `total_followers` int(11) NOT NULL DEFAULT 0,
  `total_communities` int(11) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `total_following` int(11) NOT NULL DEFAULT 0 COMMENT 'Nombre d''utilisateurs que cet utilisateur suit.',
  `role` varchar(255) NOT NULL DEFAULT 'user' COMMENT 'Rôle global de l''utilisateur pour l''accès aux fonctionnalités administratives de l''API.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

-- Les insertions de cette table ont été déplacées vers la section
-- « Déchargement des données ordonné » plus bas afin de respecter les clefs étrangères.

-- --------------------------------------------------------

--
-- Structure de la table `visited_traces`
--

CREATE TABLE IF NOT EXISTS `visited_traces` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `route_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `longitude` decimal(10,8) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
 -- Déchargement des données ordonné (respect des clefs étrangères)
 --
 
 -- Table `community_categories`
 INSERT INTO `community_categories` (`id`, `name`, `image_url`, `cloudinary_public_id`, `created_at`, `updated_at`) VALUES
 ('7fb5246e-5290-419b-9ba9-3b8e58ea4d1c', 'Desert', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763136681/go-fez/images/kbtvikwwnsuupqpjiobm.jpg', 'go-fez/images/kbtvikwwnsuupqpjiobm', '2025-11-14 16:11:18', '2025-11-14 16:11:18'),
 ('cfeb5762-456e-4749-aed2-ae3192ac2432', 'Mountains', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763120153/go-fez/images/h5zmx8kbkpx3cvlsad0h.jpg', 'go-fez/images/h5zmx8kbkpx3cvlsad0h', '2025-11-14 11:35:52', '2025-11-14 16:13:49');
 
 -- Table `post_categories`
 INSERT INTO `post_categories` (`id`, `name`, `image_url`, `cloudinary_public_id`, `created_at`, `updated_at`) VALUES
 ('71620d20-eb75-41ed-a9e4-c4f1bcbe7055', 'Rest', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763740186/go-fez/images/bgf2l8k5g6yuomnwgi6h.jpg', 'go-fez/images/bgf2l8k5g6yuomnwgi6h', '2025-11-21 15:49:46', '2025-11-21 15:49:46'),
 ('88de2bad-0bb4-4570-ba08-21a2946ffe60', 'Restaurant', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763136121/go-fez/images/augwwmdfgry67k6pomwu.jpg', 'go-fez/images/augwwmdfgry67k6pomwu', '2025-11-14 16:01:58', '2025-11-14 16:01:58'),
 ('afd1d8ad-fa25-4b57-92e5-c7c5ca3837f0', 'hotel', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763062297/go-fez/images/suf3arhaneh1smynnyha.jpg', 'go-fez/images/suf3arhaneh1smynnyha', '2025-11-13 19:31:38', '2025-11-21 15:51:11');
 
 -- Table `product_categories`
 INSERT INTO `product_categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
 ('2a229c3c-c563-11f0-8830-c85b76905e9c', 'Electronique', '2025-11-19 17:16:39', '2025-11-19 17:16:39');
 
 -- Table `users`
 INSERT INTO `users` (`id`, `first_name`, `last_name`, `gmail`, `phone`, `google_id`, `facebook_id`, `provider`, `primary_identifier`, `password`, `profile_image`, `banner`, `cloudinary_image_public_id`, `cloudinary_banner_public_id`, `profile_description`, `country`, `total_followers`, `total_communities`, `is_verified`, `is_deleted`, `deleted_at`, `is_active`, `created_at`, `updated_at`, `total_following`, `role`) VALUES
 ('14d27e75-115d-4b14-85d9-2ec7cd9a7ce4', 'sola', 'ahmed', 'ahmedyassineelhaikidever@gmail.com', '0699885577', NULL, NULL, NULL, 'ahmedyassineelhaikidever@gmail.com', '$2b$10$B.dwaH54PF0DoTm3B.RpgOskh0xvXXYcOuDkUBR3lwJEYO/Yt1sSC', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 0, NULL, 1, '2025-11-09 03:50:35', '2025-11-09 03:51:40', 0, 'user'),
 ('2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'SOUMIYA', 'SOUM', 'kawtarhrayra@gmail.com', '0794676782', NULL, NULL, NULL, 'kawtarhrayra@gmail.com', '$2b$10$oko2Cd1sD2VV2ORw.KDsyefKU4g3i5YmCj3YnlvfQBpehn9NKtDOS', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 0, NULL, 1, '2025-11-14 12:02:42', '2025-11-17 11:40:32', 1, 'super-admin'),
 ('3b75c51d-7b4b-44d6-86c6-b7b98144c702', 'rajae', 'raji', 'kaoutharhraira@gmail.com', '0717071689', NULL, NULL, NULL, 'kaoutharhraira@gmail.com', '$2b$10$As1X93.0avXiMt67bY60P.X0qy25rMiJwwDcBFdTPq01kiUXDGRJS', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0, 1, 0, NULL, 1, '2025-11-14 12:06:56', '2025-11-17 11:40:32', 0, 'user'),
 ('a7fdaf6e-9ac0-496c-ac89-e24681feb297', 'Saad', 'Hamdouch', 'developmentdever@gmail.com', '0699554488', NULL, NULL, NULL, 'developmentdever@gmail.com', '$2b$10$B.dwaH54PF0DoTm3B.RpgOskh0xvXXYcOuDkUBR3lwJEYO/Yt1sSC', NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 0, NULL, 1, '2025-11-09 04:32:24', '2025-11-09 04:33:11', 0, 'user');
 
 -- Table `communities`
 INSERT INTO `communities` (`id`, `creator_user_id`, `name`, `description`, `is_verified`, `total_members`, `total_products`, `total_posts`, `price`, `is_premium`, `is_deleted`, `created_at`, `updated_at`) VALUES
 ('29419624-6773-4922-8599-cd72e4610067', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', 'Communauté Maroc', 'Espace d''échange', 0, 1, 14, 0, 150.00, 1, 0, '2025-11-17 12:35:23', '2025-11-20 14:28:36'),
 ('5d6bfb63-83f5-4289-831e-2d5507374b75', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', 'community name', 'Espace d''échange', 0, 1, 0, 2, 150.00, 1, 0, '2025-11-14 12:05:36', '2025-11-14 13:34:23');
 
 -- Table `routes`
 INSERT INTO `routes` (`id`, `community_id`, `is_live`, `publish_date`, `created_at`, `updated_at`, `creator_user_id`) VALUES
 ('e708c546-5c37-4396-a544-1c61e6d9f529', '29419624-6773-4922-8599-cd72e4610067', 0, '2025-11-01 10:00:00', '2025-11-24 11:11:18', '2025-11-24 11:13:22', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd');
 
 -- Table `community_files`
 INSERT INTO `community_files` (`id`, `community_id`, `is_principale`, `url`, `type`, `cloudinary_id`, `created_at`, `updated_at`) VALUES
 ('68b07ae6-9c19-4810-8d08-802c3ef9c513', '5d6bfb63-83f5-4289-831e-2d5507374b75', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763127266/go-fez/images/y5uwrt542hfhwyir2zdp.jpg', 'image/jpeg', 'go-fez/images/y5uwrt542hfhwyir2zdp', '2025-11-14 13:34:23', '2025-11-14 13:34:23'),
 ('6ad047df-d058-4ff7-830c-4e116dcd43e5', '5d6bfb63-83f5-4289-831e-2d5507374b75', 1, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763121930/go-fez/images/n04gjvbojrhqfvrhq1ir.jpg', 'image/jpeg', 'go-fez/images/n04gjvbojrhqfvrhq1ir', '2025-11-14 12:05:36', '2025-11-14 12:05:36');
 
 -- Table `community_memberships`
 INSERT INTO `community_memberships` (`id`, `community_id`, `user_id`, `created_at`, `updated_at`) VALUES
 ('243cce09-8384-4812-91b0-d5eb0dc9072e', '29419624-6773-4922-8599-cd72e4610067', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', '2025-11-17 12:35:23', '2025-11-17 12:35:23'),
 ('a28ec429-d870-436c-b998-940606d5bd1e', '5d6bfb63-83f5-4289-831e-2d5507374b75', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', '2025-11-14 12:05:36', '2025-11-14 12:05:36');
 
 -- Table `admins`
 INSERT INTO `admins` (`id`, `community_id`, `user_id`, `role`, `created_at`, `updated_at`) VALUES
 ('f8bda387-b3a5-44f9-8ae9-49e75eff7a1d', '29419624-6773-4922-8599-cd72e4610067', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', 'admin', '2025-11-17 12:35:23', '2025-11-17 12:35:23');
 
 -- Table `r_community_categories`
 INSERT INTO `r_community_categories` (`id`, `community_id`, `community_category_id`, `created_at`, `updated_at`) VALUES
 ('59dd0b3f-2d44-4d86-a7da-7518573a6e23', '5d6bfb63-83f5-4289-831e-2d5507374b75', 'cfeb5762-456e-4749-aed2-ae3192ac2432', '2025-11-14 12:05:36', '2025-11-14 12:05:36'),
 ('a9ee85ea-e22f-4e84-8b3d-02761566f62e', '29419624-6773-4922-8599-cd72e4610067', 'cfeb5762-456e-4749-aed2-ae3192ac2432', '2025-11-17 12:35:23', '2025-11-17 12:35:23');
 
 -- Table `products`
 INSERT INTO `products` (`id`, `type`, `category_id`, `community_id`, `user_id`, `title`, `description`, `rating`, `price`, `is_free`, `total_commands`, `created_at`, `updated_at`) VALUES
 ('1bc43af6-b653-46e5-9ca8-c7f39100fe1d', 'digital', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit', 'Description du produit avec tous les détails.', 0.00, 499.99, 0, 0, '2025-11-20 13:28:14', '2025-11-20 13:28:14'),
 ('25910f57-6ca8-4302-96fe-cfc94db00496', 'elec', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'PRODUCT modifie', 'Un produit numérique exclusif.', 2.00, 99.00, 0, 2, '2025-11-20 09:34:16', '2025-11-20 12:43:01'),
 ('398ce35f-c490-490c-8e40-9b1dddc43407', 'phusique', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit Minimal', 'Description du produit avec tous les détails.', 0.00, 10.00, 0, 0, '2025-11-20 13:38:49', '2025-11-20 13:38:49'),
 ('47bc371a-e524-4b57-84d5-27f82044ff46', 'digital', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit de Luxe', 'Description du produit avec tous les détails.', 0.00, 499.99, 0, 0, '2025-11-20 13:26:45', '2025-11-20 13:26:45'),
 ('495ef2cf-eba3-463d-a168-537a339879c9', NULL, NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Super Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 0.00, 0, 0, '2025-11-20 08:44:46', '2025-11-20 08:44:46'),
 ('4c7ee511-4d65-46b1-bb64-b96f75a6dc6f', 'digital', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit Gratuit', 'Description du produit avec tous les détails.', 0.00, 0.00, 1, 0, '2025-11-20 13:40:08', '2025-11-20 13:40:08'),
 ('5c174263-4d72-405c-822e-ab4e5779e369', 'elec', NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 100.00, 0, 0, '2025-11-20 09:32:29', '2025-11-20 09:32:29'),
 ('62955382-1cef-41e2-b33f-c509f6f18d6e', 'digital', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit', 'Description du produit avec tous les détails.', 2.00, 499.99, 0, 1, '2025-11-20 13:35:38', '2025-11-20 14:35:16'),
 ('85eda4b7-b04e-4f65-8eec-6b568994cb9f', 'digital', NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit Gratuit', 'Description du produit avec tous les détails.', 0.00, 0.00, 1, 0, '2025-11-20 13:59:38', '2025-11-20 13:59:38'),
 ('b01db4e0-3620-4d19-b5b5-c3c3bc7ba1dc', NULL, NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Super Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 0.00, 0, 0, '2025-11-19 16:18:14', '2025-11-19 16:18:14'),
 ('c10787e8-912e-40b6-937e-99d2e63b1b9e', 'elec', NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Super Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 100.00, 0, 0, '2025-11-20 09:30:02', '2025-11-20 09:30:02'),
 ('d0940403-d904-45af-8c0c-0ca7aa83bbc8', NULL, NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Super Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 0.00, 0, 0, '2025-11-20 08:54:33', '2025-11-20 08:54:33'),
 ('d7c18800-5ef9-4668-a014-6d2aa7a73f56', 'digital', '2a229c3c-c563-11f0-8830-c85b76905e9c', '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Produit', 'Description du produit avec tous les détails.', 0.00, 499.99, 0, 0, '2025-11-20 13:27:20', '2025-11-20 13:27:20'),
 ('edbd233b-e465-4021-9939-6646602de139', 'elec', NULL, '29419624-6773-4922-8599-cd72e4610067', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'Super Circuit Maroc', 'Un produit numérique exclusif.', 0.00, 100.00, 0, 0, '2025-11-20 09:22:11', '2025-11-20 09:22:11');
 
 -- Table `product_files`
 INSERT INTO `product_files` (`id`, `product_id`, `url`, `type`, `title`, `description`, `is_video`, `time`, `cloudinary_id`, `created_at`, `updated_at`) VALUES
 ('64521ab7-0366-4e85-8d28-6521d31505da', '47bc371a-e524-4b57-84d5-27f82044ff46', 'https://res.cloudinary.com/ddiqmvgxy/video/upload/v1763645206/go-fez/products/idx7yomx8u3q5t8qo3ps.mp4', 'audio/mp4', 'Enregistrement.m4a', NULL, 0, NULL, 'go-fez/products/idx7yomx8u3q5t8qo3ps', '2025-11-20 13:26:45', '2025-11-20 13:26:45'),
 ('a5a32c73-8830-4fc3-ab45-fc65714ecd6b', '62955382-1cef-41e2-b33f-c509f6f18d6e', 'https://res.cloudinary.com/ddiqmvgxy/video/upload/v1763645741/go-fez/products/rwtqg9gemikcxpzlzgjz.mp4', 'video/mp4', 'WhatsApp Vidéo 2025-09-18 à 20.05.00_2c86677a.mp4', NULL, 1, NULL, 'go-fez/products/rwtqg9gemikcxpzlzgjz', '2025-11-20 13:35:38', '2025-11-20 13:35:38'),
 ('bf063519-200f-4121-91f6-76c0940ad252', '1bc43af6-b653-46e5-9ca8-c7f39100fe1d', 'https://res.cloudinary.com/ddiqmvgxy/video/upload/v1763645297/go-fez/products/pzb25b69xlkelry8w4nc.mp4', 'audio/mp4', 'Enregistrement.m4a', NULL, 0, NULL, 'go-fez/products/pzb25b69xlkelry8w4nc', '2025-11-20 13:28:14', '2025-11-20 13:28:14'),
 ('fccd772d-5a35-4ac7-b806-ba52ba986945', 'd7c18800-5ef9-4668-a014-6d2aa7a73f56', 'https://res.cloudinary.com/ddiqmvgxy/video/upload/v1763645241/go-fez/products/ij60hqkfj5cazaajykv3.mp4', 'audio/mp4', 'Enregistrement.m4a', NULL, 0, NULL, 'go-fez/products/ij60hqkfj5cazaajykv3', '2025-11-20 13:27:20', '2025-11-20 13:27:20');
 
 -- Table `product_images`
 INSERT INTO `product_images` (`id`, `product_id`, `is_principal`, `url`, `type`, `cloudinary_id`, `created_at`, `updated_at`) VALUES
 ('06bc9d9d-0df6-4347-9f05-ea86f2b351bf', 'd0940403-d904-45af-8c0c-0ca7aa83bbc8', 1, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763628875/go-fez/images/zioajbnollsj6c6g4gbr.jpg', 'image/jpeg', 'go-fez/images/zioajbnollsj6c6g4gbr', '2025-11-20 08:54:33', '2025-11-20 08:54:33'),
 ('0d2e522d-8834-426b-a91f-0b4935fb4dc7', 'd7c18800-5ef9-4668-a014-6d2aa7a73f56', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645240/go-fez/products/drxsybqmwkqq5hzdp7vr.jpg', 'image/jpeg', 'go-fez/products/drxsybqmwkqq5hzdp7vr', '2025-11-20 13:27:20', '2025-11-20 13:27:20'),
 ('17eb35ca-e09f-4fba-969a-62becf04ebdd', 'c10787e8-912e-40b6-937e-99d2e63b1b9e', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763631005/go-fez/images/rlju7pozqmleflsmygw9.jpg', 'image/jpeg', 'go-fez/images/rlju7pozqmleflsmygw9', '2025-11-20 09:30:02', '2025-11-20 09:30:02'),
 ('3ddd7515-8780-45ba-b87e-74ce8dee61f2', '1bc43af6-b653-46e5-9ca8-c7f39100fe1d', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645295/go-fez/products/r5smcfj63taitnvt8oer.jpg', 'image/jpeg', 'go-fez/products/r5smcfj63taitnvt8oer', '2025-11-20 13:28:14', '2025-11-20 13:28:14'),
 ('6064cc4c-2ede-4b3c-b4d7-78826799e4ab', '62955382-1cef-41e2-b33f-c509f6f18d6e', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645741/go-fez/products/myvndhkbkzpe8gs6e1dp.png', 'image/png', 'go-fez/products/myvndhkbkzpe8gs6e1dp', '2025-11-20 13:35:38', '2025-11-20 13:35:38'),
 ('7e2b1d88-4a61-42f5-b2d4-92f8e08e47bb', 'd7c18800-5ef9-4668-a014-6d2aa7a73f56', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645241/go-fez/products/tkvmfhgrzcwbo6toc1kb.png', 'image/png', 'go-fez/products/tkvmfhgrzcwbo6toc1kb', '2025-11-20 13:27:20', '2025-11-20 13:27:20'),
 ('7ee4a740-47ce-488c-a6a7-2545a222abf1', '495ef2cf-eba3-463d-a168-537a339879c9', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763628288/go-fez/images/dregdmhtagbzd2mfuuvl.jpg', 'image/jpeg', 'go-fez/images/dregdmhtagbzd2mfuuvl', '2025-11-20 08:44:46', '2025-11-20 08:44:46'),
 ('c1421899-8891-4be8-9c93-9ea090d9a92c', '25910f57-6ca8-4302-96fe-cfc94db00496', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763632229/go-fez/images/zmatm6hqrqbkqbnionq5.jpg', 'image/jpeg', 'go-fez/images/zmatm6hqrqbkqbnionq5', '2025-11-20 09:50:27', '2025-11-20 09:50:27'),
 ('c52a7bd7-d8dc-4ba7-8e08-bd742962b860', 'edbd233b-e465-4021-9939-6646602de139', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763630533/go-fez/images/rgxbf1bmozi1tyuutcl9.jpg', 'image/jpeg', 'go-fez/images/rgxbf1bmozi1tyuutcl9', '2025-11-20 09:22:11', '2025-11-20 09:22:11'),
 ('ccabde1f-0971-4b82-b50c-3d1b21f98057', '47bc371a-e524-4b57-84d5-27f82044ff46', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645205/go-fez/products/l094fmb5mhgrs2te0avt.jpg', 'image/jpeg', 'go-fez/products/l094fmb5mhgrs2te0avt', '2025-11-20 13:26:45', '2025-11-20 13:26:45'),
 ('de078d35-1772-42d5-ac64-7d32aaa874b4', '5c174263-4d72-405c-822e-ab4e5779e369', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763631151/go-fez/images/z3mhkbyprak0lruvzafv.jpg', 'image/jpeg', 'go-fez/images/z3mhkbyprak0lruvzafv', '2025-11-20 09:32:29', '2025-11-20 09:32:29'),
 ('e7dc20b9-88ed-4639-9e53-31950d253143', 'b01db4e0-3620-4d19-b5b5-c3c3bc7ba1dc', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763569094/go-fez/images/xxeesvuldivtyg0pwkcq.jpg', 'image/jpeg', 'go-fez/images/xxeesvuldivtyg0pwkcq', '2025-11-19 16:18:14', '2025-11-19 16:18:14'),
 ('f524e2d8-2083-468d-adfb-81d0b8d2d724', '62955382-1cef-41e2-b33f-c509f6f18d6e', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645739/go-fez/products/cspdhto0vwoy94zaoujo.jpg', 'image/jpeg', 'go-fez/products/cspdhto0vwoy94zaoujo', '2025-11-20 13:35:38', '2025-11-20 13:35:38'),
 ('fbec4db7-d96e-4da6-b875-eb944e3be72e', '1bc43af6-b653-46e5-9ca8-c7f39100fe1d', 0, 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763645297/go-fez/products/k0fbh2slsaj4tpgweg7e.png', 'image/png', 'go-fez/products/k0fbh2slsaj4tpgweg7e', '2025-11-20 13:28:14', '2025-11-20 13:28:14');
 
 -- Table `ratings`
 INSERT INTO `ratings` (`id`, `product_id`, `user_id`, `score`, `created_at`, `updated_at`) VALUES
 ('9aee14e3-e0a5-4d02-9f7b-4fd95653a8d1', '62955382-1cef-41e2-b33f-c509f6f18d6e', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 2, '2025-11-20 14:34:41', '2025-11-20 14:34:41'),
 ('a5d7b2ad-32bb-4785-821e-163c2c1b3c46', '25910f57-6ca8-4302-96fe-cfc94db00496', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 2, '2025-11-20 10:55:35', '2025-11-20 10:56:09');
 
 -- Table `posts`
 INSERT INTO `posts` (`id`, `user_id`, `content_type`, `title`, `description`, `is_vr`, `vr_url`, `publication_date`, `is_visible_outside_community`, `is_boosted`, `sponsor_id`, `is_deleted`, `created_at`, `updated_at`, `community_id`, `post_category`, `hotel_nuitee_id`, `visited_trace_id`) VALUES
 ('40368a60-0ae9-4d47-a3af-896b5a80efc2', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', 'image', 'رحلة رائعة', 'Description MODIFIÉE', 0, NULL, '2025-11-14 12:43:09', 1, 0, NULL, 0, '2025-11-14 12:43:09', '2025-11-14 15:49:19', '5d6bfb63-83f5-4289-831e-2d5507374b75', 'afd1d8ad-fa25-4b57-92e5-c7c5ca3837f0', 'NUITEE_ID_456789', NULL),
 ('462a95ce-1947-49bb-bf34-d9777cdd1eaf', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:08:45', 1, 0, NULL, 0, '2025-11-21 14:08:45', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('612bf605-3608-46aa-b8c0-b0f221e3f469', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 15:38:13', 1, 0, NULL, 0, '2025-11-21 15:38:13', '2025-11-21 15:38:13', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('78099d50-2aa4-4c97-b6eb-a09e500c5bd3', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:17:00', 1, 0, NULL, 0, '2025-11-21 14:17:00', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('7c852d00-b7e7-4c93-b089-ef17007f123b', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Une aventure incroyable dans les montagnes de l’Atlas !', 'Quelques prises de notre dernière escapade. Les paysages étaient tout simplement magnifiques. Je recommande vivement d’y aller !', 0, NULL, '2025-11-14 12:42:32', 0, 0, NULL, 0, '2025-11-14 12:42:32', '2025-11-14 12:42:32', '5d6bfb63-83f5-4289-831e-2d5507374b75', 'afd1d8ad-fa25-4b57-92e5-c7c5ca3837f0', 'NUITEE_ID_456789', NULL),
 ('7f5e28b2-ed2c-49f1-8cfd-53c02d72fc62', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:20:18', 1, 0, NULL, 0, '2025-11-21 14:20:18', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('9ec8eff4-abaf-49bb-98d0-b84760e984cc', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:13:15', 1, 0, NULL, 0, '2025-11-21 14:13:15', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('a6d7093e-703f-47aa-aa09-c65c71bc23c0', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:18:19', 1, 0, NULL, 0, '2025-11-21 14:18:19', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL),
 ('b0745c8e-fde7-4f2b-8265-524c3d140664', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', 'image', 'Post sur un point visité', 'Ceci est un test de post attaché au point de tracé X.', 0, NULL, '2025-11-21 14:14:19', 1, 0, NULL, 0, '2025-11-21 14:14:19', '2025-11-21 15:26:20', '29419624-6773-4922-8599-cd72e4610067', '88de2bad-0bb4-4570-ba08-21a2946ffe60', NULL, NULL);
 
-- Table `post_files`
INSERT INTO `post_files` (`id`, `post_id`, `url`, `cloudinary_public_id`, `type`, `created_at`, `updated_at`) VALUES
('120f2583-634e-42f6-b0de-2ac021e81f00', '40368a60-0ae9-4d47-a3af-896b5a80efc2', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763135361/go-fez/images/amv2uu8g50l7x5szxxsl.jpg', 'go-fez/images/amv2uu8g50l7x5szxxsl', 'image', '2025-11-14 15:49:20', '2025-11-14 15:49:20'),
('1d60b811-6008-4a57-923b-3d1e427a9cf1', '9ec8eff4-abaf-49bb-98d0-b84760e984cc', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734395/go-fez/images/st0fl4qtvf8uk92anwam.jpg', 'go-fez/images/st0fl4qtvf8uk92anwam', 'image', '2025-11-21 14:13:15', '2025-11-21 14:13:15'),
('5f5b9b68-fcda-4c55-89ba-0cbdb7e5ae48', 'b0745c8e-fde7-4f2b-8265-524c3d140664', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734459/go-fez/images/uatgjtjpotihjv3bfwzh.jpg', 'go-fez/images/uatgjtjpotihjv3bfwzh', 'image', '2025-11-21 14:14:19', '2025-11-21 14:14:19'),
('602774a8-b4de-4249-a0f4-9cd94ff04360', '78099d50-2aa4-4c97-b6eb-a09e500c5bd3', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734620/go-fez/images/vrhq30swmhrkwwv57pge.jpg', 'go-fez/images/vrhq30swmhrkwwv57pge', 'image', '2025-11-21 14:17:00', '2025-11-21 14:17:00'),
('8a37d72e-f6ce-45cf-8eb8-692f49fbfbc0', '462a95ce-1947-49bb-bf34-d9777cdd1eaf', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734123/go-fez/images/bal1mujcpz6hqd3dfjjt.jpg', 'go-fez/images/bal1mujcpz6hqd3dfjjt', 'image', '2025-11-21 14:08:45', '2025-11-21 14:08:45'),
('9ab7fb87-c9ee-4b75-97f4-068ab4fea6a2', 'a6d7093e-703f-47aa-aa09-c65c71bc23c0', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734699/go-fez/images/g5jxism9scxotelaqkt5.jpg', 'go-fez/images/g5jxism9scxotelaqkt5', 'image', '2025-11-21 14:18:19', '2025-11-21 14:18:19'),
('ec6f6f2f-6a5a-4b89-ad12-1d9cbcc67dbf', '7f5e28b2-ed2c-49f1-8cfd-53c02d72fc62', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763734819/go-fez/images/zl7qbtrthq1xb1ubagjz.jpg', 'go-fez/images/zl7qbtrthq1xb1ubagjz', 'image', '2025-11-21 14:20:18', '2025-11-21 14:20:18'),
('ed4a6983-eba2-4e34-afa2-728902a5036b', '612bf605-3608-46aa-b8c0-b0f221e3f469', 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1763739493/go-fez/images/tiromo3qb1lctxacmqhr.jpg', 'go-fez/images/tiromo3qb1lctxacmqhr', 'image', '2025-11-21 15:38:13', '2025-11-21 15:38:13');

-- Table `post_likes`
INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`, `updated_at`) VALUES
('f7020d25-005b-4454-8562-b95fb9c98efb', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '2025-11-14 15:44:36', '2025-11-14 15:44:36');

-- Table `post_shares`
INSERT INTO `post_shares` (`id`, `post_id`, `user_id`, `share_text`, `created_at`, `updated_at`) VALUES
('559f37fd-b4e6-4a36-b701-c79657159e84', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', NULL, '2025-11-19 10:21:29', '2025-11-19 10:21:29'),
('9b3d2870-7d23-4c6f-90bb-e9b31d98f0c3', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', NULL, '2025-11-14 16:00:55', '2025-11-14 16:00:55'),
('9f2821e9-5e31-47e4-9e11-91e0c633bb0b', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', NULL, '2025-11-19 10:21:21', '2025-11-19 10:21:21');

-- Table `favorite_posts`
INSERT INTO `favorite_posts` (`id`, `post_id`, `user_id`, `created_at`, `updated_at`) VALUES
('8b864082-cbe3-4d26-acf6-f004e640fdfb', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '2025-11-19 10:21:45', '2025-11-19 10:21:45');

-- Table `comments`
INSERT INTO `comments` (`id`, `post_id`, `user_id`, `reply_id`, `comment_text`, `created_at`, `updated_at`, `is_deleted`) VALUES
('515d22f6-5aaf-4308-910f-b64a3208ed15', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '8385feb2-a036-4f8f-91b4-523382856601', 'Ceci est le texte de ma réponse modifié via Postman.', '2025-11-14 15:54:37', '2025-11-19 10:12:54', 0),
('8385feb2-a036-4f8f-91b4-523382856601', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', NULL, 'Les paysages des montagnes de l''Atlas sont en effet à couper le souffle ! Une expérience qui en vaut vraiment la peine.', '2025-11-14 15:51:56', '2025-11-14 15:51:56', 0),
('c7276453-0c3a-45bf-8e09-52d06e19e5cc', '40368a60-0ae9-4d47-a3af-896b5a80efc2', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', NULL, ' j''adore cet expérience .', '2025-11-19 09:34:39', '2025-11-19 10:47:10', 0);

-- Table `comment_likes`
INSERT INTO `comment_likes` (`id`, `comment_id`, `user_id`, `created_at`, `updated_at`) VALUES
('78db9c78-4765-467d-bd6b-27ed485fa87f', '8385feb2-a036-4f8f-91b4-523382856601', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '2025-11-14 15:59:19', '2025-11-14 15:59:19'),
('7f411e4b-c3ad-4540-9c18-5ca68e7bd5d5', 'c7276453-0c3a-45bf-8e09-52d06e19e5cc', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '2025-11-19 09:40:07', '2025-11-19 09:40:07');

-- Table `follows`
INSERT INTO `follows` (`id`, `follower_id`, `following_id`, `created_at`, `updated_at`) VALUES
('df59c616-8b1b-499e-bec4-a58db2a1747d', '2e6654e5-fb62-4ab2-b676-3f0b79d835dd', '3b75c51d-7b4b-44d6-86c6-b7b98144c702', '2025-11-17 11:40:32', '2025-11-17 11:40:32');

 -- Index pour les tables déchargées
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admins_userId_communityId_unique` (`community_id`,`user_id`),
  ADD UNIQUE KEY `admin_community_user_unique` (`community_id`,`user_id`),
  ADD KEY `admin_community_idx` (`community_id`),
  ADD KEY `admin_user_idx` (`user_id`);

--
-- Index pour la table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `reply_id` (`reply_id`);

--
-- Index pour la table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_comment_like` (`user_id`,`comment_id`),
  ADD KEY `comment_id` (`comment_id`);

--
-- Index pour la table `communities`
--
ALTER TABLE `communities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creator_user_id` (`creator_user_id`);

--
-- Index pour la table `community_categories`
--
ALTER TABLE `community_categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `community_files`
--
ALTER TABLE `community_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `community_id` (`community_id`);

--
-- Index pour la table `community_memberships`
--
ALTER TABLE `community_memberships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `community_memberships_communityId_userId_unique` (`community_id`,`user_id`),
  ADD UNIQUE KEY `cm_community_user_unique` (`community_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `favorite_posts`
--
ALTER TABLE `favorite_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_favorite` (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Index pour la table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `follows_followingId_followerId_unique` (`follower_id`,`following_id`),
  ADD UNIQUE KEY `follow_follower_following_unique` (`follower_id`,`following_id`),
  ADD KEY `follow_follower_idx` (`follower_id`),
  ADD KEY `follow_following_idx` (`following_id`);

--
-- Index pour la table `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `post_category` (`post_category`),
  ADD KEY `visited_trace_id` (`visited_trace_id`);

--
-- Index pour la table `post_categories`
--
ALTER TABLE `post_categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `post_files`
--
ALTER TABLE `post_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`);

--
-- Index pour la table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_like` (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Index pour la table `post_shares`
--
ALTER TABLE `post_shares`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `community_id` (`community_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `product_files`
--
ALTER TABLE `product_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ratings_product_id_user_id` (`product_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `routes`
--
ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `routes_creator_user_id_foreign_idx` (`creator_user_id`),
  ADD KEY `community_id` (`community_id`);

--
-- Index pour la table `r_community_categories`
--
ALTER TABLE `r_community_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `r_community_categories_communityCategoryId_communityId_unique` (`community_id`,`community_category_id`),
  ADD UNIQUE KEY `ccr_community_category_unique` (`community_id`,`community_category_id`),
  ADD KEY `community_category_id` (`community_category_id`);

--
-- Index pour la table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `story_highlights`
--
ALTER TABLE `story_highlights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `story_id` (`story_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `label_id` (`label_id`);

--
-- Index pour la table `story_views`
--
ALTER TABLE `story_views`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_story_viewer` (`story_id`,`viewer_id`),
  ADD KEY `viewer_id` (`viewer_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `visited_traces`
--
ALTER TABLE `visited_traces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `route_id` (`route_id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_10` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `admins_ibfk_9` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_25` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_26` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_27` FOREIGN KEY (`reply_id`) REFERENCES `comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_17` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_18` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `communities`
--
ALTER TABLE `communities`
  ADD CONSTRAINT `communities_ibfk_1` FOREIGN KEY (`creator_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `community_files`
--
ALTER TABLE `community_files`
  ADD CONSTRAINT `community_files_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `community_memberships`
--
ALTER TABLE `community_memberships`
  ADD CONSTRAINT `community_memberships_ibfk_11` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `community_memberships_ibfk_12` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `favorite_posts`
--
ALTER TABLE `favorite_posts`
  ADD CONSTRAINT `favorite_posts_ibfk_17` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `favorite_posts_ibfk_18` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_16` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `posts_ibfk_17` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `posts_ibfk_18` FOREIGN KEY (`post_category`) REFERENCES `post_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `posts_ibfk_19` FOREIGN KEY (`visited_trace_id`) REFERENCES `visited_traces` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `post_files`
--
ALTER TABLE `post_files`
  ADD CONSTRAINT `post_files_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_17` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_18` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `post_shares`
--
ALTER TABLE `post_shares`
  ADD CONSTRAINT `post_shares_ibfk_17` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `post_shares_ibfk_18` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_13` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_14` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_15` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `product_files`
--
ALTER TABLE `product_files`
  ADD CONSTRAINT `product_files_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `routes`
--
ALTER TABLE `routes`
  ADD CONSTRAINT `routes_creator_user_id_foreign_idx` FOREIGN KEY (`creator_user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `r_community_categories`
--
ALTER TABLE `r_community_categories`
  ADD CONSTRAINT `r_community_categories_ibfk_11` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `r_community_categories_ibfk_12` FOREIGN KEY (`community_category_id`) REFERENCES `community_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `stories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `story_highlights`
--
ALTER TABLE `story_highlights`
  ADD CONSTRAINT `story_highlights_ibfk_25` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `story_highlights_ibfk_26` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `story_highlights_ibfk_27` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `story_views`
--
ALTER TABLE `story_views`
  ADD CONSTRAINT `story_views_ibfk_17` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `story_views_ibfk_18` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `visited_traces`
--
ALTER TABLE `visited_traces`
  ADD CONSTRAINT `visited_traces_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
