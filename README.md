# 🏥 MedPrice.kz — Сравнение цен на медицинские услуги

Платформа для поиска и сравнения цен на анализы и медицинские услуги в клиниках Казахстана.

## 🚀 Быстрый старт

> [!NOTE]
> Проект состоит из двух частей: **backend** (Python/FastAPI) и **frontend** (React/Vite). Нужно запустить обе.

---

## 🪟 Инструкция для Windows

### Шаг 1 — Установи нужные программы

Скачай и установи следующее (если ещё не установлено):

| Программа | Зачем нужна | Ссылка |
|---|---|---|
| **Git** | Скачать код проекта | https://git-scm.com/download/win |
| **Python 3.11+** | Запуск бэкенда | https://python.org/downloads — ⚠️ При установке поставь галочку **"Add Python to PATH"** |
| **Node.js 20+** | Запуск фронтенда | https://nodejs.org |
| **pnpm** | Менеджер пакетов Node | После установки Node.js открой PowerShell и выполни: `npm install -g pnpm` |
| **PostgreSQL** | База данных | https://www.postgresql.org/download/windows — запомни пароль, который зададите при установке |

### Шаг 2 — Скачай проект

Открой **PowerShell** или **Git Bash** и выполни:

```bash
git clone https://github.com/твой-username/med-service-app.git
cd med-service-app
```

### Шаг 3 — Настрой базу данных

1. Открой **pgAdmin** (устанавливается вместе с PostgreSQL)
2. Создай новую базу данных с именем `medprice`

ИЛИ через PowerShell:
```bash
psql -U postgres -c "CREATE DATABASE medprice;"
```

### Шаг 4 — Настрой и запусти Backend

Открой **первый** терминал PowerShell:

```bash
# Перейди в папку бэкенда
cd med-service-app\backend

# Создай виртуальное окружение
python -m venv venv

# Активируй его (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Если видишь ошибку "cannot be loaded", выполни сначала:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Установи зависимости
pip install -r requirements.txt

# Создай файл с настройками
copy .env.example .env
```

Открой файл `.env` в блокноте и заполни:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=твой_пароль_от_postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medprice
GROQ_API_KEY=твой_ключ_groq   # Получить бесплатно: https://console.groq.com/keys
```

Запусти сервер:
```bash
uvicorn app.main:app --reload
```

✅ Если видишь `Application startup complete.` — бэкенд работает на http://localhost:8000

### Шаг 5 — Настрой и запусти Frontend

Открой **второй** терминал PowerShell (не закрывая первый!):

```bash
# Перейди в папку фронтенда
cd med-service-app\frontend

# Создай файл настроек
copy .env.example .env
```

Открой `.env` и убедись что там есть:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

Установи пакеты и запусти:
```bash
pnpm install
pnpm run dev
```

✅ Открой браузер и перейди на http://localhost:5173

---

## 🐧 Инструкция для Linux (Ubuntu / Fedora / Arch)

### Шаг 1 — Установи зависимости

**Ubuntu / Debian:**
```bash
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv postgresql postgresql-contrib nodejs npm
sudo npm install -g pnpm
```

**Fedora:**
```bash
sudo dnf install -y git python3 python3-pip postgresql postgresql-server nodejs npm
sudo npm install -g pnpm
```

**Arch Linux:**
```bash
sudo pacman -S git python python-pip postgresql nodejs npm pnpm
```

### Шаг 2 — Скачай проект

```bash
git clone https://github.com/твой-username/med-service-app.git
cd med-service-app
```

### Шаг 3 — Настрой PostgreSQL

```bash
# Запусти PostgreSQL
sudo systemctl enable --now postgresql

# Создай пользователя и базу данных
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb medprice
```

### Шаг 4 — Настрой и запусти Backend

Открой **первый** терминал:

```bash
cd med-service-app/backend

# Создай и активируй виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установи зависимости
pip install -r requirements.txt

# Создай файл настроек
cp .env.example .env
nano .env   # или любой другой редактор
```

Заполни `.env`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=medprice
GROQ_API_KEY=твой_ключ_groq   # Получить бесплатно: https://console.groq.com/keys
```

Запусти сервер:
```bash
uvicorn app.main:app --reload
```

✅ Бэкенд работает на http://localhost:8000
Документация API: http://localhost:8000/docs

### Шаг 5 — Настрой и запусти Frontend

Открой **второй** терминал (не закрывая первый!):

```bash
cd med-service-app/frontend

# Создай файл настроек
cp .env.example .env
```

Убедись что в `.env` есть:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=false
```

```bash
pnpm install
pnpm run dev
```

✅ Открой браузер: http://localhost:5173

---

## 📁 Структура проекта

```
med-service-app/
├── backend/          # FastAPI сервер
│   ├── app/
│   │   ├── api/      # Эндпоинты (роутеры)
│   │   ├── models/   # Модели базы данных
│   │   ├── parsers/  # Парсеры сайтов клиник
│   │   └── schemas/  # Pydantic схемы
│   ├── .env.example  # Пример настроек
│   └── requirements.txt
└── frontend/         # React + Vite приложение
    ├── src/
    │   ├── pages/    # Страницы
    │   ├── services/ # API-запросы
    │   └── components/
    └── .env.example
```

## 🔑 Получить GROQ API ключ (бесплатно)

1. Зайди на https://console.groq.com/keys
2. Зарегистрируйся (можно через Google)
3. Нажми **"Create API Key"**
4. Скопируй ключ и вставь в `.env` файл бэкенда

## 🐛 Частые проблемы

**Ошибка `port 5432 is already in use`** → PostgreSQL уже запущен, это нормально.

**Ошибка `ModuleNotFoundError`** → Убедись, что виртуальное окружение активировано: должен быть `(venv)` в начале строки терминала.

**Страница не загружается** → Убедись, что оба сервера (бэкенд и фронтенд) запущены одновременно в **разных** терминалах.

**Ошибка CORS** → Проверь, что в `.env` фронтенда `VITE_API_URL=http://localhost:8000/api`, а не с другим портом.