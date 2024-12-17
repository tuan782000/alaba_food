import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        address: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'], // Giá trị nhỏ nhất
            max: [5, 'Rating cannot be greater than 5'] // Giá trị lớn nhất
        },
        image: {
            type: String,
            default:
                'https://thumbs.dreamstime.com/b/opening-soon-banner-opening-soon-vector-red-banner-ith-speaker-sapes-background-modern-design-123504690.jpg'
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

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
