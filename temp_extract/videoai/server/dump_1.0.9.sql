ALTER TABLE `lsv_agents` ADD `date_expired` DATETIME NULL AFTER `recovery_token`;
ALTER TABLE `lsv_rooms` ADD `is_audio` TINYINT(4) NULL DEFAULT NULL AFTER `duration`;
ALTER TABLE `lsv_agents` ADD `elevenlabs_key` VARCHAR(256) NULL AFTER `payment_enabled`;