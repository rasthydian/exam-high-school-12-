import express from "express";
import dotenv from "dotenv";
import path from "path";
import userRouter from "./router/user/user.router";
import adminRouter from "./router/admin/admin.router";
import studentRouter from "./router/student/student.router";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/student", studentRouter);

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