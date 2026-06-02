# AWS Deployment Guide

Деплой Clothing System + CRM на AWS (ECS Fargate + RDS + ElastiCache + S3 + CloudFront).

## Архитектура

```
                    ┌─────────────┐
                    │  CloudFront  │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │  S3 (CRM)│   │   ALB    │   │   S3     │
     │  Static  │   │  HTTPS   │   │  (Media) │
     └──────────┘   └────┬─────┘   └──────────┘
                          │
                    ┌─────▼─────┐
                    │ ECS Fargate│
                    │ (Clothing)  │
                    └──┬────┬────┘
                       │    │
              ┌────────▼┐ ┌─▼─────────┐
              │   RDS   │ │ElastiCache │
              │ (MariaDB)│ │  (Redis)   │
              └─────────┘ └───────────┘
```

## 1. AWS CLI Setup

```bash
# Установка AWS CLI
aws configure
# Введите:
#   AWS Access Key ID
#   AWS Secret Access Key
#   Region: us-east-1

# Проверка
aws sts get-caller-identity
```

## 2. Infrastructure (вручную или Terraform)

### 2.1 ECR (Elastic Container Registry)

```bash
aws ecr create-repository --repository-name erpnext-crm/erpnext --region us-east-1

# Логин в ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $(aws sts get-caller-identity --query 'account' --output text).dkr.ecr.us-east-1.amazonaws.com
```

### 2.2 RDS (MariaDB)

```bash
aws rds create-db-instance \
  --db-instance-identifier erpnext-db \
  --db-instance-class db.t3.medium \
  --engine mariadb \
  --engine-version 10.6 \
  --master-username root \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --vpc-security-group-ids <SG_ID> \
  --db-subnet-group-name <SUBNET_GROUP> \
  --backup-retention-period 7 \
  --no-publicly-accessible
```

### 2.3 ElastiCache (Redis)

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id erpnext-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids <SG_ID> \
  --cache-subnet-group-name <SUBNET_GROUP>
```

### 2.4 S3 Buckets

```bash
# CRM статика
aws s3 mb s3://erpnext-crm-static --region us-east-1
aws s3 website s3://erpnext-crm-static --index-document index.html

# Медиа-файлы (опционально)
aws s3 mb s3://erpnext-media --region us-east-1
```

### 2.5 ECS Cluster + Service

```bash
# Создать кластер
aws ecs create-cluster --cluster-name erpnext-crm-cluster

# Создать CloudWatch Log Group
aws logs create-log-group --log-group-name /ecs/erpnext-crm

# Создать Task Definition
aws ecs register-task-definition \
  --cli-input-json file://deploy/task-definition.json

# Создать ALB
# (настройка Load Balancer, Target Group, Listener rules)
# ALB должен форвардить порт 80/443 -> 8000 на контейнер

# Создать сервис
aws ecs create-service \
  --cluster erpnext-crm-cluster \
  --service-name erpnext-crm-service \
  --task-definition erpnext-crm \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration \
    "awsvpcConfiguration={
      subnets=[<SUBNET_ID_1>,<SUBNET_ID_2>],
      securityGroups=[<SG_ID>],
      assignPublicIp=ENABLED
    }" \
  --load-balancers \
    "targetGroupArn=<TG_ARN>,
     containerName=erpnext,
     containerPort=8000"
```

### 2.6 CloudFront

```bash
# Создать дистрибуцию
aws cloudfront create-distribution \
  --origin-domain-name erpnext-crm-static.s3.amazonaws.com \
  --default-root-object index.html
```

## 3. Environment Variables

Создай `.env.production`:

```env
DB_HOST=<RDS_ENDPOINT>
DB_PORT=3306
DB_PASSWORD=<DB_PASSWORD>
REDIS_CACHE=<REDIS_ENDPOINT>
REDIS_QUEUE=<REDIS_ENDPOINT>
REDIS_SOCKETIO=<REDIS_ENDPOINT>
SITE_NAME=erpnext.local
ADMIN_PASSWORD=<STRONG_ADMIN_PASSWORD>
```

## 4. Ручной деплой (без GitHub Actions)

```bash
# 1. Собрать Docker образ
docker build -t erpnext-crm .

# 2. Залогиниться в ECR
ACCOUNT_ID=$(aws sts get-caller-identity --query 'account' --output text)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 3. Тагнуть и запушить
docker tag erpnext-crm:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/erpnext-crm/erpnext:latest
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/erpnext-crm/erpnext:latest

# 4. Обновить ECS сервис
aws ecs update-service \
  --cluster erpnext-crm-cluster \
  --service erpnext-crm-service \
  --force-new-deployment

# 5. Собрать и задеплоить CRM фронтенд в S3
cd crm
npm ci
npm run build
cd ..
aws s3 sync erpnext/public/crm/ s3://erpnext-crm-static/crm/ --delete

# 6. Инвалидировать CloudFront
DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='erpnext-crm-static.s3.amazonaws.com']].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

