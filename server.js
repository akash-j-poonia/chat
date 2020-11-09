const { urlencoded } = require('express');

const express=require('express');
const { listeners } = require('process');
app=express();
const server=require('http').Server(app);
const io=require('socket.io')(server);

//app.use(urlencoded,{extended:true});
app.set('view engine','ejs');


app.use('/public', express.static('public'));
/*
app.get('/',(req,res)=>{
    res.render(__dirname+'/views/index.ejs');
});
*/

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });


 

connectedUsers={};
listeners_q=[];
venters=[];
socketsList={}

makeConnections=()=>{
    connectionMessages={}
    while(venters.length>0 && listeners_q.length>0){
       // console.log("in while ");
        var listenerSocket=listeners_q.shift();
        var venterSocket=venters.shift();
        connectedUsers[listenerSocket]=venterSocket;
        connectedUsers[venterSocket]=listenerSocket;
        connectionMessages[venterSocket]=listenerSocket;
        connectionMessages[listenerSocket]=venterSocket;
    }
    return connectionMessages;
}

io.on('connection', (socket) => {
    socketsList[socket.id]=socket;
    io.on('disconnect',()=>{
        console.log(socket.id+" disconnected");
    });
    socket.on('listener',(msg)=>{
        if(msg.listener)
            listeners_q.push(socket.id);
        else
            venters.push(socket.id);
        console.log('socket connection '+msg.listener+" "+socket.id);   
        console.log("ventors:"+venters.length+"listeners:"+listeners_q.length);
        newConnectionMessages=makeConnections(socket);
        
        Object.keys(newConnectionMessages).forEach(key=>{
            socketsList[key].to(newConnectionMessages[key]).emit('user joined',key);
           //console.log(socketsList[key]);
        });
        /*
        Object.keys(socketsList).forEach(key=>{
            console.log(key+" "+socketsList[key]);
        });
        */
    });
    
    socket.on('chat message', (msg) => {
        //console.log(socket.id+" "+msg);
        io.to(connectedUsers[socket.id]).emit('chat message',msg);
        //io.emit('chat message', msg);
    });
});




server.listen(3000, () => {
    console.log('listening on *:3000');
  });
