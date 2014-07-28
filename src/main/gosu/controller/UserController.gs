package controller

uses sparkgs.IResourceController
uses sparkgs.util.IHasRequestContext
uses org.apache.shiro.SecurityUtils
uses org.apache.shiro.authc.UsernamePasswordToken
uses org.apache.shiro.authc.UnknownAccountException
uses org.apache.shiro.authc.IncorrectCredentialsException
uses org.apache.shiro.authc.LockedAccountException
uses org.apache.shiro.authc.AuthenticationException
uses model.database.Database
uses com.mongodb.DBObject
uses auth.MongoUserPasswordRealm
uses org.apache.shiro.subject.Subject
uses org.apache.shiro.mgt.DefaultSecurityManager
uses com.mongodb.BasicDBObject

class UserController implements IHasRequestContext, IResourceController {
  var _realm : MongoUserPasswordRealm

  construct() {
    _realm = new MongoUserPasswordRealm(Database.INSTANCE.getCollection("MONGO_USER_AUTHENTICATION"))
    SecurityUtils.setSecurityManager(new DefaultSecurityManager(_realm))
  }

  //GET Sign In Page
  override function index(): Object {
    Layout = null
    return view.login.Login.renderToString()
  }



  // User registration
  override function create(): Object {
    var username = Params['username']
    var password = Params['password']
    if (!newNameIsUnique(username)) {
      Headers['X-IC-Script'] = 'alert("An account already exists for that name. Please pick a new name.");'
      Headers['X-IC-Redirect'] = "/user"
      return ""
    }
    var db = Database.INSTANCE.getCollection("MONGO_USER_AUTHENTICATION")
    var DBObj = new DBObject[] { _realm.createUserCredentials(username, password)}
    db.insert(DBObj)
    return null
  }




  function login() : Object {
    var currentUser = new Subject.Builder(SecurityUtils.getSecurityManager()).buildSubject()

    if (!currentUser.isAuthenticated()) {
      var token = new UsernamePasswordToken(Params['username'], Params['password'])
      token.setRememberMe(true)
      try {
        // Authenticates the subject
        currentUser.login(token)
        if (currentUser.isAuthenticated()) {
          Session["currentUser"] = currentUser
          Session["username"] = Params['username'] // used for authorization
          Headers['X-IC-Redirect'] = "/"
          return index()
        } else {
          throw "Failed to catch authentication exception?"
        }
      } catch(uae : UnknownAccountException) { // need to get to handling this on front end
        Headers['X-IC-Script'] = 'alert("Unknown account! Please try again.");'
      } catch(ice : IncorrectCredentialsException) {
        Headers['X-IC-Script'] = 'alert("Incorrect Credentials! Please try again.");'
      } catch(lae : LockedAccountException) {
        Headers['X-IC-Script'] = 'alert("Your account is locked.");'
      } catch(ae : AuthenticationException) {
        Headers['X-IC-Script'] = 'alert("Authentication Exception! Please try again.");'
      }
      Headers['X-IC-Redirect'] = "/user"
    }
    return ""
  }

  private function newNameIsUnique(username : String) : boolean {
    var db = Database.INSTANCE.getCollection("MONGO_USER_AUTHENTICATION")
    var dbobj = new BasicDBObject()
    dbobj.put("name", username)
    var iter = db.find(dbobj)
    return (iter.count() == 0)
  }

  function logout() : Object {
    Session.remove("username")
    Session.remove("currentUser")
    SecurityUtils.getSubject().logout()
    Headers['X-IC-Redirect'] = "/user"
    redirect("/user")
    return index()
  }

  override function _new(): Object {
    return null
  }

  override function show(id: String): Object {
    return null
  }

  override function edit(id: String): Object {
    return null
  }

  override function update(id: String): Object {
    return null
  }


}