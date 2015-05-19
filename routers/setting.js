
function registRouters(lighter, middleware, handler){

    lighter.get('/setting/*',
        middleware.authenticator
    );

    lighter.get('/setting',
        handler.setting.category.categoryList
    );

    lighter.get('/setting/:category',
        handler.setting.category.list
    );

    lighter.get('/setting/:category/:serviceName',
        handler.setting.category.get
    );

    lighter.put('/setting/:category/:serviceName',
        handler.setting.category.put
    );

    lighter.post('/setting/:category/:serviceName',
        handler.setting.category.post
    );

    lighter.delete('/setting/:category/:serviceName',
        handler.setting.category.del
    );
}

module.exports = registRouters;