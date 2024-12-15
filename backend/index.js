import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
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

app.use(express.json());
app.use(cookieParser());

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Lắng nghe kết nối
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
