/*!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.8-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: PuebloBonitoDB
-- ------------------------------------------------------
-- Server version	10.11.8-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Campañas`
--

DROP TABLE IF EXISTS `Campañas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Campañas` (
  `id_campaña` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_campaña` varchar(500) NOT NULL,
  `tipo_campaña` varchar(500) DEFAULT NULL,
  `fecha_ingreso_inicial` date DEFAULT NULL,
  `fecha_ingreso_final` date DEFAULT NULL,
  `fecha_envio_inicial` date DEFAULT NULL,
  `numero_envios` tinyint(4) DEFAULT NULL,
  `dias_intervalo_envios` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id_campaña`),
  UNIQUE KEY `nombre_campaña` (`nombre_campaña`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Hoteles`
--

DROP TABLE IF EXISTS `Hoteles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Hoteles` (
  `id_hotel` tinyint(4) NOT NULL,
  `Hotel` varchar(500) DEFAULT NULL,
  `Zona` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_hotel`),
  UNIQUE KEY `Hotel` (`Hotel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PB_front`
--

DROP TABLE IF EXISTS `PB_front`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PB_front` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto` varchar(255) DEFAULT NULL,
  `folio` varchar(10) DEFAULT NULL,
  `folio2` varchar(255) DEFAULT NULL,
  `folio3` varchar(255) DEFAULT NULL,
  `unidad` varchar(255) DEFAULT NULL,
  `apellido` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `ciudad` varchar(255) DEFAULT NULL,
  `pais` varchar(50) DEFAULT NULL,
  `estado` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `telefono_of` varchar(20) DEFAULT NULL,
  `telefono_cell` varchar(20) DEFAULT NULL,
  `segmento` varchar(255) DEFAULT NULL,
  `grupo` varchar(255) DEFAULT NULL,
  `mplan` varchar(255) DEFAULT NULL,
  `fec_llegada` date DEFAULT NULL,
  `noches` int(11) DEFAULT NULL,
  `fec_salida` date DEFAULT NULL,
  `adultos` int(11) DEFAULT NULL,
  `enviado` varchar(50) DEFAULT NULL,
  `no_envios` varchar(11) DEFAULT NULL,
  `no_admon` varchar(11) DEFAULT NULL,
  `no_agente` varchar(11) DEFAULT NULL,
  `flyers_enviados` varchar(11) DEFAULT NULL,
  `agente` varchar(255) DEFAULT NULL,
  `ingreso` varchar(255) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PuebloBonitoDB_PRIMARY` (`id`),
  UNIQUE KEY `PB_front_PRIMARY` (`id`),
  UNIQUE KEY `folio` (`folio`,`email`),
  UNIQUE KEY `PuebloBonitoDB_folio` (`folio`,`email`),
  UNIQUE KEY `PB_front_folio_email` (`folio`,`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11031 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`montse`@`localhost`*/ /*!50003 TRIGGER `Actualizar Paises al modificar registros` BEFORE INSERT ON `PB_front` FOR EACH ROW BEGIN
    -- Verifica si el país no existe en la tabla Paises
    IF NOT EXISTS (SELECT 1 FROM Paises WHERE nombre_pais = NEW.pais) THEN
        -- Inserta el país con su región correspondiente
        INSERT INTO Paises (nombre_pais, region)
        VALUES (
            NEW.pais,
            CASE
                WHEN NEW.pais REGEXP '^(Mexico|México|mx|Mex|MEX)$' THEN 'Mex'
                ELSE 'Otros'
            END
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`montse`@`localhost`*/ /*!50003 TRIGGER `Actualizar Paises con Nuevos Registros` BEFORE UPDATE ON `PB_front` FOR EACH ROW BEGIN
    -- Verifica si el país no existe en la tabla Paises
    IF NOT EXISTS (SELECT 1 FROM Paises WHERE nombre_pais = NEW.pais) THEN
        -- Inserta el país con su región correspondiente
        INSERT INTO Paises (nombre_pais, region)
        VALUES (
            NEW.pais,
            CASE
                WHEN NEW.pais REGEXP '^(Mexico|México|mx|Mex|MEX)$' THEN 'Mex'
                ELSE 'Otros'
            END
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Paises`
--

DROP TABLE IF EXISTS `Paises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Paises` (
  `id_pais` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_pais` varchar(255) NOT NULL,
  `region` varchar(10) NOT NULL,
  PRIMARY KEY (`id_pais`),
  UNIQUE KEY `nombre_pais` (`nombre_pais`),
  KEY `idx_region` (`region`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SP_control_offset`
--

DROP TABLE IF EXISTS `SP_control_offset`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SP_control_offset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `offset_value` int(11) DEFAULT NULL,
  `total_processed` int(11) DEFAULT NULL,
  `last_date_processed` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_expected` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PuebloBonitoDB_PRIMARY` (`id`),
  UNIQUE KEY `SP_control_offset_PRIMARY` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SP_envios`
--

DROP TABLE IF EXISTS `SP_envios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SP_envios` (
  `registro_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` varchar(50) NOT NULL,
  `content_hash` varchar(32) DEFAULT NULL,
  `send_date` datetime DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `recipient` varchar(255) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `smtp_answer_code` int(11) DEFAULT NULL,
  `smtp_answer_code_explain` varchar(255) DEFAULT NULL,
  `smtp_answer_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tracking` varchar(10000) DEFAULT NULL,
  `clicks` int(11) DEFAULT 0,
  `opens` int(11) DEFAULT 0,
  `client_info` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PuebloBonitoDB_PRIMARY` (`id`),
  UNIQUE KEY `SP_envios_PRIMARY` (`id`),
  KEY `idx_registro_id` (`registro_id`),
  KEY `PuebloBonitoDB_idx_registro_id` (`registro_id`),
  KEY `SP_envios_registro_id` (`registro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=856712 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SP_envios_temp`
--

DROP TABLE IF EXISTS `SP_envios_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SP_envios_temp` (
  `registro_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id` varchar(50) NOT NULL,
  `content_hash` varchar(32) DEFAULT NULL,
  `send_date` datetime DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `recipient` varchar(255) DEFAULT NULL,
  `subject` text DEFAULT NULL,
  `smtp_answer_code` int(11) DEFAULT NULL,
  `smtp_answer_code_explain` varchar(255) DEFAULT NULL,
  `smtp_answer_data` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tracking` varchar(10000) DEFAULT NULL,
  `clicks` int(11) DEFAULT 0,
  `opens` int(11) DEFAULT 0,
  `client_info` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PuebloBonitoDB_PRIMARY` (`id`),
  UNIQUE KEY `SP_envios_temp_PRIMARY` (`id`),
  KEY `idx_registro_id` (`registro_id`),
  KEY `PuebloBonitoDB_idx_registro_id` (`registro_id`),
  KEY `SP_envios_temp_registro_id` (`registro_id`)
) ENGINE=InnoDB AUTO_INCREMENT=148003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SP_extraction_history`
--

DROP TABLE IF EXISTS `SP_extraction_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SP_extraction_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `date_range_from` datetime DEFAULT NULL,
  `date_range_to` datetime DEFAULT NULL,
  `total_records` int(11) DEFAULT NULL,
  `successful_inserts` int(11) DEFAULT NULL,
  `total_batches` int(11) DEFAULT NULL,
  `last_offset` int(11) DEFAULT NULL,
  `execution_time` float DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `status` enum('completed','error','running') DEFAULT NULL,
  `execution_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`execution_details`)),
  `total_expected` int(11) DEFAULT 0,
  `completion_percentage` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SP_extraction_history_PRIMARY` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Subjects`
--

DROP TABLE IF EXISTS `Subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Subjects` (
  `id_asunto` int(11) NOT NULL,
  `asunto_correo` varchar(500) DEFAULT NULL,
  `tipo_cliente` varchar(500) DEFAULT NULL,
  `pais` varchar(10) DEFAULT NULL,
  `HTML` text DEFAULT NULL,
  `campaña` varchar(500) DEFAULT NULL,
  `zona_hoteles` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_asunto`),
  KEY `idx_tipo_cliente` (`tipo_cliente`),
  KEY `idx_pais` (`pais`),
  KEY `idx_zona_hoteles` (`zona_hoteles`),
  KEY `fk_campaña` (`campaña`),
  CONSTRAINT `fk_campaña` FOREIGN KEY (`campaña`) REFERENCES `Campañas` (`nombre_campaña`) ON UPDATE CASCADE,
  CONSTRAINT `fk_pais_region` FOREIGN KEY (`pais`) REFERENCES `Paises` (`region`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tipo_cliente`
--

DROP TABLE IF EXISTS `Tipo_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tipo_cliente` (
  `id_tipo_cliente` int(11) NOT NULL,
  `tipo_cliente` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_tipo_cliente`),
  UNIQUE KEY `tipo_cliente` (`tipo_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-02 19:19:20
