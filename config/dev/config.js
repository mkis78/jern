module.exports = function (app) {

    return {
        https     : false,
        port      : 1887,
        //------------------------------------------------------- 
        logger : {
            format  : 'dev',
            options : {} 
        },
        //-------------------------------------------------------
        session : {
            secret  : "sjdhfgsjdhgf",
            timeout : 30, //sec
            cookie  : {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: null,
                // domain: 'yourdomain.com'
            },
            prefix    : "sess:",
            name      : "connect.sid",
            checkUser : false
        },
        //-------------------------------------------------------
        redis : {
            port    : 6379,
            host    : '127.0.0.1',
            options : {}
        },
        //-------------------------------------------------------
        view : {
            templateEngine : 'hogan',
            templateExt    : 'hjs',
            baseLayout     : 'base',
            favicon        : 'favicon.ico'
        },
        socket : {
            enabled   : true,
            namespace : 'jern'
        }
    }
};