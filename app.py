import os
import openai
import logging
import dotenv
from flask import Flask, render_template, request, jsonify

# .env dosyasını yükle
dotenv.load_dotenv()

# Ortam değişkenlerini yükle
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_KEY")
deployment = os.getenv("AZURE_OAI_DEPLOYMENT")

# Kimlik bilgilerini kontrol et
if not all([endpoint, api_key, deployment]):
    raise ValueError("Some environment variables are missing. Please check your .env file.")

# Flask uygulaması
app = Flask(__name__)

# OpenAI istemcisi oluştur
client = openai.AzureOpenAI(
    base_url=f"{endpoint}/openai/deployments/{deployment}/extensions",
    api_key=api_key,
    api_version="2023-08-01-preview"
)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.form["message"]
    try:
        response = client.chat.completions.create(
            model=deployment,
            temperature=0.7,
            max_tokens=4096,
            top_p=0.95,
            messages=[
                {
                    "role": "user",
                    "content": user_message
                },
            ],
            extra_body={
                "dataSources": [
                    {
                        "type": "AzureCognitiveSearch",
                        "parameters": {
                            "endpoint": os.getenv("AZURE_SEARCH_ENDPOINT"),
                            "key": os.getenv("AZURE_SEARCH_KEY"),
                            "indexName": os.getenv("AZURE_SEARCH_INDEX"),
                            "queryType": "semantic",
                            "semanticConfiguration": "config"
                        }
                    }
                ]
            }
        )
        
        return jsonify({"response": response.choices[0].message.content})
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)