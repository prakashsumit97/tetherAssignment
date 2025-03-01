'use strict';

const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');

const main = async () => {
    // Setup DHT to discover the RPC server
    const dht = new DHT({ bootstrap: [{ host: '127.0.0.1', port: 30001 }] });
    await dht.ready();

    // Replace with the actual public key of the RPC server (printed in server logs)
    const serverPubKey = Buffer.from('YOUR_SERVER_PUBLIC_KEY', 'hex');

    // Initialize RPC connection
    const rpc = new RPC({ dht });

    try {
        // 🔹 Fetch Latest Prices
        console.log("\n📊 Fetching Latest Crypto Prices...");
        const latestPricesPayload = JSON.stringify(['bitcoin', 'ethereum', 'ripple']);
        const latestPricesRaw = await rpc.request(serverPubKey, 'getLatestPrices', Buffer.from(latestPricesPayload, 'utf-8'));
        const latestPrices = JSON.parse(latestPricesRaw.toString('utf-8'));

        console.log('✅ Latest Prices:');
        Object.entries(latestPrices).forEach(([coin, data]) => {
            console.log(`🔹 ${coin.toUpperCase()}: $${data.price} (From Exchanges: ${data.exchanges.join(', ')})`);
        });

        // 🔹 Fetch Historical Prices (Last 1 Hour)
        console.log("\n📈 Fetching Historical Crypto Prices (Last 1 Hour)...");
        const now = Date.now();
        const oneHourAgo = now - 3600 * 1000;
        const historicalPricesPayload = JSON.stringify({
            pairs: ['bitcoin', 'ethereum'],
            from: oneHourAgo,
            to: now
        });

        const historicalPricesRaw = await rpc.request(serverPubKey, 'getHistoricalPrices', Buffer.from(historicalPricesPayload, 'utf-8'));
        const historicalPrices = JSON.parse(historicalPricesRaw.toString('utf-8'));

        console.log('✅ Historical Prices:');
        Object.entries(historicalPrices).forEach(([coin, dataArray]) => {
            console.log(`🔹 ${coin.toUpperCase()}:`);
            dataArray.forEach(entry => {
                console.log(`   - $${entry.price} (Time: ${new Date(entry.timestamp).toLocaleString()})`);
            });
        });

    } catch (error) {
        console.error("❌ Error fetching data:", error.message);
    }

    // Cleanup
    await rpc.destroy();
    await dht.destroy();
};

main().catch(console.error);
