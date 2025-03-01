# tetherAssignment


Tether Crypto Data

📌 Overview

Tether Crypto Data is a cryptocurrency price collection service that fetches real-time market data from CoinGecko using Hyperswarm RPC and Hyperbee. It retrieves top 5 cryptocurrencies, fetches prices from the top 3 exchanges, and stores the data for real-time and historical access.

🚀 Features

✅ Fetches top 5 cryptocurrencies dynamically from CoinGecko.

✅ Retrieves prices in USDT.

✅ Fetches prices from the top 3 exchanges and calculates the average.

✅ Stores latest and historical prices using Hyperbee.

✅ Provides RPC endpoints for fetching latest and historical data.

✅ Automatically updates prices every 30 seconds.

📂 Project Structure

📦 tether-crypto-data
 ┣ 📂 src
 ┃ ┣ 📂 client            # Client-side scripts to interact with the RPC server
 ┃ ┃ ┣ 📜 rpcClient.js    # Fetches latest & historical prices
 ┃ ┃ ┣ 📜 testClient.js   # Tests RPC communication
 ┃ ┣ 📂 services          # Business logic for fetching crypto prices
 ┃ ┃ ┣ 📜 coingeckoService.js        # Fetches data from CoinGecko
 ┃ ┃ ┣ 📜 priceService.js            # Calculates average prices from exchanges
 ┃ ┣ 📂 storage           # Handles data storage
 ┃ ┃ ┣ 📜 hyperbeeStorage.js         # Manages Hyperbee database
 ┃ ┣ 📂 rpc               # Handles RPC communication
 ┃ ┃ ┣ 📜 rpcServer.js               # Defines RPC methods
 ┃ ┣ 📜 config.js                    # Configuration settings
 ┃ ┣ 📜 server.js                    # Main entry point - starts the RPC server
 ┃ ┣ 📜 scheduler.js                  # Periodic task manager
 ┣ 📂 db                             # Stores Hypercore database (auto-created)
 ┣ 📂 tests                          # Unit tests for different components
 ┣ 📜 .env                           # Stores environment variables (API keys, etc.)
 ┣ 📜 package.json                    # Dependencies and scripts
 ┣ 📜 README.md                       # Project documentation

🛠 Installation

1️⃣ Clone the Repository

git clone https://github.com/your-repo/tether-crypto-data.git
cd tether-crypto-data

2️⃣ Install Dependencies

npm install

3️⃣ Configure Environment Variables

Create a .env file and add API keys if necessary.

4️⃣ Start the Server

npm start

🎯 Usage

✅ Fetch Latest & Historical Prices

Start the server:

npm start

Then, run the client to fetch the data:

npm run client

✅ Test RPC Communication

npm run test-client

📌 RPC Endpoints

Method

Description

getLatestPrices

Fetches latest crypto prices from storage

getHistoricalPrices

Fetches historical crypto prices in a given time range

ping

Test RPC connection

📜 Available Scripts

Command

Description

npm start

Starts the RPC server

npm run dev

Starts the server in development mode with auto-restart

npm run client

Runs the client to fetch latest & historical prices

npm run test-client

Tests the RPC connection

npm run test

Runs Jest tests

npm run lint

Lints the codebase

npm run format

Formats code using Prettier

npm run clean

Deletes the database folder (for fresh start)

🔍 Future Improvements

📌 Enhance error handling for API failures.

📌 Implement caching for faster retrieval of historical data.

📌 Expand to support more cryptocurrencies dynamically.




