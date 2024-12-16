import express from 'express';
import {
    resendCode,
    signIn,
    signUp,
    verifyCode
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendCode);

export default router;
