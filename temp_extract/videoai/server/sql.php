<?php

require_once 'connect.php';
function runMySql() {
    global $pdo;
    $versionFile = '../pages/version.txt';
    $currentVersion = file_get_contents($versionFile);
    $sql = file_get_contents('../server/dump_' . $currentVersion . '.sql');
    $pdo->exec($sql);
    file_put_contents($versionFile, $currentVersion . '.1');
}