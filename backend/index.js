import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import loggingMiddleware from './middlewares/logInfo.middleware.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import restaurantRouter from './routes/restaurant.route.js';
import menuRouter from './routes/menu.route.js';
import menuItemRouter from './routes/menuItem.route.js';
import menuItemOptionRouter from './routes/menuItemOption.route.js';
import orderRouter from './routes/order.route.js';
import orderDetailRouter from './routes/orderDetail.route.js';
import reviewRouter from './routes/review.route.js';
import likeRestaurantRouter from './routes/likeRestaurant.route.js';
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

const port = process.env.PORT || 9000;

// sử dụng middleware bắt các request gửi lên
app.use(loggingMiddleware);

app.use(express.json());
app.use(cookieParser());

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/menu-item', menuItemRouter);
app.use('/api/menu-item-option', menuItemOptionRouter);
app.use('/api/order', orderRouter);
app.use('/api/order-detail', orderDetailRouter);
app.use('/api/review', reviewRouter);
app.use('/api/like-restaurant', likeRestaurantRouter);

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
