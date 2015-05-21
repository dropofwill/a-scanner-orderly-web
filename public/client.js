var socket;
socket = io.connect( window.location.origin, {query: 'bar', type: 'desktop'});
var ordersDiv = document.querySelector('#orders');

//console.log(socket);

socket.on('new', function(data) {
	var order = "";
	order += "<p class='order' id='"+data.id+"''>";
	order += "<span class='col-item label "+ data.spirit_class + "'>"+data.spirit+"</span>";
	order += "<span class='col-item label "+ data.mixer_class  + "'>"+data.mixer+"</span>";
	order += "<button class='control btn btn-default' data-port='"+data.port+"'>Begin</button>";
	order += "</p>";
	ordersDiv.innerHTML += order;

	var but = document.querySelector('#'+data.id+' .control');
	but.addEventListener('click', drink_button_click);
});

function drink_button_click(e) {
	var button_text = e.target.innerHTML;
	switch(button_text) {
		case "Begin":
			e.target.innerHTML = "Ready";
			e.target.classList.remove('btn-default');
			e.target.classList.add('btn-warning');
			socket.emit('begin', {port: e.target.dataset.port});
			break;
		case "Ready":
			e.target.innerHTML = "Done";
			e.target.classList.remove('btn-warning');
			e.target.classList.add('btn-danger');
			socket.emit('ready', {port: e.target.dataset.port});
			break;
	}
}
/////////////////////////////
//DEMO CODE
/////////////////////////////
/*
var order = "";
	order += "<p id='butt' class='order'><span class='col-item label label-primary'>Tequila</span><span class='col-item label label-success'>Sprite</span><button id='butter' class='control btn btn-default'>Begin</button></p>"
	ordersDiv.innerHTML += order;

var but = document.querySelector('#'+'butt'+' .control');
	but.addEventListener('click', drink_button_click);
*/
socket.on('end', function(data) {
	//remove element at data.id
	elem = document.getElementById(data.id);
	elem.parentNode.removeChild(elem);
});
