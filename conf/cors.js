const app = require('express');
const cors = require('cors');

module.exports = app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));