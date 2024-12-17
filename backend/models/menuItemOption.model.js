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
        },
        images: {
            type: String,
            default:
                'https://media.istockphoto.com/id/1137255480/vector/coming-soon-sign.jpg?s=612x612&w=0&k=20&c=ylVtvAGDo4XDBhEiktRkawpm8UDRryPaW3hNDknpxBw='
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

const MenuItemOption = mongoose.model('MenuItemOption', menuItemOptionSchema);
export default MenuItemOption;
