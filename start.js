/*
	//OWNER	   : IG SOLUTIONS
	//AUTHOR   : PIYUSH GARG
	//START	   : MAY-2020
*/

var p = document.getElementById("demo");
var socket;
var u_name;
var port;
var c_id;
var flag=0,disst=0;
var onlineStat=1,freq=0;

function do_nothing()
{
}

function onlineStatus(num)
{
  onlineStat = num;
  freq+=1;
}

function onlineStatusgenerate()
{
	freq=0;
	var xhr = new XMLHttpRequest();
    var file = "https://igdownload.github.io/chat/st.png";
    var d = new Date();
    var randomNum = d.toISOString();
 
    xhr.open('HEAD', file + "?rand=" + randomNum, true);
    xhr.send();
     
    xhr.addEventListener("readystatechange", processRequest, false);
 
    function processRequest(e) {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 304) {
          onlineStatus(1);
        } else {
                    onlineStatus(0);
        }
      }
    }
}

window.onload=function(){
	if(navigator.onLine)
	{
			onlineStatusgenerate();
	}
	document.getElementById('online').innerHTML = 'You are '+((navigator.onLine && onlineStat)?'Online':'Offline');
	setInterval(function(){
		if(navigator.onLine)
		{
			onlineStatusgenerate();
		}
		document.getElementById('online').innerHTML = 'You are '+((navigator.onLine && onlineStat)?'Online':'Offline');				
		setTimeout(function(){if(freq==0){onlineStat=0;}},4000); //to faster the process of checking internet access in case of connection timeout
 		if(!(navigator.onLine && onlineStat))
		{
			document.getElementById('overlay').style.display="block";
		}
		else
		{
			document.getElementById('overlay').style.display="none";
		}		
		}, 5000);

	var port_s=localStorage.getItem('port');
	var name_s=localStorage.getItem('name_c');
	var id_s= localStorage.getItem('id');
	if(port_s!=null)
	{
		document.getElementById("connectbtn").disabled=true;
		document.getElementById("port").disabled=true;
		document.getElementById("name").disabled=true;
		document.getElementById("contd").disabled=false;
		document.getElementById("port").value=port_s;
		document.getElementById("name").value=name_s;
		c_id=id_s;
		flag=1;
		connect();
	}
	
	
	var d = new Date();
	var n = d.toDateString();
	p.innerHTML += '<div class="date">'+n+'</div><br>';
}

function randomStr(len, arr) { 
            var ans = ''; 
            for (var i = len; i > 0; i--) { 
                ans +=  
                  arr[Math.floor(Math.random() * arr.length)]; 
            } 
            return ans; 
      } 

