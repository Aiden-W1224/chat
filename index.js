var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

numUsers = 0;
let customID = 0;
let users = [];
let onlineUsers = [];
let names1 = [];
let names2 = [];
let count1 = -1;
let count2 = -1;
let nameChanged = 0;
let history = [];
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('chat message', function(data){
        let index = users.findIndex(a => a.id === socket.id);
        var changer = socket.id;
        console.log(history);
        // for(item in history){
        //     io.to(`${socket.id}`).emit(history[item]);
        // }
        if (data.msg[0] == "/") {
            var cmd = data.msg.match(/[a-z]+\b/)[0];
            var arg = data.msg.substr(cmd.length+2, data.msg.length);
            chat_command(cmd, arg);
        }
        function chat_command(cmd, arg) {
            if (cmd == 'nickcolor') {
                if (arg) {
                    r = arg.slice(0,2);
                    g = arg.slice(2,4);
                    b = arg.slice(4,6);
                    newColor = `rgb(${r},${g},${b})`
                    users[index].color = newColor;
                }
            }
            else if (cmd == 'nick'){
                count1++;
                //var remove = users[0].splice(1, 1, arg);
                users[index].user = arg;
                names1.push(arg);
                nameChanged = 1; 
                console.log(users);
            }
            // else if (cmd == 'nick' && numUsers == 2){
            //     count2++;
            //     var remove = users.splice(3, 1, arg);
            //     names2.push(arg);
            //     nameChanged = 2;
            // }
            
        }
        if (nameChanged == 0) {
            io.emit('chat message', {msg: data.msg, user: `User: ${socket.id}`, color: users[index].color, dateHours: new Date().getHours(), dateMinutes: new Date().getMinutes()});
            var messages = data.msg;
            history.push({
                msg: data.msg,
                user: users[index].user,
                color: users[index].color,
                dateHours: new Date().getHours(),
                dateMinutes: new Date().getMinutes()
            });
            console.log(history);
        }

        else if (nameChanged == 1) {
            // $('#messages').css('font-weight', 'bold');
            io.emit('chat message', {msg: data.msg, user: users[index].user, color: users[index].color, dateHours: new Date().getHours(), dateMinutes: new Date().getMinutes()});
            history.push({
                msg: data.msg,
                user: users[index].user,
                color: users[index].color,
                dateHours: new Date().getHours(),
                dateMinutes: new Date().getMinutes()
            });
            console.log(history);
        }
        // else if (nameChanged == 2){
        //     io.emit('chat message', {msg: data.msg, user: names2[count2] , dateHours: new Date().getHours(), dateMinutes: new Date().getMinutes()});
        // }

        // console.log(users);

    });

    //when user connects
    socket.on('im-here', function(data){
        numUsers++;
        users.push({
            id: socket.id,
            user: `User${numUsers}`,
            color: 'rgb(99, 0, 0)'
        });
        let index = users.findIndex(a => a.id === socket.id);
        io.emit('historyMsg', {hist: history, user: users[index].user, color: users[index].color, dateHours: new Date().getHours(), dateMinutes: new Date().getMinutes()});
        onlineUsers.push({user: users[index].user});
        io.emit('displayOnline', onlineUsers);
        console.log(users);
    });
    
    // socket.on('disconnect', function(){
    //     // Get the index of the element in your list with that socket
    //     // Use that index to find the name.
    //     x =  users.findIndex(socket.id);
    //     console.log('User: ' + x);
    // });    

    socket.emit('dateHours', { dateHours: new Date().getHours() });
    socket.emit('dateMinutes', { dateMinutes: new Date().getMinutes() });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});
