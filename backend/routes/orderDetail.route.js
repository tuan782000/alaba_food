import express from 'express';
import {
    createOrderDetail,
    deleteOrderDetail,
    getOrderDetailById,
    getOrderDetails,
    softDeleteOrderDetail,
    updateOrderDetail
} from '../controllers/orderDetail.controller.js';

const router = express.Router();

// Create
router.post('/', createOrderDetail);
// Read
router.get('/list', getOrderDetails);
router.get('/:id', getOrderDetailById);
// Update
// router.put('/:id', updateOrderDetail);
// Delete
// router.delete('/:id', deleteOrderDetail);
router.delete('/soft-delete/:id', softDeleteOrderDetail);

export default router;
