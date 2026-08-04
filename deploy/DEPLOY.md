# Deploying to AWS (EC2 + Caddy)

Single EC2 instance running the Node app as a systemd service, with Caddy in
front doing automatic HTTPS (Let's Encrypt). No Terraform/IaC here — it's one
box that doesn't change shape, so scripting it by hand is simpler than
maintaining IaC for it.

## 1. Launch the instance

- AMI: Ubuntu 24.04 LTS (or whatever current LTS is available)
- Size: t3.micro is plenty for a handful of friends
- Security group:
  - Port 22 (SSH) - restrict to your IP
  - Port 80 (HTTP) - open (needed for the Let's Encrypt challenge)
  - Port 443 (HTTPS) - open
- Allocate an Elastic IP and associate it with the instance, so the address
  doesn't change on reboot.
- If you want a real domain instead of the EC2 public DNS name, point an A
  record at the Elastic IP (Route 53 or wherever your domain is registered).
  The bare EC2 public DNS name (`ec2-x-x-x-x.compute-1.amazonaws.com`) also
  works fine with Caddy/Let's Encrypt if you'd rather skip that.

## 2. Install Node and Caddy

SSH in, then:

```bash
# Node (via NodeSource - adjust major version as needed)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 3. Deploy the app

```bash
sudo useradd -r -m -d /opt/sr6e-chargen chargen
sudo -u chargen git clone <your-repo-url> /opt/sr6e-chargen
# or: scp -r "SR 6e CharGen"/* user@host:/opt/sr6e-chargen/

cd /opt/sr6e-chargen
sudo -u chargen npm install
sudo -u chargen npm run build
```

Create `/opt/sr6e-chargen/.env` (referenced by the systemd unit) with a real
session secret:

```bash
echo "SESSION_SECRET=$(openssl rand -base64 48)" | sudo tee /opt/sr6e-chargen/.env
sudo chown chargen:chargen /opt/sr6e-chargen/.env
sudo chmod 600 /opt/sr6e-chargen/.env
```

## 4. systemd service

```bash
sudo cp deploy/chargen.service /etc/systemd/system/chargen.service
sudo systemctl daemon-reload
sudo systemctl enable --now chargen
sudo systemctl status chargen   # should show "active (running)"
```

Logs: `sudo journalctl -u chargen -f`

## 5. Caddy (HTTPS reverse proxy)

Edit `deploy/Caddyfile`, replacing the placeholder with your EC2 public DNS
name or real domain, then:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy will automatically request and renew a Let's Encrypt certificate the
first time it sees traffic on port 80/443 for that hostname. No manual cert
handling needed.

## 6. Verify

Visit `https://<your-domain-or-ec2-dns>/` from another machine - you should
see the login page over a valid HTTPS connection.

## Updating after code changes

```bash
cd /opt/sr6e-chargen
sudo -u chargen git pull   # or re-scp
sudo -u chargen npm install
sudo -u chargen npm run build
sudo systemctl restart chargen
```

## Data / backups

Everything (users, characters, sessions) lives in
`/opt/sr6e-chargen/server/data/chargen.sqlite`. The DB runs in WAL mode, so a
plain `cp` while the service is running can miss in-flight writes - use the
SQLite backup command instead (safe to run live):

```bash
sqlite3 /opt/sr6e-chargen/server/data/chargen.sqlite ".backup '/opt/sr6e-chargen/backups/chargen-$(date +%F).sqlite'"
```

Put that in a daily cron job for the `chargen` user if you want ongoing
backups.
