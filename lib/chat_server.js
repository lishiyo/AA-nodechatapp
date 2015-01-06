// separate the logic for the socket.io server into a chat_server.js file.

var io = require('socket.io');

var guestnumber = 1,
    nicknames = {}; // socket.id property is key

var nicknameChangeHandler = function(socket, io) {
  socket.on('nicknameChangeRequest', function(nicknameData) {
    // nickname cannot be taken already
    // and cannot match guest123
    var nickname = nicknameData.nickname;
    checkValidNickname(socket, io, nickname);

  });

};

var checkValidNickname = function(socket, io, nickname) {

  if (!notInNicknames(nickname)) {
    console.log("in nicknames", nickname);
    socket.emit('nicknameChangeResult', {
      success: false,
      message: 'Name has already been taken',
      nicknames: nicknames
    });
  } else if (!notMatchGuest(nickname)) {
    console.log("matched guest", nickname);
    socket.emit('nicknameChangeResult', {
      success: false,
      message: 'Name cannot be of form "guest_"',
      nicknames: nicknames
    });
  } else {
    var successMsg = 'your new nickname is ' + nickname;
    console.log(successMsg);
    // reset new nickname in nicknames hash

    nicknames[socket.id] = nickname;
    // need to emit to everyone
    io.emit('nicknameChangeResult', {
      success: true,
      message: successMsg,
      nickname: nickname,
      nicknames: nicknames
    });

  }

};

var notInNicknames = function(nick) {
  var nns = Object.keys(nicknames);
  return nns.every(function(nickname, idx, nns) {
    return nickname !== nick;
  });
}

var notMatchGuest = function(nick) {
  var re = /guest_\d*/
  return !(re.test(nick));
}

var createGuestNick = function(socket, io) {
  guestnumber += 1;
  var tempNick = 'guest_' + guestnumber;
  console.log("called createGuestNick", tempNick);

  if (notInNicknames(tempNick)) {
    nicknames[socket.id] = tempNick;
    var successMsg = 'your guest nickname is: ' + tempNick;
    console.log(successMsg, nicknames);

    socket.emit('nicknameChangeResult', {
      success: false,
      message: successMsg,
      nickname: tempNick,
      nicknames: nicknames
    });
  }
}

var handleMessages = function(socket, io) {
  socket.on('message', function(msgData) {
    console.log(msgData);

    // check if text === /nick command
    var reNick = /^\\nick /;
    if (reNick.test(msgData.text)) {
      // var newNick = msgData.text.slice(6);
      var re = /\\nick (.+)/
      var newNick = msgData.text.match(re)[1];
      console.log("newnick:", newNick);

      checkValidNickname(socket, io, newNick);
    }

    // add nickname to msgData
    msgData['nickname'] = nicknames[socket.id];
    // send message to all sockets
    io.emit('message', msgData);
  });
};

var handleDisconnect = function(socket, io) {
  socket.on('disconnect', function(){
    var msgData = {
      nickname: nicknames[socket.id],
      text: "has left the room."
    }

    delete nicknames[socket.id];

    io.emit('message', msgData);
  });

};

function createChat(server){
  io = io(server); // capture to avoid creating new server

  io.on('connection', function(socket) {

    handleMessages(socket, io);
    // handle nickname change req
    createGuestNick(socket, io);
    nicknameChangeHandler(socket, io);
    handleDisconnect(socket, io);

    io.emit('allNicknames', nicknames);
  });


}


exports.createChat = createChat;
