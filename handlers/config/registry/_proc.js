var u = require('underscore');
var async = require('async');
var requestHelper = require("../../../utils/request");
var logger;

function getServiceInfo(req, categories) {
    var resData = [],
        category,
        categoryName,
        serviceName,
        service = null;

    categoryName = req.query.categoryName;
    serviceName = req.query.serviceName;
    if(categories) {
        category = u.find(categories, function(category) {
            return category.name == categoryName;
        });
        service = u.find(category.services, function (service){
            return service.name == serviceName;
        });
    }

    logger.debug("get service info:" + JSON.stringify(service));
    return service;
}

function getData(serviceInfo, callback) {
    var url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config";

    logger.debug("request url is:", url);
    requestHelper.get(url, callback);
}

function getQueryData(req) {
    return {
        "name": req.body['name'],
        "host": req.body['host'],
        "port": req.body['port'],
        "api-uri": req.body['api-uri'],
        "status-uri": req.body['status-uri']
    };
}

function updateService(req, serviceInfo, callback) {
    var putData,
        url;

    putData = getQueryData(req);
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config";
    logger.debug("request url is:", url);
    requestHelper.put(url, putData, callback);
}

function addService(req, serviceInfo, callback) {
     var postData,
        url;

    postData = getQueryData(req);
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config";
    logger.debug("request url is:", url);
    requestHelper.post(url, postData, callback);
}

function delService(req, serviceInfo, callback) {
    var url,
        name;

    name = req.query.name;
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config?name=" + name;
    logger.debug("request url is:", url);
    requestHelper.del(url, callback);
}

function list (req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            getData(serviceInfo, callback);
        }
    ], function(error, data) {
        if(error) {
            next(error);
            return;
        }

        next({
            body: data
        });
    });
}

function put (req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            updateService(req, serviceInfo, callback);
        }
    ], function(error, data){
        if(error) {
            next(error);
            return;
        }

        next({
            body: data
        });
    });
}

function post(req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            addService(req, serviceInfo, callback);
        }
    ], function(error, data){
        if(error) {
            next(error);
            return;
        }

        next({
            body: data
        });
    });
}

function del(req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            delService(req, serviceInfo, callback);
        }
    ], function(error, data){
        if(error) {
            next(error);
            return;
        }

        next({
            body: data
        });
    });
}

module.exports = {
    list: list,
    put: put,
    post: post,
    del: del
};
