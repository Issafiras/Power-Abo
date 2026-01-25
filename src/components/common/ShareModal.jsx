import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { generateShareUrl } from '../../utils/share';
import { useAppState } from '../../hooks/useAppState';
import Icon from './Icon';
import COPY from '../../constants/copy';

function ShareModal({ onClose }) {
  const state = useAppState();
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);
  
  // Generer URL (memoized i praksis af browser, men vi genererer den ved mount)
  const shareUrl = generateShareUrl(state);

  // Luk ved klik udenfor
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '400px', textAlign: 'center' }}>
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>Scan & Tag Tilbuddet Med</h3>
          <button className="close-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="x" size={24} />
          </button>
        </div>
        
        <div className="qr-wrapper" style={{ background: 'white', padding: '20px', borderRadius: '12px', margin: '20px auto', width: 'fit-content' }}>
          <QRCode 
            value={shareUrl} 
            size={200}
            level="M"
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
        </div>
        
        <p className="text-secondary" style={{ fontSize: '14px', marginBottom: '20px' }}>
          Kunden kan scanne denne kode med deres kamera for at åbne beregningen på deres egen telefon.
        </p>

        <div className="share-actions">
          <button 
            className={`btn ${copied ? 'btn-success' : 'btn-secondary'}`} 
            onClick={handleCopyLink}
            style={{ width: '100%' }}
          >
            <Icon name={copied ? "checkCircle" : "link"} size={18} />
            {copied ? 'Link kopieret!' : 'Kopier link'}
          </button>
        </div>
      </div>
      
      <style>{`
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

export default ShareModal;
