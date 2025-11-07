/**
 * StreamingSelector komponent
 * Multi-select grid af streaming-tjenester
 */

import { streamingServices as staticStreaming } from '../data/streamingServices';
import { canUseSupabase, getStreamingCached } from '../utils/supabaseData';
import { formatCurrency } from '../utils/calculations';
import { searchProductsWithPrices, validateEAN } from '../utils/powerApi';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { saveSearchLog, saveProductSnapshot } from '../utils/backendApi';

export default function StreamingSelector({ 
  selectedStreaming, 
  onStreamingToggle,
  customerMobileCost,
  onMobileCostChange,
  originalItemPrice,
  onOriginalItemPriceChange,
  onEANSearch,
  isSearching = false
}) {
  const isMobile = typeof window !== 'undefined' && ((window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || window.innerWidth <= 900);
  const canScan = isMobile && typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [hasBarcodeApi, setHasBarcodeApi] = useState(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const scanningRef = useRef(false);
  const detectorRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const zxingScriptLoadedRef = useRef(false);
  const videoTrackRef = useRef(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [services, setServices] = useState(staticStreaming);
  const streamingTotal = services
    .filter(s => selectedStreaming.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);
  const monthlyTotal = (customerMobileCost || 0) + streamingTotal;
  const sixMonthTotal = (monthlyTotal * 6) + (originalItemPrice || 0);
  // Hent streaming-tjenester fra Supabase hvis aktivt
  useEffect(() => {
    let mounted = true;
    if (!canUseSupabase()) return;
    (async () => {
      try {
        const list = await getStreamingCached();
        if (mounted && Array.isArray(list) && list.length > 0) setServices(list);
      } catch (e) {
        console.warn('Kunne ikke hente streaming services fra Supabase:', e?.message || e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleMobileCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onMobileCostChange(value);
  };

  const handleOriginalItemPriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onOriginalItemPriceChange(value);
  };

  const handleEANSearch = async (e) => {
    e.preventDefault();
    const eanInput = e.target.ean.value.trim();
    
    if (!eanInput) return;
    
    const validation = validateEAN(eanInput);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    
    try {
      const result = await searchProductsWithPrices(eanInput);
      if (onEANSearch) {
        onEANSearch(result);
      }
      // Log til Supabase (best-effort, påvirker ikke flow)
      try {
        await saveSearchLog({
          query: eanInput,
          resultsCount: Array.isArray(result?.products) ? result.products.length : 0,
          meta: { hasFallbackPrice: typeof result?.fallbackPrice === 'number' }
        });
        if (Array.isArray(result?.products) && result.products.length > 0) {
          const first = result.products[0];
          await saveProductSnapshot({ productId: String(first.productId || first.id || ''), data: { product: first, prices: result?.prices || {} } });
        }
      } catch {}
      // Ryd input felt efter succesfuld søgning
      e.target.ean.value = '';
    } catch (error) {
      alert(`Fejl ved søgning: ${error.message}`);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (zxingReaderRef.current) {
      try { zxingReaderRef.current.reset(); } catch {}
      zxingReaderRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    videoTrackRef.current = null;
    setTorchSupported(false);
    setTorchOn(false);
    setShowScanner(false);
  };

  const onDetectedCode = async (code) => {
    try {
      const validation = validateEAN(code);
      if (!validation.valid) {
        setScanError(validation.message);
        return;
      }
      const result = await searchProductsWithPrices(code);
      if (onEANSearch) onEANSearch(result);
      stopScanner();
    } catch (err) {
      setScanError(err.message || 'Ukendt fejl under søgning');
    }
  };

  const loadZxingScript = () => new Promise((resolve, reject) => {
    if (zxingScriptLoadedRef.current) return resolve();
    const existing = document.querySelector('script[data-zxing]');
    if (existing) {
      zxingScriptLoadedRef.current = true;
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js';
    script.async = true;
    script.setAttribute('data-zxing', 'true');
    script.onload = () => { zxingScriptLoadedRef.current = true; resolve(); };
    script.onerror = reject;
    document.body.appendChild(script);
  });

  const startZxingFallback = async () => {
    try {
      await loadZxingScript();
      if (!window.ZXing || !window.ZXing.BrowserMultiFormatReader) return;
      const Reader = window.ZXing.BrowserMultiFormatReader;
      const reader = new Reader();
      zxingReaderRef.current = reader;
      // Begræns til relevante formater
      try {
        const hints = new window.ZXing.Map();
        const formats = [
          window.ZXing.BarcodeFormat.EAN_13,
          window.ZXing.BarcodeFormat.EAN_8,
          window.ZXing.BarcodeFormat.UPC_A,
          window.ZXing.BarcodeFormat.UPC_E,
          window.ZXing.BarcodeFormat.CODE_128
        ];
        hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
        reader.hints = hints;
      } catch {}

      await reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
        if (!scanningRef.current) return;
        if (result && result.getText) {
          const text = String(result.getText()).trim();
          const digits = text.replace(/\s+/g, '').replace(/[^0-9]/g, '');
          if (digits.length >= 8) {
            await onDetectedCode(digits);
          }
        }
      });
    } catch (e) {
      console.warn('ZXing fallback mislykkedes:', e);
    }
  };

  const startScanner = async () => {
    if (!canScan) return;
    setScanError(null);
    setShowScanner(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 0.75 }
        },
        audio: false
      });
      streamRef.current = stream;
      const videoTrack = stream.getVideoTracks && stream.getVideoTracks()[0];
      videoTrackRef.current = videoTrack || null;
      try {
        const caps = videoTrack && videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        if (caps && typeof caps.torch === 'boolean') setTorchSupported(true);
      } catch {}
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS kræver playsInline for at undgå fullscreen
        try { videoRef.current.setAttribute('playsinline', 'true'); } catch {}
        try { videoRef.current.setAttribute('muted', 'true'); } catch {}
        try { videoRef.current.muted = true; } catch {}
        await videoRef.current.play();
        // Vent på metadata før vi scanner, så har vi korrekte dimensioner
        if (videoRef.current.readyState < 2) {
          await new Promise((resolve) => {
            const handler = () => {
              videoRef.current && videoRef.current.removeEventListener('loadedmetadata', handler);
              resolve();
            };
            videoRef.current && videoRef.current.addEventListener('loadedmetadata', handler, { once: true });
          });
        }
      }
      // Hvis BarcodeDetector ikke findes – brug ZXing på alle platforme
      if (!('BarcodeDetector' in window)) {
        setHasBarcodeApi(false);
        // Start ZXing fallback direkte
        setScanning(true);
        scanningRef.current = true;
        await startZxingFallback();
        return;
      }
      // Tjek understøttede formater – iOS Safari kan have BarcodeDetector men uden EAN
      try {
        const supported = (await window.BarcodeDetector.getSupportedFormats?.()) || [];
        const need = ['ean-13','ean-8','upc-e','upc-a','code-128'];
        const ok = need.some(f => supported.includes(f));
        if (!ok) {
          setHasBarcodeApi(false);
          setScanning(true);
          scanningRef.current = true;
          await startZxingFallback();
          return;
        }
      } catch {}
      if (!detectorRef.current) {
        detectorRef.current = new window.BarcodeDetector({ formats: ['ean-13', 'ean-8', 'upc-e', 'upc-a', 'code-128'] });
      }
      setScanning(true);
      scanningRef.current = true;
      const tick = async () => {
        if (!scanningRef.current || !videoRef.current) return;
        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          let code = (barcodes && barcodes[0] && barcodes[0].rawValue ? barcodes[0].rawValue : '').trim();
          // Normalisér: fjern whitespace og ikke-cifre for EAN/UPC
          if (code) {
            const digits = code.replace(/\s+/g, '').replace(/[^0-9]/g, '');
            if (digits.length >= 8) {
              code = digits;
            }
          }
          if (code) {
            await onDetectedCode(code);
            return;
          }
        } catch {}
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      // Start automatisk ZXing fallback efter 2 sekunder, hvis ingen detection endnu
      setTimeout(() => {
        if (scanningRef.current && !zxingReaderRef.current) {
          startZxingFallback();
        }
      }, 2000);
    } catch (err) {
      setScanError('Kunne ikke få adgang til kamera. Tjek tilladelser.');
    }
  };

  const toggleTorch = async () => {
    try {
      const track = videoTrackRef.current;
      if (!track) return;
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      if (!caps || typeof caps.torch !== 'boolean') return;
      const newVal = !torchOn;
      await track.applyConstraints({ advanced: [{ torch: newVal }] });
      setTorchOn(newVal);
    } catch {}
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Lås body-scroll når scanneren er åben
  useEffect(() => {
    if (showScanner) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showScanner]);

  return (
    <div className="streaming-selector glass-card-no-hover fade-in-up">
      <div className="section-header">
        <h2>📊 Kundens Nuværende Situation</h2>
        <p className="text-secondary">
          Vælg kundens nuværende streaming-tjenester og mobiludgifter
        </p>
      </div>

      {/* Mobil udgifter input */}
      <div className="mobile-cost-input">
        <label htmlFor="mobile-cost" className="input-label">
          💳 Nuværende månedlige mobiludgifter
        </label>
        <div className="input-with-currency">
          <input
            id="mobile-cost"
            name="mobile-cost"
            type="number"
            className="input"
            placeholder="299"
            value={customerMobileCost || ''}
            onChange={handleMobileCostChange}
            min="0"
            step="10"
          />
          <span className="currency-suffix">kr/md</span>
        </div>
      </div>

      {/* Varens pris inden rabat input */}
      <div className="original-item-price-input">
        <label htmlFor="original-item-price" className="input-label">
          🏷️ Varens pris inden rabat og besparelse
        </label>
        <div className="input-with-currency">
          <input
            id="original-item-price"
            name="original-item-price"
            type="number"
            className="input"
            placeholder="0"
            value={originalItemPrice || ''}
            onChange={handleOriginalItemPriceChange}
            min="0"
            step="10"
          />
          <span className="currency-suffix">kr</span>
        </div>
      </div>

      {/* Produkt søgning */}
      <div className="ean-search-input">
        <label htmlFor="ean-search" className="input-label">
          🔍 Søg vare efter navn, EAN eller mærke
        </label>
        <form onSubmit={handleEANSearch} className="ean-search-form">
          <div className="input-with-button">
            <input
              id="ean-search"
              name="ean"
              type="text"
              className="input"
              placeholder="F.eks. iPhone, Samsung, 4894526079567"
              maxLength="50"
            />
            {canScan && (
              <button 
                type="button"
                className="btn scan-btn"
                onClick={startScanner}
                aria-label="Scan stregkode"
              >
                📷 Scan
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary ean-search-btn"
              disabled={isSearching}
            >
              {isSearching ? 'Søger...' : 'Søg'}
            </button>
          </div>
        </form>
        <p className="ean-help-text">
          Søg efter produktnavn, mærke, EAN-kode eller beskrivelse
        </p>
      </div>

      {showScanner && createPortal(
        (
          <div className="scanner-backdrop" role="dialog" aria-modal="true" aria-label="Stregkode scanner">
            <div className="scanner-modal">
              <div className="scanner-header">
                <span>📷 Scan stregkode</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {torchSupported && (
                    <button className="btn torch-btn" onClick={toggleTorch} aria-pressed={torchOn}>
                      {torchOn ? '🔦 Sluk' : '🔦 Tænd'}
                    </button>
                  )}
                  <button className="btn" onClick={stopScanner}>Luk</button>
                </div>
              </div>
              {!hasBarcodeApi && (
                <div className="scanner-warning">
                  Din browser understøtter ikke indbygget stregkodescanning. Brug manuel søgning.
                </div>
              )}
              <video ref={videoRef} className="scanner-video" playsInline muted />
              {scanError && <div className="scanner-error">⚠️ {scanError}</div>}
              <div className="scanner-footer">
                <button className="btn" onClick={stopScanner}>Annullér</button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      <div className="divider"></div>

      {/* Streaming grid */}
      <div className="streaming-grid">
        {services.map((service, index) => {
          const isSelected = selectedStreaming.includes(service.id);
          
          return (
            <button
              key={service.id}
              onClick={() => onStreamingToggle(service.id)}
              className={`streaming-card glass-card stagger-item ${isSelected ? 'selected' : ''}`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                '--brand-color': service.color || 'var(--color-orange)',
                '--brand-bg': service.bgColor || 'var(--glass-bg)'
              }}
              aria-pressed={isSelected}
            >
              <div className="streaming-icon" style={{ 
                background: service.bgColor
              }}>
                {service.logo ? (
                  <img 
                    src={service.logo} 
                    alt={service.name}
                    className="streaming-logo-img"
                  />
                ) : (
                  <span className="logo-musik" style={{ color: service.color }}>
                    {service.logoText}
                  </span>
                )}
              </div>
              <div className="streaming-name">{service.name}</div>
              <div className="streaming-price">{formatCurrency(service.price)}/md</div>
              {isSelected && (
                <div className="streaming-checkmark bounce-in">✓</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="divider"></div>

      {/* Totaler */}
      <div className="totals-summary">
        <div className="total-row">
          <span className="total-label">Mobil pr. måned:</span>
          <span className="total-value">{formatCurrency(customerMobileCost || 0)}</span>
        </div>
        <div className="total-row">
          <span className="total-label">Streaming pr. måned:</span>
          <span className="total-value">{formatCurrency(streamingTotal)}</span>
        </div>
        <div className="total-row highlight">
          <span className="total-label font-bold">Total pr. måned:</span>
          <span className="total-value font-bold text-2xl">
            {formatCurrency(monthlyTotal)}
          </span>
        </div>
        <div className="total-row six-month">
          <span className="total-label">6-måneders total:</span>
          <span className="total-value text-3xl font-extrabold text-gradient">
            {formatCurrency(sixMonthTotal)}
          </span>
        </div>
      </div>

      <style>{`
        .streaming-selector {
          padding: var(--spacing-lg);
        }

        .section-header {
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          margin-bottom: var(--spacing-xs);
        }

        .mobile-cost-input {
          margin-bottom: var(--spacing-md);
        }

        .original-item-price-input {
          margin-bottom: var(--spacing-md);
        }

        .ean-search-input {
          margin-bottom: var(--spacing-md);
        }

        .ean-search-form {
          margin-bottom: var(--spacing-sm);
        }

        .input-with-button {
          display: flex;
          gap: var(--spacing-sm);
        }

        .input-with-button input {
          flex: 1;
        }

        .ean-search-btn {
          white-space: nowrap;
          padding: var(--spacing-sm) var(--spacing-md);
        }

        .ean-help-text {
          font-size: var(--font-sm);
          color: var(--text-muted);
          margin: 0;
        }

        /* Scan skjult som default (PC) */
        .scan-btn { display: none; }

        /* Scanner overlay – altid fixed og centreret */
        .scanner-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100dvh;
          padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483647;
          overscroll-behavior: contain;
          touch-action: none;
        }
        .scanner-modal {
          width: min(680px, 96vw);
          background: var(--glass-bg, #111);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid rgba(255,255,255,0.08);
          max-height: 96vh;
          display: flex;
          flex-direction: column;
        }
        .scanner-header, .scanner-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
        }
        .scanner-video {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #000;
          border-radius: var(--radius-md);
          object-fit: cover;
        }
        .scanner-warning { color: var(--color-warning, #f59e0b); margin-bottom: var(--spacing-sm); }
        .scanner-error { color: var(--color-danger, #ef4444); margin-top: var(--spacing-sm); }

        .input-label {
          display: block;
          margin-bottom: var(--spacing-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
        }

        .input-with-currency {
          position: relative;
        }

        .currency-suffix {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-weight: var(--font-semibold);
          pointer-events: none;
        }

        .input-with-currency input {
          padding-right: 5rem;
        }

        .streaming-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: var(--spacing-sm);
        }

        .streaming-card {
          position: relative;
          padding: var(--spacing-md);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-smooth);
          border: 2px solid transparent;
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .streaming-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
          pointer-events: none;
        }

        .streaming-card:hover::before {
          width: 200px;
          height: 200px;
        }

        .streaming-card:hover {
          transform: translateY(-6px) rotateX(5deg) scale(1.05);
          border-color: var(--color-orange);
          box-shadow: 
            var(--shadow-lg),
            0 0 30px rgba(255, 109, 31, 0.4);
        }

        .streaming-card:active {
          transform: translateY(-2px) scale(0.98);
        }

        .streaming-card.selected {
          border-color: var(--color-orange);
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.15) 0%, 
            rgba(255, 109, 31, 0.08) 100%
          );
          box-shadow: var(--glow-orange);
          transform: scale(1.02);
        }

        .streaming-card.selected:hover {
          transform: translateY(-6px) rotateX(5deg) scale(1.08);
          box-shadow: var(--glow-extreme);
        }

        .streaming-icon {
          font-size: var(--font-2xl);
          font-weight: var(--font-extrabold);
          margin-bottom: var(--spacing-sm);
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-smooth);
          margin-left: auto;
          margin-right: auto;
        }

        .streaming-card:hover .streaming-icon {
          transform: scale(1.15) rotate(10deg) translateY(-4px);
          box-shadow: 
            var(--shadow-lg),
            0 0 30px rgba(255, 109, 31, 0.5);
          animation: iconPulse 0.6s ease-in-out;
          filter: brightness(1.2);
        }

        @keyframes iconPulse {
          0% { transform: scale(1.05) rotate(5deg); }
          50% { transform: scale(1.1) rotate(-2deg); }
          100% { transform: scale(1.05) rotate(5deg); }
        }

        .streaming-card:hover .streaming-name {
          transform: translateY(-2px);
          color: var(--color-orange);
        }

        .streaming-card:hover .streaming-price {
          transform: scale(1.05);
          color: var(--color-orange-light);
        }

        /* Logo billede styles */
        .streaming-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
          transition: all var(--transition-smooth);
        }

        .streaming-card:hover .streaming-logo-img {
          transform: scale(1.03);
        }

        .streaming-card.selected .streaming-logo-img {
          filter: brightness(1.1);
        }

        /* Musik - Note symbol (fallback for services uden billede) */
        .logo-musik {
          font-size: 3rem;
        }

        .streaming-name {
          font-weight: var(--font-semibold);
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
          font-size: var(--font-sm);
        }

        .streaming-price {
          color: var(--text-secondary);
          font-size: var(--font-sm);
        }

        .streaming-checkmark {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
          width: 28px;
          height: 28px;
          background: var(--color-success);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          box-shadow: var(--glow-green), 0 0 15px rgba(16, 185, 129, 0.5);
          animation: bounceIn var(--duration-slow) var(--ease-out-back), pulse 2s ease-in-out infinite;
        }

        .totals-summary {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
        }

        .total-row.highlight {
          padding: var(--spacing-md);
          background: var(--glass-bg);
          border-radius: var(--radius-md);
        }

        .total-row.six-month {
          padding: var(--spacing-lg);
          background: var(--gradient-primary);
          background-size: 200% 200%;
          border-radius: var(--radius-lg);
          border: 2px solid rgba(255, 255, 255, 0.2);
          animation: gradientShift 4s ease infinite;
          box-shadow: 
            var(--glow-orange),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .total-row.six-month::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer 3s ease infinite;
        }

        .total-label {
          color: var(--text-secondary);
        }

        .total-value {
          color: var(--text-primary);
        }

        /* Kun mobil/tablet */
        @media (max-width: 900px) {
          .scan-btn { display: inline-flex; }
        }

        @media (max-width: 900px) {
          .streaming-selector {
            padding: var(--spacing-lg);
          }

          .streaming-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: var(--spacing-sm);
          }

          .streaming-card {
            padding: var(--spacing-md);
          }

          .streaming-icon {
            width: 60px;
            height: 60px;
          }

          .logo-musik {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

