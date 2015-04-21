module.exports = function (app) {

    app.get("/", function (req, res) {
        res.render("home");
    });

    app.get("/test", function (req, res) {
        res.render("test.jade");
    });

};