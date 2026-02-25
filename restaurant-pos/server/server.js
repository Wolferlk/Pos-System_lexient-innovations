require("dotenv").config();
const app = require("./src/app");
const connectMongo = require("./src/config/mongo");
const { ensureDefaultAdmin } = require("./src/config/bootstrapAdmin");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectMongo();
  try {
    await ensureDefaultAdmin();
  } catch (error) {
    console.warn("Default admin bootstrap skipped:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
