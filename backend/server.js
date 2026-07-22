import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { env } from "./config/env.js";
import aiRoute from "./routes/ai.js";
import { notFound, errorHandler } from "./middleware/validate.js";

const app = express();

// Trust the proxy so express-rate-limit sees real client IPs behind Render/Fly/Nginx.
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

/* Allowlist instead of a blanket cors() — otherwise any site on the internet
   could proxy through this server and drain the Gemini quota. */
app.use(cors({
    origin (origin, callback) {
        // Same-origin, curl, and server-to-server calls send no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        const err = new Error(`Origin not allowed by CORS: ${origin}`);
        err.status = 403;
        callback(err);
    }
}));

app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
    res.json({ message: "Server is running!", env: env.NODE_ENV });
});

app.use("/api/ai", aiRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
