-- MySQL dump 10.13  Distrib 9.2.0, for macos14.7 (arm64)
--
-- Host: localhost    Database: salon_platform
-- ------------------------------------------------------
-- Server version	9.2.0

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
-- Table structure for table `appointment_audit`
--

DROP TABLE IF EXISTS `appointment_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_audit` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `event_type` enum('CREATED','UPDATED','CANCELLED','RESCHEDULED','STAFF_CHANGED') NOT NULL,
  `event_note` text,
  `performed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `performed_by` (`performed_by`),
  CONSTRAINT `appointment_audit_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_audit_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_audit`
--

LOCK TABLES `appointment_audit` WRITE;
/*!40000 ALTER TABLE `appointment_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_services`
--

DROP TABLE IF EXISTS `appointment_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `duration` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_appt_service` (`appointment_id`,`service_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `appointment_services_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_services`
--

LOCK TABLES `appointment_services` WRITE;
/*!40000 ALTER TABLE `appointment_services` DISABLE KEYS */;
INSERT INTO `appointment_services` VALUES (6,8,21,120,250.00),(8,17,18,35,45.00),(9,17,16,45,65.00),(10,11,14,20,30.00),(11,11,10,90,120.00),(12,11,9,45,70.00),(13,11,12,30,55.00),(15,10,9,45,70.00),(16,10,12,30,55.00),(17,10,11,90,150.00),(18,10,8,40,60.00),(19,10,21,120,250.00),(24,7,13,15,25.00),(25,7,14,20,30.00),(26,7,10,90,120.00),(27,7,12,30,55.00),(34,21,12,30,55.00),(35,21,11,90,150.00),(36,21,7,30,45.00),(37,22,8,40,60.00),(44,3,11,90,150.00),(45,20,17,25,30.00),(46,20,16,45,65.00),(47,20,15,25,40.00),(48,20,20,50,75.00),(49,23,9,45,70.00),(50,23,12,30,55.00),(51,23,11,90,150.00);
/*!40000 ALTER TABLE `appointment_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `scheduled_time` datetime NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (2,35,6,NULL,'2025-11-10 14:00:00',50.00,'confirmed','Salon test booking','2025-11-09 06:05:40','2025-11-11 17:24:39'),(3,35,6,NULL,'2025-11-09 14:00:00',150.00,'confirmed','Walk-in haircut for today','2025-11-09 06:41:15','2025-11-11 17:26:07'),(6,19,6,3,'2025-11-10 02:01:00',25.00,'cancelled','warm water','2025-11-09 16:59:35','2025-11-11 18:13:54'),(7,19,6,NULL,'2025-11-10 00:03:00',230.00,'cancelled','warm towel\n','2025-11-09 17:02:00','2025-11-11 18:13:54'),(8,19,6,NULL,'2025-11-10 00:31:00',250.00,'cancelled','new check','2025-11-09 17:29:34','2025-11-11 18:13:54'),(9,36,6,NULL,'2025-11-10 04:31:00',55.00,'cancelled','hellp','2025-11-09 17:31:13','2025-11-11 18:13:54'),(10,37,6,3,'2025-11-10 00:36:00',585.00,'cancelled','adam','2025-11-09 17:36:40','2025-11-11 18:13:54'),(11,38,6,NULL,'2025-11-10 01:54:00',275.00,'cancelled','warm hand','2025-11-09 17:54:37','2025-11-11 18:13:54'),(12,38,6,NULL,'2025-11-10 02:20:00',30.00,'cancelled','today\n','2025-11-09 18:17:50','2025-11-11 18:13:54'),(13,38,6,NULL,'2025-11-10 02:20:00',30.00,'cancelled','today\n','2025-11-09 18:27:18','2025-11-11 18:13:54'),(14,39,6,NULL,'2025-11-10 01:35:00',150.00,'cancelled','hehe','2025-11-09 18:35:35','2025-11-11 18:13:54'),(15,40,6,3,'2025-11-10 01:42:00',55.00,'cancelled','','2025-11-09 18:43:01','2025-11-11 18:13:54'),(16,40,6,NULL,'2025-11-10 00:47:00',70.00,'cancelled','hard hand\n','2025-11-09 18:47:49','2025-11-11 18:13:54'),(17,40,6,NULL,'2025-11-10 00:47:00',110.00,'cancelled','soft hand\n','2025-11-09 18:50:28','2025-11-11 18:13:54'),(18,41,6,NULL,'2025-11-10 01:54:00',60.00,'cancelled','hellp','2025-11-09 18:55:01','2025-11-11 18:13:54'),(19,42,6,NULL,'2025-11-09 15:54:00',120.00,'cancelled','hellp','2025-11-09 19:01:08','2025-11-09 19:13:51'),(20,45,6,NULL,'2025-11-10 13:01:00',210.00,'cancelled','hello hello','2025-11-10 16:25:04','2025-11-11 18:13:54'),(21,43,6,3,'2025-11-11 21:35:00',250.00,'completed','hello','2025-11-11 01:35:57','2025-11-11 16:24:59'),(22,48,6,5,'2025-11-11 11:41:00',60.00,'confirmed','BEST QUALITY','2025-11-11 14:42:11','2025-11-11 16:41:53'),(23,51,6,3,'2025-11-11 01:48:00',275.00,'cancelled','','2025-11-11 16:48:39','2025-11-12 16:11:06');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `table_name` varchar(100) DEFAULT NULL,
  `action` enum('INSERT','UPDATE','DELETE') DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_table` (`table_name`),
  KEY `idx_audit_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth`
--

DROP TABLE IF EXISTS `auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth` (
  `auth_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(256) NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `login_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`auth_id`),
  UNIQUE KEY `email` (`email`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `auth_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth`
--

LOCK TABLES `auth` WRITE;
/*!40000 ALTER TABLE `auth` DISABLE KEYS */;
INSERT INTO `auth` VALUES (7,29,'aanchalowner@example.com','$2b$10$0pn5QMC5zPDlyKniM61Iu.IwmrywMWgIeWXJUTF3lHjyXpgcWCC7.',NULL,0,'2025-11-08 02:14:20','2025-11-08 02:14:20'),(8,30,'sams@example.com','$2b$10$9zKgTZs/WXKmsfgovMHQjecsWB1dntye0lJrTJ/p3VC0gp4V5Gdim','2025-11-20 09:27:51',68,'2025-11-08 02:16:35','2025-11-20 09:27:51'),(9,31,'amrita@example.com','$2b$10$iHkh.2OMRtlpuPsq/2e3Iu1U3DgNX8Qd/UeGPvhqgsUuQB24t6eRu','2025-11-08 19:39:58',1,'2025-11-08 19:39:37','2025-11-08 19:39:58'),(10,32,'amitsingh@example.com','$2b$10$ubeOzUvrdVt4K98l3yU1U.1oBa92O0k7wKhHRQWZWEJtLPV8Sr2ti','2025-11-08 19:41:45',1,'2025-11-08 19:41:35','2025-11-08 19:41:45'),(11,49,'stygo.notification@gmail.com','$2b$10$WqBelohvd0nimCPxDMHtWuSPRFKTzx1bUbWtQJmgRa5U8gNWadjqS','2025-11-11 15:07:39',1,'2025-11-11 15:07:10','2025-11-11 15:07:39'),(12,53,'subashchadragiri09@gmail.com','$2b$10$fQ80BwhIU6tlBfL6ZnMfq.gVEdjvyk5ipmr05moY9NSHhfyKguFgG',NULL,0,'2025-11-11 20:58:14','2025-11-11 20:58:14'),(13,54,'subhashchandragiri09@gmail.com','$2b$10$nQx0LYqMq1jrhxEdpgx6UuzoBwZourpyZV6yrfxiKuz0xhKGzQY0K',NULL,0,'2025-11-11 20:59:49','2025-11-11 20:59:49'),(14,56,'hager@example.com','$2b$10$Gq50Dg2n7reRIF5aGncF2O3t/dLcA1H3IPWl8qSN6wHgM.IXh90be','2025-11-11 22:52:04',2,'2025-11-11 22:50:00','2025-11-11 22:52:04'),(15,57,'hager1@example.com','$2b$10$qUTYn/5eO6Rsww1cga0r8euUtAfnt2N4gfaWi91e6NImhsW.KAKl6','2025-11-11 22:52:20',1,'2025-11-11 22:51:48','2025-11-11 22:52:20'),(16,58,'hager3@example.com','$2b$10$vpE9va.SQzq/EpOkO/h92uuvdN5G2qR/7ux2MkscBHkDKjMdaBXQ.','2025-11-11 23:11:19',1,'2025-11-11 23:11:00','2025-11-11 23:11:19'),(17,59,'owner4@example.com','$2b$10$TNPGUzsLOo0D7QFywEmi7eiy2R593j6W9CipkdPD6Z4KQ3a43jbV6','2025-11-20 09:27:01',8,'2025-11-11 23:40:53','2025-11-20 09:27:01'),(18,60,'salonstyle@example.com','$2b$10$WxklnHG.nwPYr6JUtV8Fa.pk3O.0jMkRNfoMxdVK0vUSoRgokseTu',NULL,0,'2025-11-11 23:50:02','2025-11-11 23:50:02'),(19,61,'master@example.com','$2b$10$0bQa1Cu4Kd2AKaLrTHEiFOgd9hZ7NVgSEEdmnRdHGWfhtSHCopGJq','2025-11-11 23:51:15',1,'2025-11-11 23:51:07','2025-11-11 23:51:15'),(20,62,'owner5@example.com','$2b$10$I/Qq/XqvKulpR9TwRrUfiuGQQ0DeU/KnoNAxVzfRiFOywlCoO8MRa','2025-11-12 00:50:37',1,'2025-11-12 00:50:25','2025-11-12 00:50:37'),(21,63,'salontest@example.com','$2b$10$A/5C4DBihPWg.dOvYvr7K.6izBCmcn/j3oOHWzeSqz1mexIizVE/i','2025-11-12 01:06:46',1,'2025-11-12 01:06:27','2025-11-12 01:06:46'),(22,64,'test@example.com','$2b$10$dDeH5Pctma68L9dH0YRQTuygBZCSmxhNURjgnmiBN1hvAnLuTMGwa','2025-11-12 16:11:06',1,'2025-11-12 16:10:45','2025-11-12 16:11:06'),(23,65,'salonlittle@example.com','$2b$10$BXU/in/U/U7eCZwA102L1uvWjEuyLr1zgpGYJ6rGAcPZ2DlHiv7M2','2025-11-13 16:33:54',1,'2025-11-13 16:33:41','2025-11-13 16:33:54'),(24,66,'timssalon@example.com','$2b$10$4IWMD30qrxHvYTMd0SyVCukQZMAXPZqsJCRFvH6wuDtjF.7Uj.GJm','2025-11-13 20:17:48',1,'2025-11-13 20:17:36','2025-11-13 20:17:48'),(25,68,'testsalon@salon.com','$2b$10$.ZsyWD9NAgQJtcV7HZbcSeB9nCDOjGJFB9dIswlSD751H3U3JIOWi','2025-11-20 09:37:17',1,'2025-11-20 09:37:04','2025-11-20 09:37:17');
/*!40000 ALTER TABLE `auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `type` enum('product','service') NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `cart_id` (`cart_id`),
  KEY `product_id` (`product_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL,
  CONSTRAINT `cart_items_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `status` enum('active','checked_out','abandoned') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_check_in`
--

DROP TABLE IF EXISTS `customer_check_in`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_check_in` (
  `checkin_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `checkin_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('arrived','late','no_show') DEFAULT 'arrived',
  `notes` text,
  PRIMARY KEY (`checkin_id`),
  KEY `idx_customer_checkin_user` (`user_id`),
  KEY `idx_customer_checkin_appt` (`appointment_id`),
  CONSTRAINT `customer_check_in_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `customer_check_in_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_check_in`
--

LOCK TABLES `customer_check_in` WRITE;
/*!40000 ALTER TABLE `customer_check_in` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_check_in` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_feedback_followups`
--

DROP TABLE IF EXISTS `customer_feedback_followups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_feedback_followups` (
  `followup_id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message_sent` text,
  `response_received` text,
  `followup_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`followup_id`),
  KEY `review_id` (`review_id`),
  KEY `idx_followup_user` (`user_id`),
  CONSTRAINT `customer_feedback_followups_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`review_id`) ON DELETE CASCADE,
  CONSTRAINT `customer_feedback_followups_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_feedback_followups`
--

LOCK TABLES `customer_feedback_followups` WRITE;
/*!40000 ALTER TABLE `customer_feedback_followups` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_feedback_followups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `appointment_id` int NOT NULL,
  `service_id` int NOT NULL,
  `visit_date` date NOT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `rating` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  KEY `staff_id` (`staff_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `history_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `history_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  CONSTRAINT `history_ibfk_4` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `history_ibfk_5` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE,
  CONSTRAINT `history_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `inventory_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `change_type` enum('restock','sale','usage','adjustment','return','damage') NOT NULL,
  `quantity_change` int NOT NULL,
  `previous_stock` int DEFAULT '0',
  `new_stock` int DEFAULT '0',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`inventory_id`),
  KEY `product_id` (`product_id`),
  KEY `salon_id` (`salon_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loyalty`
--

DROP TABLE IF EXISTS `loyalty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty` (
  `loyalty_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `points` int DEFAULT '0',
  `last_earned` timestamp NULL DEFAULT NULL,
  `last_redeemed` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`loyalty_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `loyalty_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `loyalty_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty`
--

LOCK TABLES `loyalty` WRITE;
/*!40000 ALTER TABLE `loyalty` DISABLE KEYS */;
/*!40000 ALTER TABLE `loyalty` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `main_categories`
--

DROP TABLE IF EXISTS `main_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `main_categories` (
  `main_category_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`main_category_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `main_categories`
--

LOCK TABLES `main_categories` WRITE;
/*!40000 ALTER TABLE `main_categories` DISABLE KEYS */;
INSERT INTO `main_categories` VALUES (1,'Hair','Haircuts, coloring, and styling services','2025-11-09 07:24:52'),(2,'Beard & Grooming','Shaving, trimming, and facial hair care','2025-11-09 07:24:52'),(3,'Skin & Facial','Facials and skincare treatments','2025-11-09 07:24:52'),(4,'Nails','Manicure, pedicure, and nail art services','2025-11-09 07:24:52'),(5,'Spa & Body','Massages, scrubs, and body treatments','2025-11-09 07:24:52'),(6,'Makeup & Beauty','Bridal and event makeup services','2025-11-09 07:24:52');
/*!40000 ALTER TABLE `main_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_preferences`
--

DROP TABLE IF EXISTS `notification_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_preferences` (
  `pref_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `email_enabled` tinyint(1) DEFAULT '1',
  `sms_enabled` tinyint(1) DEFAULT '1',
  `push_enabled` tinyint(1) DEFAULT '1',
  `quiet_hours_start` time DEFAULT NULL,
  `quiet_hours_end` time DEFAULT NULL,
  PRIMARY KEY (`pref_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_preferences`
--

LOCK TABLES `notification_preferences` WRITE;
/*!40000 ALTER TABLE `notification_preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_queue`
--

DROP TABLE IF EXISTS `notification_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_queue` (
  `queue_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `delivery_method` enum('email','sms','push') DEFAULT 'email',
  `scheduled_for` datetime NOT NULL,
  `sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`queue_id`),
  KEY `idx_notif_queue_user` (`user_id`),
  KEY `idx_notif_queue_schedule` (`scheduled_for`),
  CONSTRAINT `notification_queue_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_queue`
--

LOCK TABLES `notification_queue` WRITE;
/*!40000 ALTER TABLE `notification_queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_tracking`
--

DROP TABLE IF EXISTS `notification_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_tracking` (
  `track_id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `delivery_method` enum('email','sms','push') DEFAULT NULL,
  `delivered` tinyint(1) DEFAULT '0',
  `opened` tinyint(1) DEFAULT '0',
  `bounced` tinyint(1) DEFAULT '0',
  `delivered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`track_id`),
  KEY `notification_id` (`notification_id`),
  CONSTRAINT `notification_tracking_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_tracking`
--

LOCK TABLES `notification_tracking` WRITE;
/*!40000 ALTER TABLE `notification_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `type` enum('product','service') NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_id` int DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `order_status` enum('processing','completed','cancelled') DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  KEY `payment_id` (`payment_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('card','paypal','cash','wallet') DEFAULT 'card',
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `card_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `user_id` (`user_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`card_id`) REFERENCES `saved_cards` (`card_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payouts` (
  `payout_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `total_sales` decimal(10,2) DEFAULT '0.00',
  `platform_fee` decimal(10,2) DEFAULT '0.00',
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('stripe','paypal','manual') DEFAULT 'stripe',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `payout_status` enum('pending','processed','failed') DEFAULT 'pending',
  `payout_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payout_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `payouts_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payouts`
--

LOCK TABLES `payouts` WRITE;
/*!40000 ALTER TABLE `payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_sales`
--

DROP TABLE IF EXISTS `product_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_sales` (
  `sale_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `salon_id` int NOT NULL,
  `quantity` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `sold_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sale_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `product_sales_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `product_sales_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `product_sales_ibfk_3` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_sales`
--

LOCK TABLES `product_sales` WRITE;
/*!40000 ALTER TABLE `product_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_usage`
--

DROP TABLE IF EXISTS `product_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity_used` int NOT NULL,
  PRIMARY KEY (`usage_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_usage_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `product_usage_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_usage`
--

LOCK TABLES `product_usage` WRITE;
/*!40000 ALTER TABLE `product_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` enum('Hair','Skin','Nails','Other') DEFAULT 'Other',
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `reorder_level` int DEFAULT '5',
  `sku` varchar(50) DEFAULT NULL,
  `supplier_name` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_codes`
--

DROP TABLE IF EXISTS `promo_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_codes` (
  `promo_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(10,2) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `usage_limit` int DEFAULT '0',
  `used_count` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`promo_id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_promo_salon` (`salon_id`),
  KEY `idx_promo_dates` (`start_date`,`end_date`),
  CONSTRAINT `promo_codes_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_codes`
--

LOCK TABLES `promo_codes` WRITE;
/*!40000 ALTER TABLE `promo_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `promo_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `response` text,
  `is_visible` tinyint(1) DEFAULT '1',
  `is_flagged` tinyint(1) DEFAULT '0',
  `flagged_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` enum('customer','staff','owner','admin') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_admin`
--

DROP TABLE IF EXISTS `salon_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_admin` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `reviewed_by` int DEFAULT NULL,
  `review_status` enum('pending','approved','rejected','blocked') DEFAULT 'pending',
  `license_number` varchar(50) DEFAULT NULL,
  `license_doc` varchar(255) DEFAULT NULL,
  `geo_verified` tinyint(1) DEFAULT '0',
  `deposit_paid` tinyint(1) DEFAULT '0',
  `rejected_reason` text,
  `reviewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  KEY `salon_id` (`salon_id`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `salon_admin_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `salon_admin_ibfk_2` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_admin`
--

LOCK TABLES `salon_admin` WRITE;
/*!40000 ALTER TABLE `salon_admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `salon_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_audit`
--

DROP TABLE IF EXISTS `salon_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_audit` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `event_type` enum('CREATED','APPROVED','REJECTED','BLOCKED','UPDATED','AUTO_ARCHIVED') NOT NULL,
  `event_note` text,
  `performed_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `salon_id` (`salon_id`),
  KEY `performed_by` (`performed_by`),
  CONSTRAINT `salon_audit_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `salon_audit_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_audit`
--

LOCK TABLES `salon_audit` WRITE;
/*!40000 ALTER TABLE `salon_audit` DISABLE KEYS */;
INSERT INTO `salon_audit` VALUES (1,9,'CREATED','Salon registered by owner',58,'2025-11-11 23:31:06');
/*!40000 ALTER TABLE `salon_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_customers`
--

DROP TABLE IF EXISTS `salon_customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_salon_customer` (`salon_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `salon_customers_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `salon_customers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_customers`
--

LOCK TABLES `salon_customers` WRITE;
/*!40000 ALTER TABLE `salon_customers` DISABLE KEYS */;
INSERT INTO `salon_customers` VALUES (1,6,35,'2025-11-09 06:05:40',NULL,NULL,NULL,NULL,NULL,'2025-11-09 17:20:35'),(2,6,19,'2025-11-09 16:59:35','8 Cherry street','Morristown','NJ','07960','new check','2025-11-09 17:20:35'),(6,6,37,'2025-11-09 17:36:40','8 Cherry street','Morristown','NJ','07960','adams','2025-11-09 17:36:40'),(7,6,38,'2025-11-09 17:54:37','8 Herry street','Morristwn','WI','07990','today\n','2025-11-09 17:54:37'),(10,6,39,'2025-11-09 18:35:35','8 Cherry sts','Morristowns','NJ','07964','hehe','2025-11-09 18:35:35'),(11,6,40,'2025-11-09 18:43:01',NULL,NULL,NULL,NULL,'soft hand\n','2025-11-09 18:43:01'),(14,6,41,'2025-11-09 18:55:01','9 market st','newark','nj','07003','hellp','2025-11-09 18:55:01'),(15,6,42,'2025-11-09 19:01:08','10 market st','newark','nj','07003','hellp','2025-11-09 19:01:08'),(16,6,43,'2025-11-10 15:41:34',NULL,NULL,NULL,NULL,'hello','2025-11-10 15:41:34'),(17,6,44,'2025-11-10 16:14:31','9 morgan st','Indomen','NJ','07004','hello hello','2025-11-10 16:14:31'),(18,6,45,'2025-11-10 16:15:14','10 Torgan st','Indomens','NJ','07004','hello hello','2025-11-10 16:15:14'),(21,6,48,'2025-11-11 14:42:11','09 Elms street','Parsipanny','NJ','07045','BEST QUALITY','2025-11-11 14:42:11'),(22,6,50,'2025-11-11 16:29:49','10 staten island','New Brunchwick','NJ','08909','quality','2025-11-11 16:29:49'),(23,6,51,'2025-11-11 16:48:39','9 merry st','meerystown','NJ','09090',NULL,'2025-11-11 16:48:39'),(24,6,52,'2025-11-11 18:28:48','123 main street','Newark ','Nj','-7960','allergies','2025-11-11 18:28:48');
/*!40000 ALTER TABLE `salon_customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_settings`
--

DROP TABLE IF EXISTS `salon_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_settings` (
  `setting_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `timezone` varchar(50) DEFAULT 'America/New_York',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `cancellation_policy` text,
  `auto_complete_after` int DEFAULT '120',
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `unique_salon_setting` (`salon_id`),
  CONSTRAINT `salon_settings_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_settings`
--

LOCK TABLES `salon_settings` WRITE;
/*!40000 ALTER TABLE `salon_settings` DISABLE KEYS */;
INSERT INTO `salon_settings` VALUES (1,9,'America/New_York',0.00,NULL,120);
/*!40000 ALTER TABLE `salon_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salons`
--

DROP TABLE IF EXISTS `salons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salons` (
  `salon_id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `salon_name` varchar(255) NOT NULL,
  `approved` enum('pending','approved','rejected') DEFAULT 'pending',
  `address` text,
  `city` varchar(120) DEFAULT NULL,
  `state` varchar(120) DEFAULT NULL,
  `zip` varchar(30) DEFAULT NULL,
  `country` varchar(120) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `description` text,
  `website` varchar(255) DEFAULT NULL,
  `status` enum('pending','active','blocked') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`salon_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `salons_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salons`
--

LOCK TABLES `salons` WRITE;
/*!40000 ALTER TABLE `salons` DISABLE KEYS */;
INSERT INTO `salons` VALUES (6,30,'Lux Salon','approved','123 Main St',NULL,NULL,NULL,NULL,NULL,NULL,'Premium hair and beauty services',NULL,'active','2025-11-08 01:59:40','2025-11-09 04:59:23',NULL),(7,33,'Lux Salon','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending','2025-11-09 00:25:55','2025-11-09 00:25:55',NULL),(8,55,'Kendra\'s Salon','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending','2025-11-11 21:02:26','2025-11-11 21:02:26',NULL),(9,58,'Hager\'s Salon','pending','12 Marry St',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-11 23:31:06','2025-11-11 23:31:06',NULL),(10,64,'Test salon','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending','2025-11-12 16:10:45','2025-11-12 16:10:45','test-salon-64'),(11,65,'Salon Litter Owner','pending','24 race st, Bloomfield NJ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'pending','2025-11-13 16:33:41','2025-11-13 16:33:41','salon-litter-owner-65'),(12,66,'Tim\'s Salon','pending','9 west st','Bloomfiled','NJ','07960','United States','0987654328','timssalon@example.com',NULL,NULL,'pending','2025-11-13 20:17:36','2025-11-13 20:17:36','tim-s-salon-66'),(13,68,'TestSalon','pending','1234 Main Street','Mendham','NJ','07960','US','9876543121','testsalon@salon.com',NULL,'https://main.d9mc2v9b3gxgw.amplifyapp.com/admin/salon-dashboard/customers','pending','2025-11-20 09:37:04','2025-11-20 09:37:04','testsalon-68');
/*!40000 ALTER TABLE `salons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_cards`
--

DROP TABLE IF EXISTS `saved_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_cards` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cardholder_name` varchar(100) NOT NULL,
  `card_brand` varchar(50) DEFAULT NULL,
  `last4` char(4) NOT NULL,
  `expiry_month` int NOT NULL,
  `expiry_year` int NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `token_reference` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`card_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `saved_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_cards`
--

LOCK TABLES `saved_cards` WRITE;
/*!40000 ALTER TABLE `saved_cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `main_category_id` int NOT NULL,
  `salon_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_global` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `unique_category` (`name`,`main_category_id`,`salon_id`),
  KEY `main_category_id` (`main_category_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `service_categories_ibfk_1` FOREIGN KEY (`main_category_id`) REFERENCES `main_categories` (`main_category_id`) ON DELETE CASCADE,
  CONSTRAINT `service_categories_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,1,NULL,'Haircuts','All haircut-related services',0,'2025-11-09 07:26:39'),(2,1,NULL,'Hair Color','Root touch-ups, highlights, balayage',0,'2025-11-09 07:26:39'),(3,1,NULL,'Hair Treatments','Keratin, spa, and conditioning',0,'2025-11-09 07:26:39'),(4,2,NULL,'Beard Trim','Beard styling and shaping',0,'2025-11-09 07:26:39'),(5,2,NULL,'Shave','Luxury hot towel and straight razor shaves',0,'2025-11-09 07:26:39'),(6,3,NULL,'Basic Facials','Cleansing and exfoliation',0,'2025-11-09 07:26:39'),(7,3,NULL,'Advanced Facials','HydraFacial and deep rejuvenation',0,'2025-11-09 07:26:39'),(8,4,NULL,'Manicure','Basic, gel, and French manicure',0,'2025-11-09 07:26:39'),(9,4,NULL,'Pedicure','Spa and gel pedicure options',0,'2025-11-09 07:26:39'),(10,5,NULL,'Massages','Full body, Swedish, deep tissue',0,'2025-11-09 07:26:39'),(11,5,NULL,'Body Treatments','Scrubs, wraps, and detox treatments',0,'2025-11-09 07:26:39'),(12,6,NULL,'Makeup','Bridal, party, and glam looks',0,'2025-11-09 07:26:39'),(13,6,NULL,'Eyebrows','Threading, tinting, shaping',0,'2025-11-09 07:26:39');
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_photos`
--

DROP TABLE IF EXISTS `service_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_photos` (
  `photo_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `photo_type` enum('before','after') NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `user_id` (`user_id`),
  KEY `staff_id` (`staff_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_photos_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE,
  CONSTRAINT `service_photos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `service_photos_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL,
  CONSTRAINT `service_photos_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_photos`
--

LOCK TABLES `service_photos` WRITE;
/*!40000 ALTER TABLE `service_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `category_id` int NOT NULL,
  `custom_name` varchar(100) DEFAULT NULL,
  `duration` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `salon_id` (`salon_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `services_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`category_id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (7,6,1,'Men’s Classic Cut',30,45.00,'Traditional men’s haircut and styling',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(8,6,1,'Women’s Trim & Style',40,60.00,'Precision trimming and blowout',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(9,6,2,'Root Touch-Up',45,70.00,'Professional color retouching for roots',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(10,6,2,'Full Highlights',90,120.00,'Brighten your look with full highlights',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(11,6,3,'Keratin Treatment',90,150.00,'Smooth and straighten hair naturally',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(12,6,3,'Hair Spa',30,55.00,'Deep conditioning and scalp relaxation',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(13,6,4,'Beard Trim & Shape',15,25.00,'Customized beard styling and shaping',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(14,6,5,'Hot Towel Shave',20,30.00,'Luxury straight razor shave with oils',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(15,6,6,'Express Facial',25,40.00,'Quick cleansing and hydration facial',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(16,6,7,'Signature Facial',45,65.00,'Deep cleansing and rejuvenation',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(17,6,8,'Classic Manicure',25,30.00,'Basic nail shaping and polish',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(18,6,9,'Spa Pedicure',35,45.00,'Exfoliation and foot massage',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(19,6,10,'Aromatherapy Massage',60,90.00,'Relaxing essential oil massage',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(20,6,11,'Body Scrub',50,75.00,'Full body exfoliating treatment',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(21,6,12,'Bridal Makeup',120,250.00,'Complete bridal glam package',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(22,6,13,'Eyebrow Threading',10,20.00,'Precision brow shaping and definition',1,'2025-11-09 07:27:04','2025-11-09 07:27:04');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `user_id` int NOT NULL,
  `staff_code` char(4) DEFAULT NULL,
  `staff_role` varchar(100) DEFAULT NULL,
  `specialization` text,
  `is_active` tinyint(1) DEFAULT '1',
  `pin_hash` varchar(255) DEFAULT NULL,
  `pin_last_set` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pin_reset_token` varchar(255) DEFAULT NULL,
  `pin_reset_expires` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `staff_role_id` int DEFAULT NULL,
  PRIMARY KEY (`staff_id`),
  UNIQUE KEY `unique_salon_user` (`salon_id`,`user_id`),
  UNIQUE KEY `staff_code` (`staff_code`),
  KEY `salon_id` (`salon_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_staff_role` (`staff_role_id`),
  CONSTRAINT `fk_staff_role` FOREIGN KEY (`staff_role_id`) REFERENCES `staff_roles` (`staff_role_id`) ON DELETE SET NULL,
  CONSTRAINT `staff_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `staff_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (3,6,30,NULL,'Colorist','Haircut Expert',1,NULL,'2025-11-10 18:28:34',NULL,NULL,'2025-11-09 13:23:50','2025-11-11 03:03:53',3),(5,6,47,'1846','Hair Stylist','Hair Styling, Manicure, Hair Coloring, Massage',1,NULL,'2025-11-11 02:08:50',NULL,NULL,'2025-11-11 02:08:50','2025-11-11 12:06:22',2);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_attendance`
--

DROP TABLE IF EXISTS `staff_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `checkin_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `checkout_time` datetime DEFAULT NULL,
  `status` enum('on_time','late','absent') DEFAULT 'on_time',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  KEY `idx_staff_attendance_staff` (`staff_id`),
  KEY `idx_staff_attendance_checkin` (`checkin_time`),
  CONSTRAINT `staff_attendance_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_attendance`
--

LOCK TABLES `staff_attendance` WRITE;
/*!40000 ALTER TABLE `staff_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_availability`
--

DROP TABLE IF EXISTS `staff_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_availability` (
  `availability_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`availability_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `staff_availability_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_availability`
--

LOCK TABLES `staff_availability` WRITE;
/*!40000 ALTER TABLE `staff_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_pin_tokens`
--

DROP TABLE IF EXISTS `staff_pin_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_pin_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `unique_staff` (`staff_id`),
  CONSTRAINT `staff_pin_tokens_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_pin_tokens`
--

LOCK TABLES `staff_pin_tokens` WRITE;
/*!40000 ALTER TABLE `staff_pin_tokens` DISABLE KEYS */;
INSERT INTO `staff_pin_tokens` VALUES (2,5,'a4df63cc721e7f7aca167092a89980eacebeb894a01234671add431572b57e1b','2025-11-10 21:38:51');
/*!40000 ALTER TABLE `staff_pin_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_roles`
--

DROP TABLE IF EXISTS `staff_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_roles` (
  `staff_role_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `staff_role_name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`staff_role_id`),
  UNIQUE KEY `staff_role_name` (`staff_role_name`),
  UNIQUE KEY `unique_role_per_salon` (`salon_id`,`staff_role_name`),
  CONSTRAINT `staff_roles_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_roles`
--

LOCK TABLES `staff_roles` WRITE;
/*!40000 ALTER TABLE `staff_roles` DISABLE KEYS */;
INSERT INTO `staff_roles` VALUES (1,6,'Stylist','2025-11-10 21:37:07'),(2,6,'Hair Stylist','2025-11-10 21:37:07'),(3,6,'Colorist','2025-11-10 21:37:07'),(4,6,'Technician','2025-11-10 21:37:07'),(5,6,'Nail Artist','2025-11-10 21:37:07'),(6,6,'Receptionist','2025-11-10 21:37:07'),(7,6,'Barber','2025-11-10 21:37:07');
/*!40000 ALTER TABLE `staff_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_service`
--

DROP TABLE IF EXISTS `staff_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_service` (
  `staff_service_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `service_id` int NOT NULL,
  PRIMARY KEY (`staff_service_id`),
  UNIQUE KEY `unique_staff_service` (`staff_id`,`service_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `staff_service_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  CONSTRAINT `staff_service_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_service`
--

LOCK TABLES `staff_service` WRITE;
/*!40000 ALTER TABLE `staff_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_time_off`
--

DROP TABLE IF EXISTS `staff_time_off`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_time_off` (
  `timeoff_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`timeoff_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_staff_timeoff_staff` (`staff_id`),
  KEY `idx_staff_timeoff_date` (`start_datetime`,`end_datetime`),
  CONSTRAINT `staff_time_off_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  CONSTRAINT `staff_time_off_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_time_off`
--

LOCK TABLES `staff_time_off` WRITE;
/*!40000 ALTER TABLE `staff_time_off` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_time_off` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `two_factor_codes`
--

DROP TABLE IF EXISTS `two_factor_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `two_factor_codes` (
  `code_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `code` char(6) NOT NULL,
  `method` enum('sms','email','app') NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`code_id`),
  KEY `idx_codes_user` (`user_id`),
  KEY `idx_codes_expiry` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `two_factor_codes`
--

LOCK TABLES `two_factor_codes` WRITE;
/*!40000 ALTER TABLE `two_factor_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `two_factor_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_2fa_settings`
--

DROP TABLE IF EXISTS `user_2fa_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_2fa_settings` (
  `user_2fa_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `method` enum('sms','email','app') NOT NULL DEFAULT 'sms',
  `is_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `phone_number` varchar(32) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_2fa_id`),
  UNIQUE KEY `uq_user_method` (`user_id`,`method`),
  KEY `idx_user_2fa_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_2fa_settings`
--

LOCK TABLES `user_2fa_settings` WRITE;
/*!40000 ALTER TABLE `user_2fa_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_2fa_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `firebase_uid` varchar(128) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `user_role` enum('customer','staff','owner','admin') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (19,NULL,'Subash Neupane','9732168107','subash@sparkle.com',NULL,'customer','2025-11-08 01:46:37','2025-11-08 01:46:37'),(25,'UID-OWN-002','Aanchal Shrestha','9730009999','aanchal2@example.com',NULL,'owner','2025-11-08 01:59:05','2025-11-08 01:59:05'),(26,'UID-STF-001','Sandeeb Adhikari','9731110001','sandeeb@example.com',NULL,'staff','2025-11-08 01:59:05','2025-11-08 01:59:05'),(27,'UID-CST-001','Subash Neupane','9731110002','subash@example.com',NULL,'customer','2025-11-08 01:59:05','2025-11-08 01:59:05'),(28,'UID-ADM-001','System Admin',NULL,'admin@example.com',NULL,'admin','2025-11-08 01:59:05','2025-11-08 01:59:05'),(29,NULL,'Aanchal Shrestha','9730009999','aanchalowner@example.com',NULL,'customer','2025-11-08 02:14:20','2025-11-08 02:14:20'),(30,NULL,'Samser Bahadur','9171172727','sams@example.com',NULL,'owner','2025-11-08 02:16:35','2025-11-08 02:16:35'),(31,NULL,'Amrita Puran Singh','2019999999','amrita@example.com',NULL,'customer','2025-11-08 19:39:37','2025-11-08 19:39:37'),(32,NULL,'Amit Singh','9732168122','amitsingh@example.com',NULL,'owner','2025-11-08 19:41:35','2025-11-08 19:41:35'),(33,'jKgoK5Q3XEUfrUPMqpCJAVDZ9PO2','sandeeb adhikari','0000000000','sandeebadhikari@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocK1BFh1FRhKAS92eH8VgmJjyPx9Yfzp5f8PuuAaoJ6ZI1PiJQ=s96-c','owner','2025-11-09 00:25:55','2025-11-09 00:25:55'),(34,'xeCLUrafR7NjX02bK5ItqmNlnDA3','Sandeeb Adhikari','0000000000','adhikarisandeeb@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocKNSfP3YJcah-u3oMTd9anC3CP50696xs191pnauI8mEyZb=s96-c','customer','2025-11-09 03:16:47','2025-11-09 03:16:47'),(35,NULL,'Test Customer','9731110005','test_customer@example.com',NULL,'customer','2025-11-09 06:00:33','2025-11-09 06:00:33'),(36,NULL,'ada mada','9121234567','adamada@gmail.com',NULL,'customer','2025-11-09 17:31:13','2025-11-11 18:41:13'),(37,NULL,'Adam  Sandler','9732168106','adamsandler@gmail.com',NULL,'customer','2025-11-09 17:36:40','2025-11-11 18:41:29'),(38,NULL,'Amanda Nicole','9732168108','amanda@gmail.com',NULL,'customer','2025-11-09 17:54:37','2025-11-09 17:54:37'),(39,NULL,'amanda cole','9002168107','cole@gmail.com',NULL,'customer','2025-11-09 18:35:35','2025-11-09 18:35:35'),(40,NULL,'Mencha menc','9877654321','mench@example.com',NULL,'customer','2025-11-09 18:43:01','2025-11-09 18:43:01'),(41,NULL,'Mark Jr','0987654321','mark@gmail.com',NULL,'customer','2025-11-09 18:55:01','2025-11-09 18:55:01'),(42,NULL,'Marks Sr','0987654322','marks@gmail.com',NULL,'customer','2025-11-09 19:01:08','2025-11-09 19:01:08'),(43,NULL,'Mehem Hemen','9876543210','hemen@gmail.com',NULL,'customer','2025-11-10 15:41:34','2025-11-10 15:41:34'),(44,NULL,'Amme Madam','1020334959','amme@gmail.com',NULL,'customer','2025-11-10 16:14:31','2025-11-10 16:14:31'),(45,NULL,'Ammes Madams','1020334958','ammes@gmail.com',NULL,'customer','2025-11-10 16:15:14','2025-11-10 16:15:14'),(46,NULL,'Tim Cooks','0987654329','apple@examples.com',NULL,'staff','2025-11-11 01:37:45','2025-11-11 03:14:10'),(47,NULL,'Mill Barbers','0987678987','barber@example.com',NULL,'staff','2025-11-11 02:08:50','2025-11-11 03:19:03'),(48,NULL,'Harry Potter','1093849988','harry@example.com',NULL,'customer','2025-11-11 14:42:11','2025-11-11 14:42:11'),(49,NULL,'Sandeeb Adhikari','2017479556','stygo.notification@gmail.com',NULL,'owner','2025-11-11 15:07:10','2025-11-11 15:07:10'),(50,NULL,'New Customer','0987648098','new@emxaple.com',NULL,'customer','2025-11-11 16:29:49','2025-11-11 16:29:49'),(51,NULL,'Neel Bronx','0987653490','neel@example.com',NULL,'customer','2025-11-11 16:48:39','2025-11-11 16:48:39'),(52,NULL,'Sam Sung','1234567890','Samsung@example.com',NULL,'customer','2025-11-11 18:28:48','2025-11-11 18:28:48'),(53,NULL,'Subhash Giri','8627771252','subashchadragiri09@gmail.com',NULL,'customer','2025-11-11 20:58:14','2025-11-11 20:58:14'),(54,NULL,'Subash Chandra Giri','8627771252','subhashchandragiri09@gmail.com',NULL,'owner','2025-11-11 20:59:49','2025-11-11 20:59:49'),(55,'m6RgnkR79wdsYOiAC8fKcPOEmbR2','Luz Elena Grajales','0000000000','luzelenagrajales99@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocILzORcOu-pCisSdo4Z4fD7RwyupFFcLdw1I2cXFE19r5nUmA=s96-c','owner','2025-11-11 21:02:26','2025-11-11 21:02:26'),(56,NULL,'Hager Sahin','9087654120','hager@example.com',NULL,'customer','2025-11-11 22:50:00','2025-11-11 22:50:00'),(57,NULL,'Hager ','098789781','hager1@example.com',NULL,'owner','2025-11-11 22:51:48','2025-11-11 22:51:48'),(58,NULL,'Hager Shahiin','0987654321','hager3@example.com',NULL,'owner','2025-11-11 23:11:00','2025-11-11 23:11:00'),(59,NULL,'Sandeeb Adhikari','0987654325','owner4@example.com',NULL,'owner','2025-11-11 23:40:53','2025-11-11 23:40:53'),(60,NULL,'Nela Shaha','0987654321','salonstyle@example.com',NULL,'owner','2025-11-11 23:50:02','2025-11-11 23:50:02'),(61,NULL,'Master Man','0987654329','master@example.com',NULL,'owner','2025-11-11 23:51:07','2025-11-11 23:51:07'),(62,NULL,'Salon Owner','0987654321','owner5@example.com',NULL,'owner','2025-11-12 00:50:25','2025-11-12 00:50:25'),(63,NULL,'Test Owner','0987654321','salontest@example.com',NULL,'owner','2025-11-12 01:06:27','2025-11-12 01:06:27'),(64,NULL,'Test','0987654323','test@example.com',NULL,'owner','2025-11-12 16:10:45','2025-11-12 16:10:45'),(65,NULL,'Little Owner','0987654323','salonlittle@example.com',NULL,'owner','2025-11-13 16:33:41','2025-11-13 16:33:41'),(66,NULL,'Tim Sam','0987654328','timssalon@example.com',NULL,'owner','2025-11-13 20:17:36','2025-11-13 20:17:36'),(67,'cTw5gRGJn2TxaD1bRme6KP5QkcH2','Aanchal Dhakal','0000000000','aanchaldhakal682@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocKQvYfOc24t_4GrO68OV-VUORQ1qab7ZYZmVk1c1c6oS9lDmQ=s96-c','owner','2025-11-20 09:32:45','2025-11-20 09:32:45'),(68,NULL,'TestSalon Owner','9876543121','testsalon@salon.com',NULL,'owner','2025-11-20 09:37:04','2025-11-20 09:37:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet`
--

DROP TABLE IF EXISTS `wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `wallet_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`wallet_id`),
  UNIQUE KEY `unique_wallet_user` (`user_id`),
  CONSTRAINT `wallet_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet`
--

LOCK TABLES `wallet` WRITE;
/*!40000 ALTER TABLE `wallet` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet_transactions`
--

DROP TABLE IF EXISTS `wallet_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `idx_wallet_txn_wallet` (`wallet_id`),
  CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`wallet_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet_transactions`
--

LOCK TABLES `wallet_transactions` WRITE;
/*!40000 ALTER TABLE `wallet_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `wallet_transactions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-20 14:19:52
