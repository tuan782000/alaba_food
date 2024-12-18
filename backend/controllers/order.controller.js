import errorHandler from '../utils/error.js';
import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Restaurant from '../models/restaurant.model.js';
import User from '../models/user.model.js';

const getOrder = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * items_per_page;

    try {
        // Lọc các đơn hàng chưa bị xóa (is_deleted: false)
        const filter = { is_deleted: false };

        const orders = await Order.find(filter)
            .skip(skip) // Bỏ qua các bản ghi đã được phân trang
            .limit(items_per_page) // Giới hạn số lượng đơn hàng lấy ra mỗi trang
            .populate('user_id', 'name email') // Thông tin người dùng
            .populate('restaurant_id', 'name address') // Thông tin nhà hàng
            .sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo đơn hàng

        const total = await Order.countDocuments(filter); // Tổng số đơn hàng

        // Tính toán phân trang
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        return res.status(200).json({
            data: orders,
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

const getOrderDetail = async (req, res, next) => {
    const { id } = req.params;

    try {
        const order = await Order.findById({ _id: id, is_deleted: false });
        // .populate('user_id', 'name email phone') // Thông tin người dùng
        // .populate('restaurant_id', 'name address') // Thông tin nhà hàng
        // .populate({
        //     path: 'orderDetails', // Nếu bạn có liên kết đến OrderDetail
        //     populate: {
        //         path: 'menu_item_id',
        //         select: 'name base_price'
        //     }
        // });

        if (!order || order.is_deleted) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({
            message: 'Get order detail by ID successfully',
            data: order
        });
    } catch (error) {
        return next(error);
    }
};
const updateOrder = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validate status nếu cần
    if (
        updateData.status &&
        !['ordered', 'on the way', 'delivered'].includes(updateData.status)
    ) {
        return next(errorHandler(400, 'Invalid order status!'));
    }

    try {
        const order = await Order.findById({ _id: id, is_deleted: false });

        if (!order || order.is_deleted) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        return next(error);
    }
};
const deleteOrder = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedOrder = await Order.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({
            message: 'Order deleted successfully',
            data: deletedOrder
        });
    } catch (error) {
        return next(error);
    }
};
const softDeleteOrder = async (req, res, next) => {
    const { id } = req.params;

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { is_deleted: true },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({
            message: 'Order soft deleted successfully',
            data: order
        });
    } catch (error) {
        return next(error);
    }
};
export { getOrder, getOrderDetail, updateOrder, deleteOrder, softDeleteOrder };
