<%@ params( job: jobs.Job) %>
<% if (job == null) { %>
  <br><br>
  <div class="alert alert-danger alert-dismissable">
    <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
    <strong>Oops! </strong> This doesn't appear to be a valid job id
  </div>
<% return } %>
<h2 class="page-title">Job Details</h2>
<div class="detail-row">
  <span class="detail-label">Job Id: </span>
  <span class="detail-value">${job.UUId}</span>
</div>
<div class="detail-row">
  <span class="detail-label">Job Type: </span>
  <span class="detail-value">${job.Type}</span>
</div>
<div class="detail-row">
  <span class="detail-label">Elapsed Time: </span>
  <span class="detail-value" ic-src='/jobs/${job.UUId}/elapsed' ic-poll='5s'>${job.ElapsedTime}</span>
</div>
<div class="detail-row">
  <span class="detail-label">Status: </span>
  <span class="detail-value" ic-src='/jobs/${job.UUId}/status' ic-poll='5s'>${job.Status}</span>
</div>
<div>
  <div class="progress progress-striped active navbar-left" style="width:95%">
    <div class="progress-bar"
      ic-transition="none"
      ic-style-src="width:/jobs/${job.UUId}/progress"
      ic-poll="500ms"
      style="width:${new controller.JobController().progress(job.UUId)}">
    </div>
  </div>
  <div ic-src="/jobs/${job.UUId}/complete" ic-poll="500ms" ic-transition="none">
    ${new controller.JobController().complete(job.UUId)}
  </div>
</div>
<% if (job.Failed) { %>
  ${FailedJobView.renderToString(job)}
<%} %>
<br>
<h3 class="sub-section-header">Job Feed: </h3>
<div ic-src="/jobs/${job.UUId}/statusfeed" ic-poll="1s" ic-transition="none">
  ${JobStatusFeedList.renderToString(job.StatusFeed, job.UUId)}
</div>
<% if (!job.Failed) { %>
  ${job.renderToString()}
<%} %>
