const tag = document.createElement('videoyt_player');

tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('video_player', {
    height: '100%',
    width: '100%',
    // videoId: 'KLuTLF3x9sA',
    playerVars: {
      'playsinline': 1,
      'enablejsapi': 1,
      'origin': window.location.origin,
      'autoplay': 1,
      'controls': 0,
      'mute': 1,
    }
  });
  window.player = player
  console.log(Object.keys(player))
}

function onPlayerReady(event) {
  // El video está listo para reproducirse
  console.log('Player ready');
}

let done = false;

function onPlayerStateChange(event) {
  // Manejar cambios de estado
  console.log('Player state changed:', event.data);
  // if (event.data == YT.PlayerState.PLAYING && !done) {
  //   setTimeout(stopVideo, 6000);
  //   done = true;
  // }
  if (event.data == YT.PlayerState.ENDED) {
    // socket.emit('finish');
    // socket.emit('currentTime', player.currentTime);
  }
}

function stopVideo() {
  console.log('Stop video')
  player.stopVideo();
}

// Exportar el player para usarlo en otros archivos
window.player = player