ALTER TABLE `lsv_rooms` ADD `is_offset` TINYINT(4) NULL DEFAULT NULL AFTER `is_audio`;
ALTER TABLE `lsv_rooms` ADD `inactivity_timeout` INT(5) NULL AFTER `is_offset`;
ALTER TABLE `lsv_rooms` ADD `is_recording` tinyint(4) NOT NULL DEFAULT '0' AFTER `inactivity_timeout`;
ALTER TABLE `lsv_rooms` ADD `is_subtitle` tinyint(4) NOT NULL DEFAULT '1' AFTER `is_recording`;
ALTER TABLE `lsv_rooms` ADD `exit_meeting` VARCHAR(255) NULL AFTER `is_subtitle`;

DROP TABLE IF EXISTS `lsv_recordings`;
CREATE TABLE IF NOT EXISTS `lsv_recordings` (
  `recording_id` int(255) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `room_id` varchar(255) NOT NULL,
  `agent_id`  varchar(255) NULL,
  `date_created` datetime DEFAULT NULL,
  PRIMARY KEY (`recording_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
