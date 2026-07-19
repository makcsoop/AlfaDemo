# Деплой на VPS — 152vpn.ru

Одна команда на сервере (из корня проекта):

```bash
./deploy.sh
```

Скрипт сам поставит Docker (если нужно), создаст `.env`, соберёт образ и поднимет сайт за Caddy с автоматическим HTTPS.

---

## План деплоя (по шагам)

### 1. Подготовка VPS

- Ubuntu 22.04 / 24.04 (или Debian 12) с root/sudo.
- Открыть порты **80** и **443** (ufw / security group облака).
- Желательно: свежий сервер без занятых 80/443 (иначе остановите nginx/apache).

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. DNS для домена 152vpn.ru

В панели регистратора домена:

| Тип | Имя | Значение        |
| --- | --- | --------------- |
| A   | `@` | IP вашего VPS   |
| A   | `www` | IP вашего VPS |

Подождите распространения DNS (обычно 5–30 минут). Проверка:

```bash
dig +short 152vpn.ru
```

IP должен совпасть с VPS — иначе Let's Encrypt (Caddy) не выдаст сертификат.

### 3. Код на сервер

Скопируйте проект на VPS (один из вариантов):

```bash
# вариант A: git
git clone <url-репозитория> /opt/alfa-start
cd /opt/alfa-start

# вариант B: scp/rsync с локальной машины
rsync -avz --exclude node_modules --exclude dist ./ user@VPS_IP:/opt/alfa-start/
ssh user@VPS_IP
cd /opt/alfa-start
```

### 4. Секреты (.env)

```bash
cp .env.example .env
nano .env   # или vim
```

Обязательно (для LIVE-анализа):

- `DEEPSEEK_API_KEY=sk-...` — без ключа сайт работает, но анализ идеи уходит в офлайн-фоллбэк.

Опционально:

- `VITE_DEMO_MODE=false` — стартовый режим (можно менять тумблером на сайте).

> `deploy.sh` сам создаст `.env` из примера, если файла ещё нет.

### 5. Запуск одной командой

```bash
chmod +x deploy.sh
./deploy.sh
```

Что произойдёт:

1. Установка Docker + Compose (если нет).
2. `docker compose up -d --build` — сборка фронта, Node API, Caddy.
3. Caddy получит TLS-сертификат для `152vpn.ru` и `www.152vpn.ru`.
4. Сайт будет доступен: **https://152vpn.ru**

### 6. Проверка

```bash
curl -s https://152vpn.ru/api/health
# {"ok":true,"service":"alfa-start-proxy",...}

docker compose ps
docker compose logs -f
```

Откройте в браузере https://152vpn.ru — должен открыться онбординг.

### 7. Обновление после правок кода

```bash
cd /opt/alfa-start
git pull          # или снова rsync
./deploy.sh       # пересборка и рестарт
```

Или короче:

```bash
docker compose up -d --build
```

### 8. Остановка

```bash
docker compose down
```

---

## Архитектура на сервере

```
Интернет → :80/:443 (Caddy, HTTPS) → app:8787 (Express)
                                      ├─ /api/*     DeepSeek-прокси
                                      └─ /*         SPA (dist/)
```

| Файл                 | Роль                                      |
| -------------------- | ----------------------------------------- |
| `deploy.sh`          | Одна команда деплоя                       |
| `docker-compose.yml` | Сервисы `app` + `caddy`                   |
| `Dockerfile`         | Сборка Vite + runtime Node                |
| `Caddyfile`          | Домен 152vpn.ru, авто-HTTPS               |
| `.env`               | Секреты (не коммитить)                    |

---

## Частые проблемы

| Симптом | Что сделать |
| ------- | ----------- |
| Caddy не выдаёт сертификат | Проверьте DNS A → IP VPS, порты 80/443 открыты |
| Порт 80 занят | `sudo systemctl stop nginx` (или apache2) |
| Permission denied на docker | `sudo usermod -aG docker $USER` → перелогин |
| LIVE без ответа ИИ | Проверьте `DEEPSEEK_API_KEY` в `.env`, затем `docker compose up -d --build` |
