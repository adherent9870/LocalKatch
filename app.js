import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
const app = express();

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import communityRoutes from "./src/routes/community.routes.js";
import postsRoutes from "./src/routes/posts.routes.js";
import commentRoutes from "./src/routes/comment.routes.js";
import eventsRoutes from "./src/routes/events.routes.js";

// Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev")); // for handling req body

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/connection", connectionRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventsRoutes);

import errorHandler from "./src/middlewares/error.middleware.js";

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ message: "LocalLoop API is running 🚀" });
});

export default app;
