# morizkay.com

Personal site (Next.js on Vercel) + terminal endpoints:

- **`curl -fsSL https://morizkay.com/pi | bash`** — installs Pi Chrome
  ([github.com/morizkay/pi-chrome](https://github.com/morizkay/pi-chrome)) from npm,
  registers the native messaging host, then points you at "Load unpacked".
  Served statically from `public/pi`.

- **`ssh morizkay.com`** — terminal.shop-style interactive menu ("what are you gonna do").
  Vercel can't serve SSH — run `ssh/server.js` on a VPS with port 22 and point the
  domain's A record there (or use a subdomain like `t.morizkay.com`):

  ```bash
  ssh-keygen -t ed25519 -f ssh/host.key -N ""
  PI_SSH_PORT=22 node ssh/server.js   # keep alive with systemd/pm2
  ```
