import { env } from "./config/env.js";
import { DatabaseClient } from "./lib/db.js";
import { createApp } from "./app.js";

const db = new DatabaseClient(env.dbPath);
const app = createApp(db);

app.listen(env.port, () => {
  console.log(`ClawShield API listening at http://localhost:${env.port}`);
});
