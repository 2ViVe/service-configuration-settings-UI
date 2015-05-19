define([
    'base',
    'text!modules/admin/templates/setting.html',
    'modules/admin/views/editSettingView'
], function (base, html, editSettingView) {

    var seetingView = base.Backbone.View.extend({
        
        initialize: function() {
            var self = this;
            self.models = [];
            self.category = '';
            base.lib.viewHelper.loading(self.$el);
        },

        preRender: function() {
            var self = this;
            self.categoryModel = new base.request();
            self.models.push(self.categoryModel);
            self.listenTo(self.categoryModel, 'get', self.afterGetCatogories);
            self.categoryModel.fetch("/setting" );
        },

        afterGetCatogories: function(){
            var self = this,
                modelObj;

            modelObj = self.categoryModel.toJSON();
            if(modelObj.success === true){
                self.category = modelObj.data[0];
                self.prebindTable();
            }
            else{
                alert('get categories failed.');
            }
        },

        rebindList: function(event){
            var self = this,
                $target = $(event.target),
                category;

            category = $target.text();
            if(category !== self.category){
                self.category = category;
                self.prebindTable();
            }
        },

        prebindTable: function(){
            var self = this,
                modelObj;

            if(!self.serviceModel){
                self.serviceModel = new base.request();
                self.models.push(self.serviceModel);
                self.listenTo(self.serviceModel, 'get', function(){
                    modelObj = self.serviceModel.toJSON();
                    if(modelObj.success === true){
                        self.render();
                    } else{
                        alert('failed');
                    }
                });
            }
            self.serviceModel.fetch("/setting/" + self.category);
        },

        render: function() {
            var self = this,
                serviceData,
                categoryData,
                pageData,
                template;

            serviceData = self.serviceModel.toJSON();
            categoryData = self.categoryModel.toJSON();
            pageData = {
                category: self.category,
                services: serviceData.data.services,
                categories: categoryData.data
            };
            template = base._.template(html);
            self.$el.html(template({data: pageData}));
            self.registEvents();
        },

        registEvents: function() {
            var self = this;

            if(!self.isFirstBindEvent){
                self.delegateEvents({
                    "click #listTable button": 'clickA',
                    "click #ulCategoriesList a": 'rebindList',
                    "click #btnAdd ": 'add'
                });
                self.isFirstBindEvent = true;
            }
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

        getRowData: function($btn) {
            $tds = $btn.parent().siblings();
            return {
                "name": $tds.eq(0).text(),
                "ip": $tds.eq(1).text(),
                "port": $tds.eq(2).text()
            };
        },

        getEmptyData: function() {
            return {
                "name": "",
                "ip": "",
                "port": ""
            };
        },

        showTableList: function(refresh){
            var self = this;
            self.$el.find("#settingList").show();
            if(refresh && refresh === true){
                self.prebindTable();
            }
        },

        hideTableList: function(){
            var self = this;
            self.$el.find("#settingList").hide();
        },

        add: function(){
            var self = this,
                rowData,
                options;

            rowData = self.getEmptyData();
            if(self.editView){
                self.editView.close();
            }

            options = {
                "name": rowData.name,
                "ip": rowData.ip,
                "port": rowData.port,
                "parent": self,
                "workMode": "post",
                "category": self.category
            };
            base._.extend(options, {el: "#settingEdit"});
            self.$el.find("#settingEdit").show();
            self.editView = new editSettingView(options);
        },

        edit: function ($target) {
            var self = this,
                rowData,
                options;

            rowData = self.getRowData($target);
            if(self.editView){
                self.editView.close();
            }

            options = {
                "name": rowData.name,
                "ip": rowData.ip,
                "port": rowData.port,
                "parent": self,
                "workMode": "put",
                "category": self.category
            };
            base._.extend(options, {el: "#settingEdit"});
            self.$el.find("#settingEdit").show();
            self.editView = new editSettingView(options);
        },

        del: function($target) {
            var self = this,
                rowData,
                url;

            rowData = self.getRowData($target);
            if(!confirm('Are you sure to delete ' + rowData.name)){
                return;
            }

            if(!self.delModel){
                self.delModel = new base.request();
                self.listenTo(self.delModel, 'delete', self.afterDel);
                self.models.push(self.delModel);
            }
            url = "/setting/" + self.category + "/" + rowData.name;
            self.delModel.del(url);
        },

        afterDel: function() {
            var self = this,
                modelObj;

            modelObj = self.delModel.toJSON();
            if(modelObj.success === true){
                self.prebindTable();
                self.parent.options.callback("refreshSidebar");
            }
            else{
                alert('failed.');
            }
        },

        callbackRefresh: function(event){
            var self = this;
            self.parent.options.callback(event);
        },

        interfaceSubmit: function() {
        },

        interfaceShow: function (){
            var self = this;
            self.preRender();
        },

        close: function(){
            base.lib.viewHelper.close(this);
        }

    });

    return seetingView;
});