import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute";

const app = express();
app.use(express.json());




app.get("/", (req, res) => {
    res.json({
        status: 200,
        message: "Welcome API"
    })
});


app.use("/api/auth", authRoute)


export default app;