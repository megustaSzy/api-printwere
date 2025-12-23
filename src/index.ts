import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";


import { requestLogger } from "./middlewares/logger";

import userRoute from "./routes/userRoute";
import authRoute from "./routes/authRoute";
import productRoute from "./routes/productRoute";
import orderRoute from "./routes/orderRoute";
import orderItemRoute from "./routes/orderItemRoute"

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
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/order-items", orderItemRoute);  


export default app;