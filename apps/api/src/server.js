import { app } from "./app.js";
import { env } from "./env.js";

app.listen(env.port, () => {
  console.log(`atlas-api listening on ${env.port}`);
});
