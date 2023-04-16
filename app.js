const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('./models/index');
require('./conf/cors');
require('dotenv').config();
const usersRoute = require('./routes/sign');
app.use(express.json());

app.use('/', usersRoute);

app.listen(process.env.PORT, async () => {
    console.log(`서버가 실행됩니다. http://localhost:${process.env.PORT}`);
});

app.post('/posts', async (req, res) => {
    const { title, content } = req.body;

    const authHeader = req.headers.authorization;

    let token = authHeader.substring(7, authHeader.length); // Bearer 뒤에 process.env.JSON_SECRETKEY 값 가져오는 substring메소드

    let payload;

    try {
        payload = jwt.verify(token, process.env.JSON_SECRETKEY);
    } catch (err) {
        if (err.message === "invalid signature") {
            res.status(401).send("잘못된 토큰입니다.");
        }
        if (err.message === "jwt expired") {
            res.status(401).send("유효기간이 만료된 토큰입니다.");
        }
        // else {
        //     res.status(500).send("에러가 발생했습니다");
        // }
        // return;
    }
    // payload안에 들어있는 id는 userId이다.
    // userId, title, content를 활용해서 게시글에 대한 정보를 DB에 저장.
    const payloadArray = payload.id[0]; // payload.id 객체에 있는 id값만 받아오는 변수
    await Post.create({ userId: payloadArray.id, title, content });
    res.status(204).send();
})

app.get('/myinfo', async (req, res) => {
    const authHeader = req.headers.authorization;

    let token = authHeader.substring(7, authHeader.length); // Bearer 뒤에 process.env.JSON_SECRETKEY 값 가져오는 substring메소드

    let payload;
    try {
        payload = jwt.verify(token, process.env.JSON_SECRETKEY);
    } catch (err) {
        if (err.message === "invalid signature") {
            res.status(401).send("잘못된 토큰입니다.");
        }
        if (err.message === "jwt expired") {
            res.status(401).send("유효기간이 만료된 토큰입니다.");
        }
        // else {
        //     res.status(500).send("에러가 발생했습니다");
        // }
        // return;
    }

    const payloadArray = payload.id[0]; // payload.id 객체에 있는 id값만 받아오는 변수
    // column에서 이름과 이메일만 보여주게 한 후 PK값에는 payload.id를 받아와 검색
    const userInfo = await User.findAll({ attributes: ['name', 'email'], where: { id: payloadArray.id } });
    res.status(200).send(userInfo);
})