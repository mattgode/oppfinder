package jobs

uses java.util.Map
uses model.MongoCollection
uses org.json.simple.JSONArray
uses org.json.simple.parser.JSONParser
uses model.Company
uses org.json.simple.JSONObject
uses java.util.UUID

class UploadJob extends Job {


  construct() {
    super()
  }
  construct(data : Map<Object, Object>) {
    super(data)
  }

  construct(body : String) {
    var dataSet = new MongoCollection ("uploadToParse")
    dataSet.drop()
    dataSet.insert({"file" -> body})
    dataSet.insert({'collection' -> UUID.randomUUID().toString()})
  }

  override function executeJob() {
    checkCancellation()
    var c = new MongoCollection ("uploadToParse").find().iterator().next()
    var body = (c["file"]).toString()
    var i = 0
    for (0..3) {
      i = body.indexOf("\n", i+1)
    }
    body = body.substring(i)
    body = body.substring(0, body.lastIndexOf("\n---"))
    if (body.length < 6) {
      this.Progress = 100
      return
    }
    var parser = new JSONParser()
    var array = parser.parse(body) as JSONArray
    checkCancellation()
    var iterations = array.size()
    for (var j in 0..iterations-1) {
      var company = new Company(c['collection'] as String)
      var obj = array[j] as JSONObject
      company.CompanyName = obj.get("Company") as String
      company.ContactName = obj.get("Contact Name") as String
      company.Email = obj.get("Email") as String
      company.Region = obj.get("Region") as String
      company.Size = obj.get("Size") as String
      company.Policies = obj.get("policies") as String
      company.save()
      checkCancellation()
      this.Progress = (j*100)/iterations
    }
    this.Progress = 100
  }

  override function doReset() {}

  override function renderToString() : String {
    return view.datasets.DataSetTable.renderToString(model.DataSet.allDataSets.paginate("1"))
  }

}