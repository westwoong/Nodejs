const express = require('express');
const app = express();
const cors = require('cors');

module.exports = app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));