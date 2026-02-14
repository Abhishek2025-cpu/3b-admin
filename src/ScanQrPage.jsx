import React, { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import axios from "axios";

// --- CSS STYLES (Modern & Responsive) ---
const styles = `
  :root {
    --primary: #4F46E5;
    --primary-dark: #4338ca;
    --secondary: #10B981;
    --bg-color: #f3f4f6;
    --card-bg: #ffffff;
    --text-main: #1f2937;
    --text-muted: #6b7280;
    --border: #e5e7eb;
    --radius: 12px;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  body {
    background-color: var(--bg-color);
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-main);
  }

  .app-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 0 15px;
  }

  .card {
    background: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 20px;
    margin-bottom: 20px;
    transition: transform 0.2s;
  }

  .header {
    text-align: center;
    margin-bottom: 20px;
  }
  .header h2 { margin: 0; color: var(--primary); }
  .header p { margin: 5px 0 0; color: var(--text-muted); font-size: 0.9em; }

  /* Scanner Section */
  .scan-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .tab-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: #e0e7ff;
    color: var(--primary);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .tab-btn.active {
    background: var(--primary);
    color: white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .scanner-box {
    border-radius: var(--radius);
    overflow: hidden;
    position: relative;
    background: #000;
    min-height: 300px;
  }

  .upload-area {
    border: 2px dashed var(--primary);
    border-radius: var(--radius);
    padding: 40px 20px;
    text-align: center;
    background: #fdfdff;
    cursor: pointer;
  }
  
  .upload-label {
    display: block;
    margin-top: 10px;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* Product Details */
  .product-image {
    width: 100%;
    height: 200px;
    object-fit: contain;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 15px;
  }
  
  .full-width { grid-column: span 2; }

  .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 4px;
    display: block;
  }

  .value-box {
    width: 100%;
    padding: 10px 12px;
    background: #f9fafb;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 0.95rem;
    color: var(--text-main);
    box-sizing: border-box;
  }

  .value-box:focus {
    outline: 2px solid var(--primary);
    background: #fff;
  }

  /* Calculator */
  .calc-section {
    background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    border: 1px solid #a7f3d0;
  }

  .total-display {
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px dashed #059669;
  }
  
  .total-amount {
    font-size: 2.2rem;
    font-weight: 800;
    color: #059669;
  }

  .btn-reset {
    width: 100%;
    padding: 15px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
    transition: background 0.2s;
  }
  
  .btn-reset:hover { background: #dc2626; }

  .loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--primary);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }

  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const ScanQrPage = () => {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' or 'upload'
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [calc, setCalc] = useState({
    quantity: 1,
    pricePerPiece: 0,
    total: 0,
  });

  const scannerRef = useRef(null);

  // --- API Call ---
  const fetchProduct = async (id) => {
    setLoading(true);
    // अगर scanner चालू है तो उसे बंद करें
    if (scannerRef.current) {
        try {
           await scannerRef.current.stop();
           scannerRef.current = null;
        } catch(e) { console.log(e) }
    }

    try {
      const res = await axios.get(
        `https://threebapi-1067354145699.asia-south1.run.app/api/products/scan/${id}`
      );
      if (res.data?.success) {
        const p = res.data.product;
        setProduct(p);
        
        const initialPrice = p.pricePerPiece || 0;
        setCalc({
          quantity: 1,
          pricePerPiece: initialPrice,
          total: initialPrice.toFixed(2),
        });
        setScanned(true);
      } else {
        alert("Product not found via API.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error fetching product details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Camera Scanner Logic ---
  useEffect(() => {
    if (!scanned && activeTab === "camera") {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (text) => {
          // Success callback
          const id = text.split("/").pop(); // Extract ID if URL
          fetchProduct(id);
        },
        (errorMessage) => {
          // Scanning... (ignore errors usually)
        }
      ).catch((err) => {
        console.error("Camera start failed", err);
      });

      return () => {
        if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.log("Stop failed", err));
        }
      };
    }
  }, [scanned, activeTab]);

  // --- Image Upload Logic ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        const id = code.data.split("/").pop();
        fetchProduct(id);
      } else {
        alert("No QR code found in this image.");
        setLoading(false);
      }
    };
  };

  // --- Calculator Effect ---
  useEffect(() => {
    const newTotal = calc.quantity * calc.pricePerPiece;
    setCalc((prev) => ({
      ...prev,
      total: newTotal.toFixed(2),
    }));
  }, [calc.quantity, calc.pricePerPiece]);

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        
        {/* Header */}
        <div className="header">
          <h2>📦 Smart Inventory Scan</h2>
          <p>Scan product or upload image to calculate</p>
        </div>

        {/* --- SCANNER VIEW --- */}
        {!scanned && (
          <div className="card">
            {/* Tabs */}
            <div className="scan-tabs">
              <button 
                className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
                onClick={() => setActiveTab('camera')}
              >
                📸 Camera
              </button>
              <button 
                className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                🖼️ Gallery
              </button>
            </div>

            {loading ? (
               <div className="loading-spinner"></div>
            ) : (
              <>
                {activeTab === "camera" && (
                  <div className="scanner-box">
                    <div id="qr-reader" style={{ width: "100%" }}></div>
                  </div>
                )}

                {activeTab === "upload" && (
                  <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
                    <span style={{fontSize: '3rem'}}>📂</span>
                    <span className="upload-label">Tap to Upload Image</span>
                    <input 
                      id="file-input"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- RESULT VIEW --- */}
        {scanned && product && (
          <>
            {/* Product Card */}
            <div className="card">
              {product.images?.[0]?.url ? (
                <img 
                  src={product.images[0].url} 
                  alt={product.name} 
                  className="product-image"
                />
              ) : (
                <div style={{height: 100, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8}}>
                    No Image Available
                </div>
              )}
              
              <h3 style={{marginTop: 10, marginBottom: 5}}>{product.name}</h3>
              
              <div className="info-grid">
                <div className="full-width">
                  <span className="label">Description</span>
                  <div className="value-box" style={{background: '#fff', fontSize: '0.9em', minHeight: 60}}>
                    {product.description || "No description available"}
                  </div>
                </div>

                <div>
                   <span className="label">Pieces / Box</span>
                   <div className="value-box">{product.totalPiecesPerBox}</div>
                </div>

                <div>
                   <span className="label">Price / Box</span>
                   <div className="value-box">₹{product.finalPricePerBox || 0}</div>
                </div>
                
                {/* <div className="full-width">
                  <span className="label">Dimensions</span>
                  <div className="value-box">{product.dimensions?.join(" x ") || "N/A"}</div>
                </div> */}
              </div>
            </div>

            {/* Calculator Card */}
            <div className="card calc-section">
              <h3 style={{margin: '0 0 15px 0', color: '#059669', display: 'flex', alignItems: 'center'}}>
                 🧮 Calculator
              </h3>
              
              <div className="info-grid">
                <div>
                   <span className="label">Quantity</span>
                   <input
                      type="number"
                      className="value-box"
                      value={calc.quantity}
                      onChange={(e) => setCalc({ ...calc, quantity: Math.max(0, Number(e.target.value)) })}
                      min="1"
                    />
                </div>

                <div>
                   <span className="label">Price / Piece (₹)</span>
                   <input
                      type="number"
                      className="value-box"
                      value={calc.pricePerPiece}
                      onChange={(e) => setCalc({ ...calc, pricePerPiece: Math.max(0, Number(e.target.value)) })}
                      min="0"
                      step="0.01"
                    />
                </div>
              </div>

              <div className="total-display">
                <span className="label" style={{marginBottom: 5}}>ESTIMATED TOTAL</span>
                <div className="total-amount">₹ {calc.total}</div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              className="btn-reset"
              onClick={() => {
                setScanned(false);
                setProduct(null);
                setLoading(false);
                setActiveTab("camera");
              }}
            >
              🔄 New Scan
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default ScanQrPage;