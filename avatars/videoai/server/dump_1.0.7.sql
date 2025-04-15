ALTER TABLE `lsv_agents` ADD `payment_enabled` TINYINT(4) NOT NULL DEFAULT '0' AFTER `heygen_key`;
ALTER TABLE `lsv_rooms` ADD `video_ai_gender` VARCHAR(10) NULL AFTER `video_ai_assistant`;
