<%@ params(loggedIn : boolean, resultNames : model.database.iterable.PagerIterable<model.ResultInfo>) %>
<div>
  <h2 class="page-title">Results</h2>
  <a href="/results/new" class="btn btn-primary pull-right">New Analysis</a>
</div>

<div id='wrapper'>

  <% if (!loggedIn) { %>
    <div class="inset-8">
      <div class="alert alert-info alert-dismissable">
        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
        <i class="fa fa-warning"></i> Please <a href="https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${java.lang.System.Env['SF_CLIENT_ID']}&redirect_uri=https%3A%2F%2Fgosuroku.herokuapp.com%2Fresults&state=mystate&scope=api%20id%20refresh_token">
        log in to Salesforce</a> to upload results
      </div>
    </div>
  <% } %>

  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>
          Result Id
        </th>
        <th>
          Created
        </th>
        <th>
          Source
        </th>
      <% if (loggedIn) { %>
        <th>
          Upload to Salesforce
        </t>
      <% } %>
      </tr>
    </thead>
    <tbody>
      <%
       if (resultNames.Current == 1 && resultNames.Count == 0) { %>
        <br>
        <div class="alert alert-info alert-dismissable">
          <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
          <strong>Attention: </strong> There are currently no recommendation results in the database
        </div>
      <% } else {
    for(result in resultNames)  {%>
      <tr>
        <td>
          <a href='/results/${result.get('UUId')}'>${result.get('UUId')}</a>
        </td>
        <td>
          ${result.get('Created') ?: ''}
        </td>
        <td>
          ${result.get('Source') ?: ''}
        </td>
      <% if (loggedIn) { %>
        <td>
          <a href="#" ic-post-to="/jobs?type=auth&SalesForceAuthJob[ResultCollection]=${result.get('UUId')}">Upload</a>
        </td>
      <% } %>
     </tr>
     <% }
  } %>
    </tbody>
  </table>
  ${new widgets.PagerWidget().renderWidget(resultNames)}
</div>
