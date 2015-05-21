var socket;
socket = io.connect( window.location.origin, {query: 'bar', type: 'desktop'});
var ordersDiv = document.querSelector('#orders');

socket.on('new', function(data){
	var order = "";
	order += "<div class='order' id='"+data.id+"'>";
	order += "<span class='label'>"+data.drink+"</span>";
	order += "<span class='label'>"+data.mixer+"</span>";
	order += "<button class='control'>Begin</button>";
	order += "</div>";
	ordersDiv.innerHTML += order;
});

socket.on('end', function(data){
	//remove element at data.id
	
});