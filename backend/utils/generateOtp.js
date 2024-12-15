const generateOtp = () => {
    const numberChars = '0123456789';
    let otp = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * numberChars.length);
        otp += numberChars[randomIndex];
    }

    return otp;
};

export default generateOtp;

// create otp - 4 numbers
