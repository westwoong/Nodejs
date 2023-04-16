const express = require('express');
const signRouter = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models/index');
require('dotenv').config('../.env');

// 회원가입
signRouter.post('/sign-up', async (req, res) => {
    const { email, password, name } = req.body;
    crypto.randomBytes(64, (err, buffer) => {
        const salt = buffer.toString('base64'); // 랜덤 함수로 salt 생성

        crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');// 해쉬화된 비밀번호 생성

            // DB에 salt, hashedPassword 저장
            const createUser = await User.create({ email, name, salt, password: hashedPassword });
            res.status(200).send(createUser);

        });
    });
});

signRouter.post('/sign-in', async (req, res) => {
    const { email, password } = req.body;

    // email을 가지고 DB에 저장되어 있는 salt와 password를 조회
    const result = await User.findAll({ attributes: ['salt'], where: { email } });
    const result2 = await User.findAll({ attributes: ['password'], where: { email } });
    const salt = result.map(row => row.salt).join();
    const storedHashedPassword = result2.map(row => row.password).join();

    // 받은 password도 같이
    crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
        const hashedPassword = buffer.toString('base64');

        // 사용자 email받아서 PK 값 찾기
        const pkResult = await User.findAll({ attributes: ['id'], where: { email } });

        // 찾은 PK 값 payload.id 에 할당하기.
        const payload = { id: pkResult }
        const token = jwt.sign(payload, process.env.JSON_SECRETKEY, {
            expiresIn: "60000" // 초기준
        })

        if (hashedPassword === storedHashedPassword) {
            res.status(200).send({ token });
        } else {
            res.status(400).send("비밀번호 불일치");
        }
    });
});

module.exports = signRouter;