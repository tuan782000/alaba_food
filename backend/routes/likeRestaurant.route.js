import express from 'express';
import {
    getLikedRestaurants,
    getLikedRestaurantsPaginated,
    likeRestaurant
} from '../controllers/likeRestaurant.controller.js';
const router = express.Router();

router.post('/', likeRestaurant);
router.get('/:id', getLikedRestaurants);
router.get('/paginate/:id', getLikedRestaurantsPaginated);

export default router;
