define([
    'jquery',
    'backbone',
    'underscore',
    'lib/index',
    'text!modules/admin/templates/login.html',
    'models/request'
], function ($, Backbone, _, lib, html, requestModel) {

    var loginView = Backbone.View.extend({
        initialize: function() {
            var self = this;
            self.loginModel = new requestModel();
            self.listenTo(self.loginModel, "post", self.afterLogin);
            self.render();
            self.delegateEvents({
                "click #btnLogin": "login",
            });
        },

        validateAccount: function (accountInfo){

        },

        login: function(){
            var self = this,
            userName,
            pwd;

            accountInfo = Object.create(null);
            accountInfo.userName = self.$el.find("#inputAccount").val();
            accountInfo.pwd = self.$el.find("#inputPassword").val();
            self.validateAccount(accountInfo);
            self.loginModel.set(accountInfo);
            self.loginModel.post('/admin/login');
        },

        afterLogin: function() {
            var self = this,
                isSuccess = self.loginModel.get("success");
            if(isSuccess === true){
                Router.setParams(
                    [
                        {Name: 'module', Value: 'config'},
                        {Name: "page", Value: "index"}
                    ],
                    [],
                    true
                );
            } else {
                alert('failed');
            }
        },

        render: function() {
            var self = this;
            self.$el.html(html);
        },

        close: function() {
            lib.viewHelper.close(this);
        }
    });

    return loginView;
});