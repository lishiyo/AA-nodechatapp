var socket = io();
var chat = new ChatApp.Chat({
  socket: socket
});

var sendAll = function(message){
  var re = /^\\/;
  if (re.test(message)) {
    chat.processCommand(message);
  } else {
    chat.sendMessage(message);
  }

};

var displayMessage = function(message) {
  $('form.input-message').find('input#message').val('');
  $('.top-display').empty().append(message);
};

var getMessage = function(form){
  var messageText = $(form).find("input").val();

  displayMessage(messageText);
  sendAll(messageText);
};


$(function(){

  $('form.input-message').on('submit', function(e){
    e.preventDefault();
    getMessage(this);
  });

  // data === { 'text': "text", 'nickname': 'some nick'}
  socket.on("message", function (data) {
    console.log("connected", data);

    chat.appendMessage(data);

  });

  // someone typed in /nick
  socket.on("nicknameChangeResult", function(data){
    console.log("nicknameChangeResult", data);
    chat.showNickname(data);
    chat.showRooms(data);
    // chat.showAllNicknames(data.nicknames);
  });
  //
  // socket.on("allNicknames", function(data) {
  //   console.log("allNicknames", data);
  //   chat.showAllNicknames(data);
  // });

  socket.on('roomList', function(data){
    console.log("roomList", data);
    chat.showRooms(data);
  });

  socket.on('updateRoomList', function(data){
    $('.messages-room').empty();
    var oldRoom = $('.users').find('.'+data.oldRoom);
    console.log(oldRoom);

    $("."+data.oldRoom+" li:contains("+data.nickname+")").remove();
    chat.showRooms(data);
  });

});
