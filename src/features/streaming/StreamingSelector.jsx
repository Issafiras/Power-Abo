/**
 * StreamingSelector komponent
 * Multi-select grid af streaming-tjenester
 */

import { streamingServices as staticStreaming } from '../../data/streamingServices';
import { formatCurrency } from '../../utils/calculations';
import { searchProductsWithPrices, validateEAN } from '../../utils/powerApi';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '../../components/common/Toast';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';

function StreamingSelector({ 
  selectedStreaming, 
  onStreamingToggle,
  customerMobileCost,
  onMobileCostChange,
  originalItemPrice,
  onOriginalItemPriceChange,
  onEANSearch,
  isSearching = false,
  onAutoSelectSolution = null,
  numberOfLines = 1,
  onNumberOfLinesChange = null,
  existingBrands = [],
  onExistingBrandsChange = null
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
  const services = staticStreaming;
  const streamingTotal = services
    .filter(s => selectedStreaming.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);
  const monthlyTotal = (customerMobileCost || 0) + streamingTotal;
  const sixMonthTotal = (monthlyTotal * 6) + (originalItemPrice || 0);

  const handleMobileCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onMobileCostChange(value);
  };

  const handleOriginalItemPriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onOriginalItemPriceChange(value);
  };

  const handleNumberOfLinesChange = (e) => {
    const inputValue = e.target.value;
    // Tillad tom værdi så brugeren kan slette
    if (inputValue === '') {
      if (onNumberOfLinesChange) {
        onNumberOfLinesChange('');
      }
      return;
    }
    const value = parseInt(inputValue, 10);
    // Kun opdater hvis det er et gyldigt tal
    if (!isNaN(value) && value >= 1) {
      if (onNumberOfLinesChange) {
        onNumberOfLinesChange(value);
      }
    }
  };

  const handleNumberOfLinesBlur = (e) => {
    // Når feltet mister fokus, sæt til 1 hvis det er tomt eller ugyldigt
    const inputValue = e.target.value;
    if (inputValue === '' || isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) < 1) {
      if (onNumberOfLinesChange) {
        onNumberOfLinesChange(1);
      }
    }
  };

  const handleEANSearch = async (e) => {
    e.preventDefault();
    const eanInput = e.target.ean.value.trim();
    
    if (!eanInput) return;
    
    const validation = validateEAN(eanInput);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }
    
    try {
      const result = await searchProductsWithPrices(eanInput);
      if (onEANSearch) {
        onEANSearch(result);
      }
      // Ryd input felt efter succesfuld søgning
      e.target.ean.value = '';
    } catch (error) {
      toast.error(`Fejl ved søgning: ${error.message}`);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    scanningRef.current = false;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (zxingReaderRef.current) {
      try { zxingReaderRef.current.reset(); } catch {
        // Ignorer fejl ved reset - reader kan allerede være lukket
      }
      zxingReaderRef.current = null;
    }
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {
        // Ignorer fejl ved pause - video kan allerede være stoppet
      }
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
      } catch {
        // Ignorer fejl ved indstilling af hints - fortsæt uden
      }

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
      // Silent fail - ZXing fallback fejlede, scanner vil ikke virke
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
      } catch {
        // Ignorer fejl ved hentning af capabilities - torch understøttes ikke
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // iOS kræver playsInline for at undgå fullscreen
        try { videoRef.current.setAttribute('playsinline', 'true'); } catch {
          // Ignorer fejl ved indstilling af playsinline attribut
        }
        try { videoRef.current.setAttribute('muted', 'true'); } catch {
          // Ignorer fejl ved indstilling af muted attribut
        }
        try { videoRef.current.muted = true; } catch {
          // Ignorer fejl ved indstilling af muted property
        }
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
      } catch {
        // Ignorer fejl ved tjek af understøttede formater - brug fallback
      }
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
        } catch {
          // Ignorer fejl ved detection - fortsæt scanning
        }
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
    } catch {
      // Ignorer fejl ved indstilling af torch - funktion understøttes ikke
    }
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
    <div 
      className="streaming-selector glass-card-no-hover"
    >
      <div className="section-header">
        <h2>
          <Icon name="chart" size={24} className="section-header-icon" />
          {COPY.titles.customerSituation}
        </h2>
        <p className="text-secondary">
          {COPY.titles.customerSituationSubtitle}
        </p>
      </div>
      
      {/* Skip to main content link for accessibility */}
      <a href="#plans-section" className="sr-only skip-link">
        Spring til hovedindhold
      </a>

      {/* Antal mobilabonnementer input */}
      {onNumberOfLinesChange && (
        <div className="number-of-lines-input">
          <label htmlFor="number-of-lines" className="input-label">
            <Icon name="smartphone" size={18} className="icon-inline icon-spacing-xs" />
            {COPY.labels.numberOfLines}
          </label>
          <div className="input-with-info">
            <input
              id="number-of-lines"
              name="number-of-lines"
              type="number"
              className="input"
              placeholder="1"
              value={numberOfLines === '' ? '' : (numberOfLines || 1)}
              onChange={handleNumberOfLinesChange}
              onBlur={handleNumberOfLinesBlur}
              min="1"
              max="20"
              step="1"
            />
            <span className="info-suffix">abonnement{(numberOfLines || 1) !== 1 ? 'er' : ''}</span>
          </div>
        </div>
      )}

      {/* Eksisterende brands selector */}
      {onExistingBrandsChange && (
        <div className="existing-brands-input">
          <label className="input-label">
            <Icon name="warning" size={18} className="icon-inline icon-spacing-xs" />
            {COPY.labels.existingBrands}
          </label>
          <p className="input-help-text mb-sm">
            {COPY.labels.existingBrandsHelp}
          </p>
          <div className="existing-brands-grid">
            {['Telmore', 'Telenor', 'CBB'].map((brand) => {
              const isSelected = existingBrands.includes(brand);
              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onExistingBrandsChange(existingBrands.filter(b => b !== brand));
                    } else {
                      onExistingBrandsChange([...existingBrands, brand]);
                    }
                  }}
                  className={`existing-brand-card glass-card ${isSelected ? 'selected' : ''}`}
                  aria-pressed={isSelected}
                >
                  <span className="existing-brand-name">{brand}</span>
                  {isSelected && (
                    <span className="existing-brand-checkmark bounce-in">
                      <Icon name="checkCircle" size={20} color="white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobil udgifter input */}
      <div className="mobile-cost-input">
          <label htmlFor="mobile-cost" className="input-label">
          <Icon name="creditCard" size={18} className="icon-inline icon-spacing-xs" />
          {COPY.labels.mobileCost} {onNumberOfLinesChange && numberOfLines > 1 ? `(total for ${numberOfLines} abonnementer)` : '(total)'}
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
          <span className="currency-suffix">kr./md.</span>
        </div>
        {onNumberOfLinesChange && numberOfLines > 1 && customerMobileCost > 0 && (
          <p className="input-help-text">
            Gennemsnit pr. abonnement: {formatCurrency((customerMobileCost || 0) / numberOfLines)}/md.
          </p>
        )}
      </div>

      {/* Varens pris inden rabat input */}
      <div className="original-item-price-input">
        <label htmlFor="original-item-price" className="input-label">
          <Icon name="tag" size={18} className="icon-inline icon-spacing-xs" />
          {COPY.labels.originalItemPrice}
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
          <Icon name="search" size={18} className="icon-inline icon-spacing-xs" />
          {COPY.labels.eanSearch}
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
                aria-label={COPY.cta.scanBarcode}
              >
                <Icon name="camera" size={18} className="icon-inline icon-spacing-xs" />
                {COPY.cta.scan}
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary ean-search-btn"
              disabled={isSearching}
            >
              {isSearching ? 'Søger...' : COPY.cta.search}
            </button>
          </div>
        </form>
        <p className="ean-help-text">
          {COPY.help.searchHelp}
        </p>
      </div>

      {showScanner && createPortal(
        (
          <div className="scanner-backdrop" role="dialog" aria-modal="true" aria-label="Stregkode scanner">
            <div className="scanner-modal">
              <div className="scanner-header">
                <span className="icon-with-text"><Icon name="camera" size={20} className="icon-inline icon-spacing-xs" />{COPY.cta.scanBarcode}</span>
                <div className="flex gap-sm">
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
                  Din browser understøtter ikke indbygget stregkodescanning. Brug manuel søgning i stedet.
                </div>
              )}
              <video ref={videoRef} className="scanner-video" playsInline muted />
              {scanError && (
                <div className="scanner-error">
                  <Icon name="warning" size={20} style={{ marginRight: 'var(--spacing-xs)', verticalAlign: 'middle' }} />
                  {scanError}
                </div>
              )}
              <div className="scanner-footer">
                <button className="btn" onClick={stopScanner}>Annullér</button>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* Auto-select løsning knap - Prominent placeret */}
      {onAutoSelectSolution && (
        <div className="auto-select-section">
          <div className="auto-select-header">
            <div className="auto-select-icon-wrapper">
              <Icon name="sparkles" size={48} className="auto-select-icon" />
            </div>
            <h3 className="auto-select-title">{COPY.titles.quickSolution}</h3>
            <p className="auto-select-subtitle">
              {COPY.titles.quickSolutionSubtitle}
            </p>
          </div>
          <button
            onClick={onAutoSelectSolution}
            className={`btn btn-premium auto-select-btn ${(selectedStreaming.length > 0 || customerMobileCost > 0) ? 'auto-select-btn--ready' : ''}`}
            disabled={!selectedStreaming.length && !customerMobileCost}
          >
            <Icon name="rocket" size={32} className="btn-icon" />
            <span className="btn-text">{COPY.cta.findBestSolution}</span>
            <Icon name="chevronRight" size={24} className="btn-arrow" />
          </button>
          {(!selectedStreaming.length && !customerMobileCost) && (
            <div className="auto-select-hint-wrapper">
              <p className="auto-select-hint">
                {COPY.help.activateAutoSelect}
              </p>
            </div>
          )}
        </div>
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
              className={`streaming-card glass-card ${isSelected ? 'selected' : ''}`}
              style={{ 
                '--brand-color': service.color || 'var(--color-orange)',
                '--brand-bg': service.bgColor || 'var(--glass-bg)'
              }}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Fjern' : 'Tilføj'} ${service.name} streaming-tjeneste`}
            >
              <div className="streaming-icon" style={{ 
                background: service.bgColor
              }}>
                {service.logo ? (
                  <img 
                    src={service.logo} 
                    alt={service.name}
                    className="streaming-logo-img"
                    loading="lazy"
                  />
                ) : (
                  <span className="logo-musik" style={{ color: service.color }}>
                    {service.logoText}
                  </span>
                )}
              </div>
              <div className="streaming-name">{service.name}</div>
              <div className="streaming-price">{formatCurrency(service.price)}/md.</div>
              {isSelected && (
                <div 
                  className="streaming-checkmark"
                >
                  <Icon name="checkCircle" size={28} color="var(--color-success)" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="divider"></div>

      {/* Totaler */}
      <div className="totals-summary">
        <div className="total-row">
          <span className="total-label">{COPY.help.perMonth}:</span>
          <span className="total-value">{formatCurrency(customerMobileCost || 0)}</span>
        </div>
        <div className="total-row">
          <span className="total-label">Streaming {COPY.help.perMonthShort}:</span>
          <span className="total-value">{formatCurrency(streamingTotal)}</span>
        </div>
        <div className="total-row highlight">
          <span className="total-label font-bold">Total {COPY.help.perMonthShort}:</span>
          <span className="total-value font-bold text-2xl">
            {formatCurrency(monthlyTotal)}
          </span>
        </div>
        <div className="total-row six-month">
          <span className="total-label">{COPY.help.sixMonthTotal}:</span>
          <span className="total-value text-3xl font-extrabold text-gradient">
            {formatCurrency(sixMonthTotal)}
          </span>
        </div>
      </div>

      <style>{`
        .streaming-selector {
          padding: var(--spacing-2xl);
        }

        .section-header {
          margin-bottom: var(--spacing-2xl);
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

        .auto-select-section {
          margin: var(--spacing-xl) 0;
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.1) 0%, 
            rgba(255, 109, 31, 0.05) 100%
          );
          border-radius: var(--radius-xl);
          border: 2px solid rgba(255, 109, 31, 0.2);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .auto-select-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(255, 109, 31, 0.15) 0%,
            transparent 70%
          );
          /* Fjernet animation - Performance First */
          pointer-events: none;
        }

        /* Fjernet gentlePulse animation - Performance First */
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .auto-select-header {
          margin-bottom: var(--spacing-xl);
          position: relative;
          z-index: 1;
        }

        .auto-select-icon-wrapper {
          margin-bottom: var(--spacing-md);
        }

        .auto-select-icon {
          display: inline-block;
          animation: gentleFloat 3s ease-in-out infinite;
          color: var(--color-orange);
        }

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .auto-select-title {
          font-size: var(--font-3xl);
          font-weight: var(--font-extrabold);
          margin: 0 0 var(--spacing-md) 0;
          background: linear-gradient(135deg, var(--color-orange), #ff8c42, var(--color-orange));
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          /* Fjernet animation - Performance First */
        }

        .auto-select-subtitle {
          font-size: var(--font-lg);
          color: var(--text-primary);
          margin: 0;
          line-height: 1.7;
          font-weight: var(--font-medium);
        }

        .auto-select-btn {
          width: 100%;
          padding: var(--spacing-xl) var(--spacing-2xl);
          font-size: var(--font-xl);
          font-weight: var(--font-extrabold);
          min-height: 56px; /* Større på desktop */
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          background: linear-gradient(135deg, var(--color-orange), #ff8c42, var(--color-orange));
          background-size: 200% 200%;
          box-shadow: 0 8px 32px rgba(255, 109, 31, 0.4);
          transition: all var(--transition-base);
          position: relative;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-lg);
          /* Fjernet animation - Performance First */
          z-index: 1;
        }

        /* Pulsing glow når data er klar */
        .auto-select-btn--ready {
          animation: gradientShift 3s ease infinite, autoSelectPulse 2s ease-in-out infinite;
        }

        .auto-select-btn--ready::after {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, var(--color-orange), rgba(255, 109, 31, 0.5));
          border-radius: var(--radius-lg);
          z-index: -1;
          opacity: 0.5;
          animation: autoSelectGlow 2s ease-in-out infinite;
        }

        @keyframes autoSelectPulse {
          0%, 100% {
            box-shadow: 
              0 8px 32px rgba(255, 109, 31, 0.4),
              0 0 0 0 rgba(255, 109, 31, 0.7);
          }
          50% {
            box-shadow: 
              0 12px 48px rgba(255, 109, 31, 0.6),
              0 0 0 8px rgba(255, 109, 31, 0);
          }
        }

        @keyframes autoSelectGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        .auto-select-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.6s ease;
        }

        .auto-select-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .auto-select-btn:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 48px rgba(255, 109, 31, 0.6);
          /* Fjernet animation - Performance First */
        }

        .auto-select-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.98);
        }

        .auto-select-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: none;
        }

        /* Fjernet animationer - Performance First */
        .auto-select-btn .btn-icon {
          transition: transform var(--transition-fast);
        }

        .auto-select-btn:hover .btn-icon {
          transform: scale(1.1);
        }

        .auto-select-btn .btn-text {
          font-size: var(--font-xl);
        }

        .auto-select-btn .btn-arrow {
          transition: transform var(--transition-base);  /* Max 300ms */
          opacity: 0.9;
        }

        .auto-select-btn:hover:not(:disabled) .btn-arrow {
          transform: translateX(6px);
        }

        .auto-select-hint-wrapper {
          margin-top: var(--spacing-lg);
          padding: var(--spacing-md);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
        }

        .auto-select-hint {
          margin: 0;
          font-size: var(--font-base);
          color: var(--text-secondary);
          font-style: normal;
        }

        /* Fjernet tunge animationer - Performance First */

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

        .number-of-lines-input {
          margin-bottom: var(--spacing-md);
        }

        .input-with-info {
          position: relative;
        }

        .info-suffix {
          position: absolute;
          right: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-weight: var(--font-semibold);
          pointer-events: none;
        }

        .input-with-info input {
          padding-right: 5rem;
        }

        .input-help-text {
          margin-top: var(--spacing-xs);
          font-size: var(--font-sm);
          color: var(--text-muted);
        }

        .existing-brands-input {
          margin-bottom: var(--spacing-md);
        }

        .existing-brands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-sm);
        }

        .existing-brand-card {
          position: relative;
          padding: var(--spacing-md);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-base);  /* Max 300ms */
          border: 2px solid transparent;
          background: var(--glass-bg);
        }

        .existing-brand-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-orange);
          box-shadow: var(--shadow-md);
        }

        .existing-brand-card.selected {
          border-color: var(--color-orange);
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.15) 0%, 
            rgba(255, 109, 31, 0.08) 100%
          );
          box-shadow: 0 8px 24px rgba(255, 109, 31, 0.4);
        }

        .existing-brand-name {
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          font-size: var(--font-base);
        }

        .existing-brand-checkmark {
          position: absolute;
          top: var(--spacing-xs);
          right: var(--spacing-xs);
          width: 24px;
          height: 24px;
          background: var(--color-success);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-bold);
          font-size: var(--font-sm);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          padding: 2px;
        }

        .section-header-icon {
          margin-right: var(--spacing-xs);
          vertical-align: middle;
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
          transition: all var(--transition-base);  /* Max 300ms */
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
          transform: translateY(-3px) translateZ(0);  /* Reduced motion, GPU accelerated */
          border-color: var(--color-orange);
          box-shadow: 
            var(--shadow-lg),
            0 0 30px rgba(255, 109, 31, 0.4);
        }

        .streaming-card:active {
          transform: translateY(-1px) scale(0.98) translateZ(0);  /* GPU accelerated */
        }

        .streaming-card.selected {
          border-color: var(--color-orange);
          background: linear-gradient(135deg, 
            rgba(255, 109, 31, 0.15) 0%, 
            rgba(255, 109, 31, 0.08) 100%
          );
          box-shadow: 0 8px 24px rgba(255, 109, 31, 0.4);
          transform: scale(1.01) translateZ(0);  /* Subtle, GPU accelerated */
        }

        .streaming-card.selected:hover {
          transform: translateY(-3px) translateZ(0);  /* Reduced motion, GPU accelerated */
          box-shadow: 0 16px 48px rgba(255, 109, 31, 0.5);
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
          transition: all var(--transition-base);  /* Max 300ms */
          margin-left: auto;
          margin-right: auto;
        }

        .streaming-card:hover .streaming-icon {
          transform: scale(1.1) translateZ(0);  /* Reduced rotation, GPU accelerated */
          box-shadow: 
            var(--shadow-lg),
            0 0 30px rgba(255, 109, 31, 0.5);
          filter: brightness(1.1);
        }

        /* Fjernet iconPulse animation - Performance First */

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
          transition: all var(--transition-base);  /* Max 300ms */
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
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4), 0 0 15px rgba(16, 185, 129, 0.5);
          animation: bounceIn var(--duration-slow) var(--ease-out-back), pulse 2s ease-in-out infinite;
          padding: 2px;
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

export default React.memo(StreamingSelector);

