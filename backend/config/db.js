import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

/**
 * Connect mongoose to the configured database.
 *
 * MONGO_URI="memory" boots an in-process MongoDB via mongodb-memory-server —
 * a zero-setup way to run the whole SaaS locally. Data is ephemeral (gone on
 * restart), so db.js auto-seeds it. Any other value is treated as a real
 * connection string (local mongod or MongoDB Atlas).
 */
export async function connectDB () {
    mongoose.set("strictQuery", true);

    let uri = env.MONGO_URI;
    let usingMemory = false;

    if (uri === "memory") {
        // Imported lazily so production never needs this dev dependency.
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        memoryServer = await MongoMemoryServer.create();
        uri = memoryServer.getUri("mcom");
        usingMemory = true;
        console.log("⚠  Using in-memory MongoDB (data resets on restart).");
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✔  MongoDB connected (${usingMemory ? "in-memory" : mongoose.connection.host})`);

    return { usingMemory };
}

export async function disconnectDB () {
    await mongoose.disconnect();
    if (memoryServer) await memoryServer.stop();
}
