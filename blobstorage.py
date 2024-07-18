from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os

# Azure storage bağlantı ayarları
connection_string = "DefaultEndpointsProtocol=https;AccountName=rgacademy7str;AccountKey=/jCw8IO0b4qq/sIAVzpk+KMFRlh/qYe/HnqAbXrXOvlGpMF2cxRf/N979GUB6jEERkpJYZQ4YhD2+ASt+WEYqw==;EndpointSuffix=core.windows.net"
container_name = "azureml"

# Yüklenecek dosyaların listesi
pdf_files = ["test3.pdf", "test4.pdf"] # PDF dosyalarının isimlerini buraya ekleyin

# Blob service client - BlobServiceClient nesnesi oluştur
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

# Container nesnesi oluştur
container_client = blob_service_client.get_container_client(container_name)

# Her bir PDF dosyasını yükle
for file_path in pdf_files:
    blob_name = os.path.basename(file_path) # Dosya adını blob adı olarak kullan
    blob_client = container_client.get_blob_client(blob_name)
    
    with open(file_path, "rb") as data:
        blob_client.upload_blob(data, overwrite=True)
    
    print(f"Blob name: {blob_name} adlı blob başarıyla yüklendi.")
