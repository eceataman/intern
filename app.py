import os
import logging
from flask import Flask, redirect, render_template, request, jsonify, session, url_for
from azure_openai_client import AzureOpenAIClient
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi



uri = "mongodb+srv://admin_user:12341234@chathistory.tal73k8.mongodb.net/chat_histories_db?retryWrites=true&w=majority&appName=chatHistory"


client = MongoClient(uri, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

chat_history_db = client['chat_histories_db']
chat_collection = chat_history_db['chat_histories_collection']



# Flask application
app = Flask(_name_)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'default_secret_key')

# Azure OpenAI Client
azure_client = AzureOpenAIClient()

@app.route("/")
def index():
    return render_template("dashboard.html")




@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.form["message"]
    user_email = session.get('user_email') 
    #print("chat: "+user_email)
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


@app.route("/store_email", methods=["GET"])
def store_email():
    email = request.args.get('email')  # Get the email from query parameters
    #print("store_email: "+email)
    if email:
        session['user_email'] = email
        return jsonify({"message": "Email stored in session"}), 200
    else:
        return jsonify({"error": "Email parameter missing"}), 400


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

if _name_ == "_main_":
    app.run(debug=True)