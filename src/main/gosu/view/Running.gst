<div class="page-header">
  <h1>Running Jobs</h1>
</div>
<table class="table">
  <thead>
    <tr>
      <th>
        Job Id
      </th>
      <th>
        Job Type
      </th>
      <th>
        Elapsed Time
      </th>
      <th>
        Progress
      </th>
    </tr>
  </thead>
  <tbody>
    <% if (jobs.Job.Active.size() == 0) { %>
      <div class="alert alert-info alert-dismissable">
        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
        <strong>Attention: </strong> There are currently no running jobs; please start a new job
      </div>
    <%  } else {
    for(job in jobs.Job.Active) { %>
    <tr>
      <td>
        ${job.UUId}
      </td>
      <td>
        ${job.Type}
      </td>
      <td>
        ${job.ElapsedTime}
      </td>
      <td>
      <div class="progress progress-striped active">
        <div class="progress-bar"  role="progressbar" aria-valuenow="${job.Progress}" aria-valuemin="0" aria-valuemax="100" style="width: ${job.Progress}%">
          <span class="sr-only">${job.Progress}% Complete</span>
        </div>
      </div>
      </td>
    <% }
  } %>
  </tbody>
</table>