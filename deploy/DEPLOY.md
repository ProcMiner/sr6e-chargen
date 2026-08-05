# Deploying to AWS Lightsail (Caddy)

Single Lightsail instance running the Node app as a systemd service, with
Caddy in front doing automatic HTTPS (Let's Encrypt). No Terraform/IaC here
— it's one box that doesn't change shape, so scripting it by hand is simpler
than maintaining IaC for it. (Lightsail is EC2 under the hood, just with
flat pricing and a simpler console - everything from step 2 onward is
identical to a plain EC2 Ubuntu box.)

## 1. Launch the instance

- Lightsail console → Create instance → platform "Linux/Unix" → blueprint
  "OS Only" → Ubuntu 24.04 LTS (or whatever current LTS is available)
- Plan: the $7/mo tier (1 GB RAM / 2 vCPU / 40 GB SSD) is a comfortable fit
  for a handful of friends. The $5/mo tier (512 MB RAM) would probably work
  too but leaves little headroom for `npm run build`; go with $7 unless the
  cost difference matters.
- Networking tab → attach a static IP to the instance (free as long as it
  stays attached to a running instance), so the address doesn't change on
  reboot.
- Networking tab → firewall rules: confirm SSH (22), HTTP (80), and HTTPS
  (443) are open. Lightsail's default Linux firewall already includes these
  three; restrict SSH to your IP if you want to tighten it further.
- Unlike EC2, Lightsail doesn't hand you a ready-made public DNS hostname
  (no `ec2-x-x-x-x.compute-1.amazonaws.com` equivalent) - Let's Encrypt
  needs a real domain name, not a bare IP. Point an A record at the static
  IP using either Route 53 (or wherever your domain is registered) or
  Lightsail's own free "Domains & DNS" zone if you'd rather keep it in one
  console.

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

# Build tools - the "OS Only" Lightsail image has neither by default, and
# better-sqlite3 needs to compile a native addon on `npm install`
sudo apt-get install -y build-essential python3
```

## 3. Deploy the app

`/opt/sr6e-chargen` is the `chargen` user's home directory (so it already
holds `.ssh/` etc.) - the app itself lives one level down, in `app/`, to
keep the git working tree separate from the account's dotfiles. If the repo
is private, generate a deploy key on the box itself and add its public half
as a read-only Deploy Key on the GitHub repo (Settings → Deploy keys),
rather than reusing a personal key or a token pasted onto the server:

```bash
sudo useradd -r -m -d /opt/sr6e-chargen chargen
sudo -u chargen ssh-keygen -t ed25519 -f /opt/sr6e-chargen/.ssh/id_ed25519 -N "" -C "deploy-key"
sudo cat /opt/sr6e-chargen/.ssh/id_ed25519.pub   # add this as a repo Deploy Key (read-only) on GitHub
sudo -u chargen git clone git@github.com:<you>/sr6e-chargen.git /opt/sr6e-chargen/app
# or: scp -r "SR 6e CharGen"/* user@host:/opt/sr6e-chargen/app/

cd /opt/sr6e-chargen/app
sudo -u chargen npm install
sudo -u chargen npm run build
```

Create `/opt/sr6e-chargen/app/.env` (referenced by the systemd unit) with a
real session secret:

```bash
echo "SESSION_SECRET=$(openssl rand -base64 48)" | sudo tee /opt/sr6e-chargen/app/.env
sudo chown chargen:chargen /opt/sr6e-chargen/app/.env
sudo chmod 600 /opt/sr6e-chargen/app/.env
```

**If you're deploying before you have a domain/HTTPS set up** (see step 5),
also add `COOKIE_SECURE=false` to that same `.env` file. The session cookie
is marked `Secure` whenever `NODE_ENV=production` (needed so the server
serves the built client - see `server/src/index.ts`), and a browser silently
drops a `Secure` cookie sent over plain HTTP, which breaks login entirely
with no visible error. Remove this line once Caddy is actually terminating
HTTPS in front of the app.

## 4. systemd service

```bash
sudo cp deploy/chargen.service /etc/systemd/system/chargen.service
sudo systemctl daemon-reload
sudo systemctl enable --now chargen
sudo systemctl status chargen   # should show "active (running)"
```

Logs: `sudo journalctl -u chargen -f`

## 5. Caddy (HTTPS reverse proxy)

Edit `deploy/Caddyfile`, replacing the placeholder with your domain name,
then:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy will automatically request and renew a Let's Encrypt certificate the
first time it sees traffic on port 80/443 for that hostname. No manual cert
handling needed.

**No domain yet?** Skip the file above and use a bare HTTP config instead -
this still gets you a clean `:80` reverse proxy (no need to hit port 3001
directly), just without TLS:

```
:80 {
	reverse_proxy localhost:3001
}
```

Don't forget `COOKIE_SECURE=false` in `.env` (step 3) when running this way,
or login will silently fail. Switch to the real `deploy/Caddyfile` (and drop
`COOKIE_SECURE`) once you point a domain at the instance.

## 6. Verify

Visit `https://<your-domain>/` (or `http://<static-ip>/` if you're running
the no-domain config above) from another machine - you should see the login
page load, and be able to register/log in and stay logged in.

## Updating after code changes

```bash
cd /opt/sr6e-chargen/app
sudo -u chargen git pull   # or re-scp
sudo -u chargen npm install
sudo -u chargen npm run build
sudo systemctl restart chargen
```

## Data / backups

Everything (users, characters, sessions) lives in
`/opt/sr6e-chargen/app/server/data/chargen.sqlite`. The DB runs in WAL mode,
so a plain `cp` while the service is running can miss in-flight writes - use
the SQLite backup command instead (safe to run live):

```bash
sqlite3 /opt/sr6e-chargen/app/server/data/chargen.sqlite ".backup '/opt/sr6e-chargen/backups/chargen-$(date +%F).sqlite'"
```

Put that in a daily cron job for the `chargen` user if you want ongoing
backups.
