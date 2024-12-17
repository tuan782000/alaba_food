import express from 'express';
import {
    createMenuItem,
    deleteMenuItem,
    getDetailMenuItem,
    getMenuItems,
    softDeleteMenuItem,
    updateMenuItem
} from '../controllers/menuItem.controller.js';

const router = express.Router();

// Create
router.post('/', createMenuItem);
// Read
router.get('/list-menu-items', getMenuItems);
router.get('/:id', getDetailMenuItem);
// Update
router.put('/:id', updateMenuItem);
// Delete
router.delete('/:id', deleteMenuItem);
router.delete('/soft-delete/:id', softDeleteMenuItem);

export default router;
