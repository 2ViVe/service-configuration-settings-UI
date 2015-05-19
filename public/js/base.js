define([
    'jquery',
    'backbone',
    'underscore',
    'lib/index',
    'models/request',
    'base/router'
], function ($, Backbone, _, lib, request, Router) {
    return {
        $: $,
        Backbone: Backbone,
        _: _,
        lib: lib,
        request: request,
        Router: Router
    };
});