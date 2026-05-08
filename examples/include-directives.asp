<%@ LANGUAGE="VBSCRIPT" %>
<!--#include file="includes/config.asp"-->
<!--#include virtual="/includes/security.asp"-->
<%
If Not usuarioAutenticado Then
Response.Redirect "login.asp"
End If
%>
<header>
<a href="default.asp">Home</a>
<a href="salir.asp">Logout</a>
</header>
