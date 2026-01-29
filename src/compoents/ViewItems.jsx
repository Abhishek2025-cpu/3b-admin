import logo from '../assets/3b.png';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';


// --- SVG Icons (Unchanged, adding new ProgressIcon) ---
const ViewIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg> );
const BoxIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v2h14V4a1 1 0 00-1-1H4zM3 9v9a1 1 0 001 1h12a1 1 0 001-1V9H3z" /></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg> );
const PrintIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg> );
const TrackIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>);
const Spinner = () => ( <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const StaticBarcodeIcon = () => ( <svg className="h-12 w-full max-w-xs" viewBox="0 0 200 50" preserveAspectRatio="none"><rect x="0" y="0" width="200" height="50" fill="white"/><g fill="black"><rect x="10" y="5" width="2" height="40" /><rect x="14" y="5" width="2" height="40" /><rect x="18" y="5" width="4" height="40" /><rect x="24" y="5" width="2" height="40" /><rect x="28" y="5" width="4" height="40" /><rect x="34" y="5" width="2" height="40" /><rect x="38" y="5" width="2" height="40" /><rect x="42" y="5" width="6" height="40" /><rect x="50" y="5" width="2" height="40" /><rect x="54" y="5" width="4" height="40" /><rect x="60" y="5" width="2" height="40" /><rect x="64" y="5" width="2" height="40" /><rect x="68" y="5" width="4" height="40" /><rect x="74" y="5" width="4" height="40" /><rect x="80" y="5" width="2" height="40" /><rect x="84" y="5" width="6" height="40" /><rect x="92" y="5" width="2" height="40" /><rect x="96" y="5" width="2" height="40" /><rect x="100" y="5" width="4" height="40" /><rect x="106" y="5" width="2" height="40" /><rect x="110" y="5" width="6" height="40" /><rect x="118" y="5" width="2" height="40" /><rect x="122" y="5" width="4" height="40" /><rect x="128" y="5" width="2" height="40" /><rect x="132" y="5" width="4" height="40" /><rect x="138" y="5" width="2" height="40" /><rect x="142" y="5" width="6" height="40" /><rect x="150" y="5" width="2" height="40" /><rect x="154" y="5" width="2" height="40" /><rect x="158" y="5" width="4" height="40" /><rect x="164" y="5" width="4" height="40" /><rect x="170" y="5" width="2" height="40" /><rect x="174" y="5" width="6" height="40" /><rect x="182" y="5" width="2" height="40" /><rect x="186" y="5" width="4" height="40" /></g></svg> );
const ProgressIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125L21 13.125M3 13.125v4.875L21 18V13.125M3 13.125L7.5 4.125M21 13.125L16.5 4.125M7.5 4.125C7.5 3.076 8.336 2.25 9.38 2.25h5.24C15.664 2.25 16.5 3.076 16.5 4.125V13.125L7.5 13.125M7.5 4.125h9V13.125h-9V4.125Z" />
    </svg>
);


