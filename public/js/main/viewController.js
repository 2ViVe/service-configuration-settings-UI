define([
  'jquery',
  'backbone',
  'underscore',
  'router',
  'models/request',
  'lib/viewHelper'
], function ($, Backbone, _, Router, Model, viewHelper) {
  var showView = Backbone.View.extend({

    initialize: function () {
      var self = this;
      self.views = [];
      self.currentView = null;
      self.render();
    },

    closeView:function(e){
      var self = this;
    },

    routerChanged:function(){
        var self = this;
        var pageName =  Router.getParam("page");
        var moduleName = Router.getParam("module");
        var el = APP.ROOT_CONTAINER;

        require([
            'modules/' + moduleName + '/views/' + pageName + "View"
        ], function(view) {
            if(self.currentView){
                self.currentView.close();
                self.currentView = null;
            }
            viewHelper.loading($(el));
            if(view) {
                self.currentView = new view({el: el});
            }
        });
    },

    render: function () {
      var self = this;
    },

    close:function(){
      var self = this;
      self.stopListening();
      self.remove();
    }

  });

  return showView;
});