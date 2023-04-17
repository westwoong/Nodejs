const express = require('express');
const app = express();
require('./models/index');
require('./conf/cors');
require('dotenv').config();
app.use(express.json());
const signRoute = require('./routes/sign');
const postRoute = require('./routes/posts');
const userRoute = require('./routes/users');
app.use('/', signRoute);
app.use('/posts', postRoute);
app.use('/users', userRoute);

app.listen(process.env.PORT, async () => {
    console.log(`서버가 실행됩니다. http://localhost:${process.env.PORT}`);
});