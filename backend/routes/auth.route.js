import express from 'express';
import {
    resendCode,
    signIn,
    signUp,
    verifyCode,
    refreshToken
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);
router.post('/refresh-token', refreshToken);

export default router;
