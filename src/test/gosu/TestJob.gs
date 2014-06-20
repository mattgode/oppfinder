uses java.lang.Runnable
uses java.lang.Thread
uses java.util.Map
uses jobs.Job

class TestJob extends Job {

  construct(data : Map<Object, Object> ) {
    super(data)
  }

  construct() {
    super()
  }

  override function executeJob() {
    checkCancellation()
    this.StatusFeed = "Starting"

    var iterations = 30
    for(var i in 1..iterations) {
      if (i == iterations/2) this.StatusFeed = "50% Complete"
      checkCancellation()
      print("Test Job On Iteration ${i}")
      Thread.sleep(1 * 1000)
      this.Progress = (i * 100)/iterations
    }
    this.StatusFeed = "Done"
    this.Progress = 100
    print("Test Job Complete")
  }

  override function reset() {}

  override function renderToString() : String {
    return view.TestJob.renderToString()
  }

}