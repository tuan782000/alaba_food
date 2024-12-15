import mongoose from 'mongoose';

const user = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true, // Đảm bảo email không bị trùng lặp
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] // Kiểm tra định dạng email
        },
        password: {
            type: String,
            require: true
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        account_type: {
            type: String
        },
        role: {
            type: String
        },
        is_active: {
            type: Boolean, // Thay kiểu String bằng Boolean cho đúng
            default: false // Mặc định là active
        },
        code_id: {
            type: String
        },
        code_expired: {
            type: Date
        },
        refresh_token: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', user);
export default User;
