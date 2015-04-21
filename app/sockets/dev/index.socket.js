var redisDb = require("redis");
//==================================================================
module.exports = function (app, config, io, socket, session) {
    var redis = redisDb.createClient(config.redis.port, config.redis.host);

    //==============================================================
    // REDIS PUBSUB
    //==============================================================

    /*
        Example of pub/sub mechanism

        redis.on("error", function (err) {
            console.log("error event - " + 
                config.redis.host + ":" + 
                config.redis.port + " - " + err);
        });

        redis.subscribe('channel');

        redis.on("message", function(channel, message) {
            socket.emit(channel, message);
        });
    */

    socket.on('disconnect', function () {
        // TODO
        console.log("Adieu!");
    });
    
};