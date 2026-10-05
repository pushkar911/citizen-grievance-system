<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../config/database.php";

try {

    // =====================================================
    // ONLY GET REQUESTS
    // =====================================================

    if ($_SERVER["REQUEST_METHOD"] !== "GET") {

        http_response_code(405);

        echo json_encode([
            "success" => false,
            "message" => "Only GET requests are allowed"
        ]);

        exit;
    }


    // =====================================================
    // GET GRIEVANCE ID
    // =====================================================

    /*
     * Accept grievanceId from the URL.
     *
     * Example:
     * track_grievance.php?grievanceId=GRV123
     */

    $grievanceId = trim(
        $_GET["grievanceId"]
        ?? $_GET["id"]
        ?? ""
    );


    // =====================================================
    // VALIDATE GRIEVANCE ID
    // =====================================================

    if ($grievanceId === "") {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Grievance ID is required"
        ]);

        exit;
    }


    // =====================================================
    // CONNECT TO MONGODB ATLAS
    // =====================================================

    $db = getDatabase();

    $grievances = $db->grievances;


    // =====================================================
    // SEARCH GRIEVANCE
    // =====================================================

    $grievance = $grievances->findOne([
        "grievanceId" => $grievanceId
    ]);


    // =====================================================
    // GRIEVANCE NOT FOUND
    // =====================================================

    if (!$grievance) {

        http_response_code(404);

        echo json_encode([
            "success" => false,
            "message" => "Grievance not found"
        ]);

        exit;
    }


    // =====================================================
    // PUBLIC TRACKING DATA
    // =====================================================

    /*
     * Do NOT return:
     *
     * - citizen name
     * - email
     * - userId
     * - password
     */

    echo json_encode([

        "success" => true,

        "message" => "Grievance found",

        "grievance" => [

            "grievanceId" =>
                $grievance["grievanceId"] ?? "",

            "title" =>
                $grievance["title"] ?? "",

            "description" =>
                $grievance["description"] ?? "",

            "location" =>
                $grievance["location"] ?? "",

            "latitude" =>
                $grievance["latitude"] ?? null,

            "longitude" =>
                $grievance["longitude"] ?? null,

            "category" =>
                $grievance["category"] ?? "General",

            "priority" =>
                $grievance["priority"] ?? "Medium",

            "department" =>
                $grievance["department"]
                ?? "General Department",

            "status" =>
                $grievance["status"]
                ?? "Submitted",

            "resolution" =>
                $grievance["resolution"]
                ?? null,

            "createdAt" =>
                isset($grievance["createdAt"])
                    ? $grievance["createdAt"]
                        ->toDateTime()
                        ->format("Y-m-d H:i:s")
                    : null
        ]
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" => "Server error",

        "error" => $e->getMessage()

    ]);
}