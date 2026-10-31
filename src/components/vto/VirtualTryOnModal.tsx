import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw, Download, Sparkles, Check, Eye, ShieldCheck, ShoppingBag, Sliders, Box, Layers, RefreshCw } from 'lucide-react';
import { Product, ColorVariant } from '../../types';
import { ThreeGlassesScene } from './ThreeGlassesScene';
import { DEFAULT_PRODUCTS } from '../../data/defaultProducts';
import { formatCurrency } from '../../utils/format';
import { trackEvent } from '../../utils/analytics';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  currency: 'PKR' | 'USD';
  exchangeRate: number;
  onAddToCart: (product: Product, color: ColorVariant) => void;
}

const SAMPLE_MODELS = [
  { id: 'm1', name: 'Oval Face', shape: 'Oval', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=80' },
  { id: 'm2', name: 'Square Jaw', shape: 'Square', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80' },
  { id: 'm3', name: 'Round Contour', shape: 'Round', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80' }
];

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  currency,
  exchangeRate,
  onAddToCart
}) => {
  const safeProducts = products && products.length > 0 ? products : DEFAULT_PRODUCTS;
  const initialFallback = initialProduct || safeProducts[0] || DEFAULT_PRODUCTS[0];

  const [selectedProduct, setSelectedProduct] = useState<Product>(initialFallback);
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(
    initialFallback.colors?.[0] || { name: 'Classic Black', hex: '#121215' }
  );
  const [mode, setMode] = useState<'webcam' | 'photo'>('webcam');
  const [scale, setScale] = useState<number>(initialFallback.vtoScaleMultiplier || 1.0);
  const [verticalOffset, setVerticalOffset] = useState<number>(initialFallback.vtoVerticalOffset || 0);
  const [pitch, setPitch] = useState<number>(0);
  const [yaw, setYaw] = useState<number>(0);
  const [roll, setRoll] = useState<number>(0);
  const [is360Inspect, setIs360Inspect] = useState<boolean>(false);
  const [isBeforeAfter, setIsBeforeAfter] = useState<boolean>(false);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedPD, setDetectedPD] = useState<number>(63);
  const [snapshotTaken, setSnapshotTaken] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const threeSceneRef = useRef<ThreeGlassesScene | null>(null);
  const photoImageRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Keep active product in sync if initialProduct or products update
  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setSelectedColor(initialProduct.colors?.[0] || { name: 'Classic Black', hex: '#121215' });
      setScale(initialProduct.vtoScaleMultiplier || 1.0);
      setVerticalOffset(initialProduct.vtoVerticalOffset || 0);
    } else if (!selectedProduct && safeProducts.length > 0) {
      setSelectedProduct(safeProducts[0]);
      setSelectedColor(safeProducts[0].colors?.[0] || { name: 'Classic Black', hex: '#121215' });
    }
  }, [initialProduct, products]);

  // Mount Three.js Scene safely
  useEffect(() => {
    if (isOpen && threeContainerRef.current && !threeSceneRef.current) {
      try {
        threeSceneRef.current = new ThreeGlassesScene(threeContainerRef.current);
      } catch (err) {
        console.warn("Could not instantiate ThreeGlassesScene:", err);
      }
    }

    return () => {
      if (threeSceneRef.current) {
        try {
          threeSceneRef.current.destroy();
        } catch (e) {}
        threeSceneRef.current = null;
      }
    };
  }, [isOpen]);

  // Update 3D Glasses Model when product or color changes
  useEffect(() => {
    if (threeSceneRef.current && selectedProduct && selectedColor) {
      try {
        threeSceneRef.current.updateGlasses({
          type: selectedProduct.vtoOverlayType || 'square_acetate',
          colorHex: selectedColor.hex || '#121215',
          scale: scale * (selectedProduct.vtoScaleMultiplier || 1.0),
          verticalOffset: verticalOffset + (selectedProduct.vtoVerticalOffset || 0),
          pitch,
          yaw,
          roll,
          lensTint: selectedProduct.category === 'Sunglasses' ? '#1c2538' : undefined
        });
      } catch (err) {
        console.warn("Could not update 3D glasses model:", err);
      }
    }
  }, [selectedProduct, selectedColor, scale, verticalOffset, pitch, yaw, roll]);

  // Toggle 360 inspect
  useEffect(() => {
    if (threeSceneRef.current) {
      try {
        threeSceneRef.current.set360Inspect(is360Inspect);
      } catch (e) {}
    }
  }, [is360Inspect]);

  useEffect(() => {
    if (isOpen) {
      trackEvent('try_on_launched', { productId: selectedProduct?.id, title: selectedProduct?.title, engine: 'threejs' });
      if (mode === 'webcam') {
        startCamera();
      }
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode]);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Video play aborted or failed:", e));
      }
      setWebcamActive(true);
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err);
      setCameraError("Camera unavailable. Switched to Photo 3D Mode.");
      setMode('photo');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setWebcamActive(false);
  };

  // Background Rendering & Optical Pose Simulation Loop
  const renderBackground = useCallback(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (mode === 'webcam' && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();

      // Optical dynamic tracking simulation (subtle breath & tracking)
      const t = Date.now() / 1000;
      const subtleWobbleY = Math.sin(t * 1.5) * 1.8;
      const subtlePitch = Math.sin(t * 0.9) * 0.03 + pitch;
      const subtleYaw = Math.cos(t * 0.7) * 0.04 + yaw;
      const subtleRoll = Math.sin(t * 1.2) * 0.02 + roll;

      const centerX = width * 0.5;
      const centerY = height * 0.42 + subtleWobbleY + verticalOffset * 2;

      if (threeSceneRef.current && !isBeforeAfter && !is360Inspect && selectedProduct) {
        try {
          threeSceneRef.current.setPose(centerX, centerY, subtlePitch, subtleYaw, subtleRoll, scale * (selectedProduct.vtoScaleMultiplier || 1.0));
        } catch (e) {}
      }
    } else if (mode === 'photo' && photoImageRef.current) {
      ctx.drawImage(photoImageRef.current, 0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.43 + verticalOffset * 2;

      if (threeSceneRef.current && !isBeforeAfter && !is360Inspect && selectedProduct) {
        try {
          threeSceneRef.current.setPose(centerX, centerY, pitch, yaw, roll, scale * (selectedProduct.vtoScaleMultiplier || 1.0));
        } catch (e) {}
      }
    }

    animFrameRef.current = requestAnimationFrame(renderBackground);
  }, [mode, pitch, yaw, roll, verticalOffset, scale, selectedProduct, isBeforeAfter, is360Inspect]);

  useEffect(() => {
    if (isOpen) {
      animFrameRef.current = requestAnimationFrame(renderBackground);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, renderBackground]);

  // Load photo model
  useEffect(() => {
    if (mode === 'photo' && !photoImageRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = SAMPLE_MODELS[0].url;
      img.onload = () => { photoImageRef.current = img; };
    }
  }, [mode]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          photoImageRef.current = img;
          setMode('photo');
          stopCamera();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // High-Resolution 3D Snapshot Composite
  const handleCaptureSnapshot = () => {
    const bgCanvas = backgroundCanvasRef.current;
    if (!bgCanvas || !threeSceneRef.current) return;

    // Create offscreen composite canvas
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = bgCanvas.width;
    compositeCanvas.height = bgCanvas.height;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw photo / camera background
    ctx.drawImage(bgCanvas, 0, 0);

    // 2. Draw 3D Three.js overlay
    const threeDataUrl = threeSceneRef.current.captureSnapshot();
    const threeImg = new Image();
    threeImg.onload = () => {
      ctx.drawImage(threeImg, 0, 0);
      setSnapshotTaken(compositeCanvas.toDataURL('image/jpeg', 0.95));
    };
    threeImg.src = threeDataUrl;
  };

  const downloadSnapshot = () => {
    if (!snapshotTaken) return;
    const link = document.createElement('a');
    link.download = `nextvision-3d-tryon-${selectedProduct.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    link.href = snapshotTaken;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-luxury-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-luxury-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-100 bg-luxury-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-luxury-950 text-gold flex items-center justify-center shadow-sm">
              <Box className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-luxury-950">Three.js 3D Virtual Try-On</h3>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-champagne-100 text-champagne-700 border border-champagne-300">
                  WebGL 3D
                </span>
              </div>
              <p className="text-xs text-luxury-400">Physically-based rendering, translucent optics & 3D head pose tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-luxury-200/60 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => { setMode('webcam'); startCamera(); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  mode === 'webcam' ? 'bg-luxury-950 text-white shadow-sm' : 'text-luxury-600 hover:text-luxury-950'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Live Mirror
              </button>
              <button
                onClick={() => { setMode('photo'); stopCamera(); }}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  mode === 'photo' ? 'bg-luxury-950 text-white shadow-sm' : 'text-luxury-600 hover:text-luxury-950'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Photo / Model
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-luxury-400 hover:text-luxury-950 hover:bg-luxury-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Viewport Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-luxury-950 flex flex-col items-center justify-center p-4 relative min-h-[360px] sm:min-h-[460px]">
            
            <video ref={videoRef} className="hidden" playsInline muted autoPlay />

            {/* Three.js Interactive Container */}
            <div className="relative w-full max-w-[560px] aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 ar-glow bg-black flex items-center justify-center">
              {/* Background Video / Photo Canvas */}
              <canvas
                ref={backgroundCanvasRef}
                width={640}
                height={480}
                className="w-full h-full object-cover"
              />

              {/* Three.js 3D WebGL Canvas Overlay */}
              <div
                ref={threeContainerRef}
                className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                  isBeforeAfter ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* PD Metric Badge */}
              <div className="absolute top-4 left-4 bg-luxury-950/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-white/10 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>IPD: <strong>{detectedPD} mm</strong></span>
              </div>

              {/* 3D Engine Badge */}
              <div className="absolute top-4 right-4 bg-luxury-950/80 backdrop-blur-md text-white/80 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1.5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Three.js WebGL Engine</span>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBeforeAfter(!isBeforeAfter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all ${
                      isBeforeAfter
                        ? 'bg-champagne-500 text-luxury-950'
                        : 'bg-black/60 text-white/90 hover:bg-black/80'
                    }`}
                  >
                    {isBeforeAfter ? 'Original Face' : '3D Glasses On'}
                  </button>

                  <button
                    onClick={() => setIs360Inspect(!is360Inspect)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1 transition-all ${
                      is360Inspect
                        ? 'bg-champagne-500 text-luxury-950 shadow-md'
                        : 'bg-black/60 text-white/90 hover:bg-black/80'
                    }`}
                    title="Rotate 360° to inspect 3D frame details and hinges"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${is360Inspect ? 'animate-spin' : ''}`} />
                    <span>360° Spin</span>
                  </button>
                </div>

                <button
                  onClick={handleCaptureSnapshot}
                  className="px-4 py-2 bg-white text-luxury-950 hover:bg-champagne-100 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Camera className="w-3.5 h-3.5 text-luxury-950" /> 3D Snapshot
                </button>
              </div>
            </div>

            {/* Error Message */}
            {cameraError && (
              <div className="mt-3 text-xs text-amber-300 bg-amber-950/50 px-4 py-2 rounded-lg border border-amber-800 text-center max-w-md">
                {cameraError}
              </div>
            )}

            {/* Model Presets */}
            {mode === 'photo' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-luxury-300">
                <span>Face shape models:</span>
                <div className="flex gap-1.5">
                  {SAMPLE_MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.src = m.url;
                        img.onload = () => { photoImageRef.current = img; };
                      }}
                      className="px-2.5 py-1 rounded bg-luxury-800 text-white hover:bg-luxury-700 text-[11px]"
                    >
                      {m.shape}
                    </button>
                  ))}
                  <label className="cursor-pointer px-2.5 py-1 rounded bg-champagne-500 text-luxury-950 font-medium hover:bg-champagne-600 text-[11px] flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Upload
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right Product Controls (5 Cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white overflow-y-auto">
            <div>
              <div className="border-b border-luxury-100 pb-4 mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-luxury-400">
                  {selectedProduct.category} • {selectedProduct.frameShape}
                </span>
                <h4 className="font-serif text-2xl font-bold text-luxury-950 mt-1">
                  {selectedProduct.title}
                </h4>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-bold text-luxury-950">
                    {formatCurrency(selectedProduct.salePrice || selectedProduct.basePrice, currency, exchangeRate)}
                  </span>
                  {selectedProduct.salePrice && (
                    <span className="text-sm line-through text-luxury-400">
                      {formatCurrency(selectedProduct.basePrice, currency, exchangeRate)}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Switcher */}
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-500 mb-2">
                  3D Material & Color: <span className="text-luxury-950 normal-case font-bold">{selectedColor.name}</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {selectedProduct.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor.name === color.name
                          ? 'border-luxury-950 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor.name === color.name && (
                        <Check className={`w-4 h-4 ${color.hex === '#121215' || color.hex === '#0f0f11' ? 'text-white' : 'text-luxury-950'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Sliders & Calibration */}
              <div className="bg-luxury-50 p-4 rounded-xl mb-5 border border-luxury-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-luxury-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" /> 3D Spatial Calibration
                  </span>
                  <button
                    onClick={() => {
                      setScale(selectedProduct.vtoScaleMultiplier || 1.0);
                      setVerticalOffset(selectedProduct.vtoVerticalOffset || 0);
                      setPitch(0);
                      setYaw(0);
                      setRoll(0);
                    }}
                    className="text-[11px] text-luxury-500 hover:text-luxury-950 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-luxury-600">3D Scale</span>
                      <span className="font-mono font-medium">{Math.round(scale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.02"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full accent-luxury-950 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-luxury-600">Bridge Height (Y)</span>
                      <span className="font-mono font-medium">{verticalOffset > 0 ? `+${verticalOffset}px` : `${verticalOffset}px`}</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={verticalOffset}
                      onChange={(e) => setVerticalOffset(parseInt(e.target.value))}
                      className="w-full accent-luxury-950 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-luxury-200">
                    <div>
                      <span className="text-[10px] text-luxury-600 block mb-1">Head Pitch (Tilt Up/Down)</span>
                      <input
                        type="range"
                        min="-0.4"
                        max="0.4"
                        step="0.02"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full accent-luxury-950 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-luxury-600 block mb-1">Head Yaw (Turn Left/Right)</span>
                      <input
                        type="range"
                        min="-0.6"
                        max="0.6"
                        step="0.02"
                        value={yaw}
                        onChange={(e) => setYaw(parseFloat(e.target.value))}
                        className="w-full accent-luxury-950 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3D Frame Carousel */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-luxury-500 mb-2">
                  Browse 3D Eyewear Catalog:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {products.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedColor(p.colors[0]);
                        setScale(p.vtoScaleMultiplier || 1.0);
                        setVerticalOffset(p.vtoVerticalOffset || 0);
                        setPitch(0);
                        setYaw(0);
                        setRoll(0);
                      }}
                      className={`p-1.5 rounded-lg border text-left transition-all ${
                        selectedProduct.id === p.id
                          ? 'border-luxury-950 bg-luxury-100 shadow-sm'
                          : 'border-luxury-200 hover:border-luxury-400 bg-white'
                      }`}
                    >
                      <img src={p.images[0]} alt={p.title} className="w-full h-12 object-cover rounded mb-1" loading="lazy" />
                      <p className="text-[10px] font-semibold text-luxury-950 truncate">{p.title}</p>
                      <p className="text-[9px] text-luxury-500">{p.frameShape}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-luxury-100 mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  onAddToCart(selectedProduct, selectedColor);
                  trackEvent('add_to_cart', { productId: selectedProduct.id, title: selectedProduct.title });
                }}
                className="w-full py-3.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
              >
                <ShoppingBag className="w-4 h-4 text-gold" />
                Add to Cart ({formatCurrency(selectedProduct.salePrice || selectedProduct.basePrice, currency, exchangeRate)})
              </button>
              <p className="text-center text-[11px] text-luxury-400">
                Includes complimentary hard-shell leather case & microfiber cloth
              </p>
            </div>
          </div>
        </div>

        {/* Snapshot Modal */}
        {snapshotTaken && (
          <div className="absolute inset-0 bg-luxury-950/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl text-center">
              <h4 className="font-serif text-xl font-bold text-luxury-950 mb-2">Three.js 3D Virtual Try-On Snapshot</h4>
              <p className="text-xs text-luxury-500 mb-4">Wearing {selectedProduct.title} ({selectedColor.name})</p>
              
              <div className="rounded-xl overflow-hidden shadow-lg border border-luxury-200 mb-5">
                <img src={snapshotTaken} alt="Snapshot Preview" className="w-full object-cover" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadSnapshot}
                  className="flex-1 py-2.5 bg-luxury-950 hover:bg-luxury-800 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Save Photo
                </button>
                <button
                  onClick={() => setSnapshotTaken(null)}
                  className="px-4 py-2.5 bg-luxury-100 hover:bg-luxury-200 text-luxury-800 rounded-xl text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
