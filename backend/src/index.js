import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./db.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  createApp().listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("Failed to start server:", err.message);
  process.exit(1);
}
