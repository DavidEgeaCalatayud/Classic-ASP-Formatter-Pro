<%
Select Case Request.QueryString("estado")
Case "alta"
titulo = "Customers enabled"
Case "baja"
titulo = "Customers disabled"
Case Else
titulo = "All customers"
End Select
%>
<main>
<h1><%= titulo %></h1>
<% If total = 0 Then %>
<p>No rows found</p>
<% Else %>
<p>Rows: <%= total %></p>
<% End If %>
</main>
