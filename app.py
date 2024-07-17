import os
import openai
import logging
import dotenv
from flask import Flask, render_template, request, jsonify

# Load .env file
dotenv.load_dotenv()

# Load environment variables
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_KEY")
deployment = os.getenv("AZURE_OAI_DEPLOYMENT")

# Check for missing credentials
if not all([endpoint, api_key, deployment]):
    raise ValueError("Some environment variables are missing. Please check your .env file.")

# Flask application
app = Flask(__name__)

# OpenAI client
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
            temperature=0.3,
            max_tokens=4096,
            top_p=0.90,
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

        assistant_message = response.choices[0].message.content
        disclaimer = (
            "\n\nUyarı:\nLütfen unutmayın ki ben bir AI yatırım asistanıyım ve sağladığım bilgiler yatırım tavsiyesi "
            "yerine geçmeyebilir. Yatırım kararlarınızı alırken profesyonel bir danışmana başvurmanız önerilir."
        )

        return jsonify({"response": assistant_message + disclaimer})
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
