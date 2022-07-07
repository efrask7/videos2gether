import Sequelize from 'sequelize';

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'rooms.sqlite',
});

const rooms = sequelize.define('rooms', {
    name: {
        type: Sequelize.STRING,
        unique: false
    },
    online: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    password: {
        type: Sequelize.STRING,
    },
    private: {
        type: Sequelize.BOOLEAN
    },
    videos: {
        type: Sequelize.STRING,
        allowNull: true
    },
    playing: {
        type: Sequelize.INTEGER,
    },
    current: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING,
        allowNull: true
    }
});

export { rooms }; 