define([
    "base",
    "text!modules/config/templates/editConfigration.html",
    'base/jsoneditor.min'
], function (base, html, jsonEditor) {

   var editView = base.Backbone.View.extend({
        initialize: function() {
            var self = this;

            self.workMode = self.options.workMode || 'put';
            self.models = [];
            self.requsetModel = new base.request();
            self.models.push(self.requsetModel);

            if(self.workMode === "put"){
                self.listenTo(self.requsetModel, 'put', self.afterEdit);
            } else{
                self.listenTo(self.requsetModel, 'post', self.afterEdit);
            }
            base.viewHelper.loading(self.$el);
        },

        getData: function() {
            var self = this;
            return {
                "companyName": self.$el.find("#modal-company-name").val().trim(),
                'config': self.jsonEditor.get()
            };
        },

        afterEdit: function() {
            var self = this,
                requsetModel;

            requsetModel = self.requsetModel.toJSON();
            if(requsetModel.success === true){
                self.parent.close("ok");
            }
            else{
                console.log(JSON.stringify(requsetModel));
                alert("error.");
            }
        },

        interfaceSubmit: function() {
            var self = this;
            //emit validation
            self.$el.find("#editForm").data('formValidation').validate();
        },

        getCompanyName: function(){
            var self = this;

            if(self.workMode === "put"){
                return self.options["companyName"];
            } else if(self.workMode === "post"){
                return self.getData().companyName;
            }
        },

        afterValidate: function() {
            var self = this,
                info,
                url,
                companyName;

            info = self.getData();
            self.requsetModel.set(info);

            url = "/config/configration/"+ self.getCompanyName() + "?" + base.$.param({
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName
            });
            if(self.workMode === "put"){
                self.requsetModel.put(url);
            } else{
                self.requsetModel.post(url);
            }
        },

        validation: function(callback) {
            var self = this;
            self.$el.find("#editForm").formValidation({
                framework: 'bootstrap',
                icon: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    "modal-company-name": {
                        validators: {
                            notEmpty: {
                                message: 'The company name is required'
                            }
                        }
                    }
                },
            }).on('success.form.fv', function(e) {
                var jsonData;

                e.preventDefault();
                //validate json config
                try{
                    self.jsonEditor.get();
                }
                catch(ex) {
                    alert("json error.");
                    return;
                }
                self.afterValidate();
            });
        },

        interfaceShow: function (){
            var self = this;
            if(self.workMode === "put"){
                self.getConfigByCompany();
            }
            else{
                self.renderForm();
            }
        },

        afterGet: function() {
            var self = this,
                configObj;

            configObj = self.getModel.get("data").config;
            self.renderForm(configObj);
        },

        renderForm: function(configObj) {
            var self = this,
                info,
                template,
                disabled = "",
                container,
                options;

            if(!configObj){
                configObj = null;
            }
            if(self.workMode === "put"){
                disabled = "disabled";
            }

            info = {
                "companyName": self.options["companyName"] || "",
                "disabled": disabled
            };
            template = base._.template(html);
            self.$el.html(template(info));
            container = document.getElementById(self.$el.find('#jsoneditor').attr("id"));
            options = {
                mode: 'code',
                modes: ['code', 'form', 'text', 'tree', 'view'],
                error: function (err) {
                  alert(err.toString());
                }
            };
            self.jsonEditor = new jsonEditor(container, options, configObj);
            self.validation();
        },

        getConfigByCompany: function() {
            var self = this,
                url;

            url = '/config/configration/'+ self.options.companyName;
            self.getModel = self.getModel || new base.request();
            self.models.push(self.getModel);
            self.listenTo(self.getModel, 'get', self.afterGet);
            self.getModel.fetch(url, {
                categoryName: self.options.categoryName,
                serviceName: self.options.serviceName
            });
        },

        close: function() {
            base.lib.viewHelper.close(this);
        }
   });

   return editView;
});