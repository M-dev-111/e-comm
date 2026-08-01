import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import aiRoute from "./routes/ai.js";
import authRoute from "./routes/auth.js";
import superAdminRoute from "./routes/superAdmin.js";
import adminRoute from "./routes/admin.js";
import customerRoute from "./routes/customer.js";
import productsRoute from "./routes/products.js";
import vendorProductsRoute from "./routes/vendorProducts.js";
import { notFound, errorHandler } from "./middleware/validate.js";

/* The Express app with no side effects — no DB connection, no listen. Kept
   separate from server.js so tests can drive it without binding a port. */
const app = express();

// Trust the proxy so express-rate-limit sees real client IPs behind Render/Fly/Nginx.
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

/* Allowlist instead of a blanket cors() — otherwise any site on the internet
   could proxy through this server and drain the Gemini quota. Credentials are
   needed now too, for the refresh-token cookie used by the RBAC auth layer. */
app.use(cors({
    origin (origin, callback) {
        // Same-origin, curl, and server-to-server calls send no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        const err = new Error(`Origin not allowed by CORS: ${origin}`);
        err.status = 403;
        callback(err);
    },
    credentials: true
}));

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.json({ message: "Server is running!", env: env.NODE_ENV });
});

app.use("/api/ai", aiRoute);
app.use("/api/auth", authRoute);
app.use("/api/super-admin", superAdminRoute);
app.use("/api/admin", adminRoute);
app.use("/api/customer", customerRoute);
app.use("/api/products", productsRoute);
app.use("/api/vendor/products", vendorProductsRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
