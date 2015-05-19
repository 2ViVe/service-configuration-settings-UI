var async = require('async');

function getPostData(req) {
    var postData;
    postData = {
        userName: req.body.userName,
        pwd: req.body.pwd
    };
    return postData;
}

function validateAccount(req, accountInfo, callback) {
    var userName,
        pwd,
        error;

    userName = req.body['userName'];
    pwd = req.body['pwd'];

    if(userName === 'abovegem' && pwd === 'abovegem1234'){
    // if(userName === '' && pwd === ''){
        req.session.isLogin = true;
        callback(null);
    }
    else {
        error = new Error("login failed.");
        error.statusCode = 400;
        req.session.isLogin = false;
        callback(error);
    }
}

function post (req, res, next) {
    var postData,
        error;

    async.waterfall([
        function(callback) {
            postData = getPostData(req);
            callback(null);
        },

        function(callback) {
            validateAccount(req, postData, callback);
        },

    ], function(error) {
        if(error){
            next(error);
            return;
        }

        next({
            body: {
                success: true
            }
        });
    });
}

module.exports = post;