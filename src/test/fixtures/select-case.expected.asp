<%
Select Case estado
    Case "A"
        Response.Write "Activo"
    Case "I"
        Response.Write "Inactivo"
    Case Else
        Response.Write "Desconocido"
End Select
%>
