// leaving page before leaving
var areYouReallySure = false;
function areYouSure() {
    if(allowPrompt){
        if (!areYouReallySure && true) {
            areYouReallySure = true;
            var confMessage = "Do you want to leave meating??";
            return confMessage;
        }
    }else{
        allowPrompt = true;
    }
}

var allowPrompt = true;
window.onbeforeunload = areYouSure;

let username = "";

// modal script

const __modal_init = () => {
  let val = document.getElementById("username_input").value;
  if( val.length < 5||val.length >8 ) alert("Name must be greate than 5 and less than 8 chracter");
  else{
    username = val;
    let element = document.getElementById("modal");
    element.setAttribute("style", "display: none;");
    console.log(username);
    let user = document.getElementById("enter_username");
    let text = document.createTextNode(username);
    user.appendChild(text);
    let room = document.getElementById("enter_roomId");
    text = document.createTextNode(ROOM_ID);
    room.appendChild(text);
 
  }
}

let sender_name = "";

const __hide_chat_window = () =>
{
  var element = document.getElementById("chat_window");
if(element.style.display === "none"){
    element.style.display = "flex";
}else{
    element.style.display = "none";
}
}

const __show_info = () =>
{
  var element = document.getElementById("info_modal");
  element.setAttribute("style", "display: flex;");
}

const __close_info_modal = () =>
{
  var element = document.getElementById("info_modal");
  element.setAttribute("style", "display: none;");
}


const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })


socket.on('catch-sender-name', send_user =>
{
  sender_name = send_user;
});

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  });

  socket.on("createMessage", message => {
    $("ul").append(`
      <div class="message-frame">
                  <span class="message-username">${sender_name}</span>
                  <span class="message-body-msg">${message}
                  </span>
               </div>`
      );
    scrollToBottom()
  })
})


const __send_message = () =>
{
  let val = document.getElementById("chat_message").value;
  if(val.length > 0)
  {
      socket.emit('sender-name',username);
      socket.emit('message',val);   
      val = "";
      sender_name = "";
  }
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}


