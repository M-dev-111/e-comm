import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb, disconnectDb } from "./config/db.js";

const server = await connectDb().then(() =>
    app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`))
);

/* Stop accepting connections and drain in-flight requests before exiting, so a
   deploy/restart doesn't sever a request mid-write. */
for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
        console.log(`${signal} received — shutting down.`);
        server.close(async () => {
            await disconnectDb();
            process.exit(0);
        });
        // Don't hang forever on a stuck keep-alive socket.
        setTimeout(() => process.exit(1), 10_000).unref();
    });
}
