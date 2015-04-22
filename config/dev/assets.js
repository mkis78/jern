//=============================================================
module.exports = function (app, config) {

    app.use(function (req, res, next) {
        
        res.locals.assets = {
            base : {
                css : [
                    {file: "/bootstrap/css/cosmo.css"},
                    {file: "/bootstrap/css/font-awesome.min.css"},
                    {file: "/css/app.css"}
                ],
                js  : [
                    {file: "/bootstrap/js/jquery.min.js"},
                    {file: "/bootstrap/js/bootstrap.min.js"},
                    {file: "/bootstrap/js/socket.io.js"},
                    {file: "/js/app.js"}
                ]
            },
            error : {
                css : [
                    {file: "/bootstrap/css/cyborg.css"},
                    {file: "/bootstrap/css/font-awesome.min.css"},
                    {file: "/css/app.css"}
                ],
                js  : []
            }
        };
        
        next();
    });

};