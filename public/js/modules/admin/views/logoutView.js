define([
    'base',
    'models/request'
], function (base, requestModel) {

    var logoutView = base.Backbone.View.extend({
        
        initialize: function() {
            var self = this;
            self.models = [];
            self.logoutModel = new base.request();
            self.models.push(self.logoutModel);
            self.listenTo(self.logoutModel, "post", self.afterLogout);
            self.events();
        },

        events: function() {
            var self = this;

            self.delegateEvents({
                "click a": 'logout'
            });
        },

        afterLogout: function() {
            var self = this,
                res;
            res = self.logoutModel.toJSON();
            if(res.success === true){
                Router.setParams(
                    [
                        {Name: 'module', Value: 'admin'},
                        {Name:"page",Value:"login"}
                    ],
                    [],
                    true
                );
                window.location = '/';
            } else{
                alert("logout failed.");
            }
        },

        logout: function() {
            var self = this;
            self.logoutModel.post("/admin/logout");
        },

        close: function(){
            console.log("===================================================");
            base.viewHelper.close(this);
        }

    });

    return logoutView;
});