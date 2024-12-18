import mongoose from 'mongoose';

const review = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với User
            ref: 'User'
        },
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Restaurant
            ref: 'Restaurant'
        },
        rating: {
            type: Number
        },
        comment: {
            type: String
        },
        image: {
            type: String
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

const Review = mongoose.model('Review', review);
export default Review;
