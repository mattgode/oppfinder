package jobs

uses java.lang.Runnable
uses java.util.Map
uses model.DataSet
uses org.json.simple.JSONArray
uses org.json.simple.parser.JSONParser
uses model.Company
uses org.json.simple.JSONObject

class UploadJob extends Job implements Runnable {


  construct() {
    super()
  }
  construct(data : Map<Object, Object>) {
    super(data)
  }

  construct(body : String) {
    var dataSet = new DataSet("uploadToParse")
    dataSet.drop()
    dataSet.insert({"file" -> body})
  }

  override function run() {
    if (Cancelled) {
      return
    }

    print("running1")
    var body = (new DataSet("uploadToParse").find().next()["file"]).toString()
    var i = 0
    for (0..3) {
      i = body.indexOf("\n", i+1)
    }
    body = body.substring(i)
    body = body.substring(0, body.lastIndexOf("\n---"))
    var parser = new JSONParser()
    var array = parser.parse(body) as JSONArray

    if (Cancelled) {
      return
    }


    var dataSet = new DataSet("oppFinder")
    dataSet.drop()


    var iterations = array.size()

    for (var j in 0..iterations) {
      var company = new Company("oppFinder")
      var obj = array[j] as JSONObject
      company.CompanyName = obj.get("Company") as String
      company.ContactName = obj.get("Contact Name") as String
      company.Email = obj.get("Email") as String
      company.Region = obj.get("Region") as String

      company.Policies = obj.get("policies") as String
      company.save()

      if (Cancelled) {
        return
      }
      this.Progress = (j*100)/iterations
    }
    this.Progress = 100

  }

  override function reset() {}

  override function renderToString() : String {
    return view.Companies.renderToString()
  }

}