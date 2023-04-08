const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Sequelize, DataTypes, json } = require('sequelize');
const crypto = require('crypto');
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_URL,
    dialect: 'mysql',
    timezone: "+09:00",
})

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "사용자 이메일"
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "사용자 비밀번호"
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

const Post = sequelize.define('posts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})
User.hasMany(Post);
Post.belongsTo(User);

app.listen(process.env.PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('connection success');
        await sequelize.sync({ force: true });
    }
    catch (error) {
        console.error(`connection failes :${error}`);
    }
    console.log(`서버가 실행됩니다. http://localhost:${process.env.PORT}`);
});

// 회원가입
app.post('/users/sign-up', async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email);
    console.log(password);
    crypto.randomBytes(64, (err, buffer) => {
        const salt = buffer.toString('base64'); // 랜덤 함수로 salt 생성
        console.log(salt);

        crypto.pbkdf2(password, salt, 105820, 64, 'SHA512', async (err, buffer) => {
            const hashedPassword = buffer.toString('base64');
            console.log(hashedPassword); // 해쉬화된 비밀번호 생성

            // DB에 salt, hashedPassword 저장
            await User.create({ email, name, salt, password: hashedPassword });
            const saltValue = await User.findAll({ attributes: ['salt'], where: { email } });
            console.log(saltValue);
            const hashValue = await User.findAll({ attributes: ['password'], where: { email } });
            console.log(hashValue);
            res.status(200).send("OK");

        });
    });
});

// 로그인
app.post('/users/sign-in', async (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);


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
        // const payload = pkResult.map(row => row.id).join();
        // 찾은 PK 값 payload.id 에 할당하기.
        const payload = { id: pkResult }
        console.log(payload);


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

app.post('/posts', async (req, res) => {
    const { title, content } = req.body;

    console.log(req.headers.authorization); // 헤더에 있는 인증키 값 확인

    const authHeader = req.headers.authorization;


    console.log('-----header----');
    console.log(authHeader);
    console.log('---------------');

    let token = authHeader.substring(7, authHeader.length); // Bearer 뒤에 process.env.JSON_SECRETKEY 값 가져오는 substring메소드

    console.log('-----token----');
    console.log(token);
    console.log('---------------');


    let payload;

    try {
        payload = jwt.verify(token, process.env.JSON_SECRETKEY);
        console.log(payload);
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
    console.log('-----payload----');
    console.log(payload);
    console.log('---------------');
    // payload안에 들어있는 id는 userId이다.
    // userId, title, content를 활용해서 게시글에 대한 정보를 DB에 저장.
    const payloadArray = payload.id[0]; // payload.id 객체에 있는 id값만 받아오는 변수
    console.log(payloadArray.id);

    await Post.create({ userId: payloadArray.id, title, content });
    res.status(204).send();
})

app.get('/myinfo', async (req, res) => {
    const authHeader = req.headers.authorization;

    let token = authHeader.substring(7, authHeader.length); // Bearer 뒤에 process.env.JSON_SECRETKEY 값 가져오는 substring메소드

    let payload;
    try {
        payload = jwt.verify(token, process.env.JSON_SECRETKEY);
        console.log(payload);
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
    console.log(payloadArray);
    // column에서 이름과 이메일만 보여주게 한 후 PK값에는 payload.id를 받아와 검색
    const userInfo = await User.findAll({ attributes: ['name', 'email'], where: { id: payloadArray.id } });
    console.log(userInfo);

    res.status(200).send(userInfo);
})