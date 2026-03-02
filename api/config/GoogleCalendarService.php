<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use Google\Client;
use Google\Service\Calendar;
use GuzzleHttp\Client as GuzzleClient;

class GoogleCalendarService {
    private $client;
    private $service;
    private $calendarId = 'rockstarskull10@gmail.com'; // Tu ID de calendario
    private $tokenPath = __DIR__ . '/../config/token.json';

    public function __construct() {
        $this->client = new Client();
        // Configurar Guzzle para ignorar errores SSL (Fix para entorno local/fechas)
        $this->client->setHttpClient(new GuzzleClient(['verify' => false]));
        $this->client->setApplicationName('Symbiot Finance Manager');
        $this->client->setScopes(Calendar::CALENDAR);
        $this->client->setAccessType('offline'); // Importante para obtener refresh_token
        $this->client->setPrompt('select_account consent');
        
        // Ruta al archivo de credenciales
        $authConfig = __DIR__ . '/../config/google-credentials.json';
        
        if (!file_exists($authConfig)) {
            throw new Exception("No se encontró el archivo de credenciales en: $authConfig");
        }

        $this->client->setAuthConfig($authConfig);
        
        // Configurar Redirect URI — detecta automáticamente localhost vs producción
        if (!empty($_SERVER['HTTP_HOST'])) {
            $scheme     = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host       = $_SERVER['HTTP_HOST'];
            $docRoot    = rtrim(str_replace('\\', '/', $_SERVER['DOCUMENT_ROOT'] ?? ''), '/');
            $serviceDir = rtrim(str_replace('\\', '/', dirname(dirname(__DIR__))), '/');
            $projectPath = $docRoot ? str_replace($docRoot, '', $serviceDir) : '/symbiot/symbiot_finance_manager';
            $redirectUri = $scheme . '://' . $host . $projectPath . '/api/oauth2callback.php';
        } else {
            // Fallback para CLI / cron
            $redirectUri = 'http://localhost/symbiot/symbiot_finance_manager/api/oauth2callback.php';
        }
        $this->client->setRedirectUri($redirectUri);

        // Cargar Token si existe
        if (file_exists($this->tokenPath)) {
            $accessToken = json_decode(file_get_contents($this->tokenPath), true);
            $this->client->setAccessToken($accessToken);
        }
    }

