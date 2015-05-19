var fs = require('fs');
var path = require('path');
var jf = require('jsonfile');
var u = require('underscore');
var async = require("async");
var logger = null;

function getConfig (callback) {
    jf.readFile(APP.CONFIG_NAME, function(error, configObj) {
        var services = [];

        if(error){
            callback(error);
            return;
        }

        callback(null, configObj);
    });
}

function getServices (categoryName, configObj) {
    var categoryConfig;

    categoryConfig = u.find(configObj.serviceCategories, function(category){
        return category.name === categoryName;
    });
    
    return  categoryConfig ? categoryConfig.services : [];
}

function getCategory (categoryName, configObj) {
    var categoryConfig;

    categoryConfig = u.find(configObj.serviceCategories, function(category){
        return category.name === categoryName;
    });
    return categoryConfig;
}

function isExistService (categoryServices, serviceName) {
    var error,
        targetService;

    targetService = u.find(categoryServices, function(service){
        return service.name === serviceName;
    });

    return targetService ? true : false;
}

function validatePostData (postData, callback) {
    callback(null);
}

function getPostData (req) {
    return {
        name: req.body['name'],
        ip: req.body['ip'],
        port: req.body['port']
    };
}

function updateConfigFile (configObj, callback) {
    jf.spaces = 2;
    jf.writeFile(APP.CONFIG_NAME, configObj, function(error) {
        if(error){
            callback(error);
            return;
        }
        callback(null);
    });
}

function list(req, res, next) {
    var category,
        configObj,
        categoryServices;

    logger = req.context.logger;
    category = req.params.category;

    async.waterfall([

        function(callback) {
            getConfig(callback);
        },

        function(data, callback) {
            configObj = data;
            categoryServices = getServices(category, configObj);
            callback(null, categoryServices);
        }
    ], function(error, result){
        if(error) {
            next(error);
            return;
        }

        next({
            body: {
                services: result
            }
        });
    });
}


function post(req, res, next) {
    var postData,
        error,
        category,
        categoryServices,
        configObj;

    logger = req.context.logger;
    category = req.params.category;
    async.waterfall([

        function(callback){
            postData = getPostData(req);
            validatePostData(postData, callback);
        },

        function(callback){
            getConfig(callback);
        },

        function(data, callback) {
            configObj = data;
            categoryServices = getServices(category, configObj);
            if(isExistService(categoryServices, postData.name)){
                error = new Error('duplicate service name.');
                error.statusCode = 400;
                callback(error);
                return;
            }
            callback(null);
        },

        function(callback) {
            categoryServices.push(postData);
            updateConfigFile(configObj, callback);
        }
    ],function(error, result){
        if(error) {
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


function del(req, res, next) {
    var category,
        serviceName,
        configObj,
        categoryServices,
        categoryConfig;

    category = req.params.category;
    serviceName = req.params.serviceName;
    logger = req.context.logger;
    async.waterfall([

        function(callback) {
            getConfig(callback);
        },

        function(data, callback){
            configObj = data;
            categoryConfig = getCategory(category, configObj);
            categoryServices = categoryConfig.services;
            if(!isExistService(categoryServices, serviceName)){
                error = new Error("not exist.");
                error.statusCode = 400;
                callback(error);
                return;
            }
            callback(null);
        },

        function(callback) {
            categoryServices = u.filter(categoryServices, function(service){
                return service.name !== serviceName;
            });
            categoryConfig.services = categoryServices;
            updateConfigFile(configObj, callback);
        }

    ], function(error){
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

function put(req, res, next) {
    var postData,
        category,
        serviceName,
        configObj,
        categoryServices;

    category = req.params.category;
    serviceName = req.params.serviceName;
    logger = req.context.logger;
    async.waterfall([

        function(callback){
            postData = getPostData(req);
            validatePostData(postData, callback);
        },

        function(callback) {
            getConfig(callback);
        },

        function(data, callback){
            configObj = data;
            categoryServices = getServices(category, configObj);
            if(!isExistService(categoryServices, serviceName)){
                error = new Error("not exist.");
                error.statusCode = 400;
                callback(error);
                return;
            }
            callback(null);
        },

        function(callback) {
            service = u.find(categoryServices, function(service){
                return service.name === serviceName;
            });
            u.extend(service, postData);
            updateConfigFile(configObj, callback);
        }

    ],function(error){
        if(error) {
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

function get(req, res, next) {
    var service,
        category,
        serviceName,
        configObj,
        categoryServices;

    category = req.params.category;
    serviceName = req.params.serviceName;
    logger = req.context.logger;
    async.waterfall([

        function(callback) {
            getConfig(callback);
        },

        function(data, callback){
            configObj = data;
            categoryServices = getServices(category, configObj);
            service = u.find(categoryServices, function(service){
                return service.name === serviceName;
            });
            callback(null, service);
        }

    ],function(error, result){
        if(error) {
            next(error);
            return;
        }

        next({
            body: {
                service: result
            }
        });
    });
}

function categoryList (req, res, next) {
    var categories;

    async.waterfall([

        function(callback) {
            getConfig(callback);
        },

        function(configObj, callback) {
            categories = configObj.serviceCategories.map(function(category){
                return category.name;
            });
            callback(null, categories);
        }

    ], function(error, result){
        if(error) {
            next(error);
            return;
        }

        next({
            body: categories
        });
    });
}

module.exports = {
    list: list,
    del: del,
    post: post,
    put: put,
    get: get,
    categoryList: categoryList
};

