define([
    'jquery',
    'underscore',
], function($, _) {
    var viewHelper = {

        close: function (viewObj) {
            if(viewObj.models && _.isArray(viewObj)){
                viewObj.models.forEach(function(model) {
                    if(model && model.off){
                        model.off();
                    }
                });
                viewObj.models = [];
            }
            if(viewObj.views && _.isArray(viewObj.views)){
                viewObj.views.forEach(function(view) {
                    view.close();
                });
                viewObj.views = [];
            }
            viewObj.undelegateEvents();
            viewObj.stopListening();
            viewObj.$el.unbind().removeData().empty();
            Object.keys(viewObj).forEach(function(key){
                if(viewObj.hasOwnProperty(key)){
                    // console.log(key);
                    if(!_.contains(['el', '$el'], key)){
                        viewObj[key] = null;
                    }
                }
            });
            // viewObj.$el.remove("*");
            // viewObj.remove();
        }

    };

    return viewHelper;
});
