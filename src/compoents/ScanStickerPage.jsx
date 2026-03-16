import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';

const BoxIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v2h14V4a1 1 0 00-1-1H4zM3 9v9a1 1 0 001 1h12a1 1 0 001-1V9H3z" /></svg>);
const DeleteIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const PrintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>);
const DownloadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>);
const TrackIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>);
const QrCodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" /></svg>);
const Spinner = () => (<svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

const scannerStyles = `
  :root {
    --primary: #4F46E5;
    --primary-dark: #4338ca;
    --border: #e5e7eb;
    --radius: 12px;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .app-container { max-width: 600px; margin: 0 auto; padding: 20px 15px; }
  .scan-card { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; margin-bottom: 20px; }
  .header { text-align: center; margin-bottom: 20px; }
  .header h2 { margin: 0; color: var(--primary); }
  .header p { margin: 5px 0 0; color: #6b7280; font-size: 0.9em; }
  .scan-tabs { display: flex; gap: 10px; margin-bottom: 15px; }
  .tab-btn { flex: 1; padding: 10px; border: none; border-radius: 8px; background: #e0e7ff; color: var(--primary); font-weight: 600; cursor: pointer; transition: all 0.3s; }
  .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
  .scanner-box { border-radius: var(--radius); overflow: hidden; position: relative; background: #000; min-height: 300px; }
  .upload-area { border: 2px dashed var(--primary); border-radius: var(--radius); padding: 40px 20px; text-align: center; background: #fdfdff; cursor: pointer; }
  .upload-label { display: block; margin-top: 10px; color: #6b7280; font-weight: 500; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
  .full-width { grid-column: span 2; }
  .label-scan { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; display: block; font-weight: 600; }
  .value-box { width: 100%; padding: 12px; background: #f9fafb; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; color: #1f2937; box-sizing: border-box; }
  .value-box:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
  .button-group { display: flex; gap: 15px; margin-top: 20px; }
  .btn-reset { flex: 1; padding: 15px; background: #ef4444; color: white; border: none; border-radius: var(--radius); font-size: 1rem; font-weight: bold; cursor: pointer; }
  .btn-action { flex: 1; padding: 15px; background: var(--primary); color: white; border: none; border-radius: var(--radius); font-size: 1rem; font-weight: bold; cursor: pointer; }
  
  /* Scrollbar for Box List */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const GenericModal = ({ isOpen, onClose, children, maxWidth = "max-w-lg", zIndex = "z-50" }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 ${zIndex} flex justify-center items-center p-4 print:p-0`}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print" onClick={onClose}></div>
            <div className={`${maxWidth} bg-white rounded-2xl shadow-2xl w-full flex flex-col relative z-10 overflow-visible max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none`}>
                {children}
            </div>
        </div>
    );
};

