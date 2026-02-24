require("dotenv").config();
const app = require("./src/app");
const connectMongo = require("./src/config/mongo");

const PORT = process.env.PORT || 5000;

connectMongo();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});