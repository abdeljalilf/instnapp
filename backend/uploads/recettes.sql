-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: localhost    Database: we_love_food
-- ------------------------------------------------------
-- Server version       8.0.22

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `recipe_id` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `review` int NOT NULL DEFAULT '3',
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `recipe_id` (`recipe_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES 
(2, 3, 1, 'Deuxième commentaire', '2021-07-06 13:56:48', 0),
(1, 1, 1, 'Premier commentaire\n', '2021-07-06 13:56:48', 1),
(3, 2, 1, 'J\'adore le cassoulet mais je préfère manger des kebabs !', '2021-07-06 13:56:48', 3),
(5, 2, 1, 'Et de 5 ! trop bien la recette :)', '2021-07-06 14:10:50', 3),
(7, 2, 1, 'Test de 5', '2021-07-06 14:14:39', 5);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `recipe_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(128) NOT NULL,
  `recipe` text NOT NULL,
  `is_enabled` tinyint(1) NOT NULL,
  `author` varchar(512) NOT NULL,
  PRIMARY KEY (`recipe_id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES 
(1, 'Cassoulet Toulousain', 'Le cassoulet (de l\'occitan cassolet, caçolet) est une spécialité régionale du Languedoc, à base de haricots secs, généralement blancs, et de viande. À son origine, il était à base de fèves. Le cassoulet tient son nom de la cassole en terre cuite émaillée dite caçola en occitan et fabriquée à Issel.', 1, 'mickael.andrieu@exemple.com'),
(2, 'Couscous', 'Le couscous (en berbère : سكسو  ou كسكس,  en arabe maghrébin : كسكس ou طعام) est d\'une part une semoule de blé dur préparée à l\'huile d\'olive (un des aliments de base traditionnel de la cuisine des pays du Maghreb) et d\'autre part, une spécialité culinaire issue de la cuisine berbère, à base de couscous, de légumes, d\'épices, d\'huile d\'olive et de viande (rouge ou de volaille) ou de poisson.', 0, 'mickael.andrieu@exemple.com'),
(3, 'Escalope milanaise', 'L\'escalope à la milanaise, ou escalope milanaise (cotoleta a la milanesa in langue lombarde), est une escalope panée, de viande de veau, traditionnellement prise dans le faux-filet. Historiquement, on la cuit avec du beurre. Elle est généralement servie avec salade ou frites, accompagnée de sauce mayonnaise. On peut y ajouter un filet de jus de citron. En Italie, ce mets ne se sert pas avec des pâtes.', 1, 'mathieu.nebra@exemple.com'),
(4, 'Salade Romaine', 'La salade César (en anglais : Caesar salad ; en espagnol : ensalada César ; en italien : Caesar salad) est une recette de cuisine de salade composée de la cuisine américaine, traditionnellement préparée en salle à côté de la table, à base de laitue romaine, œuf dur, croûtons, parmesan et de « sauce César » à base de parmesan râpé, huile d\'olive, pâte d\'anchois, ail, vinaigre de vin, moutarde, jaune d\'œuf et sauce Worcestershire.', 0, 'laurene.castor@exemple.com'),
(10, 'Paella', 'La paella est un plat traditionnel à base de riz rond, originaire de la région de Valence en Espagne, qui tient son nom de la poêle qui sert à la cuisiner.', 1, 'mathieu.nebra@exemple.com'),
(11, 'Tartiflette', 'La tartiflette (dérivé de tartifle, ou tartiflê, pomme de terre, en savoyard) est une recette de cuisine, à base de gratin de pommes de terre, oignons, lardons, le tout gratiné au reblochon (fromage AOP des pays de Savoie).', 1, 'mickael.andrieu@exemple.com'),
(12, 'Steak tartare', 'Le steak tartare ou tartare est une recette à base de viande de bœuf ou de viande de cheval crue, généralement hachée gros, ou coupée en petits cubes au couteau (d\'où l\'appellation de tartare au couteau). Le filet américain est une variante belge et du nord de la France.', 0, 'mickael.andrieu@exemple.com'),
(13, 'Quiche lorraine', 'La quiche lorraine est une variante de quiche / tarte salée de la cuisine lorraine et de la cuisine française, à base de pâte brisée ou de pâte feuilletée, de migaine d\'œufs, de crème fraîche et de lardons.', 1, 'laurene.castor@exemple.com');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(64) NOT NULL,
  `email` varchar(512) NOT NULL,
  `password` varchar(512) NOT NULL,
  `age` int NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES 
(1, 'Mickaël Andrieu', 'mickael.andrieu@exemple.com', 'S3cr3t', 34),
(2, 'Mathieu Nebra', 'mathieu.nebra@exemple.com', 'MiamMiam', 34),
(3, 'Laurène Castor', 'laurene.castor@exemple.com', 'laCasto28', 28);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-09-15 22:16:35
SELECT * FROM recipes WHERE is_enabled = 0;
SELECT COUNT(*) AS total_comments
FROM comments
WHERE recipe_id = 2;

SELECT u.full_name, COUNT(r.recipe_id) AS total_recipes
FROM users u
JOIN recipes r ON u.email = r.author
GROUP BY u.full_name
ORDER BY total_recipes DESC;

SELECT title from recipes LIMIT 1 OFFSET 3;

SELECT title from recipes LIMIT 3, 1;

SELECT title from recipes WHERE recipe_id = 4;

SELECT AVG(review) AS average_rating
FROM comments
WHERE recipe_id = 1;
