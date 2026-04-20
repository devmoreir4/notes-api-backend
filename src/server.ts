import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.info(`Server is running on port ${env.port}.`);
});
