const { fetchTopCryptos, fetchCryptoPrices } = require('./services/coingeckoService');
const { saveLatestPrice, saveHistoricalPrice } = require('./storage/hyperbeeStorage');

async function updatePrices() {
    try {
        const topCryptos = await fetchTopCryptos();
        const timestamp = Date.now();

        for (const cryptoId of topCryptos) {
            const { avgPrice, exchanges } = await fetchCryptoPrices(cryptoId);
            if (avgPrice) {
                const priceData = { id: cryptoId, price: avgPrice, exchanges, timestamp };
                await saveLatestPrice(cryptoId, priceData);
                await saveHistoricalPrice(cryptoId, timestamp, priceData);
            }
        }

        console.log("✅ Prices updated at", new Date(timestamp).toLocaleString());
    } catch (error) {
        console.error("❌ Error updating prices:", error);
    }
}

// Run every 30 seconds
setInterval(updatePrices, 30000);

module.exports = { updatePrices };
