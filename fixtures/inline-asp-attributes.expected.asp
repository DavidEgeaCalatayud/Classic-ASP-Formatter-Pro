<form>
    <input value="<%= Request("nombre") %>">
    <td class="<% If activo Then Response.Write("on") Else Response.Write("off") %>">
    <a href="detalle.asp?id=<%= id %>&tipo=<%= tipo %>">
    <option <% If seleccionado Then Response.Write("selected") %>>
</form>
