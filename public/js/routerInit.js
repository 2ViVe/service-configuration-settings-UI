define([
    'jquery',
    'underscore',
    'backbone',
    'router',
    'main/viewController',
    'main/sectionViewController'
], function ($, _, Backbone, Router, ViewController, SectionViewController) {

    var RouterInit = function () {
        Router.register(new ViewController({ el: "#container" }), ["module","page"]);
        Router.register(new SectionViewController({ el: "#container" }), ["category","name"]);
        Router.setParams(
            [
                {Name: 'module', Value: 'admin'},
                {Name:"page",Value:"login"}
            ],
            [],
            true
        );

        $.ajaxSetup({
            statusCode: {
                401: function(){
                    if(sessionStorage.getItem("isLoginPage") == "false")
                        if(confirm("access denied.")){
                            window.location.reload();
                        }
                }
            },
            cache: false
        });
    };

    return RouterInit;
});