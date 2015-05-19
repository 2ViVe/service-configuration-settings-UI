define([
'jquery',
'underscore',
'backbone',
], function ($, _, Backbone) {

    var requestModel = Backbone.Model.extend({

    defaults: {
        data: null,
        status: null,
    },

    httpMethod: "",

    initialize: function (attrs, opts) {
        var self = this;
        self.on('sync', self.syncModel, self);
    },

    syncModel: function (md, resp, opts) {
        var self = this;

        self.trigger(self.httpMethod, self);
        self.httpMethod = "";
    },

    url: function (url) {
        var self = this;
        if(!!url){
            self.serviceUrl = url;
        }
        return self.serviceUrl;
    },

    fetch: function (url, params) {
        var self = this;

        if(params){
            url = url + "?" + $.param(params);
        }
        self.url(url);
        self.httpMethod = 'get';
        Backbone.Model.prototype.fetch.call(self, {}, {
            error: function (model, response) {
                self.requestError(model, response);
            }
        });
    },

    post: function(url) {
        var self = this;

        self.url(url);
        self.httpMethod = 'post';
        Backbone.Model.prototype.save.call(self, {}, {
            error: function (model, response) {
                self.requestError(model, response);
            }
        });
    },

    put: function(url) {
        var self = this;

        self.url(url);
        self.httpMethod = 'put';
        if(!self.get("id")){
            self.set("id", "xxxxxx");
        }
        Backbone.Model.prototype.save.call(self, {}, {
            error: function (model, response) {
                self.requestError(model, response);
            }
        });
    },

    del: function(url, params) {
        var self = this;

        if(params){
            url = url + "?" + $.param(params);
        }
        self.url(url);
        self.httpMethod = 'delete';
        if(!self.get("id")){
            self.set("id", "xxxxxx");
        }
        Backbone.Model.prototype.destroy.call(self, {
            error: function (model, response) {
                alert('error.');
                self.requestError(model, response);
            },
            success: function (model, response) {
               self.set(self.parse(response));
            }
        });
    },

    requestError: function(model, response) {
        var self = this;

        console.log(JSON.stringify(response));
        self.trigger(self.httpMethod);
        self.httpMethod = "";
    },

    parse: function(res, options) {
        var msg = {
            success: false,
            statusCode: 400,
            data: null
        };

        if(!!res){
            if(res.meta.code != 200){
                msg.success = false;
            }
            else{
                msg.success = true;
            }
            msg.statusCode = res.meta.code;
            msg.data = res.response;
        }
        return msg;
    }
 });

    return requestModel;
});
