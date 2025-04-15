ALTER TABLE `lsv_rooms` CHANGE `video_ai_system` `video_ai_system` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;

DROP TABLE IF EXISTS `lsv_bookings`;
CREATE TABLE `lsv_bookings` (
  `booking_id` int(11) NOT NULL AUTO_INCREMENT,
  `timeslot` enum('9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm') DEFAULT NULL,
  `name` varchar(2048) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_booking` date DEFAULT NULL,
  PRIMARY KEY (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `lsv_rooms` ADD `video_ai_assistant` VARCHAR(256) NULL AFTER `is_context`;