const { DataTypes } = require('sequelize');
const sequelize = require('../conf/database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
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

module.exports = User;