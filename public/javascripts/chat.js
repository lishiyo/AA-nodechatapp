(function(){

  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function(opts) {
    this.socket = opts.socket;
    this.room = 'lobby';
  }

  // transmits client to server
  Chat.prototype.sendMessage = function(message) {
    // console.log("sendMessage", message);
    this.socket.emit('message', {
      text: message,
      room: this.room
    });
  };

  Chat.prototype.processCommand = function(message){

    var reNick = /^\\nick /,
        reRoom = /^\\join /;

    if (reNick.test(message)) {
      var re = /\\nick (.+)/;
      var newNick = message.match(re)[1];
      console.log("newnick from client side: ", newNick);

      this.socket.emit('nicknameChangeRequest', {
        nickname: newNick
      });
    } else if (reRoom.test(message)) {
      var re = /\\join (.+)/,
          newRoom = message.match(re)[1];

      this.socket.emit('changeRoom', {
        newRoom: newRoom
      });

      // update reference to room
      this.room = newRoom;

    } else {
      console.log("command not recognized");
    }

  };

  // append message from server
  Chat.prototype.appendMessage = function(messageData) {

    var $newMessage = $('<li></li>'),
        message = messageData.text,
        nickname = messageData.nickname;

    var text = nickname + ": " + message;
    $newMessage.text(text);
    // append to only your room
    // var mainDiv = $main.find('.'+this.room);
    //
    // if (mainDiv.length > 0) {
    //   mainDiv.addClass('show-room').append($newMessage);
    //   console.log("mainDiv existing", mainDiv, $newMessage);
    // } else {
    //   var $newRoom = $('<ul></ul>').addClass('some-room ' + this.room + ' show-room');
    //   $newRoom.append($newMessage);
    //   $main.append($newRoom);
    //   console.log('appending message to:', $newRoom, $main, $newMessage);
    // }

    // append all to message log

    $('.main-content .messages-room').append($newMessage.clone());
    $('.messages').append($newMessage);
  };

  Chat.prototype.showAllNicknames = function(nicknames){

    var sidebar = $('.users').find('.'+this.room);
    sidebar.empty();
    console.log(nicknames);

    Object.keys(nicknames).forEach(function(key, idx){
      console.log("nickname is: ", this[key]);
      var $name = $('<li></li>').text(this[key]);
      sidebar.append($name);
    }, nicknames);
  };

  Chat.prototype.showNickname = function(data) {
    $('.top-display').text(data.message);

    if (data.success) { // display nickname in sidebar
      console.log("showNickname success");
      var msg = $('<li></li>').text(data.message);
      $('.messages-room').append(msg.clone());
      $('.messages').append(msg.clone());
    }
  };

  // data.rooms: { socket.id: 'lobby', socket.id: 'not lobby' }
  // data.nicknames: { socket.id: 'nickname' }
  Chat.prototype.showRooms = function(data) {
    // only display users for my room
    var $sidebar = $('.users');
    $sidebar.empty();

    var existingRooms = $sidebar.find('.'+this.room);

    if (existingRooms.length > 0) {
      console.log("existing!", existingRooms);
      // clear out sidebar only
      var $roomDiv = $sidebar.find($('.'+this.room)).empty();
    } else {
      var $roomDiv = $('<div></div>').addClass(this.room);
      $sidebar.append($roomDiv);
      // var mainDiv = $main.append($roomDiv).addClass('show-room');
      // console.log("attaching to $main", mainDiv);
    }

    $roomDiv.html('<h2>'+this.room+'</h2>');

    Object.keys(data.nicknames).forEach(function(key, idx){
      var nickname = data.nicknames[key];
      // console.log(key, nickname, data.rooms);
      // console.log(data.rooms[key], this.room);
      if (data.rooms[key] === this.room) {
        console.log("pushing name: ", nickname, this.room);
        var $name = $('<li></li>').text(nickname);
        $roomDiv.append($name);
      }
    }, this);

    // only display messages by users in my room

  };

})();
