from openai import AzureOpenAI
import os

# API anahtarlarını ve uç noktayı ortam değişkenlerine ayarlama
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://rgacademy7oai.openai.azure.com/"
os.environ["AZURE_OPENAI_KEY"] = "b0d3543fb59d4181aca62e4ccf0f02c3"

# AzureOpenAI istemcisini oluşturma
client = AzureOpenAI(
    azure_endpoint="https://rgacademy7oai.openai.azure.com/",
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    api_version="2024-02-15-preview",
    timeout=30
)

# İstek oluşturma
message_text = [
    {"role": "system", "content": "Sınıflandırma yapan bir AI asistanısın.Sana örnek verilen sınıfları kullanarak, kullanıcıların mesajlarını sınıflandır."},
    {"role": "user", "content": "Kredi Kartı başvurusu yapmak istiyorum"},
    {"role": "assistant", "content": "Sınıf: Kredi Kartı"},
    {"role": "user", "content": "ATM'den para çekmek istiyorum."},
    {"role": "assistant", "content": "Sınıf: ATM"},
    {"role": "user", "content": "ATM'de param sıkıştı"}
]

completion = client.chat.completions.create(
    model="gpt-4o",
    max_tokens=4096,  # Maksimum token sayısı
    messages=message_text,
    temperature=0.5,  # Yanıtın rastgeleliği
    top_p=0.95,  # Yanıtın çeşitliliği
    stop=None
)

print(completion.choices[0].message.content)
