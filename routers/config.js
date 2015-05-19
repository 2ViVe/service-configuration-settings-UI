
function registRouters(lighter, middleware, handler){
    lighter.get('/config/*',
        middleware.authenticator
    );

    lighter.get('/config/category',
        handler.config.category.list
    );

    lighter.get('/config/registry',
        handler.config.registry.list
    );

    lighter.put('/config/registry',
        handler.config.registry.put
    );

    lighter.post('/config/registry',
        handler.config.registry.post
    );

    lighter.delete('/config/registry',
        handler.config.registry.del
    );

    lighter.get('/config/configration',
        handler.config.configration.list
    );

    lighter.get('/config/configration/:companyName',
        handler.config.configration.get
    );

    lighter.put('/config/configration/:companyName',
        handler.config.configration.put
    );

    lighter.post('/config/configration/:companyName',
        handler.config.configration.post
    );

    lighter.delete('/config/configration/:companyName',
        handler.config.configration.del
    );
}


module.exports = registRouters;