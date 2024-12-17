import express from 'express';
import {
    createMenuItemOption,
    deleteMenuItemOption,
    getDetailMenuItemOption,
    getMenuItemOptions,
    softDeleteMenuItemOption,
    updateMenuItemOption
} from '../controllers/menuItemOption.controller.js';

const router = express.Router();

// Create
router.post('/', createMenuItemOption);
// Read
router.get('/list-menu-item-options', getMenuItemOptions);
router.get('/:id', getDetailMenuItemOption);
// Update
router.put('/:id', updateMenuItemOption);
// Delete
router.delete('/:id', deleteMenuItemOption);
router.delete('/soft-delete/:id', softDeleteMenuItemOption);

export default router;
