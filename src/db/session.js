import Sequelize from 'sequelize';

const session_sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'db/sqlite/sessions.sqlite',
});

export { session_sequelize }; 