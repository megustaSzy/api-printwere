import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";


import { requestLogger } from "./middlewares/logger";

import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";

const app = express();

app.use(express.json());

app.use(requestLogger);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());


app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Welcome Server API",
    success: true,
  });
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);


export default app;