define([
    "underscore",
    "jquery"
],function(_, $){
 
  //String
    String.prototype.to_i = function() {
        if(this.length === 0){
            return 0;
        }
        return parseInt(this, 10);
    };

    String.prototype.trim = function(){
        return $.trim(this);
    };
   
    Date.prototype.to_i = function() {
        return Math.floor(this.getTime() / 1000);
    };

    return null;
});