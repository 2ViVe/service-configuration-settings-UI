define([
    "base",
    "text!modules/config/templates/configrationService.html",
    'widgets/modalWin',
    'modules/config/views/editConfigrationService'
], function (base, configrationserviceHTML, modalWin, editView) {
    
    var serviceRegitstryView = Backbone.View.extend({

        initialize: function (){
            var self = this;
            self.models = [];
            self.views = [];
            self.query();
            self.events();
            base.viewHelper.loading(self.$el);
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
                "companyName": $tds.eq(0).text()
            };
        },

        getEmptyInfo: function() {
            return {
                "name": ""
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
                        // self.query();
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
            };
            self.delModel.del("/config/configration/" + info.companyName, params);
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
            self.queryModel.fetch("/config/configration?" + params);
        },

        render: function() {
            var self = this,
                template = base._.template(configrationserviceHTML),
                modelData,
                bindData = {data: []};

            modelData = self.queryModel.toJSON();
            if(modelData.success === true){
                bindData.data = modelData.data.companys.map(function(name){
                    return {companyName: name};
                });
            }
            bindData.sectionName = "Companies";
            self.$el.html(template(bindData));
        },

        close: function() {
            base.lib.viewHelper.close(this);
        }
    });

    return serviceRegitstryView;
});