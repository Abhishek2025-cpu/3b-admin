import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// --- Style Objects (Inline CSS) ---
const styles = {
    // --- Main Container & Header ---
    container: {
        padding: '2rem',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        maxWidth: '1000px',
        margin: 'auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.75rem',
        color:'#6f42c1',
    },
    // --- Table Styles ---
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    th: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
    },
    td: {
        padding: '1rem',
        textAlign: 'left',
        borderBottom: '1px solid #ddd',
        verticalAlign: 'middle',
    },
    categoryImageThumbnail: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '5px',
    },
    actionIconsContainer: {
        display: 'flex',
        gap: '1rem'
    },
    actionButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#555',
        padding: '0.25rem',
    },
    // --- Modal Styles ---
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        position: 'relative',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    modalTitle: {
        marginTop: 0,
        marginBottom: '1.5rem',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '15px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#aaa',
    },
    // --- Form Styles ---
    formGroup: {
        marginBottom: '1rem',
    },
    formLabel: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 500,
    },
    formInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
    },
    formActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    // --- Buttons ---
    primaryButton: {
        backgroundColor: '#6f42c1',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.25rem',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    submitButton: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    submitButtonDisabled: {
        backgroundColor: '#a3d9b1',
        cursor: 'not-allowed',
    },
    // --- Image Preview ---
    imagePreviewContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginTop: '1rem',
        border: '1px solid #eee',
        padding: '1rem',
        borderRadius: '5px',
    },
    imagePreviewItem: {
        position: 'relative',
    },
    imagePreviewImg: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '5px',
    },
    removeImageBtn: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        fontSize: '1rem',
        lineHeight: '18px',
        textAlign: 'center',
        cursor: 'pointer',
        padding: 0,
    },
    // --- Utility ---
    errorMessage: {
        color: '#dc3545',
        margin: '1rem 0',
    },
};

