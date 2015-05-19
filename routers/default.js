
function registRouters(lighter, middleware, handler){
    
    lighter.get('/',
        handler.pages.default
    );
}


module.exports = registRouters;