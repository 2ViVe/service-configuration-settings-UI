
function authenticator(request, response, next) {
    var context = request.context,
        logger = request.context.logger,
        error;

    if(request.session.isLogin && request.session.isLogin === true){
        next(null);
    }
    else{
        error = new Error("denied.");
        error.statusCode = 400;
        next(error);
    }
}

module.exports = authenticator;