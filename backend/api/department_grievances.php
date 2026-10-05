<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../vendor/autoload.php";

use MongoDB\Client;

try {

    $client = new Client(
        "mongodb://127.0.0.1:27017"
    );

    $db = $client->selectDatabase(
        "citizen_grievance"
    );

    $grievances = $db->grievances;

    /*
     * GET
     * Department sees only its own grievances
     */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $department = trim(
            $_GET["department"] ?? ""
        );

        if ($department === "") {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Department is required"
            ]);

            exit;
        }

        $results = $grievances->find(
            [
                "department" => $department
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
                    $grievance["category"] ?? "",

                "priority" =>
                    $grievance["priority"] ?? "",

                "department" =>
                    $grievance["department"] ?? "",

                "status" =>
                    $grievance["status"] ?? "Submitted",

                "resolution" =>
                    $grievance["resolution"] ?? null
            ];
        }

        echo json_encode([
            "success" => true,
            "grievances" => $data
        ]);

        exit;
    }


    /*
     * PUT
     * Department updates status
     */

    if ($_SERVER["REQUEST_METHOD"] === "PUT") {

        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $grievanceId =
            trim($data["grievanceId"] ?? "");

        $status =
            trim($data["status"] ?? "");

        $department =
            trim($data["department"] ?? "");

        if (
            $grievanceId === "" ||
            $status === "" ||
            $department === ""
        ) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Required fields are missing"
            ]);

            exit;
        }

        $allowedStatuses = [
            "Submitted",
            "In Progress",
            "Resolved"
        ];

        if (!in_array(
            $status,
            $allowedStatuses
        )) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Invalid status"
            ]);

            exit;
        }

        $result = $grievances->updateOne(
            [
                "grievanceId" => $grievanceId,
                "department" => $department
            ],
            [
                '$set' => [
                    "status" => $status
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
            "message" => "Status updated successfully"
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