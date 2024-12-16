import jwt from 'jsonwebtoken';

const generateToken = (payload, secretKey, expiresIn) => {
    return jwt.sign(payload, secretKey, { expiresIn });
};

export default generateToken;
