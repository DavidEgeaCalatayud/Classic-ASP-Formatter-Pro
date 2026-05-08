<%
If clienteActivo Then
Response.Write "Activo"
If permisoPVP Then
Response.Write precio
End If
Else
Response.Write "Inactivo"
End If
%>
