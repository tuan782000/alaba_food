import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với User
            ref: 'User'
        },
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Restaurant
            ref: 'Restaurant'
        },
        total_price: {
            type: Number
        },
        status: {
            type: String,
            enum: ['ordered', 'on the way', 'delivered'],
            default: 'ordered'
        },
        order_time: {
            type: Date,
            default: Date.now
        },
        delivery_time: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;