import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getCatalog } from "./catalog.js";
const app = express();
app.use(helmet());
app.use(express.json({ limit: "8kb" }));
app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && origin === process.env.STOREFRONT_ORIGIN) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
const Subscriber = mongoose.model(
  "Subscriber",
  new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    subscribedAt: { type: Date, default: Date.now },
    consent: { type: Boolean, required: true },
  }),
);
let dbReady = false;
if (process.env.MONGODB_URI) {
  await mongoose.connect(process.env.MONGODB_URI);
  dbReady = true;
}
app.get("/api/health", (_, res) =>
  res.json({ ok: true, newsletterReady: dbReady }),
);
let cache = { products: null, time: 0 };
app.get("/api/products", async (_, res) => {
  try {
    if (!cache.products || Date.now() - cache.time > 300000)
      cache = { products: await getCatalog(), time: Date.now() };
    res.set("Cache-Control", "public, max-age=60").json(cache.products);
  } catch {
    res
      .status(503)
      .json({ error: "The live catalog is temporarily unavailable." });
  }
});
app.post(
  "/api/newsletter",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  async (req, res) => {
    if (!dbReady)
      return res
        .status(503)
        .json({
          error:
            "Subscriptions are not available yet. Please follow us on Instagram for new drops.",
        });
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      req.body.consent !== true
    )
      return res
        .status(400)
        .json({ error: "Enter a valid email and accept email updates." });
    try {
      await Subscriber.updateOne(
        { email },
        { $setOnInsert: { email, consent: true, subscribedAt: new Date() } },
        { upsert: true },
      );
      res.json({
        message: "You’re on the list. Keep an eye on your inbox for new drops.",
      });
    } catch {
      res
        .status(500)
        .json({
          error: "We couldn’t save your subscription. Please try again.",
        });
    }
  },
);
app.use("/api", (_, res) =>
  res.status(404).json({ error: "API route not found." }),
);
const dist = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
app.use(express.static(dist));
app.get("*", (_, res) => res.sendFile(path.join(dist, "index.html")));
app.listen(
  Number(process.env.PORT) || 4000,
  process.env.HOST || "127.0.0.1",
  () => console.log("SnazzyFits API http://127.0.0.1:4000"),
);
