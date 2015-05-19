var request = require('request');

function requestCallBack(error, response, body, callback) {
    if (error) {
        callback(error);
    }

    if (typeof body === 'string') {
        body = JSON.parse(body);
    }

    if (response.statusCode != 200) {
        error = body && body.meta && body.meta.error;
        error.statusCode = 400;
        callback(error);
        return;
    }

    callback(null, body.response);
}

function get(url, callback) {
    var reqOpts;

    reqOpts = {
        headers: APP.REQUEST_HEADER,
        url: url,
        timeout: APP.REQUEST_TIMEOUT,
        method: "GET"
    };

    request(reqOpts, function (error, response, body) {
        requestCallBack(error, response, body, callback);
    });
}

function put(url, data, callback) {
    var reqOpts;

    reqOpts = {
        headers: APP.REQUEST_HEADER,
        url: url,
        timeout: APP.REQUEST_TIMEOUT,
        method: "PUT",
        json: data
    };

    request(reqOpts, function (error, response, body) {
        requestCallBack(error, response, body, callback);
    });
}

function post(url, data, callback) {
    var reqOpts;

    reqOpts = {
        headers: APP.REQUEST_HEADER,
        url: url,
        timeout: APP.REQUEST_TIMEOUT,
        method: "POST",
        json: data
    };

    request(reqOpts, function (error, response, body) {
        requestCallBack(error, response, body, callback);
    });
}

function del(url, callback) {
    var reqOpts;

    reqOpts = {
        headers: APP.REQUEST_HEADER,
        url: url,
        timeout: APP.REQUEST_TIMEOUT,
        method: "DELETE"
    };

    request(reqOpts, function (error, response, body) {
        requestCallBack(error, response, body, callback);
    });
}




module.exports = {
    get: get,
    put: put,
    post: post,
    del: del
};