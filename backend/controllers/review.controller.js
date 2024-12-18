import Restaurant from '../models/restaurant.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';
import errorHandler from '../utils/error.js';

// id của restaurant và id của user
const createReview = async (req, res, next) => {
    const { user_id, restaurant_id, rating, comment, image } = req.body;

    try {
        // Kiểm tra nếu nhà hàng và người dùng có tồn tại
        const user = await User.findById({ _id: user_id, is_deleted: false });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const restaurant = await Restaurant.findById({
            _id: restaurant_id,
            is_deleted: false
        });
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Tạo mới review
        const newReview = new Review({
            user_id,
            restaurant_id,
            rating,
            comment,
            image
        });

        const savedReview = await newReview.save();

        return res.status(201).json({
            message: 'Review created successfully',
            review: savedReview
        });
    } catch (error) {
        return next(errorHandler(400, error));
    }
};
// Lấy ra toàn bộ review của tất cả nhà hàng của tất cả user
const getReviews = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    try {
        const reviews = await Review.find({ is_deleted: false })
            .skip(skip)
            .limit(items_per_page)
            .populate('user_id', 'name email') // Liên kết với User
            .populate('restaurant_id', 'name address') // Liên kết với Restaurant
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments();

        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: reviews,
            total,
            currentPage: page,
            nextPage,
            prevPage,
            lastPage
        });
    } catch (error) {
        return next(error);
    }
};
// Id của comment Id của restaurant Id của người dùng
const getReviewById = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Lấy thông tin review
        const review = await Review.findOne({ _id: id, is_deleted: false })
            .populate('user_id', 'name email') // Liên kết với User
            .populate('restaurant_id', 'name address'); // Liên kết với Restaurant

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Kiểm tra xem người dùng hoặc nhà hàng có bị xóa mềm không
        const user = await User.findById(review.user_id);
        const restaurant = await Restaurant.findById(review.restaurant_id);

        if (!user || user.is_deleted) {
            return res
                .status(404)
                .json({ message: 'User not found or has been deleted' });
        }

        if (!restaurant || restaurant.is_deleted) {
            return res
                .status(404)
                .json({ message: 'Restaurant not found or has been deleted' });
        }

        // Nếu tất cả đều ổn, trả về review
        return res.status(200).json({
            message: 'Review retrieved successfully',
            review
        });
    } catch (error) {
        return next(error);
    }
};

const updateReviewById = async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment, image } = req.body;

    try {
        // Lấy thông tin review
        const review = await Review.findOne({ _id: id, is_deleted: false })
            .populate('user_id', 'name email') // Liên kết với User
            .populate('restaurant_id', 'name address'); // Liên kết với Restaurant

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Kiểm tra xem người dùng hoặc nhà hàng có bị xóa mềm không
        const user = await User.findById(review.user_id);
        const restaurant = await Restaurant.findById(review.restaurant_id);

        if (!user || user.is_deleted) {
            return res
                .status(404)
                .json({ message: 'User not found or has been deleted' });
        }

        if (!restaurant || restaurant.is_deleted) {
            return res
                .status(404)
                .json({ message: 'Restaurant not found or has been deleted' });
        }

        // Cập nhật review
        review.rating = rating !== undefined ? rating : review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        review.image = image !== undefined ? image : review.image;

        const updatedReview = await review.save();

        return res.status(200).json({
            message: 'Review updated successfully',
            review: updatedReview
        });
    } catch (error) {
        return next(error);
    }
};

const deleteReviewById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Kiểm tra xem người dùng hoặc nhà hàng có bị xóa mềm không
        const user = await User.findById(review.user_id);
        const restaurant = await Restaurant.findById(review.restaurant_id);

        if (!user || user.is_deleted) {
            return res
                .status(404)
                .json({ message: 'User not found or has been deleted' });
        }

        if (!restaurant || restaurant.is_deleted) {
            return res
                .status(404)
                .json({ message: 'Restaurant not found or has been deleted' });
        }

        // Xóa review (có thể sử dụng xóa mềm hoặc xóa cứng, tùy vào nhu cầu)
        await review.remove();

        return res.status(200).json({
            message: 'Review deleted successfully'
        });
    } catch (error) {
        return next(error);
    }
};

const softDeleteReviewById = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Lấy thông tin review
        const review = await Review.findOne({ _id: id, is_deleted: false });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Kiểm tra xem người dùng hoặc nhà hàng có bị xóa mềm không
        const user = await User.findById(review.user_id);
        const restaurant = await Restaurant.findById(review.restaurant_id);

        if (!user || user.is_deleted) {
            return res
                .status(404)
                .json({ message: 'User not found or has been deleted' });
        }

        if (!restaurant || restaurant.is_deleted) {
            return res
                .status(404)
                .json({ message: 'Restaurant not found or has been deleted' });
        }

        // Soft delete review
        review.is_deleted = true;
        const deletedReview = await review.save();

        return res.status(200).json({
            message: 'Review soft deleted successfully',
            review: deletedReview
        });
    } catch (error) {
        return next(error);
    }
};

export {
    createReview,
    getReviews,
    getReviewById,
    updateReviewById,
    deleteReviewById,
    softDeleteReviewById
};
