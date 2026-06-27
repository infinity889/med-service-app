#!/usr/bin/env bash
# =============================================================================
# start.sh — Запуск бэкенда Medical Service Price через Podman
# =============================================================================
set -e

PODMAN_NETWORK="medservice_net"
DB_CONTAINER="medservice_db"
BACKEND_CONTAINER="medservice_backend"
IMAGE_NAME="medservice-backend:latest"

echo "======================================================"
echo "  Medical Service Price — Podman Launch Script"
echo "======================================================"

# 1. Создать сеть если не существует
echo ""
echo "[1/5] Создаём Podman-сеть '$PODMAN_NETWORK'..."
podman network exists $PODMAN_NETWORK || podman network create $PODMAN_NETWORK
echo "      ✓ Сеть готова."

# 2. Запустить PostgreSQL если не запущен
echo ""
echo "[2/5] Проверяем PostgreSQL контейнер '$DB_CONTAINER'..."
if podman container exists $DB_CONTAINER; then
    STATUS=$(podman inspect $DB_CONTAINER --format '{{.State.Status}}')
    if [ "$STATUS" != "running" ]; then
        echo "      Контейнер остановлен — запускаем..."
        podman start $DB_CONTAINER
        # Подключаем к сети
        podman network connect $PODMAN_NETWORK $DB_CONTAINER 2>/dev/null || true
    else
        echo "      ✓ PostgreSQL уже запущен."
        podman network connect $PODMAN_NETWORK $DB_CONTAINER 2>/dev/null || true
    fi
else
    echo "      Контейнер не существует — создаём..."
    podman run -d \
        --name $DB_CONTAINER \
        --network $PODMAN_NETWORK \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=password \
        -e POSTGRES_DB=medservice \
        -p 5432:5432 \
        docker.io/library/postgres:16-alpine
fi

# 3. Ждём пока БД поднимется
echo ""
echo "[3/5] Ожидаем готовности PostgreSQL..."
until podman exec $DB_CONTAINER pg_isready -U postgres -q 2>/dev/null; do
    echo "      ... ждём БД ..."
    sleep 2
done
echo "      ✓ PostgreSQL готов."

# 4. Собрать Docker-образ бэкенда
echo ""
echo "[4/5] Собираем образ '$IMAGE_NAME'..."
podman build -t $IMAGE_NAME .
echo "      ✓ Образ собран."

# 5. Удалить старый контейнер бэкенда если есть
if podman container exists $BACKEND_CONTAINER; then
    echo ""
    echo "      Останавливаем старый контейнер бэкенда..."
    podman stop $BACKEND_CONTAINER 2>/dev/null || true
    podman rm $BACKEND_CONTAINER 2>/dev/null || true
fi

# 6. Применить миграции и запустить бэкенд
echo ""
echo "[5/5] Применяем миграции Alembic и запускаем бэкенд..."
podman run -d \
    --name $BACKEND_CONTAINER \
    --network $PODMAN_NETWORK \
    -p 8000:8000 \
    -e POSTGRES_HOST=$DB_CONTAINER \
    -e POSTGRES_PORT=5432 \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=medservice \
    -e LOG_LEVEL=INFO \
    -v "$(pwd)/uploads:/app/uploads:Z" \
    -v "$(pwd)/logs:/app/logs:Z" \
    $IMAGE_NAME

# Ждём запуска бэкенда
sleep 3

# Запускаем миграции внутри контейнера
echo "      Применяем миграции..."
podman exec $BACKEND_CONTAINER alembic -c alembic.ini upgrade head 2>&1 || echo "      (миграции могут уже быть применены)"

echo ""
echo "======================================================"
echo "  ✅ Всё запущено!"
echo ""
echo "  API:    http://localhost:8000"
echo "  Docs:   http://localhost:8000/docs"
echo "  DB:     localhost:5432 (postgres/password/medservice)"
echo "======================================================"
echo ""
echo "  Для просмотра логов:"
echo "  podman logs -f $BACKEND_CONTAINER"
echo ""
echo "  Для остановки:"
echo "  podman stop $BACKEND_CONTAINER $DB_CONTAINER"
echo "======================================================"
