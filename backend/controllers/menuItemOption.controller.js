// import MenuItemOption from '../models/menuItemOption.model.js';
// import MenuItem from '../models/menuItem.model.js';
import mongoose from 'mongoose';
import errorHandler from '../utils/error.js';
import MenuItem from '../models/menuItem.model.js';
import MenuItemOption from '../models/menuItemOption.model.js';

const createMenuItemOption = async (req, res, next) => {
    const {
        menu_item_id,
        title,
        additional_price,
        optional_description,
        images
    } = req.body;

    if (!menu_item_id || !title) {
        return next(errorHandler(400, 'Menu Item ID and title are required!'));
    }

    if (!mongoose.Types.ObjectId.isValid(menu_item_id)) {
        return next(errorHandler(400, 'Invalid Menu Item ID!'));
    }

    try {
        // Check if the MenuItem exists
        const menuItem = await MenuItem.findById(menu_item_id);
        if (!menuItem || menuItem.is_deleted) {
            return next(errorHandler(404, 'Menu Item not found!'));
        }

        const newMenuItemOption = new MenuItemOption({
            menu_item_id,
            title,
            additional_price,
            optional_description,
            images
        });

        const savedMenuItemOption = await newMenuItemOption.save();

        res.status(201).json({
            message: 'Menu Item Option created successfully',
            menuItemOption: savedMenuItemOption
        });
    } catch (error) {
        next(error);
    }
};

const getMenuItemOptions = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const keyword = req.query.search || '';
    const menu_item_id = req.query.menu_item_id;

    const filter = {
        is_deleted: false,
        $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { optional_description: { $regex: keyword, $options: 'i' } }
        ]
    };

    if (menu_item_id) {
        filter.menu_item_id = menu_item_id; // Filter by menu item ID if provided
    }

    try {
        const menuItemOptions = await MenuItemOption.find(filter)
            .skip(skip)
            .limit(items_per_page)
            .sort({ createdAt: -1 })
            .populate('menu_item_id', 'title'); // Fetch menu item title

        const total = await MenuItemOption.countDocuments(filter);
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        res.status(200).json({
            data: menuItemOptions,
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
const getDetailMenuItemOption = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItemOption = await MenuItemOption.findOne({
            _id: id,
            is_deleted: false
        }).populate('menu_item_id', 'title'); // Populate menu item title

        if (!menuItemOption) {
            return res
                .status(404)
                .json({ message: 'Menu Item Option not found!' });
        }

        res.status(200).json(menuItemOption);
    } catch (error) {
        next(error);
    }
};
const updateMenuItemOption = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    if (
        updateData.title &&
        (updateData.title.length < 2 || updateData.title.length > 50)
    ) {
        return next(
            errorHandler(400, 'Title must be between 2 and 50 characters!')
        );
    }

    try {
        const menuItemOption = await MenuItemOption.findById(id);

        if (!menuItemOption || menuItemOption.is_deleted) {
            return res
                .status(404)
                .json({ message: 'Menu Item Option not found' });
        }

        const updatedMenuItemOption = await MenuItemOption.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Menu Item Option updated successfully',
            menuItemOption: updatedMenuItemOption
        });
    } catch (error) {
        next(error);
    }
};

const deleteMenuItemOption = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItemOption = await MenuItemOption.findByIdAndDelete(id);

        if (!menuItemOption) {
            return res
                .status(404)
                .json({ message: 'Menu Item Option not found!' });
        }

        res.status(200).json({
            message: 'Menu Item Option deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const softDeleteMenuItemOption = async (req, res, next) => {
    const { id } = req.params;

    try {
        const menuItemOption = await MenuItemOption.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!menuItemOption) {
            return res
                .status(404)
                .json({ message: 'Menu Item Option not found' });
        }

        res.status(200).json({
            message: 'Menu Item Option soft deleted successfully',
            menuItemOption
        });
    } catch (error) {
        next(error);
    }
};

export {
    createMenuItemOption,
    getMenuItemOptions,
    getDetailMenuItemOption,
    updateMenuItemOption,
    deleteMenuItemOption,
    softDeleteMenuItemOption
};
