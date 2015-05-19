define([
  "base"
], function (base) {
  var $ = base.$,
    Backbone = base.Backbone,
    _ = base._,
    Router = base.Router;

  var sectionView = Backbone.View.extend({

    initialize: function () {
      var self = this;
      self.currentView = null;
      self.render();
    },

    getPageName: function (category) {
      var self = this;
      switch(category) {
        case "service registry":
          return "serviceRegistry";
        case "configration service":
          return "configrationService";
        default:
          return "serviceRegistry";
      }
    },

    routerChanged:function(){
        var self = this,
          category =  Router.getParam("category"),
          name = Router.getParam("name"),
          el = APP.SECTION_CONTAINER,
          pageName = self.getPageName(category);

        require([
            'modules/config/views/' + pageName + "View"
        ], function(view) {
            if(self.currentView){
                self.currentView.close();
                self.currentView = null;
            }
            if(view) {
                self.currentView = new view({
                  el: el,
                  categoryName: category,
                  serviceName: name
                });
            }
        });
    },

    close:function(){
      base.viewHelper.close(this);
    }

  });

  return sectionView;
});