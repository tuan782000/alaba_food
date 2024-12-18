import Restaurant from '../models/restaurant.model.js';
import errorHandler from '../utils/error.js';

const createRestaurant = async (req, res, next) => {
    const { name, address, phone, email, image } = req.body;

    if (name.length <= 2 || name.length >= 50) {
        return next(
            errorHandler(400, 'Name must be between 2 and 50 characters!!!')
        );
    }

    if (address.length <= 5 || address.length >= 100) {
        return next(
            errorHandler(400, 'Address must be between 5 and 100 characters!!!')
        );
    }

    if (phone.length <= 9 || phone.length >= 12) {
        return next(
            errorHandler(400, 'Address must be between 10 and 11 characters!!!')
        );
    }

    // bắt validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(errorHandler(400, 'Invalid email format!!!'));
    }

    try {
        const newRestaurant = new Restaurant({
            name,
            address,
            phone,
            email,
            image
        });
        const savedRestaurant = await newRestaurant.save();
        res.status(201).json(savedRestaurant);
    } catch (error) {
        next(error);
    }
};

const getRestaurant = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;

    // Tính toán skip và take cho phân trang
    const skip = (page - 1) * items_per_page;

    const keyword = req.query.search || '';

    try {
        const restaurants = await Restaurant.find({
            is_deleted: false,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { address: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        })
            .skip(skip)
            .limit(items_per_page)
            .sort({ created_at: -1 }) // Sắp xếp giảm dần theo ngày tạo
            .select('id name address email rating phone is_active image');

        const total = await Restaurant.countDocuments({
            is_deleted: false,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { address: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        });

        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: restaurants,
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

const getDetailRestaurant = async (req, res, next) => {
    const { id } = req.params;

    try {
        const restaurant = await Restaurant.findOne({
            _id: id,
            is_deleted: false
        });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res.status(200).json(restaurant);
    } catch (error) {
        return next(error);
    }
};

// Cập nhật thông tin nhà hàng với validate
const updateRestaurant = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dữ liệu trước khi cập nhật
    if (
        updateData.name &&
        (updateData.name.length < 2 || updateData.name.length > 100)
    ) {
        return next(
            errorHandler(400, 'Name must be between 2 and 100 characters!')
        );
    }

    if (updateData.phone && !/^\d{10,11}$/.test(updateData.phone)) {
        return next(errorHandler(400, 'Phone number must be 10 to 11 digits!'));
    }

    if (updateData.rating && (updateData.rating < 0 || updateData.rating > 5)) {
        return next(errorHandler(400, 'Rating must be between 0 and 5!'));
    }

    if (updateData.address <= 4 || updateData.address >= 100) {
        return next(
            errorHandler(400, 'Address must be between 4 and 100 characters!')
        );
    }

    try {
        const restaurant = await Restaurant.findById(id);

        if (!restaurant || restaurant.is_deleted) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: 'Restaurant updated successfully',
            restaurant: updatedRestaurant
        });
    } catch (error) {
        return next(error);
    }
};

const deleteRestaurant = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);

        if (!deletedRestaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res
            .status(200)
            .json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

// Xóa mềm nhà hàng
const softDeleteRestaurant = async (req, res, next) => {
    const { id } = req.params;

    try {
        const restaurant = await Restaurant.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res.status(200).json({
            message: 'Restaurant soft deleted successfully',
            restaurant
        });
    } catch (error) {
        return next(error);
    }
};

export {
    createRestaurant,
    getRestaurant,
    getDetailRestaurant,
    updateRestaurant,
    deleteRestaurant,
    softDeleteRestaurant
};
