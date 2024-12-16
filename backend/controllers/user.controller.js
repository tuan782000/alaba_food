const getListUsers = async (req, res, next) => {};

const getUser = async (req, res, next) => {};

const updateUser = async (req, res, next) => {};

const deleteUser = async (req, res, next) => {};

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
export { updateUser, deleteUser, getUser, getListUsers, signOut };
