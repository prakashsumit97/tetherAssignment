'use strict';

const RPC = require('@hyperswarm/rpc');
const DHT = require('hyperdht');
const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');
const crypto = require('crypto');
const axios = require('axios');

// CoinGecko API URL
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const TOP_5_CRYPTOS = ['bitcoin', 'ethereum', 'ripple', 'cardano', 'solana'];

const main = async () => {
    // Setup Hyperbee
    const hcore = new Hypercore('./db/rpc-server');
    const hbee = new Hyperbee(hcore, { keyEncoding: 'utf-8', valueEncoding: 'json' });
    await hbee.ready();

    // Setup DHT
    let dhtSeedRaw = await hbee.get('dht-seed');
    let dhtSeed = dhtSeedRaw?.value ? Buffer.from(dhtSeedRaw.value) : crypto.randomBytes(32);
    if (!dhtSeedRaw) {
        await hbee.put('dht-seed', dhtSeed);
    }

    const dht = new DHT({
        port: 40001,
        keyPair: DHT.keyPair(dhtSeed),
        bootstrap: [{ host: '127.0.0.1', port: 30001 }]
    });
    await dht.ready();

    // Setup RPC
    let rpcSeedRaw = await hbee.get('rpc-seed');
    let rpcSeed = rpcSeedRaw?.value ? Buffer.from(rpcSeedRaw.value) : crypto.randomBytes(32);
    if (!rpcSeedRaw) {
        await hbee.put('rpc-seed', rpcSeed);
    }

    const rpc = new RPC({ seed: rpcSeed, dht });
    const rpcServer = rpc.createServer();
    await rpcServer.listen();
    console.log('RPC Server started on public key:', rpcServer.publicKey.toString('hex'));


    // bind handlers to rpc server
    rpcServer.respond('ping', async (reqRaw) => {
        // reqRaw is Buffer, we need to parse it
        const req = JSON.parse(reqRaw.toString('utf-8'))

        const resp = { nonce: req.nonce + 1 }

        // we also need to return buffer response
        const respRaw = Buffer.from(JSON.stringify(resp), 'utf-8')
        return respRaw
    })


    rpcServer.respond('getLatestPrices', async (reqRaw) => {
        let requestedPairs;
        try {
            requestedPairs = JSON.parse(reqRaw.toString('utf-8'));
        } catch (error) {
            console.error("❌ Error parsing request:", error);
            return Buffer.from(JSON.stringify({ error: "Invalid request format" }), 'utf-8');
        }

        const results = {};
        for (const pair of requestedPairs) {
            const latestRaw = await hbee.get(`crypto:latest:${pair}`);
            if (latestRaw?.value) {
                console.log(latestRaw.value, Buffer.from(latestRaw.value).toString('utf-8'));
                results[pair] = latestRaw.value; // ✅ Correctly parse Buffer
            }
        }

        return Buffer.from(JSON.stringify(results), 'utf-8');
    });

    rpcServer.respond('getHistoricalPrices', async (reqRaw) => {
        let requestData;
        try {
            requestData = JSON.parse(reqRaw.toString('utf-8'));
        } catch (error) {
            console.error("❌ Error parsing request:", error);
            return Buffer.from(JSON.stringify({ error: "Invalid request format" }), 'utf-8');
        }

        const { pairs, from, to } = requestData;
        const results = {};

        for (const pair of pairs) {
            const range = hbee.createReadStream({
                gte: `crypto:history:${pair}:${from}`,
                lte: `crypto:history:${pair}:${to}`
            });

            results[pair] = [];
            for await (const data of range) {
                results[pair].push(data.value); // ✅ Correct Buffer parsing

            }
        }

        return Buffer.from(JSON.stringify(results), 'utf-8');
    });


    // Fetch Crypto Prices from CoinGecko
    async function fetchCryptoPrices() {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 5,
                    page: 1,
                    sparkline: false
                }
            });

            if (!response.data || response.data.length === 0) {
                throw new Error("No data received from CoinGecko");
            }

            const timestamp = Date.now();
            const prices = response.data.map(coin => ({
                id: coin.id,
                name: coin.name || "Unknown",
                symbol: coin.symbol || "N/A",
                price: coin.current_price || 0,
                timestamp
            }));

            for (const coin of prices) {
                if (coin.id && coin.price !== undefined) {
                    await hbee.put(`crypto:latest:${coin.id}`, Buffer.from(JSON.stringify(coin), 'utf-8'));
                    await hbee.put(`crypto:history:${coin.id}:${timestamp}`, Buffer.from(JSON.stringify(coin), 'utf-8'));
                } else {
                    console.warn(`⚠️ Skipping invalid entry:`, coin);
                }
            }

            console.log('✅ Prices updated:', prices);
        } catch (error) {
            console.error('❌ Error fetching prices:', error);
        }
    }

    // Schedule Data Fetching Every 30 Seconds
    setInterval(fetchCryptoPrices, 30000);
};

main().catch(console.error);
