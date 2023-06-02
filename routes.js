'use strict';


var path = require('path');

module.exports = function(app){
    // ANALYTICS USAGE

    app.use('/api/user', require('./api/user'));
    app.use('/api/coach', require('./api/coach'));
    app.use('/api/admin/aws', require('./api/admin/aws'));


    app.route('/*')
        .get(function(req, res) {
            // Commented path is for angular 6 build post production
            res.sendFile(path.resolve( __dirname + '/dist/App/index.html'));
            // res.sendFile(path.resolve( __dirname + '/index.html'));
        });

}
