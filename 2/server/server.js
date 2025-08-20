const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');

const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions))
app.use(morgan("[:date[clf]] :method :url :status :res[content-length] - :response-time ms"));
app.use('/gen', createProxyMiddleware({ target: process.env.GEN_PROXY, changeOrigin: true}));
app.use('/user', createProxyMiddleware({ target: process.env.USER_PROXY, changeOrigin: true}));


app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});