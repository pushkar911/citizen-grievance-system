<?php

require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

try {
    $client = new Client("mongodb://127.0.0.1:27017");

    $database = $client->selectDatabase("citizen_grievance");

    echo "MongoDB Connected Successfully!";
} catch (Exception $e) {
    echo "MongoDB Connection Failed: " . $e->getMessage();
}