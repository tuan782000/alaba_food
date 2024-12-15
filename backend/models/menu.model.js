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
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
