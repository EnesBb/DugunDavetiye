import React, { useRef, useState } from 'react';
import './App.css';
import coverPhoto from './cover.jpg';

function App() {
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  return (
    <div className="wedding-app">
      <div className="side-bar left" />
      <div className="main-content">
        <h1 className="title">Rabia & Hamza'nın <br />Mutlu Anları</h1>
        <div className="cover-photo-wrapper">
          <img src={coverPhoto} alt="Kapak" className="cover-photo" />
        </div>
        <button className="add-photo-btn" onClick={() => fileInputRef.current.click()}>
          + Fotoğraf Ekle
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleAddPhoto}
        />
        <div className="photo-grid">
          {photos.map((src, idx) => (
            <div className="photo-item" key={idx}>
              <img src={src} alt={`wedding-${idx}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="side-bar right" />
    </div>
  );
}

export default App;
