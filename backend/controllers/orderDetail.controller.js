import mongoose from 'mongoose';
import OrderDetail from '../models/orderDetail.model.js';
import Order from '../models/order.model.js';
import MenuItem from '../models/menuItem.model.js';
import MenuItemOption from '../models/menuItemOption.model.js';
import Restaurant from '../models/restaurant.model.js';
import User from '../models/user.model.js';
import errorHandler from '../utils/error.js';

const createOrderDetail = async (req, res, next) => {
    const { user_id, restaurant_id, cart, delivery_time } = req.body;

    if (!user_id || !restaurant_id || !cart || cart.length === 0) {
        return next(
            errorHandler(400, 'Invalid request! Cart cannot be empty.')
        );
    }

    try {
        // Validate restaurant
        const restaurant = await Restaurant.findById(restaurant_id);
        if (!restaurant || restaurant.is_deleted) {
            return next(errorHandler(404, 'Restaurant not found!'));
        }

        // Validate user
        const user = await User.findById(user_id);
        if (!user || user.is_deleted) {
            return next(errorHandler(404, 'User not found!'));
        }

        let totalPrice = 0;
        const orderDetails = [];

        // Create order details
        for (const item of cart) {
            const menuItem = await MenuItem.findById(item.menu_item_id);
            if (!menuItem) {
                return next(
                    errorHandler(
                        404,
                        `Menu item ${item.menu_item_id} not found!`
                    )
                );
            }

            // Calculate option prices
            const options = await MenuItemOption.find({
                _id: { $in: item.menu_item_option_ids }
            });

            const optionsPrice = options.reduce(
                (sum, option) => sum + option.additional_price,
                0
            );
            const itemPrice =
                (menuItem.base_price + optionsPrice) * item.quantity;

            totalPrice += itemPrice;

            // Save OrderDetail
            const newOrderDetail = new OrderDetail({
                restaurant_id,
                menu_id: menuItem.menu_id,
                menu_item_id: item.menu_item_id,
                menu_item_option_ids: item.menu_item_option_ids,
                quantity: item.quantity,
                price: itemPrice
            });

            const savedOrderDetail = await newOrderDetail.save();
            orderDetails.push(savedOrderDetail);
        }

        // Create Order
        const newOrder = new Order({
            user_id,
            restaurant_id,
            total_price: totalPrice,
            delivery_time
        });

        const savedOrder = await newOrder.save();

        // Link OrderDetails to the created Order
        for (const detail of orderDetails) {
            detail.order_id = savedOrder._id;
            await detail.save();
        }

        return res.status(201).json({
            message: 'Order created successfully',
            order: savedOrder,
            orderDetails
        });
    } catch (error) {
        next(error);
    }
};

// read - danh sách - xem chi tiết

const getOrderDetails = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    const { order_id, restaurant_id } = req.query;

    try {
        // Điều kiện lọc
        const filter = { is_deleted: { $ne: true } };
        if (order_id) filter.order_id = order_id;
        if (restaurant_id) filter.restaurant_id = restaurant_id;

        // Lấy danh sách OrderDetail
        const orderDetails = await OrderDetail.find(filter)
            .skip(skip)
            .limit(items_per_page)
            .populate('menu_item_id', 'name base_price') // Join với MenuItem
            .populate('menu_item_option_ids', 'name additional_price') // Join với MenuItemOption
            .populate('restaurant_id', 'name') // Join với Restaurant
            .sort({ createdAt: -1 });

        // Tổng số lượng OrderDetail
        const total = await OrderDetail.countDocuments(filter);

        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: orderDetails,
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

// Này có vấn đề
const getOrderDetailById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const order = await OrderDetail.findOne({
            _id: id,
            is_deleted: false // Loại bỏ các bản ghi đã bị xóa mềm
        });
        // .populate('user_id', 'name email phone')
        // .populate('restaurant_id', 'name address')
        // .populate({
        //     path: 'orderDetails',
        //     populate: {
        //         path: 'menu_item_id',
        //         select: 'name base_price'
        //     }
        // });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json(order);
    } catch (error) {
        return next(error);
    }
};

// update - cập nhật
const updateOrderDetail = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const orderDetail = await OrderDetail.findById({
            _id: id,
            is_deleted: false
        });

        if (!orderDetail) {
            return res.status(404).json({ message: 'Order detail not found' });
        }

        // Update dữ liệu
        if (updateData.quantity) orderDetail.quantity = updateData.quantity;
        if (updateData.price) orderDetail.price = updateData.price;

        const updatedOrderDetail = await orderDetail.save();

        return res.status(200).json({
            message: 'Order detail updated successfully',
            orderDetail: updatedOrderDetail
        });
    } catch (error) {
        return next(error);
    }
};

// delete - xoá cứng và mềm

const deleteOrderDetail = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedOrderDetail = await OrderDetail.findByIdAndDelete(id);

        if (!deletedOrderDetail) {
            return res.status(404).json({ message: 'Order detail not found' });
        }

        return res
            .status(200)
            .json({ message: 'Order detail deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

const softDeleteOrderDetail = async (req, res, next) => {
    const { id } = req.params;

    try {
        const orderDetail = await OrderDetail.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!orderDetail) {
            return res.status(404).json({ message: 'Order detail not found' });
        }

        return res.status(200).json({
            message: 'Order detail soft deleted successfully',
            orderDetail
        });
    } catch (error) {
        return next(error);
    }
};

export {
    createOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
    softDeleteOrderDetail,
    getOrderDetailById,
    getOrderDetails
};
