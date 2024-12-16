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
            // select: false
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        account_type: {
            type: String,
            default: 'Local'
        },
        role: {
            type: String,
            default: 'User'
        },
        is_active: {
            type: Boolean, // Thay kiểu String bằng Boolean cho đúng
            default: false // Mặc định là active
        },
        code_id: {
            type: String
        },
        code_expired: {
            type: Date // sẽ tính tới phương án + 15 min
        },
        refresh_token: {
            type: String,
            default: 'refresh token string'
        },
        isDeleted: {
            type: Boolean, // Thêm cờ để đánh dấu bản ghi đã bị xoá mềm
            default: false // Mặc định là chưa xoá
        },
        profilePicture: {
            type: String,
            default:
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', user);
export default User;
