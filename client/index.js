'use strict'

const RPC = require('@hyperswarm/rpc')
const DHT = require('hyperdht')
const Hypercore = require('hypercore')
const Hyperbee = require('hyperbee')
const crypto = require('crypto')

const main = async () => {
    // hyperbee db
    const hcore = new Hypercore('./db/rpc-client')
    const hbee = new Hyperbee(hcore, { keyEncoding: 'utf-8', valueEncoding: 'binary' })
    await hbee.ready()

    // resolved distributed hash table seed for key pair
    let dhtSeed = (await hbee.get('dht-seed'))?.value
    if (!dhtSeed) {
        // not found, generate and store in db
        dhtSeed = crypto.randomBytes(32)
        await hbee.put('dht-seed', dhtSeed)
    }

    // start distributed hash table, it is used for rpc service discovery
    const dht = new DHT({
        port: 50001,
        keyPair: DHT.keyPair(dhtSeed),
        bootstrap: [{ host: '127.0.0.1', port: 30001 }] // note boostrap points to dht that is started via cli
    })
    await dht.ready()

    // public key of rpc server, used instead of address, the address is discovered via dht
    const serverPubKey = Buffer.from('bfe8550ab3b9a23c64ebd5c2d8dcb0656a0a135d7953b1ef8c1849585e6b538f', 'hex')

    // rpc lib
    const rpc = new RPC({ dht })


    // 🔹 Fetch Latest Prices
    const latestPricesPayload = JSON.stringify(['bitcoin', 'ethereum', 'ripple']);
    const latestPricesRaw = await rpc.request(serverPubKey, 'getLatestPrices', Buffer.from(latestPricesPayload, 'utf-8'));
    const latestPrices = JSON.parse(latestPricesRaw.toString('utf-8'));
    // console.log('📊 Latest Prices:', latestPrices);

    for (let key in latestPrices) {
        let data = JSON.parse(Buffer.from(latestPrices[key]).toString('utf-8'));
        console.log(`The Latest price of ${key} is ${data.price}`)
    }



    // 🔹 Fetch Historical Prices (Last 1 Hour Example)
    // const now = Date.now();
    // const oneHourAgo = now - 3600 * 1000;
    // const historicalPricesPayload = JSON.stringify({
    //     pairs: ['bitcoin', 'ethereum'],
    //     from: oneHourAgo,
    //     to: now
    // });
    // const historicalPricesRaw = await rpc.request(serverPubKey, 'getHistoricalPrices', Buffer.from(historicalPricesPayload, 'utf-8'));
    // const historicalPrices = JSON.parse(historicalPricesRaw.toString('utf-8'));
    // console.log('📈 Historical Prices:', historicalPrices);




    // payload for request
    const payload = { nonce: 126 }
    const payloadRaw = Buffer.from(JSON.stringify(payload), 'utf-8')

    // sending request and handling response
    // see console output on server code for public key as this changes on different instances
    const respRaw = await rpc.request(serverPubKey, 'ping', payloadRaw)
    const resp = JSON.parse(respRaw.toString('utf-8'))
    console.log(resp) // { nonce: 127 }

    // closing connection
    await rpc.destroy()
    await dht.destroy()
}

main().catch(console.error)