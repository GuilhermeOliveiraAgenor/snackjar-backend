import { app } from "./app";
import { env } from "./infra/config/env";

const PORT = env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${PORT} running`);
});
