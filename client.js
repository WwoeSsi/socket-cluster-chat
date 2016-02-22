var SocketCluster = require('socketcluster-client');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

var user;

rl.question("What's your name bitch? ", function(name){
    user = name;
    rl.setPrompt(user + "> ");
    socket.emit('signed_in');
});

var options = {
    port: 8000,
    hostname: "localhost"
};

var socket = SocketCluster.connect(options);

var chatChannel, roomList;
var foundChannel = false;

socket.on('loaded_room_list', function(rooms) {
    roomList = rooms;
    console.log('\nChoose from room list: ');
    for(var i = 0; i < rooms.length; i++) {
        console.log(roomList[i].name);
    }
    console.log('\n');
    selectChatRoom()
});

function selectChatRoom() {
    rl.prompt();
    rl.on('line', function(line) {
        var roomSelection = line.trim();
        for(var j = 0; j < roomList.length; j++) {
            if(roomSelection === roomList[j].name) {
                foundChannel = true;
                console.log('joined room: ', roomSelection);
                chatChannel = socket.subscribe(roomSelection);
                chatChannel.watch(function(msg) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    console.log(msg);
                    rl.prompt();
                });

                socket.emit('joined_room', {name: roomSelection, member: user});
                socket.on('list_users', function(users){
                  console.log('users in channel: ' + users.join(", "));
                  startChat();
                  return;
                });
            }
        }

        if(foundChannel === false) {
            console.log("Please select a channel");
            selectChatRoom();
        }
    });
}

function startChat() {
    rl.prompt();
    rl.on('line', function(line) {
        var userInput = line.trim();
        chatChannel.publish(user + ": " + userInput);
    });
}
