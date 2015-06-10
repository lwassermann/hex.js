'use strict';
/* eslint-disable no-var */

// setting up express and socket.io
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// setting up diffsync's DataAdapter
var DiffSync = require('diffsync');
var dataAdapter = new DiffSync.InMemoryDataAdapter();

// setting up the diffsync server
var diffSyncServer = new DiffSync.Server(dataAdapter, io);
void diffSyncServer;

app.use('lib', express.static('lib'));
app.use(express.static('./'));

// starting the http server
http.listen(4000, function() {});
