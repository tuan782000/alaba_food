const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} request made to ${req.url}`);
    next(); // Tiến đến middleware hoặc route tiếp theo
};

export default loggingMiddleware;
