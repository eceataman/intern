import os
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import SearchIndex, SimpleField, SearchableField
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

# .env dosyasını yükle
load_dotenv()

# Ortam değişkenlerini yükle ve kontrol et
azure_search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
azure_search_key = os.getenv("AZURE_SEARCH_KEY")
azure_search_index = os.getenv("AZURE_SEARCH_INDEX")
azure_storage_connection_string = os.getenv("AZURE_BLOB_CONNECTION_STRING")
azure_blob_container_name = os.getenv("AZURE_BLOB_CONTAINER_NAME")
azure_document_intelligence_endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT")
azure_document_intelligence_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY")

# Ortam değişkenlerinin yüklendiğini kontrol et
if not all([azure_search_endpoint, azure_search_key, azure_search_index, azure_storage_connection_string, azure_blob_container_name, azure_document_intelligence_endpoint, azure_document_intelligence_key]):
    raise ValueError("Some environment variables are missing. Please check your .env file.")


def create_search_index(index_client):
    fields = [SimpleField(name="id", type="Edm.String", key=True),
              SearchableField(name="content", type="Edm.String")]

    index = SearchIndex(name=azure_search_index, fields=fields)

    index_client.create_index(index)

def extract_text_from_pdf(blob_service_client, container_name, blob_name):
    document_analysis_client = DocumentAnalysisClient(endpoint=azure_document_intelligence_endpoint,
                                                      credential=AzureKeyCredential(azure_document_intelligence_key))

    blob_client = blob_service_client.get_blob_client(container=container_name, blob=blob_name)

    # Document Intelligence ile ilgili PDF'leri verilebilmek için PDF'ler blob store'dan indirilir
    pdf_content = blob_client.download_blob().readall()

    poller = document_analysis_client.begin_analyze_document(model_id="prebuilt-receipt", document=pdf_content)
    
    result = poller.result()
    
    text = ""
    for page in result.pages:
        for line in page.lines:
            text += line.content + "\n"
            
    return text

def sanitize_key(key):
    sanitized_key = key.replace('.', '-').replace(' ', '-')
    return sanitized_key

def index_documents(search_client, documents, chunk_size=1024):
    for i in range(0, len(documents), chunk_size):
        chunk = documents[i:i+chunk_size]
        results = search_client.upload_documents(documents=chunk)
        for result in results:
            if result.succeeded:
                print(f"Document {result.key} uploaded to index")
            else:
                print(f"Failed to upload document {result.key}")

def main():
    blob_service_client = BlobServiceClient.from_connection_string(azure_storage_connection_string)
    
    search_client = SearchClient(endpoint=azure_search_endpoint, index_name=azure_search_index, credential=AzureKeyCredential(azure_search_key))
    
    index_client = SearchIndexClient(endpoint=azure_search_endpoint, credential=AzureKeyCredential(azure_search_key))
    
    create_search_index(index_client)
    
    documents = []
    
    container_client = blob_service_client.get_container_client(azure_blob_container_name)
    
    blobs_list = container_client.list_blobs()
    
    for blob in blobs_list:
        if blob.name.endswith('.pdf'):
            pdf_text = extract_text_from_pdf(blob_service_client, azure_blob_container_name, blob.name)
            sanitized_key = sanitize_key(blob.name)
            documents.append({"id": sanitized_key, "content": pdf_text})

    index_documents(search_client, documents)
    print("Indexing completed")
                     
if __name__ == "__main__":
    main()
