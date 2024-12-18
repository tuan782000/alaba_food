import express from 'express';
import {
    createReview,
    deleteReviewById,
    getReviewById,
    getReviews,
    softDeleteReviewById,
    updateReviewById
} from '../controllers/review.controller.js';
const router = express.Router();

router.post('/', createReview);
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReviewById);
router.delete('/:id', deleteReviewById);
router.delete('/soft-delete/:id', softDeleteReviewById);

export default router;
