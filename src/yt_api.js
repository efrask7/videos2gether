import { YT_KEY } from "./config.js"

/* FUNCIONES PARA PEDIR VIDEOS DE YOUTUBE CON SU API

*/

const searchVideo = (query, callback) => {
    fetch (`https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=relevance&q=${query}&type=video&videoDefinition=any&maxResults=10&key=${YT_KEY}`, { 

    }).then(res => res.json())
        .then(resp => {
            return callback(resp);
        });
};

const channel = (channel_id, callback) => {
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel_id}&key=${YT_KEY}`, {

    }).then(res => res.json())
        .then(resp => callback(resp));
};

export { searchVideo, channel };