define([
    "base",
    "text!widgets/templates/modalWin.html"
], function (base, html) {

    var modalWin = base.Backbone.View.extend({

        initialize: function() {
            var self = this;
            self.$el = base.$(APP.MODAL_CONTAINER);
            self.views = [];
            self.childView = self.options.childView;
            self.childView.parent = self;
            self.setting = self.options.setting || {};
            self.views.push(self.childView);
            base.lib.viewHelper.loading(self.$el);
        },

        events: function() {
            var self = this;
            self.delegateEvents({
                "click #modal-submit": "submit"
            });
        },

        submit: function() {
            var self = this;
            self.childView.interfaceSubmit();
        },

        openWin: function() {
            var self = this,
                template;
            template = base._.template(html);
            self.$el.html(template({
                title: self.setting.title,
                closeName: self.setting.closeName || "Close",
                submitName: self.setting.submitName || "Submit",
                hideClose:  self.setting.hideClose && self.setting.hideClose === true ? 'hide' : '',
                hideSubmit: self.setting.hideSubmit && self.setting.hideSubmit === true ? 'hide' : ''
            }));
            self.$el.modal('show');
            self.childView.$el = self.$el.find(".modal-body").eq(0);
            self.childView.interfaceShow();
            self.$el.on("hidden.bs.modal", function(e) {
                self.close('close');
            });
        },

        close: function(event) {
            var self = this;

            event = event || "close";
            if(self.options.callback){
                self.options.callback(event);
            }
            self.$el.modal('hide');
            setTimeout(function(){
                self.childView.close();
                base.lib.viewHelper.close(self);
            }, 200);
        }
    });

    return modalWin;
});