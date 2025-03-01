const axios = require('axios');
const API_URL = 'https://api.coingecko.com/api/v3/coins/markets';

async function fetchTopCryptos() {
    try {
        const response = await axios.get(API_URL, {
            params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 5, page: 1 }
        });
        return response.data.map(coin => coin.id);
    } catch (error) {
        console.error("❌ Error fetching top cryptos:", error);
        return [];
    }
}

async function fetchCryptoPrices(cryptoId) {
    try {
        const tickersResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${cryptoId}/tickers`);
        const tickers = tickersResponse.data.tickers
            .filter(ticker => ticker.target === "USDT")
            .slice(0, 3);

        const avgPrice = tickers.reduce((sum, t) => sum + t.last, 0) / tickers.length;
        return { avgPrice, exchanges: tickers.map(e => e.market.name) };
    } catch (error) {
        console.error(`❌ Error fetching prices for ${cryptoId}:`, error);
        return { avgPrice: null, exchanges: [] };
    }
}

module.exports = { fetchTopCryptos, fetchCryptoPrices };
