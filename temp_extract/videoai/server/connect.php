<?php

$servername = 'localhost';
$database = '';
$username = '';
$password = '';
$charset = 'utf8mb4';
$dbPrefix = 'lsv_';
$setVal = '';
$fromEmail = '';
$apiKeyChatGpt = '';
$chatGptModel = 'gpt-3.5-turbo';
$maxTokens = 1000;
$apiKeyHeygen = '';
$apiKeyHeygenStream = '';
$videoUrlAvatar = 'https://api.heygen.com/';
$apiKeyElevenLabs = '';
$elevenLabsModel = 'eleven_turbo_v2_5';
$audioUrlAvatar = 'https://api.elevenlabs.io/';
$timezone = '';


$dsn = "mysql:host=$servername;dbname=$database;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $username, $password, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
