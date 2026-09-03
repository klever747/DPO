#!/usr/bin/env bash
# ==========================================================================
# Aprovisiona un VPS Ubuntu recién creado (Hostinger u otro) con todo lo
# necesario para correr la Plataforma DPO vía Docker Compose.
#
# Uso (como root, en el VPS):
#   curl -fsSL https://raw.githubusercontent.com/klever747/DPO/claude/data-protection-web-app-us5y7c/scripts/vps-setup.sh | bash
# o copiando el repo primero y ejecutando:
#   bash scripts/vps-setup.sh
# ==========================================================================
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script debe ejecutarse como root (o con sudo)." >&2
  exit 1
fi

echo "== Actualizando el sistema =="
apt-get update -y
apt-get upgrade -y

echo "== Instalando dependencias base =="
apt-get install -y ca-certificates curl gnupg git ufw

echo "== Instalando Docker Engine + plugin de Compose =="
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
# shellcheck source=/dev/null
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "== Habilitando Docker al arrancar =="
systemctl enable --now docker

echo "== Configurando el firewall (ufw) =="
ufw allow OpenSSH
ufw allow 3000/tcp        # API Gateway
ufw allow 5173/tcp        # Shell (frontend)
ufw allow 5175:5186/tcp   # Módulos frontend independientes
ufw --force enable

echo ""
echo "== Listo =="
docker --version
docker compose version
echo ""
echo "IMPORTANTE: si Hostinger tiene además un firewall a nivel de panel"
echo "(hPanel -> VPS -> Firewall), recuerda abrir ahí los mismos puertos:"
echo "  22 (SSH), 3000, 5173, 5175-5186"
