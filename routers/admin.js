
function registRouters(lighter, middleware, handler){
    
    lighter.post('/admin/login',
        handler.admin.login.post
    );

    lighter.post('/admin/logout',
        middleware.authenticator,
        handler.admin.logout.post
    );

}


module.exports = registRouters;