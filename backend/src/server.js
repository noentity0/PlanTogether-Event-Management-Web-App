const app = require("./app");
const { connectDatabase } = require("./config/database");
const { port } = require("./config/env");
const Event = require("./models/Event");
const User = require("./models/User");

async function startServer() {
  await connectDatabase();
  await Promise.all([User.init(), Event.init()]);

  app.listen(port, () => {
    console.log(`PlanTogether backend listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
