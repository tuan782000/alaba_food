import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
    {
        restaurant_id: {
            type: mongoose.Schema.Types.ObjectId, // Liên kết với Restaurant
            ref: 'Restaurant'
        }
    },
    {
        timestamps: true
    }
);

const Like = mongoose.model('Like', likeSchema);
export default Like;
