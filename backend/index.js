import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { loggingMiddleware } from './middlewares/index.js';
const app = express();
dotenv.config();

mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log('Database is connected');
    })
    .catch(err => {
        console.log(err);
    });

const port = process.env.PORT || 7820;

// sử dụng middleware bắt các request gửi lên
app.use(loggingMiddleware);

app.use(express.json());
app.use(cookieParser());

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

// Lắng nghe kết nối
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
