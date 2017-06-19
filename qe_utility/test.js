var isOnline = require('is-online');

isOnline().then(function(online){
    console.log(online);
    //=> true
});
