import "./db.js"; // ensure schema is created before anything else runs

import express from "express";
import cors from "cors";
import session from "express-session";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRouter } from "./auth.js";
import { charactersRouter } from "./routes/characters.js";
import { rulesRouter } from "./routes/rules.js";
import { SqliteSessionStore } from "./sessionStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const isProd = process.env.NODE_ENV === "production";

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
      secure: isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

app.use("/api", authRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/rules", rulesRouter);

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
