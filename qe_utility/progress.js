var ProgressBar = require('ascii-progress');

module.exports = {
  progressBar: function(flag){
    if(flag === 'stop'){
      bar.update(1);
      bar.completed = true;
      clearInterval(a);
      return;
    }
    var bar = new ProgressBar({
      schema: '[:bar.cyan] :percent.cyan',
      filled: '=',
      blank: '-',
      total : 2400
    });
    var a = setInterval(function () {
      bar.tick();
    }, 100);
  }
};
