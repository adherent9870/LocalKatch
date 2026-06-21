import "./config/env.js";
import cloudinary from "./config/cloudinary.js";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// DB connection
connectDB();

app.listen(PORT, () => {
  console.log(`👍👍Server running on port ${PORT}`);
});
