<%@ LANGUAGE="VBSCRIPT" %>
<!--#include file="conexion.asp"-->
<%
Dim filtro, pagina, total
filtro = Request.QueryString("q")
pagina = Request.QueryString("page")
If pagina = "" Then
pagina = 1
End If
sql = "SELECT * FROM clientes WHERE nombre LIKE '%" & filtro & "%'"
Set rs = conn.Execute(sql)
%>
<html>
<head>
<title>Legacy customers</title>
<style>
body {
font-family: Arial;
}
.estado {
font-weight: bold;
}
</style>
</head>
<body>
<h1>Customers</h1>
<form method="get">
<input name="q" value="<%= filtro %>">
<button type="submit">Search</button>
</form>
<table>
<% Do While Not rs.EOF %>
<tr class="<% If rs("activo") Then Response.Write("on") Else Response.Write("off") %>">
<td><%= rs("nombre") %></td>
<td>
<%
Select Case rs("tipo")
Case 1
Response.Write "Alta"
Case 2
Response.Write "Baja"
Case Else
Response.Write "Otro"
End Select
%>
</td>
</tr>
<% rs.MoveNext %>
<% Loop %>
</table>
<script>
if (window.console) {
console.log("Filter: <%= filtro %>");
}
</script>
</body>
</html>
