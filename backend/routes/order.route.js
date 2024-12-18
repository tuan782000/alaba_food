import express from 'express';
import {
    deleteOrder,
    getOrder,
    getOrderDetail,
    softDeleteOrder,
    updateOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// Read
// router.get('/list-orders', getOrder);
router.get('/:id', getOrderDetail);
// Update
router.put('/:id', updateOrder);
// Delete
router.delete('/:id', deleteOrder);
// soft delete
router.delete('/soft-delete/:id', softDeleteOrder);

export default router;
