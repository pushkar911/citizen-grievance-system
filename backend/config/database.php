<?php

require_once __DIR__ . "/../vendor/autoload.php";

use MongoDB\Client;

function getDatabase()
{
    $envFile = __DIR__ . "/../.env";

    $mongoUri = null;
    $databaseName = "citizen_grievance";

    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === "" || str_starts_with($line, "#")) {
                continue;
            }

            if (str_starts_with($line, "MONGODB_URI=")) {
                $mongoUri = substr($line, strlen("MONGODB_URI="));
            }

            if (str_starts_with($line, "MONGODB_DATABASE=")) {
                $databaseName = substr(
                    $line,
                    strlen("MONGODB_DATABASE=")
                );
            }
        }
    }

    if (!$mongoUri) {
        $mongoUri = getenv("MONGODB_URI");
    }

    if (!$mongoUri) {
        throw new Exception("MONGODB_URI is not configured.");
    }

    $client = new Client($mongoUri);

    return $client->selectDatabase($databaseName);
}