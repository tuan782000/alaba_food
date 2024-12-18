import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import errorHandler from '../utils/error.js';

// /users?page=1&items_per_page=10&search=John
const getListUsers = async (req, res, next) => {
    const items_per_page = Number(req.query.items_per_page) || 10;
    const page = Number(req.query.page) || 1;

    // Tính toán skip và take cho phân trang
    const skip = (page - 1) * items_per_page;

    // Lấy từ query string, nếu không có thì mặc định là ''
    const keyword = req.query.search || '';

    try {
        // Sử dụng find với điều kiện tìm kiếm và phân trang
        const users = await User.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } }
            ]
        })
            .skip(skip) // Bỏ qua các bản ghi trước đó
            .limit(items_per_page) // Giới hạn số lượng bản ghi;
            .sort({ created_at: -1 }) // Sắp xếp giảm dần theo created_at
            .select(
                'id name email phone address role is_active is_deleted profile_picture '
            );

        // Lấy tổng số lượng người dùng trong bảng
        const total = await User.countDocuments({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } }
            ]
        });

        // Tính toán các trang
        const lastPage = Math.ceil(total / items_per_page);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;

        // Trả về kết quả
        return res.status(200).json({
            data: users,
            total,
            currentPage: page,
            nextPage,
            prevPage,
            lastPage
        });
    } catch (error) {
        return next(error); // Xử lý lỗi qua middleware
    }
};

const getUser = async (req, res, next) => {
    const { id } = req.params; // {{LocalURL}}/api/user/675f8dac67d846543249f85f

    try {
        // Tìm user dựa vào id
        const user = await User.findById(id).select('-password'); // Bỏ trường password trong kết quả trả về

        if (!user) {
            // Nếu không tìm thấy user
            return res.status(404).json({ message: 'User not found' });
        }

        // Nếu tìm thấy user, trả về thông tin
        return res.status(200).json(user);
    } catch (error) {
        return next(error);
    }
};

// cho phép admin có quyền sửa thông tin user
const updateUser = async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body; // Lấy dữ liệu cập nhật từ request body

    if (updateData.password) {
        if (updateData.password.length < 6) {
            return next(
                errorHandler(400, 'Password must be at least 6 characters!!!')
            );
        }

        if (updateData.password.includes(' ')) {
            return next(
                errorHandler(400, 'Password can not contains spaces!!!')
            );
        }

        updateData.password = bcryptjs.hashSync(updateData.password, 10);
    }

    if (updateData.name) {
        if (updateData.name.length < 2 || updateData.name.length > 20) {
            return next(
                errorHandler(400, 'Name must be between 3 and 20 characters!!!')
            );
        }

        if (!updateData.name.match(/^[a-zA-Z0-9]+$/)) {
            return next(
                errorHandler(
                    400,
                    'Username can only contain letters and numbers'
                )
            );
        }
    }

    if (updateData.phone) {
        if (updateData.phone.length <= 9 || updateData.phone.length >= 12) {
            return next(
                errorHandler(
                    400,
                    'Phone must be between 10 and 11 characters!!!'
                )
            );
        }

        if (updateData.phone.includes(' ')) {
            return next(errorHandler(400, 'Phone can not contains spaces!!!'));
        }
    }

    if (updateData.address) {
        if (
            updateData.address.length <= 4 ||
            updateData.address.length >= 500
        ) {
            return next(
                errorHandler(
                    400,
                    'Address must be between 4 and 500 characters!!!'
                )
            );
        }
    }

    // validate thêm

    try {
        // Kiểm tra xem user có tồn tại không
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Cập nhật thông tin người dùng
        const updatedUser = await User.findByIdAndUpdate(id, updateData, {
            new: true, // Trả về bản ghi đã cập nhật
            runValidators: true // Áp dụng các validator được định nghĩa trong schema
        }).select('-password'); // Loại bỏ trường password trong kết quả trả về

        // Trả về user sau khi cập nhật
        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        return next(error);
    }
};

// user có thể update thông tin mình qua profile
const updateProfile = async (req, res, next) => {
    // Kiểm tra quyền hạn
    if (req.user.id !== req.params.id) {
        return next(
            errorHandler(401, 'You are not allowed to update this user')
        );
    }

    // người dùng muốn sửa mật khẩu - kiểm tra thử có phải vậy không
    if (req.body.password) {
        if (req.body.password.length < 6) {
            return next(
                errorHandler(400, 'Password must be at least 6 characters!!!')
            );
        }

        if (req.body.password.includes(' ')) {
            return next(
                errorHandler(400, 'Password can not contains spaces!!!')
            );
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    if (req.body.name) {
        if (req.body.name.length < 2 || req.body.name.length > 20) {
            return next(
                errorHandler(400, 'Name must be between 3 and 20 characters!!!')
            );
        }

        if (!req.body.name.match(/^[a-zA-Z0-9]+$/)) {
            return next(
                errorHandler(
                    400,
                    'Username can only contain letters and numbers'
                )
            );
        }
    }

    if (req.body.phone) {
        if (req.body.phone.length <= 9 || req.body.phone.length >= 12) {
            return next(
                errorHandler(
                    400,
                    'Phone must be between 10 and 11 characters!!!'
                )
            );
        }

        if (req.body.phone.includes(' ')) {
            return next(errorHandler(400, 'Phone can not contains spaces!!!'));
        }
    }

    if (req.body.address) {
        if (req.body.address.length <= 4 || req.body.address.length >= 500) {
            return next(
                errorHandler(
                    400,
                    'Address must be between 4 and 500 characters!!!'
                )
            );
        }
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    name: req.body.name,
                    password: req.body.password,
                    address: req.body.address,
                    phone: req.body.phone,
                    profile_picture: req.body.profile_picture
                }
            },
            {
                new: true
            }
        );
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        return next(error);
    }
};

// admin có quyền xoá cứng
const deleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Xóa user bằng _id
        const deletedUser = await User.findByIdAndDelete(id);

        // Kiểm tra nếu không tìm thấy user
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        return next(error); // Chuyển lỗi sang middleware xử lý
    }
};

// user chỉ được xoá mềm tài khoản
const softDeleteUser = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Tìm và cập nhật trường `is_deleted` thành `true`
        const user = await User.findByIdAndUpdate(
            id,
            { $set: { is_deleted: true } },
            { new: true } // Trả về tài liệu đã cập nhật
        );

        // Nếu không tìm thấy user
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User soft deleted successfully',
            user
        });
    } catch (error) {
        return next(error); // Chuyển lỗi đến middleware xử lý
    }
};

// Khi đăng xuất thì user đó sẽ cung cấp
const signOut = async (req, res, next) => {
    try {
        // Clear cookies
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ message: 'Sign out successful' });
    } catch (error) {
        return next(error); // Xử lý lỗi qua middleware
    }
};

export {
    updateUser,
    deleteUser,
    getUser,
    getListUsers,
    signOut,
    updateProfile,
    softDeleteUser
};
