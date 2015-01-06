(function(){

  var NicknameManager = function(opts) {
    this.socket = opts.socket;
    this.room = opts.room;
  }


  exports.NicknameManager = NicknameManager;
})();
