<table>
<% If mostrarClientes Then %>
<tr>
<td>Nombre</td>
<td>Precio</td>
</tr>
<% For i = 0 To totalClientes %>
<tr>
<td><%= clientes(i).Nombre %></td>
<% If permisoPVP Then %>
<td><%= clientes(i).Precio %></td>
<% End If %>
</tr>
<% Next %>
<% End If %>
</table>
