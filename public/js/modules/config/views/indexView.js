define([
    "base",
    'text!modules/config/templates/index.html',
    "modules/config/views/indexSidebarView",
    "modules/admin/views/logoutView"
], function (base, html, sidebarView, logoutView) {
    var $ = base.$,
        Backbone = base.Backbone,
        _ = base._,
        lib = base.lib,
        request = base.request;

    var indexView = Backbone.View.extend({
        initialize: function(){
            var self = this;
            self.views = [];
            self.render();
        },

        events: function() {
            var self = this;
            self.delegateEvents({
                "click #setting a": "openSetting"
            });
        },

        openSetting: function() {
            var self = this;
            require(['widgets/modalWin', 'modules/admin/views/settingView'], function(modalWin, settingView){

                self.win = new modalWin({
                    setting: {
                        title: "Setting",
                        hideSubmit: true
                    },
                    childView: new settingView(),
                    callback: function(event) {
                        if(event === "refreshSidebar"){
                            self.refreshSidebar();
                        }
                    }
                });
                // self.views.push(viewObj);
                // self.views.push(modalWin);
                self.win.openWin();
            });
        },

        refreshSidebar: function() {
            var self = this;
            self.sidebar.refresh();
        },

        render: function(){
            var self = this,
                sidebar,
                logout;

            self.$el.html(html);
            sidebar = new sidebarView({ el: self.$el.find("#leftSidebar") });
            self.sidebar = sidebar;
            logout = new logoutView({ el: self.$el.find("#logout") });
            self.views.push(logout);
            self.views.push(sidebar);
        },

        close: function() {
            lib.viewHelper.close(this);
        }
    });

    return indexView;
});