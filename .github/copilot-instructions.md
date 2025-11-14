# Symbiot Finance Manager - AI Coding Agent Instructions

## Project Overview
A full-stack financial management application (gastos app) with PHP backend and vanilla JavaScript frontend. Tracks expenses and income with PWA capabilities and session-based authentication.

**Key Structure:**
- `/gastos/` - Frontend (HTML, vanilla JS, CSS)
- `/api/` - Backend API (PHP with PDO)
- `/database.old/` - Legacy schema files (obsolete)

## Architecture & Data Flow

### Frontend-Backend Communication
- **Frontend entry:** `gastos/` folder serves HTML + JS
- **API endpoint:** `gastos/api/index.php` routes all requests
- **Auto-routing:** Path detection in `api-config.js` handles subdirectory deployments

**Request flow:**
1. Frontend JS calls `window.apiFetch()` or `apiRequest()` 
2. URL built via `window.buildApiUrl(endpoint)` 
3. Backend router (`api/index.php`) matches method + URI pattern
4. Controller handles logic, returns JSON

### Database
- **Singleton pattern:** `Database::getInstance()` in `api/config/database.php`
- **Helper functions:** Global `executeQuery()`, `executeUpdate()`, `executeInsert()`
- **Config source:** `.env` file or environment variables (DB_HOST, DB_DATABASE, etc.)
- **Charset:** utf8mb4

## Key Patterns & Conventions

### Frontend Module Pattern
Each feature area uses modular JS files that load independently:
- `dashboard-init.js` - Orchestration and main initialization
- `dashboard-api.js` - Centralized API communication
- `dashboard-core.js` - Core functionality (display logic)
- `dashboard-auth.js` - User session handling
- `dashboard-[feature].js` - Feature-specific functions (payments, students, transactions, etc.)

**Pattern:** Functions communicate via `window.currentUser`, `window.currentCompanyFilter` (global state)

### Backend Controller Pattern
Controllers inherit from `AuthController` pattern in `api/controllers/AuthController.php`:
```php
public static function methodName() {
    // 1. Parse input: $input = json_decode(file_get_contents('php://input'), true);
    // 2. Validate early
    // 3. Execute DB operations via helpers (executeQuery, executeUpdate, executeInsert)
    // 4. Echo JSON response
}
```

### Authentication Model
- Session-based (PHP `$_SESSION`)
- Passwords use bcrypt (`password_hash()`, `password_verify()`)
- Current user accessible via `/gastos/api/user` endpoint
- Login redirects on failure to `/gastos/login.html`

### API Response Format
All endpoints return JSON:
```json
{
  "success": true/false,
  "data": {...} or null,
  "error": "error message if success=false"
}
```

## Critical Developer Workflows

### Adding a New API Endpoint
1. Create controller method in `api/controllers/YourController.php`
2. Add route in `api/index.php` (match `$requestUri` and `$requestMethod`)
3. Call controller static method
4. Return JSON response with success flag

**Example:** 
```php
if ($requestUri === '/yourendpoint' && $requestMethod === 'POST') {
    YourController::yourMethod();
    exit;
}
```

### Adding Frontend Features
1. Create JS module `gastos/js/dashboard-[feature].js`
2. Load it in HTML `<script>` tag before `dashboard-init.js`
3. Use `apiRequest()`, `apiGet()`, `apiPost()` from `dashboard-api.js`
4. Update UI with bootstrap classes (see `gastos/css/dashboard-*.css`)

### Database Queries
Always use parameterized queries:
```php
$results = executeQuery('SELECT * FROM table WHERE column = ?', [$value]);
$rows = executeUpdate('UPDATE table SET col = ? WHERE id = ?', [$newValue, $id]);
$id = executeInsert('INSERT INTO table (col) VALUES (?)', [$value]);
```

### Environment Configuration
Create `.env` in project root (or use system environment variables):
```
DB_HOST=localhost
DB_DATABASE=gastos_app_db
DB_USERNAME=gastos_user
DB_PASSWORD=Gastos2025!
```

## File Organization Rules

**Frontend assets** (`gastos/assets/`):
- `api-config.js` - ALWAYS load first (sets window.API_BASE_URL)
- `auth-check.js` - Load before page-specific scripts
- `login-script.js` - Login page only

**Backend** (`api/`):
- All controllers in `api/controllers/`
- Config in `api/config/`
- Helper functions exposed globally from database.php

**Styles** (`gastos/css/`):
- `dashboard-main.css` - Core styles
- `dashboard-responsive.css` - Mobile breakpoints
- `dashboard-widgets.css` - Component-specific styling

## Known Technical Debt & Workarounds

1. **Multiple copies of frontend code**: `gastos/` is active; `public.old/` and `server.old/` are obsolete (marked in ARCHIVOS_OBSOLETOS.md)
2. **Path routing complexity**: `api/index.php` has regex normalization to handle `/gastos/api`, `/api`, and proxy variants
3. **Hardcoded fallback credentials**: Check `fix-password-hash.php` for bcrypt migration utilities
4. **PWA configuration**: Manifest at `gastos/manifest.json` references icon paths - keep in sync if moving files

## Testing & Debugging

- **Health check endpoint:** `GET /gastos/api/health` - returns database and table status
- **Error logging:** Check PHP error_log (errors prefixed with 🔥, ✅, ❌ for visibility)
- **Frontend console:** Check browser DevTools for API request logs (prefixed with 📡, ✅, ❌)
- **Direct API testing:** Use `gastos/api/test.php` or `api/test.php` for direct queries

## Code Style Notes

- **Comments:** Use emoji prefixes (✅ success, ❌ error, 🔧 config, 📡 network) for scannability
- **Variable naming:** Spanish common in this codebase (usuario, transacciones, gastos, ingresos)
- **PHP version:** Modern (PDO, prepared statements, password_hash)
- **Frontend:** Vanilla JS, no frameworks; bootstrap classes for UI