    public function isConnected() {
        if ($this->client->getAccessToken()) {
            if ($this->client->isAccessTokenExpired()) {
                // Intentar renovar
                if ($this->client->getRefreshToken()) {
                    try {
                        $newAccessToken = $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
                        $this->saveToken($newAccessToken);
                        return true;
                    } catch (Exception $e) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public function getAuthUrl() {
        return $this->client->createAuthUrl();
    }

    public function authenticate($code) {
        $accessToken = $this->client->fetchAccessTokenWithAuthCode($code);
        if (!isset($accessToken['error'])) {
            $this->saveToken($accessToken);
            return true;
        }
        return false;
    }

    private function saveToken($accessToken) {
        // Fusionar con el token existente para no perder el refresh_token si no viene en la respuesta
        if (file_exists($this->tokenPath)) {
            $oldToken = json_decode(file_get_contents($this->tokenPath), true);
            $accessToken = array_merge($oldToken, $accessToken);
        }
        
        if (!file_exists(dirname($this->tokenPath))) {
            mkdir(dirname($this->tokenPath), 0700, true);
        }
        file_put_contents($this->tokenPath, json_encode($accessToken));
    }

    /**
     * Resuelve el colorId de Google Calendar según instrumento + maestro.
     * Devuelve null si la combinación no está mapeada (el evento usará el color por defecto).
     *
     * Referencia completa de IDs de color para eventos de Google Calendar:
     * ┌────┬──────────────────────────┬─────────────────┐
     * │ ID │ Nombre                   │ Hex             │
     * ├────┼──────────────────────────┼─────────────────┤
     * │  1 │ Lavanda  (Lavender)      │ #a4bdfc  (azul pálido)    │
     * │  2 │ Salvia   (Sage)          │ #7ae619  (verde claro)    │
     * │  3 │ Uva      (Grape)         │ #dbadff  (púrpura)        │
     * │  4 │ Flamenco (Flamingo)      │ #ff887c  (rosado/coral)   │
     * │  5 │ Plátano  (Banana)        │ #fbd75b  (amarillo)       │
     * │  6 │ Mandarina (Tangerine)    │ #ffb878  (naranja)        │
     * │  7 │ Pavo Real (Peacock)      │ #46d6db  (turquesa)       │
     * │  8 │ Grafito  (Graphite)      │ #e1e1e1  (gris)           │
     * │  9 │ Arándano (Blueberry)     │ #5484ed  (azul)           │
     * │ 10 │ Albahaca (Basil)         │ #51b749  (verde)          │
     * │ 11 │ Tomate   (Tomato)        │ #dc2127  (rojo)           │
     * └────┴──────────────────────────┴─────────────────┘
     * Fuente: Google Calendar API — IDs de string "1"–"11" en campo colorId del Event.
     */
    private function resolveColorId(string $instrument, string $teacherName): ?string {
        $instr     = mb_strtolower(trim($instrument));
        $firstName = mb_strtolower(explode(' ', trim($teacherName))[0]);

        $map = [
            'batería-julio'   => '7',   // Turquesa  (Peacock)
            'bateria-julio'   => '7',
            'guitarra-irwin'  => '6',   // Mandarina (Tangerine)
            'canto-nahomy'    => '4',   // Flamenco  (Flamingo)
            'bajo-luis'       => '10',   // Albahaca  (Basil)
            'guitarra-hugo'   => '3',   // Uva       (Grape)
            'teclado-harim'   => '9',   // Índigo    (Blueberry)
            'teclado-manuel'  => '5',   // Banana    (Banana)
            'batería-demian'  => '1',   // Lavanda   (Lavender)
            'bateria-demian'  => '1',
        ];

        return $map["$instr-$firstName"] ?? null;
    }

    /**
     * Crear un evento en el calendario
     */
    public function createEvent($summary, $description, $startDateTime, $endDateTime, $recurrence = null, $colorId = null) {
        if (!$this->isConnected()) {
            return false;
        }

        // Asegurar que el servicio esté inicializado
        if (!$this->service) {
            $this->service = new Calendar($this->client);
        }

        $eventData = [
            'summary' => $summary,
            'description' => $description,
            'start' => [
                'dateTime' => $startDateTime,
                'timeZone' => 'America/Mexico_City',
            ],
            'end' => [
                'dateTime' => $endDateTime,
                'timeZone' => 'America/Mexico_City',
            ],
        ];

        if ($recurrence) {
            $eventData['recurrence'] = $recurrence;
        }

        $event = new Calendar\Event($eventData);

        // setColorId() explícito: el constructor de Calendar\Event no garantiza
        // que las propiedades planas del array sean serializadas correctamente.
        if ($colorId !== null) {
            $event->setColorId($colorId);
        }

        try {
            $createdEvent = $this->service->events->insert($this->calendarId, $event);
            return $createdEvent->htmlLink;
        } catch (Exception $e) {
            error_log("Error creando evento en Google Calendar: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Agendar clase (Inteligente: Crea o Fusiona con &)
     * Maneja nomenclatura: INSTRUMENTO - ALUMNO1 & ALUMNO2 - MAESTRO
     */
    public function scheduleClassEvent($studentName, $instrument, $teacherName, $startDateTime, $endDateTime, $recurrence = null) {
        if (!$this->isConnected()) return false;
        if (!$this->service) $this->service = new Calendar($this->client);

        // 1. Buscar si ya existe una clase de este instrumento a esta hora
        // Usamos un rango pequeño de tiempo para encontrar coincidencias exactas
        $optParams = [
            'timeMin' => $startDateTime,
            'timeMax' => $endDateTime,
            'singleEvents' => true,
            'q' => $instrument // Filtrar por instrumento
        ];
        
        try {
            $events = $this->service->events->listEvents($this->calendarId, $optParams);
            $existingEvent = null;
            
            foreach ($events->getItems() as $event) {
                $summary = $event->getSummary();
                // Verificar coincidencia de instrumento (ignorando mayúsculas/minúsculas)
                if (mb_stripos($summary, $instrument) !== false) {
                    // Si se especificó maestro, verificar que coincida (para no mezclar clases de diferentes maestros)
                    if ($teacherName && mb_stripos($summary, $teacherName) === false) {
                        continue; 
                    }
                    $existingEvent = $event;
                    break;
                }
            }

            if ($existingEvent) {
                // === FUSIONAR: Actualizar evento existente ===
                // Si es una instancia de una serie recurrente, obtenemos el evento maestro para actualizar toda la serie
                $masterEventId = $existingEvent->getRecurringEventId();
                if ($masterEventId) {
                    $eventToUpdate = $this->service->events->get($this->calendarId, $masterEventId);
                } else {
                    $eventToUpdate = $existingEvent;
                }

                $currentTitle = $eventToUpdate->getSummary();
                
                // Evitar duplicar si el alumno ya está
                if (mb_stripos($currentTitle, $studentName) !== false) {
                    return $existingEvent->htmlLink;
                }
                
                // Insertar nombre con & antes del maestro (si existe guión) o al final
                $parts = array_map('trim', explode('-', $currentTitle));
                if (count($parts) >= 2) {
                    // Asumimos formato: INSTRUMENTO - ALUMNOS - MAESTRO
                    // Agregamos al final de la sección de alumnos (índice 1)
                    $parts[1] .= " & $studentName";
                    $newTitle = implode(' - ', $parts);
                } else {
                    $newTitle = "$currentTitle & $studentName";
                }
                
                $eventToUpdate->setSummary($newTitle);
                $updatedEvent = $this->service->events->update($this->calendarId, $eventToUpdate->getId(), $eventToUpdate);
                return $updatedEvent->htmlLink;
                
            } else {
                // === CREAR: Nuevo evento ===
                $title = mb_strtoupper("$instrument - $studentName");
                if ($teacherName) {
                    $title .= " - " . mb_strtoupper($teacherName);
                }
                $colorId = $this->resolveColorId($instrument, $teacherName ?? '');
                return $this->createEvent($title, "Clase de $instrument", $startDateTime, $endDateTime, $recurrence, $colorId);
            }
        } catch (Exception $e) {
            error_log("Error agendando clase: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Buscar horario de un alumno específico y formatearlo
     * Formato: "17:00 a 18:00 Lun, 16:00 a 17:00 Mar"
     */
    public function getStudentSchedule($studentName, $instrument) {
        if (!$this->isConnected()) return "Error: No conectado a Google Calendar";
        
        // Asegurar que el servicio esté inicializado antes de usarlo
        if (!$this->service) {
            $this->service = new Calendar($this->client);
        }
        
        // Limpiar nombre para búsqueda (quitar espacios extra)
        $cleanName = trim(preg_replace('/\s+/', ' ', $studentName));
        $nameParts = explode(' ', $cleanName);
        $firstName = $nameParts[0] ?? '';
        
        // ESTRATEGIA MEJORADA: Buscar SOLO por "Primer Nombre" para máxima amplitud
        // El filtrado estricto de Instrumento y Apellidos lo hacemos en PHP
        $searchQuery = $firstName;
        
        $optParams = [
            'q' => $searchQuery,
            'maxResults' => 50,
            'orderBy' => 'startTime',
            'singleEvents' => true,
            'timeMin' => date('c', strtotime('-5 days')), // Desde hace 2 días (para ver clase actual si ya pasó hoy)
            'timeMax' => date('c', strtotime('+14 days')), // Hasta 2 semanas
        ];

        try {
            $results = $this->service->events->listEvents($this->calendarId, $optParams);
            $events = $results->getItems();
            
            $slots = [];
            
            // Función local para normalizar (minusculas y sin acentos)
            $normalize = function($str) {
                $str = mb_strtolower($str, 'UTF-8');
                $unwanted = [
                    'á'=>'a', 'é'=>'e', 'í'=>'i', 'ó'=>'o', 'ú'=>'u', 'ñ'=>'n', 'ü'=>'u',
                    'Á'=>'a', 'É'=>'e', 'Í'=>'i', 'Ó'=>'o', 'Ú'=>'u', 'Ñ'=>'n', 'Ü'=>'u'
                ];
                return strtr($str, $unwanted);
            };

            $instrumentNorm = $normalize($instrument);
            $studentNameNorm = $normalize($studentName);
            // Dividir nombre del alumno en partes significativas (>2 letras)
            $studentNameParts = array_filter(explode(' ', $studentNameNorm), function($p) {
                return strlen($p) > 2; 
            });
            
            // Mapeo de días inglés -> español corto
            $daysMap = [
                0 => 'Dom', 1 => 'Lun', 2 => 'Mar', 3 => 'Mie', 4 => 'Jue', 5 => 'Vie', 6 => 'Sab'
            ];
            
            foreach ($events as $event) {
                $summaryRaw = $event->getSummary();
                $summaryNorm = $normalize($summaryRaw);
                
                // 1. Filtrar por instrumento (si se proporciona)
                if (!empty($instrumentNorm) && strpos($summaryNorm, $instrumentNorm) === false) {
                    continue;
                }
                
                // 2. Verificar coincidencia de nombre (Lógica difusa)
                $matchCount = 0;
                foreach ($studentNameParts as $part) {
                    if (strpos($summaryNorm, $part) !== false) {
                        $matchCount++;
                    }
                }

                // Aceptamos si coinciden al menos 2 partes del nombre (ej: Carlos + Maya)
                // O si el nombre solo tiene 1 parte y coincide
                if (count($studentNameParts) > 1 && $matchCount < 2) continue;
                if (count($studentNameParts) == 1 && $matchCount < 1) continue;
                
                $start = $event->start->dateTime;
                $end = $event->end->dateTime;
                
                if (empty($start) || empty($end)) continue;
                
                // Convertir a zona horaria de México para visualización correcta
                $startObj = new DateTime($start);
                $startObj->setTimezone(new DateTimeZone('America/Mexico_City'));
                $endObj = new DateTime($end);
                $endObj->setTimezone(new DateTimeZone('America/Mexico_City'));
                
                $startTime = $startObj->format('H:i');
                $endTime = $endObj->format('H:i');
                $dayIndex = $startObj->format('w');
                $dayName = $daysMap[$dayIndex];
                
                // Agrupar por horario
                $key = "$startTime a $endTime";
                if (!isset($slots[$key])) $slots[$key] = [];
                if (!in_array($dayName, $slots[$key])) $slots[$key][] = $dayName;
            }
            
            if (empty($slots)) return "";
            
            // Formatear salida
            $parts = [];
            $dayOrder = array_flip(['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']);
            
            foreach ($slots as $timeRange => $days) {
                usort($days, function($a, $b) use ($dayOrder) { return $dayOrder[$a] - $dayOrder[$b]; });
                $daysStr = count($days) == 1 ? $days[0] : implode(', ', array_slice($days, 0, -1)) . ' y ' . end($days);
                $parts[] = "$timeRange $daysStr";
            }
            
            return implode(', ', $parts);
            
        } catch (Exception $e) {
            error_log("Error buscando horario en Calendar: " . $e->getMessage());
            return "Error: " . $e->getMessage();
        }
    }

    /**
     * Obtener las clases de hoy filtradas por nombre de maestro.
     * Parsea el formato estándar del calendario: "INSTRUMENTO - ALUMNO(S) - MAESTRO"
     */
    public function getClasesHoy($teacherName) {
        if (!$this->isConnected()) return [];
        if (!$this->service) $this->service = new Calendar($this->client);

        $tz = new DateTimeZone('America/Mexico_City');
        $todayStart = new DateTime('today', $tz);
        $todayEnd   = new DateTime('tomorrow', $tz);

        $optParams = [
            'timeMin'       => $todayStart->format('c'),
            'timeMax'       => $todayEnd->format('c'),
            'singleEvents'  => true,
            'orderBy'       => 'startTime',
            'maxResults'    => 100,
        ];

        $normalize = function($str) {
            $str = mb_strtolower($str, 'UTF-8');
            $map = ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ñ'=>'n','ü'=>'u',
                    'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ñ'=>'n','Ü'=>'u'];
            return strtr($str, $map);
        };

        $teacherNorm = $normalize($teacherName);
        // Usar solo primer apellido para match flexible (ej. "Olvera" en "JULIO OLVERA")
        $teacherParts = array_filter(explode(' ', $teacherNorm), function($p) { return strlen($p) > 2; });

        try {
            $results = $this->service->events->listEvents($this->calendarId, $optParams);
            $clases = [];

            foreach ($results->getItems() as $event) {
                $summary    = $event->getSummary() ?? '';
                $summaryNorm = $normalize($summary);
                $start      = $event->start->dateTime ?? $event->start->date ?? null;
                if (!$start) continue;

                // Verificar que el maestro esté mencionado en el summary
                $matchCount = 0;
                foreach ($teacherParts as $part) {
                    if (strpos($summaryNorm, $part) !== false) $matchCount++;
                }
                if ($matchCount < 1) continue;

                // Parsear "INSTRUMENTO - ALUMNO(S) - MAESTRO"
                $parts       = array_map('trim', explode('-', $summary));
                $instrumento = ucwords(mb_strtolower($parts[0] ?? '', 'UTF-8'));
                // Alumnos: todo lo que está entre instrumento y maestro (puede haber &)
                $alumnos = '';
                if (count($parts) >= 3) {
                    // parte 0 = instrumento, última = maestro, medio = alumnos
                    $alumnosParts = array_slice($parts, 1, count($parts) - 2);
                    $alumnos = implode(' - ', $alumnosParts);
                } elseif (count($parts) === 2) {
                    $alumnos = $parts[1];
                }
                // Limpiar: quitar nombre del maestro si quedó en alumnos
                $alumnos = trim($alumnos);

                $startObj = (new DateTime($start))->setTimezone($tz);
                $endObj   = (new DateTime($event->end->dateTime ?? $start))->setTimezone($tz);

                $clases[] = [
                    'instrumento' => $instrumento,
                    'alumnos'     => $alumnos,
                    'hora_inicio' => $startObj->format('H:i'),
                    'hora_fin'    => $endObj->format('H:i'),
                ];
            }

            // Ordenar por hora de inicio
            usort($clases, function($a, $b) { return strcmp($a['hora_inicio'], $b['hora_inicio']); });
            return $clases;

        } catch (Exception $e) {
            error_log("Error getClasesHoy: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Prueba de conexión: Obtener los próximos 10 eventos
     */
    public function testConnection() {
        if (!$this->isConnected()) {
            return "No conectado. Requiere autorización OAuth.";
        }

        $this->service = new Calendar($this->client);

        $optParams = array(
            'maxResults' => 10,
            'orderBy' => 'startTime',
            'singleEvents' => true,
            'timeMin' => date('c'),
        );
        
        try {
            $results = $this->service->events->listEvents($this->calendarId, $optParams);
            $events = $results->getItems();
            
            $output = "<h3>Conexión Exitosa con Google Calendar</h3>";
            $output .= "<p>Próximos eventos en <strong>{$this->calendarId}</strong>:</p><ul>";
            
            if (empty($events)) {
                $output .= "<li>No hay eventos próximos.</li>";
            } else {
                foreach ($events as $event) {
                    $start = $event->start->dateTime;
                    if (empty($start)) {
                        $start = $event->start->date;
                    }
                    $output .= "<li>" . $event->getSummary() . " (" . $start . ")</li>";
                }
            }
            $output .= "</ul>";
            return $output;
            
        } catch (Exception $e) {
            return "Error al conectar: " . $e->getMessage();
        }
    }

    /**
     * Remover alumno de sus clases en el calendario
     * Si es el único alumno, borra el evento. Si hay más (con &), solo quita su nombre.
     */
    public function removeStudentFromSchedule($studentName, $instrument) {
        if (!$this->isConnected()) return false;
        if (!$this->service) $this->service = new Calendar($this->client);

        // Limpiar nombre para búsqueda
        $cleanName = trim(preg_replace('/\s+/', ' ', $studentName));
        $nameParts = explode(' ', $cleanName);
        $firstName = $nameParts[0] ?? '';
        
        // Buscar eventos futuros
        $optParams = [
            'q' => $firstName,
            'maxResults' => 50,
            'orderBy' => 'startTime',
            'singleEvents' => true,
            'timeMin' => date('c'), // Desde hoy
            'timeMax' => date('c', strtotime('+3 months')),
        ];

        try {
            $results = $this->service->events->listEvents($this->calendarId, $optParams);
            $events = $results->getItems();
            
            // Normalización
            $normalize = function($str) {
                $str = mb_strtolower($str, 'UTF-8');
                $unwanted = ['á'=>'a', 'é'=>'e', 'í'=>'i', 'ó'=>'o', 'ú'=>'u', 'ñ'=>'n', 'ü'=>'u'];
                return strtr($str, $unwanted);
            };

            $instrumentNorm = $normalize($instrument);
            $studentNameNorm = $normalize($studentName);
            $studentNameParts = array_filter(explode(' ', $studentNameNorm), function($p) { return strlen($p) > 2; });
            
            $processedSeries = [];

            foreach ($events as $event) {
                $summaryRaw = $event->getSummary();
                $summaryNorm = $normalize($summaryRaw);

                // Verificar instrumento
                if (!empty($instrumentNorm) && strpos($summaryNorm, $instrumentNorm) === false) continue;

                // Verificar nombre (lógica difusa)
                $matchCount = 0;
                foreach ($studentNameParts as $part) {
                    if (strpos($summaryNorm, $part) !== false) $matchCount++;
                }
                if (count($studentNameParts) > 1 && $matchCount < 2) continue;
                if (count($studentNameParts) == 1 && $matchCount < 1) continue;

                // ENCONTRADO - Proceder a eliminar/actualizar
                $eventId = $event->getId();
                $recurringId = $event->getRecurringEventId();
                $targetEventId = $recurringId ? $recurringId : $eventId;
                
                if (isset($processedSeries[$targetEventId])) continue;
                $processedSeries[$targetEventId] = true;

                // Obtener evento maestro
                $eventToUpdate = $this->service->events->get($this->calendarId, $targetEventId);
                $currentTitle = $eventToUpdate->getSummary();
                
                // Parsear título: INSTRUMENTO - ALUMNOS - MAESTRO
                $parts = array_map('trim', explode('-', $currentTitle));
                
                // Reconstruir lista de alumnos
                $newParts = [];
                $studentsFound = false;

                foreach ($parts as $i => $part) {
                    // Asumimos que la parte con '&' o que coincide con el nombre es la de alumnos
                    if ($i > 0 && mb_stripos($part, $firstName) !== false) {
                        $studentsList = array_map('trim', explode('&', $part));
                        $filteredList = array_filter($studentsList, function($s) use ($normalize, $studentNameParts) {
                            $sNorm = $normalize($s);
                            foreach ($studentNameParts as $np) if (strpos($sNorm, $np) !== false) return false; // Eliminar si coincide
                            return true;
                        });
                        
                        if (!empty($filteredList)) {
                            $newParts[] = implode(' & ', $filteredList);
                            $studentsFound = true;
                        }
                        // Si está vacío, no lo agregamos (se elimina el alumno de esta parte)
                    } else {
                        $newParts[] = $part;
                    }
                }

                if (!$studentsFound && count($newParts) < count($parts)) {
                    // Si se eliminó la parte de alumnos y no quedan otros, borrar evento
                    $this->service->events->delete($this->calendarId, $targetEventId);
                    error_log("🗑️ Evento eliminado de Calendar: $currentTitle");
                } else {
                    // Actualizar evento con alumnos restantes
                    $newTitle = implode(' - ', $newParts);
                    if ($newTitle !== $currentTitle) {
                        $eventToUpdate->setSummary($newTitle);
                        $this->service->events->update($this->calendarId, $targetEventId, $eventToUpdate);
                        error_log("✏️ Evento actualizado en Calendar: $newTitle");
                    }
                }
            }
            return true;
        } catch (Exception $e) {
            error_log("Error removiendo alumno de Calendar: " . $e->getMessage());
            return false;
        }
    }
}
?>