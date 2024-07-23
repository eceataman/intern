import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';
import TradingViewWidget from './TradingViewWidget';

function App() {
  const [CST, setCST] = useState(null);
  const [X_SECURITY_TOKEN, setXSecurityToken] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [symbolArray, setSymbolArray] = useState([]);
  const [activeTab, setActiveTab] = useState('positions');
  const [savedStockData, setSavedStockData] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    sessionstart();
    const savedData = JSON.parse(localStorage.getItem('savedStockData')) || [];
    setSavedStockData(savedData);
  }, []);

  useEffect(() => {
    localStorage.setItem('savedStockData', JSON.stringify(savedStockData));
  }, [savedStockData]);

  // Session başlangıç fonksiyonu
  const sessionstart = async () => {
    try {
      const response = await axios.post('http://localhost:5000/session');
      const { CST, X_SECURITY_TOKEN } = response.data;
      setCST(CST);
      setXSecurityToken(X_SECURITY_TOKEN);
    } catch (error) {
      console.error('Error fetching session data:', error);
    }
  };

  // Arama işlevi
  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search?search_term=${searchTerm}`);
      const marketResponse = await axios.get('http://localhost:5000/markets', {
        headers: {
          "X-SECURITY-TOKEN": X_SECURITY_TOKEN,
          "CST": CST
        }
      });
      setMarketData(marketResponse.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching search data:', error);
    }
  };

  // Fiyat almak için yardımcı fonksiyon
  const getPrice = (symbol, index) => {
    const currentPrice = data[index]?.currentPrice || 0;
    const uniquePairs = getUniqueSymbolPairs();
    let resultPrice = currentPrice;

    symbolArray.push(`${data[index]?.symbol},${currentPrice}`);

    uniquePairs.forEach(({ epic, bid }) => {
      if (symbol === epic) {
        resultPrice = bid;
      }
    });

    return resultPrice;
  };

  // Benzersiz sembol çiftlerini almak için fonksiyon
  const getUniqueSymbolPairs = () => {
    const uniquePairs = new Set();
    marketData.markets.forEach(marketItem => {
      const pair = `${marketItem.epic},${marketItem.bid}`;
      uniquePairs.add(pair);
    });
    return Array.from(uniquePairs).map(pair => {
      const [epic, bid] = pair.split(',');
      return { epic, bid };
    });
  };

  // Satın alma işlevi
  const handleBuy = (stock, index) => {
    const adjustedPrice = getPrice(stock.symbol, index);
    const stockData = {
      longName: stock.longName,
      symbol: stock.symbol,
      sector: stock.sector,
      open: stock.open,
      currentPrice: adjustedPrice,
      newcurrentPrice: "",
      previousClose: stock.previousClose,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      size: '1',
      priceChange: "",
    };

    setSavedStockData(prevData => [...prevData, stockData]);
  };

  // Güncelleme işlevi
  const handleUpdate = async () => {
    try {
      const updatedData = await Promise.all(savedStockData.map(async (stock) => {
        const params = new URLSearchParams({ searchTerm: stock.symbol }).toString();
        const marketResponse = await axios.get(`http://localhost:5000/markets?${params}`, {
          headers: { "X-SECURITY-TOKEN": X_SECURITY_TOKEN, "CST": CST }
        });

        const newCurrentPrice = marketResponse.data.markets[0]?.bid || stock.currentPrice;
        const priceChange = ((newCurrentPrice - stock.currentPrice) / stock.currentPrice) * 100;
        const formattedPriceChange = `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`;

        return {
          ...stock,
          newcurrentPrice: newCurrentPrice,
          priceChange: formattedPriceChange
        };
      }));

      setSavedStockData(updatedData);
    } catch (error) {
      console.error('Error updating stock data:', error);
    }
  };

  // Silme işlevi
  const handleDelete = (index) => {
    const updatedStockData = savedStockData.filter((_, i) => i !== index);
    setSavedStockData(updatedStockData);
  };

  // Grafik verilerini oluşturma
  const generateChartData = () => {
    const labels = savedStockData.map(stock => stock.symbol);
    const data = savedStockData.map(stock => {
      const priceChange = ((stock.newcurrentPrice - stock.currentPrice) / stock.currentPrice) * 100;
      return priceChange;
    });
    const backgroundColor = savedStockData.map(stock => {
      const priceChange = ((stock.newcurrentPrice - stock.currentPrice) / stock.currentPrice) * 100;
      return priceChange >= 0 ? 'green' : 'red';
    });

    return {
      labels,
      datasets: [{
        label: 'Fiyat Değişimi (%)',
        data,
        backgroundColor,
        borderColor: '#333',
        borderWidth: 1
      }]
    };
  };

  // Stok seçme işlevi
  const handleSelectStock = (stock) => {
    setSelectedStock(stock);
  };

  // Görüntüleme butonuna tıklama işlevi
  const handleViewClick = (stock) => {
    let modifiedSymbol = stock.symbol;
    if (modifiedSymbol.includes('.')) {
      modifiedSymbol = modifiedSymbol.split('.')[0]; // Noktadan önceki kısmı al
    }
    setSelectedStock({
      ...stock,
      symbol: modifiedSymbol
    });
  };

  // Sekme değişikliğinde güncelleme işlevini çağır
  useEffect(() => {
    if (activeTab === 'stock') {
      handleUpdate();
    }
  }, [activeTab]);

  return (
    <div className="App">
      <div className="sidebar">
        <h2>Yatırım Asistanı</h2>
        <button onClick={() => setActiveTab('main')}>Ana Sayfa</button>
        <button onClick={() => setActiveTab('stock')}>Stoklar</button>
      </div>
      <div className="main-content">
        {activeTab === 'main' && (
          <div className="main">
            <input
              className="search-bar"
              type="text"
              placeholder="Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search" onClick={handleSearch}>Ara</button>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Şirket Adı</th>
                    <th>Sembol</th>
                    <th>Sektör</th>
                    <th>Açılış</th>
                    <th>Şu Anki Fiyat</th>
                    <th>Önceki Kapanış</th>
                    <th>Günlük Yüksek</th>
                    <th>Günlük Düşük</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((stock, index) => (
                    <tr key={index} onClick={() => handleSelectStock(stock)}>
                      <td>{stock.longName}</td>
                      <td>{stock.symbol}</td>
                      <td>{stock.sector}</td>
                      <td>{stock.open}</td>
                      <td>{getPrice(stock.symbol, index)}</td>
                      <td>{stock.previousClose}</td>
                      <td>{stock.dayHigh}</td>
                      <td>{stock.dayLow}</td>
                      <td>
                        <button onClick={() => handleBuy(stock, index)}>Satın Al</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'stock' && (
          <div className="stock">
            <button onClick={handleUpdate}>Güncelle</button>
            <div className="chart-container">
              <div className="chart">
                <Bar data={generateChartData()} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: function (tooltipItem) {
                          return `${tooltipItem.label}: ${tooltipItem.raw.toFixed(2)}%`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true
                    },
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 0.05,
                        callback: function (value) {
                          return value.toFixed(2) + '%'; // İki basamağa yuvarla ve yüzde ekle
                        }
                      }
                    }
                  }
                }} />
              </div>
              <div className="tradingview-widget">
                {selectedStock ? (
                  <TradingViewWidget symbol={selectedStock.symbol} />
                ) : (
                  <p>Bir hisse seçin</p>
                )}
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Şirket Adı</th>
                    <th>Simge</th>
                    <th>Mevcut Fiyat</th>
                    <th>Yeni Fiyat</th>
                    <th>Fiyat Değişimi</th>
                    <th>Sil</th>
                    <th>Görüntüle</th>
                  </tr>
                </thead>
                <tbody>
                  {savedStockData.map((stock, index) => (
                    <tr key={index}>
                      <td>{stock.longName}</td>
                      <td>{stock.symbol}</td>
                      <td>{stock.currentPrice}</td>
                      <td>{stock.newcurrentPrice}</td>
                      <td>{stock.priceChange}</td>
                      <td>
                        <button onClick={() => handleDelete(index)}>Sil</button>
                      </td>
                      <td>
                        <button onClick={() => handleViewClick(stock)}>Görüntüle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
