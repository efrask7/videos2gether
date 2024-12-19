import { users } from "./users.js";
import { rooms } from "./rooms.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt"

//FUNCIONES PARA AGREGAR DATOS DE USUARIO O UNA SALA

//USERS

const newUser = async (user, pass, callback) => {
    try {
        const encryptedPassword = await bcrypt.hash(pass, 10)
        const tag = await users.create({ username: user, password: encryptedPassword});
        console.log(`Usuario: ${user} registrado con el ID: ${tag.id}`);
        return callback(false, tag.id);
    } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log(`El usuario ${user} ya esta registrado!`);
            return callback(true, user);
        }
    }
}

const searchUser = async (user, pass, callback) => {

    const tag = await users.findOne({ where: { username: user } });
    if (!tag) return callback(false);

    const compare = await bcrypt.compare(pass, tag.get('password'))

    if (!compare) return callback(true, false);

    return callback(true, true);
}

//ROOMS

const addRoom = async (name, creator, secret, pass, callback) => {

    try {
        if (secret) {
            const tag = await rooms.create({ name: name, password: pass, admin: creator, private: 1 });
            console.log(`Nueva sala: ${tag.name} (${tag.id}) PW: si | ${creator}`);
            return callback(tag.id);
        } else {
            const tag = await rooms.create({ name: name, admin: creator, private: 0 });
            console.log(`Nueva sala: ${tag.name} (${tag.id}) PW: no | ${creator}`);
            return callback(tag.id);
        }
    } catch (e) {
        
    }
}

const searchRoom = async (name, password, room, callback) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return callback(false);

    if (tag.get('private') == 1) {
        if (tag.get('password') != password) return callback(false); //regresa que la contra no es la misma

        return callback(true, tag.get('name'), tag.get('online')); //regresa la sala pq pos la contra estaba bien
    } else {
        return callback(true, tag.get('name'), tag.get('online')); //regresa la sala pq no tiene contra
    }

}

const searchRoomByName = async (name) => {
    const tags = await rooms.findAll({ where: { name: {[Op.substring]: name} } });
    if (!tags[0]) return false;

    let roomList = [];

    for (let i in tags) {
        if (tags[i].password != null) {
            roomList[i] = { name: tags[i].name, id: tags[i].id, admin: tags[i].admin, hasPw: true, online: tags[i].online };
        } else roomList[i] = { name: tags[i].name, id: tags[i].id, admin: tags[i].admin, hasPw: false, online: tags[i].online };
    }

    return roomList;
}



export { newUser, searchUser, addRoom, searchRoom, searchRoomByName };