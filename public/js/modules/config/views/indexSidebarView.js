define([
    'base',
    'text!modules/config/templates/sidebar.html'
], function (base, sidebarHtml) {
    var $ = base.$,
        Backbone = base.Backbone,
        _ = base._,
        lib = base.lib,
        request = base.request,
        Router = base.Router;

    var indexView = Backbone.View.extend({

        initialize: function(){
            var self = this;
            self.models = [];
            self.requestModel = new request();
            self.listenTo(self.requestModel, "get", self.afterGetCategories);
            self.models.push(self.requestModel);
            self.requestModel.fetch("/config/category");
            self.events();
            // base.lib.viewHelper.loading(self.$el);
        },

        events : function () {
            var self = this;
            self.delegateEvents({
                "click #config-list li": "choice",
            });
        },

        refresh: function(){
            var self = this;
            self.requestModel.fetch("/config/category");
        },

        render: function(data) {
            var self = this,
                sidebar,
                firstA;

            sidebarTemplate = _.template(sidebarHtml);
            self.$el.html(sidebarTemplate({data: data}));
            firstA = self.$el.find("#collapse0 a").eq(0);
            if(firstA){
                firstA.click();
            }
        },

        choice: function(event) {
            var self = this,
                liObj,
                category,
                $target;
            $target = $(event.target);
            base.$.find("#leftSidebar .nav-sidebar li").forEach(function(ele){
                $(ele).attr('class', '');
            });
            $target.parent().attr('class', 'active');
            liObj = $target.parent();
            category = liObj.attr("category");
            serviceName = $target.text();
            Router.setParams(
                [
                    {Name: 'category', Value: category},
                    {Name: "name", Value: serviceName}
                ],
                [],
                false
            );
        },

        afterGetCategories: function() {
            var self = this,
                modelData = self.requestModel.toJSON(),
                isSuccess;

            isSuccess = modelData.success;
            if(isSuccess === true){
                
                self.render(modelData.data);
            }
        },

        close: function() {
            lib.viewHelper.close(this);
        }
    });

    return indexView;
});