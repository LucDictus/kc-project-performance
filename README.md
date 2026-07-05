# KC Project Registration

A time and project registration web app for KC Performance. Mechanics (monteurs) clock in/out and log work sessions against specific vehicles or projects. Admins (CEO) monitor activity in real time and pull reporting per employee and per project.

Built mobile-first — most usage happens on a phone in the workshop.

## Tech Stack

**Frontend**
- React + Vite + TypeScript
- TanStack Query (data fetching / caching)
- React Router
- Tailwind CSS

**Backend**
- PHP REST API (no framework — plain PHP, PDO)
- MySQL

The stack is intentionally simple and shared-hosting compatible: no build step or process manager needed on the server, and the database is viewable/manageable directly through phpMyAdmin.

## Prerequisites

Make sure you have these installed locally:

- [Node.js](https://nodejs.org/) (LTS) + npm
- PHP (8.x recommended) with the CLI available on your PATH
- MySQL Server (locally, or a client like MySQL Workbench pointed at a local instance)
- The `pdo_mysql` and `mysqli` PHP extensions enabled (see [PHP setup gotchas](#php-setup-gotchas) below if `php -S` throws PDO errors)

### Getting PHP + MySQL running per OS

You just need a working `php` CLI and a running MySQL server — how you get there depends on your OS:

**Windows — XAMPP**
1. Install [XAMPP](https://www.apachefriends.org/) (includes PHP + MySQL + phpMyAdmin in one package).
2. Add the PHP folder inside your XAMPP install (e.g. `C:\xampp\php`) to your system PATH so `php` works in any terminal.
3. Start **MySQL** from the XAMPP Control Panel (you don't need to start Apache — we run PHP via `php -S` instead, see below).
4. Use phpMyAdmin (`http://localhost/phpmyadmin`, bundled with XAMPP) to create the database and import the schema.

**macOS — MAMP (or Homebrew)**
- Option A: Install [MAMP](https://www.mamp.info/), start MySQL from the MAMP app, and add MAMP's PHP bin folder to your PATH.
- Option B (no GUI app): use Homebrew instead:
  ```bash
  brew install php mysql
  brew services start mysql
  ```

**Linux — native packages**
```bash
sudo apt update
sudo apt install php php-mysql php-cli mysql-server
sudo systemctl start mysql
```
(Package names may vary slightly by distro — use your package manager's equivalent.)

Once `php -v` and a MySQL connection both work, the rest of the setup below is the same on every OS.

## Project Structure

```
kc-project-registration/
├── src/                  # React frontend source
├── api/                  # PHP REST API (runs standalone)
│   ├── ...
│   └── db.php            # DB connection config
├── .env.local            # Frontend env vars (not committed)
└── README.md
```

## Getting Started

### 1. Clone & install frontend dependencies

```bash
git clone <repo-url>
cd kc-project-registration
npm install
```

### 2. Set up the database

1. Create a local MySQL database (e.g. `kc_project_registration`).
2. Import the schema (ask a teammate for the latest `.sql` dump, or check for a `schema.sql` / `migrations` folder in `api/`).
3. Update the DB credentials in `api/db.php` (or the config file it reads from) to match your local MySQL setup.

Tables you should see after import: `employees`, `shifts`, `projects`, `project_sessions`.

### 3. Configure the frontend environment

Create a `.env.local` file in the project root:

```
VITE_API_URL=http://localhost:8000
```

### 4. Start the backend

```bash
cd api
php -S localhost:8000
```

Leave this running in its own terminal tab.

### 5. Start the frontend

In a second terminal, from the project root:

```bash
npm run dev
```

The app should now be running (Vite will print the local URL, typically `http://localhost:5173`), talking to the PHP API on `http://localhost:8000`.

## PHP Setup Gotchas

If `php -S localhost:8000` errors out with something like "could not find driver" or a missing PDO extension:

1. Locate your `php.ini` (run `php --ini` to find the loaded config file path).
2. Make sure these lines are uncommented:
   ```ini
   extension=pdo_mysql
   extension=mysqli
   ```
3. Make sure `extension_dir` points to your PHP's `ext` folder:
   ```ini
   extension_dir = "ext"
   ```
4. Restart the `php -S` server after editing `php.ini`.