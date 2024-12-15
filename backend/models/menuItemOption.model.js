import mongoose from 'mongoose';

const menuItemOptionSchema = new mongoose.Schema(
    {
        menu_item_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với MenuItem
            ref: 'MenuItem'
        },
        title: {
            type: String
        },
        additional_price: {
            type: Number
        },
        optional_description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const MenuItemOption = mongoose.model('MenuItemOption', menuItemOptionSchema);
export default MenuItemOption;
