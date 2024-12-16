import express from 'express';
import {
    getListUsers,
    signOut,
    getUser,
    updateUser,
    updateProfile,
    deleteUser,
    softDeleteUser
} from '../controllers/user.controller.js';

const router = express.Router();

// Create
router.post('/signout', signOut);
// Read
router.get('/list-users', getListUsers);
router.get('/:id', getUser);
// Update
router.put('/:id', updateUser);
router.put('/profile/:id', updateProfile);
// Delete
router.delete('/:id', deleteUser);
// soft delete
router.delete('/soft-delete/:id', softDeleteUser);
export default router;
