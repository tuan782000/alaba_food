import bcrypt from 'bcryptjs';
import errorHandler from '../utils/error.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import generateOtp from '../utils/generateOtp.js';
import sendMail from '../utils/sendEmail.js';

const signUp = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (
        !name ||
        !email ||
        !password ||
        name === '' ||
        email === '' ||
        password === ''
    ) {
        return next(errorHandler(400, 'All fileds are required'));
    }

    try {
        const checkEmail = await User.findOne({ email });

        if (checkEmail) {
            return next(errorHandler(409, 'Email already exists'));
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const code_id = generateOtp();
        const code_expired = Date.now() + 5 * 60 * 1000; // Add 5 minutes in milliseconds

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            code_id,
            code_expired
        });

        // gửi email code code cho người dùng
        // Gửi email chứa code_id cho người dùng
        const emailSubject = 'Verify your email for Alaba Food';
        const emailText = `Your verification code is: ${code_id}`;
        const emailHtml = `
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for signing up for Alaba Food!</p>
            <p>Your verification code is: <strong>${code_id}</strong></p>
            <p>This code will expire in 5 minutes.</p>
        `;

        await sendMail(email, emailSubject, emailText, emailHtml);

        await newUser.save();

        const userWithoutPassword = newUser.toObject();
        delete userWithoutPassword.password;

        return res.json({
            message:
                'Sign up account successfully, Please check your email get code',
            user: userWithoutPassword
        });
    } catch (error) {
        return next(error);
    }
};

const verifyCode = async (req, res, next) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return next(errorHandler(400, 'Email and code are required'));
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        if (user.code_id !== code) {
            return next(errorHandler(400, 'Invalid verification code'));
        }

        // đoạn này check xem code đã quá hạn chưa
        if (Date.now() > user.code_expired) {
            return next(errorHandler(400, 'Verification code has expired'));
        }

        // Cập nhật is_active thành true
        user.is_active = true;
        user.code_id = null; // Xoá mã code sau khi xác thực thành công
        user.code_expired = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        return next(error);
    }
};

// Hàm tạo lại mã nếu sau 5 phút không - nhập mã
const resendCode = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(errorHandler(400, 'Email is required'));
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        if (user.is_active) {
            return next(errorHandler(400, 'Email is already verified'));
        }

        // Tạo mã code mới và thời gian hết hạn
        const code_id = generateOtp();
        const code_expired = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.code_id = code_id;
        user.code_expired = code_expired;
        await user.save();

        // Gửi email mã code mới
        const emailSubject = 'Resend: Your verification code for Alaba Food';
        const emailText = `Your new verification code is: ${code_id}`;
        const emailHtml = `
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Here is your new verification code: <strong>${code_id}</strong></p>
            <p>This code will expire in 5 minutes.</p>
        `;

        await sendMail(email, emailSubject, emailText, emailHtml);

        res.status(200).json({
            message: 'Verification code resent successfully'
        });
    } catch (error) {
        return next(error);
    }
};

// viết 2 hàm 1 hàm - dùng để xác thực code - 1 hàm nữa để tạo laị code mới

const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        return next(errorHandler(400, 'All fileds are required'));
    }

    try {
        const validUser = await User.findOne({ email });

        if (!validUser) {
            return next(errorHandler(409, 'Email or password is not correct'));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, 'Email or password is not correct'));
        }

        const { password: pass, ...rest } = validUser._doc;

        // ký token - cung cấp cho coookie phía client
        // const token = jwt.sign(
        //     {},
        //     process.env.SECRET_KEY,
        //     {
        //         expiresIn: '10d'
        //     }
        // );

        res.status(200).json(rest);
    } catch (error) {
        return next(error);
    }
};

const generateToken = async payload => {
    const access_token = await jwt.sign(payload);
    const refresh_token = await jwt.sign(payload);
};

const google = async (req, res, next) => {};

export { signUp, signIn, google, verifyCode, resendCode };
