<%@ LANGUAGE="VBSCRIPT" %>
<!--#include file="conexion.asp"-->
<%
Dim activo
activo = Request.QueryString("activo")
If activo = "" Then
activo = "1"
End If
%>
<style>
.badge {
color: white;
background: #2563eb;
}
</style>
<section class="<% If activo = "1" Then Response.Write("panel active") Else Response.Write("panel") %>">
<h1>Customers</h1>
<p>Total: <%= totalClientes %></p>
</section>
<script>
if (window.console) {
console.log("Active filter: <%= activo %>");
}
</script>
