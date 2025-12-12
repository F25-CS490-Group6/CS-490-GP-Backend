-- MySQL dump 10.13  Distrib 9.5.0, for macos14.7 (x86_64)
--
-- Host: localhost    Database: salon_platform
-- ------------------------------------------------------
-- Server version	8.0.43

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
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_services`
--

LOCK TABLES `appointment_services` WRITE;
/*!40000 ALTER TABLE `appointment_services` DISABLE KEYS */;
INSERT INTO `appointment_services` VALUES (6,8,21,120,250.00),(8,17,18,35,45.00),(9,17,16,45,65.00),(10,11,14,20,30.00),(11,11,10,90,120.00),(12,11,9,45,70.00),(13,11,12,30,55.00),(15,10,9,45,70.00),(16,10,12,30,55.00),(17,10,11,90,150.00),(18,10,8,40,60.00),(19,10,21,120,250.00),(24,7,13,15,25.00),(25,7,14,20,30.00),(26,7,10,90,120.00),(27,7,12,30,55.00),(34,21,12,30,55.00),(35,21,11,90,150.00),(36,21,7,30,45.00),(37,22,8,40,60.00),(44,3,11,90,150.00),(45,20,17,25,30.00),(46,20,16,45,65.00),(47,20,15,25,40.00),(48,20,20,50,75.00),(49,23,9,45,70.00),(50,23,12,30,55.00),(51,23,11,90,150.00),(52,24,13,15,25.00),(53,24,10,90,120.00),(54,25,13,15,25.00),(55,25,14,20,30.00),(56,26,14,20,30.00),(57,26,9,45,70.00),(64,33,24,75,150.00),(67,36,31,30,45.00),(68,37,31,30,45.00),(69,38,31,30,45.00),(70,39,31,30,45.00),(71,40,31,30,45.00),(72,41,31,30,45.00),(73,42,31,30,45.00),(74,43,31,30,45.00),(75,44,31,30,45.00),(76,45,31,30,45.00),(77,46,31,30,45.00),(78,47,31,30,45.00),(79,48,31,30,45.00),(80,49,31,30,45.00),(81,50,31,30,45.00),(82,51,31,30,45.00),(83,52,31,30,45.00),(84,53,31,30,45.00),(85,54,31,30,45.00),(86,55,31,30,45.00),(87,56,31,30,45.00),(88,57,31,30,45.00),(89,58,31,30,45.00),(90,59,31,30,45.00),(91,60,31,30,45.00),(92,61,31,30,45.00),(93,62,31,30,45.00),(94,63,31,30,45.00),(95,64,31,30,45.00),(96,65,31,30,45.00),(97,66,31,30,45.00),(98,67,31,30,45.00),(99,68,31,30,45.00),(100,69,31,30,45.00),(101,70,31,30,45.00),(102,71,31,30,45.00),(103,72,31,30,45.00),(104,73,31,30,45.00),(105,74,31,30,45.00),(106,75,31,30,45.00),(107,76,24,75,150.00),(108,77,24,75,150.00),(109,78,31,30,45.00),(110,79,24,75,150.00),(111,80,31,30,45.00),(112,81,31,30,45.00),(113,82,31,30,45.00),(114,83,24,75,150.00),(115,84,24,75,150.00),(116,85,24,75,150.00),(117,86,24,75,150.00),(118,87,24,75,150.00),(119,88,24,75,150.00),(120,89,24,75,150.00),(121,90,24,75,150.00),(123,92,24,75,150.00),(124,93,24,75,150.00),(125,94,24,75,150.00),(126,95,24,75,150.00),(127,96,24,75,150.00),(128,97,24,75,150.00),(129,98,24,75,150.00),(130,99,24,75,150.00),(131,100,24,75,150.00),(132,101,24,75,150.00),(133,102,24,75,150.00),(134,103,24,75,150.00),(135,104,24,75,150.00),(136,105,24,75,150.00),(137,106,31,30,45.00),(138,91,24,75,150.00),(139,107,31,30,45.00),(140,108,24,75,150.00),(141,109,31,30,45.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (2,35,6,NULL,'2025-11-10 14:00:00',50.00,'confirmed','Salon test booking','2025-11-09 06:05:40','2025-11-11 17:24:39'),(3,35,6,NULL,'2025-11-09 14:00:00',150.00,'confirmed','Walk-in haircut for today','2025-11-09 06:41:15','2025-11-11 17:26:07'),(6,19,6,3,'2025-11-10 02:01:00',25.00,'cancelled','warm water','2025-11-09 16:59:35','2025-11-11 18:13:54'),(7,19,6,NULL,'2025-11-10 00:03:00',230.00,'cancelled','warm towel\n','2025-11-09 17:02:00','2025-11-11 18:13:54'),(8,19,6,NULL,'2025-11-10 00:31:00',250.00,'cancelled','new check','2025-11-09 17:29:34','2025-11-11 18:13:54'),(9,36,6,NULL,'2025-11-10 04:31:00',55.00,'cancelled','hellp','2025-11-09 17:31:13','2025-11-11 18:13:54'),(10,37,6,3,'2025-11-10 00:36:00',585.00,'cancelled','adam','2025-11-09 17:36:40','2025-11-11 18:13:54'),(11,38,6,NULL,'2025-11-10 01:54:00',275.00,'cancelled','warm hand','2025-11-09 17:54:37','2025-11-11 18:13:54'),(12,38,6,NULL,'2025-11-10 02:20:00',30.00,'cancelled','today\n','2025-11-09 18:17:50','2025-11-11 18:13:54'),(13,38,6,NULL,'2025-11-10 02:20:00',30.00,'cancelled','today\n','2025-11-09 18:27:18','2025-11-11 18:13:54'),(14,39,6,NULL,'2025-11-10 01:35:00',150.00,'cancelled','hehe','2025-11-09 18:35:35','2025-11-11 18:13:54'),(15,40,6,3,'2025-11-10 01:42:00',55.00,'cancelled','','2025-11-09 18:43:01','2025-11-11 18:13:54'),(16,40,6,NULL,'2025-11-10 00:47:00',70.00,'cancelled','hard hand\n','2025-11-09 18:47:49','2025-11-11 18:13:54'),(17,40,6,NULL,'2025-11-10 00:47:00',110.00,'cancelled','soft hand\n','2025-11-09 18:50:28','2025-11-11 18:13:54'),(18,41,6,NULL,'2025-11-10 01:54:00',60.00,'cancelled','hellp','2025-11-09 18:55:01','2025-11-11 18:13:54'),(19,42,6,NULL,'2025-11-09 15:54:00',120.00,'cancelled','hellp','2025-11-09 19:01:08','2025-11-09 19:13:51'),(20,45,6,NULL,'2025-11-10 13:01:00',210.00,'cancelled','hello hello','2025-11-10 16:25:04','2025-11-11 18:13:54'),(21,43,6,3,'2025-11-11 21:35:00',250.00,'completed','hello','2025-11-11 01:35:57','2025-11-11 16:24:59'),(22,48,6,5,'2025-11-11 11:41:00',60.00,'confirmed','BEST QUALITY','2025-11-11 14:42:11','2025-11-11 16:41:53'),(23,51,6,3,'2025-11-11 01:48:00',275.00,'cancelled','','2025-11-11 16:48:39','2025-11-12 16:11:06'),(24,77,6,17629,'2025-11-22 17:46:00',145.00,'confirmed','Special tratement','2025-11-22 20:45:44','2025-11-22 20:45:44'),(25,33,6,17629,'2025-11-22 16:50:00',55.00,'confirmed','Specail treatment','2025-11-22 20:50:18','2025-11-22 20:50:18'),(26,78,6,5,'2025-11-22 17:57:00',100.00,'confirmed','Hello','2025-11-22 20:57:46','2025-11-22 20:57:46'),(33,86,21,17636,'2025-12-07 12:45:00',150.00,'cancelled','','2025-12-07 18:24:44','2025-12-07 19:56:53'),(36,86,21,17636,'2025-12-08 09:30:00',45.00,'confirmed','','2025-12-07 20:08:48','2025-12-07 20:08:48'),(37,86,21,17636,'2025-12-08 10:00:00',45.00,'confirmed','','2025-12-07 20:20:39','2025-12-07 20:20:39'),(38,86,21,17636,'2025-12-08 10:30:00',45.00,'confirmed','','2025-12-07 20:27:02','2025-12-07 20:27:02'),(39,86,21,17636,'2025-12-08 11:00:00',45.00,'confirmed','','2025-12-07 20:33:31','2025-12-07 20:33:31'),(40,86,21,17636,'2025-12-08 11:30:00',45.00,'confirmed','','2025-12-07 21:24:08','2025-12-07 21:24:08'),(41,86,21,17636,'2025-12-08 12:00:00',45.00,'confirmed','','2025-12-07 21:29:03','2025-12-07 21:29:03'),(42,86,21,17636,'2025-12-08 12:30:00',45.00,'confirmed','','2025-12-07 21:40:26','2025-12-07 21:40:26'),(43,86,21,17636,'2025-12-08 13:00:00',45.00,'confirmed','','2025-12-07 22:13:35','2025-12-07 22:13:35'),(44,86,21,17636,'2025-12-08 09:00:00',45.00,'confirmed','','2025-12-07 22:15:49','2025-12-07 22:15:49'),(45,86,21,17636,'2025-12-08 13:30:00',45.00,'confirmed','','2025-12-07 22:21:29','2025-12-07 22:21:29'),(46,86,21,17636,'2025-12-08 14:00:00',45.00,'confirmed','','2025-12-07 22:22:29','2025-12-07 22:22:29'),(47,86,21,17636,'2025-12-08 14:30:00',45.00,'confirmed','','2025-12-07 22:25:35','2025-12-07 22:25:35'),(48,86,21,17636,'2025-12-08 15:30:00',45.00,'confirmed','','2025-12-07 22:29:20','2025-12-07 22:29:20'),(49,86,21,17636,'2025-12-08 15:00:00',45.00,'confirmed','','2025-12-07 22:34:05','2025-12-07 22:34:05'),(50,86,21,17636,'2025-12-08 16:00:00',45.00,'confirmed','','2025-12-07 22:36:30','2025-12-07 22:36:30'),(51,86,21,17636,'2025-12-08 16:30:00',45.00,'confirmed','','2025-12-07 22:39:19','2025-12-07 22:39:19'),(52,86,21,17636,'2025-12-09 09:00:00',45.00,'confirmed','','2025-12-07 22:41:58','2025-12-07 22:41:58'),(53,86,21,17636,'2025-12-10 09:30:00',45.00,'confirmed','','2025-12-07 22:48:26','2025-12-10 03:58:50'),(54,86,21,17636,'2025-12-11 09:00:00',45.00,'confirmed','','2025-12-07 22:53:13','2025-12-07 22:53:13'),(55,86,21,17636,'2025-12-12 09:00:00',45.00,'confirmed','','2025-12-07 22:54:55','2025-12-07 22:54:55'),(56,86,21,17636,'2025-12-12 09:30:00',45.00,'confirmed','','2025-12-07 23:00:59','2025-12-07 23:00:59'),(57,86,21,17636,'2025-12-12 10:30:00',45.00,'confirmed','','2025-12-07 23:05:27','2025-12-07 23:05:27'),(58,86,21,17636,'2025-12-12 10:00:00',45.00,'confirmed','','2025-12-07 23:08:10','2025-12-07 23:08:10'),(59,86,21,17636,'2025-12-12 12:00:00',45.00,'confirmed','','2025-12-07 23:14:43','2025-12-07 23:14:43'),(60,86,21,17636,'2025-12-09 10:00:00',45.00,'confirmed','','2025-12-07 23:22:54','2025-12-07 23:22:54'),(61,86,21,17636,'2025-12-09 12:00:00',45.00,'confirmed','','2025-12-07 23:26:01','2025-12-08 03:56:56'),(62,86,21,17636,'2025-12-11 10:00:00',45.00,'confirmed','','2025-12-07 23:32:44','2025-12-07 23:32:44'),(63,86,21,17636,'2025-12-11 10:30:00',45.00,'confirmed','','2025-12-07 23:38:19','2025-12-07 23:38:19'),(64,86,21,17636,'2025-12-11 09:30:00',45.00,'confirmed','','2025-12-07 23:40:32','2025-12-07 23:40:32'),(65,86,21,17636,'2025-12-11 11:00:00',45.00,'confirmed','','2025-12-07 23:41:02','2025-12-07 23:41:02'),(66,86,21,17636,'2025-12-09 10:30:00',45.00,'confirmed','','2025-12-07 23:42:49','2025-12-07 23:42:49'),(67,86,21,17636,'2025-12-09 11:30:00',45.00,'confirmed','','2025-12-07 23:47:03','2025-12-07 23:47:03'),(68,86,21,17636,'2025-12-10 10:00:00',45.00,'confirmed','','2025-12-07 23:49:08','2025-12-07 23:49:08'),(69,86,21,17636,'2025-12-19 13:00:00',45.00,'confirmed','','2025-12-07 23:49:41','2025-12-07 23:49:41'),(70,86,21,17636,'2025-12-11 13:00:00',45.00,'confirmed','','2025-12-07 23:51:53','2025-12-07 23:51:53'),(71,86,21,17636,'2025-12-11 13:30:00',45.00,'confirmed','','2025-12-07 23:57:49','2025-12-07 23:57:49'),(72,86,21,17636,'2025-12-12 16:00:00',45.00,'confirmed','','2025-12-08 00:02:30','2025-12-08 00:02:30'),(73,86,21,17636,'2025-12-10 10:30:00',45.00,'confirmed','','2025-12-08 00:04:59','2025-12-08 00:04:59'),(74,95,21,17636,'2025-12-10 11:00:00',45.00,'confirmed','','2025-12-08 00:07:37','2025-12-08 00:07:37'),(75,95,21,17636,'2025-12-18 09:30:00',45.00,'confirmed','','2025-12-08 00:10:30','2025-12-08 00:10:30'),(76,95,21,17636,'2025-12-10 12:45:00',150.00,'confirmed','','2025-12-08 00:11:34','2025-12-08 00:11:34'),(77,86,21,17636,'2025-12-10 14:00:00',150.00,'confirmed','','2025-12-08 00:14:03','2025-12-08 00:14:03'),(78,86,21,17636,'2025-12-18 10:30:00',45.00,'confirmed','','2025-12-08 00:17:25','2025-12-08 00:17:25'),(79,86,21,17636,'2025-12-18 14:00:00',150.00,'confirmed','','2025-12-08 00:21:29','2025-12-08 00:21:29'),(80,86,21,17636,'2025-12-10 11:30:00',45.00,'confirmed','','2025-12-08 00:40:32','2025-12-08 00:40:32'),(81,86,21,17636,'2025-12-10 12:00:00',45.00,'confirmed','','2025-12-08 00:48:07','2025-12-08 00:48:07'),(82,86,21,17636,'2025-12-11 12:30:00',45.00,'confirmed','','2025-12-08 00:48:39','2025-12-08 00:48:39'),(83,86,21,17636,'2025-12-09 14:00:00',150.00,'confirmed','','2025-12-08 00:49:43','2025-12-08 00:49:43'),(84,86,21,17636,'2025-12-12 14:00:00',150.00,'confirmed','','2025-12-08 00:51:43','2025-12-08 00:51:43'),(85,86,21,17636,'2025-12-18 12:45:00',150.00,'confirmed','','2025-12-08 01:01:43','2025-12-08 01:01:43'),(86,86,21,17636,'2025-12-09 12:45:00',150.00,'confirmed','','2025-12-08 01:04:44','2025-12-08 03:56:33'),(87,86,21,17636,'2025-12-18 15:15:00',150.00,'confirmed','','2025-12-08 01:13:37','2025-12-08 01:13:37'),(88,86,21,17636,'2025-12-17 11:30:00',150.00,'confirmed','','2025-12-08 01:16:26','2025-12-08 01:16:26'),(89,86,21,17636,'2025-12-18 11:30:00',150.00,'confirmed','','2025-12-08 01:23:00','2025-12-08 01:23:00'),(90,86,21,17636,'2025-12-19 10:15:00',150.00,'confirmed','','2025-12-08 01:24:46','2025-12-08 01:24:46'),(91,86,21,17636,'2025-12-24 10:15:00',150.00,'cancelled','','2025-12-08 01:28:27','2025-12-09 07:10:57'),(92,86,21,17636,'2025-12-17 10:15:00',150.00,'confirmed','','2025-12-08 01:34:52','2025-12-08 01:34:52'),(93,86,21,17636,'2025-12-17 12:45:00',150.00,'confirmed','','2025-12-08 01:43:21','2025-12-08 01:43:21'),(94,86,21,17636,'2025-12-19 11:30:00',150.00,'confirmed','','2025-12-08 01:44:22','2025-12-08 01:44:22'),(95,86,21,17636,'2025-12-09 15:15:00',150.00,'confirmed','','2025-12-08 01:54:57','2025-12-08 03:55:32'),(96,86,21,17636,'2025-12-22 11:30:00',150.00,'confirmed','','2025-12-08 01:55:20','2025-12-08 01:55:20'),(97,86,21,17636,'2025-12-17 15:15:00',150.00,'confirmed','','2025-12-08 01:58:01','2025-12-09 07:45:29'),(98,86,21,17636,'2025-12-15 10:15:00',150.00,'confirmed','','2025-12-08 02:00:26','2025-12-08 02:00:26'),(99,86,21,17636,'2025-12-16 10:15:00',150.00,'confirmed','','2025-12-08 02:06:32','2025-12-08 02:06:32'),(100,86,21,17636,'2025-12-22 10:15:00',150.00,'confirmed','','2025-12-08 02:06:56','2025-12-08 02:06:56'),(101,86,21,17636,'2025-12-21 10:15:00',150.00,'confirmed','','2025-12-08 02:11:46','2025-12-08 02:11:46'),(102,86,21,17636,'2025-12-17 14:00:00',150.00,'confirmed','','2025-12-08 02:12:04','2025-12-08 02:12:04'),(103,86,21,17636,'2025-12-15 11:30:00',150.00,'confirmed','none!','2025-12-08 02:30:09','2025-12-08 02:30:09'),(104,86,21,17636,'2025-12-22 12:45:00',150.00,'confirmed','','2025-12-08 02:30:58','2025-12-08 02:30:58'),(105,86,21,17636,'2025-12-19 14:00:00',150.00,'confirmed','','2025-12-08 02:32:19','2025-12-08 02:32:19'),(106,86,21,17636,'2025-12-09 11:00:00',45.00,'confirmed','','2025-12-08 02:34:54','2025-12-08 03:55:57'),(107,86,21,17637,'2025-12-10 09:00:00',45.00,'confirmed','','2025-12-09 07:36:21','2025-12-09 07:36:21'),(108,86,21,17636,'2025-12-12 12:45:00',150.00,'confirmed','','2025-12-10 03:52:49','2025-12-10 03:52:49'),(109,86,21,17636,'2025-12-25 09:00:00',45.00,'confirmed','','2025-12-10 04:34:33','2025-12-10 04:34:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth`
--

