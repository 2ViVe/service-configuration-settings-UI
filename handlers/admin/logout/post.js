function post (req, res, next) {

    req.session.destroy(function(err) {
        if(err){
            next(err);
            return;
        }
        
        next({
            body: {
                success: true
            }
        });
    });

}

module.exports = post;