import os
import openai
import logging
import dotenv

# .env dosyasını yükle
dotenv.load_dotenv()

# Ortam değişkenlerini yükle
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_KEY")
deployment = os.getenv("AZURE_OAI_DEPLOYMENT")

# Kimlik bilgilerini kontrol et
if not all([endpoint, api_key, deployment]):
    raise ValueError("Some environment variables are missing. Please check your .env file.")

# Ortam değişkenlerini yazdır
print(f"Endpoint: {endpoint}")
print(f"API Key: {api_key}")
print(f"Deployment: {deployment}")

# OpenAI istemcisi oluştur
client = openai.AzureOpenAI(
    base_url=f"{endpoint}/openai/deployments/{deployment}/extensions",
    api_key=api_key,
    api_version="2023-08-01-preview"
)

def main():
    try:
        while True:
            text = input("Enter your message: ")
            if text.lower() == "exit":
                print("Exiting...")
                break
            
            response = client.chat.completions.create(
                model=deployment,
                temperature=0.7,
                max_tokens=4096,
                top_p=0.95,
                messages=[
                    {
                        "role": "user",
                        "content": text
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

            print(response.choices[0].message.content)
        
    except Exception as e:
        logging.error(f"An error occurred: {e}")
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
