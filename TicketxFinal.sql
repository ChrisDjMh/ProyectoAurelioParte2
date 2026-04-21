-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2026 at 04:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ticketx`
--

-- --------------------------------------------------------

--
-- Table structure for table `administradores`
--

CREATE TABLE `administradores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `administradores`
--

INSERT INTO `administradores` (`id`, `nombre`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Admin Principal', 'admin@gmail.com', 'admin1234', '2026-04-09 06:22:30', '2026-04-10 10:41:06');

-- --------------------------------------------------------

--
-- Table structure for table `boletos`
--

CREATE TABLE `boletos` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `asiento` varchar(20) NOT NULL,
  `codigo_qr` varchar(100) NOT NULL,
  `precio_final` decimal(10,2) NOT NULL,
  `estado` enum('creado','disponible','reservado','pagado','usado','cancelado') NOT NULL DEFAULT 'creado',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `usado_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `boletos`
--

INSERT INTO `boletos` (`id`, `orden_id`, `evento_id`, `asiento`, `codigo_qr`, `precio_final`, `estado`, `created_at`, `updated_at`, `usado_at`) VALUES
(210, 99, 47, 'Backstage-F-1', 'QR-99-Backstage-F-1', 1500.00, 'pagado', '2026-04-17 19:35:00', '2026-04-17 19:35:11', '0000-00-00 00:00:00'),
(211, 99, 47, 'Backstage-E-1', 'QR-99-Backstage-E-1', 1500.00, 'pagado', '2026-04-17 19:35:00', '2026-04-17 19:35:11', '0000-00-00 00:00:00'),
(212, 100, 6, 'General-A-10', 'QR-100-General-A-10', 67.00, 'pagado', '2026-04-17 19:57:40', '2026-04-17 19:57:52', NULL),
(213, 100, 6, 'General-A-11', 'QR-100-General-A-11', 67.00, 'pagado', '2026-04-17 19:57:40', '2026-04-17 19:57:52', NULL),
(214, 100, 6, 'General-A-12', 'QR-100-General-A-12', 67.00, 'pagado', '2026-04-17 19:57:40', '2026-04-17 19:57:52', NULL),
(215, 101, 2, 'General-III-C', 'QR-101-General-III-C', 1500.00, 'pagado', '2026-04-17 20:04:35', '2026-04-17 20:04:55', NULL),
(216, 102, 68, 'General-VI-i', 'QR-102-General-VI-i', 100.00, 'pagado', '2026-04-17 20:12:54', '2026-04-17 20:13:03', NULL),
(217, 103, 52, 'General-BB-1', 'QR-103-General-BB-1', 2200.00, 'pagado', '2026-04-17 20:14:40', '2026-04-17 20:14:51', NULL),
(218, 103, 52, 'General-CC-1', 'QR-103-General-CC-1', 2200.00, 'pagado', '2026-04-17 20:14:40', '2026-04-17 20:14:51', NULL),
(219, 103, 52, 'General-DD-1', 'QR-103-General-DD-1', 2200.00, 'pagado', '2026-04-17 20:14:40', '2026-04-17 20:14:51', NULL),
(220, 103, 52, 'General-EE-2', 'QR-103-General-EE-2', 2200.00, 'pagado', '2026-04-17 20:14:40', '2026-04-17 20:14:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contadores`
--

CREATE TABLE `contadores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contadores`
--

INSERT INTO `contadores` (`id`, `nombre`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Juan Pérez', 'jperez@gmail.com', 'conta1234', '2026-04-09 06:22:30', '2026-04-14 00:28:04');

-- --------------------------------------------------------

--
-- Table structure for table `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `organizador_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` datetime NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `imagen` varchar(255) DEFAULT NULL,
  `imagen_banner` varchar(255) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT 'Otros',
  `estado` enum('borrador','publicado','cancelado','finalizado') NOT NULL DEFAULT 'borrador',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `seatsio_event_key` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `eventos`
--

INSERT INTO `eventos` (`id`, `organizador_id`, `titulo`, `descripcion`, `fecha`, `ubicacion`, `capacidad`, `precio`, `imagen`, `imagen_banner`, `categoria`, `estado`, `created_at`, `updated_at`, `seatsio_event_key`) VALUES
(1, 1, 'AlphaCon 2026', 'Convención de tecnología en SLRC.', '2026-10-08 10:00:00', 'San Luis Río Colorado', 200, 150.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgVtPirMbV2E1nQTkaxoRLlsDphxje2pf-0w&s', 'https://img.mipon.org/wp-content/uploads/2022/02/17070216/anime-japan2022.webp', 'Entretenimiento', 'publicado', '2026-04-09 06:22:30', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(2, 1, 'GUTS WORLD TOUR', 'Guts World Tour fue la segunda gira musical de la cantante y compositora estadounidense Olivia Rodrigo, con el fin de promocionar su segundo álbum de estudio Guts (2023).', '2026-04-09 09:18:49', 'Mexicali', 1000, 1500.00, 'https://m.media-amazon.com/images/I/61yabeAQRQL._AC_UF894,1000_QL80_.jpg', 'https://wallpaperswide.com/download/olivia_rodrigo_pink_singer_celebrity_girl_famous-wallpaper-3840x2560.jpg', 'Musica', 'publicado', '2026-04-09 00:20:56', '2026-04-14 11:21:30', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(4, 1, 'Resident4', 'eeeeeeeeeeeeeeeeeeee', '2026-04-17 18:07:00', 'San Luis RC', 5000, 250.00, 'https://i.pinimg.com/736x/28/c0/0d/28c00d2320e34fbc09d323d06976d5b9.jpg', 'https://wallpapercave.com/wp/wp12116684.jpg', 'Entretenimiento', 'publicado', '2026-04-09 14:57:21', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(5, 1, 'Boletos para Tame Impala', '17 Abril 2026 en San Luis Rio Colorado.\nTame Impala es el proyecto de música psicodélica del multiinstrumentista australiano Kevin Parker.​ En el estudio de grabación, Parker compone, graba, interpreta y produce toda la música del proyecto.', '2026-04-17 18:00:00', 'San Luis Rio Colorado', 2500, 750.00, 'https://indierocks.sfo3.cdn.digitaloceanspaces.com/wp-content/uploads/bfi_thumb/Tame-Impala_2019_-64qgbletwrglqomhxw6hmf5u1ngxnicoe82tlv94rc1nvk5zji8bdngx4sizb4.jpg', 'https://www.rockaxis.com/img/newsList/1288760.jpg', 'Musica', 'publicado', '2026-04-09 15:43:40', '2026-04-14 15:38:57', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(6, 4, '676767', '.....................', '2026-04-24 18:07:00', 'slrc', 67, 67.00, 'https://i.etsystatic.com/7973668/r/il/561095/7413318207/il_570xN.7413318207_njx7.jpg', 'https://bostonglobe-prod.cdn.arcpublishing.com/resizer/v2/YJE4WYYT6NF7ZBFJFDLPBG7P4E.jpg?auth=ce3b250e27bfc7e6d26ebce2f1e3d03b2251139afb808ac1897ac0d28b16efa8&width=1440', 'Entretenimiento', 'publicado', '2026-04-10 18:50:01', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(47, 1, 'Sabrina Carpenter - Short n\' Sweet Tour', 'Disfruta del increíble tour de Sabrina cantando todos sus éxitos en vivo con una producción espectacular.', '2026-06-15 20:00:00', 'Teatro Río Colorado', 800, 1500.00, 'https://i.ytimg.com/vi/GW2Lxg8emhA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA3Bx-e2EMFOhRX6YG1KUqX8zfkkQ', 'https://www.rollingstone.com/wp-content/uploads/2024/09/SabrinaCarpenter-00055.jpg?w=1581&h=1054&crop=1', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(48, 2, 'Taylor Swift - The Eras Tour', 'El concierto más esperado llega a la región en formato acústico e íntimo.', '2026-07-10 19:30:00', 'Auditorio del Estado, Mexicali', 1000, 2500.00, 'https://i.pinimg.com/736x/52/92/78/529278c90d540436b02a7c991d65c540.jpg', 'https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/88477c99-c357-4758-a37e-b1b750215b2f/compose?aspectRatio=1.78&format=webp&width=1200', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(49, 3, 'Bad Bunny - Un Verano Sin Ti 2.0', 'El conejo malo regresa para poner a bailar a todos con un show íntimo.', '2026-08-05 21:00:00', 'Salón de Eventos FEX', 900, 1800.00, 'https://graziamagazine.com/es/wp-content/uploads/sites/12/2025/12/Bad-Bunny-artista-mas-escuchado-Spotify-2025.jpg', 'https://bucket-tnq5c9.s3.amazonaws.com/wp-content/uploads/2022/12/17214657/badbunnyunverano1.jpeg', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(50, 4, 'Kenia Os - K de Karma Tour', 'Kenia Os en vivo presentando su nuevo álbum en un ambiente exclusivo.', '2026-05-20 20:00:00', 'Foro Cultural SLRC', 500, 800.00, 'https://lacronicadehoy-lacronicadehoy-prod.web.arc-cdn.net/resizer/v2/J23RALOP2VC5BF5TRI73R4ZR7U.png?auth=dd887b75eb2e08c88943948061ef4bc4762250c1e304ca673e729a747e0ba6bd&width=800&height=533', 'https://estamosalaire.com/wp-content/archivos/2026/02/kenia-os-k-de-karma-1024x576.jpg', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(51, 1, 'Peso Pluma - Éxodo Tour', 'Los mejores corridos tumbados en vivo. La Doble P rompiendo escenarios.', '2026-09-12 22:00:00', 'Foro Independencia, Mexicali', 750, 1200.00, 'https://www.infobae.com/resizer/v2/LHQS3FBYGNAGFOSPOSQT4J6XV4.jpg?auth=6e7515821dfd617313e24072b18f49dee041f19cf5a7c2215720464d276e6e63&smart=true&width=1200&height=1200&quality=85', 'https://asisucedeleon.mx/wp-content/uploads/2024/07/Exodo.jpg', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(52, 2, 'Dua Lipa - Radical Optimism', 'Prepárate para bailar toda la noche en un set especial y cercano.', '2026-10-01 20:30:00', 'Auditorio Municipal', 850, 2200.00, 'https://universalplus.com/files/news/386966104.jpg', 'https://i0.wp.com/celebriteen.com.mx/wp-content/uploads/2025/04/DuaLipa-RadicalOptimismToour-DavidBlack.jpg?fit=1600%2C1067&ssl=1', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(53, 3, 'The Weeknd - After Hours', 'Una experiencia inmersiva con luces de estadio adaptada a foro cerrado.', '2026-11-15 21:00:00', 'Salón Social SLRC', 950, 2800.00, 'https://m.media-amazon.com/images/I/61zmGiUSX0L._AC_UF1000,1000_QL80_.jpg', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1920&auto=format&fit=crop', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(55, 1, 'Billie Eilish - Hit Me Hard', 'Un concierto íntimo pero poderoso con la ganadora de múltiples Grammys.', '2026-08-20 20:00:00', 'Foro Universitario Mexicali', 800, 1900.00, 'https://media.vogue.mx/photos/66491c4bd03d348b54f9bce4/1:1/w_2000,h_2000,c_limit/billie-eilish-tenis-chunky-bermudas.jpg', 'https://www.revistameta.com.ar/wp-content/uploads/2024/07/billie-album-announce-l.jpg', 'Musica', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(57, 3, 'Boxeo: Canelo Álvarez vs Retador', 'Apoya al talento nacional en esta función de box de campeonato.', '2026-09-16 19:00:00', 'Gimnasio Municipal SLRC', 900, 300.00, 'https://images.ctfassets.net/4cd45et68cgf/7knSD0Ncgn9Md53PfndzxH/c2b5e8be5999eba22ec5045e2d072315/image__8_.png?w=2000', 'https://i.ytimg.com/vi/PfmnBvQKnkM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBXLiU-grpcQ8os8rseUaCGQFI8aw', 'Deportes', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(60, 2, 'Exhibición de Motocross', 'Acrobacias extremas en un circuito cerrado y controlado.', '2026-08-12 19:00:00', 'Pista Local SLRC', 700, 400.00, 'https://eu.riskracing.com/cdn/shop/articles/a81096e52e20abb188189b2878a3759e_1600x.jpg?v=1623175387', 'https://s7g10.scene7.com/is/image/ktm/GASGAS-motocross-mc-450f-action-image-1?wid=1200&dpr=off', 'Deportes', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(63, 1, 'Cirque du Soleil - Función Especial', 'Acrobacias, arte visual, música en vivo y magia en formato reducido.', '2026-11-05 20:00:00', 'Foro de Artes Mexicali', 800, 1500.00, 'https://sibaritalarevista.com/wp-content/uploads/2024/09/teatro-publico.png', 'https://sibaritalarevista.com/wp-content/uploads/2024/09/teatro-publico.png', 'Entretenimiento', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'f043f9e9-5549-4cc8-b71c-a932fb48e2fa'),
(65, 3, 'El Cascanueces - Ballet Mágico', 'Un clásico de invierno interpretado por la academia local.', '2026-12-10 19:00:00', 'Teatro Río Colorado', 800, 300.00, 'https://m.media-amazon.com/images/I/71Z0n1QA9uL._AC_UF1000,1000_QL80_.jpg', 'https://balletdekiev.com/wp-content/uploads/2024/02/General_cascanueces_24_horizontal_2-scaled.jpg', 'Entretenimiento', 'publicado', '2026-04-12 14:51:53', '2026-04-14 15:38:57', 'af09232e-a38d-4f11-b8c5-68b5ca87d724'),
(67, 1, 'Sabrina Man Best Friend Tour', 'Sabrina presentara su nuevo album en vivo.', '2026-04-22 20:30:00', 'San Luis Rio Colorado', 600, 1500.00, 'https://static.eldiario.es/clip/c90bd40d-f8de-4aea-94a0-49ac7600096f_16-9-discover-aspect-ratio_default_1124738.jpg', 'https://media.pitchfork.com/photos/6849e175cbfa215d84092588/16:9/w_1280,c_limit/Sabrina-Carpenter-Mans-Best-Friend.jpeg', 'Musica', 'publicado', '2026-04-12 16:31:37', '2026-04-14 15:38:57', 'bd739edf-e059-4c33-88e2-2e993637f455'),
(68, 1, 'Olivia New Album', 'Peruuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu', '2026-04-18 21:10:00', 'San Luis', 67, 100.00, 'https://cdn-3.expansion.mx/1c/7e/8bed4aa54c479fcc2ec8998527b9/olivia-rodrigo.jpg', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjcpK1Rbll6U3aFTFMtmdezfTx2tf084zGrg&s', 'Musica', 'publicado', '2026-04-17 20:11:36', '2026-04-17 20:12:11', 'af09232e-a38d-4f11-b8c5-68b5ca87d724');

-- --------------------------------------------------------

--
-- Table structure for table `ordenes`
--

CREATE TABLE `ordenes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente',
  `fecha_orden` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stripe_session_id` varchar(200) NOT NULL,
  `stripe_payment_intent_id` varchar(200) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `moneda` varchar(10) NOT NULL,
  `expira_en` timestamp NULL DEFAULT NULL,
  `hold_token` varchar(255) DEFAULT NULL,
  `evento_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ordenes`
--

INSERT INTO `ordenes` (`id`, `usuario_id`, `total`, `estado`, `fecha_orden`, `created_at`, `updated_at`, `stripe_session_id`, `stripe_payment_intent_id`, `monto`, `moneda`, `expira_en`, `hold_token`, `evento_id`) VALUES
(99, 5, 3000.00, 'confirmada', '2026-04-17 19:35:00', '2026-04-17 19:35:00', '2026-04-17 19:35:11', '', '', 0.00, '', NULL, NULL, 47),
(100, 5, 201.00, 'confirmada', '2026-04-17 19:57:40', '2026-04-17 19:57:40', '2026-04-17 19:57:52', '', '', 0.00, '', NULL, NULL, 6),
(101, 5, 1500.00, 'confirmada', '2026-04-17 20:04:35', '2026-04-17 20:04:35', '2026-04-17 20:04:55', '', '', 0.00, '', NULL, NULL, 2),
(102, 5, 100.00, 'confirmada', '2026-04-17 20:12:54', '2026-04-17 20:12:54', '2026-04-17 20:13:03', '', '', 0.00, '', NULL, NULL, 68),
(103, 5, 8800.00, 'confirmada', '2026-04-17 20:14:40', '2026-04-17 20:14:40', '2026-04-17 20:14:51', '', '', 0.00, '', NULL, NULL, 52);

-- --------------------------------------------------------

--
-- Table structure for table `organizadores`
--

CREATE TABLE `organizadores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 0,
  `telefono` varchar(20) NOT NULL,
  `negocio` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `codigoActivacion` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organizadores`
--

INSERT INTO `organizadores` (`id`, `nombre`, `email`, `password`, `estado`, `telefono`, `negocio`, `descripcion`, `codigoActivacion`, `created_at`, `updated_at`) VALUES
(1, 'María González', 'empresa@gmail.com', 'alphacon1234', 1, '+525512345678', 'Empresa Alpha', 'Organización de eventos de tecnología e innovación.', 'ACT-987654', '2026-04-09 06:22:30', '2026-04-09 14:31:08'),
(2, 'rick', 'rick@gmail.com', '12345678', 1, '+52 6531364164', 'utslrc', NULL, NULL, '2026-04-10 18:38:50', '2026-04-10 18:46:00'),
(3, 'Organizador Fernando', 'nando@gmail.com', '12345678', 1, '+526531364167', 'UTSLRC', NULL, NULL, '2026-04-10 18:43:46', '2026-04-10 18:46:00'),
(4, '67', '67@gmail.com', '12345678', 1, '+526531364267', '67', NULL, NULL, '2026-04-10 18:45:17', '2026-04-10 18:46:02');

-- --------------------------------------------------------

--
-- Table structure for table `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `metodo` enum('stripe','paypal','transferencia','efectivo') NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado','reembolsado') NOT NULL DEFAULT 'pendiente',
  `referencia` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pagos`
--

INSERT INTO `pagos` (`id`, `orden_id`, `metodo`, `estado`, `referencia`, `created_at`, `updated_at`, `stripe_payment_intent_id`) VALUES
(76, 99, 'stripe', 'aprobado', 'pi_3TNOimBqQIXrhZR42UrY9D3Y', '2026-04-17 19:35:11', '2026-04-17 19:35:11', NULL),
(77, 100, 'stripe', 'aprobado', 'pi_3TNP4iBqQIXrhZR409cdxtjl', '2026-04-17 19:57:52', '2026-04-17 19:57:52', NULL),
(78, 101, 'stripe', 'aprobado', 'pi_3TNPBOBqQIXrhZR40PxfiNxp', '2026-04-17 20:04:55', '2026-04-17 20:04:55', NULL),
(79, 102, 'stripe', 'aprobado', 'pi_3TNPJSBqQIXrhZR41kIKzLPe', '2026-04-17 20:13:03', '2026-04-17 20:13:03', NULL),
(80, 103, 'stripe', 'aprobado', 'pi_3TNPLABqQIXrhZR41UIyoEtP', '2026-04-17 20:14:51', '2026-04-17 20:14:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `stripe_webhook_events`
--

CREATE TABLE `stripe_webhook_events` (
  `id` int(11) NOT NULL,
  `event_id` varchar(200) NOT NULL COMMENT 'ID único del evento Stripe',
  `event_type` varchar(100) NOT NULL,
  `orden_id` int(11) DEFAULT NULL,
  `procesado` tinyint(1) NOT NULL DEFAULT 0,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stripe_webhook_events`
--

INSERT INTO `stripe_webhook_events` (`id`, `event_id`, `event_type`, `orden_id`, `procesado`, `payload`, `created_at`) VALUES
(1, 'evt_3TN5XCBqQIXrhZR43wzEGt8E', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:05:45'),
(2, 'evt_3TN5XCBqQIXrhZR435GmMxLT', 'payment_intent.succeeded', 1, 1, NULL, '2026-04-16 23:05:58'),
(3, 'evt_3TN5XCBqQIXrhZR433owqLyd', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:06:56'),
(4, 'evt_3TN5XCBqQIXrhZR43GGwyI9Y', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:06:56'),
(5, 'evt_3TN5hnBqQIXrhZR40lp1sI5p', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:16:42'),
(6, 'evt_3TN5hnBqQIXrhZR40DytUrac', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:16:52'),
(7, 'evt_3TN5hnBqQIXrhZR40fGb6a5A', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:16:52'),
(8, 'evt_3TN5hnBqQIXrhZR40LdFQ6RF', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:16:55'),
(9, 'evt_3TN5kWBqQIXrhZR42Gvgy5yE', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:19:31'),
(10, 'evt_3TN5kWBqQIXrhZR42pTVZQgT', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:19:43'),
(11, 'evt_3TN5kWBqQIXrhZR42TXiMTP9', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:19:43'),
(12, 'evt_3TN5kWBqQIXrhZR42wCzunI5', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:19:46'),
(13, 'evt_3TN5ulBqQIXrhZR41Jo6AqSv', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:30:07'),
(14, 'evt_3TN5ulBqQIXrhZR41WFAjV63', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:30:18'),
(15, 'evt_3TN5ulBqQIXrhZR41ZiOLQbR', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:30:18'),
(16, 'evt_3TN5ulBqQIXrhZR410mfQNAw', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:30:21'),
(17, 'evt_3TN5vzBqQIXrhZR40tcHqCKE', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:31:22'),
(18, 'evt_3TN5vzBqQIXrhZR40rE6OTES', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:31:33'),
(19, 'evt_3TN5vzBqQIXrhZR40moK5cA0', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:31:33'),
(20, 'evt_3TN5vzBqQIXrhZR40t21NRwb', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:31:35'),
(21, 'evt_3TN5wKBqQIXrhZR42RdDSRHI', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:31:43'),
(22, 'evt_3TN634BqQIXrhZR41SRnMZh6', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:38:41'),
(23, 'evt_3TN634BqQIXrhZR41i86RpNJ', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:38:50'),
(24, 'evt_3TN634BqQIXrhZR41jNaqDzt', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:38:51'),
(25, 'evt_3TN634BqQIXrhZR4142k8jDq', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:38:53'),
(26, 'evt_3TN6EFBqQIXrhZR43M9Tl4LD', 'payment_intent.created', NULL, 0, NULL, '2026-04-16 23:50:14'),
(27, 'evt_3TN6EFBqQIXrhZR439ScVCm5', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-16 23:50:25'),
(28, 'evt_3TN6EFBqQIXrhZR43VLRcP5b', 'charge.succeeded', NULL, 0, NULL, '2026-04-16 23:50:25'),
(29, 'evt_3TN6EFBqQIXrhZR43ZiQ2K1v', 'charge.updated', NULL, 0, NULL, '2026-04-16 23:50:27'),
(30, 'evt_3TN4MBBqQIXrhZR41a5sW3y6', 'refund.created', NULL, 0, NULL, '2026-04-17 00:09:43'),
(31, 'evt_3TN4MBBqQIXrhZR419X6opJW', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:09:43'),
(32, 'evt_3TN4MBBqQIXrhZR41zdHOEJE', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:09:43'),
(33, 'evt_3TN4MBBqQIXrhZR41Gvr5eCn', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:09:43'),
(34, 'evt_3TN5kWBqQIXrhZR42pu6gwOt', 'refund.created', NULL, 0, NULL, '2026-04-17 00:09:48'),
(35, 'evt_3TN5kWBqQIXrhZR421uwvbME', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:09:48'),
(36, 'evt_3TN5kWBqQIXrhZR42PwiQiYh', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:09:49'),
(37, 'evt_3TN5kWBqQIXrhZR429jjBlWS', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:09:49'),
(38, 'evt_3TN5ulBqQIXrhZR41IaqSGAI', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:09:54'),
(39, 'evt_3TN5ulBqQIXrhZR419cfH3n9', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:09:54'),
(40, 'evt_3TN5ulBqQIXrhZR4144h6z3W', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:09:54'),
(41, 'evt_3TN5hnBqQIXrhZR40D2e2tRC', 'refund.created', NULL, 0, NULL, '2026-04-17 00:09:56'),
(42, 'evt_3TN5hnBqQIXrhZR40aSI05yC', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:09:56'),
(43, 'evt_3TN5hnBqQIXrhZR40nLzZyIM', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:09:56'),
(44, 'evt_3TN5hnBqQIXrhZR40HwhhtvN', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:09:56'),
(45, 'evt_3TN5ulBqQIXrhZR41SczCwWT', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:00'),
(46, 'evt_3TN634BqQIXrhZR41upJGswX', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:02'),
(47, 'evt_3TN634BqQIXrhZR41QGrKBlq', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:02'),
(48, 'evt_3TN634BqQIXrhZR41GmBF0jm', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:02'),
(49, 'evt_3TN634BqQIXrhZR41ZB3ljpB', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:02'),
(50, 'evt_3TN5vzBqQIXrhZR40pUcW8Fg', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:08'),
(51, 'evt_3TN5vzBqQIXrhZR40kYjfqXJ', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:08'),
(52, 'evt_3TN5vzBqQIXrhZR40wBY1rzA', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:08'),
(53, 'evt_3TN5BHBqQIXrhZR43QsOjLzP', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:10'),
(54, 'evt_3TN5BHBqQIXrhZR430gBY92E', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:10'),
(55, 'evt_3TN5BHBqQIXrhZR43YCPgPed', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:10'),
(56, 'evt_3TN5BHBqQIXrhZR43o1D1leX', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:10'),
(57, 'evt_3TN5QYBqQIXrhZR43ERVkmYx', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:11'),
(58, 'evt_3TN5QYBqQIXrhZR43SpUtQAc', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:11'),
(59, 'evt_3TN5QYBqQIXrhZR43g3rx5qy', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:11'),
(60, 'evt_3TN5XCBqQIXrhZR43VNtj7Mp', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:12'),
(61, 'evt_3TN5XCBqQIXrhZR43M6ATslW', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:12'),
(62, 'evt_3TN5XCBqQIXrhZR43OG6ixSh', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:13'),
(63, 'evt_3TN6EFBqQIXrhZR43n5MKpxk', 'charge.refunded', NULL, 0, NULL, '2026-04-17 00:10:13'),
(64, 'evt_3TN6EFBqQIXrhZR43Ib2Cifq', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:13'),
(65, 'evt_3TN6EFBqQIXrhZR43DRgP3Pe', 'charge.refund.updated', NULL, 0, NULL, '2026-04-17 00:10:14'),
(66, 'evt_3TN5vzBqQIXrhZR40e3vNRc6', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:14'),
(67, 'evt_3TN6EFBqQIXrhZR43bjPRaVg', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:16'),
(68, 'evt_3TN5XCBqQIXrhZR432emOeFm', 'refund.created', NULL, 0, NULL, '2026-04-17 00:10:18'),
(69, 'evt_3TN5QYBqQIXrhZR43KgZvbyf', 'refund.updated', NULL, 0, NULL, '2026-04-17 00:10:20'),
(70, 'evt_3TN6iNBqQIXrhZR42hoPcqy9', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 00:21:23'),
(71, 'evt_3TN6iNBqQIXrhZR42cchwxOO', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 00:21:32'),
(72, 'evt_3TN6iNBqQIXrhZR42SWYIJwK', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 00:21:32'),
(73, 'evt_3TN6iNBqQIXrhZR42CaCSpDP', 'charge.updated', NULL, 0, NULL, '2026-04-17 00:21:35'),
(74, 'evt_3TN6mCBqQIXrhZR413xEV2sr', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 00:25:20'),
(75, 'evt_3TN6mCBqQIXrhZR415VybfGu', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 00:25:29'),
(76, 'evt_3TN6mCBqQIXrhZR41BTWv0X0', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 00:25:29'),
(77, 'evt_3TN6mCBqQIXrhZR41zAo8QL9', 'charge.updated', NULL, 0, NULL, '2026-04-17 00:25:32'),
(78, 'evt_3TNKR0BqQIXrhZR41W9iuTUN', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 15:00:22'),
(79, 'evt_3TNKR0BqQIXrhZR41xfj3aO4', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 15:00:30'),
(80, 'evt_3TNKR0BqQIXrhZR41Jol2kk0', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 15:00:30'),
(81, 'evt_3TNKR0BqQIXrhZR417v56wbi', 'charge.updated', NULL, 0, NULL, '2026-04-17 15:00:33'),
(82, 'evt_3TNKeNBqQIXrhZR41n0QRhHe', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 15:14:11'),
(83, 'evt_3TNKeNBqQIXrhZR41ySGhToQ', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 15:14:26'),
(84, 'evt_3TNKeNBqQIXrhZR419gvUYzh', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 15:14:26'),
(85, 'evt_3TNKeNBqQIXrhZR41x3Jxv81', 'charge.updated', NULL, 0, NULL, '2026-04-17 15:14:29'),
(86, 'evt_3TNKpBBqQIXrhZR42FhNAr67', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 15:25:21'),
(87, 'evt_3TNKpBBqQIXrhZR42DtzdzA2', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 15:25:30'),
(88, 'evt_3TNKpBBqQIXrhZR42lvZk8fs', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 15:25:30'),
(89, 'evt_3TNKpBBqQIXrhZR42H81GTUj', 'charge.updated', NULL, 0, NULL, '2026-04-17 15:25:33'),
(90, 'evt_3TNLK6BqQIXrhZR437PxrCGm', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 15:57:18'),
(91, 'evt_3TNLU7BqQIXrhZR43e6c5nCl', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:07:39'),
(92, 'evt_3TNLU7BqQIXrhZR43VorwVIX', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:07:49'),
(93, 'evt_3TNLU7BqQIXrhZR43DUzxQlC', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:07:49'),
(94, 'evt_3TNLU7BqQIXrhZR43xrEyXlE', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:07:52'),
(95, 'evt_3TNLUVBqQIXrhZR42MeEsJan', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:08:03'),
(96, 'evt_3TNLl0BqQIXrhZR41WK00nvJ', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:25:06'),
(97, 'evt_3TNLl0BqQIXrhZR41jorAZEJ', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:25:16'),
(98, 'evt_3TNLl0BqQIXrhZR41l8lPjtb', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:25:16'),
(99, 'evt_3TNLl0BqQIXrhZR41R50Xnwf', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:25:22'),
(100, 'evt_3TNLlPBqQIXrhZR400m6zuV3', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:25:31'),
(101, 'evt_3TNLsCBqQIXrhZR42ijDhp90', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:32:32'),
(102, 'evt_3TNLsHBqQIXrhZR409Ttd0Il', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:32:37'),
(103, 'evt_3TNLsmBqQIXrhZR41ka2szWJ', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:33:08'),
(104, 'evt_3TNLsmBqQIXrhZR410c87JnO', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:33:19'),
(105, 'evt_3TNLsmBqQIXrhZR41VqnWR58', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:33:19'),
(106, 'evt_3TNLsmBqQIXrhZR41WZGpyTS', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:33:22'),
(107, 'evt_3TNLtNBqQIXrhZR41mdI2r96', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:33:46'),
(108, 'evt_3TNLtHBqQIXrhZR41ZBpapsH', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:33:48'),
(109, 'evt_3TNLzrBqQIXrhZR43FXgZyMX', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:40:27'),
(110, 'evt_3TNLzrBqQIXrhZR43RS9wFyg', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:40:36'),
(111, 'evt_3TNLzrBqQIXrhZR43qM4PuGN', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:40:36'),
(112, 'evt_3TNLzrBqQIXrhZR43leiqspE', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:40:39'),
(113, 'evt_3TNM0EBqQIXrhZR423PX5Xou', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:40:50'),
(114, 'evt_3TNM0EBqQIXrhZR425UaRiv2', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:40:59'),
(115, 'evt_3TNM0EBqQIXrhZR42enVrxXK', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:41:00'),
(116, 'evt_3TNM0EBqQIXrhZR42ut8sRr9', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:41:02'),
(117, 'evt_3TNM0SBqQIXrhZR40PBHgKjO', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:41:04'),
(118, 'evt_3TNM0SBqQIXrhZR406bsZML5', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:41:12'),
(119, 'evt_3TNM0SBqQIXrhZR40NoqRrJ6', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:41:12'),
(120, 'evt_3TNM0SBqQIXrhZR40qDQaHUn', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:41:15'),
(121, 'evt_3TNM0lBqQIXrhZR43SmsTgA3', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:41:23'),
(122, 'evt_3TNM0rBqQIXrhZR431t26Z4y', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 16:41:29'),
(123, 'evt_3TNM0rBqQIXrhZR43Z50Mdj3', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 16:41:38'),
(124, 'evt_3TNM0rBqQIXrhZR43ak8dM29', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 16:41:38'),
(125, 'evt_3TNM0rBqQIXrhZR43aKLR3H4', 'charge.updated', NULL, 0, NULL, '2026-04-17 16:41:41'),
(126, 'evt_3TNOimBqQIXrhZR42RSRZ9nL', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 19:35:01'),
(127, 'evt_3TNOimBqQIXrhZR42fjmeGgL', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 19:35:11'),
(128, 'evt_3TNOimBqQIXrhZR42cnSWeiW', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 19:35:12'),
(129, 'evt_3TNOimBqQIXrhZR42t7GaUSv', 'charge.updated', NULL, 0, NULL, '2026-04-17 19:35:14'),
(130, 'evt_3TNP4iBqQIXrhZR40oAiKEBk', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 19:57:41'),
(131, 'evt_3TNP4iBqQIXrhZR40ADoHqsC', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 19:57:52'),
(132, 'evt_3TNP4iBqQIXrhZR40QU4nbHB', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 19:57:52'),
(133, 'evt_3TNP4iBqQIXrhZR40xnz4czM', 'charge.updated', NULL, 0, NULL, '2026-04-17 19:57:55'),
(134, 'evt_3TNPBOBqQIXrhZR40ELOCErk', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 20:04:35'),
(135, 'evt_3TNPBOBqQIXrhZR40UKJF1sH', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 20:04:55'),
(136, 'evt_3TNPBOBqQIXrhZR40FmX3k0q', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 20:04:55'),
(137, 'evt_3TNPBOBqQIXrhZR40J4xfr9z', 'charge.updated', NULL, 0, NULL, '2026-04-17 20:04:57'),
(138, 'evt_3TNPJSBqQIXrhZR412Kqgxwq', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 20:12:55'),
(139, 'evt_3TNPJSBqQIXrhZR41IBd3dOk', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 20:13:03'),
(140, 'evt_3TNPJSBqQIXrhZR41R0wGhsn', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 20:13:03'),
(141, 'evt_3TNPJSBqQIXrhZR41D5DIi6d', 'charge.updated', NULL, 0, NULL, '2026-04-17 20:13:06'),
(142, 'evt_3TNPLABqQIXrhZR41wbUO8U0', 'payment_intent.created', NULL, 0, NULL, '2026-04-17 20:14:41'),
(143, 'evt_3TNPLABqQIXrhZR41CDLLqzq', 'payment_intent.succeeded', NULL, 0, NULL, '2026-04-17 20:14:51'),
(144, 'evt_3TNPLABqQIXrhZR414G8ltFN', 'charge.succeeded', NULL, 0, NULL, '2026-04-17 20:14:51'),
(145, 'evt_3TNPLABqQIXrhZR4156X8MIW', 'charge.updated', NULL, 0, NULL, '2026-04-17 20:14:53');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tipo` enum('Normal','Premium') NOT NULL DEFAULT 'Normal',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `tipo`, `created_at`, `updated_at`) VALUES
(1, 'Roman Acosta', 'racosta@gmail.com', 'roman1234', 'Premium', '2026-04-09 06:22:30', '2026-04-09 06:22:30'),
(3, 'Fernando', 'fernando22@gmail.com', 'fernando22', 'Normal', '2026-04-09 14:28:08', '2026-04-09 14:28:08'),
(5, 'Chris', 'chrisdjmh@gmail.com', '12345678', 'Normal', '2026-04-12 11:09:25', '2026-04-14 10:48:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_admin` (`email`);

--
-- Indexes for table `boletos`
--
ALTER TABLE `boletos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_codigo_qr` (`codigo_qr`),
  ADD KEY `fk_boleto_orden` (`orden_id`),
  ADD KEY `fk_boleto_evento` (`evento_id`);

--
-- Indexes for table `contadores`
--
ALTER TABLE `contadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_contador` (`email`);

--
-- Indexes for table `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evento_organizador` (`organizador_id`);

--
-- Indexes for table `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orden_usuario` (`usuario_id`);

--
-- Indexes for table `organizadores`
--
ALTER TABLE `organizadores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_org` (`email`);

--
-- Indexes for table `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pago_orden` (`orden_id`);

--
-- Indexes for table `stripe_webhook_events`
--
ALTER TABLE `stripe_webhook_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_stripe_event_id` (`event_id`),
  ADD KEY `fk_webhook_orden` (`orden_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email_usuario` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `boletos`
--
ALTER TABLE `boletos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=221;

--
-- AUTO_INCREMENT for table `contadores`
--
ALTER TABLE `contadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `organizadores`
--
ALTER TABLE `organizadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `stripe_webhook_events`
--
ALTER TABLE `stripe_webhook_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=146;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `boletos`
--
ALTER TABLE `boletos`
  ADD CONSTRAINT `fk_boleto_evento` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`),
  ADD CONSTRAINT `fk_boleto_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `fk_evento_organizador` FOREIGN KEY (`organizador_id`) REFERENCES `organizadores` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_orden_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pago_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
