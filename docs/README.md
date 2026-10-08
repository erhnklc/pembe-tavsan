# Pembe Tavşan

Hiç İngilizce bilmeyen 4–6 yaş çocuklar için oyunla kelime öğrenme uygulaması.
Telefonda ve bilgisayarda tarayıcıdan çalışır; telefonda "Ana ekrana ekle" ile uygulama gibi kurulur.

## Çalıştırma

Statik dosyalardır, derleme gerekmez:

    cd docs
    python3 -m http.server 8000   # sonra http://localhost:8000

Telefonda kullanmak için klasörü herhangi bir statik barındırmaya koy (GitHub Pages, Netlify vb.).
Servis çalışanı (sw.js) HTTPS ister; localhost da kabul edilir.

## Konular

Hayvanlar, Renkler, Sayılar, Meyveler. Her konuda **Öğren** (kartlar) ve **Dinle ve Dokun** oyunu var.

## Sesler

`audio/` klasöründe ElevenLabs ile üretilmiş 10 klip var (Emily sesi yavaş ve tekrarlı İngilizce; Ada sesi Türkçe).
Sesi olmayan kelimeler şimdilik tarayıcının sesiyle yavaş okunur.

Yeni kelime sesi eklemek için `audio/<id>.mp3` dosyasını koy, `app.js` içindeki `AUDIO_IDS` listesine
id'yi, `sw.js` içindeki `FILES` listesine dosyayı ekle.
