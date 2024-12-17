import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Restaurant
            ref: 'Restaurant'
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        image: {
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

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
