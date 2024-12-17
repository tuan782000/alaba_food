import express from 'express';
import {
    createMenu,
    deleteMenu,
    getDetailMenu,
    getMenus,
    softDeleteMenu,
    updateMenu
} from '../controllers/menu.controller.js';

const router = express.Router();

// Create
router.post('/', createMenu);
// Read
router.get('/list-menus', getMenus);
router.get('/:id', getDetailMenu);
// Update
router.put('/:id', updateMenu);
// Delete
router.delete('/:id', deleteMenu);
router.delete('/soft-delete/:id', softDeleteMenu);

export default router;
