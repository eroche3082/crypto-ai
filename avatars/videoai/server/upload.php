<?php

if (!file_exists('recordings')) {
    mkdir('recordings', 0777, true);
}
$dir = '../server/recordings/';
$filename = $dir.$_GET['filename'];

$content = fopen('php://input', 'r');
file_put_contents($filename, $content, FILE_APPEND | LOCK_EX);
