DROP TABLE IF EXISTS `lsv_agents`;
CREATE TABLE `lsv_agents` (
  `agent_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_master` tinyint(4) NOT NULL DEFAULT '0',
  `roomId` varchar(255) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `recovery_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `lsv_agents` (`agent_id`, `tenant`, `first_name`, `last_name`, `username`, `password`, `email`, `is_master`, `roomId`, `token`, `recovery_token`) VALUES
(1, 'admin', 'Admin', 'Admin', 'admin', '$2y$10$NtXNlBrNE0XdfVbk9WsG.OHcxEtIxi7V58zVvq0ukv0NdK2bXqefO', 'admin@admin.com', 1, '', '', NULL);

DROP TABLE IF EXISTS `lsv_chats`;
CREATE TABLE `lsv_chats` (
  `chat_id` int(255) NOT NULL AUTO_INCREMENT,
  `message` varchar(4000) DEFAULT NULL,
  `system` varchar(255) DEFAULT '',
  `to` varchar(255) DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
  `agent_id` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `room_id` varchar(255) DEFAULT NULL,
  `agent` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`chat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `lsv_logs`;
CREATE TABLE `lsv_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(255) DEFAULT NULL,
  `session` varchar(255) DEFAULT NULL,
  `ua` varchar(255) DEFAULT NULL,
  `constraint` varchar(255) DEFAULT NULL,
  `attendee` varchar(255) DEFAULT NULL,
  `agent` varchar(255) DEFAULT NULL,
  `agent_id` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `room_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `lsv_rooms`;
CREATE TABLE `lsv_rooms` (
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(255) DEFAULT NULL,
  `agenturl` varchar(2048) DEFAULT NULL,
  `roomId` varchar(255) DEFAULT NULL,
  `shortagenturl` varchar(255) DEFAULT NULL,
  `agent_id` varchar(255) DEFAULT NULL,
  `is_active` tinyint(4) NOT NULL DEFAULT '1',
  `video_ai_avatar` varchar(255) DEFAULT NULL,
  `video_ai_background` varchar(255) DEFAULT NULL,
  `video_ai_voice` varchar(255) DEFAULT NULL,
  `video_ai_quality` varchar(10) DEFAULT NULL,
  `video_ai_name` varchar(255) DEFAULT NULL,
  `video_ai_system` varchar(2000) DEFAULT NULL,
  `video_ai_tools` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;