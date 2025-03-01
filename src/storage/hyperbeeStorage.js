const Hypercore = require('hypercore');
const Hyperbee = require('hyperbee');

const hcore = new Hypercore('./db/rpc-server');
const hbee = new Hyperbee(hcore, { keyEncoding: 'utf-8', valueEncoding: 'json' });

async function saveLatestPrice(cryptoId, priceData) {
    await hbee.put(`crypto:latest:${cryptoId}`, Buffer.from(JSON.stringify(priceData), 'utf-8'));
}

async function saveHistoricalPrice(cryptoId, timestamp, priceData) {
    await hbee.put(`crypto:history:${cryptoId}:${timestamp}`, Buffer.from(JSON.stringify(priceData), 'utf-8'));
}

async function getLatestPrice(cryptoId) {
    const data = await hbee.get(`crypto:latest:${cryptoId}`);
    return data?.value ? JSON.parse(data.value.toString('utf-8')) : null;
}

async function getHistoricalPrices(cryptoId, from, to) {
    const range = hbee.createReadStream({ gte: `crypto:history:${cryptoId}:${from}`, lte: `crypto:history:${cryptoId}:${to}` });
    const prices = [];
    for await (const data of range) {
        prices.push(JSON.parse(data.value.toString('utf-8')));
    }
    return prices;
}

module.exports = { saveLatestPrice, saveHistoricalPrice, getLatestPrice, getHistoricalPrices };
