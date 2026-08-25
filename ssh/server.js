#!/usr/bin/env node
// terminal.shop-style SSH menu: ssh morizkay.com
// Needs a host with port 22 reachable — Vercel can't serve SSH; run this on a VPS.
// One-time setup on that host:
//   ssh-keygen -t ed25519 -f ssh/host.key -N ""
//   PI_SSH_PORT=22 node ssh/server.js   (use systemd/pm2 to keep it alive)
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ssh2 = require("ssh2");

const INSTALL_CMD = "curl -fsSL https://morizkay.com/pi | bash";

const HOST_KEY_PATH = path.join(__dirname, "host.key");
if (!fs.existsSync(HOST_KEY_PATH)) {
	console.error(`Missing ${HOST_KEY_PATH}. Generate with:\n  ssh-keygen -t ed25519 -f ${HOST_KEY_PATH} -N ""`);
	process.exit(1);
}

const BANNER = [
	"",
	"  ┌─────────────────────────────────────────┐",
	"  │   morizkay.com · terminal edition       │",
	"  └─────────────────────────────────────────┘",
	"",
].join("\r\n");

function render(stream, body) {
	stream.write(`\x1b[2J\x1b[H${BANNER}\r\n${body}\r\n  > `);
}

const MENU = `
  What are you gonna do?

  [1] Install Pi Chrome  — marks your installed packages on pi.dev/packages
  [2] Show install command
  [q] Quit
`;

new ssh2.Server({ hostKeys: [fs.readFileSync(HOST_KEY_PATH)] }, (client) => {
	client.on("authentication", (ctx) => ctx.accept());
	client.on("ready", () => {
		client.on("session", (accept) => {
			const s = accept();
			s.once("shell", (acceptShell) => {
				const stream = acceptShell();
				render(stream, MENU);
				stream.on("data", (buf) => {
					switch (buf.toString("utf8").trim()) {
						case "1":
							render(
								stream,
								`
  Run this on your machine:\r\n\r\n
  \x1b[1;32m${INSTALL_CMD}\x1b[0m\r\n\r\n
  It installs Node's native-messaging host and tells you how to
  load the extension into Chrome.\r\n${MENU}`,
							);
							break;
						case "2":
							render(stream, `\r\n  ${INSTALL_CMD}${MENU}`);
							break;
						case "q":
						case "\u0003": // ctrl-c
						case "\u0004": // ctrl-d
							stream.end("\r\n  bye 👋\r\n");
							return;
					}
				});
			});
		});
	});
}).listen(process.env.PI_SSH_PORT || 22, () => {
	console.log(`ssh server listening on :${process.env.PI_SSH_PORT || 22}`);
});