// --- Helper Icon Components ---
const EditIcon = () => <svg style={{display: 'block'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm-2.206 2.206-8.5 8.5a.5.5 0 0 0 0 .708l.646.647a.5.5 0 0 0 .708 0l8.5-8.5a.5.5 0 0 0 0-.708l-.646-.647a.5.5 0 0 0-.708 0z"/></svg>;
const DeleteIcon = () => <svg style={{display: 'block'}} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;

// --- Modal Component (defined in the same file) ---
const AddCategoryModal = ({ onClose, onCategoryAdded }) => {
    const [name, setName] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const API_URL_ADD = "https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/add";

    useEffect(() => {
        const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newUrls);
        return () => newUrls.forEach(url => URL.revokeObjectURL(url));
    }, [selectedFiles]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || selectedFiles.length === 0) {
            setFormError('Name and at least one image are required.');
            return;
        }
        setFormError('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
        selectedFiles.forEach(file => formData.append('files', file)); // or whatever the backend expects


        try {
            await axios.post(API_URL_ADD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
           toast.success('Category added successfully!');

            onCategoryAdded();
            onClose();
        } catch (err) {
          toast.error(err.response?.data?.message || "Submission failed.");

        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Combine base and disabled styles for the submit button
    const submitButtonStyle = {
        ...styles.submitButton,
        ...(isSubmitting ? styles.submitButtonDisabled : {}),
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <button style={styles.closeButton} onClick={onClose}>×</button>
                <h2 style={styles.modalTitle}>Add New Category</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="category-name" style={styles.formLabel}>Category Name</label>
                        <input id="category-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={styles.formInput} required />
                    </div>
                    <div style={styles.formGroup}>
                        <label htmlFor="category-images" style={styles.formLabel}>Category Images</label>
                        <input id="category-images" type="file" multiple accept="image/*" onChange={handleFileChange} style={styles.formInput} />
                    </div>

                    {previewUrls.length > 0 && (
                        <div style={styles.imagePreviewContainer}>
                            {previewUrls.map((url, index) => (
                                <div key={index} style={styles.imagePreviewItem}>
                                    <img src={url} alt={`Preview ${index + 1}`} style={styles.imagePreviewImg} />
                                    <button type="button" style={styles.removeImageBtn} onClick={() => handleRemoveImage(index)}>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {formError && <p style={styles.errorMessage}>{formError}</p>}

                    <div style={styles.formActions}>
                        <button type="button" style={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Add Category'}
                        </button>
                    </div>
                </form>


            </div>
  

        </div>
    );
};



const EditCategoryModal = ({ onClose, category, onCategoryUpdated }) => {
    const [name, setName] = useState(category.name || '');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(category.images?.[0]?.url || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedFile) {
            const newUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(newUrl);
            return () => URL.revokeObjectURL(newUrl);
        }
    }, [selectedFile]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', name);
      if (selectedFile) {
  formData.append('files', selectedFile);
} else {
  // Send the existing image again (as a fallback)
  const imageUrl = category.images?.[0]?.url;
  const fileName = imageUrl?.split('/').pop()?.split('?')[0] || 'existing.jpg';

  // Fetch the existing image and convert to blob
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    formData.append('files', file);
  } catch (err) {
    toast.error("Could not reuse existing image.");
    setIsSubmitting(false);
    return;
  }
}


        try {
            await axios.put(
                `https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/update/${category._id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            toast.success('Category updated successfully!');
            onCategoryUpdated();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <button style={styles.closeButton} onClick={onClose}>×</button>
                <h2 style={styles.modalTitle}>Edit Category</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Category Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.formInput}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Replace Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={styles.formInput} />
                    </div>

                    {previewUrl && (
                        <div style={styles.imagePreviewContainer}>
                            <img src={previewUrl} alt="Preview" style={styles.imagePreviewImg} />
                        </div>
                    )}

                    <div style={styles.formActions}>
                        <button type="button" style={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="submit" style={{
                            ...styles.submitButton,
                            ...(isSubmitting ? styles.submitButtonDisabled : {})
                        }} disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Category'}
                        </button>
                    </div>
                </form>
            </div>
  
        </div>
    );
};



// --- Main Parent Component ---
const ManageOtherCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);


    const API_URL_GET = "https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/get";

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_URL_GET);
            setCategories(response.data || []);
        } catch (err) {
            setError("Failed to fetch categories.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

const handleEdit = (category) => {
    setEditingCategory(category);
    setEditModalOpen(true);
};


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
        await axios.delete(`https://threebapi-1067354145699.asia-south1.run.app/api/other-categories/delete/${id}`);
        toast.success("Category deleted successfully!");
        fetchCategories();
    } catch (error) {
        toast.error("Failed to delete category.");
    }
};


    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.headerTitle}>Manage Other Categories</h1>
                <button style={styles.primaryButton} onClick={() => setIsModalOpen(true)}>
                    + Add Other Category
                </button>
            </div>

            {isModalOpen && (
                <AddCategoryModal 
                    onClose={() => setIsModalOpen(false)} 
                    onCategoryAdded={fetchCategories}
                />
            )}

            <div style={styles.tableContainer}>
                {loading && <p>Loading...</p>}
                {error && <p style={styles.errorMessage}>{error}</p>}
                {!loading && !error && (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Image</th>
                                <th style={styles.th}>Category Name</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat._id}>
                                        <td style={styles.td}>
                                            <img src={cat.images[0]?.url} alt={cat.name} style={styles.categoryImageThumbnail} />
                                        </td>
                                        <td style={styles.td}>{cat.name}</td>
                                        <td style={styles.td}>
                                            <div style={styles.actionIconsContainer}>
<button onClick={() => handleEdit(cat)} title="Edit" style={styles.actionButton}><EditIcon /></button>

                                                <button onClick={() => handleDelete(cat._id)} title="Delete" style={styles.actionButton}><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" style={styles.td}>No categories found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
                                    {editModalOpen && editingCategory && (
  <EditCategoryModal
    category={editingCategory}
    onClose={() => setEditModalOpen(false)}
    onCategoryUpdated={fetchCategories}
  />
)}

            </div>
        </div>
        
    );
};

export default ManageOtherCategories;