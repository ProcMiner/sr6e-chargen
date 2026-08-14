import "./db.js"; // ensure schema is created before anything else runs

import express from "express";
import cors from "cors";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRouter } from "./auth.js";
import { charactersRouter } from "./routes/characters.js";
import { rulesRouter } from "./routes/rules.js";
import { playRouter } from "./routes/play.js";
import { npcsRouter } from "./routes/npcs.js";
import { SqliteSessionStore } from "./sessionStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production";
// Separate from isProd: a browser drops a Secure cookie over plain HTTP, so
// this must stay false until Caddy is actually terminating HTTPS in front of
// the app - independent of whether we're serving the built static client.
const secureCookies = process.env.COOKIE_SECURE !== "false" && isProd;

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: isProd ? true : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    store: new SqliteSessionStore(),
    secret: process.env.SESSION_SECRET ?? "dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

app.use("/api", authRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/rules", rulesRouter);
app.use("/api/play", playRouter);
app.use("/api/npcs", npcsRouter);

if (isProd) {
  const clientDist = path.join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`SR6e chargen server listening on :${PORT}`);
});
