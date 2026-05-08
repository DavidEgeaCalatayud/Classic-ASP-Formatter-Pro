<table class="clients">
<% If mostrarClientes Then %>
<% For i = 0 To UBound(clientes) %>
<tr>
<td><%= clientes(i).Nombre %></td>
<td><%= clientes(i).Estado %></td>
</tr>
<% Next %>
<% Else %>
<tr>
<td colspan="2">No data</td>
</tr>
<% End If %>
</table>
