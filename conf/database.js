const { Sequelize } = require('sequelize');
require('dotenv').config('../.env');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    timezone: "+09:00",
});

const dbConnecting = async () => {
    try {
        await sequelize.authenticate();
        console.log('sequelize connection success!');
        await sequelize.sync({ force: true });
    }
    catch (error) {
        console.error(`connection failes :${error}`);
    }
}

dbConnecting();

module.exports = sequelize;