## 5. GitHub Actions CI/CD (автоматический)

Workflow уже есть в `.github/workflows/deploy-aws.yml`. Срабатывает при push в `main`/`master`.

### Нужные Secrets (добавить в GitHub Settings → Secrets → Actions):

| Secret | Описание |
|--------|----------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key |
| `S3_BUCKET` | Имя бакета S3 для CRM статики |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID CloudFront дистрибуции |

### Настройка Task Definition

Перед первым деплоем через Actions:

1. Отредактируй `deploy/task-definition.json` — подставь свои значения
2. Зарегистрируй в AWS:
   ```bash
   aws ecs register-task-definition --cli-input-json file://deploy/task-definition.json
   ```

## 6. Проверка после деплоя

```bash
# Проверить статус сервиса
aws ecs describe-services \
  --cluster erpnext-crm-cluster \
  --services erpnext-crm-service \
  --query "services[0].{status:status,running:runningCount,desired:desiredCount}"

# Посмотреть логи
aws logs tail /ecs/erpnext-crm --follow

# Проверить здоровье
curl -I http://<ALB_DNS>/api/method/ping
```

## 7. Полезные команды

```bash
# Логи контейнера
aws ecs execute-command \
  --cluster erpnext-crm-cluster \
  --task <TASK_ID> \
  --container erpnext \
  --command "/bin/bash" \
  --interactive

# Перезапустить сервис
aws ecs update-service \
  --cluster erpnext-crm-cluster \
  --service erpnext-crm-service \
  --force-new-deployment

# Обновить задачу (после изменений в task-definition.json)
aws ecs register-task-definition --cli-input-json file://deploy/task-definition.json
aws ecs update-service --cluster erpnext-crm-cluster --service erpnext-crm-service --task-definition erpnext-crm
```

## 8. EC2 (простой вариант)

Подходит если не хочешь заморачиваться с ECS/RDS/ALB. Всё на одной машине.

### 8.1 Запуск

```bash
# Настроить DuckDNS (бесплатный DDNS):
# 1. Зайди на https://duckdns.org
# 2. Залогинись через GitHub/Google
# 3. Создай домен clothing-jasur.duckdns.org
# 4. Получи токен

# Вписать токен DuckDNS в docker-compose.prod.yml:
#   sed -i 's/<YOUR_DUCKDNS_TOKEN>/твой_токен/' docker-compose.prod.yml

# Получить SSL сертификат (однократно, перед первым запуском):
bash deploy/scripts/setup-ssl.sh

# Запустить всё
docker compose -f docker-compose.prod.yml up -d
```

### 8.2 Состав (`docker-compose.prod.yml`)

| Сервис | Роль |
|--------|------|
| `nginx` | Reverse proxy + HTTPS (Let's Encrypt) |
| `certbot` | Автообновление SSL каждые 12 ч |
| `duckdns` | Динамический DNS (отслеживает IP сервера) |
| `db` | MariaDB 10.6 |
| `redis` | Redis 7 |
| `erpnext` | Clothing System backend |
| `backup` | Ежедневный дамп БД в 3:00 ночи |

### 8.3 После деплоя

```
https://clothing-jasur.duckdns.org   → Login: Administrator / admin
http://localhost:8088                 → Adminer (панель БД)
```

### 8.4 Обслуживание

```bash
# Логи
docker compose -f docker-compose.prod.yml logs -f erpnext
docker compose -f docker-compose.prod.yml logs -f nginx

# Бекап вручную
docker compose -f docker-compose.prod.yml exec backup bash /backup-db.sh

# Восстановить БД
docker compose -f docker-compose.prod.yml exec -T db mysql -uroot -perpnext < backup.sql

# Перезапустить всё после перезагрузки (не нужно если restart: unless-stopped)
docker compose -f docker-compose.prod.yml start

# Остановить
docker compose -f docker-compose.prod.yml down
```

### 8.5 Требования к EC2

| Параметр | Значение |
|----------|----------|
| Тип | t3.medium (2 vCPU, 4 GB RAM) |
| Диск | 30 GB gp3 |
| OS | Ubuntu 22.04 / Amazon Linux |
| Security Group | 80, 443 (внешний), 22 (SSH) |
| Docker | docker + docker compose |

### 8.6 Установка Docker на EC2

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER  # выйти и зайти заново
```

## 9. Оценка стоимости (us-east-1)

| Сервис | Ресурс | ~$/мес |
|--------|--------|--------|
| ECS Fargate | 2 vCPU, 4 GB | ~$50 |
| RDS MariaDB | db.t3.medium, 20 GB | ~$50 |
| ElastiCache | cache.t3.micro | ~$12 |
| ALB | 1 load balancer | ~$20 |
| S3 | ~5 GB + запросы | ~$2 |
| CloudFront | ~10 GB трафик | ~$1 |

**Итого: ~$135/мес**
