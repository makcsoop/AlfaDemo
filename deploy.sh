#!/usr/bin/env bash
# One-command deploy for Альфа-старт on VPS (domain: 152vpn.ru)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

DOMAIN="${DOMAIN:-152vpn.ru}"
COMPOSE="docker compose"

red()  { printf '\033[0;31m%s\033[0m\n' "$*"; }
green(){ printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[0;33m%s\033[0m\n' "$*"; }
info() { printf '→ %s\n' "$*"; }

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    red "Нужна команда: $1"
    exit 1
  fi
}

install_docker_if_needed() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    return 0
  fi

  yellow "Docker не найден — ставлю Docker Engine + Compose plugin…"
  need_cmd curl
  need_cmd sudo

  curl -fsSL https://get.docker.com | sudo sh
  sudo systemctl enable --now docker

  if ! docker compose version >/dev/null 2>&1; then
    red "Docker установлен, но 'docker compose' недоступен. Перелогиньтесь или добавьте пользователя в группу docker."
    exit 1
  fi

  # Allow current user to use docker without sudo (best-effort)
  if [ "$(id -u)" -ne 0 ] && ! groups | grep -qw docker; then
    sudo usermod -aG docker "$USER" || true
    yellow "Пользователь добавлен в группу docker. Если команды docker требуют sudo — выйдите из SSH и зайдите снова."
  fi
}

ensure_env() {
  if [ ! -f .env ]; then
    info "Создаю .env из .env.example"
    cp .env.example .env
    yellow "Файл .env создан. При необходимости отредактируйте DEEPSEEK_API_KEY."
  fi

  # Ensure production-friendly defaults without overwriting user values
  if ! grep -q '^NODE_ENV=' .env 2>/dev/null; then
    echo 'NODE_ENV=production' >> .env
  fi
  if ! grep -q '^PORT=' .env 2>/dev/null; then
    echo 'PORT=8787' >> .env
  fi
}

check_ports() {
  for p in 80 443; do
    if command -v ss >/dev/null 2>&1; then
      if ss -tln | grep -qE ":${p}\\b"; then
        # Check if it's already our caddy
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q caddy; then
          continue
        fi
        yellow "Внимание: порт ${p} уже занят. Caddy может не стартовать — освободите порт или остановите nginx/apache."
      fi
    fi
  done
}

main() {
  info "Деплой Альфа-старт → https://${DOMAIN}"

  install_docker_if_needed
  ensure_env
  check_ports

  # Prefer sudo only if docker socket is not writable
  if ! docker info >/dev/null 2>&1; then
    if command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
      COMPOSE="sudo docker compose"
    else
      red "Нет доступа к Docker. Запустите: sudo usermod -aG docker \$USER && newgrp docker"
      exit 1
    fi
  fi

  info "Сборка и запуск контейнеров…"
  $COMPOSE up -d --build --remove-orphans

  info "Ожидание healthcheck…"
  for i in $(seq 1 30); do
    if $COMPOSE exec -T app wget -qO- http://127.0.0.1:8787/api/health >/dev/null 2>&1; then
      green "Приложение запущено."
      break
    fi
    if [ "$i" -eq 30 ]; then
      yellow "Healthcheck ещё не прошёл — смотрите логи: $COMPOSE logs -f"
    fi
    sleep 2
  done

  echo
  green "Готово."
  echo "  Сайт:    https://${DOMAIN}"
  echo "  Health:  https://${DOMAIN}/api/health"
  echo "  Логи:    $COMPOSE logs -f"
  echo "  Стоп:    $COMPOSE down"
  echo
  yellow "DNS: A-запись ${DOMAIN} (и www) должна указывать на IP этого VPS."
  yellow "Порты 80/443 должны быть открыты в firewall/security group."
}

main "$@"