// --- Reusable Components (Unchanged) ---
const GenericModal = ({ isOpen, onClose, children, maxWidth = "max-w-lg", zIndex = "z-50" }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 ${zIndex} flex justify-center items-center p-4 overflow-hidden`}>
         
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className={`${maxWidth} bg-white rounded-2xl shadow-2xl w-full max-h-[95vh] flex flex-col relative z-10 overflow-hidden`}>
                {children}
            </div>
        </div>
    );
};
const UpdateBoxesModal = ({ isOpen, onClose, item, onUpdateSubmit }) => {
    const [numberOfNewBoxes, setNumberOfNewBoxes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => { e.preventDefault(); const boxCount = parseInt(numberOfNewBoxes, 10); if (!boxCount || boxCount <= 0) { toast.error("Please enter a valid, positive number of boxes."); return; } setIsSubmitting(true); await onUpdateSubmit(item._id, boxCount); setIsSubmitting(false); setNumberOfNewBoxes(''); };
    if (!isOpen) return null;
    return <GenericModal isOpen={isOpen} onClose={onClose}><div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Add More Boxes</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button></div><form onSubmit={handleSubmit}><div className="p-6 space-y-4"><div><label className="font-semibold text-gray-700 block mb-1">Item No</label><input type="text" readOnly value={item?.itemNo?.trim() || ''} className="w-full p-2 bg-gray-100 border rounded-lg cursor-not-allowed" /></div><div><label htmlFor="new-boxes-input" className="font-semibold text-gray-700 block mb-1">Number of New Boxes to Add</label><input id="new-boxes-input" type="number" min="1" value={numberOfNewBoxes} onChange={(e) => setNumberOfNewBoxes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., 5" required /></div></div><div className="p-4 border-t flex justify-end gap-3"><button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Cancel</button><button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-indigo-300 disabled:cursor-not-allowed">{isSubmitting ? 'Adding...' : 'Add Boxes'}</button></div></form></GenericModal>;
};
const PrintablePageLayout = ({ item, box }) => {
    // 1. Extract Profile Codes (EIDs from operators and helpers)
    const profileCodes = [
        ...(item.operators || []).map(op => op.eid),
        ...(item.helpers || []).map(h => h.eid)
    ].filter(Boolean).join(', ');

    // 2. Qty per Box
    const qtyPerBox = item.noOfSticks || "N/A";

    // 3. Product Image (handle array or string)
    const productImg = Array.isArray(item.productImageUrl) 
        ? item.productImageUrl[0] 
        : item.productImageUrl;

    return (
        <div className="border-[6px] border-purple-800 p-4 bg-white w-[800px] h-[450px] relative font-sans text-black">
            <div className="flex h-full">
                
                {/* LEFT SECTION (70%) */}
                <div className="w-[65%] flex flex-col justify-between pr-4">
                    {/* Logo & Brand */}
                    <div>
                        <img src={logo} alt="3B Logo" className="w-48 mb-2" />
                        <p className="text-blue-800 font-bold text-sm ml-2">www.3bprofilespvtlt.com</p>
                    </div>

                    {/* Data Fields */}
                    <div className="space-y-4 mb-8">
                        {/* Profile Code */}
                        <div className="flex items-end">
                            <span className="font-bold text-xl min-w-[150px]">Profile Code</span>
                            <div className="flex-1 border-b-2 border-blue-900 text-center text-xl font-bold pb-1">
                                {profileCodes || "N/A"}
                            </div>
                        </div>

                        {/* Height */}
                        <div className="flex items-end">
                            <span className="font-bold text-xl min-w-[150px]">Height (m)</span>
                            <div className="flex-1 border-b-2 border-blue-900 text-center text-xl font-bold pb-1">
                                {item.length}
                            </div>
                        </div>

                        {/* Qty per Box */}
                        <div className="flex items-end">
                            <span className="font-bold text-xl min-w-[150px]">Qty per Box</span>
                            <div className="flex-1 border-b-2 border-blue-900 text-center text-xl font-bold pb-1">
                                {qtyPerBox}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION (35%) */}
                <div className="w-[35%] flex flex-col items-center border-l-2 border-gray-300 pl-4">
                    {/* QR Code */}
                    <div className="mt-2">
                        <img 
                            src={box.qrCodeUrl} 
                            alt="Box QR" 
                            className="w-32 h-32" 
                            style={{ imageRendering: 'pixelated' }} 
                        />
                    </div>

                    {/* Serial Number Text */}
                    <p className="font-bold text-lg mt-1 mb-2">
                        {item.itemNo?.trim()}/{box.boxSerialNo}
                    </p>

                    {/* Product Thumbnail in Dashed Box */}
                    <div className="border-2 border-dashed border-gray-400 p-1 w-32 h-20 flex items-center justify-center bg-gray-50">
                        {productImg ? (
                            <img src={productImg} alt="Product" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                        )}
                    </div>

                    {/* Barcode at bottom */}
                    <div className="mt-auto w-full">
                        <StaticBarcodeIcon />
                    </div>
                </div>

            </div>
        </div>
    );
};

const PrintModal = ({ isOpen, onClose, item, box }) => {
  const handlePrint = () => window.print();
  if (!isOpen || !item || !box) return null;
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
          }
        }
        .no-print { display: none !important; }
      `}</style>

      {/* यहाँ zIndex को z-[10010] किया गया है */}
      <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" zIndex="z-[10010]">
        <div className="p-4 border-b flex justify-between items-center no-print bg-white rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Print Preview</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-red-600 text-4xl font-light p-2"
          >
            &times;
          </button>
        </div>

        <div id="printable-area" className="p-8 flex justify-center bg-gray-100 overflow-auto">
          <PrintablePageLayout item={item} box={box} />
        </div>

        <div className="no-print p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t">
          <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg">
            Print
          </button>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">
            Close
          </button>
        </div>
      </GenericModal>
    </>
  );
};
const PrintAllBoxesModal = ({ isOpen, onClose, item }) => {
    const handlePrint = () => window.print();
    if (!isOpen || !item) return null;
    return ( <> 
    <style>{`
      @media print {
        body * { visibility: hidden; }
        .printable-page, .printable-page * { visibility: visible; }
        .printable-page { page-break-after: always; position: static; width: 100%; margin: 0; padding: 0; }
        .printable-page:last-child { page-break-after: auto; }
      }
      .no-print { display: none !important; }
    `}</style>

    <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" zIndex="z-[60]">
        {/* --- Header with Cross Button --- */}
        <div className="p-4 border-b flex justify-between items-center no-print bg-white rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Print All Boxes ({item.boxes?.length})</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-red-600 text-3xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* --- Scrollable Content --- */}
        <div id="printable-all-boxes-area" className="p-4 overflow-y-auto max-h-[70vh]">
            {item.boxes?.map(box => ( 
                <div key={box._id} className="printable-page mb-8 border-b pb-8 last:border-0 last:mb-0">
                    <PrintablePageLayout item={item} box={box} />
                </div> 
            ))}
        </div>

        {/* --- Footer Buttons --- */}
        <div className="no-print p-4 bg-gray-50 rounded-b-lg flex justify-end gap-3 border-t">
            <button onClick={handlePrint} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
                <PrintIcon /> Print All
            </button>
            <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">
                Close
            </button>
        </div>
    </GenericModal> 
    </> );
};

