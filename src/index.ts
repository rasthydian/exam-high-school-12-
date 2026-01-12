import express from "express";
import dotenv from "dotenv";
import userRouter from "./router/user.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/user", userRouter);

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Server is running",
        status: "OK"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});