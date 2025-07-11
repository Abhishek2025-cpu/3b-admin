// src/components/ViewProducts.jsx

import React, { useState, useEffect, useCallback } from 'react';
// 1. IMPORT from Font Awesome - this is the stable library you are already using
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// Reusable Modal Component (no changes needed here)
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-4 rounded-lg shadow-xl relative max-w-lg w-full">
        <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold">×</button>
        {children}
      </div>
    </div>
  );
};

// Main Component
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isQrOpen, setQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category')
      ]);
      const productData = await productRes.json();
      const categoryData = await categoryRes.json();
      if (!productData.success) throw new Error('Failed to fetch products');
      if (!Array.isArray(categoryData)) throw new Error('Failed to fetch categories');
      const categoryMap = categoryData.reduce((acc, cat) => ({ ...acc, [cat._id]: cat.name }), {});
      setProducts(productData.products || []);
      setCategories(categoryMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers (no changes needed in the logic) ---
  const showCarousel = (images) => {
    setCarouselImages(images.map(img => img.url));
    setCarouselOpen(true);
  };
  const showQrCode = (url) => {
    setQrCodeUrl(url);
    setQrOpen(true);
  };
  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditFormData({ ...product });
  };
  const handleCancelEdit = () => setEditingId(null);
  const handleEditFormChange = (e) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSave = async (productId) => {
    const { name, dimensions, pricePerPiece, totalPiecesPerBox, discountPercentage, quantity } = editFormData;
    const payload = { name, dimensions, pricePerPiece, totalPiecesPerBox, discountPercentage, quantity };
    try {
      const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to update');
      alert('Product updated successfully!');
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const response = await fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete/${productId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to delete');
      alert('Product deleted.');
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (isLoading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">All Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center text-gray-600">
          <thead className="text-xs text-purple-700 uppercase bg-purple-50">
            <tr>
              {['Image', 'Frame', 'Dimensions', 'Category', 'Price/Piece (₹)', 'Piece/Box', 'Price (₹)', 'Discount (%)', 'Quantity', 'QR Code', 'Action'].map(header => (
                <th key={header} className="px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              editingId === product._id ? (
                <tr key={product._id} className="bg-yellow-50 align-middle">
                  <td><img src={product.images[0]?.url} className="w-20 h-auto mx-auto rounded-md" alt={product.name} /></td>
                  <td><input type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} className="form-control" /></td>
                  <td><input type="text" name="dimensions" value={editFormData.dimensions} onChange={handleEditFormChange} className="form-control" /></td>
                  <td>{categories[product.categoryId] || 'N/A'}</td>
                  <td><input type="number" name="pricePerPiece" value={editFormData.pricePerPiece} onChange={handleEditFormChange} className="form-control" /></td>
                  <td><input type="number" name="totalPiecesPerBox" value={editFormData.totalPiecesPerBox} onChange={handleEditFormChange} className="form-control" /></td>
                  <td className="text-gray-400">Auto</td>
                  <td><input type="number" name="discountPercentage" value={editFormData.discountPercentage} onChange={handleEditFormChange} className="form-control" /></td>
                  <td><input type="number" name="quantity" value={editFormData.quantity} onChange={handleEditFormChange} className="form-control" /></td>
                  <td><button className="btn btn-sm btn-outline-secondary" disabled>QR</button></td>
                  <td className="whitespace-nowrap">
                    <button onClick={() => handleSave(product._id)} className="text-green-500 hover:text-green-700 p-2"><FontAwesomeIcon icon={faSave} /></button>
                    <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faTimes} /></button>
                  </td>
                </tr>
              ) : (
                <tr key={product._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                  <td><img src={product.images[0]?.url} onClick={() => showCarousel(product.images)} className="w-20 h-auto mx-auto rounded-md cursor-pointer" alt={product.name} /></td>
                  <td>{product.name}</td>
                  <td>{product.dimensions || '—'}</td>
                  <td>{categories[product.categoryId] || 'N/A'}</td>
                  <td>₹{product.pricePerPiece}</td>
                  <td>{product.totalPiecesPerBox}</td>
                  <td>₹{product.finalPricePerBox || product.mrpPerBox}</td>
                  <td>{product.discountPercentage || 0}%</td>
                  <td>{product.quantity}</td>
                  <td><button onClick={() => showQrCode(product.qrCodeUrl)} className="btn btn-sm btn-outline-primary"><FontAwesomeIcon icon={faQrcode} /></button></td>
                  <td className="whitespace-nowrap">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700 p-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
                    <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 p-2"><FontAwesomeIcon icon={faTrash} /></button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isCarouselOpen} onClose={() => setCarouselOpen(false)}>
        <div className="p-4"><h3 className="text-xl mb-4 text-center">Product Images</h3>
          {carouselImages.length > 0 && <img src={carouselImages[0]} alt="Product" className="max-w-full max-h-[70vh] mx-auto" />}
        </div>
      </Modal>

      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        <div className="p-4 text-center"><h3 className="text-xl mb-4">Product QR Code</h3>
          <img src={qrCodeUrl} alt="QR Code" className="mx-auto border p-2" />
          <a href={qrCodeUrl} download="product_qr.png" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">Download QR</a>
        </div>
      </Modal>
    </div>
  );
}

// Simple form-control style for Tailwind
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .form-control {
    display: block; width: 100%; padding: .375rem .75rem; font-size: 1rem;
    font-weight: 400; line-height: 1.5; color: #212529; background-color: #fff;
    border: 1px solid #ced4da; border-radius: .375rem;
    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  }
  .form-control:focus {
    color: #212529; background-color: #fff; border-color: #86b7fe;
    outline: 0; box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25);
  }
`;
document.head.appendChild(styleSheet);

export default ViewProducts;