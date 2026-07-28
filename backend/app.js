import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/validate.js";

import aiRoute from "./routes/ai.js";
import authRoute from "./routes/auth.js";
import companiesRoute from "./routes/companies.js";
import usersRoute from "./routes/users.js";
import productsRoute from "./routes/products.js";
import ordersRoute from "./routes/orders.js";
import dashboardRoute from "./routes/dashboard.js";

/** The configured Express app, with no side effects (no DB, no listen). */
export function createApp () {
    const app = express();

    // Trust the proxy so express-rate-limit sees real client IPs behind a load balancer.
    app.set("trust proxy", 1);

    app.use(helmet());
    app.use(compression());
    if (env.NODE_ENV !== "test") {
        app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
    }

    /* Allowlist instead of a blanket cors() — otherwise any site on the internet
       could proxy through this server and drain the Gemini quota. */
    app.use(cors({
        origin (origin, callback) {
            if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
            const err = new Error(`Origin not allowed by CORS: ${origin}`);
            err.status = 403;
            callback(err);
        }
    }));

    app.use(express.json({ limit: "200kb" }));

    app.get("/", (_req, res) => res.json({ message: "mCOM API is running", env: env.NODE_ENV }));
    app.get("/api/health", (_req, res) => res.json({ ok: true }));

    app.use("/api/ai", aiRoute);
    app.use("/api/auth", authRoute);
    app.use("/api/companies", companiesRoute);
    app.use("/api/users", usersRoute);
    app.use("/api/products", productsRoute);
    app.use("/api/orders", ordersRoute);
    app.use("/api/dashboard", dashboardRoute);

    app.use(notFound);
    app.use(errorHandler);

    return app;
}
