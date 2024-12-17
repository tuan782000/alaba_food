import express from 'express';
import {
    createRestaurant,
    deleteRestaurant,
    getDetailRestaurant,
    getRestaurant,
    softDeleteRestaurant,
    updateRestaurant
} from '../controllers/restaurant.controller.js';

const router = express.Router();

// Create
router.post('/', createRestaurant);
// Read
router.get('/list-restaurants', getRestaurant);
router.get('/:id', getDetailRestaurant);
// Update
router.put('/:id', updateRestaurant);
// Delete
router.delete('/:id', deleteRestaurant);
// soft delete
router.delete('/soft-delete/:id', softDeleteRestaurant);

export default router;
