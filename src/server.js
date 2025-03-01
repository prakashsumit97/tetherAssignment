const DHT = require('hyperdht');
const { startRpcServer } = require('./rpc/rpcServer');
const { updatePrices } = require('./scheduler');

(async () => {
    const dht = new DHT({ port: 40001, bootstrap: [{ host: '127.0.0.1', port: 30001 }] });
    await dht.ready();
    await startRpcServer(dht);
    updatePrices(); // Start periodic price fetching
})();
