<?php
// Paramètres de connexion à la base de données MySQL Pour le site heberger
// $servername = "sql306.infinityfree.com";
// $username = "if0_37004091"; // Utilisateur MySQL
// $password = "DuUW9izL2U"; // Mot de passe MySQL
// $database = "if0_37004091_laboratoire"; // Nom de votre base de données

// Paramètres de connexion à la base de données MySQL Pour le site en local
$servername = "localhost";
$username = "root"; // Utilisateur MySQL
$password = "Af1802Ie"; // Mot de passe MySQL
$database = "laboratoire"; // Nom de votre base de données

// Créer une connexion à la base de données
$conn = new mysqli($servername, $username, $password, $database);

// Vérifier la connexion
if ($conn->connect_error) {
    die("La connexion à la base de données a échoué : " . $conn->connect_error);
}
?>
