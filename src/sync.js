import DiffSync from 'diffsync';
import Socket from 'socket.io-client';

// if installed from standalone script or browserify / webpack
const DiffSyncClient = DiffSync.Client;

// pass the connection and the id of the data you want to synchronize
const client = new DiffSyncClient(Socket(), 1);

let data;

client.on('connected', function() {
  // the initial data has been loaded,
  // you can initialize your application
  data = client.getData();
  global.data = data;
});

client.on('synced', function() {
  // an update from the server has been applied
  // you can perform the updates in your application now
});

client.initialize();
global.client = client;

export default client;
export {data};
