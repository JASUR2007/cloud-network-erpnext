# EC2 Setup Guide

Настройка EC2 для деплоя Clothing System через GitHub Actions.

## 1. Запуск EC2

| Параметр | Значение |
|----------|----------|
| AMI | Ubuntu 22.04 LTS |
| Тип | t3.medium (2 vCPU, 4 GB) |
| Диск | 30 GB gp3 |
| Security Group | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

## 2. Установка Docker

```bash
ssh -i your-key.pem ubuntu@<EC2_IP>

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка docker compose plugin
sudo apt install -y docker-compose-v2
```

Выйти и зайти заново для применения группы docker.

## 3. Клонирование репозитория

```bash
git clone https://github.com/<YOUR_ORG>/erpnext.git ~/cloud-network-erpnext
cd ~/cloud-network-erpnext
```

## 4. DuckDNS + SSL

```bash
# Зарегистрироваться на https://duckdns.org
# Получить токен
# Вписать SUBDOMAINS и TOKEN в docker-compose.prod.yml
```

Затем:
```bash
# Получить SSL сертификат
bash deploy/scripts/setup-ssl.sh
```

## 5. Первый запуск

```bash
docker compose -f docker-compose.prod.yml up -d --build

# Проверить
docker compose -f docker-compose.prod.yml logs -f erpnext
```

## 6. GitHub Secrets

В Settings репозитория → Secrets → Actions добавить:

| Secret | Значение |
|--------|----------|
| `EC2_HOST` | Публичный IP EC2 |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_PRIVATE_KEY` | Содержимое `.pem` файла (cat key.pem) |
| `EC2_SSH_PORT` | `22` (опционально) |
| `EC2_REPO_DIR` | `/home/ubuntu/cloud-network-erpnext` |

### Как вставить PRIVATE KEY:

На Windows (PowerShell):
```powershell
Get-Content .\your-key.pem -Raw
```

На Linux/Mac:
```bash
cat ~/.ssh/your-key.pem
```

## 7. Ручной деплой

```bash
ssh -i key.pem ubuntu@<EC2_IP>
cd ~/cloud-network-erpnext
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

## 8. Мониторинг

```bash
# Статус контейнеров
docker compose -f docker-compose.prod.yml ps

# Логи
docker compose -f docker-compose.prod.yml logs -f

# Использование диска
df -h

# Использование RAM
free -h
```
