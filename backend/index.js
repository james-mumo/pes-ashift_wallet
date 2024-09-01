require('dotenv').config();
const express = require('express');
const cors = require('cors');

const JWT_SECRET = process.env.JWT_SECRET;
const rootRouter = require('./routes/index.js');

const app = express();
const PORT = process.env.PORT || 3500;

// Specify allowed origins
const allowedOrigins = ['https://pesa-shift-wallet.vercel.app'];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

// Use CORS middleware with options
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/v1', rootRouter);

app.use((req, res) => {
    const err = new Error('File not found');
    err.status = 404;
    throw err;
});

app.use((err, req, res, next) => {  
    res.status(err.status || 500).json({
        message: err.message || "Oops! Something went wrong",
    });
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
