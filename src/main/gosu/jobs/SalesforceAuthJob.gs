package jobs

uses java.lang.System
uses salesforce.SalesforceRESTClient
uses java.util.Calendar
uses java.lang.Double
uses java.lang.Thread
uses model.ResultInfo
uses java.lang.Math
uses java.lang.Exception
uses salesforce.SObject
uses com.google.gson.reflect.TypeToken
uses com.google.gson.Gson
uses model.RefreshToken

class SalesforceAuthJob extends Job {
  static final var SF_REDIRECT_URI  = "https://gosuroku.herokuapp.com/results"
  static final var SF_ACCOUNT_ID    = System.Env["SF_ACCOUNT_ID"]?.toString()
  static final var SF_CLIENT_ID     = System.Env["SF_CLIENT_ID"]?.toString()
  static final var SF_CLIENT_SECRET = System.Env["SF_CLIENT_SECRET"]?.toString()

  construct(key : String, value : Object) {
    super(key,value)
  }

  construct(authCode : String, companies : String[]) {
    super()
    AuthorizationCode = authCode
    if (companies != null && companies.Count > 0) {
      Companies = companies.toList()
    }
  }

  property get ResultCollection() : String {
    return get('ResultCollection') as String
  }

  property set ResultCollection(collection : String) {
    put('ResultCollection', collection)
  }

  property get AuthorizationCode() : String {
    return get('AuthCode') as String
  }

  property set AuthorizationCode(code : String) {
    put('AuthCode', code)
  }

  property get Companies() : List<String> {
    return new Gson().fromJson(get('Comapnies') as String, new TypeToken<List<String>>(){}.getType())
  }

  property set Companies(companies : List<String>) {
    put('Companies', companies.toJSON())
  }

  override function executeJob() {
    checkCancellation()
    this.StatusFeed= "Connecting to Salesforce..."
    this.Progress = 5
    /*
     * ---- Access Salesforce Resources ----
     */
    var salesforce = authorize()

    /*
     * ---- Upload to Salesforce ----
     */
    this.StatusFeed = "Uploading results from <a href=https://gosuroku.herokuapp.com/results/"+ResultCollection+">"+ResultCollection+"</a>"

    var recommendations = ResultInfo.findResults(ResultCollection)
    var date = Date
    var companies = Companies?.map(\ c -> c.toInt())
    for (recommendation in recommendations index i) {
      if (companies != null && !companies.contains(i)) {
        continue
      }
      this.StatusFeed = "Uploading recommendation "+(i+1)+": "+recommendation['Company']
      Thread.sleep(4500) //Don't go over the API limit (5 requests per 20 seconds)!
      this.Progress = Math.max(10, (i * 100) / recommendations.size())
      save()
      checkCancellation()
      var opp = new SObject("Opportunity")
      opp.set("Name", recommendation.Company)
      opp.set("AccountId", SF_ACCOUNT_ID)
      opp.set("CloseDate", date)
      opp.set("Probability", String.valueOf(Double.parseDouble(recommendation.Value as String) * 100))
      opp.set("StageName", "Qualification")
      opp.set("Description", "It is recommended that this company take on the "+recommendation.get('Policy')+" policy.")
      var result = salesforce.insert(opp)
      if (!(result["success"] as Boolean)) {
        this.StatusFeed = "Failed upload. Response from Salesforce: "+result
      }
    }
    this.StatusFeed = "Done! Uploads available as opportunities <a href=${salesforce.InstanceURL}/${SF_ACCOUNT_ID}>on Salesforce</a>"
    save()
  }

  private function authorize() : SalesforceRESTClient {
    var salesforce = new SalesforceRESTClient(SF_CLIENT_ID, SF_CLIENT_SECRET)
    var authResponse = salesforce.authenticate(AuthorizationCode, SF_REDIRECT_URI)
    if (authResponse["error"] as String == null) { // Authorized without error
      var token = RefreshToken.RefreshToken
      token = token ?: new RefreshToken()
      token.Token = authResponse["refresh_token"] as String
      token.save()
      this.StatusFeed = "Connected!"
    } else if (authResponse["error"] as String == "invalid_grant") { // need to use refresh token
      salesforce.refresh(RefreshToken.RefreshToken.Token)
      this.StatusFeed = "Token Refreshed!"
    } else {
      this.StatusFeed = "Error! "+authResponse["error"] as String
      handleErrorState(new ("Error: "+(authResponse["error"] as String)))
    }
    save()
    return salesforce
  }

  override function doReset() {
  }

  override function renderToString(): String {
    return view.jobs.drilldowns.SalesforceUpload.renderToString(this)
  }

  /* Returns current date in Salesforce Object Date field format */
  private property get Date() : String {
    var cal = Calendar.getInstance()
    return cal.get(Calendar.YEAR)+"-"+(cal.get(Calendar.MONTH) + 1)+"-"+cal.get(Calendar.DATE)
  }
}