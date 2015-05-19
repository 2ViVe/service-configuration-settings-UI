define([
  'jquery',
  'backbone',
  'underscore',
  'router',
  'models/request'
], function ($, Backbone, _, Router, Model) {
  var showView = Backbone.View.extend({

    initialize: function () {
      var self = this;
      self.views = [];
      self.currentView = null;
      self.render();
      // self.listenTo(self.loginOutModel,"read",self.afterLoginOut);
      // self.delegateEvents({
      //   "click #ulTabMenu a": "clickShowTabMenu",
      //   "click #ulTabMenu a button": "closeView"
      // });
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