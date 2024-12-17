import Restaurant from '../models/restaurant.model.js';
import Menu from '../models/menu.model.js';
import mongoose from 'mongoose';
import errorHandler from '../utils/error.js';

const createMenu = async (req, res, next) => {
    const { restaurant_id, title, description, image } = req.body;
    if (!restaurant_id || !title) {
        return next(errorHandler(400, 'Restaurant ID and title are required!'));
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant_id)) {
        return next(errorHandler(400, 'Invalid Restaurant ID!'));
    }

    if (title.length <= 3 || title.length >= 50) {
        return next(
            errorHandler(400, 'Title must be between 3 and 50 characters!')
        );
    }

    try {
        // Kiểm tra nhà hàng có tồn tại không
        const restaurant = await Restaurant.findById(restaurant_id);
        if (!restaurant || restaurant.is_deleted) {
            return next(errorHandler(404, 'Restaurant not found!'));
        }

        const newMenu = new Menu({
            restaurant_id,
            title,
            description,
            image
        });

        const savedMenu = await newMenu.save();

        res.status(201).json({
            message: 'Menu created successfully',
            menu: savedMenu
        });
    } catch (error) {
        next(error);
    }
};

const getMenus = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const keyword = req.query.search || '';
    const restaurant_id = req.query.restaurant_id;

    const filter = {
        is_deleted: false,
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ]
    };

    if (restaurant_id) {
        filter.restaurant_id = restaurant_id; // Thêm điều kiện tìm theo nhà hàng
    }

    try {
        const menus = await Menu.find(filter)
            .skip(skip)
            .limit(items_per_page)
            .sort({ createdAt: -1 })
            .populate('restaurant_id', 'name'); // Lấy thông tin nhà hàng

        const total = await Menu.countDocuments(filter);
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: menus,
            total,
            currentPage: page,
            nextPage,
            prevPage,
            lastPage
        });
    } catch (error) {
        next(error);
    }
};

const getDetailMenu = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menu = await Menu.findOne({
            _id: id,
            is_deleted: false
        }).populate('restaurant_id', 'name'); // populate - lấy các thông tin 1 vài thông tin từ restaurant - không lấy hết

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found!' });
        }

        res.status(200).json(menu);
    } catch (error) {
        next(error);
    }
};

const updateMenu = async (req, res, next) => {
    const { id } = req.params;

    const updateData = req.body;

    // Validate dữ liệu trước khi cập nhật
    if (
        updateData.title &&
        (updateData.title.length < 2 || updateData.title.length > 30)
    ) {
        return next(
            errorHandler(400, 'Title must be between 2 and 30 characters!')
        );
    }

    if (
        updateData.description &&
        (updateData.description.length < 4 ||
            updateData.description.length > 50)
    ) {
        return next(
            errorHandler(
                400,
                'Description must be between 4 and 50 characters!'
            )
        );
    }

    try {
        const menu = await Menu.findById(id);

        if (!menu || menu.is_deleted) {
            return res.status(404).json({ message: 'Menu not found' });
        }

        const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            message: 'Menu updated successfully',
            menu: updatedMenu
        });
    } catch (error) {
        next(error);
    }
};

const deleteMenu = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menu = await Menu.findByIdAndDelete(id);

        if (!menu) {
            return res.status(404).json({ message: 'Menu not found!' });
        }

        res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const softDeleteMenu = async (req, res, next) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!menu) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        return res.status(200).json({
            message: 'Menu soft deleted successfully',
            menu
        });
    } catch (error) {
        return next(error);
    }
};

export {
    createMenu,
    getMenus,
    getDetailMenu,
    updateMenu,
    deleteMenu,
    softDeleteMenu
};
