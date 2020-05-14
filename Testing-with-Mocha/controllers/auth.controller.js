function AuthController(){

  var roles;
  var user;

  function setRoles(role){
      roles = role;
  }

  function isAuthorized(neededRole){
      return roles.indexOf(neededRole) >= 0; 
  }

  function isAuthorizedAsync(neededRole, cb){
      setTimeout(function(){cb(roles.indexOf(neededRole) >= 0)}, 1100);  
  }

  function isAuthorizedPromise(neededRole, cb){
    return new Promise(function(resolve) {
      setTimeout(function(){resolve(roles.indexOf(neededRole) >= 0)}, 100);
    });
    
}

  function isAuthorizedBasic(roles, neededRole){
    return roles.indexOf(neededRole) >= 0; 
  }

  function getIndex(req, res) {
    res.render('index');
  }

  function homePage(req, res) {
    try {
      if(req.user.isAuthorized('admin')) {
        res.render('index');  
      }
    } catch(e) {
      res.render('error');
    }
  }

  return {isAuthorized, isAuthorizedAsync, setRoles, isAuthorizedBasic, isAuthorizedPromise, getIndex, homePage};
}

module.exports = AuthController();