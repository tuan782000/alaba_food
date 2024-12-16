import bcrypt from 'bcryptjs';
import errorHandler from '../utils/error.js';
import User from '../models/user.model.js';
import generateOtp from '../utils/generateOtp.js';
import sendMail from '../utils/sendEmail.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

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

        if (password.includes(' ')) {
            return next(
                errorHandler(400, 'Password can not contains spaces!!!')
            );
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const code_id = generateOtp();
        const code_expired = Date.now() + 15 * 60 * 1000; // Add 15 minutes in milliseconds

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
            <p>This code will expire in 15 minutes.</p>
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
        const code_expired = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.code_id = code_id;
        user.code_expired = code_expired;
        await user.save();

        // Gửi email mã code mới
        const emailSubject = 'Resend: Your verification code for Alaba Food';
        const emailText = `Your new verification code is: ${code_id}`;
        const emailHtml = `
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Here is your new verification code: <strong>${code_id}</strong></p>
            <p>This code will expire in 15 minutes.</p>
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

        // Kiểm tra xem tài khoản đã kích hoạt hay chưa
        // UI 1 màn hình có ô email - kèm các ô input nhập otp
        if (!validUser.is_active) {
            return next(
                errorHandler(
                    409,
                    'Account is not active. Please verify your email.'
                )
            );
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, 'Email or password is not correct'));
        }

        // Tạo payload cho token
        const payload = {
            id: validUser._id,
            email: validUser.email,
            role: validUser.role
        };

        // Tạo access_token và refresh_token
        const access_token = generateToken(
            payload,
            process.env.SECRET_KEY, // Sử dụng SECRET_KEY trong .env
            process.env.EXP_IN_ACCESS_TOKEN // Thời hạn access_token, ví dụ: '1h'
        );

        const refresh_token = generateToken(
            payload,
            process.env.SECRET_KEY, // Có thể dùng SECRET_KEY hoặc một key riêng cho refresh_token
            process.env.EXP_IN_REFRESH_TOKEN // Thời hạn refresh_token, ví dụ: '1d'
        );

        // cập nhật refresh_token cho db
        validUser.refresh_token = refresh_token;
        await validUser.save();

        // Cấu hình cookie
        res.cookie('access_token', access_token, {
            httpOnly: true, // Chỉ có thể truy cập qua HTTP (không thể bị lấy qua JavaScript)
            secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong môi trường production
            sameSite: 'strict', // Bảo vệ chống CSRF
            maxAge: 60 * 60 * 1000 // 1 giờ (tương ứng với EXP_IN_ACCESS_TOKEN)
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày (tương ứng với EXP_IN_REFRESH_TOKEN)
        });

        return res.status(200).json({
            message: 'Sign in successful',
            access_token,
            refresh_token
        });
    } catch (error) {
        return next(error);
    }
};

// khi access_token hết hạn, mình trích xuất trong cookies ra gửi refresh_token lên
// đem so sánh refresh_token gửi lên với refresh_token trong db xem 2 cái giống nhau hay không
// nếu giống thì cấp 1 access_token mới - trả về cho client - lưu vào cookie
// còn khi cả 2 cùng nhau hết hạn thì bắt login lại từ đầu
const refreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.cookies;

        if (!refresh_token) {
            return next(errorHandler(401, 'Refresh token is required'));
        }

        // Xác minh refresh_token
        const decoded = jwt.verify(refresh_token, process.env.SECRET_KEY);

        // Tìm người dùng dựa trên decoded id
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(errorHandler(404, 'User not found'));
        }

        // So sánh refresh_token từ cookie với refresh_token trong DB
        if (user.refresh_token !== refresh_token) {
            return next(errorHandler(403, 'Invalid refresh token'));
        }

        // Tạo access_token mới
        const payload = { id: user._id, email: user.email, role: user.role };
        const access_token = generateToken(
            payload,
            process.env.SECRET_KEY,
            process.env.EXP_IN_ACCESS_TOKEN // Ví dụ: '1h'
        );

        // Cập nhật cookie
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000 // 1 giờ (thời hạn của access_token)
        });

        return res.status(200).json({
            message: 'New access token generated successfully',
            access_token
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(
                errorHandler(
                    403,
                    'Refresh token expired. Please sign in again.'
                )
            );
        }
        return next(error);
    }
};

const google = async (req, res, next) => {};

export { signUp, signIn, google, verifyCode, resendCode, refreshToken };
