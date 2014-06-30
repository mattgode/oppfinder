uses junit.framework.*
uses datagen.GenerateTest
uses jobs.GenerateJob
uses jobs.RecommendJob
uses java.util.UUID

class AlgorithmTest extends TestCase {
  static final var numCompanies = 1000

  public function testReaches() {
  for (1..80 index i) {
    print("iteration: "+i)
    new GenerateTest().generateTest('dataReach.json', "Reach", numCompanies)
    new GenerateJob('dataReach.json', UUID.randomUUID().toString()).start().join()

    print("yo")
    var recommendJob = new RecommendJob("AlgorithmTestCollection")
    recommendJob.start().join()

  //  var recommendations = recommendJob.ResultsData.find().next()
  //  assertEquals(recommendations.get("Company"), "RECOMMENDEE (test success)")

    }
  }


}