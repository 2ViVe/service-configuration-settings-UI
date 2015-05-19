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

function getCompanys(serviceInfo, callback) {
    var url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config";

    logger.debug("request url is:", url);
    requestHelper.get(url, callback);
}

function getQueryData(req) {
    return {
        "companyName": req.body['companyName'],
        "configObj": req.body['config']
    };
}

function updateConfig(req, serviceInfo, callback) {
    var putData,
        url;

    putData = getQueryData(req);
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config/" + req.params.companyName;
    logger.debug("request url is:", url);
    requestHelper.put(url, putData, callback);
}

function addConfig(req, serviceInfo, callback) {
     var postData,
        url;

    postData = getQueryData(req);
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config/" + req.params.companyName;
    logger.debug("request url is:", url);
    requestHelper.post(url, postData, callback);
}

function delConfig(req, serviceInfo, callback) {
    var url,
        companyName;

    companyName = req.params.companyName;
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config/" + companyName;
    logger.debug("request url is:", url);
    requestHelper.del(url, callback);
}

function getCompanyConfig(req, serviceInfo, callback) {
    var url,
        companyName;

    companyName = req.params.companyName;
    url = "http://" + serviceInfo.ip + ":" + serviceInfo.port + "/v1/admin/config/" + companyName;
    logger.debug("request url is:", url);
    requestHelper.get(url, callback);
}

function get(req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            getCompanyConfig(req, serviceInfo, callback);
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

function list (req, res, next) {
    var categories = req.context.serviceCategories,
        serviceInfo;

    logger = req.context.logger;
    serviceInfo = getServiceInfo(req, categories);

    async.waterfall([
        function(callback) {
            getCompanys(serviceInfo, callback);
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
            updateConfig(req, serviceInfo, callback);
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
            addConfig(req, serviceInfo, callback);
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
            delConfig(req, serviceInfo, callback);
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
    del: del,
    get: get
};
