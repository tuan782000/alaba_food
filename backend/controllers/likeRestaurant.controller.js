import errorHandler from '../utils/error.js';
import Restaurant from '../models/restaurant.model.js';
import User from '../models/user.model.js';
import Like from '../models/like.model.js';

const likeRestaurant = async (req, res, next) => {
    const { restaurant_id, user_id } = req.body; // restaurant_id từ body request

    // console.log(restaurant_id, user_id);

    try {
        // Kiểm tra xem user và restaurant có tồn tại không
        const user = await User.findById(user_id);
        if (!user || user.is_deleted === true) {
            return res.status(404).json({ message: 'User not found' });
        }

        const restaurant = await Restaurant.findById(restaurant_id);
        if (!restaurant || restaurant.is_deleted === true) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        // Kiểm tra xem user đã yêu thích nhà hàng này chưa
        const existingLike = await Like.findOne({ user_id, restaurant_id });

        if (existingLike) {
            // Nếu đã yêu thích, tiến hành bỏ yêu thích (soft delete)
            await existingLike.deleteOne();
            return res
                .status(200)
                .json({ message: 'Restaurant unliked successfully' });
        } else {
            // Nếu chưa yêu thích, tạo bản ghi mới trong bảng Like
            const newLike = new Like({ user_id, restaurant_id });
            await newLike.save();
            // const populatedLike = await newLike.populate('user_id', 'name email').populate('restaurant_id', 'name address');
            return res
                .status(201)
                .json({ message: 'Restaurant liked successfully' });
        }
    } catch (error) {
        return next(errorHandler(400, error));
    }
};

// danh sách các nhà hàng mà người dùng đó đã like
const getLikedRestaurants = async (req, res, next) => {
    const { id } = req.params; // Lấy id từ params
    // console.log(id);
    try {
        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(id);
        if (!user || user.is_deleted === true) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Lấy danh sách các like của user
        const likedRestaurants = await Like.find({ user_id: id })
            .populate('restaurant_id', 'name address description') // Lấy thông tin nhà hàng
            .exec();

        if (!likedRestaurants || likedRestaurants.length === 0) {
            return res
                .status(404)
                .json({ message: 'No liked restaurants found' });
        }

        // Trả về kết quả
        return res.status(200).json({
            message: 'Liked restaurants retrieved successfully',
            data: likedRestaurants.map(like => like.restaurant_id) // Trả về danh sách nhà hàng đã like
        });
    } catch (error) {
        return next(error);
    }
};

const getLikedRestaurantsPaginated = async (req, res, next) => {
    const { id } = req.params; // Lấy user_id từ params
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;

    // Tính toán skip và take cho phân trang
    const skip = (page - 1) * items_per_page;

    try {
        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(id);
        if (!user || user.is_deleted === true) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Lấy danh sách các like của user với phân trang
        const likedRestaurants = await Like.find({ user_id: id })
            .skip(skip) // Bỏ qua các bản ghi trước đó
            .limit(items_per_page) // Giới hạn số lượng bản ghi
            .populate('restaurant_id', 'name address description') // Lấy thông tin nhà hàng
            .exec();

        if (!likedRestaurants || likedRestaurants.length === 0) {
            return res
                .status(404)
                .json({ message: 'No liked restaurants found' });
        }

        // Tính tổng số lượng nhà hàng đã like
        const total = await Like.countDocuments({ user_id: id });

        // Tính toán các trang
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        // Trả về kết quả
        return res.status(200).json({
            message: 'Liked restaurants retrieved successfully',
            data: likedRestaurants.map(like => like.restaurant_id), // Trả về danh sách nhà hàng đã like
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

export { likeRestaurant, getLikedRestaurants, getLikedRestaurantsPaginated };