const BoxesModal = ({ isOpen, onClose, item, onOpenSmartQrModal }) => {
    if (!isOpen) return null;

    return (
        <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" zIndex="z-[10000]">
            <div className="bg-white rounded-t-2xl px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-800">Boxes List</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-3xl font-light">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50 flex-grow" style={{ maxHeight: '60vh' }}>
                {item?.boxes?.length > 0 ? (
                    <div className="space-y-4">
                        {item.boxes.map((box) => (
                            <div key={box._id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="p-1 border border-gray-100 rounded-lg bg-gray-50">
                                        <img src={box.barCodeUrl} alt="Bar Code" className="w-14 h-14 object-contain" style={{ imageRendering: 'pixelated' }} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-500">Serial:</span>
                                        <span className="text-lg font-bold text-gray-800 tracking-wide">{box.boxSerialNo}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    <button
                                        onClick={() => onOpenSmartQrModal(item, box)}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#4b5563] hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                                    >
                                        <PrintIcon /> View/Print
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 font-medium">No serials/boxes generated yet.</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t bg-white rounded-b-2xl flex flex-wrap justify-end items-center gap-3">
                <button onClick={onClose} className="bg-[#ef4444] hover:bg-red-600 text-white font-bold py-2 px-8 rounded-lg transition-colors">
                    Close
                </button>
            </div>
        </GenericModal>
    );
};

const BarcodeFallbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875h16.5M3.75 19.125h16.5M5.25 7.125v9.75M8.25 7.125v9.75M11.25 7.125v9.75M14.25 7.125v9.75M17.25 7.125v9.75M20.25 7.125v9.75" />
    </svg>
);

const SmartQrTagModal = ({ isOpen, onClose, item, box }) => {
    // New state for download loading status
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !item || !box) return null;

    const barCodeUrl = box.barCodeUrl;
    const serialNo = box.boxSerialNo;
    const productName = item.itemNo?.trim() || "Unknown Product";

    const handlePrintSticker = () => {
        if (!barCodeUrl) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Print Barcode Tag</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
                <img src="${barCodeUrl}" style="max-width:100%; max-height:100%; object-fit:contain; image-rendering: pixelated;" />
            </body></html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
    };

    // DIRECT SINGLE CLICK DOWNLOAD FUNCTION
    const handleDownloadBarcode = async () => {
        if (!barCodeUrl) return;

        setIsDownloading(true); // Start loading state
        const toastId = toast.loading("Downloading...");

        const triggerDownload = (blobData) => {
            const url = window.URL.createObjectURL(blobData);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Barcode_${productName}_Serial_${serialNo}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        };

        try {
            // Attempt 1: Direct fetch 
            let response = await fetch(barCodeUrl);
            if (!response.ok) throw new Error("CORS or Network issue");

            let blob = await response.blob();
            triggerDownload(blob);
            toast.success("Downloaded successfully!", { id: toastId });

        } catch (error) {
            console.log("Direct fetch blocked by CORS. Using Proxy bypass...");

            try {
                // Attempt 2: Bypassing CORS using allorigins Proxy
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(barCodeUrl)}`;
                const proxyResponse = await fetch(proxyUrl);

                if (!proxyResponse.ok) throw new Error("Proxy fetch failed");

                let blob = await proxyResponse.blob();
                triggerDownload(blob);
                toast.success("Downloaded successfully!", { id: toastId });

            } catch (proxyError) {
                console.error("Proxy download failed.", proxyError);
                toast.dismiss(toastId);

                // Final Fallback: if proxy fails somehow, open in new tab
                const a = document.createElement('a');
                a.href = barCodeUrl;
                a.target = "_blank";
                a.download = `Barcode_${productName}_Serial_${serialNo}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } finally {
            setIsDownloading(false); // Stop loading state whether success or fail
        }
    };

    return (
        <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" zIndex="z-[10050]">
            <div className="p-8 flex flex-col items-center text-center relative overflow-hidden bg-white rounded-2xl w-full">
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-purple-50 to-transparent"></div>
                <h3 className="font-black text-2xl mb-6 text-gray-800 tracking-tight relative z-10">Smart Barcode Tag</h3>
                <div className="relative z-10 bg-white p-5 rounded-3xl border-2 border-dashed border-[#6A3E9D]/30 mb-6 shadow-xl shadow-purple-100 group hover:border-[#6A3E9D] transition-colors duration-300">
                    {barCodeUrl ? (
                        <img src={barCodeUrl} className="w-64 h-24 object-contain transform group-hover:scale-105 transition-transform duration-500" style={{ imageRendering: 'pixelated' }} alt="Barcode" />
                    ) : (
                        <div className="w-64 h-24 bg-gray-50 flex flex-col items-center justify-center rounded-2xl gap-2">
                            <BarcodeFallbackIcon />
                            <span className="text-gray-400 text-sm font-bold tracking-widest uppercase text-center">No Barcode <br /> Generated</span>
                        </div>
                    )}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#6A3E9D] rounded-tl-xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#6A3E9D] rounded-tr-xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#6A3E9D] rounded-bl-xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#6A3E9D] rounded-br-xl -mb-1 -mr-1"></div>
                </div>

                <div className="mb-8 relative z-10">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Model / Frame Details</p>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4A1D7A] to-[#8B5CF6] tracking-tight leading-none drop-shadow-sm">
                        {productName}
                    </h2>
                    <div className="mt-3 inline-block bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200">
                        <p className="text-sm font-bold text-gray-600 tracking-wide">SERIAL: {serialNo}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full relative z-10">
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handlePrintSticker}
                            disabled={!barCodeUrl || isDownloading}
                            className="flex-1 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            <PrintIcon /> Print Sticker
                        </button>
                        <button
                            onClick={handleDownloadBarcode}
                            disabled={!barCodeUrl || isDownloading}
                            className="flex-1 py-3.5 bg-gradient-to-r from-[#6A3E9D] to-[#8B5CF6] hover:from-[#5a3486] hover:to-[#6A3E9D] text-white rounded-2xl font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <DownloadIcon /> Download PNG
                                </>
                            )}
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDownloading}
                        className="w-full py-3.5 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 rounded-2xl font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        </GenericModal>
    );
};

