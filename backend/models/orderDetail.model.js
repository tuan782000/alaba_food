import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema(
    {
        order_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Order
            ref: 'Order'
        },
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Restaurant
            ref: 'Restaurant'
        },
        menu_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Menu
            ref: 'Menu'
        },
        menu_item_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với MenuItem
            ref: 'MenuItem'
        },
        menu_item_option_ids: [
            {
                type: mongoose.Schema.Types.ObjectId, // Liên kết với MenuItemOption
                ref: 'MenuItemOption'
            }
        ],
        quantity: {
            type: Number,
            required: true,
            min: 1 // Số lượng ít nhất là 1
        },
        price: {
            type: Number,
            required: true // Giá đã tính toán (base price + options price) * quantity
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const OrderDetail = mongoose.model('OrderDetail', orderDetailSchema);
export default OrderDetail;
