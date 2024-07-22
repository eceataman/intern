import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
const UNUSED_COLOR = '#404040'; // Darker gray color for unused funds

function App() {
  const [balance, setBalance] = useState(null);
  const [CST, setCST] = useState(null);
  const [X_SECURITY_TOKEN, setXSecurityToken] = useState(null);
  const [positions, setPositions] = useState([]);
  const [createPositionStatus, setCreatePositionStatus] = useState(null);
  const [closePositionStatus, setClosePositionStatus] = useState(null);

  const [size, setSize] = useState('');
  const [searchTerm, setSearchTerm] = useState('silver');
  const [epics, setEpics] = useState(['SILVER', 'NATURALGAS']);
  const [marketData, setMarketData] = useState([]);


  const [activeTab, setActiveTab] = useState('positions');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showChart, setShowChart] = useState(false); // State to control chart visibility
  const [data, setData] = useState({});

  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);



  const fetchBalance = async () => {
    try {
      const response = await axios.post('http://localhost:5000/session');
      const { balance, CST, X_SECURITY_TOKEN } = response.data;
      setBalance(balance);
      setCST(CST);
      setXSecurityToken(X_SECURITY_TOKEN);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.get('http://localhost:5000/positions', {
          headers: {
            "CST": CST,
            "X-SECURITY-TOKEN": X_SECURITY_TOKEN
          }
        });
        const positions = response.data.positions || [];
        setPositions(positions);
        setShowChart(true); // Show chart after fetching positions
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const fetchCreatePosition = async (symbol, size) => {
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.post('http://localhost:5000/positions', {
          epic: symbol,
          size: size
        }, {
          headers: {
            "CST": CST,
            "X-SECURITY-TOKEN": X_SECURITY_TOKEN
          }
        });
        setCreatePositionStatus(response.data.message);
        fetchPositions();
      }
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const closePosition = async (dealId) => {
    try {
      if (CST && X_SECURITY_TOKEN && dealId) {
        const response = await axios.delete(`http://localhost:5000/positions/${dealId}`, {
          headers: {
            "CST": CST,
            "X-SECURITY-TOKEN": X_SECURITY_TOKEN
          }
        });
        setClosePositionStatus(response.data.message);
        fetchPositions();
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const fetchMarketData = async (searchTerm, epics) => {
    const params = new URLSearchParams({
      searchTerm: searchTerm,
      epics: epics.join(',')
    }).toString();
    try {
      if (CST && X_SECURITY_TOKEN) {
        const response = await axios.get(`http://localhost:5000/markets?${params}`, {
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



  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search?search_term=${searchTerm}`);
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const getPositionChartData = () => {
    const labels = positions.map(pos => pos.market.instrumentName);
    const data = positions.map(pos => pos.position.size * pos.position.level);

    // Use fixed colors based on the position count
    const colors = labels.map((_, i) => COLORS[i % COLORS.length]);

    // Calculate the total value of positions
    const totalPositionValue = data.reduce((sum, value) => sum + value, 0);

    // Calculate the unused funds
    const unusedFunds = balance - totalPositionValue;

    return {
      labels: [...labels, 'Cash'],
      datasets: [
        {
          label: 'Position Values and Cash',
          data: [...data, unusedFunds],
          backgroundColor: [...colors, UNUSED_COLOR]
        }
      ]
    };
  };

  const fetchData = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:5000/get-day-watch')
      .then(response => {
        const data = response.data.data.attributes;
        setTopGainers(data.top_gainers);
        setTopLosers(data.top_losers);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="top-bar">
          <button onClick={fetchBalance}>Fetch Balance</button>
          <h2>Balance: {balance}</h2>
        </div>
        <div className="main-content">
          <div className="sidebar">
            <h2>uygulama adı</h2>
            <button onClick={() => setActiveTab('positions')}>Positions</button>
            <button onClick={() => setActiveTab('marketData')}>Market Data</button>
            <button onClick={() => setActiveTab('yahooFinance')}>Yahoo Finance</button>
          </div>
          <div className="content">
            {activeTab === 'positions' && (
              <div className="positions">
                <h2>Positions</h2>
                <button onClick={fetchPositions}>Fetch Positions</button>
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
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map(position => (
                        <tr
                          key={position.position.dealId}
                          onClick={() => setSelectedPosition(position.position.dealId)}
                          style={{ backgroundColor: selectedPosition === position.position.dealId ? '#f0f0f0' : 'white' }}
                        >
                          <td>{position.market.instrumentName}</td>
                          <td>{position.position.direction}</td>
                          <td>{position.position.level}</td>
                          <td>{position.position.size}</td>
                          <td>{position.position.upl}</td>
                          <td>{position.position.dealId}</td>
                          <td>
                            {selectedPosition === position.position.dealId && (
                              <button onClick={() => closePosition(position.position.dealId)}>Close Position</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="chart-container">
                    {showChart && <Pie data={getPositionChartData()} />}
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'marketData' && (
              <div className="market-data">
                <h2>Market Data</h2>
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
                      <th>Action</th>
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
                        <td>
                          <input
                            type="number"
                            placeholder="Size"
                            onChange={(e) => setSize(e.target.value)}
                          />
                          <button onClick={() => fetchCreatePosition(market.epic, size)}>Buy</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p>{createPositionStatus}</p>
                <p>{closePositionStatus}</p>
              </div>
            )}
            {activeTab === 'yahooFinance' && (
              <div className="yahoo-finance">
                <h2>Yahoo Finance</h2>
                <input
                  type="text"
                  placeholder="Enter stock symbol"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={fetchData}>Search1</button>
                <div className="yahoo-finance-content">
                  <div className="stock-data">
                    {data.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Company Name</th>
                            <th>Symbol</th>
                            <th>Sector</th>
                            <th>Open</th>
                            <th>Current Price</th>
                            <th>Previous Close</th>
                            <th>Day High</th>
                            <th>Day Low</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((stock, index) => (
                            <tr key={index}>
                              <td>{stock.longName}</td>
                              <td>{stock.symbol}</td>
                              <td>{stock.sector}</td>
                              <td>{stock.open}</td>
                              <td>{stock.currentPrice}</td>
                              <td>{stock.previousClose}</td>
                              <td>{stock.dayHigh}</td>
                              <td>{stock.dayLow}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No data available</p>
                    )}
                  </div>
                  <div className="market-data-tables">
                    <div className="top-gainers">
                      <h3>Top Gainers</h3>
                      {topGainers.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Symbol</th>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topGainers.map(gainer => (
                              <tr key={gainer.id}>
                                <td>{gainer.slug}</td>
                                <td>{gainer.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No data available</p>
                      )}
                    </div>
                    <div className="top-losers">
                      <h3>Top Losers</h3>
                      {topLosers.length > 0 ? (
                        <table>
                          <thead>
                            <tr>
                              <th>Symbol</th>
                              <th>Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topLosers.map(loser => (
                              <tr key={loser.id}>
                                <td>{loser.slug}</td>
                                <td>{loser.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
