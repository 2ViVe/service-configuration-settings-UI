define([
    "base",
    "text!modules/config/templates/serviceRegistry.html",
    'widgets/modalWin',
    'modules/config/views/editServiceRegistryView'
], function (base, serviceRegistryHtml, modalWin, editView) {
    
    var serviceRegitstryView = Backbone.View.extend({

        initialize: function (){
            var self = this;
            self.models = [];
            self.views = [];
            self.query();
            self.events();
            base.lib.viewHelper.loading(self.$el);
        },

        events: function() {
            var self = this;
            self.delegateEvents({
                "click #listTable button": "clickA",
                "click #btnAdd":  "add"
            });
        },

        clickA: function(event) {
            var self = this,
                text;
            $target = base.$(event.target);
            text = $target.text();
            if(text === "Edit"){
                self.edit($target);
            }
            else if(text === "Delete"){
                self.del($target);
            }
        },

        getRowInfo: function($btn) {
            $tds = $btn.parent().siblings();
            return {
                "name": $tds.eq(0).text(),
                "host": $tds.eq(1).text(),
                "port": $tds.eq(2).text(),
                "api-uri": $tds.eq(3).text(),
                "status-uri": $tds.eq(4).text()
            };
        },

        getEmptyInfo: function() {
            return {
                "name": "",
                "host": "",
                "port": "",
                "api-uri": "",
                "status-uri": ""
            };
        },

        add:function() {
            var self = this;

            info = self.getEmptyInfo();
            info = base._.extend(info, {
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName,
                workMode: 'post'
            });
            self.addWin = new modalWin({
                setting: {
                    title: "Add"
                },
                childView: new editView(info),
                callback: function(event) {
                    if(event === "ok"){
                        self.query();
                    }
                }
            });
            self.addWin.openWin();
        },

        edit: function($button) {
            var self = this,
                info;
            
            info = self.getRowInfo($button);
            info = base._.extend(info, {
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName,
                workMode: 'put'
            });
            self.editWin = new modalWin({
                setting: {
                    title: "Edit"
                },
                childView: new editView(info),
                callback: function(event) {
                    if(event === "ok"){
                        self.query();
                    }
                }
            });
            self.editWin.openWin();
        },

        del: function($button) {
            var self = this,
                info,
                params;

            if(!confirm("Are you sure to delete?")){
                return;
            }
            info = self.getRowInfo($button);
            if(!self.delModel){
                self.delModel = new base.request();
                self.models.push(self.delModel);
                self.listenTo(self.delModel, 'delete', self.afterDel);
            }

            params = {
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName,
                name: info.name
            };
            self.delModel.del("/config/registry", params);
        },

        afterDel: function() {
            var self = this,
                requestModel;

            resData = self.delModel.toJSON();
            if(resData.success === true){
                self.query();
            }
            else{
                alert("failed");
            }
        },

        query: function () {
            var self = this,
                params;

            self.queryModel = self.queryModel || new base.request();
            self.models.push(self.queryModel);
            self.listenTo(self.queryModel, "get", self.render);
            params = base.$.param({
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName
            });
            self.queryModel.fetch("/config/registry?" + params);
        },

        render: function() {
            var self = this,
                template = base._.template(serviceRegistryHtml),
                modelData,
                bindData = {data: {}};

            modelData = self.queryModel.toJSON();
            if(modelData.success === true){
                bindData.data = modelData.data;
            }
            bindData.sectionName = "Service Registry";
            self.$el.html(template(bindData));
        },

        close: function() {
            base.lib.viewHelper.close(this);
        }
    });

    return serviceRegitstryView;
});