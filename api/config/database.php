<?php
// ====================================================
// CONFIGURACIÓN DE BASE DE DATOS MYSQL (PHP VERSION)
// Version: 3.1 - PDO Singleton Pattern
// Archivo: api/config/database.php
// Última modificación: 2024-11-10
// ====================================================

class Database {
    private static $instance = null;
    private $connection = null;

    // Configuración de conexión
    private $host;
    private $database;
    private $username;
    private $password;
    private $port;
    private $charset;

    private function __construct() {
        // Leer .env línea a línea (parse_ini_file falla con caracteres como ! sin comillas)
        $env = [];
        $envPath = __DIR__ . '/../../.env';
        if (file_exists($envPath)) {
            foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if ($line[0] === '#' || strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $env[trim($k)] = trim($v);
            }
        }
        $this->host     = $env['DB_HOST']     ?? getenv('DB_HOST')     ?: 'localhost';
        $this->database = $env['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'gastos_app_db';
        $this->username = $env['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: '';
        $this->password = $env['DB_PASSWORD'] ?? getenv('DB_PASSWORD') ?: '';

        $this->port = 3306;
        $this->charset = 'utf8mb4';

        $this->connect();
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->database};charset={$this->charset}";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            error_log("✅ Conexión MySQL establecida");
        } catch (PDOException $e) {
            error_log("❌ Error conectando a MySQL: " . $e->getMessage());
            throw $e;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        if ($this->connection === null) {
            $this->connect();
        }
        return $this->connection;
    }

    public function executeQuery($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("❌ Error ejecutando query: " . $e->getMessage());
            throw $e;
        }
    }

    public function executeUpdate($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("❌ Error ejecutando update: " . $e->getMessage());
            throw $e;
        }
    }

    public function executeInsert($query, $params = []) {
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute($params);
            return $this->connection->lastInsertId();
        } catch (PDOException $e) {
            error_log("❌ Error ejecutando insert: " . $e->getMessage());
            throw $e;
        }
    }

    public function testConnection() {
        try {
            $stmt = $this->connection->query('SELECT 1 as test');
            $result = $stmt->fetch();
            error_log("✅ Test de conexión MySQL exitoso");
            return true;
        } catch (PDOException $e) {
            error_log("❌ Error en test de conexión MySQL: " . $e->getMessage());
            return false;
        }
    }

    public function __destruct() {
        $this->connection = null;
    }
}

// Funciones helper
function getConnection() {
    return Database::getInstance()->getConnection();
}

function executeQuery($query, $params = []) {
    return Database::getInstance()->executeQuery($query, $params);
}

function executeUpdate($query, $params = []) {
    return Database::getInstance()->executeUpdate($query, $params);
}

function executeInsert($query, $params = []) {
    return Database::getInstance()->executeInsert($query, $params);
}

function testConnection() {
    return Database::getInstance()->testConnection();
}

function getEnvValue($key, $default = '') {
    static $envCache = null;
    if ($envCache === null) {
        $envCache = [];
        $envPath = __DIR__ . '/../../.env';
        if (file_exists($envPath)) {
            foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if ($line[0] === '#' || strpos($line, '=') === false) continue;
                [$k, $v] = explode('=', $line, 2);
                $envCache[trim($k)] = trim($v);
            }
        }
    }
    return $envCache[$key] ?? getenv($key) ?: $default;
}