function connect()
{
	port=document.getElementById("port").value;
	socket = new WebSocket('wss://connect.websocket.in/v3/'+port+'?apiKey=NxcDNyx8dSmaMAVSGc0jLCXSYXBEwxdmRBIdZUnuannYKQKhyXRIseij7wvO');

	u_name=document.getElementById("name").value;
	document.getElementById("connectbtn").disabled=true;
	document.getElementById("port").disabled=true;
	document.getElementById("name").disabled=true;
	document.getElementById("contd").disabled=false;

	socket.onopen = function(event) {
		if(flag==0)
		{
			c_id = randomStr(20,u_name+"123456");
			p.innerHTML += '<b><div class="brdcst">You are connected on channel '+port + '</div></b><br>';
			localStorage.setItem('name_c',u_name);
			localStorage.setItem('port',port);
			localStorage.setItem('id',c_id);
   			console.log("Connection established successfully");
			var msg={
				type:"conn",
				text:u_name,
				date:Date.now(),
				name:u_name,
				id:c_id
				};
			socket.send(JSON.stringify(msg));
			proc_contd();	
		}
		else if(flag==1)
		{
			p.innerHTML += '<b><div class="brdcst">You are reconnected on channel '+port + '</div></b><br>';
			console.log("Connection established successfully");
			var msg={
				type:"reconn",
				text:u_name,
				date:Date.now(),
				name:u_name,
				id:c_id
				};
			socket.send(JSON.stringify(msg));	
		}
		disst=0;
		document.getElementById('uimg').disabled = false;
   		document.getElementById("send").disabled=false;
		document.getElementById("mf").disabled=false;
		document.getElementById("cancel").disabled=false;
	};

	document.getElementById("send").onclick=function(){
		var mf= document.getElementById("mf");
		var ms = mf.value;
		if(ms=="")
		{
			alert("No message to be sent");
		}
		else
		{
			var msg={
				type:"message",
				text:ms,
				date:Date.now(),
				name:u_name
				};
			var time= new Date(msg.date);
			var timeStr = time.toLocaleTimeString();
			p.innerHTML += '<div class="clearfix"><div class="sent-tr"></div><div class="sent"><b>You ('+timeStr+') : </b><br>' + ms + '</div></div><br>';	
			socket.send(JSON.stringify(msg));
			mf.value="";
			document.getElementById("demo").scrollTop = document.getElementById("demo").scrollHeight;
		}
	};	

	socket.onmessage = function(event) {
		var text = "";
 		var msg = JSON.parse(event.data);
		var time = new Date(msg.date);
  		var timeStr = time.toLocaleTimeString();
		if(msg.type=="conn")
		{
			p.innerHTML += '<b><div class="brdcst">(' + timeStr + ') '+msg.text + ' joined on this channel.</div></b><br>';
			var msg1={
				type:"users",
				text:u_name,
				id:msg.id,
				date:Date.now(),
				name:u_name
				};
			socket.send(JSON.stringify(msg1));
		}
		else if(msg.type=="disconn")
		{
			p.innerHTML += '<b><div class="brdcst">(' + timeStr + ') '+msg.text + ' disconnected from this channel.</div></b><br>';	
		}
		else if(msg.type=="users")
		{
			if(msg.id==c_id)
			{
				p.innerHTML += '<b><div class="brdcst">(' + timeStr + ') '+msg.text + ' already connected on this channel.</div></b><br>';		
			}
		}
		else if(msg.type=="reconn")
		{
			p.innerHTML += '<b><div class="brdcst">(' + timeStr + ') '+msg.text + ' reconnected on this channel.</div></b><br>';
			var msg1={
				type:"users",
				text:u_name,
				id:msg.id,
				date:Date.now(),
				name:u_name
				};
			socket.send(JSON.stringify(msg1));	
		}
		else if(msg.type=="message")
		{
  			p.innerHTML += '<div class="clearfix"><div class="mesg-tr"></div><div class="mesg"><b>'+msg.name+ ' (' + timeStr + ') : </b><br>' + msg.text + '</div></div><br>';
		}
		else if(msg.type=="img-msg")
		{
			p.innerHTML += '<div class="clearfix"><div class="mesg-tr"></div><div class="mesg"><b>'+msg.name+ ' (' + timeStr + ') : </b><br>' + '<img src="' +decodeURIComponent(msg.text)+'" onclick = "javascript:showImage(this.src,false);" class="chatimg" alt="User Image">' + '</div></div><br>';
		}
		document.getElementById("demo").scrollTop = document.getElementById("demo").scrollHeight;
	};

	/*
	//OWNER	   : IG SOLUTIONS
	//AUTHOR   : PIYUSH GARG
	//START	   : MAY-2020
	*/

	document.getElementById("cancel").onclick=function() {
		var msg={
			type:"disconn",
			text:u_name,
			date:Date.now(),
			name:u_name
			};
		flag=0;
		disst=1;
		socket.send(JSON.stringify(msg));
		localStorage.removeItem('name_c');
		localStorage.removeItem('port');
		localStorage.removeItem('id');
		socket.close();
		document.getElementById("send").disabled=true;
		document.getElementById("mf").disabled=true;
		document.getElementById("cancel").disabled=true;
		document.getElementById("connectbtn").disabled=false;   
		document.getElementById("name").disabled=false;   
		document.getElementById("port").disabled=false;
		document.getElementById('uimg').disabled = true;   
		//document.getElementById("contd").disabled=true; 
		var stdchnl = document.getElementsByClassName('stdchnl');
		for(var i=0;i<3;i++)
		{
			stdchnl[i].disabled = false;
		}  
	}

	window.onbeforeunload = function () {
		var msg={
			type:"disconn",
			text:u_name,
			date:Date.now(),
			name:u_name
			};
		socket.send(JSON.stringify(msg));
		disst=1;
		socket.close();
	}

	socket.onclose = function(event) {
		p.innerHTML += '<b><div class="brdcst">You are disconnected from channel '+port + '</div></b><br>';
		document.getElementById("demo").scrollTop = document.getElementById("demo").scrollHeight;
		document.getElementById("connectbtn").disabled=false;   
		document.getElementById("cancel").disabled=true;   
 		console.log('Disconnected from WebSocket.');
		if(disst==0)
		{
			flag=1;
			connect();
		}
	};
}

