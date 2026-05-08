<div>
<% If mostrar Then %>
<ul>
<% For Each item In items %>
<li><%= item.Nombre %></li>
<% Next %>
</ul>
<% End If %>
</div>
