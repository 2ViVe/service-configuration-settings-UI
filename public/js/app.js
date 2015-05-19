define([
    'jquery',
    'underscore',
    'backbone',
    'routerInit',
    'const/index'
], function ($, _, Backbone, RouterInit, Const) {

    var init = function () {
        RouterInit();
    };

    return {
        initialize: init,
    };
});