function proc_contd()
{
	//var port_s=localStorage.getItem('port');
	//if(port_s!=null)
	{
		document.getElementById("chat").style.display="block";
		document.getElementById("channelselector").style.display="none";
	}
}


function connectstd(n)
{
	document.getElementById("cancel").click();
	
	var stdchnl = document.getElementsByClassName('stdchnl');
	for(var i=0;i<3;i++)
	{
		stdchnl[i].disabled = true;
	}
	setTimeout(function(){ 
	document.getElementById("port").value=n;
	u_name=document.getElementById("name").value;
	if(u_name==0)
	{
		alert("No name entered.");
	}
	else
	{
		flag=0;
		connect();
	}
	},300);
}

function go_back()
{
	document.getElementById("chat").style.display="none";
	document.getElementById("channelselector").style.display="table";
}
function insemoj(tem)
{
	var val1 = document.getElementById("mf").value;
	val1 = val1 + tem.text;
	document.getElementById("mf").value = val1;	
	document.getElementById("emojlist").style.display="block";
}

function emojl()
{
	var port_s=localStorage.getItem('port');
	if(port_s!=null)
	{
	 if(document.getElementById("emojlist").style.display=="block")	
	 {
		document.getElementById("emojlist").style.display="none";
	 }
	 else
	 {
	 	document.getElementById("emojlist").style.display="block";
	 }
	 window.onclick = function(event){
 		if (document.getElementById('emojlist').contains(event.target) || document.getElementById('emoji').contains(event.target)){
  		}
		else {
			document.getElementById("emojlist").style.display="none";
		}
	};
	}
}

function showImage(urls,IsSend)
{
	document.getElementById('userimage').src=urls;
	document.getElementById('img-overlay').style.display = "block";
	if(IsSend)
	{
		document.getElementById('senimg').style.display = "block";	
	}
	else
	{
		document.getElementById('senimg').style.display = "none";	
	}
}

function cancelimg()
{
	document.getElementById('img-overlay').style.display = "none";
}

function sendimg()
{
	var url = document.getElementById('userimage').src;
	url = encodeURIComponent(url);
	var msg={
				type:"img-msg",
				text:url,
				date:Date.now(),
				name:u_name
				};
			var time= new Date(msg.date);
			var timeStr = time.toLocaleTimeString();
			p.innerHTML += '<div class="clearfix"><div class="sent-tr"></div><div class="sent"><b>You ('+timeStr+') : </b><br><img src="' +decodeURIComponent(url)+'" onclick = "javascript:showImage(this.src,false);" class="chatimg" alt="User Image"></div></div><br>';	
			socket.send(JSON.stringify(msg));
			document.getElementById('img-overlay').style.display = "none";
			document.getElementById("demo").scrollTop = document.getElementById("demo").scrollHeight;
}

function uploadimgs(input)
{
	if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
		showImage(e.target.result,true);
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function saveHistory()
{
  var data = btoa(encodeURIComponent(p.innerHTML));
  var file = new File([data],"chat.igch",{type: "text/plain",});
  var d= new Date;
  var filename =d.toUTCString();
  filename +=".igch";
  	var elem = window.document.createElement('a');
  	elem.href = window.URL.createObjectURL(file);
  	elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();
	URL.revokeObjectURL(elem.href);        
        document.body.removeChild(elem);
}

function uploadFileAccess()
{
	document.getElementById("loadfile").click();	
}

function loadHistory(input)
{
	if (input.files[0])
	{
		var reader = new FileReader();
		reader.onload = function(e) {
			var current = p.innerHTML;
			p.innerHTML = decodeURIComponent(atob(e.target.result));
			p.innerHTML += current; 
			alert("Chat History Loaded Successfully.");
			}
		reader.readAsText(input.files[0]);
	}
}

/*
//OWNER	   : IG SOLUTIONS
//AUTHOR   : PIYUSH GARG
//START	   : MAY-2020
*/