// --- ImageSliderModal (NEW COMPONENT) ---
const ImageSliderModal = ({ isOpen, onClose, images, startIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);

    useEffect(() => {
        setCurrentIndex(startIndex);
    }, [startIndex, images]);

    if (!isOpen || !images || images.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl" zIndex="z-[70]">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Product Images</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            <div className="relative flex-grow flex items-center justify-center p-4">
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none"
                        >
                            &#10094; {/* Left arrow */}
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-75 focus:outline-none"
                        >
                            &#10095; {/* Right arrow */}
                        </button>
                    </>
                )}
                <img
                    src={images[currentIndex]}
                    alt={`Product image ${currentIndex + 1}`}
                    className="max-w-full max-h-[calc(80vh-120px)] object-contain rounded-lg shadow-md"
                />
            </div>
            {images.length > 1 && (
                <div className="p-2 border-t text-center text-gray-600">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
            <div className="p-4 border-t flex justify-end">
                <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">
                    Close
                </button>
            </div>
        </GenericModal>
    );
};

// --- BoxesModal (UPDATED for responsiveness) & ItemDetails (Unchanged) ---
const BoxesModal = ({ isOpen, onClose, item, onOpenPrintModal, onOpenUpdateModal, onOpenPrintAllModal  }) => {
        console.log('BoxesModal isOpen:', isOpen);
    console.log('BoxesModal item:', item);
    console.log('Boxes array:', item?.boxes);
    if (!isOpen) return null;
    return (
        <GenericModal isOpen={isOpen} onClose={onClose}>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Boxes for Item: <span className="text-indigo-600">{item?.itemNo?.trim()}</span></h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            
            {/* Body */}
            <div className="p-4 overflow-y-auto">
                {item?.boxes?.length > 0 ? (
                    <ul className="space-y-3">
                        {item.boxes.map((box) => (
                            <li key={box._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border gap-2">
                                {/* Left side: QR and Serial */}
                                <div className="flex items-center gap-3">
                                    <img src={box.qrCodeUrl} alt="QR Code" className="w-12 h-12 sm:w-16 sm:h-16 rounded-md flex-shrink-0" />
                                    <div>
                                        <p className="text-sm sm:text-base font-semibold text-gray-700">Serial:</p>
                                        <p className="text-base sm:text-lg font-mono text-black">{box.boxSerialNo}</p>
                                    </div>
                                </div>
                                {/* Right side: Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button 
                                      onClick={() => alert(`Tracking box: ${box.boxSerialNo}`)} 
                                      className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-2 sm:px-4 rounded-lg transition-colors"
                                      title="Track"
                                    >
                                        <TrackIcon />
                                        <span className="hidden sm:inline">Track</span>
                                    </button>
                                    <button 
                                      onClick={() => onOpenPrintModal(box)} 
                                      className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-2 sm:px-4 rounded-lg transition-colors"
                                      title="View/Print"
                                    >
                                        <PrintIcon />
                                        <span className="hidden sm:inline">View/Print</span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">No box details found.</p>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t flex flex-col sm:flex-row sm:justify-between items-center gap-3">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button onClick={onOpenUpdateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg w-full sm:w-auto">
                        Update
                    </button>
                    <button onClick={onOpenPrintAllModal} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto">
                        <PrintIcon /> Print All
                    </button>
                </div>
                <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg w-full sm:w-auto">
                    Close
                </button>
            </div>
        </GenericModal>
    );
};

const ItemDetails = ({ item, onOpenProgressModal }) => { // Added onOpenProgressModal prop
    if (!item) return null;
    return ( 
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50">
            <div><p className="font-semibold text-gray-700">Length:</p><p>{item.length}</p></div>
            <div><p className="font-semibold text-gray-700">Shift:</p><p>{item.shift}</p></div>
            <div><p className="font-semibold text-gray-700">Company:</p><p>{item.company}</p></div>
            <div><p className="font-semibold text-gray-700">Created At:</p><p>{new Date(item.createdAt).toLocaleString()}</p></div>
            <div><p className="font-semibold text-gray-700">Operator EID:</p><p>{item.operator?.eid || 'N/A'}</p></div>
            <div><p className="font-semibold text-gray-700">Helper EID:</p><p>{item.helper?.eid || 'N/A'}</p></div>
            <div className="col-span-full mt-4">
                <button 
                    onClick={() => onOpenProgressModal(item.machine?._id)} // Use machine._id from the item
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <ProgressIcon /> View Progress
                </button>
            </div>
        </div> 
    );
};

// --- ProgressModal Component (NEW) ---
const ProgressModal = ({ isOpen, onClose, machineId }) => {
    const [progressData, setProgressData] = useState(null);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [progressError, setProgressError] = useState(null);
    const [isImageSliderOpen, setIsImageSliderOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const fetchMachineProgress = useCallback(async (id) => {
        if (!id) {
            setProgressData(null);
            return;
        }
        setIsLoadingProgress(true);
        setProgressError(null);
        try {
            const response = await fetch('https://threebapi-1067354145699.asia-south1.run.app/api/machines/all');
            if (!response.ok) {
                throw new Error('Failed to fetch machine progress data.');
            }
            const data = await response.json();
            const machineAssignment = data.data.find(assignment => assignment.machine._id === id);
            
            if (machineAssignment) {
                setProgressData(machineAssignment);
            } else {
                setProgressData(null);
                setProgressError('No progress data found for this machine.');
            }
        } catch (err) {
            setProgressError(err.message);
            toast.error("Error fetching machine progress.");
        } finally {
            setIsLoadingProgress(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchMachineProgress(machineId);
        } else {
            setProgressData(null); // Clear data when modal closes
            setProgressError(null);
        }
    }, [isOpen, machineId, fetchMachineProgress]);

    const handleOpenImageSlider = (images) => {
        setCurrentImages(images);
        setCurrentImageIndex(0); // Always start from the first image
        setIsImageSliderOpen(true);
    };

    const handleCloseImageSlider = () => {
        setIsImageSliderOpen(false);
        setCurrentImages([]);
        setCurrentImageIndex(0);
    };


    if (!isOpen) return null;

    return (
        <GenericModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" zIndex="z-[60]">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Machine Progress Details</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto">
                {isLoadingProgress ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner />
                        <p className="ml-4 text-lg text-gray-600">Loading progress data...</p>
                    </div>
                ) : progressError ? (
                    <div className="text-center text-red-500 py-8">Error: {progressError}</div>
                ) : progressData ? (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Machine: <span className="text-indigo-600">{progressData.machine?.name}</span> (Type: {progressData.machine?.type})
                        </h3>
                        
                        {progressData.employees && progressData.employees.length > 0 && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Assigned Employees:</h4>
                                <ul className="list-disc list-inside ml-4">
                                    {progressData.employees.map(emp => (
<li key={emp._id} className="text-gray-600">
    {emp.name} ({emp.role} - EID: {emp.eid})
</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {progressData.mainItem && (
                            <div>
                                <h4 className="font-medium text-gray-700 mb-2">Main Item Details:</h4>
                                <ul className="list-disc list-inside ml-4">
                                    <li className="text-gray-600">Operator: {progressData.mainItem.operator?.name} (EID: {progressData.mainItem.operator?.eid})</li>
                                    <li className="text-gray-600">Helper: {progressData.mainItem.helper?.name} (EID: {progressData.mainItem.helper?.eid})</li>
                                </ul>
                            </div>
                        )}

                        <h4 className="font-medium text-gray-700 mb-2">Operator Table Data:</h4>
                        {progressData.operatorTable && progressData.operatorTable.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frame Lengths</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of Boxes</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Weight</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frame Weight</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {progressData.operatorTable.map((row, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.shift}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.time}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                                    {row.frameLength && row.frameLength.length > 0 ? row.frameLength.join(', ') : 'N/A'}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.numberOfBox}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.boxWeight}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.frameWeight}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{row.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">No operator table data available.</p>
                        )}

                        <h4 className="font-medium text-gray-700 mb-2">Operator Images:</h4>
                        {progressData.operatorImages && progressData.operatorImages.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {progressData.operatorImages.map((imgUrl, index) => (
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt={`Operator ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleOpenImageSlider(progressData.operatorImages)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No operator images available.</p>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">Select an item to view its progress.</p>
                )}
            </div>
            
            <div className="p-4 border-t flex justify-end">
                <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg">
                    Close
                </button>
            </div>

            {/* Image Slider for operator images */}
            <ImageSliderModal
                isOpen={isImageSliderOpen}
                onClose={handleCloseImageSlider}
                images={currentImages}
                startIndex={currentImageIndex}
            />
        </GenericModal>
    );
};
  

function ViewItems() {
    const [items, setItems] = useState([]);
    const [fullItemsMap, setFullItemsMap] = useState(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [isBoxesModalOpen, setIsBoxesModalOpen] = useState(false);
    const [selectedItemForBoxes, setSelectedItemForBoxes] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedBoxForPrint, setSelectedBoxForPrint] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isPrintAllModalOpen, setIsPrintAllModalOpen] = useState(false);
    const [isImageSliderModalOpen, setIsImageSliderModalOpen] = useState(false);
    const [imagesForSlider, setImagesForSlider] = useState([]);
    const [initialImageIndex, setInitialImageIndex] = useState(0);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [selectedMachineIdForProgress, setSelectedMachineIdForProgress] = useState(null);

    // ✅ Smart normalization that supports both old and new API structures
const normalizeItem = (item) => {
    if (!item) return null;

    // Merge logic: prefer root fields, but allow mainItem to override if it exists
    const base = item.mainItem || item;

    return {
        ...item,           // Start with everything (preserves top-level 'boxes')
        ...base,           // Overlay with item details (itemNo, etc.)
        _id: base._id || item._id, // Ensure we have a valid ID
        
        // Explicitly ensure these are arrays so .map() doesn't crash
        helpers: Array.isArray(base.helpers) ? base.helpers : (Array.isArray(item.helpers) ? item.helpers : []),
        operators: Array.isArray(base.operators) ? base.operators : (Array.isArray(item.operators) ? item.operators : []),
        mixtures: Array.isArray(item.mixtures) ? item.mixtures : (Array.isArray(base.mixtures) ? base.mixtures : []),
        boxes: Array.isArray(item.boxes) ? item.boxes : (Array.isArray(base.boxes) ? base.boxes : []),
        
        boxCount: base.boxCount || item.boxCount || (Array.isArray(item.boxes) ? item.boxes.length : 0),
        
        productImageUrl: Array.isArray(base.productImageUrl)
            ? base.productImageUrl
            : base.productImageUrl ? [base.productImageUrl] : (item.productImageUrl ? [item.productImageUrl] : []),
    };
};



const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [listRes, detailRes] = await Promise.all([
            fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-Allitems'),
            fetch('https://threebapi-1067354145699.asia-south1.run.app/api/items/get-items'),
        ]);

        if (!listRes.ok || !detailRes.ok) throw new Error('Failed to fetch data.');

        const listJson = await listRes.json();
        const detailJson = await detailRes.json();

        // Support both formats: direct array [...] or wrapped object { data: [...] }
        const listRaw = Array.isArray(listJson) ? listJson : (listJson.data || []);
        const detailRaw = Array.isArray(detailJson) ? detailJson : (detailJson.data || []);

        const normalizedListData = listRaw.map(normalizeItem);
        const normalizedDetailData = detailRaw.map(normalizeItem);

        setItems(normalizedListData);

        // Build the map for the Boxes Modal lookup
        const itemMap = new Map();
        normalizedDetailData.forEach((item) => {
            if (item._id) itemMap.set(item._id, item);
        });
        setFullItemsMap(itemMap);

    } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        toast.error('Could not fetch data.');
    } finally {
        setIsLoading(false);
    }
}, []);


    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const filteredItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        return items.filter(item =>
            item.itemNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.helper?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const currentItems = filteredItems;

    const handleToggleRow = (itemId) => setExpandedRowId(expandedRowId === itemId ? null : itemId);

const handleOpenBoxesModal = (itemFromList) => {
  const fullItemData = fullItemsMap.get(itemFromList._id);

  if (fullItemData) {
    setSelectedItemForBoxes(fullItemData);
  } else {
    console.warn('⚠️ Fallback: using list item since fullItemData not found.');
    setSelectedItemForBoxes(itemFromList); // fallback so modal opens
  }

  setIsBoxesModalOpen(true);
};




    const handleCloseBoxesModal = () => setIsBoxesModalOpen(false);
    const handleOpenPrintModal = (box) => { setSelectedBoxForPrint(box); setIsPrintModalOpen(true); };
    const handleClosePrintModal = () => { setIsPrintModalOpen(false); setSelectedBoxForPrint(null); };
    const handleOpenUpdateModal = () => { setIsBoxesModalOpen(false); setIsUpdateModalOpen(true); };
    const handleCloseUpdateModal = () => setIsUpdateModalOpen(false);
    const handleOpenPrintAllModal = () => { setIsBoxesModalOpen(false); setIsPrintAllModalOpen(true); };
    const handleClosePrintAllModal = () => setIsPrintAllModalOpen(false);

    const handleOpenImageSlider = (images, index = 0) => {
        setImagesForSlider(images);
        setInitialImageIndex(index);
        setIsImageSliderModalOpen(true);
    };
    const handleCloseImageSlider = () => { setIsImageSliderModalOpen(false); setImagesForSlider([]); setInitialImageIndex(0); };

const handleOpenProgressModal = async (itemId) => {
  console.log("🟢 Opening progress for item:", itemId);
  setIsProgressModalOpen(true);
  setIsLoading(true);

  try {
    const res = await fetch(
      "https://threebapi-1067354145699.asia-south1.run.app/api/machines/all"
    );
    if (!res.ok) throw new Error("Failed to fetch machine progress");
    const { data } = await res.json();

    // ✅ Match machines linked to this item (by mainItem._id)
    const filtered = Array.isArray(data)
      ? data.filter(machine => machine.mainItem?._id === itemId)
      : [];

    console.log("🧠 Filtered machines:", filtered);

    if (!filtered.length) {
      toast.error("No progress data found for this item.");
    }

    // Store the filtered list (not itemId) directly
    setSelectedMachineIdForProgress(filtered);
  } catch (err) {
    console.error("Progress fetch error:", err);
    toast.error("Failed to fetch progress data.");
  } finally {
    setIsLoading(false);
  }
};





    const handleCloseProgressModal = () => {
        setIsProgressModalOpen(false);
        setSelectedMachineIdForProgress(null);
    };

    const handleUpdateSubmit = async (itemId, numberOfNewBoxes) => {
        setIsLoading(true);
        const promise = fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/items/${itemId}/add-boxes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numberOfNewBoxes }),
        }).then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message || 'API request failed') });
            }
            return res.json();
        });
        await toast.promise(promise, {
            loading: 'Adding new boxes...',
            success: () => { fetchAllData(); handleCloseUpdateModal(); return 'Boxes updated successfully!'; },
            error: (err) => `Error: ${err.message}`,
        }).finally(() => setIsLoading(false));
    };

    const handleDeleteItem = async (itemId, itemNo) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5"><DeleteIcon className="h-6 w-6 text-red-600" /></div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">Confirm Deletion</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Are you sure you want to delete item <span className="font-semibold text-red-600">{itemNo}</span>?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            const deletePromise = fetch(`https://threebtest.onrender.com/api/items/delete-items/${itemId}`, { method: 'DELETE' })
                                .then(res => {
                                    if (!res.ok) {
                                        return res.json().then(err => { throw new Error(err.message || 'Failed to delete item'); });
                                    }
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

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Spinner />
                <p className="ml-4 text-xl text-gray-600">Loading All Items...</p>
            </div>
        );

    if (error)
        return <div className="text-center p-8 text-red-500 bg-red-50">Error: {error}</div>;
  
    return (
      <>
        <Toaster position="top-right" />
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">View All Items</h2>
            <div className="flex items-center gap-4">
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-64 p-2 border rounded-xl focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
          </div>
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
                {currentItems.map(item => (
                  <React.Fragment key={item._id}>
                    <tr className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.itemNo.trim()}</td>
                      <td className="px-6 py-4">
                        {/* Display product images and handle click to open slider */}
                        {item.productImageUrl && item.productImageUrl.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {item.productImageUrl.slice(0, 3).map((imgUrl, index) => ( // Show up to 3 thumbnails
                                    <img
                                        key={index}
                                        src={imgUrl}
                                        alt={`${item.itemNo} product ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded cursor-pointer border border-gray-200 hover:border-indigo-500 transition-all"
                                        onClick={() => handleOpenImageSlider(item.productImageUrl, index)}
                                    />
                                ))}
                                {item.productImageUrl.length > 3 && (
                                    <div 
                                        className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-gray-600 text-xs font-semibold cursor-pointer border border-gray-200 hover:border-indigo-500 transition-all"
                                        onClick={() => handleOpenImageSlider(item.productImageUrl, 3)}
                                    >
                                        +{item.productImageUrl.length - 3} more
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
  {item.mixtures && item.mixtures.length > 0
    ? item.mixtures.map(mix => mix.name).join(", ")
    : "N/A"}
</td>

                   <td className="px-6 py-4">
  {item.operators.length > 0
    ? item.operators.map(op => op.name).join(', ')
    : 'N/A'}
</td>
<td className="px-6 py-4">
  {item.helpers.length > 0
    ? item.helpers.map(h => h.name).join(', ')
    : 'N/A'}
</td>

                      <td className="px-6 py-4 text-center font-mono text-lg">{item.boxCount}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button onClick={() => handleToggleRow(item._id)} title="View Details" className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"><ViewIcon /></button>
                          <button onClick={() => handleOpenBoxesModal(item)} title="View Boxes" className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"><BoxIcon /></button>
                          {/* Updated Delete Button */}
                          <button onClick={() => handleDeleteItem(item._id, item.itemNo.trim())} title="Delete Item" className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"><DeleteIcon /></button>
                        </div>
                      </td>
                    </tr>
                    {expandedRowId === item._id && ( 
                        <tr className="border-b">
                            <td colSpan="6" className="p-0">
                                <ItemDetails 
                                    item={fullItemsMap.get(item._id)} 
                                    onOpenProgressModal={handleOpenProgressModal} // Pass the new handler
                                />
                            </td>
                        </tr> 
                    )}
                  </React.Fragment>
                ))}
                {currentItems.length === 0 && !isLoading && (
                    <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No items found matching your search.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
       <BoxesModal 
    isOpen={isBoxesModalOpen} 
    onClose={handleCloseBoxesModal} 
    item={selectedItemForBoxes} 
    onOpenPrintModal={handleOpenPrintModal} 
    onOpenUpdateModal={handleOpenUpdateModal} 
    onOpenPrintAllModal={handleOpenPrintAllModal}  
    zIndex="z-[10000]" 
/>
        

        <PrintModal isOpen={isPrintModalOpen} onClose={handleClosePrintModal} item={selectedItemForBoxes} box={selectedBoxForPrint} />
        <UpdateBoxesModal isOpen={isUpdateModalOpen} onClose={handleCloseUpdateModal} item={selectedItemForBoxes} onUpdateSubmit={handleUpdateSubmit} />
        <PrintAllBoxesModal isOpen={isPrintAllModalOpen} onClose={handleClosePrintAllModal} item={selectedItemForBoxes} />
        
        {/* Product Image Slider Modal */}
        <ImageSliderModal 
            isOpen={isImageSliderModalOpen}
            onClose={handleCloseImageSlider}
            images={imagesForSlider}
            startIndex={initialImageIndex}
        />

        {/* New Progress Modal */}
<ProgressModal
  isOpen={isProgressModalOpen}
  onClose={handleCloseProgressModal}
  machineId={selectedMachineIdForProgress?.[0]?.machine?._id || null}
/>

        </>
    );
}
  
export default ViewItems;