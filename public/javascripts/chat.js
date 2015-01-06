(function(){

  if (typeof ChatApp === "undefined") {
    window.ChatApp = {};
  }

  var Chat = ChatApp.Chat = function(opts) {
    this.socket = opts.socket;
  }

  // transmits client to server
  Chat.prototype.sendMessage = function(message) {
    // console.log("sendMessage", message);
    this.socket.emit('message', { text: message } );
  };


  Chat.prototype.processCommand = function(message){

    var reNick = /^\\nick /;
    if (reNick.test(message)) {
      var re = /\\nick (.+)/;
      var newNick = message.match(re)[1];
      console.log("newnick from client side: ", newNick);

      this.socket.emit('nicknameChangeRequest', {
        nickname: newNick
      });
    } else {
      console.log("command not recognized");
    }
    
  };


  // append message from server
  Chat.prototype.appendMessage = function(messageData) {
    // console.log("appendMessage", messageData);
    var $newMessage = $('<li></li>'),
        message = messageData.text,
        nickname = messageData.nickname;
    var text = nickname + ": " + message;
    $newMessage.text(text);
    $('section.messages').append($newMessage);
  };

  Chat.prototype.showAllNicknames = function(nicknames){
    var sidebar = $('.users');
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
      $('section.messages').append($('<li></li>').text(data.message));

    }
  };

})();
