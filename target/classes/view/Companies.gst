
YO YO YO
<table class="table">
  <% for (entry in model.DataSetEntry.All) { %>
    <tr>
      <% for (key in entry.keySet()) { %>
      <td> ${key} </td>
      <td> ${entry[key]} </td>
      <% } %>
    </tr>
  <% } %>
</table>

