<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../vendor/autoload.php";

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {

    if ($_SERVER["REQUEST_METHOD"] !== "GET") {
        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Only GET requests are allowed"
        ]);

        exit;
    }

    $userId = trim($_GET["userId"] ?? "");

    if ($userId === "") {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "User ID is required"
        ]);

        exit;
    }

    try {
        $userObjectId = new ObjectId($userId);
    } catch (Exception $e) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Invalid user ID"
        ]);

        exit;
    }

    $client = new Client(
        "mongodb://127.0.0.1:27017"
    );

    $db = $client->selectDatabase(
        "citizen_grievance"
    );

    $grievances = $db->grievances;

    $results = $grievances->find(
        [
            "userId" => $userObjectId
        ],
        [
            "sort" => [
                "createdAt" => -1
            ]
        ]
    );

    $data = [];

    foreach ($results as $grievance) {

        $data[] = [
            "grievanceId" =>
                $grievance["grievanceId"] ?? "",

            "title" =>
                $grievance["title"] ?? "",

            "description" =>
                $grievance["description"] ?? "",

            "location" =>
                $grievance["location"] ?? "",

            "category" =>
                $grievance["category"] ?? "General",

            "priority" =>
                $grievance["priority"] ?? "Medium",

            "department" =>
                $grievance["department"] ?? "General Department",

            "status" =>
                $grievance["status"] ?? "Submitted",

            "resolution" =>
                $grievance["resolution"] ?? null,

            "createdAt" =>
                isset($grievance["createdAt"])
                    ? $grievance["createdAt"]
                        ->toDateTime()
                        ->format("Y-m-d H:i:s")
                    : null
        ];
    }

    echo json_encode([
        "success" => true,
        "count" => count($data),
        "grievances" => $data
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}