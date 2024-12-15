import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
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
        menu_item_option_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với MenuItemOption
            ref: 'MenuItemOption'
        }
    },
    {
        timestamps: true
    }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
