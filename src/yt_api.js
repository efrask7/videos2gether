import fetch from 'node-fetch';

const key = 'AIzaSyBZzhwBIP2RnmNUE4omdKUDb5tnI_XXib0';

/* FUNCIONES PARA PEDIR VIDEOS DE YOUTUBE CON SU API

*/

const searchVideo = (query, callback) => {

    fetch (`https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=relevance&q=${query}&type=video&videoDefinition=any&maxResults=10&key=${key}`, { 

    }).then(res => res.json())
        .then(resp => {
            return callback(resp);
        });
};

const channel = (channel_id, callback) => {
    fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channel_id}&key=${key}`, {

    }).then(res => res.json())
        .then(resp => callback(resp));
};

export { searchVideo, channel };