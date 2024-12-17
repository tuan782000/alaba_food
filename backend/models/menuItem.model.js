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
            type: [String],
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

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
