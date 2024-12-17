import MenuItem from '../models/menuItem.model.js';
import Menu from '../models/menu.model.js';
import mongoose from 'mongoose';
import errorHandler from '../utils/error.js';

const createMenuItem = async (req, res, next) => {
    const { menu_id, title, description, base_price, images } = req.body;

    // Validate menu_id và các trường cần thiết
    if (!menu_id || !title || !base_price) {
        return next(
            errorHandler(400, 'Menu ID, title, and base price are required!')
        );
    }

    if (!mongoose.Types.ObjectId.isValid(menu_id)) {
        return next(errorHandler(400, 'Invalid Menu ID!'));
    }

    if (title.length < 3 || title.length > 50) {
        return next(
            errorHandler(400, 'Title must be between 3 and 50 characters!')
        );
    }

    if (base_price < 0) {
        return next(errorHandler(400, 'Base price must be a positive number!'));
    }

    try {
        // Kiểm tra menu có tồn tại không
        const menu = await Menu.findOne({ _id: menu_id, is_deleted: false });
        if (!menu) {
            return next(errorHandler(404, 'Menu not found!'));
        }

        // Tạo menu item
        const newMenuItem = new MenuItem({
            menu_id,
            title,
            description,
            base_price,
            images
        });

        const savedMenuItem = await newMenuItem.save();

        return res.status(201).json({
            message: 'MenuItem created successfully',
            menuItem: savedMenuItem
        });
    } catch (error) {
        next(error);
    }
};

const getMenuItems = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const keyword = req.query.search || '';
    const menu_id = req.query.menu_id;

    const filter = {
        is_deleted: false,
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ]
    };

    if (menu_id) {
        filter.menu_id = menu_id; // Lọc theo menu_id nếu có
    }

    try {
        const menuItems = await MenuItem.find(filter)
            .skip(skip)
            .limit(items_per_page)
            .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
            .populate('menu_id', 'title'); // Lấy thông tin menu liên quan

        const total = await MenuItem.countDocuments(filter);
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: menuItems,
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

const getDetailMenuItem = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItem = await MenuItem.findOne({
            _id: id,
            is_deleted: false
        }).populate('menu_id', 'title'); // Lấy thông tin menu liên quan

        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found!' });
        }

        return res.status(200).json(menuItem);
    } catch (error) {
        next(error);
    }
};

const updateMenuItem = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate dữ liệu đầu vào
    if (
        updateData.title &&
        (updateData.title.length < 3 || updateData.title.length > 50)
    ) {
        return next(
            errorHandler(400, 'Title must be between 3 and 50 characters!')
        );
    }

    if (updateData.base_price !== undefined && updateData.base_price < 0) {
        return next(errorHandler(400, 'Base price must be a positive number!'));
    }

    try {
        const menuItem = await MenuItem.findOne({ _id: id, is_deleted: false });

        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found!' });
        }

        const updatedMenuItem = await MenuItem.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        return res.status(200).json({
            message: 'MenuItem updated successfully',
            menuItem: updatedMenuItem
        });
    } catch (error) {
        next(error);
    }
};

const deleteMenuItem = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found!' });
        }

        return res
            .status(200)
            .json({ message: 'MenuItem deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const softDeleteMenuItem = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: 'MenuItem not found!' });
        }

        return res.status(200).json({
            message: 'MenuItem soft deleted successfully',
            menuItem
        });
    } catch (error) {
        next(error);
    }
};

export {
    createMenuItem,
    getMenuItems,
    getDetailMenuItem,
    updateMenuItem,
    deleteMenuItem,
    softDeleteMenuItem
};