LOCK TABLES `auth` WRITE;
/*!40000 ALTER TABLE `auth` DISABLE KEYS */;
INSERT INTO `auth` VALUES (7,29,'aanchalowner@example.com','$2b$10$0pn5QMC5zPDlyKniM61Iu.IwmrywMWgIeWXJUTF3lHjyXpgcWCC7.',NULL,0,'2025-11-08 02:14:20','2025-11-08 02:14:20'),(8,30,'sams@example.com','$2b$10$9zKgTZs/WXKmsfgovMHQjecsWB1dntye0lJrTJ/p3VC0gp4V5Gdim','2025-12-06 03:07:48',80,'2025-11-08 02:16:35','2025-12-06 03:07:48'),(9,31,'amrita@example.com','$2b$10$iHkh.2OMRtlpuPsq/2e3Iu1U3DgNX8Qd/UeGPvhqgsUuQB24t6eRu','2025-11-08 19:39:58',1,'2025-11-08 19:39:37','2025-11-08 19:39:58'),(10,32,'amitsingh@example.com','$2b$10$ubeOzUvrdVt4K98l3yU1U.1oBa92O0k7wKhHRQWZWEJtLPV8Sr2ti','2025-11-08 19:41:45',1,'2025-11-08 19:41:35','2025-11-08 19:41:45'),(12,53,'subashchadragiri09@gmail.com','$2b$10$fQ80BwhIU6tlBfL6ZnMfq.gVEdjvyk5ipmr05moY9NSHhfyKguFgG',NULL,0,'2025-11-11 20:58:14','2025-11-11 20:58:14'),(13,54,'subhashchandragiri09@gmail.com','$2b$10$nQx0LYqMq1jrhxEdpgx6UuzoBwZourpyZV6yrfxiKuz0xhKGzQY0K',NULL,0,'2025-11-11 20:59:49','2025-11-11 20:59:49'),(14,56,'hager@example.com','$2b$10$Gq50Dg2n7reRIF5aGncF2O3t/dLcA1H3IPWl8qSN6wHgM.IXh90be','2025-11-11 22:52:04',2,'2025-11-11 22:50:00','2025-11-11 22:52:04'),(15,57,'hager1@example.com','$2b$10$qUTYn/5eO6Rsww1cga0r8euUtAfnt2N4gfaWi91e6NImhsW.KAKl6','2025-11-11 22:52:20',1,'2025-11-11 22:51:48','2025-11-11 22:52:20'),(16,58,'hager3@example.com','$2b$10$vpE9va.SQzq/EpOkO/h92uuvdN5G2qR/7ux2MkscBHkDKjMdaBXQ.','2025-11-11 23:11:19',1,'2025-11-11 23:11:00','2025-11-11 23:11:19'),(17,59,'owner4@example.com','$2b$10$TNPGUzsLOo0D7QFywEmi7eiy2R593j6W9CipkdPD6Z4KQ3a43jbV6','2025-11-20 21:18:58',12,'2025-11-11 23:40:53','2025-11-20 21:18:58'),(18,60,'salonstyle@example.com','$2b$10$WxklnHG.nwPYr6JUtV8Fa.pk3O.0jMkRNfoMxdVK0vUSoRgokseTu',NULL,0,'2025-11-11 23:50:02','2025-11-11 23:50:02'),(19,61,'master@example.com','$2b$10$0bQa1Cu4Kd2AKaLrTHEiFOgd9hZ7NVgSEEdmnRdHGWfhtSHCopGJq','2025-11-11 23:51:15',1,'2025-11-11 23:51:07','2025-11-11 23:51:15'),(20,62,'owner5@example.com','$2b$10$I/Qq/XqvKulpR9TwRrUfiuGQQ0DeU/KnoNAxVzfRiFOywlCoO8MRa','2025-11-12 00:50:37',1,'2025-11-12 00:50:25','2025-11-12 00:50:37'),(21,63,'salontest@example.com','$2b$10$A/5C4DBihPWg.dOvYvr7K.6izBCmcn/j3oOHWzeSqz1mexIizVE/i','2025-11-12 01:06:46',1,'2025-11-12 01:06:27','2025-11-12 01:06:46'),(22,64,'test@example.com','$2b$10$dDeH5Pctma68L9dH0YRQTuygBZCSmxhNURjgnmiBN1hvAnLuTMGwa','2025-11-12 16:11:06',1,'2025-11-12 16:10:45','2025-11-12 16:11:06'),(23,65,'salonlittle@example.com','$2b$10$BXU/in/U/U7eCZwA102L1uvWjEuyLr1zgpGYJ6rGAcPZ2DlHiv7M2','2025-11-13 16:33:54',1,'2025-11-13 16:33:41','2025-11-13 16:33:54'),(24,66,'timssalon@example.com','$2b$10$4IWMD30qrxHvYTMd0SyVCukQZMAXPZqsJCRFvH6wuDtjF.7Uj.GJm','2025-11-13 20:17:48',1,'2025-11-13 20:17:36','2025-11-13 20:17:48'),(25,67,'owner12@example.com','$2b$10$Hd0.AAhOMYbPBLwIb22blOUeN6Bad8hJhF.RHnmzF039yC47apFoG','2025-11-20 21:19:07',5,'2025-11-14 16:05:36','2025-11-20 21:19:07'),(26,70,'testAFL@example.com','$2b$10$DiRPDKf5EhTAmyCk3YVrJeBU9olqJTECviLs/86T3a/VFS3i08hoq','2025-11-14 22:09:12',1,'2025-11-14 22:08:52','2025-11-14 22:09:12'),(27,71,'testAOFL@example.com','$2b$10$XgjX9JJ9hUloVrVW4YzlB.xEGts6mAI7pab0ZZZL6IkqjHf/WKNVe','2025-11-14 23:35:41',24,'2025-11-14 22:12:31','2025-11-14 23:35:41'),(28,72,'testbfl@example.com','$2b$10$Hcrzo3oaSS1Vlm5.2HLU2uCDw0FM94AeI.jlTXwAgQy28f0YcTNG6','2025-11-15 19:48:58',26,'2025-11-14 23:37:13','2025-11-15 19:48:58'),(29,73,'nshahin277@gmail.com','$2b$10$gyYoAOZyjdcgUSttjKg5uuraVt.zej1ICkPtTUtsdOasI.maW.I0e','2025-11-15 18:24:15',2,'2025-11-15 18:06:49','2025-11-15 18:24:15'),(30,74,'test@gmail.com','$2b$10$DDeN/PK/OGpt1OffJMX7i.XZSD9zL/dXLTFvQcQcwSJV7Ar1o1Jq6','2025-11-15 20:01:59',3,'2025-11-15 18:19:43','2025-11-15 20:01:59'),(31,75,'hagershahin4@icloud.com','$2b$10$Sd6K2T/FM3g/pms5tbBICeDOWMVitorqI/CS7avoDgTlROdkKWyju','2025-12-10 03:40:22',8,'2025-11-15 20:00:40','2025-12-10 03:40:22'),(32,79,'amruthaj1206@gmail.com','$2b$10$0NGq3r38PLUB0RAMN9VD/.Um1BNK9kBIahjrOZpu091UC.rsox5Lq','2025-11-26 18:43:16',1,'2025-11-26 18:42:56','2025-11-26 18:43:16'),(37,83,'sidradakhel24@gmail.com','$2b$10$Q6oBA64pGKE5RFD5FcsPNu7D46gdVRZpliCLQf130pft694rqVAVS','2025-12-03 00:56:14',1,'2025-12-03 00:56:03','2025-12-03 00:56:14'),(39,86,'shahinhm483@gmail.com','$2b$10$6VeoyF0lAJHunTzotew5ZefA5VbSrCADpUYTG9R3n.5GJsez0CII2','2025-12-11 21:50:34',40,'2025-12-03 04:33:38','2025-12-11 21:50:34'),(46,93,'manestudio@gmail.com','$2b$10$O.6vw9asLg4Dl8Lwvvk7auBmit.zoAAMeO8woHJmOflfkLxxTqGw6','2025-12-03 05:17:36',1,'2025-12-03 05:17:26','2025-12-03 05:17:36'),(47,94,'stygo.notification@gmail.com','$2b$10$8F5TeSzYowOxkeP02k.RMepbub9WnyLW6EVgvCKaiDvRyvaO.Vjay','2025-12-10 04:44:13',10,'2025-12-03 05:34:30','2025-12-10 04:44:13'),(48,95,'rezo@gmail.com','$2b$10$gRuLm4GyTydTS5Q7xFsUFuWQ0W9BQuPd9aTpWslpI64LN3FxSDK6a','2025-12-10 04:30:36',20,'2025-12-03 05:37:11','2025-12-10 04:30:36'),(49,96,'daguerrero33@gmail.com','$2b$10$gndSubiqfHOc6An9x5oni.ptPJzDVApJIJG5w0v267dYrrezrtAn6','2025-12-05 04:02:07',6,'2025-12-03 15:34:13','2025-12-05 04:02:07'),(50,98,'senahdakhel@gmail.com','$2b$10$brg7lmaRmONQ25Mndy9ZKO3qu5vifIVCChoHLef6EnxoPl6Ub26l6','2025-12-04 00:17:22',1,'2025-12-04 00:17:12','2025-12-04 00:17:22'),(51,101,'toriy93614@datehype.com','$2b$10$vFCok/ywu.6MtEabLl8t1e7Hh3LRZhM.7qQwyufhGW98eGwxq.hqC','2025-12-05 03:54:29',2,'2025-12-04 00:32:09','2025-12-05 03:54:29'),(52,103,'sdakhel99@gmail.com','$2b$10$pBWUXljGxjkMO4z41pJdW.l0veygbBiWMCr.oBTFMWE2haHoKnxHi','2025-12-05 19:03:55',1,'2025-12-05 19:03:38','2025-12-05 19:03:55'),(53,105,'bobthebarber@gmail.com','$2b$10$RyoG.vh2UBc/vhWWoPcy.e2LGIEJziAOUVG4WbvMPdHCMschuhlj2','2025-12-06 07:22:12',2,'2025-12-06 06:17:12','2025-12-06 07:22:12'),(55,106,'nawalhanafy@gmail.com','$2b$10$pj6Jw8iyximGJMxhiR69au8lPbIf7q7khaNw5yPcgqZM/amHqggna','2025-12-08 04:15:47',1,'2025-12-08 04:15:29','2025-12-08 04:15:47'),(56,107,'freddy@gmail.com','$2b$10$/OBi6/3A012beQxD/1lnEuFntpbjMXZ3hFaVJzRK/vJP6OYdVny7K','2025-12-11 21:38:16',3,'2025-12-11 21:32:32','2025-12-11 21:38:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (119,3,NULL,31,1,45.00,'service','Appointment #74','2025-12-08 00:11:35','2025-12-08 00:11:35'),(120,3,NULL,31,1,45.00,'service','Appointment #75','2025-12-08 00:11:35','2025-12-08 00:11:35'),(121,3,NULL,24,1,150.00,'service','Appointment #76','2025-12-08 00:11:35','2025-12-08 00:11:35'),(185,4,NULL,24,1,150.00,'service','Appointment #108','2025-12-10 03:52:51','2025-12-10 03:52:51'),(186,4,NULL,31,1,45.00,'service','Appointment #109','2025-12-10 04:34:33','2025-12-10 04:34:33');
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
  `status` enum('active','checked_out','abandoned','pending_payment') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `user_id` (`user_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,86,21,'checked_out','2025-12-07 16:40:03','2025-12-07 22:42:01'),(2,86,21,'checked_out','2025-12-07 20:20:42','2025-12-08 02:31:25'),(3,95,21,'active','2025-12-08 00:07:12','2025-12-08 00:07:12'),(4,86,21,'active','2025-12-08 02:32:20','2025-12-10 03:52:51');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty`
--

LOCK TABLES `loyalty` WRITE;
/*!40000 ALTER TABLE `loyalty` DISABLE KEYS */;
INSERT INTO `loyalty` VALUES (1,86,21,55,'2025-12-08 02:35:42','2025-12-08 02:35:42','2025-12-08 01:42:28','2025-12-08 02:35:42');
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
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_queue`
--

LOCK TABLES `notification_queue` WRITE;
/*!40000 ALTER TABLE `notification_queue` DISABLE KEYS */;
INSERT INTO `notification_queue` VALUES (1,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 9:00:00 AM','email','2025-12-08 09:00:00',1,'2025-12-07 22:41:59'),(2,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 9:00:00 AM','email','2025-12-09 09:00:00',1,'2025-12-07 22:48:27'),(3,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 9:00:00 AM','email','2025-12-10 09:00:00',1,'2025-12-07 22:53:14'),(4,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 9:00:00 AM','email','2025-12-11 09:00:00',1,'2025-12-07 22:54:56'),(5,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 9:30:00 AM','email','2025-12-11 09:30:00',1,'2025-12-07 23:01:01'),(6,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 10:30:00 AM','email','2025-12-11 10:30:00',1,'2025-12-07 23:05:28'),(7,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 10:00:00 AM','email','2025-12-11 10:00:00',1,'2025-12-07 23:08:12'),(8,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 12:00:00 PM','email','2025-12-11 12:00:00',1,'2025-12-07 23:14:46'),(9,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 10:00:00 AM','email','2025-12-08 10:00:00',1,'2025-12-07 23:22:55'),(10,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/25/2025, 9:30:00 AM','email','2025-12-24 09:30:00',1,'2025-12-07 23:26:02'),(11,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 10:00:00 AM','email','2025-12-10 10:00:00',1,'2025-12-07 23:32:45'),(12,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 10:30:00 AM','email','2025-12-10 10:30:00',1,'2025-12-07 23:38:20'),(13,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 9:30:00 AM','email','2025-12-10 09:30:00',1,'2025-12-07 23:40:33'),(14,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 11:00:00 AM','email','2025-12-10 11:00:00',1,'2025-12-07 23:41:03'),(15,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 10:30:00 AM','email','2025-12-08 10:30:00',1,'2025-12-07 23:42:50'),(16,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 11:30:00 AM','email','2025-12-08 11:30:00',1,'2025-12-07 23:47:04'),(17,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 10:00:00 AM','email','2025-12-09 10:00:00',1,'2025-12-07 23:49:09'),(18,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/19/2025, 1:00:00 PM','email','2025-12-18 13:00:00',1,'2025-12-07 23:49:42'),(19,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 1:00:00 PM','email','2025-12-10 13:00:00',1,'2025-12-07 23:51:54'),(20,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 1:30:00 PM','email','2025-12-10 13:30:00',1,'2025-12-07 23:57:50'),(21,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 4:00:00 PM','email','2025-12-11 16:00:00',1,'2025-12-08 00:02:31'),(22,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 10:30:00 AM','email','2025-12-09 10:30:00',1,'2025-12-08 00:05:00'),(23,95,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 11:00:00 AM','email','2025-12-09 11:00:00',1,'2025-12-08 00:07:38'),(24,95,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 9:30:00 AM','email','2025-12-17 09:30:00',0,'2025-12-08 00:10:31'),(25,95,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 12:45:00 PM','email','2025-12-09 12:45:00',1,'2025-12-08 00:11:35'),(26,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 2:00:00 PM','email','2025-12-09 14:00:00',1,'2025-12-08 00:14:04'),(27,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 10:30:00 AM','email','2025-12-17 10:30:00',1,'2025-12-08 00:17:26'),(28,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 2:00:00 PM','email','2025-12-17 14:00:00',1,'2025-12-08 00:21:30'),(29,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 11:30:00 AM','email','2025-12-09 11:30:00',1,'2025-12-08 00:40:33'),(30,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 12:00:00 PM','email','2025-12-09 12:00:00',1,'2025-12-08 00:48:08'),(31,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/11/2025, 12:30:00 PM','email','2025-12-10 12:30:00',1,'2025-12-08 00:48:40'),(32,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 2:00:00 PM','email','2025-12-08 14:00:00',1,'2025-12-08 00:49:44'),(33,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 2:00:00 PM','email','2025-12-11 14:00:00',1,'2025-12-08 00:51:44'),(34,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 12:45:00 PM','email','2025-12-17 12:45:00',1,'2025-12-08 01:01:44'),(35,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/25/2025, 11:30:00 AM','email','2025-12-24 11:30:00',1,'2025-12-08 01:04:45'),(36,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 3:15:00 PM','email','2025-12-17 15:15:00',1,'2025-12-08 01:13:38'),(37,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/17/2025, 11:30:00 AM','email','2025-12-16 11:30:00',1,'2025-12-08 01:16:27'),(38,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/18/2025, 11:30:00 AM','email','2025-12-17 11:30:00',1,'2025-12-08 01:23:01'),(39,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/19/2025, 10:15:00 AM','email','2025-12-18 10:15:00',1,'2025-12-08 01:24:48'),(40,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/24/2025, 10:15:00 AM','email','2025-12-23 10:15:00',1,'2025-12-08 01:28:28'),(41,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/17/2025, 10:15:00 AM','email','2025-12-16 10:15:00',1,'2025-12-08 01:34:53'),(42,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/17/2025, 12:45:00 PM','email','2025-12-16 12:45:00',1,'2025-12-08 01:43:22'),(43,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/19/2025, 11:30:00 AM','email','2025-12-18 11:30:00',1,'2025-12-08 01:44:23'),(44,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/29/2025, 11:30:00 AM','email','2025-12-28 11:30:00',1,'2025-12-08 01:54:58'),(45,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/22/2025, 11:30:00 AM','email','2025-12-21 11:30:00',1,'2025-12-08 01:55:21'),(46,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/23/2025, 10:15:00 AM','email','2025-12-22 10:15:00',1,'2025-12-08 01:58:02'),(47,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/15/2025, 10:15:00 AM','email','2025-12-14 10:15:00',1,'2025-12-08 02:00:27'),(48,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/16/2025, 10:15:00 AM','email','2025-12-15 10:15:00',1,'2025-12-08 02:06:33'),(49,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/22/2025, 10:15:00 AM','email','2025-12-21 10:15:00',1,'2025-12-08 02:06:57'),(50,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/21/2025, 10:15:00 AM','email','2025-12-20 10:15:00',1,'2025-12-08 02:11:47'),(51,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/17/2025, 2:00:00 PM','email','2025-12-16 14:00:00',1,'2025-12-08 02:12:05'),(52,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/15/2025, 11:30:00 AM','email','2025-12-14 11:30:00',1,'2025-12-08 02:30:10'),(53,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/22/2025, 12:45:00 PM','email','2025-12-21 12:45:00',1,'2025-12-08 02:30:59'),(54,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/19/2025, 2:00:00 PM','email','2025-12-18 14:00:00',1,'2025-12-08 02:32:20'),(55,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/26/2025, 3:30:00 PM','email','2025-12-25 15:30:00',1,'2025-12-08 02:34:55'),(56,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 3:15:00 PM','email','2025-12-08 15:15:00',1,'2025-12-08 03:55:32'),(57,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 11:00:00 AM','email','2025-12-08 11:00:00',1,'2025-12-08 03:55:57'),(58,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 12:45:00 PM','email','2025-12-08 12:45:00',1,'2025-12-08 03:56:33'),(59,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/9/2025, 12:00:00 PM','email','2025-12-08 12:00:00',1,'2025-12-08 03:56:56'),(60,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/10/2025, 9:00:00 AM','email','2025-12-09 09:00:00',1,'2025-12-09 07:36:22'),(61,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/17/2025, 3:15:00 PM','email','2025-12-16 15:15:00',1,'2025-12-09 07:45:29'),(62,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/12/2025, 12:45:00 PM','email','2025-12-11 12:45:00',1,'2025-12-10 03:52:51'),(63,86,'Reminder: You have an appointment at Rezo Hair Salon on 12/25/2025, 9:00:00 AM','email','2025-12-24 09:00:00',0,'2025-12-10 04:34:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=190 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 10:15 AM. Waiting for approval.',1,'2025-12-07 15:57:31'),(2,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 10:15 AM',1,'2025-12-07 15:57:31'),(3,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 11:30 AM. Waiting for approval.',1,'2025-12-07 16:02:58'),(4,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 11:30 AM',1,'2025-12-07 16:02:58'),(5,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 12:45 PM. Waiting for approval.',1,'2025-12-07 16:31:44'),(6,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 12:45 PM',1,'2025-12-07 16:31:44'),(7,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 2:00 PM. Waiting for approval.',1,'2025-12-07 16:32:22'),(8,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 2:00 PM',1,'2025-12-07 16:32:22'),(9,86,'appointment','Appointment request sent for Rezo Hair Salon on Sun, Dec 7, 2:00 PM. Waiting for approval.',1,'2025-12-07 18:18:29'),(10,95,'appointment','Appointment requested: Hager Shahin on Sun, Dec 7, 2:00 PM',1,'2025-12-07 18:18:29'),(11,86,'appointment','Appointment request sent for Rezo Hair Salon on Sun, Dec 7, 3:15 PM. Waiting for approval.',1,'2025-12-07 18:22:06'),(12,95,'appointment','Appointment requested: Hager Shahin on Sun, Dec 7, 3:15 PM',1,'2025-12-07 18:22:06'),(13,86,'appointment','Appointment request sent for Rezo Hair Salon on Sun, Dec 7, 12:45 PM. Waiting for approval.',1,'2025-12-07 18:24:44'),(14,95,'appointment','Appointment requested: Hager Shahin on Sun, Dec 7, 12:45 PM',1,'2025-12-07 18:24:44'),(15,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 9:00 AM. Waiting for approval.',1,'2025-12-07 19:16:21'),(16,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 9:00 AM',1,'2025-12-07 19:16:21'),(17,86,'appointment','Appointment request sent for Rezo Hair Salon on Mon, Dec 8, 3:15 PM. Waiting for approval.',1,'2025-12-07 19:30:01'),(18,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 3:15 PM',1,'2025-12-07 19:30:01'),(19,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 3:15 PM has been cancelled.',1,'2025-12-07 19:56:23'),(20,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 3:15 PM',1,'2025-12-07 19:56:23'),(21,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 2:00 PM has been cancelled.',1,'2025-12-07 19:56:26'),(22,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 2:00 PM',1,'2025-12-07 19:56:26'),(23,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 12:45 PM has been cancelled.',1,'2025-12-07 19:56:29'),(24,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 12:45 PM',1,'2025-12-07 19:56:29'),(25,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 11:30 AM has been cancelled.',1,'2025-12-07 19:56:32'),(26,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 11:30 AM',1,'2025-12-07 19:56:32'),(27,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 10:15 AM has been cancelled.',1,'2025-12-07 19:56:37'),(28,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 10:15 AM',1,'2025-12-07 19:56:37'),(29,86,'appointment','Your appointment request at Rezo Hair Salon on Mon, Dec 8, 9:00 AM has been cancelled.',1,'2025-12-07 19:56:42'),(30,95,'appointment','You cancelled Hager Shahin\'s appointment on Mon, Dec 8, 9:00 AM',1,'2025-12-07 19:56:42'),(31,86,'appointment','Your appointment request at Rezo Hair Salon on Sun, Dec 7, 3:15 PM has been cancelled.',1,'2025-12-07 19:56:45'),(32,95,'appointment','You cancelled Hager Shahin\'s appointment on Sun, Dec 7, 3:15 PM',1,'2025-12-07 19:56:45'),(33,86,'appointment','Your appointment request at Rezo Hair Salon on Sun, Dec 7, 2:00 PM has been cancelled.',1,'2025-12-07 19:56:49'),(34,95,'appointment','You cancelled Hager Shahin\'s appointment on Sun, Dec 7, 2:00 PM',1,'2025-12-07 19:56:49'),(35,86,'appointment','Your appointment request at Rezo Hair Salon on Sun, Dec 7, 12:45 PM has been cancelled.',1,'2025-12-07 19:56:53'),(36,95,'appointment','You cancelled Hager Shahin\'s appointment on Sun, Dec 7, 12:45 PM',1,'2025-12-07 19:56:53'),(37,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 9:30 AM.',1,'2025-12-07 20:08:48'),(38,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 9:30 AM',1,'2025-12-07 20:08:48'),(39,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 10:00 AM.',1,'2025-12-07 20:20:39'),(40,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 10:00 AM',1,'2025-12-07 20:20:39'),(41,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 10:30 AM.',1,'2025-12-07 20:27:02'),(42,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 10:30 AM',1,'2025-12-07 20:27:02'),(43,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 11:00 AM.',1,'2025-12-07 20:33:31'),(44,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 11:00 AM',1,'2025-12-07 20:33:31'),(45,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 11:30 AM.',1,'2025-12-07 21:24:08'),(46,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 11:30 AM',1,'2025-12-07 21:24:08'),(47,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 12:00 PM.',1,'2025-12-07 21:29:03'),(48,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 12:00 PM',1,'2025-12-07 21:29:03'),(49,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 12:30 PM.',1,'2025-12-07 21:40:26'),(50,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 12:30 PM',1,'2025-12-07 21:40:26'),(51,86,'appointment','Your appointment at Rezo Hair Salon requires a $12.15 deposit. Please check your email to complete the deposit payment.',1,'2025-12-07 21:40:48'),(52,95,'appointment','New appointment requires deposit payment. Customer will pay remaining balance in store.',1,'2025-12-07 21:40:48'),(53,86,'appointment','Your appointment at Rezo Hair Salon requires a $12.15 deposit. Please check your email to complete the deposit payment.',1,'2025-12-07 21:42:55'),(54,95,'appointment','New appointment requires deposit payment. Customer will pay remaining balance in store.',1,'2025-12-07 21:42:55'),(55,86,'appointment','Your appointment at Rezo Hair Salon requires a $12.15 deposit. Please check your email to complete the deposit payment.',1,'2025-12-07 21:57:56'),(56,95,'appointment','New appointment requires deposit payment. Customer will pay remaining balance in store.',1,'2025-12-07 21:57:56'),(57,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 1:00 PM.',1,'2025-12-07 22:13:35'),(58,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 1:00 PM',1,'2025-12-07 22:13:35'),(59,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 9:00 AM.',1,'2025-12-07 22:15:49'),(60,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 9:00 AM',1,'2025-12-07 22:15:49'),(61,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 1:30 PM.',1,'2025-12-07 22:21:29'),(62,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 1:30 PM',1,'2025-12-07 22:21:29'),(63,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 2:00 PM.',1,'2025-12-07 22:22:29'),(64,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 2:00 PM',1,'2025-12-07 22:22:29'),(65,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 2:30 PM.',1,'2025-12-07 22:25:35'),(66,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 2:30 PM',1,'2025-12-07 22:25:35'),(67,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 3:30 PM.',1,'2025-12-07 22:29:20'),(68,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 3:30 PM',1,'2025-12-07 22:29:20'),(69,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 3:00 PM.',1,'2025-12-07 22:34:05'),(70,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 3:00 PM',1,'2025-12-07 22:34:05'),(71,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 4:00 PM.',1,'2025-12-07 22:36:30'),(72,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 4:00 PM',1,'2025-12-07 22:36:30'),(73,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 8, 4:30 PM.',1,'2025-12-07 22:39:19'),(74,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 8, 4:30 PM',1,'2025-12-07 22:39:19'),(75,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 9, 9:00 AM.',1,'2025-12-07 22:41:58'),(76,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 9, 9:00 AM',1,'2025-12-07 22:41:58'),(77,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 9:00 AM.',1,'2025-12-07 22:48:26'),(78,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 9:00 AM',1,'2025-12-07 22:48:26'),(79,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 9:00 AM.',1,'2025-12-07 22:53:13'),(80,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 9:00 AM',1,'2025-12-07 22:53:13'),(81,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 9:00 AM.',1,'2025-12-07 22:54:55'),(82,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 9:00 AM',1,'2025-12-07 22:54:55'),(83,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 9:30 AM.',1,'2025-12-07 23:00:59'),(84,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 9:30 AM',1,'2025-12-07 23:00:59'),(85,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 10:30 AM.',1,'2025-12-07 23:05:27'),(86,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 10:30 AM',1,'2025-12-07 23:05:27'),(87,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 10:00 AM.',1,'2025-12-07 23:08:10'),(88,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 10:00 AM',1,'2025-12-07 23:08:10'),(89,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 12:00 PM.',1,'2025-12-07 23:14:43'),(90,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 12:00 PM',1,'2025-12-07 23:14:43'),(91,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 9, 10:00 AM.',1,'2025-12-07 23:22:54'),(92,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 9, 10:00 AM',1,'2025-12-07 23:22:54'),(93,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 25, 9:30 AM.',1,'2025-12-07 23:26:01'),(94,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 25, 9:30 AM',1,'2025-12-07 23:26:01'),(95,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 10:00 AM.',1,'2025-12-07 23:32:44'),(96,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 10:00 AM',1,'2025-12-07 23:32:44'),(97,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 10:30 AM.',1,'2025-12-07 23:38:19'),(98,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 10:30 AM',1,'2025-12-07 23:38:19'),(99,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 9:30 AM.',1,'2025-12-07 23:40:32'),(100,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 9:30 AM',1,'2025-12-07 23:40:32'),(101,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 11:00 AM.',1,'2025-12-07 23:41:02'),(102,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 11:00 AM',1,'2025-12-07 23:41:02'),(103,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 9, 10:30 AM.',1,'2025-12-07 23:42:49'),(104,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 9, 10:30 AM',1,'2025-12-07 23:42:49'),(105,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 9, 11:30 AM.',1,'2025-12-07 23:47:03'),(106,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 9, 11:30 AM',1,'2025-12-07 23:47:03'),(107,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 10:00 AM.',1,'2025-12-07 23:49:08'),(108,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 10:00 AM',1,'2025-12-07 23:49:08'),(109,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 19, 1:00 PM.',1,'2025-12-07 23:49:41'),(110,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 19, 1:00 PM',1,'2025-12-07 23:49:41'),(111,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 1:00 PM.',1,'2025-12-07 23:51:53'),(112,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 1:00 PM',1,'2025-12-07 23:51:53'),(113,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 1:30 PM.',1,'2025-12-07 23:57:49'),(114,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 1:30 PM',1,'2025-12-07 23:57:49'),(115,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 4:00 PM.',1,'2025-12-08 00:02:30'),(116,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 4:00 PM',1,'2025-12-08 00:02:30'),(117,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 10:30 AM.',1,'2025-12-08 00:04:59'),(118,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 10:30 AM',1,'2025-12-08 00:04:59'),(119,95,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 11:00 AM.',1,'2025-12-08 00:07:37'),(120,95,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 9:30 AM.',1,'2025-12-08 00:10:30'),(121,95,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 12:45 PM.',1,'2025-12-08 00:11:34'),(122,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 2:00 PM.',1,'2025-12-08 00:14:03'),(123,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 2:00 PM',1,'2025-12-08 00:14:03'),(124,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 10:30 AM.',1,'2025-12-08 00:17:25'),(125,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 18, 10:30 AM',1,'2025-12-08 00:17:25'),(126,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 2:00 PM.',1,'2025-12-08 00:21:29'),(127,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 18, 2:00 PM',1,'2025-12-08 00:21:29'),(128,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 11:30 AM.',1,'2025-12-08 00:40:32'),(129,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 11:30 AM',1,'2025-12-08 00:40:32'),(130,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 12:00 PM.',1,'2025-12-08 00:48:07'),(131,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 10, 12:00 PM',1,'2025-12-08 00:48:07'),(132,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 11, 12:30 PM.',1,'2025-12-08 00:48:39'),(133,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 11, 12:30 PM',1,'2025-12-08 00:48:39'),(134,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 9, 2:00 PM.',1,'2025-12-08 00:49:43'),(135,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 9, 2:00 PM',1,'2025-12-08 00:49:43'),(136,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 2:00 PM.',1,'2025-12-08 00:51:43'),(137,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 12, 2:00 PM',1,'2025-12-08 00:51:43'),(138,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 12:45 PM.',1,'2025-12-08 01:01:43'),(139,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 18, 12:45 PM',1,'2025-12-08 01:01:43'),(140,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 25, 11:30 AM.',1,'2025-12-08 01:04:44'),(141,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 25, 11:30 AM',1,'2025-12-08 01:04:44'),(142,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 3:15 PM.',1,'2025-12-08 01:13:37'),(143,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 18, 3:15 PM',1,'2025-12-08 01:13:37'),(144,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 17, 11:30 AM.',1,'2025-12-08 01:16:26'),(145,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 17, 11:30 AM',1,'2025-12-08 01:16:26'),(146,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 18, 11:30 AM.',1,'2025-12-08 01:23:00'),(147,95,'appointment','Appointment requested: Hager Shahin on Thu, Dec 18, 11:30 AM',1,'2025-12-08 01:23:00'),(148,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 19, 10:15 AM.',1,'2025-12-08 01:24:46'),(149,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 19, 10:15 AM',1,'2025-12-08 01:24:46'),(150,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 24, 10:15 AM.',1,'2025-12-08 01:28:27'),(151,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 24, 10:15 AM',1,'2025-12-08 01:28:27'),(152,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 17, 10:15 AM.',1,'2025-12-08 01:34:52'),(153,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 17, 10:15 AM',1,'2025-12-08 01:34:52'),(154,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 17, 12:45 PM.',1,'2025-12-08 01:43:21'),(155,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 17, 12:45 PM',1,'2025-12-08 01:43:21'),(156,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 19, 11:30 AM.',1,'2025-12-08 01:44:22'),(157,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 19, 11:30 AM',1,'2025-12-08 01:44:22'),(158,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 29, 11:30 AM.',1,'2025-12-08 01:54:57'),(159,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 29, 11:30 AM',1,'2025-12-08 01:54:57'),(160,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 22, 11:30 AM.',1,'2025-12-08 01:55:20'),(161,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 22, 11:30 AM',1,'2025-12-08 01:55:20'),(162,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 23, 10:15 AM.',1,'2025-12-08 01:58:01'),(163,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 23, 10:15 AM',1,'2025-12-08 01:58:01'),(164,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 15, 10:15 AM.',1,'2025-12-08 02:00:26'),(165,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 15, 10:15 AM',1,'2025-12-08 02:00:26'),(166,86,'appointment','Appointment confirmed for Rezo Hair Salon on Tue, Dec 16, 10:15 AM.',1,'2025-12-08 02:06:32'),(167,95,'appointment','Appointment requested: Hager Shahin on Tue, Dec 16, 10:15 AM',1,'2025-12-08 02:06:32'),(168,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 22, 10:15 AM.',1,'2025-12-08 02:06:56'),(169,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 22, 10:15 AM',1,'2025-12-08 02:06:56'),(170,86,'appointment','Appointment confirmed for Rezo Hair Salon on Sun, Dec 21, 10:15 AM.',1,'2025-12-08 02:11:46'),(171,95,'appointment','Appointment requested: Hager Shahin on Sun, Dec 21, 10:15 AM',1,'2025-12-08 02:11:46'),(172,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 17, 2:00 PM.',1,'2025-12-08 02:12:04'),(173,95,'appointment','Appointment requested: Hager Shahin on Wed, Dec 17, 2:00 PM',1,'2025-12-08 02:12:04'),(174,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 15, 11:30 AM.',1,'2025-12-08 02:30:09'),(175,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 15, 11:30 AM',1,'2025-12-08 02:30:09'),(176,86,'appointment','Appointment confirmed for Rezo Hair Salon on Mon, Dec 22, 12:45 PM.',1,'2025-12-08 02:30:58'),(177,95,'appointment','Appointment requested: Hager Shahin on Mon, Dec 22, 12:45 PM',1,'2025-12-08 02:30:58'),(178,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 19, 2:00 PM.',1,'2025-12-08 02:32:19'),(179,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 19, 2:00 PM',1,'2025-12-08 02:32:19'),(180,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 26, 3:30 PM.',1,'2025-12-08 02:34:54'),(181,95,'appointment','Appointment requested: Hager Shahin on Fri, Dec 26, 3:30 PM',1,'2025-12-08 02:34:54'),(182,86,'appointment','Appointment confirmed for Rezo Hair Salon on Wed, Dec 10, 9:00 AM.',1,'2025-12-09 07:36:21'),(183,95,'appointment','Appointment requested: Elysa Rod on Wed, Dec 10, 9:00 AM',0,'2025-12-09 07:36:21'),(184,86,'appointment','Appointment confirmed for Rezo Hair Salon on Fri, Dec 12, 12:45 PM.',1,'2025-12-10 03:52:49'),(185,95,'appointment','Appointment requested: Elysa Rod on Fri, Dec 12, 12:45 PM',0,'2025-12-10 03:52:49'),(186,86,'appointment','Your appointment at Rezo Hair Salon requires a $37.50 deposit. Please check your email to complete the deposit payment.',1,'2025-12-10 03:53:00'),(187,95,'appointment','New appointment requires deposit payment. Customer will pay remaining balance in store.',0,'2025-12-10 03:53:00'),(188,86,'appointment','Appointment confirmed for Rezo Hair Salon on Thu, Dec 25, 9:00 AM.',1,'2025-12-10 04:34:33'),(189,95,'appointment','Appointment requested: Elysa Rod on Thu, Dec 25, 9:00 AM',0,'2025-12-10 04:34:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,5,NULL,1,15.00,'product');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,86,21,15.00,44,'paid','completed','2025-12-08 02:31:25','2025-12-08 02:31:25');
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
  `payment_method` enum('card','paypal','cash','wallet','stripe') DEFAULT 'card',
  `payment_status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `stripe_checkout_session_id` varchar(255) DEFAULT NULL,
  `payment_link` text,
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL,
  `failure_reason` text,
  `transaction_ref` varchar(100) DEFAULT NULL,
  `card_id` int DEFAULT NULL,
  `appointment_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `user_id` (`user_id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `card_id` (`card_id`),
  KEY `idx_stripe_session` (`stripe_checkout_session_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`card_id`) REFERENCES `saved_cards` (`card_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,86,194.40,'stripe','pending','cs_test_b1Bl0yv4n2cqi7ogQamknXcfpIIVQRNdhIZ2rQcwg88qYR3HJsZS1OJPFh','https://checkout.stripe.com/c/pay/cs_test_b1Bl0yv4n2cqi7ogQamknXcfpIIVQRNdhIZ2rQcwg88qYR3HJsZS1OJPFh#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 16:09:42','2025-12-07 16:09:42'),(2,86,162.00,'stripe','pending','cs_test_a1JeKLHFo4YkBDtQaOjqDOrz89HKp78l61LfnZr2HhLrWrU637c6KfP98v','https://checkout.stripe.com/c/pay/cs_test_a1JeKLHFo4YkBDtQaOjqDOrz89HKp78l61LfnZr2HhLrWrU637c6KfP98v#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 16:34:22','2025-12-07 16:34:22'),(3,86,480.00,'stripe','pending','cs_test_b16OMmpIgKRDO2EoXHgGXc91nBHlGLxq1V7Xw8LK5rGHURUeJgp35g922b','https://checkout.stripe.com/c/pay/cs_test_b16OMmpIgKRDO2EoXHgGXc91nBHlGLxq1V7Xw8LK5rGHURUeJgp35g922b#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 16:43:08','2025-12-07 16:43:08'),(4,86,660.00,'stripe','pending','cs_test_b19EMbL1ghzn4Gajw7dxxnDXw1A51wPTZ8QSaCD0wXNI7gAAXKXTUDGTMA','https://checkout.stripe.com/c/pay/cs_test_b19EMbL1ghzn4Gajw7dxxnDXw1A51wPTZ8QSaCD0wXNI7gAAXKXTUDGTMA#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 16:44:17','2025-12-07 16:44:17'),(5,86,5940.00,'stripe','pending','cs_test_b1aHWGlim5yOalHGsd0S8KUEsbtw6grc0DNpSmPG0XaJNcGGzyHebJQHgX','https://checkout.stripe.com/c/pay/cs_test_b1aHWGlim5yOalHGsd0S8KUEsbtw6grc0DNpSmPG0XaJNcGGzyHebJQHgX#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 19:30:14','2025-12-07 19:30:14'),(6,86,6090.00,'stripe','pending','cs_test_b1QNvQJpjZYLEbFATHNT9XUEtc1Jvo4aN9H20GzSfsjyGrewrToP0rQ59V','https://checkout.stripe.com/c/pay/cs_test_b1QNvQJpjZYLEbFATHNT9XUEtc1Jvo4aN9H20GzSfsjyGrewrToP0rQ59V#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 20:09:09','2025-12-07 20:09:09'),(7,86,6210.00,'stripe','pending','cs_test_b162Mqar9mHmAaHBaTgf9bvrVz6otjqxpp2IJxiteeZBBLbTTaqJiUXAwG','https://checkout.stripe.com/c/pay/cs_test_b162Mqar9mHmAaHBaTgf9bvrVz6otjqxpp2IJxiteeZBBLbTTaqJiUXAwG#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 20:15:15','2025-12-07 20:15:15'),(8,86,6270.00,'stripe','pending','cs_test_b14ZGsfcIEqORpMLia218RSx2KHDUWkahVRwja3FQylZiErhzOg1fn8mYz','https://checkout.stripe.com/c/pay/cs_test_b14ZGsfcIEqORpMLia218RSx2KHDUWkahVRwja3FQylZiErhzOg1fn8mYz#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 20:16:19','2025-12-07 20:16:19'),(9,86,150.00,'stripe','pending','cs_test_b1ZZrBjyIqIUrTcbYZhQGBtqrfHHWKCzkBd8B8joXnKPkPSHJkd90Sjbkx','https://checkout.stripe.com/c/pay/cs_test_b1ZZrBjyIqIUrTcbYZhQGBtqrfHHWKCzkBd8B8joXnKPkPSHJkd90Sjbkx#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 20:20:52','2025-12-07 20:20:52'),(10,86,105.00,'stripe','pending','cs_test_b1QyFZMPpprfcLIYVbkUdKWJsWNwT6ofC7sOe9mz9m2qbYcyinUbzCrK41','https://checkout.stripe.com/c/pay/cs_test_b1QyFZMPpprfcLIYVbkUdKWJsWNwT6ofC7sOe9mz9m2qbYcyinUbzCrK41#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 20:27:11','2025-12-07 20:27:11'),(11,86,48.60,'stripe','pending','cs_test_a1ti8kN1YHn4zZjeCHEAtmgsWYDPWm09za9nIymHVi2tEFvyVPkOSwqGsZ','https://checkout.stripe.com/c/pay/cs_test_a1ti8kN1YHn4zZjeCHEAtmgsWYDPWm09za9nIymHVi2tEFvyVPkOSwqGsZ#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,39,'2025-12-07 20:36:29','2025-12-07 20:36:29'),(12,86,210.00,'stripe','pending','cs_test_b1azrn7E4BW6cjiyCtP0GiN0K51q4kSNZ4q5eQlzwXDNhYTUDgOrbFY0dE','https://checkout.stripe.com/c/pay/cs_test_b1azrn7E4BW6cjiyCtP0GiN0K51q4kSNZ4q5eQlzwXDNhYTUDgOrbFY0dE#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 21:24:22','2025-12-07 21:24:22'),(13,86,60.00,'stripe','pending','cs_test_b15N0Bd9EVYliG0eDNRoOZibb9iBkUqTN8AyDOxDf0bPn05TALnuHCX9x6','https://checkout.stripe.com/c/pay/cs_test_b15N0Bd9EVYliG0eDNRoOZibb9iBkUqTN8AyDOxDf0bPn05TALnuHCX9x6#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 21:29:28','2025-12-07 21:29:28'),(14,86,48.60,'stripe','pending','cs_test_a1vqeksXftTAPdmkgGGJXwPo0cNMfmx0rrpjVFXWUGakbaJ11w8dExw7W6','https://checkout.stripe.com/c/pay/cs_test_a1vqeksXftTAPdmkgGGJXwPo0cNMfmx0rrpjVFXWUGakbaJ11w8dExw7W6#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,42,'2025-12-07 21:40:48','2025-12-07 21:40:48'),(15,86,48.60,'stripe','pending','cs_test_a1GgzuhTenSlLEyf3ql23VYpkPWCy9sh6PzCCpuEcgS0tOeBZFqFVKeWjU','https://checkout.stripe.com/c/pay/cs_test_a1GgzuhTenSlLEyf3ql23VYpkPWCy9sh6PzCCpuEcgS0tOeBZFqFVKeWjU#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,42,'2025-12-07 21:42:55','2025-12-07 21:42:55'),(16,86,48.60,'stripe','pending','cs_test_a1kPOcMpZdnHlM48RcUGfLbmaeau6LFubQSwwlqfAPvuA5OTBboNeBtpQX','https://checkout.stripe.com/c/pay/cs_test_a1kPOcMpZdnHlM48RcUGfLbmaeau6LFubQSwwlqfAPvuA5OTBboNeBtpQX#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,42,'2025-12-07 21:57:56','2025-12-07 21:57:56'),(17,86,48.60,'stripe','pending','cs_test_a1jG0EEBLTlFFHApJ6UU7QlGNUvR4esFvUN2tXpUkUwj3gisNCbHaO6UYa','https://checkout.stripe.com/c/pay/cs_test_a1jG0EEBLTlFFHApJ6UU7QlGNUvR4esFvUN2tXpUkUwj3gisNCbHaO6UYa#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,52,'2025-12-07 22:50:21','2025-12-07 22:50:21'),(18,86,48.60,'stripe','pending','cs_test_a1PipTbUIgUe5dMP2PrDgaRQMixyVTe3tgVPgHD7gQbVZ2pcU3OS3I2RLc','https://checkout.stripe.com/c/pay/cs_test_a1PipTbUIgUe5dMP2PrDgaRQMixyVTe3tgVPgHD7gQbVZ2pcU3OS3I2RLc#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,52,'2025-12-07 23:17:55','2025-12-07 23:17:55'),(19,86,60.00,'stripe','pending','cs_test_b1hQxZJb7HMoPlBarzi2gCdQxioc7dHdfmpXrKEGjDAvbUWzfulz4aN83x','https://checkout.stripe.com/c/pay/cs_test_b1hQxZJb7HMoPlBarzi2gCdQxioc7dHdfmpXrKEGjDAvbUWzfulz4aN83x#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 23:53:18','2025-12-07 23:53:18'),(20,86,60.00,'stripe','pending','cs_test_b10W9nphu8OZ41ki1HslPSBSHoYC8IhcGqoJiBJTzJ28t5nBSHhotKF3WX','https://checkout.stripe.com/c/pay/cs_test_b10W9nphu8OZ41ki1HslPSBSHoYC8IhcGqoJiBJTzJ28t5nBSHhotKF3WX#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-07 23:58:09','2025-12-07 23:58:09'),(21,86,75.00,'stripe','pending','cs_test_b1PdFmie6kjRDRPu619ZzntPfm5V84FWLXJojveTNeB7hmxMwRW82Infpe','https://checkout.stripe.com/c/pay/cs_test_b1PdFmie6kjRDRPu619ZzntPfm5V84FWLXJojveTNeB7hmxMwRW82Infpe#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-08 00:02:54','2025-12-08 00:02:54'),(22,95,48.60,'stripe','pending','cs_test_a11yaSVD5FKubJoBwvb8rqR6NiZfcjTARhBzYrofoTkcpFuYHhIC5jPc0s','https://checkout.stripe.com/c/pay/cs_test_a11yaSVD5FKubJoBwvb8rqR6NiZfcjTARhBzYrofoTkcpFuYHhIC5jPc0s#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,74,'2025-12-08 00:09:49','2025-12-08 00:09:49'),(23,95,48.60,'stripe','pending','cs_test_a15Hji6FMXXKjbWeX78QLE1hwtSIFdsAiTOjmY3HhgwJOalDQaVSf15qDz','https://checkout.stripe.com/c/pay/cs_test_a15Hji6FMXXKjbWeX78QLE1hwtSIFdsAiTOjmY3HhgwJOalDQaVSf15qDz#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,75,'2025-12-08 00:10:55','2025-12-08 00:10:55'),(24,95,48.60,'stripe','pending','cs_test_a1MLLt6gWeEoFRBAKNBXBM7VEedu9J5Qj8oHuAwJJa4dBh1kQNDfkh7NDs','https://checkout.stripe.com/c/pay/cs_test_a1MLLt6gWeEoFRBAKNBXBM7VEedu9J5Qj8oHuAwJJa4dBh1kQNDfkh7NDs#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,74,'2025-12-08 00:12:26','2025-12-08 00:12:26'),(25,95,162.00,'stripe','pending','cs_test_a1j0taH0A4aZrwx5qvdGrZO4i4Opjk4xyJeCnKHF6FGUxypF94N9XZSJdp','https://checkout.stripe.com/c/pay/cs_test_a1j0taH0A4aZrwx5qvdGrZO4i4Opjk4xyJeCnKHF6FGUxypF94N9XZSJdp#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,76,'2025-12-08 00:12:50','2025-12-08 00:12:50'),(26,86,162.00,'stripe','pending','cs_test_a1ys8jw7JxEohSITztOKARFJnupQIwIAQsSqOSWWbmCCEYjr4ZgTd7Z7H6','https://checkout.stripe.com/c/pay/cs_test_a1ys8jw7JxEohSITztOKARFJnupQIwIAQsSqOSWWbmCCEYjr4ZgTd7Z7H6#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,77,'2025-12-08 00:16:47','2025-12-08 00:16:47'),(27,86,48.60,'stripe','pending','cs_test_a1HcfIJa16w61yy6ZBaevPHHeDds5PTl48Iq5VvljzCdLjE0yGOzjf8RG2','https://checkout.stripe.com/c/pay/cs_test_a1HcfIJa16w61yy6ZBaevPHHeDds5PTl48Iq5VvljzCdLjE0yGOzjf8RG2#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,73,'2025-12-08 00:20:56','2025-12-08 00:20:56'),(28,86,48.60,'stripe','pending','cs_test_a1w5mXXf9GCJoEOexBE24UHFwyzXZRrFctNSRwv5hkN66yOXo7xdjo39Mh','https://checkout.stripe.com/c/pay/cs_test_a1w5mXXf9GCJoEOexBE24UHFwyzXZRrFctNSRwv5hkN66yOXo7xdjo39Mh#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,80,'2025-12-08 00:46:01','2025-12-08 00:46:01'),(29,86,48.60,'stripe','pending','cs_test_a1ydIUTDNaDymrdntq5RRj37QOSwVeJHRhEzpOqGRqz7jvE8tOfFfbrzwf','https://checkout.stripe.com/c/pay/cs_test_a1ydIUTDNaDymrdntq5RRj37QOSwVeJHRhEzpOqGRqz7jvE8tOfFfbrzwf#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,82,'2025-12-08 00:49:13','2025-12-08 00:49:13'),(30,86,162.00,'stripe','pending','cs_test_a107TFGHt4QDMoGUCO4rHKQFJ15Fjp6fh7brCi2V5LkQcUW5hOSgJLMgXS','https://checkout.stripe.com/c/pay/cs_test_a107TFGHt4QDMoGUCO4rHKQFJ15Fjp6fh7brCi2V5LkQcUW5hOSgJLMgXS#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,83,'2025-12-08 00:50:01','2025-12-08 00:50:01'),(31,86,162.00,'stripe','pending','cs_test_a1kUn9JA18YA3sufpj3O5KJH9sgfXcMEMDs2HhZIt3MHmBprPKXIk8E4F9','https://checkout.stripe.com/c/pay/cs_test_a1kUn9JA18YA3sufpj3O5KJH9sgfXcMEMDs2HhZIt3MHmBprPKXIk8E4F9#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,85,'2025-12-08 01:01:56','2025-12-08 01:01:56'),(32,86,162.00,'stripe','pending','cs_test_a1tjg1aFk6WAqYPPaHZA25L2VFRI1xA1TEtuGq0rF7JtpaCMGO0yRfTXVT','https://checkout.stripe.com/c/pay/cs_test_a1tjg1aFk6WAqYPPaHZA25L2VFRI1xA1TEtuGq0rF7JtpaCMGO0yRfTXVT#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,85,'2025-12-08 01:09:27','2025-12-08 01:09:27'),(33,86,162.00,'stripe','pending','cs_test_a1arM6Uxaf9AsJ8Cn4eVPQFvkgd5qw59mqCFYaOJN8lvBSMxENdlTxdNOO','https://checkout.stripe.com/c/pay/cs_test_a1arM6Uxaf9AsJ8Cn4eVPQFvkgd5qw59mqCFYaOJN8lvBSMxENdlTxdNOO#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,85,'2025-12-08 01:15:14','2025-12-08 01:15:14'),(34,86,162.00,'stripe','completed','cs_test_a1oUt1f1JpuipsmY41oNnZvbYh4KHWvChuDieIMcrIXLKwlmDLCxGIy6k5','https://checkout.stripe.com/c/pay/cs_test_a1oUt1f1JpuipsmY41oNnZvbYh4KHWvChuDieIMcrIXLKwlmDLCxGIy6k5#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3Sbt9pA6vSDJDUwi1w8fz6T8',NULL,NULL,NULL,85,'2025-12-08 01:22:28','2025-12-08 01:22:37'),(35,86,162.00,'stripe','completed','cs_test_a1ytJDl9YpbEdvYdj7C1UJ2c1vZx4ZETA53yLPxjDeTCTHZATCKcImdU8t','https://checkout.stripe.com/c/pay/cs_test_a1ytJDl9YpbEdvYdj7C1UJ2c1vZx4ZETA53yLPxjDeTCTHZATCKcImdU8t#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3SbtCDA6vSDJDUwi1DNH0Mlo',NULL,NULL,NULL,90,'2025-12-08 01:24:55','2025-12-08 01:25:05'),(36,86,162.00,'stripe','completed','cs_test_a1ljOuymRW0ibyawyLRRSSf6QJTc1hyNZ3JDJ2mq2luJipnye4nvo3piR7','https://checkout.stripe.com/c/pay/cs_test_a1ljOuymRW0ibyawyLRRSSf6QJTc1hyNZ3JDJ2mq2luJipnye4nvo3piR7#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3SbtG3A6vSDJDUwi0LPdf7r8',NULL,NULL,NULL,91,'2025-12-08 01:28:54','2025-12-08 01:29:03'),(37,86,162.00,'stripe','pending','cs_test_a1ZlEDWPJJSN0et9rQmOPsiazTjQX5rrIU7iVw4YpxYbg7EZ6iBv2bABj1','https://checkout.stripe.com/c/pay/cs_test_a1ZlEDWPJJSN0et9rQmOPsiazTjQX5rrIU7iVw4YpxYbg7EZ6iBv2bABj1#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,92,'2025-12-08 01:35:04','2025-12-08 01:35:04'),(38,86,152.00,'stripe','pending','cs_test_a1luB5fSUXWQbmb3C9yTRabKER2BUvRaxDjtvppRvbpd71sxRC0Jxl9ccB','https://checkout.stripe.com/c/pay/cs_test_a1luB5fSUXWQbmb3C9yTRabKER2BUvRaxDjtvppRvbpd71sxRC0Jxl9ccB#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,94,'2025-12-08 01:50:13','2025-12-08 01:50:13'),(39,86,152.00,'stripe','pending','cs_test_a1BDs4qJ8jRtlj8srVrFNNYgPDRuyeVl7kXQME0oYKMCBDV4r1vBkZdwIf','https://checkout.stripe.com/c/pay/cs_test_a1BDs4qJ8jRtlj8srVrFNNYgPDRuyeVl7kXQME0oYKMCBDV4r1vBkZdwIf#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,96,'2025-12-08 01:55:36','2025-12-08 01:55:36'),(40,86,152.00,'stripe','pending','cs_test_a181dqr0a7fYq95q7uWelKhOjcZFYjDKIzWMu9VTpIZ8CLqtAmHaIrH5Kz','https://checkout.stripe.com/c/pay/cs_test_a181dqr0a7fYq95q7uWelKhOjcZFYjDKIzWMu9VTpIZ8CLqtAmHaIrH5Kz#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,98,'2025-12-08 02:00:53','2025-12-08 02:00:53'),(41,86,152.00,'stripe','pending','cs_test_a1eTMSx0XzAwp3xnob8gDtBnAaWuZpWcxkwRAI8eCAjWFlgUmxSD1LPoCg','https://checkout.stripe.com/c/pay/cs_test_a1eTMSx0XzAwp3xnob8gDtBnAaWuZpWcxkwRAI8eCAjWFlgUmxSD1LPoCg#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,100,'2025-12-08 02:07:10','2025-12-08 02:07:10'),(42,86,152.00,'stripe','completed','cs_test_a1XlUwlNfgR0WZyAMBl3EeK2aPKakf1KIpIm1IBjXNSVs9qWbURu9Dw02t','https://checkout.stripe.com/c/pay/cs_test_a1XlUwlNfgR0WZyAMBl3EeK2aPKakf1KIpIm1IBjXNSVs9qWbURu9Dw02t#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3Sbtw2A6vSDJDUwi12MBJwKt',NULL,NULL,NULL,102,'2025-12-08 02:12:18','2025-12-08 02:16:08'),(43,86,165.00,'stripe','pending','cs_test_b1Nqi8xrtFBkCC7RXz5qOwF4zOtMXTBgtiAyX1ewqaRTzWOeNtW1H7aVh4','https://checkout.stripe.com/c/pay/cs_test_b1Nqi8xrtFBkCC7RXz5qOwF4zOtMXTBgtiAyX1ewqaRTzWOeNtW1H7aVh4#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-08 02:30:31','2025-12-08 02:30:31'),(44,86,164.00,'stripe','completed','cs_test_b1y2d3EYX8SNwcwuRQnec90ctlhTDH5JswgVYmyo2dTXPZQiIhc0NddRPs','https://checkout.stripe.com/c/pay/cs_test_b1y2d3EYX8SNwcwuRQnec90ctlhTDH5JswgVYmyo2dTXPZQiIhc0NddRPs#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl','pi_3SbuEPA6vSDJDUwi1ffCgC3L',NULL,NULL,NULL,104,'2025-12-08 02:31:12','2025-12-08 02:31:25'),(45,86,160.00,'stripe','completed','cs_test_a1LSn8ea3uMbBI08kwMdXsajYiilk21JYnm7gEhXy94qA8xPHUhxbz2Kd4','https://checkout.stripe.com/c/pay/cs_test_a1LSn8ea3uMbBI08kwMdXsajYiilk21JYnm7gEhXy94qA8xPHUhxbz2Kd4#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3SbuGFA6vSDJDUwi1TBopzco',NULL,NULL,NULL,105,'2025-12-08 02:33:11','2025-12-08 02:33:19'),(46,86,48.60,'stripe','pending','cs_test_a1c4EC2Rozi9lsDiXardPrmFRTUaYMTcvrKGXeR5y9kQMwDmViKPF1Q6zR','https://checkout.stripe.com/c/pay/cs_test_a1c4EC2Rozi9lsDiXardPrmFRTUaYMTcvrKGXeR5y9kQMwDmViKPF1Q6zR#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,106,'2025-12-08 02:35:19','2025-12-08 02:35:19'),(47,86,42.02,'stripe','completed','cs_test_a1mgVcEZ1RzZQbcBjUEC5d7QOqVKYj6L0ArXSylx4JldCF4P9BlQE0zeYN','https://checkout.stripe.com/c/pay/cs_test_a1mgVcEZ1RzZQbcBjUEC5d7QOqVKYj6L0ArXSylx4JldCF4P9BlQE0zeYN#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl','pi_3SbuIYA6vSDJDUwi1uRDxkQw',NULL,NULL,NULL,106,'2025-12-08 02:35:34','2025-12-08 02:35:42'),(48,86,60.00,'stripe','pending','cs_test_b1X9DWXk5x7MiX6QPCI2wHPTrJzEUaO8QiFIR8i8nVo2P24C58ZOkEGeBx','https://checkout.stripe.com/c/pay/cs_test_b1X9DWXk5x7MiX6QPCI2wHPTrJzEUaO8QiFIR8i8nVo2P24C58ZOkEGeBx#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8naHBpcWxabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl',NULL,NULL,NULL,NULL,NULL,'2025-12-09 07:36:36','2025-12-09 07:36:36'),(49,86,150.00,'stripe','pending','cs_test_a19FFRDbMnDr4eSLCmug9Htp4wX41KomVota2Rce3uW7tIOTAraFeDw8nT','https://checkout.stripe.com/c/pay/cs_test_a19FFRDbMnDr4eSLCmug9Htp4wX41KomVota2Rce3uW7tIOTAraFeDw8nT#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdkdWxOYHwnPyd1blpxYHZxWjA0VlNuY2NEM3NWQU9BUHJsMW43QD1iakhwa2R9ZjFEYXA9fEN9dl1fZEFpaDxTN0hicFZ8M11PVDw2UDNGM19AMkRVb1xWU25pUDZIdWQ9R3N2dUw8Y29yNTUyYkNpfVJyXScpJ2N3amhWYHdzYHcnP3F3cGApJ2dkZm5id2pwa2FGamlqdyc%2FJyZjY2NjY2MnKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSdga2RnaWBVaWRmYG1qaWFgd3YnP3F3cGB4JSUl',NULL,NULL,NULL,NULL,108,'2025-12-10 03:53:00','2025-12-10 03:53:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,20,'Curl Cream','Hair','',30.00,5,5,NULL,NULL,1,'2025-12-03 05:18:42','2025-12-03 05:18:42'),(2,21,'Leave-in Conditioner','Hair','',30.00,1,5,NULL,NULL,1,'2025-12-03 05:39:11','2025-12-07 20:07:02'),(3,22,'',NULL,NULL,0.00,NULL,5,NULL,NULL,0,'2025-12-04 00:14:52','2025-12-04 00:15:11'),(4,24,'shmwpoo','Skin','',0.07,12,5,NULL,NULL,1,'2025-12-04 01:02:22','2025-12-04 01:02:22'),(5,21,'Growth Oil','Hair','',15.00,6,5,NULL,NULL,1,'2025-12-07 20:06:54','2025-12-07 20:06:54');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_code_usage`
--

DROP TABLE IF EXISTS `promo_code_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_code_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `promo_id` int NOT NULL,
  `user_id` int NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `order_amount` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`usage_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_promo_usage` (`promo_id`,`user_id`),
  CONSTRAINT `promo_code_usage_ibfk_1` FOREIGN KEY (`promo_id`) REFERENCES `promo_codes` (`promo_id`) ON DELETE CASCADE,
  CONSTRAINT `promo_code_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_code_usage`
--

LOCK TABLES `promo_code_usage` WRITE;
/*!40000 ALTER TABLE `promo_code_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `promo_code_usage` ENABLE KEYS */;
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
  `appointment_id` int DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,NULL,86,21,NULL,4,'pretty good service',NULL,1,0,NULL,'2025-12-03 05:43:52','2025-12-03 05:43:52'),(2,NULL,98,24,NULL,4,'great salon',NULL,1,0,NULL,'2025-12-04 01:03:55','2025-12-04 01:03:55'),(3,NULL,86,26,NULL,4,'Great new shop! Check it out!',NULL,1,0,NULL,'2025-12-06 16:37:52','2025-12-06 16:37:52'),(4,NULL,86,21,NULL,1,'the service was awful dont come here','We\'re sorry you felt that way. We do our best to keep all our customers happy please let us know what went wrong we\'d love to make things right.',1,0,NULL,'2025-12-07 01:30:22','2025-12-07 01:35:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_audit`
--

LOCK TABLES `salon_audit` WRITE;
/*!40000 ALTER TABLE `salon_audit` DISABLE KEYS */;
INSERT INTO `salon_audit` VALUES (1,9,'CREATED','Salon registered by owner',58,'2025-11-11 23:31:06'),(2,16,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:37:29'),(3,15,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:37:36'),(4,14,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:37:43'),(5,13,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:37:47'),(6,12,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:52:29'),(7,11,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 04:54:10'),(8,10,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 05:03:19'),(9,9,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 05:07:03'),(10,8,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 05:13:29'),(11,7,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 05:13:43'),(12,20,'APPROVED','Salon registration approved by admin',NULL,'2025-12-03 05:19:49'),(13,21,'APPROVED','Salon registration approved by admin',94,'2025-12-03 05:40:01'),(14,24,'APPROVED','Salon registration approved by admin',94,'2025-12-04 00:39:52'),(15,23,'REJECTED','Salon registration rejected by admin',94,'2025-12-04 00:40:18'),(16,22,'APPROVED','Salon registration approved by admin',94,'2025-12-05 03:55:13'),(17,25,'APPROVED','Salon registration approved by admin',94,'2025-12-06 04:25:22'),(18,26,'APPROVED','Salon registration approved by admin',94,'2025-12-06 07:21:20');
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
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_customers`
--

LOCK TABLES `salon_customers` WRITE;
/*!40000 ALTER TABLE `salon_customers` DISABLE KEYS */;
INSERT INTO `salon_customers` VALUES (1,6,35,'2025-11-09 06:05:40',NULL,NULL,NULL,NULL,NULL,'2025-11-09 17:20:35'),(2,6,19,'2025-11-09 16:59:35','8 Cherry street','Morristown','NJ','07960','new check','2025-11-09 17:20:35'),(6,6,37,'2025-11-09 17:36:40','8 Cherry street','Morristown','NJ','07960','adams','2025-11-09 17:36:40'),(7,6,38,'2025-11-09 17:54:37','8 Herry street','Morristwn','WI','07990','today\n','2025-11-09 17:54:37'),(10,6,39,'2025-11-09 18:35:35','8 Cherry sts','Morristowns','NJ','07964','hehe','2025-11-09 18:35:35'),(11,6,40,'2025-11-09 18:43:01',NULL,NULL,NULL,NULL,'soft hand\n','2025-11-09 18:43:01'),(14,6,41,'2025-11-09 18:55:01','9 market st','newark','nj','07003','hellp','2025-11-09 18:55:01'),(15,6,42,'2025-11-09 19:01:08','10 market st','newark','nj','07003','hellp','2025-11-09 19:01:08'),(16,6,43,'2025-11-10 15:41:34',NULL,NULL,NULL,NULL,'hello','2025-11-10 15:41:34'),(17,6,44,'2025-11-10 16:14:31','9 morgan st','Indomen','NJ','07004','hello hello','2025-11-10 16:14:31'),(18,6,45,'2025-11-10 16:15:14','10 Torgan st','Indomens','NJ','07004','hello hello','2025-11-10 16:15:14'),(21,6,48,'2025-11-11 14:42:11','09 Elms street','Parsipanny','NJ','07045','BEST QUALITY','2025-11-11 14:42:11'),(22,6,50,'2025-11-11 16:29:49','10 staten island','New Brunchwick','NJ','08909','quality','2025-11-11 16:29:49'),(23,6,51,'2025-11-11 16:48:39','9 merry st','meerystown','NJ','09090',NULL,'2025-11-11 16:48:39'),(24,6,52,'2025-11-11 18:28:48','123 main street','Newark ','Nj','-7960','allergies','2025-11-11 18:28:48'),(25,6,77,'2025-11-22 20:45:44','123 main st','morristown','nj','07960','Special tratement','2025-11-22 20:45:44'),(26,6,33,'2025-11-22 20:50:18','1234 Main Street','Mendham','NJ','07960','Specail treatment','2025-11-22 20:50:18'),(27,6,78,'2025-11-22 20:54:55','1239 Main Street','Morristown','NJ','07960','Hello','2025-11-22 20:54:55'),(29,22,99,'2025-12-04 00:21:18','742 Evergreen Terrace','Springfield','New Jersey','07081','none','2025-12-04 00:21:18'),(30,21,102,'2025-12-04 00:34:51','4312 Liberty Ave ','North Bergen','NJ','07047','introverted','2025-12-04 00:34:51'),(31,25,68,'2025-12-05 19:04:35','339 black oak ridge road','Wayne','NJ','07470',NULL,'2025-12-05 19:04:35'),(32,25,69,'2025-12-05 19:05:00','123 main street','Wayne','NJ','07470',NULL,'2025-12-05 19:05:00'),(33,21,86,'2025-12-07 15:57:31',NULL,NULL,NULL,NULL,NULL,'2025-12-07 15:57:31'),(80,21,95,'2025-12-08 00:07:37',NULL,NULL,NULL,NULL,NULL,'2025-12-08 00:07:37');
/*!40000 ALTER TABLE `salon_customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_photos`
--

DROP TABLE IF EXISTS `salon_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_photos` (
  `photo_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `photo_type` enum('logo','cover','interior','exterior','gallery') DEFAULT 'gallery',
  `caption` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photo_id`),
  KEY `salon_id` (`salon_id`),
  CONSTRAINT `salon_photos_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_photos`
--

LOCK TABLES `salon_photos` WRITE;
/*!40000 ALTER TABLE `salon_photos` DISABLE KEYS */;
INSERT INTO `salon_photos` VALUES (1,21,'/uploads/service-1765338247550-316907139.png','gallery',NULL,0,'2025-12-10 03:44:07'),(2,21,'/uploads/service-1765338285487-959411975.png','gallery',NULL,0,'2025-12-10 03:44:45'),(4,27,'/uploads/service-1765489323643-152690519.png','gallery',NULL,0,'2025-12-11 21:42:03');
/*!40000 ALTER TABLE `salon_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salon_rewards`
--

DROP TABLE IF EXISTS `salon_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salon_rewards` (
  `reward_id` int NOT NULL AUTO_INCREMENT,
  `salon_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `points_required` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reward_id`),
  KEY `idx_salon_rewards` (`salon_id`,`is_active`),
  CONSTRAINT `salon_rewards_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_rewards`
--

LOCK TABLES `salon_rewards` WRITE;
/*!40000 ALTER TABLE `salon_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `salon_rewards` ENABLE KEYS */;
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
  `business_hours` json DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
  `amenities` json DEFAULT NULL,
  `require_deposit` tinyint(1) DEFAULT '0',
  `deposit_amount` decimal(10,2) DEFAULT '0.00',
  `loyalty_enabled` tinyint(1) DEFAULT '0',
  `points_per_visit` int DEFAULT '10',
  `redeem_rate` decimal(5,2) DEFAULT '0.01',
  `refund_policy` text,
  `late_arrival_policy` text,
  `no_show_policy` text,
  `points_per_dollar` decimal(5,2) DEFAULT '1.00' COMMENT 'Points earned per dollar spent',
  `min_points_redeem` int DEFAULT '100' COMMENT 'Minimum points required to redeem',
  `deposit_percentage` decimal(5,2) DEFAULT '0.00' COMMENT 'Deposit percentage required for pay-in-store appointments (0-100)',
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `unique_salon_setting` (`salon_id`),
  KEY `idx_salon_loyalty` (`salon_id`,`loyalty_enabled`),
  CONSTRAINT `salon_settings_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salon_settings`
--

LOCK TABLES `salon_settings` WRITE;
/*!40000 ALTER TABLE `salon_settings` DISABLE KEYS */;
INSERT INTO `salon_settings` VALUES (1,9,'America/New_York',0.00,NULL,120,NULL,NULL,NULL,0,0.00,0,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(2,20,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',1,25.00,0,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(7,21,'America/New_York',0.00,'dont cancel',30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',1,25.00,1,10,0.01,NULL,NULL,NULL,1.00,100,25.00),(27,24,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',0,25.00,1,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(42,22,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[\"Free Wi-Fi\", \"Early Hours\"]',0,25.00,0,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(47,25,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',0,25.00,0,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(57,26,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',0,25.00,0,10,100.00,NULL,NULL,NULL,1.00,100,0.00),(87,27,'America/New_York',0.00,NULL,30,'{\"Friday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Monday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Sunday\": {\"end\": \"15:00\", \"start\": \"10:00\", \"enabled\": true}, \"Tuesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}, \"Saturday\": {\"end\": \"17:00\", \"start\": \"08:00\", \"enabled\": true}, \"Thursday\": {\"end\": \"20:00\", \"start\": \"09:00\", \"enabled\": true}, \"Wednesday\": {\"end\": \"18:00\", \"start\": \"09:00\", \"enabled\": true}}','{\"emailReminders\": true, \"inAppReminders\": true, \"reminderHoursBefore\": 24}','[]',0,0.00,0,10,0.01,NULL,NULL,NULL,1.00,100,0.00);
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
  `name` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`salon_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `salons_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salons`
--

LOCK TABLES `salons` WRITE;
/*!40000 ALTER TABLE `salons` DISABLE KEYS */;
INSERT INTO `salons` VALUES (6,30,'Lux Salon','approved','123 Main St',NULL,NULL,NULL,NULL,NULL,NULL,'Premium hair and beauty services',NULL,'active','2025-11-08 01:59:40','2025-12-03 01:08:06',NULL,'Lux Salon',NULL),(7,33,'Lux Salon','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-09 00:25:55','2025-12-03 05:13:43',NULL,'Lux Salon',NULL),(8,55,'Kendra\'s Salon','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-11 21:02:26','2025-12-03 05:13:29',NULL,'Kendra\'s Salon',NULL),(9,58,'Hager\'s Salon','approved','12 Marry St',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-11 23:31:06','2025-12-03 05:07:03',NULL,'Hager\'s Salon',NULL),(10,64,'Test salon','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-12 16:10:45','2025-12-03 05:03:19','test-salon-64','Test salon',NULL),(11,65,'Salon Litter Owner','approved','24 race st, Bloomfield NJ',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','2025-11-13 16:33:41','2025-12-03 04:54:10','salon-litter-owner-65','Salon Litter Owner',NULL),(12,66,'Tim\'s Salon','approved','9 west st','Bloomfiled','NJ','07960','United States','0987654328','timssalon@example.com',NULL,NULL,'active','2025-11-13 20:17:36','2025-12-03 04:52:29','tim-s-salon-66','Tim\'s Salon',NULL),(13,71,'TestAO Salon','approved','123 Main street','Newark ','NJ','12345','US','9876543202','testAOFL@example.com',NULL,'http://www.testaofl.com/','active','2025-11-14 22:12:31','2025-12-03 04:37:47','testao-salon-71','TestAO Salon',NULL),(14,72,'TestB Salon','approved','1234 Main Street','Newark','NJ','12345','US','9807654678','testbfl@example.com',NULL,'https://main.d9mc2v9b3gxgw.amplifyapp.com/','active','2025-11-14 23:37:14','2025-12-03 04:37:43','testb-salon-72','TestB Salon',NULL),(15,74,'test business','approved','1190 test dr','wayne','nj','07035','US','2017479556','test@gmail.com',NULL,'https://test.com','active','2025-11-15 18:19:43','2025-12-03 04:37:36','test-business-74','test business',NULL),(16,79,'TestSalon','approved','1234 Main St','Newark','NJ','07960','United States','6107731821','amruthaj1206@gmail.com',NULL,NULL,'active','2025-11-26 18:42:56','2025-12-03 04:37:29','testsalon-79','TestSalon',NULL),(20,93,'One83 Mane Studio','approved','183 Main St','Lincoln Park','NJ','07035','US','2017479556','manestudio@gmail.com',NULL,'https://manestudio.com','active','2025-12-03 05:17:26','2025-12-03 05:29:13','one83-mane-studio','One83 Mane Studio','/uploads/salon-1764739753424-719431152.png'),(21,95,'Rezo Hair Salon','approved','191 paterson ave','paterson','NJ','07035','US','2017479556','rezo@gmail.com',NULL,'https://rezo.com','active','2025-12-03 05:37:11','2025-12-06 16:42:23','rezo-hair-salon','Rezo Hair Salon','/uploads/salon-1765039343508-622088547.png'),(22,96,'Fresh cuts','approved','742 Evergreen Terrace','Springfield','New Jersey','07081','United States','1234567890','daguerrero33@gmail.com',NULL,NULL,'active','2025-12-03 15:34:14','2025-12-05 03:55:13','fresh-cuts','Fresh cuts','/uploads/salon-1764858016883-301393466.png'),(23,97,'','rejected',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'blocked','2025-12-04 00:12:29','2025-12-04 00:40:18','s','s',NULL),(24,98,'Test Salon','approved','123 mains street','newark','nj','07470-3484','United States','9738181320','senahdakhel@gmail.com',NULL,NULL,'active','2025-12-04 00:17:12','2025-12-04 00:39:52','test-salon','Test Salon',NULL),(25,103,'nj nail salon','approved','321 main street ','newark ','nj','07102','United States','9738324255','sdakhel99@gmail.com',NULL,NULL,'active','2025-12-05 19:03:38','2025-12-06 04:25:22','nj-nail-salon','NJ nail salon',NULL),(26,105,'Bob\'s Barber Shop','approved','65 Wintergreen Circ','East Stroudsburg','PA','18301','USA','9734950731','bobthebarber@gmail.com',NULL,'https://bobsbarbershop.com','active','2025-12-06 06:17:12','2025-12-06 07:22:35','bob-s-barber-shop','Bob\'s Barber Shop','/uploads/salon-1765005755314-553481732.png'),(27,107,'Fresh Cutz','pending','1312 Liberty Ave','North Bergen','NJ','07047','USA','2017479556','freddy@gmail.com',NULL,'https://freddy.com','pending','2025-12-11 21:32:33','2025-12-11 21:43:06','fresh-cutz','Fresh Cutz','/uploads/salon-1765489386800-807469445.png');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,1,NULL,'Haircuts','All haircut-related services',0,'2025-11-09 07:26:39'),(2,1,NULL,'Hair Color','Root touch-ups, highlights, balayage',0,'2025-11-09 07:26:39'),(3,1,NULL,'Hair Treatments','Keratin, spa, and conditioning',0,'2025-11-09 07:26:39'),(4,2,NULL,'Beard Trim','Beard styling and shaping',0,'2025-11-09 07:26:39'),(5,2,NULL,'Shave','Luxury hot towel and straight razor shaves',0,'2025-11-09 07:26:39'),(6,3,NULL,'Basic Facials','Cleansing and exfoliation',0,'2025-11-09 07:26:39'),(7,3,NULL,'Advanced Facials','HydraFacial and deep rejuvenation',0,'2025-11-09 07:26:39'),(8,4,NULL,'Manicure','Basic, gel, and French manicure',0,'2025-11-09 07:26:39'),(9,4,NULL,'Pedicure','Spa and gel pedicure options',0,'2025-11-09 07:26:39'),(10,5,NULL,'Massages','Full body, Swedish, deep tissue',0,'2025-11-09 07:26:39'),(11,5,NULL,'Body Treatments','Scrubs, wraps, and detox treatments',0,'2025-11-09 07:26:39'),(12,6,NULL,'Makeup','Bridal, party, and glam looks',0,'2025-11-09 07:26:39'),(13,6,NULL,'Eyebrows','Threading, tinting, shaping',0,'2025-11-09 07:26:39'),(14,5,NULL,'Spa','Spa',0,'2025-12-05 04:06:57');
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
  `appointment_id` int DEFAULT NULL,
  `salon_id` int DEFAULT NULL,
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
  KEY `idx_salon_id` (`salon_id`),
  CONSTRAINT `service_photos_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL,
  CONSTRAINT `service_photos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `service_photos_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL,
  CONSTRAINT `service_photos_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL,
  CONSTRAINT `service_photos_ibfk_salon` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_photos`
--

LOCK TABLES `service_photos` WRITE;
/*!40000 ALTER TABLE `service_photos` DISABLE KEYS */;
INSERT INTO `service_photos` VALUES (1,91,21,95,17636,24,'before','/uploads/service-1765264208464-922017993.png','2025-12-09 07:10:08'),(2,91,21,95,17636,24,'after','/uploads/service-1765264251929-737375137.png','2025-12-09 07:10:51'),(3,NULL,21,86,NULL,NULL,'before','/uploads/service-1765265446518-497612167.png','2025-12-09 07:30:46'),(4,NULL,21,86,NULL,NULL,'after','/uploads/service-1765265460936-278565518.png','2025-12-09 07:31:00'),(5,NULL,21,86,17637,NULL,'before','/uploads/service-1765489669542-9302249.png','2025-12-11 21:47:49'),(6,NULL,21,86,17637,NULL,'after','/uploads/service-1765489681587-995844626.png','2025-12-11 21:48:01');
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (7,6,1,'Men’s Classic Cut',30,45.00,'Traditional men’s haircut and styling',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(8,6,1,'Women’s Trim & Style',40,60.00,'Precision trimming and blowout',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(9,6,2,'Root Touch-Up',45,70.00,'Professional color retouching for roots',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(10,6,2,'Full Highlights',90,120.00,'Brighten your look with full highlights',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(11,6,3,'Keratin Treatment',90,150.00,'Smooth and straighten hair naturally',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(12,6,3,'Hair Spa',30,55.00,'Deep conditioning and scalp relaxation',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(13,6,4,'Beard Trim & Shape',15,25.00,'Customized beard styling and shaping',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(14,6,5,'Hot Towel Shave',20,30.00,'Luxury straight razor shave with oils',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(15,6,6,'Express Facial',25,40.00,'Quick cleansing and hydration facial',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(16,6,7,'Signature Facial',45,65.00,'Deep cleansing and rejuvenation',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(17,6,8,'Classic Manicure',25,30.00,'Basic nail shaping and polish',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(18,6,9,'Spa Pedicure',35,45.00,'Exfoliation and foot massage',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(19,6,10,'Aromatherapy Massage',60,90.00,'Relaxing essential oil massage',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(20,6,11,'Body Scrub',50,75.00,'Full body exfoliating treatment',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(21,6,12,'Bridal Makeup',120,250.00,'Complete bridal glam package',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(22,6,13,'Eyebrow Threading',10,20.00,'Precision brow shaping and definition',1,'2025-11-09 07:27:04','2025-11-09 07:27:04'),(23,20,1,'Curly Cut',60,100.00,NULL,1,'2025-12-03 05:18:25','2025-12-03 05:18:25'),(24,21,1,'Curly Cut',75,150.00,NULL,1,'2025-12-03 05:38:37','2025-12-03 05:38:37'),(25,22,1,'Haircut',20,20.00,NULL,0,'2025-12-04 00:09:59','2025-12-04 00:13:36'),(26,24,1,'njk',5,67.00,NULL,1,'2025-12-04 00:30:04','2025-12-04 00:30:04'),(27,22,1,'Haircut',30,20.00,NULL,1,'2025-12-04 14:19:41','2025-12-04 14:19:41'),(28,22,14,'wax',30,4.00,NULL,1,'2025-12-05 04:06:57','2025-12-05 04:06:57'),(29,25,1,'taper fade',10,50.00,NULL,1,'2025-12-05 19:17:27','2025-12-05 19:17:27'),(30,25,1,'layers',20,30.00,NULL,1,'2025-12-05 19:17:43','2025-12-05 19:17:43'),(31,21,1,'Trim',30,45.00,NULL,1,'2025-12-07 20:06:26','2025-12-07 20:06:26');
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
) ENGINE=InnoDB AUTO_INCREMENT=17638 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (3,6,30,NULL,'Colorist','Haircut Expert',1,NULL,'2025-11-10 18:28:34',NULL,NULL,'2025-11-09 13:23:50','2025-11-11 03:03:53',3),(5,6,47,'1846','Hair Stylist','Hair Styling, Manicure, Hair Coloring, Massage',1,NULL,'2025-11-11 02:08:50',NULL,NULL,'2025-11-11 02:08:50','2025-11-11 12:06:22',2),(17629,6,76,'6832','Barber','Hair Styling, Pedicure',1,'$2b$10$nIzvUwqra/dtcuMueZAaPe7KA1tO15HDZr06pd.TlZNTPjcYZp4I6','2025-11-22 20:41:40',NULL,NULL,'2025-11-22 20:38:24','2025-11-22 20:41:40',7),(17632,24,74,'9292','staff','Hair Cutting, Hair Coloring',1,NULL,'2025-12-04 00:34:24',NULL,NULL,'2025-12-04 00:34:24','2025-12-04 00:34:24',NULL),(17633,22,99,'4571','Head','Eyebrow Threading, Waxing',1,NULL,'2025-12-05 04:02:46',NULL,NULL,'2025-12-05 04:02:46','2025-12-05 04:07:41',NULL),(17636,21,100,'7480','Senior Stylist','Hair Styling',1,'$2b$10$hxTdPFZrlag0QWLvGFCZDu1afDXLRxjOduV6BuUSYq5BFYkzDRJLS','2025-12-07 15:46:06',NULL,NULL,'2025-12-07 15:44:38','2025-12-07 15:46:06',9),(17637,21,86,'3701','Senior Stylist','Hair Styling',1,'$2b$10$oBkO/P/rN4QcmXYyu1YxG.p/LVnfCQ3BEI0VDpTc2Q/eDsfI4x9fC','2025-12-09 04:51:15',NULL,NULL,'2025-12-09 04:46:07','2025-12-09 04:51:15',9);
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_availability`
--

LOCK TABLES `staff_availability` WRITE;
/*!40000 ALTER TABLE `staff_availability` DISABLE KEYS */;
INSERT INTO `staff_availability` VALUES (1,17636,'Monday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(2,17636,'Tuesday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(3,17636,'Wednesday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(4,17636,'Thursday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(5,17636,'Friday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(6,17636,'Saturday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(7,17636,'Sunday','09:00:00','17:00:00',1,'2025-12-07 15:47:20','2025-12-07 15:47:20'),(8,17637,'Monday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54'),(9,17637,'Tuesday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54'),(10,17637,'Wednesday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54'),(11,17637,'Thursday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54'),(12,17637,'Friday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54'),(13,17637,'Saturday','09:00:00','17:00:00',1,'2025-12-09 04:51:54','2025-12-09 04:51:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_pin_tokens`
--

LOCK TABLES `staff_pin_tokens` WRITE;
/*!40000 ALTER TABLE `staff_pin_tokens` DISABLE KEYS */;
INSERT INTO `staff_pin_tokens` VALUES (2,5,'a4df63cc721e7f7aca167092a89980eacebeb894a01234671add431572b57e1b','2025-11-10 21:38:51'),(9,17632,'735b541bd351b8440c5b879804f59d07dc6f4b3126034cbea2b753a3194ee197','2025-12-04 01:04:24'),(10,17633,'7e0d4419ffbfaabb0bb79e78ce4e5bdf7b4f6581f6777fe8046c9d452cbbdf1b','2025-12-05 04:32:47');
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_roles`
--

LOCK TABLES `staff_roles` WRITE;
/*!40000 ALTER TABLE `staff_roles` DISABLE KEYS */;
INSERT INTO `staff_roles` VALUES (1,6,'Stylist','2025-11-10 21:37:07'),(2,6,'Hair Stylist','2025-11-10 21:37:07'),(3,6,'Colorist','2025-11-10 21:37:07'),(4,6,'Technician','2025-11-10 21:37:07'),(5,6,'Nail Artist','2025-11-10 21:37:07'),(6,6,'Receptionist','2025-11-10 21:37:07'),(7,6,'Barber','2025-11-10 21:37:07'),(9,21,'Senior Stylist','2025-12-04 00:14:55'),(16,24,'hairdress','2025-12-04 00:18:22'),(17,22,'Head','2025-12-04 00:30:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_time_off`
--

LOCK TABLES `staff_time_off` WRITE;
/*!40000 ALTER TABLE `staff_time_off` DISABLE KEYS */;
INSERT INTO `staff_time_off` VALUES (2,17637,'2025-12-11 03:57:00','2025-12-12 03:57:00','Blocked time slot',NULL,'approved','2025-12-10 03:57:24','2025-12-10 03:57:24');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `two_factor_codes`
--

LOCK TABLES `two_factor_codes` WRITE;
/*!40000 ALTER TABLE `two_factor_codes` DISABLE KEYS */;
INSERT INTO `two_factor_codes` VALUES (1,'74','532966','sms','2025-11-15 18:31:45',1,'2025-11-15 18:21:44'),(2,'74','548372','sms','2025-11-15 20:11:50',1,'2025-11-15 20:01:50'),(3,'86','518302','sms','2025-12-03 04:51:03',1,'2025-12-03 04:41:03'),(4,'86','337553','sms','2025-12-03 05:44:54',1,'2025-12-03 05:34:54'),(5,'95','623255','sms','2025-12-04 00:23:12',1,'2025-12-04 00:13:12'),(6,'86','397133','sms','2025-12-04 01:20:07',1,'2025-12-04 01:10:07'),(7,'98','881075','sms','2025-12-05 19:28:29',0,'2025-12-05 19:18:28'),(8,'98','699995','sms','2025-12-05 19:28:42',0,'2025-12-05 19:18:41'),(9,'103','404303','sms','2025-12-05 19:49:33',0,'2025-12-05 19:39:32'),(10,'103','198652','sms','2025-12-05 20:18:35',0,'2025-12-05 20:08:34'),(11,'103','554068','sms','2025-12-05 20:21:06',0,'2025-12-05 20:11:05'),(12,'95','206710','sms','2025-12-06 00:49:30',1,'2025-12-06 05:39:30'),(13,'95','802358','sms','2025-12-06 01:28:13',1,'2025-12-06 06:18:13'),(14,'86','186511','sms','2025-12-06 02:10:00',1,'2025-12-06 06:59:59'),(15,'75','395291','sms','2025-12-09 22:50:07',1,'2025-12-10 03:40:07'),(16,'107','215942','sms','2025-12-11 16:47:45',1,'2025-12-11 21:37:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_2fa_settings`
--

LOCK TABLES `user_2fa_settings` WRITE;
/*!40000 ALTER TABLE `user_2fa_settings` DISABLE KEYS */;
INSERT INTO `user_2fa_settings` VALUES (1,'74','sms',1,'2017479556','2025-11-15 18:20:02','2025-11-15 18:20:02'),(2,'83','sms',1,'9145732928','2025-12-03 00:56:23','2025-12-03 00:56:23'),(3,'86','sms',0,'2017479556','2025-12-03 04:34:00','2025-12-06 07:00:39'),(4,'95','sms',0,'2017479556','2025-12-03 05:37:42','2025-12-06 06:18:43'),(5,'98','sms',1,'9738181320','2025-12-04 00:17:28','2025-12-04 00:17:28'),(6,'103','sms',1,'9738324255','2025-12-05 19:04:00','2025-12-05 19:04:00'),(7,'106','sms',1,'2017479556','2025-12-08 04:16:52','2025-12-08 04:16:52'),(8,'75','sms',1,'2017479556','2025-12-10 03:39:42','2025-12-10 03:39:42'),(9,'107','sms',1,'2017479556','2025-12-11 21:36:10','2025-12-11 21:36:10');
/*!40000 ALTER TABLE `user_2fa_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_rewards`
--

DROP TABLE IF EXISTS `user_rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_rewards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `salon_id` int NOT NULL,
  `reward_id` int NOT NULL,
  `redeemed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','used','expired') DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `salon_id` (`salon_id`),
  KEY `reward_id` (`reward_id`),
  KEY `idx_user_rewards` (`user_id`,`salon_id`),
  CONSTRAINT `user_rewards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_rewards_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE CASCADE,
  CONSTRAINT `user_rewards_ibfk_3` FOREIGN KEY (`reward_id`) REFERENCES `salon_rewards` (`reward_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_rewards`
--

LOCK TABLES `user_rewards` WRITE;
/*!40000 ALTER TABLE `user_rewards` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_rewards` ENABLE KEYS */;
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
  `salon_id` int DEFAULT NULL,
  `subscription_plan` varchar(50) DEFAULT 'free',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `firebase_uid` (`firebase_uid`),
  KEY `idx_users_salon_id` (`salon_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`salon_id`) REFERENCES `salons` (`salon_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (19,NULL,'Subash Neupane','9732168107','subash@sparkle.com',NULL,'customer','2025-11-08 01:46:37','2025-11-08 01:46:37',NULL,'free'),(25,'UID-OWN-002','Aanchal Shrestha','9730009999','aanchal2@example.com',NULL,'owner','2025-11-08 01:59:05','2025-11-08 01:59:05',NULL,'free'),(26,'UID-STF-001','Sandeeb Adhikari','9731110001','sandeeb@example.com',NULL,'staff','2025-11-08 01:59:05','2025-11-08 01:59:05',NULL,'free'),(27,'UID-CST-001','Subash Neupane','9731110002','subash@example.com',NULL,'customer','2025-11-08 01:59:05','2025-11-08 01:59:05',NULL,'free'),(29,NULL,'Aanchal Shrestha','9730009999','aanchalowner@example.com',NULL,'customer','2025-11-08 02:14:20','2025-11-08 02:14:20',NULL,'free'),(30,NULL,'Samser Bahadur','9171172727','sams@example.com',NULL,'owner','2025-11-08 02:16:35','2025-12-03 00:56:38',6,'free'),(31,NULL,'Amrita Puran Singh','2019999999','amrita@example.com',NULL,'customer','2025-11-08 19:39:37','2025-11-08 19:39:37',NULL,'free'),(32,NULL,'Amit Singh','9732168122','amitsingh@example.com',NULL,'owner','2025-11-08 19:41:35','2025-11-08 19:41:35',NULL,'free'),(33,'jKgoK5Q3XEUfrUPMqpCJAVDZ9PO2','sandeeb adhikari','0000000000','sandeebadhikari@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocK1BFh1FRhKAS92eH8VgmJjyPx9Yfzp5f8PuuAaoJ6ZI1PiJQ=s96-c','owner','2025-11-09 00:25:55','2025-12-03 00:56:38',7,'free'),(34,'xeCLUrafR7NjX02bK5ItqmNlnDA3','Sandeeb Adhikari','0000000000','adhikarisandeeb@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocKNSfP3YJcah-u3oMTd9anC3CP50696xs191pnauI8mEyZb=s96-c','customer','2025-11-09 03:16:47','2025-11-09 03:16:47',NULL,'free'),(35,NULL,'Test Customer','9731110005','test_customer@example.com',NULL,'customer','2025-11-09 06:00:33','2025-11-09 06:00:33',NULL,'free'),(36,NULL,'ada mada','9121234567','adamada@gmail.com',NULL,'customer','2025-11-09 17:31:13','2025-11-11 18:41:13',NULL,'free'),(37,NULL,'Adam  Sandler','9732168106','adamsandler@gmail.com',NULL,'customer','2025-11-09 17:36:40','2025-11-11 18:41:29',NULL,'free'),(38,NULL,'Amanda Nicole','9732168108','amanda@gmail.com',NULL,'customer','2025-11-09 17:54:37','2025-11-09 17:54:37',NULL,'free'),(39,NULL,'amanda cole','9002168107','cole@gmail.com',NULL,'customer','2025-11-09 18:35:35','2025-11-09 18:35:35',NULL,'free'),(40,NULL,'Mencha menc','9877654321','mench@example.com',NULL,'customer','2025-11-09 18:43:01','2025-11-09 18:43:01',NULL,'free'),(41,NULL,'Mark Jr','0987654321','mark@gmail.com',NULL,'customer','2025-11-09 18:55:01','2025-11-09 18:55:01',NULL,'free'),(42,NULL,'Marks Sr','0987654322','marks@gmail.com',NULL,'customer','2025-11-09 19:01:08','2025-11-09 19:01:08',NULL,'free'),(43,NULL,'Mehem Hemen','9876543210','hemen@gmail.com',NULL,'customer','2025-11-10 15:41:34','2025-11-10 15:41:34',NULL,'free'),(44,NULL,'Amme Madam','1020334959','amme@gmail.com',NULL,'customer','2025-11-10 16:14:31','2025-11-10 16:14:31',NULL,'free'),(45,NULL,'Ammes Madams','1020334958','ammes@gmail.com',NULL,'customer','2025-11-10 16:15:14','2025-11-10 16:15:14',NULL,'free'),(46,NULL,'Tim Cooks','0987654329','apple@examples.com',NULL,'staff','2025-11-11 01:37:45','2025-11-11 03:14:10',NULL,'free'),(47,NULL,'Mill Barbers','0987678987','barber@example.com',NULL,'staff','2025-11-11 02:08:50','2025-11-11 03:19:03',NULL,'free'),(48,NULL,'Harry Potter','1093849988','harry@example.com',NULL,'customer','2025-11-11 14:42:11','2025-11-11 14:42:11',NULL,'free'),(50,NULL,'New Customer','0987648098','new@emxaple.com',NULL,'customer','2025-11-11 16:29:49','2025-11-11 16:29:49',NULL,'free'),(51,NULL,'Neel Bronx','0987653490','neel@example.com',NULL,'customer','2025-11-11 16:48:39','2025-11-11 16:48:39',NULL,'free'),(52,NULL,'Sam Sung','1234567890','Samsung@example.com',NULL,'customer','2025-11-11 18:28:48','2025-11-11 18:28:48',NULL,'free'),(53,NULL,'Subhash Giri','8627771252','subashchadragiri09@gmail.com',NULL,'customer','2025-11-11 20:58:14','2025-11-11 20:58:14',NULL,'free'),(54,NULL,'Subash Chandra Giri','8627771252','subhashchandragiri09@gmail.com',NULL,'owner','2025-11-11 20:59:49','2025-11-11 20:59:49',NULL,'free'),(55,'m6RgnkR79wdsYOiAC8fKcPOEmbR2','Luz Elena Grajales','0000000000','luzelenagrajales99@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocILzORcOu-pCisSdo4Z4fD7RwyupFFcLdw1I2cXFE19r5nUmA=s96-c','owner','2025-11-11 21:02:26','2025-12-03 00:56:38',8,'free'),(56,NULL,'Hager Sahin','9087654120','hager@example.com',NULL,'customer','2025-11-11 22:50:00','2025-11-11 22:50:00',NULL,'free'),(57,NULL,'Hager ','098789781','hager1@example.com',NULL,'owner','2025-11-11 22:51:48','2025-11-11 22:51:48',NULL,'free'),(58,NULL,'Hager Shahiin','0987654321','hager3@example.com',NULL,'owner','2025-11-11 23:11:00','2025-12-03 00:56:38',9,'free'),(59,NULL,'Sandeeb Adhikari','0987654325','owner4@example.com',NULL,'owner','2025-11-11 23:40:53','2025-11-11 23:40:53',NULL,'free'),(60,NULL,'Nela Shaha','0987654321','salonstyle@example.com',NULL,'owner','2025-11-11 23:50:02','2025-11-11 23:50:02',NULL,'free'),(61,NULL,'Master Man','0987654329','master@example.com',NULL,'owner','2025-11-11 23:51:07','2025-11-11 23:51:07',NULL,'free'),(62,NULL,'Salon Owner','0987654321','owner5@example.com',NULL,'owner','2025-11-12 00:50:25','2025-11-12 00:50:25',NULL,'free'),(63,NULL,'Test Owner','0987654321','salontest@example.com',NULL,'owner','2025-11-12 01:06:27','2025-11-12 01:06:27',NULL,'free'),(64,NULL,'Test','0987654323','test@example.com',NULL,'owner','2025-11-12 16:10:45','2025-12-03 00:56:38',10,'free'),(65,NULL,'Little Owner','0987654323','salonlittle@example.com',NULL,'owner','2025-11-13 16:33:41','2025-12-03 00:56:38',11,'free'),(66,NULL,'Tim Sam','0987654328','timssalon@example.com',NULL,'owner','2025-11-13 20:17:36','2025-12-03 00:56:38',12,'free'),(67,NULL,'Abhi Neptune','9876543250','owner12@example.com',NULL,'customer','2025-11-14 16:05:36','2025-11-14 16:05:36',NULL,'free'),(68,'14kT0nmTQLOBs15eTul2hOmgTjI3','sid','9738181320','sidradakhel21@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocK5_A2WNtUgB6dsPzx49vRX8FUEoIHIXSKQ9lHWz_te-E50QrTT=s96-c','customer','2025-11-14 19:50:41','2025-12-05 19:04:35',NULL,'free'),(69,'7hI01hpek8UXPSeyfIxlKUFR0nj1','sami','9738181320','sidradakhel22@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJTpRtXxKiS4acWAsuRwIPusxb09HClKqsy27c34mCiO_J2QA=s96-c','owner','2025-11-14 19:51:08','2025-12-05 19:05:00',NULL,'free'),(70,NULL,'TestAF TestAL','0987654322','testAFL@example.com',NULL,'customer','2025-11-14 22:08:52','2025-11-14 22:08:52',NULL,'free'),(71,NULL,'TestAOF TestAOL','9876543202','testAOFL@example.com',NULL,'owner','2025-11-14 22:12:31','2025-12-03 00:56:38',13,'free'),(72,NULL,'TestBF TestBL','9807654678','testbfl@example.com',NULL,'owner','2025-11-14 23:37:13','2025-12-03 00:56:38',14,'free'),(73,NULL,'Noran Shahin','9734950731','nshahin277@gmail.com',NULL,'customer','2025-11-15 18:06:49','2025-11-15 18:06:49',NULL,'free'),(74,NULL,'john smith','123243214','test@gmail.com',NULL,'owner','2025-11-15 18:19:43','2025-12-04 00:34:24',15,'free'),(75,NULL,'Hager Shahin','2017479556','hagershahin4@icloud.com',NULL,'customer','2025-11-15 20:00:40','2025-12-07 15:32:10',NULL,'free'),(76,'aOeMkx7tcThKGwtyaC4y901s5sW2','Sandeeb Adhikari','0000000000','sa2734@njit.edu','https://lh3.googleusercontent.com/a/ACg8ocIczNsCxxLbellMYyOBQyFbe9KSOublMiyEMDGnpB-sxGqtJA=s96-c','customer','2025-11-15 20:06:28','2025-11-15 20:06:28',NULL,'free'),(77,NULL,'Helen Miller','987654320','sandeebadhikari1@gmai.com',NULL,'customer','2025-11-22 20:45:44','2025-11-22 20:45:44',NULL,'free'),(78,NULL,'Hem Bahadur','9878994353','subashchandragiri09@gmail.com',NULL,'customer','2025-11-22 20:54:55','2025-11-22 20:54:55',NULL,'free'),(79,NULL,'TestOwner01','6107731821','amruthaj1206@gmail.com',NULL,'owner','2025-11-26 18:42:56','2025-12-03 00:56:38',16,'free'),(83,NULL,'Sidra Dakhel','9145732928','sidradakhel24@gmail.com',NULL,'customer','2025-12-03 00:56:03','2025-12-03 00:56:03',NULL,'free'),(84,'hARmHxcfs2Ypfc5OYBtt7Z5YG563','Neelaza Dahal','0000000000','neelazadahal@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocIB_ednteT2z7a21DLkGnyCOI8FZQKdjUi7tF6iBxnE7f6JgY0=s96-c','customer','2025-12-03 02:49:49','2025-12-03 02:49:49',NULL,'free'),(86,NULL,'Elysa Rod','2017479556','shahinhm483@gmail.com',NULL,'customer','2025-12-03 04:33:38','2025-12-09 04:46:07',NULL,'free'),(93,NULL,'Rebecca Olsen','2017479556','manestudio@gmail.com',NULL,'owner','2025-12-03 05:17:26','2025-12-03 05:17:26',20,'free'),(94,NULL,'stygo admins','2017479556','stygo.notification@gmail.com',NULL,'admin','2025-12-03 05:34:30','2025-12-03 05:34:30',NULL,'free'),(95,NULL,'Ryan Sanchez','2017479556','rezo@gmail.com',NULL,'owner','2025-12-03 05:37:11','2025-12-03 05:37:11',21,'free'),(96,NULL,'Daniel','1234567890','daguerrero33@gmail.com',NULL,'owner','2025-12-03 15:34:13','2025-12-03 15:34:14',22,'free'),(97,'J8kTAJxFirVIheFykYNiE25GoRV2','Sidra Dakhel','0000000000','sd294@njit.edu','https://lh3.googleusercontent.com/a/ACg8ocK8zsfpkFTnjog4Drm7ifV_J_UuoClmRr1JokjeHikqFB2RLw=s96-c','owner','2025-12-04 00:12:29','2025-12-04 00:12:29',23,'free'),(98,NULL,'s','9738181320','senahdakhel@gmail.com',NULL,'owner','2025-12-04 00:17:12','2025-12-04 00:59:39',24,'premium'),(99,NULL,'Eugene Gomez','1987654320','dag83@njit.edu',NULL,'customer','2025-12-04 00:21:18','2025-12-05 04:02:46',NULL,'free'),(100,NULL,'laila ibr','2017479556','lailaibr449@gmail.com',NULL,'staff','2025-12-04 00:31:59','2025-12-07 15:43:27',NULL,'free'),(101,NULL,'Daniel Guerrero','1234567890','toriy93614@datehype.com',NULL,'customer','2025-12-04 00:32:09','2025-12-04 00:32:09',NULL,'free'),(102,NULL,'Mustafa Shahin','2017479556','smustafa025@gmail.com',NULL,'customer','2025-12-04 00:34:51','2025-12-04 00:34:51',NULL,'free'),(103,NULL,'sid dak','9738324255','sdakhel99@gmail.com',NULL,'owner','2025-12-05 19:03:38','2025-12-05 19:03:38',25,'free'),(104,'IKxR6ma95eNI3D554lPCX751GN72','Sandeeb Adhikari','0000000000','gtstore1st@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJ1-K91AinGIH9c2-auz91e23HLbSW6BxyPC3i9xuV9eJvNsw=s96-c','customer','2025-12-06 03:12:45','2025-12-06 03:12:45',NULL,'free'),(105,NULL,'Bob','9734950731','bobthebarber@gmail.com',NULL,'owner','2025-12-06 06:17:12','2025-12-06 06:17:12',26,'free'),(106,NULL,'Nawal Hanafy','2017479556','nawalhanafy@gmail.com',NULL,'customer','2025-12-08 04:15:29','2025-12-08 04:15:29',NULL,'free'),(107,NULL,'Freddy','2017479556','freddy@gmail.com',NULL,'owner','2025-12-11 21:32:32','2025-12-11 21:32:33',27,'free');
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

-- Dump completed on 2025-12-12 11:50:35
