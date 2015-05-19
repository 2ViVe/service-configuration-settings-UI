define([
    "base",
    "text!modules/admin/templates/editSetting.html"
], function (base, html) {

   var editView = base.Backbone.View.extend({
        initialize: function() {
            var self = this;

            self.workMode = self.options.workMode || 'put';
            self.models = [];
            self.requsetModel = new base.request();
            self.models.push(self.requsetModel);
            self.category = self.options.category;
            self.parent = self.options.parent;

            if(self.workMode === "put"){
                self.listenTo(self.requsetModel, 'put', self.afterEdit);
            } else{
                self.listenTo(self.requsetModel, 'post', self.afterEdit);
            }

            base.lib.viewHelper.loading(self.$el);
            self.interfaceShow();
        },

        registEvents: function() {
            var self = this;

            if(!self.isRegistEvent){
                self.delegateEvents({
                    "click #btnSubmit": "interfaceSubmit",
                    "click #btnBack": "back"
                });
                self.isRegistEvent = true;
            }
        },

        getData: function() {
            var self = this;
            return {
                "name": self.$el.find("#modal-name").val().trim(),
                "ip": self.$el.find("#modal-ip").val().trim(),
                "port": self.$el.find("#modal-port").val().trim()
            };
        },

        afterEdit: function() {
            var self = this,
                requsetModel;

            requsetModel = self.requsetModel.toJSON();
            if(requsetModel.success === true){
                // self.parent.close("ok");
                self.back(true);
            }
            else{
                // console.log(JSON.stringify(requsetModel));
                alert("error.");
            }
        },

        afterValidate: function() {
            var self = this,
                info,
                url;
            info = self.getData();
            self.requsetModel.set(info);
            url = "/setting/" + self.category + "/" + info.name;
            if(self.workMode === "put"){
                self.requsetModel.put(url);
            } else{
                self.requsetModel.post(url);
            }
        },

        validation: function(callback) {
            var self = this;
            self.$el.find("#editSettingForm").formValidation({
                framework: 'bootstrap',
                icon: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    "modal-name": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            }
                        }
                    },
                    "modal-port": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            },
                            between: {
                                min: 1,
                                max: 65535,
                                message: "1-65535"
                            }
                        }
                    },
                    "modal-ip": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            },
                            ip: {
                                ipv4: true,
                                message: "invalid ip v4 address."
                            }
                        }
                    }
                }
            }).on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();
                self.afterValidate();
            });
        },

        back: function(refreshParent) {
            var self = this;

            self.$el.hide();
            self.parent.showTableList(refreshParent);
            self.parent.callbackRefresh('refreshSidebar');
        },

        interfaceSubmit: function() {
            var self = this;

            self.$el.find("#editSettingForm").data('formValidation').validate();
        },

        interfaceShow: function (){
            var self = this,
                info,
                template,
                disabled = "";

            if(self.workMode === "put"){
                disabled = "disabled";
            }

            info = {
                "name": self.options["name"] || "",
                "ip": self.options["ip"] || "",
                "port": self.options["port"] || "",
                "disabled": disabled,
                "category": self.category,
                "workMode": self.workMode === 'put' ? "Edit" : "Add"
            };
            template = base._.template(html);
            self.registEvents();
            self.$el.html(template(info));
            self.validation();
            self.parent.hideTableList();
        },

        close: function() {
            base.lib.viewHelper.close(this);
        }
   });

   return editView;
});