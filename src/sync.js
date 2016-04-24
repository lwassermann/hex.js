import DiffSync from 'diffsync';
import Socket from 'socket.io-client';

const Rx = global.Rx;

function synchronize(id) {
  const client = new DiffSync.Client(Socket(), id);
  global.client = client;

  client.initialize();

  return {
    stream: Rx.Observable.create(function(observer) {
      // pass the connection and the id of the data you want to synchronize

      client.on('connected', function() {
        observer.onNext(client.getData());
      });

      client.on('synced', function() {
        observer.onNext(client.getData());
      });

      return function() {
        client.scheduled = true;
        client.socket.close();
      };
    }).publish().refCount(),
    sync: () => client.sync(),
    client: client
  };
}

export default synchronize;