const ImageSliderModal = ({ isOpen, onClose, images, startIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    useEffect(() => { setCurrentIndex(startIndex); }, [startIndex, images]);
    if (!isOpen || !images || images.length === 0) return null;
    const goToPrevious = () => { setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1)); };
    const goToNext = () => { setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1)); };

    return (
        <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl" zIndex="z-[70]">
            <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Product Images</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button></div>
            <div className="relative flex-grow flex items-center justify-center p-4">
                {images.length > 1 && (
                    <><button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75">&#10094;</button><button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75">&#10095;</button></>
                )}
                <img src={images[currentIndex]} alt={`Product image ${currentIndex + 1}`} className="max-w-full max-h-[calc(80vh-120px)] object-contain rounded-lg shadow-md" />
            </div>
            {images.length > 1 && (<div className="p-2 border-t text-center text-gray-600">{currentIndex + 1} / {images.length}</div>)}
            <div className="p-4 border-t flex justify-end"><button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">Close</button></div>
        </GenericModal>
    );
};


// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const ScanStickerPage = () => {
    // --- Scanner States ---
    const [activeTab, setActiveTab] = useState("camera");
    const [scanned, setScanned] = useState(false);
    const [scannerLoading, setScannerLoading] = useState(false);
    const [formData, setFormData] = useState({ itemNo: "", boxSerialNo: "", operatorId: "", operatorName: "", helperId: "", helperName: "", shift: "" });
    const scannerRef = useRef(null);

    // --- List States ---
    const [items, setItems] = useState([]);
    const [fullItemsMap, setFullItemsMap] = useState(new Map());
    const [listLoading, setListLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals States
    const [isBoxesModalOpen, setIsBoxesModalOpen] = useState(false);
    const [selectedItemForBoxes, setSelectedItemForBoxes] = useState(null);
    const [isImageSliderModalOpen, setIsImageSliderModalOpen] = useState(false);
    const [imagesForSlider, setImagesForSlider] = useState([]);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    // Smart QR Tag Modal States
    const [isSmartQrModalOpen, setIsSmartQrModalOpen] = useState(false);
    const [selectedBoxForSmartQr, setSelectedBoxForSmartQr] = useState(null);

    // ==========================================
    // SCANNER LOGIC 
    // ==========================================
    const fetchStickerDetails = async (id) => {
        setScannerLoading(true);
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); scannerRef.current = null; } catch (e) { console.log(e) }
        }

        try {
            const res = await axios.get(`https://threebapi-1067354145699.asia-south1.run.app/api/items/scan/${id}`);

            if (res.data?.success) {
                const { scannedBox, itemDetails } = res.data.data;

                const opEids = itemDetails.operators?.map(op => op.roleEid).filter(Boolean).join(', ') || "";
                const opNames = itemDetails.operators?.map(op => op.employeeId?.name).filter(Boolean).join(', ') || "";

                const helpEids = itemDetails.helpers?.map(h => h.roleEid).filter(Boolean).join(', ') || "";
                const helpNames = itemDetails.helpers?.map(h => h.employeeId?.name).filter(Boolean).join(', ') || "";

                setFormData({
                    itemNo: itemDetails.itemNo || "",
                    boxSerialNo: scannedBox?.boxSerialNo || "",
                    operatorId: opEids,
                    operatorName: opNames,
                    helperId: helpEids,
                    helperName: helpNames,
                    shift: itemDetails.shift || ""
                });

                toast.success("Item found successfully!");
                setScanned(true);
            } else {
                toast.error(res.data?.message || "Details not found via API.");
                setActiveTab("camera");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error(error.response?.data?.message || "Failed to fetch sticker details.");
            setScanned(false);
            setActiveTab("camera");
        } finally {
            setScannerLoading(false);
        }
    };

    useEffect(() => {
        if (!scanned && activeTab === "camera") {
            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            html5QrCode.start(
                { facingMode: "environment" }, config,
                (text) => { const id = text.split("/").pop(); fetchStickerDetails(id); },
                (errorMessage) => { /* Scanning... */ }
            ).catch((err) => { console.error("Camera start failed", err); });

            return () => {
                if (html5QrCode.isScanning) { html5QrCode.stop().catch(err => console.log("Stop failed", err)); }
            };
        }
    }, [scanned, activeTab]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScannerLoading(true);

        try {
            const tempDivId = "temp-qr-reader";
            let tempDiv = document.getElementById(tempDivId);

            if (!tempDiv) {
                tempDiv = document.createElement("div");
                tempDiv.id = tempDivId;
                tempDiv.style.display = "none";
                document.body.appendChild(tempDiv);
            }

            const html5QrCode = new Html5Qrcode(tempDivId);
            const decodedText = await html5QrCode.scanFile(file, true);

            if (decodedText) {
                const id = decodedText.split("/").pop();
                fetchStickerDetails(id);
            }

            html5QrCode.clear();
            document.body.removeChild(tempDiv);

        } catch (error) {
            console.error("Barcode scan error:", error);
            toast.error("No barcode found in this image. Please ensure the image is clear and cropped.");
            setScannerLoading(false);
            const tempDiv = document.getElementById("temp-qr-reader");
            if (tempDiv) document.body.removeChild(tempDiv);
        } finally {
            e.target.value = "";
        }
    };

    const handlePrintScannerForm = () => { window.print(); };
    const handleCloseScannerForm = () => {
        setScanned(false);
        setFormData({ itemNo: "", boxSerialNo: "", operatorId: "", operatorName: "", helperId: "", helperName: "", shift: "" });
        setScannerLoading(false);
        setActiveTab("camera");
    };
    const handleChangeScannerForm = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    // ==========================================
    // LIST LOGIC
    // ==========================================
    const normalizeItem = (item) => {
        if (!item) return null;
        const base = item.mainItem || item;
        return {
            ...item, ...base, _id: base._id || item._id,
            helpers: Array.isArray(base.helpers) ? base.helpers : (Array.isArray(item.helpers) ? item.helpers : []),
            operators: Array.isArray(base.operators) ? base.operators : (Array.isArray(item.operators) ? item.operators : []),
            mixtures: Array.isArray(item.mixtures) ? item.mixtures : (Array.isArray(base.mixtures) ? base.mixtures : []),
            boxes: Array.isArray(item.boxes) ? item.boxes : (Array.isArray(base.boxes) ? base.boxes : []),
            boxCount: base.boxCount || item.boxCount || (Array.isArray(item.boxes) ? item.boxes.length : 0),
            productImageUrl: Array.isArray(base.productImageUrl) ? base.productImageUrl : base.productImageUrl ? [base.productImageUrl] : (item.productImageUrl ? [item.productImageUrl] : []),
        };
    };

    const fetchAllData = useCallback(async () => {
        setListLoading(true);
        try {
            const [listRes, detailRes] = await Promise.all([
                fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-Allitems'),
                fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items'),
            ]);
            if (!listRes.ok || !detailRes.ok) throw new Error('Failed to fetch data.');

            const listJson = await listRes.json();
            const detailJson = await detailRes.json();

            const listRaw = Array.isArray(listJson) ? listJson : (listJson.data || []);
            const detailRaw = Array.isArray(detailJson) ? detailJson : (detailJson.data || []);

            const normalizedListData = listRaw.map(normalizeItem);
            const normalizedDetailData = detailRaw.map(normalizeItem);

            setItems(normalizedListData);

            const itemMap = new Map();
            normalizedDetailData.forEach((item) => { if (item._id) itemMap.set(item._id, item); });
            setFullItemsMap(itemMap);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            toast.error('Could not fetch list data.');
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter(item =>
            item.itemNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.helpers?.some(h => h.employeeId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.operators?.some(o => o.employeeId?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);

    const handleOpenBoxesModal = (itemFromList) => {
        const fullItemData = fullItemsMap.get(itemFromList._id);
        setSelectedItemForBoxes(fullItemData || itemFromList);
        setIsBoxesModalOpen(true);
    };
    const handleCloseBoxesModal = () => setIsBoxesModalOpen(false);

    const handleOpenSmartQrModal = (item, box) => {
        setSelectedBoxForSmartQr(box);
        setSelectedItemForBoxes(item);
        setIsSmartQrModalOpen(true);
    };
    const handleCloseSmartQrModal = () => {
        setIsSmartQrModalOpen(false);
        setSelectedBoxForSmartQr(null);
    };

    const handleOpenImageSlider = (images, index = 0) => { setImagesForSlider(images); setInitialImageIndex(index); setIsImageSliderModalOpen(true); };
    const handleCloseImageSlider = () => { setIsImageSliderModalOpen(false); setImagesForSlider([]); setInitialImageIndex(0); };

    const handleDeleteItem = async (itemId, itemNo) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5"><DeleteIcon className="h-6 w-6 text-red-600" /></div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Confirm Deletion</p>
                            <p className="mt-1 text-sm text-gray-500">Are you sure you want to delete item <span className="font-semibold text-red-600">{itemNo}</span>?</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            const deletePromise = fetch(`https://threebtest.onrender.com/api/items/delete-items/${itemId}`, { method: 'DELETE' })
                                .then(res => {
                                    if (!res.ok) { return res.json().then(err => { throw new Error(err.message || 'Failed to delete item'); }); }
                                    return res.json();
                                });
                            toast.promise(deletePromise, {
                                loading: `Deleting item ${itemNo}...`,
                                success: () => { fetchAllData(); return `Item ${itemNo} deleted successfully!`; },
                                error: (err) => `Error: ${err.message}`,
                            });
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500"
                    >Delete</button>
                    <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500">Cancel</button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <Toaster position="top-right" />
            <style>{scannerStyles}</style>

            {/* ======================= SCANNER COMPONENT ======================= */}
            <div className="app-container no-print mb-8">
                <div className="header">
                    <h2>🏷️ Scan & Print Sticker</h2>
                    <p>Scan BarCode or upload image to view details</p>
                </div>

                {!scanned && (
                    <div className="scan-card">
                        <div className="scan-tabs">
                            <button className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`} onClick={() => setActiveTab('camera')}>📸 Camera</button>
                            <button className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>🖼️ Gallery</button>
                        </div>

                        {scannerLoading ? (
                            <div className="flex justify-center my-10"><Spinner /></div>
                        ) : (
                            <>
                                {activeTab === "camera" && (<div className="scanner-box"><div id="qr-reader" style={{ width: "100%" }}></div></div>)}
                                {activeTab === "upload" && (
                                    <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
                                        <span style={{ fontSize: '3rem' }}>📂</span>
                                        <span className="upload-label">Tap to Upload Sticker Image</span>
                                        <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {scanned && (
                    <div className="scan-card">
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--primary-dark)', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>
                            📋 Sticker Details
                        </h3>

                        <div className="info-grid">
                            <div>
                                <span className="label-scan">Item No</span>
                                <input
                                    type="text"
                                    className="value-box font-bold text-gray-700 bg-gray-100"
                                    value={formData.itemNo}
                                    readOnly
                                />
                            </div>

                            <div>
                                <span className="label-scan">Serial No</span>
                                <input
                                    type="text"
                                    className="value-box font-bold text-gray-700 bg-gray-100"
                                    value={formData.boxSerialNo}
                                    readOnly
                                />
                            </div>

                            <div>
                                <span className="label-scan">Operator ID</span>
                                <input
                                    type="text"
                                    className="value-box bg-gray-100"
                                    value={formData.operatorId}
                                    readOnly
                                />
                            </div>

                            <div>
                                <span className="label-scan">Operator Name</span>
                                <input
                                    type="text"
                                    className="value-box bg-gray-100"
                                    value={formData.operatorName}
                                    readOnly
                                />
                            </div>

                            <div>
                                <span className="label-scan">Helper ID</span>
                                <input
                                    type="text"
                                    className="value-box bg-gray-100"
                                    value={formData.helperId}
                                    readOnly
                                />
                            </div>

                            <div>
                                <span className="label-scan">Helper Name</span>
                                <input
                                    type="text"
                                    className="value-box bg-gray-100"
                                    value={formData.helperName}
                                    readOnly
                                />
                            </div>

                            <div className="full-width">
                                <span className="label-scan">Shift</span>
                                <input
                                    type="text"
                                    className="value-box bg-gray-100"
                                    value={formData.shift}
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="button-group">
                            <button className="btn-reset" onClick={handleCloseScannerForm}>❌ Close</button>
                            <button className="btn-action" onClick={handlePrintScannerForm}>🖨️ Print</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ======================= LIST COMPONENT ======================= */}
            <div className="max-w-[95%] mx-auto no-print">
                <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">View All Items</h2>
                        <div className="flex items-center gap-4">
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 p-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    {listLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Spinner />
                            <p className="ml-4 text-xl text-gray-600">Loading All Items...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-8 text-red-500 bg-red-50">Error: {error}</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mixture</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helper</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Boxes</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredItems.map(item => (
                                        <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{item.itemNo?.trim()}</td>

                                            <td className="px-6 py-4">
                                                {item.productImageUrl && item.productImageUrl.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.productImageUrl.slice(0, 3).map((imgUrl, index) => (
                                                            <img key={index} src={imgUrl} alt="product" className="w-16 h-16 object-cover rounded cursor-pointer border hover:border-indigo-500 transition-all" onClick={() => handleOpenImageSlider(item.productImageUrl, index)} />
                                                        ))}
                                                        {item.productImageUrl.length > 3 && (
                                                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-gray-600 text-xs font-semibold cursor-pointer border hover:border-indigo-500 transition-all" onClick={() => handleOpenImageSlider(item.productImageUrl, 3)}>+{item.productImageUrl.length - 3} more</div>
                                                        )}
                                                    </div>
                                                ) : (<span className="text-gray-400">No Image</span>)}
                                            </td>

                                            <td className="px-6 py-4">{item.mixtures && item.mixtures.length > 0 ? item.mixtures.map(mix => mix.employeeId?.name || mix.name).join(", ") : "N/A"}</td>
                                            <td className="px-6 py-4">{item.operators && item.operators.length > 0 ? item.operators.map(op => op.employeeId?.name || op.name).join(', ') : 'N/A'}</td>
                                            <td className="px-6 py-4">{item.helpers && item.helpers.length > 0 ? item.helpers.map(h => h.employeeId?.name || h.name).join(', ') : 'N/A'}</td>
                                            <td className="px-6 py-4 text-center font-mono text-lg">{item.boxCount}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    <button onClick={() => handleOpenBoxesModal(item)} title="View Boxes" className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"><BoxIcon /></button>
                                                    <button onClick={() => handleDeleteItem(item._id, item.itemNo.trim())} title="Delete Item" className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"><DeleteIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No items found matching your search.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <BoxesModal isOpen={isBoxesModalOpen} onClose={handleCloseBoxesModal} item={selectedItemForBoxes} onOpenSmartQrModal={handleOpenSmartQrModal} />
            <SmartQrTagModal isOpen={isSmartQrModalOpen} onClose={handleCloseSmartQrModal} item={selectedItemForBoxes} box={selectedBoxForSmartQr} />
            <ImageSliderModal isOpen={isImageSliderModalOpen} onClose={handleCloseImageSlider} images={imagesForSlider} startIndex={initialImageIndex} />
        </div>
    );
};

export default ScanStickerPage; 