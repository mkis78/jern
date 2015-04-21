//=============================================================
module.exports = function (app, config) {

    app.use(function (req, res, next) {
        
        res.locals.partials = {layout: "layout/base"};
        res.locals.title    = "AppKing";
        
        next();
    });

};