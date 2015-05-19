require.config({
    urlArgs: "bust=20150402_3",
    paths: {
        base: "base",
        jquery: './base/jquery-1.11.0.min',
        underscore: './base/underscore',
        backbone: './base/backbone',
        bootstrap: './base/bootstrap.min',
        router: './base/router',
        formValidation: './base/formValidation.min',
        bootstrapFormValidation: './base/bootstrapFormValidation.min'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'bootstrap':{deps: ['jquery']},
        'formValidation': {deps: ['bootstrap']},
        'bootstrapFormValidation': {deps: ['formValidation']}
    },
    waitSeconds:600,
});

require(['app','bootstrap', 'formValidation', 'bootstrapFormValidation'], function (app) {
    app.initialize();
});