# Banking + ERPNext deployment on AWS EC2

This guide assumes Ubuntu 22.04/24.04 and an already running ERPNext backend on `127.0.0.1:8000`.

## 1) EC2 prerequisites

- Instance type: at least `t3.medium` (recommended `t3.large` for non-trivial usage)
- Security Group inbound: `22`, `80`, `443`
- Storage: at least 20 GB gp3

## 2) Install system packages

```bash
sudo apt update
sudo apt install -y nginx git curl ca-certificates
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 3) Clone project

```bash
sudo mkdir -p /opt
cd /opt
sudo git clone <YOUR_REPO_URL> erpnext-develop
sudo chown -R $USER:$USER /opt/erpnext-develop
```

## 4) Build Banking frontend

```bash
cd /opt/erpnext-develop/banking
npm ci
npm run build
```

What this does:
- builds frontend assets into `/opt/erpnext-develop/erpnext/public/banking`
- copies app entry to `/opt/erpnext-develop/erpnext/www/banking.html`

## 5) Configure Nginx

Copy template:

```bash
sudo cp /opt/erpnext-develop/banking/deploy/nginx-banking.conf /etc/nginx/sites-available/erpnext-banking
sudo ln -sf /etc/nginx/sites-available/erpnext-banking /etc/nginx/sites-enabled/erpnext-banking
sudo nginx -t
sudo systemctl reload nginx
```

## 6) Optional HTTPS (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <YOUR_DOMAIN>
```

## 7) Zero-downtime update flow

```bash
cd /opt/erpnext-develop
git pull
cd banking
npm ci
npm run build
sudo systemctl reload nginx
```

## 8) One-command deploy helper

```bash
chmod +x /opt/erpnext-develop/banking/deploy/ec2-build-and-deploy.sh
APP_ROOT=/opt/erpnext-develop /opt/erpnext-develop/banking/deploy/ec2-build-and-deploy.sh
```

## Notes

- If ERPNext backend is exposed on another port or host, update `proxy_pass` directives in `nginx-banking.conf`.
- If you run full bench process manager (`supervisor`/`systemd`), keep backend lifecycle there and only reload Nginx after frontend build.
- The script is idempotent for repeat deployments.
