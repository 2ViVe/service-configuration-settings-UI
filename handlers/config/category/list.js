var jf = require('jsonfile');
var async = require('async');

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


function getResponseData(categories) {
    var resData = [];

    if(categories){
        categories.forEach(function(category) {
            resData.push({
                name: category.name,
                services: category.services.map(function (service){
                    return {
                        name: service.name
                    };
                })
            });
        });
    }

    return resData;
}

function list (req, res, next) {
    var categoryInfos;

    async.waterfall([

        function (callback) {
            getConfig(callback);
        },

        function(configObj, callback) {
            categoryInfos = getResponseData(configObj.serviceCategories);
            callback(null, categoryInfos);
        }

    ],function(error, result){
        if(error){
            next(error);
            return;
        }

        next({
            body: result
        });
    });
}

module.exports = list;
