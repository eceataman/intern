import os
import logging
from flask import Flask, redirect, render_template, request, jsonify, session, url_for
from azure_openai_client import AzureOpenAIClient

# Flask application
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

# Azure OpenAI Client
azure_client = AzureOpenAIClient()

@app.route("/")
def index():
    return render_template("dashboard.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.form["message"]
    try:
        assistant_message = azure_client.get_chat_completion(user_message)
        disclaimer = (
            "\n\nUyarı:\nLütfen unutmayın ki ben bir AI yatırım asistanıyım ve sağladığım bilgiler yatırım tavsiyesi "
            "yerine geçmeyebilir. Yatırım kararlarınızı alırken profesyonel bir danışmana başvurmanız önerilir."
        )
        return jsonify({"response": assistant_message + disclaimer})
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/register.html")
def register_page():
    return render_template("register.html")

@app.route("/login.html")
def login_page():
    return render_template("login.html")

@app.route("/chatbot.html")
def chatbot_page():
    return render_template("chatbot.html")

@app.route("/forgot-password.html")
def forgotpassword_page():
    return render_template("forgot-password.html")

@app.route('/logout')
def logout():
    # Oturumu sonlandırma işlemleri
    session.pop('user_id', None)  # Örnek olarak, oturumdan user_id'yi kaldır
    return redirect(url_for('login_page'))  # Login sayfasına yönlendir

if __name__ == "__main__":
    app.run(debug=True)