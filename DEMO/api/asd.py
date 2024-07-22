import pandas as pd

# CSV dosyasını yükle
df = pd.read_csv('api/stock.csv')

# Aramak istediğiniz karakter dizisini belirleyin
search_term = 'a'

# 'symbol' ve 'company_name' sütunlarında arama yap, 'a' ile başlayanları bul
matching_rows = df[df.apply(lambda row: row['symbol'].lower().startswith(search_term) or row['company_name'].lower().startswith(search_term), axis=1)]

# İlk 5 sonucu seç
result = matching_rows.head(5)

# Sadece 'symbol' sütununu döndür ve listeye dönüştür
symbols_list = result['symbol'].tolist()

# Sonuçları ekrana yazdır
print(symbols_list)
