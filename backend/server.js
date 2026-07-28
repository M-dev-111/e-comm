import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { seed, credentialsBanner } from "./seed.js";

async function start () {
    const { usingMemory } = await connectDB();

    // The in-memory DB is empty on every boot, so seed it automatically and
    // print the demo logins. A real database is only seeded via `npm run seed`.
    if (usingMemory) {
        const result = await seed();
        if (!result.skipped) console.log("✔  Seeded demo data.");
        console.log(credentialsBanner());
    }

    const app = createApp();
    app.listen(env.PORT, () => console.log(`✔  mCOM API running on http://localhost:${env.PORT}`));
}

start().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
