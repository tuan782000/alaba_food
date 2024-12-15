import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
    {
        menu_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Menu
            ref: 'Menu'
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        base_price: {
            type: Number
        },
        images: {
            type: [String]
        }
    },
    {
        timestamps: true
    }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
