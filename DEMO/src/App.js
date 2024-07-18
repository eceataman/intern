import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [balance, setBalance] = useState(null);
  const [CST, setCST] = useState(null);
  const [X_SECURITY_TOKEN, setXSecurityToken] = useState(null);
  const [positions, setPositions] = useState([]);
  const [createposition, setCreateposition] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [size, setSize] = useState('');
  const [dealId, setDealId] = useState('');
  const [searchTerm, setSearchTerm] = useState('silver');
  const [epics, setEpics] = useState(['SILVER', 'NATURALGAS']);
  const [marketData, setMarketData] = useState([]);

  const BASE_URL = "https://demo-api-capital.backend-capital.com/api/v1";
  const API_KEY = "fNeecHCvG5OCsj1f";
  const IDENTIFIER = "2288777255yuceler@gmail.com";
  const PASSWORD = "Asd.1234";

  const fetchBalance = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/session`,
        {
          identifier: IDENTIFIER,
          password: PASSWORD
        },
        {
          headers: {
            "X-CAP-API-KEY": API_KEY
          }
        }
      );

      const accountInfo = response.data.accountInfo || {};
      const balance = accountInfo.balance || 'Balance information not available.';
      setBalance(balance);

      const CST = response.headers['cst'];
      const X_SECURITY_TOKEN = response.headers['x-security-token'];
      setCST(CST);
      setXSecurityToken(X_SECURITY_TOKEN);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.get(`${BASE_URL}/positions`,
          {
            headers: {
              "CST": CST,
              "X-SECURITY-TOKEN": X_SECURITY_TOKEN
            }
          }
        );

        const positions = response.data.positions || [];
        setPositions(positions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchCreatePosition = async () => {
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.post(`${BASE_URL}/positions`,
          {
            "epic": symbol,
            "direction": "BUY",
            "size": size,
          },
          {
            headers: {
              "CST": CST,
              "X-SECURITY-TOKEN": X_SECURITY_TOKEN
            }
          }
        );
        setCreateposition(response.data ? "Position Created" : "Position Not Created");
        fetchPositions(); // Refresh positions after creation
      }
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const closePosition = async () => {
    try {
      if (CST && X_SECURITY_TOKEN && dealId) {
        await axios.delete(`${BASE_URL}/positions/${dealId}`,
          {
            headers: {
              "CST": CST,
              "X-SECURITY-TOKEN": X_SECURITY_TOKEN
            }
          }
        );
        console.log(`Closed position with dealId: ${dealId}`);
        setDealId(''); // Clear the dealId input field after closing the position
        fetchPositions(); // Refresh positions list
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const fetchMarketData = async (searchTerm, epics) => {
    const params = `searchTerm=${searchTerm}&epics=${epics.join(',')}`;
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.get(`${BASE_URL}/markets?${params}`, {
          headers: {
            "X-SECURITY-TOKEN": X_SECURITY_TOKEN,
            "CST": CST
          }
        });
        setMarketData(response.data.markets || []);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Balance Information</h1>
        <h2>Balance: {balance}</h2>
        <h2>Positions:</h2>
        <div>
          <table>
            <thead>
              <tr>
                <th>Instrument Name</th>
                <th>Direction</th>
                <th>Level</th>
                <th>Size</th>
                <th>UPL</th>
                <th>Deal ID</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(position => (
                <tr key={position.position.dealId}>
                  <td>{position.market.instrumentName}</td>
                  <td>{position.position.direction}</td>
                  <td>{position.position.level}</td>
                  <td>{position.position.size}</td>
                  <td>{position.position.upl}</td>
                  <td>{position.position.dealId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2>Create Position: {createposition}</h2>

        <button onClick={fetchBalance}>Fetch Balance</button>
        <button onClick={fetchPositions}>Fetch Positions</button>
        <div>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol (e.g. TSLA)"
          />
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Enter size (e.g. 10)"
          />
          <button onClick={fetchCreatePosition}>Create Position</button>
        </div>

        <h2>Close Position:</h2>
        <div>
          <input
            type="text"
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
            placeholder="Enter deal ID"
          />
          <button onClick={closePosition}>Close Position</button>
        </div>

        <h2>Market Data:</h2>
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term (e.g. silver)"
          />
          <input
            type="text"
            value={epics.join(',')}
            onChange={(e) => setEpics(e.target.value.split(','))}
            placeholder="Enter EPICs (comma separated, e.g. SILVER,NATURALGAS)"
          />
          <button onClick={() => fetchMarketData(searchTerm, epics)}>Fetch Market Data</button>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Net Change</th>
                <th>High</th>
                <th>Low</th>
                <th>Percentage Change</th>
                <th>Bid</th>
                <th>Offer</th>
              </tr>
            </thead>
            <tbody>
              {marketData.map(market => (
                <tr key={market.symbol}>
                  <td>{market.symbol}</td>
                  <td>{market.netChange}</td>
                  <td>{market.high}</td>
                  <td>{market.low}</td>
                  <td>{market.percentageChange}</td>
                  <td>{market.bid}</td>
                  <td>{market.offer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </header>
    </div>
  );
}

export default App;
