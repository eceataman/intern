from flask import Flask, jsonify, request
import yfinance as yf
import pandas as pd
import requests
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

BASE_URL = "https://demo-api-capital.backend-capital.com/api/v1"
API_KEY = "fNeecHCvG5OCsj1f"
IDENTIFIER = "2288777255yuceler@gmail.com"
PASSWORD = "Asd.1234"

@app.route('/session', methods=['POST']) 
def create_session():
    response = requests.post(f"{BASE_URL}/session", json={
        'identifier': IDENTIFIER,
        'password': PASSWORD
    }, headers={
        'X-CAP-API-KEY': API_KEY
    })

    if response.status_code == 200:
        data = response.json()
        account_info = data.get('accountInfo', {})
        balance = account_info.get('balance', 'Balance information not available.')
        CST = response.headers.get('cst')
        X_SECURITY_TOKEN = response.headers.get('x-security-token')
        return jsonify({'balance': balance, 'CST': CST, 'X_SECURITY_TOKEN': X_SECURITY_TOKEN})
    else:
        return jsonify({'error': 'Unable to create session'}), response.status_code
    
@app.route('/markets', methods=['GET'])
def get_markets():
    searchTerm = request.args.get('searchTerm')

    CST = request.headers.get('CST')
    X_SECURITY_TOKEN = request.headers.get('X_SECURITY_TOKEN')

    params = {
        'searchTerm': searchTerm
    }

    response = requests.get(f"{BASE_URL}/markets", params=params, headers={
        'X-SECURITY-TOKEN': X_SECURITY_TOKEN,
        'CST': CST
    })

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Unable to fetch market data'}), response.status_code
    
# CSV dosyasını yükle
df = pd.read_csv('stock.csv')

def search(search_term):
    # 'symbol' ve 'company_name' sütunlarında arama yap, 'search_term' ile başlayanları bul
    matching_rows = df[df.apply(
        lambda row: row['symbol'].lower().startswith(search_term) or row['company_name'].lower().startswith(search_term), 
        axis=1
    )]

    # İlk 10 sonucu seç
    result = matching_rows.head(10)

    # Sadece 'symbol' sütununu döndür ve listeye dönüştür
    symbols_list = result['symbol'].tolist()
   
    return symbols_list

def get_yahoo_finance_data(symbol_list):
    yahoo_data = []
    for symbol in symbol_list:
        yahoo = yf.Ticker(symbol)
        yahoo_data.append(yahoo.info)
    
    return yahoo_data
    
@app.route('/search', methods=['GET'])
def search_route():
    search_term = request.args.get('search_term', default='', type=str).lower()
    
    if not search_term:
        return jsonify({'error': 'search_term parametresi gerekli.'}), 400

    symbols_list = search(search_term)
    yahoo_data = get_yahoo_finance_data(symbols_list)
    
    return jsonify(yahoo_data)

@app.route('/get-day-watch', methods=['GET'])
def get_day_watch():
    url = "https://seeking-alpha.p.rapidapi.com/market/get-day-watch"
    
    headers = {
        'x-rapidapi-key': "ce12580fd9msh47004c31b7acdb0p150998jsn0b566d164510",
        'x-rapidapi-host': "seeking-alpha.p.rapidapi.com"
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Failed to fetch data"}), response.status_code
    
if __name__ == '__main__':
    app.run(debug=True)