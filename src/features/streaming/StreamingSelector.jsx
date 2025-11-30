/**
 * StreamingSelector komponent
 * Multi-select grid af streaming-tjenester
 */

import { streamingServices as staticStreaming, getServiceById } from '../../data/streamingServices';
import { plans } from '../../data/plans';
import { formatCurrency } from '../../utils/calculations';
import { searchProductsWithPrices, validateEAN } from '../../utils/powerApi';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from '../../utils/toast';
import Icon from '../../components/common/Icon';
import COPY from '../../constants/copy';
// Streaming selector styles moved to components.css

function StreamingSelector({
  selectedStreaming,
  onStreamingToggle,
  customerMobileCost,
  onMobileCostChange,
  broadbandCost,
  onBroadbandCostChange,
  originalItemPrice,
  onOriginalItemPriceChange,
  onEANSearch,
  isSearching = false,
  onAutoSelectSolution = null,
  numberOfLines = 1,
  onNumberOfLinesChange = null,
  existingBrands = [],
  onExistingBrandsChange = null,
  cartItems = [],
  onCBBMixEnabled = null,
  onCBBMixCount = null,
  activeProvider = 'all',
  onAddToCart = null
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

  // Filtrér tjenester: Skjul CBB MIX-only tjenester hvis Telmore eller bredbånd er valgt
  const isTelmoreOrBroadband = activeProvider === 'telmore' || activeProvider === 'broadband';
  const services = isTelmoreOrBroadband
    ? staticStreaming.filter(service => !service.cbbMixOnly)
    : staticStreaming;

  // Wrapper funktion der håndterer CBB MIX aktivering/deaktivering
  const handleStreamingToggle = (serviceId) => {
    const service = getServiceById(serviceId);
    if (!service) return;

    const isCurrentlySelected = selectedStreaming.includes(serviceId);

    // Hvis det er en CBB MIX-only tjeneste
    if (service.cbbMixOnly) {
      if (!isCurrentlySelected) {
        // Aktiverer en CBB MIX-only tjeneste - aktiver CBB MIX hvis ikke allerede aktiveret og ikke Telmore eller bredbånd
        const hasCBBMixEnabled = cartItems.some(item => item.plan.cbbMixAvailable && item.cbbMixEnabled);
        const isTelmoreOrBroadband = activeProvider === 'telmore' || activeProvider === 'broadband';

        if (!hasCBBMixEnabled && !isTelmoreOrBroadband && onCBBMixEnabled && onCBBMixCount) {
          // Find første plan der understøtter CBB MIX og aktiver det
          const firstCBBMixPlan = cartItems.find(item => item.plan.cbbMixAvailable);
          if (firstCBBMixPlan) {
            onCBBMixEnabled(firstCBBMixPlan.plan.id, true);
            onCBBMixCount(firstCBBMixPlan.plan.id, 2); // Standard 2 tjenester
          }
        }
      } else {
        // Fjerner en CBB MIX-only tjeneste - tjek om der er andre CBB MIX-only tjenester valgt
        const cbbMixOnlyIds = staticStreaming
          .filter(s => s.cbbMixOnly)
          .map(s => s.id);

        const remainingCBBMixOnly = selectedStreaming.filter(id =>
          id !== serviceId && cbbMixOnlyIds.includes(id)
        );

        // Hvis ingen andre CBB MIX-only tjenester er valgt, deaktiver CBB MIX
        if (remainingCBBMixOnly.length === 0 && onCBBMixEnabled) {
          cartItems.forEach(item => {
            if (item.plan.cbbMixAvailable && item.cbbMixEnabled) {
              onCBBMixEnabled(item.plan.id, false);
            }
          });
        }
      }
    }

    // Kald den originale toggle funktion
    onStreamingToggle(serviceId);
  };

  const streamingTotal = services
    .filter(s => selectedStreaming.includes(s.id))
    .reduce((sum, s) => sum + (s.price || 0), 0);
  const monthlyTotal = (customerMobileCost || 0) + (broadbandCost || 0) + streamingTotal;
  const sixMonthTotal = (monthlyTotal * 6) + (originalItemPrice || 0);

  const handleMobileCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onMobileCostChange(value);
  };

  const handleOriginalItemPriceChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    onOriginalItemPriceChange(value);
  };

  const handleBroadbandCostChange = (e) => {
    const inputValue = parseFloat(e.target.value) || 0;
    onBroadbandCostChange(inputValue);
  };

  const handleBroadbandCostBlur = (e) => {
    // Vi behøver ikke længere auto-vælge bredbånd, da det forvirrer brugeren.
    // Denne funktion er nu tom, men beholdes hvis vi vil tilføje validering senere.
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

      {/* Bredbånd udgifter input */}
      {onBroadbandCostChange && (
        <div className="broadband-cost-input">
          <label htmlFor="broadband-cost" className="input-label">
            <Icon name="wifi" size={18} className="icon-inline icon-spacing-xs" />
            {COPY.labels.broadbandCost}
          </label>
          <div className="input-with-currency">
            <input
              id="broadband-cost"
              name="broadband-cost"
              type="number"
              className="input"
              placeholder="299"
              value={broadbandCost || ''}
              onChange={handleBroadbandCostChange}
              onBlur={handleBroadbandCostBlur}
              min="0"
              step="10"
            />
            <span className="currency-suffix">kr./md.</span>
          </div>
        </div>
      )}

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
              onClick={() => handleStreamingToggle(service.id)}
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
          <span className="total-label">Bredbånd {COPY.help.perMonthShort}:</span>
          <span className="total-value">{formatCurrency(broadbandCost || 0)}</span>
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

    </div>
  );
}

export default React.memo(StreamingSelector);

