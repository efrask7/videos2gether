import Sequelize from 'sequelize';

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'db/sqlite/users.sqlite',
});

const users = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    password: {
        type: Sequelize.STRING
    }
});

export { users }; 