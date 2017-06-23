var ProgressBar = require('ascii-progress');

// var bar = new ProgressBar({
//     schema: '[:bar.cyan] :percent.cyan',
//     filled: '=',
//     blank: '-',
//     total : 2400
// });
//
// var iv = setInterval(function () {
//   bar.tick();
//   if (bar.completed) {
//     clearInterval(iv);
//   }
// }, 100);

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
