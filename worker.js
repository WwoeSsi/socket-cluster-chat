var fs = require('fs');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

module.exports.run = function (worker) {
  console.log('   >> Worker PID:', process.pid);

  var app = require('express')();

  var httpServer = worker.httpServer;
  var scServer = worker.scServer;

  app.use(serveStatic(path.resolve(__dirname, 'public')));

  httpServer.on('request', app);

  var count = 0;
  var roomList = [{name: "cookies", members: []}, {name: "wizard", members: []}];


  /*
    In here we handle our incoming realtime connections and listen for events.
  */
  scServer.on('connection', function (socket) {

    // Some sample logic to show how to handle client events,
    // replace this with your own logic
    socket.on('signed_in', function() {
      socket.emit('loaded_room_list', roomList);
    });

    socket.on('joined_room', function(data) {
        for(var i = 0; i < roomList.length; i++) {
            if(data.name === roomList[i].name) {
                roomList[i].members.push(data.member);
                socket.emit('list_users', roomList[i].members);
            }
        }
    });

    socket.on('disconnect', function () {
      clearInterval(interval);
    });
  });
};
