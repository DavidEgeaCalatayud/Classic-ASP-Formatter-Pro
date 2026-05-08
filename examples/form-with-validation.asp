<form method="post" action="guardar.asp">
<label for="nombre">Name</label>
<input id="nombre" name="nombre" value="<%= Request.Form("nombre") %>">
<% If Len(errorNombre) > 0 Then %>
<span class="error"><%= errorNombre %></span>
<% End If %>
<button type="submit">Save</button>
</form>
<script>
document.querySelector("form").addEventListener("submit", function (event) {
if (!document.getElementById("nombre").value) {
event.preventDefault();
alert("Name is required");
}
});
</script>
