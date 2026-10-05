<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {

    // Connect to MongoDB Atlas through database.php
    $db = getDatabase();

    $grievances = $db->grievances;

    // GET — fetch all grievances
    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $cursor = $grievances->find(
            [],
            [
                "sort" => [
                    "createdAt" => -1
                ]
            ]
        );

        $data = [];

        foreach ($cursor as $grievance) {

            $data[] = [
                "grievanceId" => $grievance["grievanceId"],
                "title" => $grievance["title"],
                "description" => $grievance["description"],
                "location" => $grievance["location"],
                "category" => $grievance["category"],
                "priority" => $grievance["priority"],
                "department" => $grievance["department"],
                "status" => $grievance["status"],
                "resolution" => $grievance["resolution"]
            ];
        }

        echo json_encode([
            "success" => true,
            "grievances" => $data
        ]);

        exit;
    }

    // PUT — update grievance
    if ($_SERVER["REQUEST_METHOD"] === "PUT") {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $grievanceId = trim(
            $data["grievanceId"] ?? ""
        );

        $status = trim(
            $data["status"] ?? ""
        );

        $resolution = trim(
            $data["resolution"] ?? ""
        );

        if ($grievanceId === "" || $status === "") {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Grievance ID and status are required"
            ]);

            exit;
        }

        $result = $grievances->updateOne(
            [
                "grievanceId" => $grievanceId
            ],
            [
                '$set' => [
                    "status" => $status,
                    "resolution" => $resolution
                ]
            ]
        );

        if ($result->getMatchedCount() === 0) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Grievance not found"
            ]);

            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Grievance updated successfully"
        ]);

        exit;
    }

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}