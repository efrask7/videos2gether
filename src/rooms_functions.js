import { rooms } from './db/rooms.js';

const newValue = (name) => {
    return {
        name: name
    };
};

const defaultValue = (name) => {
    return {
        0: {
            name: name
        }
    }
};

const findNewId = async (room) => {
    const tag = await rooms.findOne({ where: {id: room } });
    if (!tag) return 0;

    let videos = JSON.parse(tag.get('videos'));

    let count = 0;

    for (let i in videos) {
        count++;
    }

    return count+1;
};

const updateVideos = async (room, video) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    if (!tag.get('videos')) {
        rooms.update({ videos: JSON.stringify(defaultValue(video)) }, { where: {id: room} });
        tag.reload();
    }

    let videos = JSON.parse(tag.get('videos'));

    videos[await findNewId(room)] = newValue(video);

    rooms.update({ videos: JSON.stringify(videos) }, { where: {id: room} });

    return (await findNewId(room)-1);
};

const playing = async (room, num) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    rooms.update({ status: 'playing' }, { where: {id: room} });
    rooms.update({ playing: num }, { where: {id: room} });
};

const noPlaying = async (room) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return -1;

    rooms.update({ playing: null }, { where: {id: room} });
};

const playingVideo = async (room, callback) => {
    const tag = await rooms.findOne({ where: {id: room} });
    if (!tag) return callback(false);

    if (tag.get('playing')) return callback(true, tag.get('playing'), tag.get('current'), tag.get('status'));
    else return callback(true, false);
};

export { findNewId, updateVideos, playing, noPlaying, playingVideo };