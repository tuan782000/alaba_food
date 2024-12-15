const express = require('express');
const app = express();
const port = 3000;

// Route mặc định
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Lắng nghe kết nối
app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});
