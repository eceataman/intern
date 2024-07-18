from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

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


@app.route('/positions', methods=['GET'])
def get_positions():
    CST = request.headers.get('CST')
    X_SECURITY_TOKEN = request.headers.get('X_SECURITY_TOKEN')

    response = requests.get(f"{BASE_URL}/positions", headers={
        'CST': CST,
        'X-SECURITY-TOKEN': X_SECURITY_TOKEN
    })

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Unable to fetch positions'}), response.status_code


@app.route('/positions', methods=['POST'])
def create_position():
    data = request.json
    epic = data.get('epic')
    size = data.get('size')

    CST = request.headers.get('CST')
    X_SECURITY_TOKEN = request.headers.get('X_SECURITY_TOKEN')

    response = requests.post(f"{BASE_URL}/positions", json={
        'epic': epic,
        'direction': 'BUY',
        'size': size
    }, headers={
        'CST': CST,
        'X-SECURITY-TOKEN': X_SECURITY_TOKEN
    })

    if response.status_code == 200:
        return jsonify({'message': 'Position created'})
    else:
        return jsonify({'error': 'Unable to create position'}), response.status_code


@app.route('/positions/<dealId>', methods=['DELETE'])
def close_position(dealId):
    CST = request.headers.get('CST')
    X_SECURITY_TOKEN = request.headers.get('X_SECURITY_TOKEN')

    response = requests.delete(f"{BASE_URL}/positions/{dealId}", headers={
        'CST': CST,
        'X-SECURITY-TOKEN': X_SECURITY_TOKEN
    })

    if response.status_code == 200:
        return jsonify({'message': f'Closed position with dealId: {dealId}'})
    else:
        return jsonify({'error': 'Unable to close position'}), response.status_code


@app.route('/markets', methods=['GET'])
def get_markets():
    searchTerm = request.args.get('searchTerm')
    epics = request.args.get('epics')

    CST = request.headers.get('CST')
    X_SECURITY_TOKEN = request.headers.get('X_SECURITY_TOKEN')

    params = {
        'searchTerm': searchTerm,
        'epics': epics
    }

    response = requests.get(f"{BASE_URL}/markets", params=params, headers={
        'X-SECURITY-TOKEN': X_SECURITY_TOKEN,
        'CST': CST
    })

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({'error': 'Unable to fetch market data'}), response.status_code


if __name__ == '__main__':
    app.run(debug=True)
