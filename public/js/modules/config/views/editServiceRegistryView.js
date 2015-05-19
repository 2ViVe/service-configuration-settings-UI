define([
    "base",
    "text!modules/config/templates/editRegistry.html"
], function (base, html) {

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
                "name": self.$el.find("#modal-name").val().trim(),
                "host": self.$el.find("#modal-host").val().trim(),
                "port": self.$el.find("#modal-port").val().trim(),
                "api-uri": self.$el.find("#modal-api-uri").val().trim(),
                "status-uri": self.$el.find("#modal-status-uri").val().trim()
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

            self.$el.find("#editForm").data('formValidation').validate();
        },

        afterValidate: function() {
            var self = this,
                info,
                url;
            info = self.getData();
            self.requsetModel.set(info);
            url = "/config/registry?" + base.$.param({
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
                    "modal-host": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            },
                            ip: {
                                ipv4: true,
                                message: "invalid ip v4 address."
                            }
                        }
                    },
                    "modal-api-uri": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            },
                            regexp: {
                                regexp: /^\/[a-z0-9_\-\/]*[a-z0-9]$/i,
                                message: "start with '/' and not end with '/'"
                            }
                        }
                    },
                    "modal-status-uri": {
                        validators: {
                            notEmpty: {
                                message: 'The name is required'
                            },
                            regexp: {
                                regexp: /^\/[a-z0-9_\-\/]*[a-z0-9]$/i,
                                message: "start with '/' and not end with '/'"
                            }
                        }
                    }
                },
            }).on('success.form.fv', function(e) {
                // Prevent form submission
                e.preventDefault();
                self.afterValidate();
            });
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
                "host": self.options["host"] || "",
                "port": self.options["port"] || "",
                "api_uri": self.options["api-uri"] || "",
                "status_uri": self.options["status-uri"] || "",
                "disabled": disabled
            };
            template = base._.template(html);
            self.$el.html(template(info));
            self.validation();
        },

        close: function() {
            base.lib.viewHelper.close(this);
        }
   });

   return editView;
});