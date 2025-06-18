import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabase';

function App() {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef(null);

  // Tüm klasör ve alt klasörlerdeki dosyaları recursive olarak topla
  const fetchAllFiles = async (folder = '') => {
    let allFiles = [];
    console.log('Fetching files from folder:', folder);
    let { data } = await supabase.storage.from('photos').list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    console.log('Raw data from Supabase:', data);
    if (data && Array.isArray(data)) {
      const files = data.filter(item => !item.folder);
      const folders = data.filter(item => item.folder);
      console.log('Files found:', files);
      console.log('Folders found:', folders);
      files.forEach(file => {
        file.path = folder ? `${folder}/${file.name}` : file.name;
      });
      allFiles = [...files];
      for (const subfolder of folders) {
        const subFiles = await fetchAllFiles(folder ? `${folder}/${subfolder.name}` : subfolder.name);
        allFiles = [...allFiles, ...subFiles];
      }
    }
    console.log('All files collected:', allFiles);
    return allFiles;
  };

  // Fotoğrafları Supabase Storage'dan çek
  const fetchPhotos = async () => {
    console.log('Starting to fetch photos...');
    const allFiles = await fetchAllFiles('');
    console.log('All files before filtering:', allFiles);
    const filteredFiles = allFiles.filter(item => item.name.match(/\.(jpg|jpeg|png|webp|mp4)$/i));
    console.log('Filtered files:', filteredFiles);
    
    // Her dosyanın detaylarını yazdır
    for (const file of filteredFiles) {
      const publicURL = await getPublicUrl(file);
      console.log(`File:`, {
        name: file.name,
        path: file.path,
        size: file.metadata?.size,
        publicURL: publicURL
      });
    }
    
    setPhotos(filteredFiles);
  };

  useEffect(() => {
    if (showGallery) {
      fetchPhotos();
    }
  }, [showGallery]);

  // Fotoğraf veya video yükle
  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    for (const file of files) {
      const filePath = `${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('photos').upload(filePath, file);
      if (error) {
        alert('Yükleme hatası: ' + error.message);
      }
    }
    setUploading(false);
    setShowUploader(false);
    // Yükleme sonrası galeri açıksa güncelle
    if (showGallery) fetchPhotos();
  };

  // Fotoğrafın herkese açık linkini al (path desteği eklendi, undefined kontrolü var)
  const getPublicUrl = async (item) => {
    try {
      // Önce public URL'i dene
      const { publicURL } = supabase.storage.from('photos').getPublicUrl(item.path || item.name);
      console.log('Getting public URL for:', item.name, 'Path:', item.path, 'Result:', publicURL);
      
      if (publicURL && publicURL !== 'undefined') {
        return publicURL.replace('photos//', 'photos/');
      }
      
      // Public URL çalışmazsa signed URL dene
      const { data: signedUrl, error } = await supabase.storage
        .from('photos')
        .createSignedUrl(item.path || item.name, 3600); // 1 saat geçerli
      
      if (error) {
        console.error('Signed URL error:', error);
        return '';
      }
      
      console.log('Using signed URL for:', item.name, 'URL:', signedUrl?.signedUrl);
      return signedUrl?.signedUrl || '';
      
    } catch (error) {
      console.error('Error getting URL for:', item.name, error);
      return '';
    }
  };

  // URL state'i için
  const [photoUrls, setPhotoUrls] = useState({});

  // URL'leri yükle
  useEffect(() => {
    const loadUrls = async () => {
      const urls = {};
      for (const photo of photos) {
        urls[photo.name] = await getPublicUrl(photo);
      }
      setPhotoUrls(urls);
    };
    
    if (photos.length > 0) {
      loadUrls();
    }
  }, [photos]);

  return (
    <div className="wedding-app">
      <div className="main-content">
        <h1 className="title">Rabia & Hamza'nın <br />Mutlu Anları</h1>
        <div className="button-container">
          <button
            className="add-photo-btn"
            onClick={() => { setShowUploader(true); setShowGallery(false); }}
            disabled={uploading}
          >
            + Fotoğraf Ekle
          </button>
          <button
            className="add-photo-btn"
            onClick={() => { setShowGallery(true); setShowUploader(false); fetchPhotos(); }}
          >
            Fotoğrafları Gör
          </button>
        </div>
        {showUploader && (
          <div style={{ marginBottom: '32px' }}>
            <input
              type="file"
              accept="image/*,video/mp4"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleAddPhoto}
            />
            <button
              className="add-photo-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              {uploading ? "Yükleniyor..." : "Dosya Seç"}
            </button>
            <button
              className="add-photo-btn"
              style={{ marginLeft: '8px' }}
              onClick={() => setShowUploader(false)}
            >
              Kapat
            </button>
          </div>
        )}
        {showGallery && (
          <div className="photo-grid">
            {photos.map((item, idx) => {
              const url = photoUrls[item.name];
              if (!url) return null;
              return (
                <div className="photo-item" key={idx}>
                  {item.name.match(/\.mp4$/i) ? (
                    <video controls width="100%" height="100%">
                      <source src={url} type="video/mp4" />
                      Tarayıcınız video etiketini desteklemiyor.
                    </video>
                  ) : (
                    <img src={url} alt={item.name} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
