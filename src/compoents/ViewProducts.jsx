import React, { useState, useEffect, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faPenToSquare, faTrash, faPlus, faTimes, faChevronLeft, faChevronRight, faAngleDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';

// --- Reusable Components ---
const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-lg" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex justify-center items-start pt-28 z-50 p-4 overflow-y-auto pointer-events-none">
      <div className={`bg-white rounded-2xl shadow-2xl relative ${maxWidth} w-full border flex flex-col max-h-[calc(100vh-8rem)] pointer-events-auto`}>
        {children}
      </div>
    </div>
  );
};

const ImageThumb = ({ file, onRemove, isUrl = false }) => (
  <div className="relative w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
    <img src={isUrl ? file : URL.createObjectURL(file)} alt="product thumbnail" className="w-full h-full object-cover" />
    <button type="button" onClick={onRemove} className="absolute top-1 right-1 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold text-red-600 cursor-pointer hover:bg-red-100">×</button>
  </div>
);

// --- Image Slider Modal Component (NEW) ---
const ImageSliderModal = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <button onClick={onClose} className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div className="relative bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex-grow flex items-center justify-center relative p-4">
          <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <img
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            className="max-w-full max-h-[75vh] object-contain rounded-lg"
          />
          <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-xl z-10 hover:bg-opacity-100">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <div className="text-center p-2 text-gray-700">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
};

// --- Add Product Modal Component (MODIFIED) ---

function AddProductModal({
  isOpen,
  onClose,
  onProductAdded,
  categories = [],
  dimensions = [],
  handleAddNewDimension,
  newDimensionInput,
  setNewDimensionInput,
}) {
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    about: "",
    quantity: 500,
    pricePerPiece: "",
    totalPiecesPerBox: "",
    discountPercentage: 0,
  });

  const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
  const [showAllDescriptionBoxes, setShowAllDescriptionBoxes] = useState(false);

  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [colorImages, setColorImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Reset when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        categoryId: "",
        name: "",
        about: "",
        quantity: 500,
        pricePerPiece: "",
        totalPiecesPerBox: "",
        discountPercentage: 0,
      });
      setDescriptionParts(Array(20).fill(""));
      setShowAllDescriptionBoxes(false);
      setSelectedDimensions([]);
      setColorImages([]);
      setProductImages([]);
      setIsCompressing(false);
      setNewDimensionInput("");
    }
  }, [isOpen, setNewDimensionInput]);

  const handleDescriptionPartChange = (e, index) => {
    const newParts = [...descriptionParts];
    newParts[index] = e.target.value.substring(0, 20);
    setDescriptionParts(newParts);
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handles file selection + compression. Accepts a setter (setColorImages / setProductImages)
  const handleFileChange = async (e, setFiles, currentFiles = [], limit) => {
    const filesToProcess = Array.from(e.target.files || []);
    // clear input so same file can be selected again
    e.target.value = null;

    if (filesToProcess.length === 0) return;

    if (limit && filesToProcess.length + (currentFiles?.length || 0) > limit) {
      toast.error(`You can only upload a maximum of ${limit} images in total.`);
      return;
    }

    setIsCompressing(true);
    const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);

    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map((file) => imageCompression(file, compressionOptions))
      );

      // Keep original filenames (imageCompression may change name)
      compressedFiles.forEach((file, i) => (file.name = filesToProcess[i].name));

      // Use functional update to avoid stale state
      setFiles((prev) => [...prev, ...compressedFiles]);

      toast.success("Compression complete!", { id: toastId });
    } catch (err) {
      console.error("Image compression failed:", err);
      toast.error("Failed to process images.", { id: toastId });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDimensionSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const dimensionToAdd = dimensions.find((d) => d._id === selectedId);
    if (dimensionToAdd && !selectedDimensions.some((d) => d._id === dimensionToAdd._id)) {
      setSelectedDimensions((prev) => [...prev, dimensionToAdd]);
    }
    e.target.value = "";
  };

  // validateForm returns { ok: boolean, message?: string, combinedDescription?: string }
  const validateForm = () => {
    // Build combinedDescription BEFORE validation
    const combinedDescription = descriptionParts
      .filter((p) => p.trim())
      .join(" ")
      .trim();

    if (!formData.name || !formData.name.trim()) {
      return { ok: false, message: "Model Number is required." };
    }

    if (isCompressing) {
      return { ok: false, message: "Please wait for images to finish processing." };
    }

    if (!combinedDescription) return { ok: false, message: "Description is required." };
    if (selectedDimensions.length === 0) return { ok: false, message: "Please select at least one dimension." };

    if (colorImages.length === 0)
      return { ok: false, message: "Please upload at least one color image." };

    if (productImages.length === 0)
      return { ok: false, message: "Please upload at least one product image." };

    if (!formData.pricePerPiece || isNaN(Number(formData.pricePerPiece)))
      return { ok: false, message: "Price per piece is required and must be a number." };

    if (!formData.totalPiecesPerBox || isNaN(Number(formData.totalPiecesPerBox)))
      return { ok: false, message: "Total pieces per box is required and must be a number." };

    return { ok: true, combinedDescription };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Run all validations FIRST (before building FormData)
    const check = validateForm();
    if (!check.ok) {
      toast.error(check.message);
      return;
    }

    // Build FormData AFTER validation
    const submissionData = new FormData();

    // Append simple fields
    Object.entries(formData).forEach(([key, value]) => {
      // convert numeric-looking fields to numbers where appropriate
      if (key === "pricePerPiece" || key === "totalPiecesPerBox" || key === "quantity" || key === "discountPercentage") {
        submissionData.append(key, value === "" ? "0" : String(Number(value)));
      } else {
        submissionData.append(key, value);
      }
    });

    // Description from validateForm()
    submissionData.append("description", check.combinedDescription);

    // IMPORTANT: send **dimension IDs** (option B) as comma-separated string
    submissionData.append("dimensions", selectedDimensions.map((d) => d._id).join(","));

    // Append images
    colorImages.forEach((file) => submissionData.append("colorImages", file, file.name));
    productImages.forEach((file) => submissionData.append("images", file, file.name));

    // Debug log (optional)
    console.group("🧾 Product Submission Debug Log");
    console.log("➡️ name:", formData.name);
    console.log("➡️ categoryId:", formData.categoryId || "(none)");
    console.log("➡️ description:", check.combinedDescription);
    console.log("➡️ dimensions (IDs):", selectedDimensions.map((d) => d._id).join(","));
    console.log("➡️ pricePerPiece:", formData.pricePerPiece);
    console.log("➡️ totalPiecesPerBox:", formData.totalPiecesPerBox);
    console.log("➡️ quantity:", formData.quantity);
    console.log("➡️ discountPercentage:", formData.discountPercentage);
    console.log("➡️ colorImages count:", colorImages.length);
    console.log("➡️ productImages count:", productImages.length);
    console.groupEnd();

    // Submit
    try {
      const res = await fetch("https://threebapi-1067354145699.asia-south1.run.app/api/products/add", {
        method: "POST",
        body: submissionData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const message = errJson?.message || `Server error: ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      toast.success("Product added successfully!");
      onProductAdded && onProductAdded(data);
      onClose && onClose();
      console.log("✅ Product added successfully!", data);
    } catch (err) {
      console.error("❌ Error while adding product:", err);
      toast.error(err.message || "Failed to add product");
    }
  };

  const inputClass =
    "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass =
    "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";
  const visibleDescriptionBoxes = showAllDescriptionBoxes ? 20 : 4;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
        <h3 className="text-2xl font-bold text-gray-800">Add New Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
          ×
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-6 flex-grow min-h-0">
        <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Category (Optional)</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className={inputClass}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Model Number</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter the product model number"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {descriptionParts.slice(0, visibleDescriptionBoxes).map((part, index) => (
                <input
                  key={index}
                  type="text"
                  value={part}
                  onChange={(e) => handleDescriptionPartChange(e, index)}
                  className="w-full h-10 text-center border border-gray-300 rounded-lg focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition"
                  maxLength={20}
                />
              ))}
            </div>

            {!showAllDescriptionBoxes && (
              <div className="text-right mt-2">
                <button type="button" onClick={() => setShowAllDescriptionBoxes(true)} className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 justify-end">
                  <FontAwesomeIcon icon={faPlus} size="xs" /> Add More Boxes
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">About</label>
            <textarea name="about" value={formData.about} onChange={handleInputChange} rows={3} placeholder="More details about the product" className={inputClass}></textarea>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Upload Color Images <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, setColorImages, colorImages)}
              className={`${fileInputClass} mt-1`}
              disabled={isCompressing}
            />

            {colorImages.length === 0 && <p className="text-red-500 text-xs mt-1">At least one color image is recommended.</p>}

            <div className="flex flex-wrap mt-2 gap-4">
              {colorImages.map((file, index) => (
                <ImageThumb key={index} file={file} onRemove={() => setColorImages((prev) => prev.filter((_, i) => i !== index))} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Dimensions <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              <select onChange={handleDimensionSelect} className={inputClass + " mt-0 flex-grow"}>
                <option value="">-- Select to add --</option>
                {dimensions.map((dim) => (
                  <option key={dim._id} value={dim._id}>
                    {dim.value}
                  </option>
                ))}
              </select>

              <input type="text" placeholder="Add new dimension" value={newDimensionInput} onChange={(e) => setNewDimensionInput(e.target.value)} className={inputClass + " mt-0"} />

              <button type="button" onClick={handleAddNewDimension} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0">
                Add
              </button>
            </div>

            <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">
              {selectedDimensions.length > 0 ? (
                selectedDimensions.map((dim) => (
                  <span key={dim._id} className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full">
                    {dim.value}
                    <button type="button" onClick={() => setSelectedDimensions((prev) => prev.filter((d) => d._id !== dim._id))} className="ml-2 font-bold hover:text-gray-200">
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">No dimensions selected.</span>
              )}
            </div>

            {selectedDimensions.length === 0 && <p className="text-red-500 text-xs mt-1">Please select or add at least one dimension.</p>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Quantity</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} required className={inputClass} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Price/Piece</label>
              <input type="number" name="pricePerPiece" value={formData.pricePerPiece} onChange={handleInputChange} min={0} step="0.01" required className={inputClass} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Pieces/Box</label>
              <input type="number" name="totalPiecesPerBox" value={formData.totalPiecesPerBox} onChange={handleInputChange} min={1} required className={inputClass} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Discount %</label>
              <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} min={0} step="0.01" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Product Images <span className="text-red-500">*</span></label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, setProductImages, productImages)}
              className={`${fileInputClass} mt-1`}
              disabled={isCompressing}
            />

            {productImages.length === 0 && <p className="text-red-500 text-xs mt-1">At least one product image is required.</p>}

            <div className="flex flex-wrap mt-2 gap-4">
              {productImages.map((file, index) => (
                <ImageThumb key={index} file={file} onRemove={() => setProductImages((prev) => prev.filter((_, i) => i !== index))} />
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t flex-shrink-0 rounded-b-2xl">
        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">
          Cancel
        </button>

        <button
          type="submit"
          form="add-product-form"
          className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg"
          disabled={isCompressing}
        >
          {isCompressing ? "Processing..." : "Add Product"}
        </button>
      </div>
    </Modal>
  );
}



// --- Update Product Modal (MODIFIED) ---
const UpdateProductModal = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  product,
  categories,
  dimensions,
  handleAddNewDimension,
  newDimensionInput,
  setNewDimensionInput,
}) => {
  const [formData, setFormData] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [imagePendingDelete, setImagePendingDelete] = useState(null);

  // New state for description
  const [descriptionParts, setDescriptionParts] = useState(Array(20).fill(""));
  const [showAllDescriptionBoxes, setShowAllDescriptionBoxes] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        categoryId: product.categoryId?._id || product.categoryId || "",
        name: product.name || "",
        about: product.about || "",
        pricePerPiece: product.pricePerPiece || "",
        totalPiecesPerBox: product.totalPiecesPerBox || "",
        discountPercentage: product.discountPercentage || 0,
        quantity: product.quantity || "",
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setImagesToDelete([]);

      const desc = product.description || "";
      const initialDescriptionParts = Array(20).fill("");
      desc
        .split(" ")
        .filter((p) => p.trim())
        .forEach((part, index) => {
          if (index < 10) initialDescriptionParts[index] = part;
        });
      setDescriptionParts(initialDescriptionParts);
      setShowAllDescriptionBoxes(
        initialDescriptionParts.some((p) => p.trim() !== "") &&
          initialDescriptionParts.slice(0, 4).every((p) => p.trim() !== "")
      );

      const dims = Array.isArray(product.dimensions)
        ? product.dimensions.map((d) => ({ _id: d._id || d, value: d.value || d }))
        : [];
      setSelectedDimensions(dims);
    } else if (!isOpen) {
      setFormData({});
      setExistingImages([]);
      setNewImages([]);
      setImagesToDelete([]);
      setIsCompressing(false);
      setSelectedDimensions([]);
      setDescriptionParts(Array(10).fill(""));
      setShowAllDescriptionBoxes(false);
      setNewDimensionInput("");
    }
  }, [product, isOpen, setNewDimensionInput]);

  const handleDescriptionPartChange = (e, index) => {
    const newParts = [...descriptionParts];
    newParts[index] = e.target.value.substring(0, 20);
    setDescriptionParts(newParts);
  };

  const handleFileChange = async (e) => {
    const filesToProcess = Array.from(e.target.files);
    e.target.value = null;
    const limit = 10;
    if (filesToProcess.length + existingImages.length + newImages.length > limit) {
      toast.error(`You can only have a maximum of ${limit} images in total.`);
      return;
    }
    setIsCompressing(true);
    const toastId = toast.loading(`Compressing ${filesToProcess.length} image(s)...`);
    const compressionOptions = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
    try {
      const compressedFiles = await Promise.all(
        filesToProcess.map((file) => imageCompression(file, compressionOptions))
      );
      compressedFiles.forEach((file, index) => {
        file.name = filesToProcess[index].name;
      });
      setNewImages((prev) => [...prev, ...compressedFiles]);
      toast.success("Compression complete!", { id: toastId });
    } catch (error) {
      toast.error("Failed to process images.", { id: toastId });
    } finally {
      setIsCompressing(false);
    }
  };

  // 🟣 When user clicks delete icon — just open popup
const handleRemoveExistingImage = (image) => {
  setImagePendingDelete(image);
  setShowDeletePopup(true);
};

const confirmDeleteImage = async () => {
  if (!imagePendingDelete) return;

  // 🧠 Clean ID: if it’s a path like "product-images/xyz.png", extract the filename
  const cleanId = imagePendingDelete.id.includes("product-images/")
    ? imagePendingDelete.id.split("product-images/")[1]
    : imagePendingDelete.id;

  const deleteUrl = `https://threebapi-1067354145699.asia-south1.run.app/api/products/products/${product._id}/images/${cleanId}`;
  console.log("🧹 Deleting image with clean ID:", cleanId);

  try {
    const response = await fetch(deleteUrl, { method: "DELETE" });

    let data;
    try {
      data = await response.json();
    } catch {
      console.error("Response not JSON, probably 404 HTML");
      toast.error("Failed to delete image (404). Check image ID.");
      return;
    }

    if (!response.ok) {
      toast.error(data.message || "Failed to delete image.");
      return;
    }

    toast.success("✅ Image deleted successfully!");
    setExistingImages(data.remainingImages || []);
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    toast.error("An error occurred while deleting the image.");
  } finally {
    setShowDeletePopup(false);
    setImagePendingDelete(null);
  }
};







  const handleRemoveNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("dimensions", selectedDimensions.map((d) => d.value).join(","));
const combinedDescription = descriptionParts
  .filter(p => p.trim())
  .join(" ")
  .trim();

  const error = validateForm({
  combinedDescription,
  selectedDimensions,
  colorImages,
  productImages,
  formData
});

if (error) return toast.error(error);
    data.append("description", combinedDescription);

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "categoryId" && !value) return;
      data.append(key, value);
    });

    newImages.forEach((file) => data.append("images", file, file.name));
    if (imagesToDelete.length > 0) {
      data.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    const promise = fetch(
      `https://threebapi-1067354145699.asia-south1.run.app/api/products/update/${product._id}`,
      { method: "PUT", body: data }
    ).then(async (res) => {
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Update failed");
      return responseData;
    });

    toast.promise(promise, {
      loading: "Updating product...",
      success: () => {
        onUpdateSuccess();
        onClose();
        return "Product updated successfully!";
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  const inputClass =
    "w-full p-2 mt-1 border border-gray-300 rounded-xl focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition";
  const fileInputClass =
    "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-[#6A3E9D] hover:file:bg-violet-100";
  const visibleDescriptionBoxes = showAllDescriptionBoxes ? 20 : 4;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-800">Update Product</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">
          ×
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-6 min-h-0">
        <form id="update-product-form" onSubmit={handleFormSubmit} className="space-y-4">
          {/* CATEGORY + NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Category (Optional)</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Name / Frame</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {descriptionParts.slice(0, visibleDescriptionBoxes).map((part, index) => (
                <input
                  key={index}
                  type="text"
                  value={part}
                  onChange={(e) => handleDescriptionPartChange(e, index)}
                  className="w-full h-10 text-center border border-gray-300 rounded-lg focus:border-[#6A3E9D] focus:ring-1 focus:ring-[#6A3E9D] focus:outline-none transition"
                  maxLength="20"
                />
              ))}
            </div>
            {!showAllDescriptionBoxes && (
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setShowAllDescriptionBoxes(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 justify-end"
                >
                  <FontAwesomeIcon icon={faPlus} size="xs" /> Add More Boxes
                </button>
              </div>
            )}
          </div>

          {/* ABOUT */}
          <div>
            <label className="text-sm font-semibold text-gray-700">About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              rows="3"
              placeholder="More details about the product"
              className={inputClass}
            ></textarea>
          </div>

          {/* DIMENSIONS */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Dimensions</label>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const dim = dimensions.find((d) => d._id === e.target.value);
                  if (dim && !selectedDimensions.some((d) => d._id === dim._id)) {
                    setSelectedDimensions((prev) => [...prev, dim]);
                  }
                  e.target.value = "";
                }}
                className={inputClass + " mt-0 flex-grow"}
              >
                <option value="">-- Select to add --</option>
                {dimensions.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.value}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Add new dimension"
                value={newDimensionInput}
                onChange={(e) => setNewDimensionInput(e.target.value)}
                className={inputClass + " mt-0"}
              />
              <button
                type="button"
                onClick={handleAddNewDimension}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex-shrink-0"
              >
                Add
              </button>
            </div>

            <div className="mt-2 min-h-[2rem] p-2 bg-gray-50 rounded-lg">
              {selectedDimensions.length > 0
                ? selectedDimensions.map((dim) => (
                    <span
                      key={dim._id}
                      className="inline-flex items-center bg-[#6A3E9D] text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-full"
                    >
                      {dim.value}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDimensions((prev) =>
                            prev.filter((d) => d._id !== dim._id)
                          )
                        }
                        className="ml-2 font-bold hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  ))
                : (
                  <span className="text-gray-400 text-sm">No dimensions selected.</span>
                )}
            </div>
          </div>

          {/* PRICE, PIECES, DISCOUNT, QTY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold">Price/Piece</label>
              <input
                type="number"
                name="pricePerPiece"
                value={formData.pricePerPiece}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Pieces/Box</label>
              <input
                type="number"
                name="totalPiecesPerBox"
                value={formData.totalPiecesPerBox}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Discount %</label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Manage Product Images
            </label>
            <div className="mt-2 p-3 border rounded-lg bg-gray-50 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Existing Images
                </h4>
                {existingImages.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {existingImages.map((img) => (
<ImageThumb
  key={img.id}
  file={img.url}
  onRemove={() => handleRemoveExistingImage(img)}
  isUrl={true}
/>

))}

                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No existing images.</p>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Add New Images
                </h4>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className={fileInputClass}
                  disabled={isCompressing}
                />
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {newImages.map((file, index) => (
                      <ImageThumb
                        key={index}
                        file={file}
                        onRemove={() => handleRemoveNewImage(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t rounded-b-2xl">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="update-product-form"
          className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg"
          disabled={isCompressing}
        >
          {isCompressing ? "Processing..." : "Update Product"}
        </button>
      </div>

      {/* DELETE CONFIRMATION POPUP */}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Delete Image?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to remove this image? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setImagePendingDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteImage}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};



  

// --- Main Component (MODIFIED) ---
function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [dimensionList, setDimensionList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCarouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);
  const [isQrOpen, setQrOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDimensionInput, setNewDimensionInput] = useState(''); // State for new dimension input

  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Number of products per page


  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [productsRes, categoriesRes, dimensionsRes] = await Promise.all([
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/products/all'),
        fetch('https://threebapi-1067354145699.asia-south1.run.app/api/categories/all-category'),
       fetch('https://threebappbackend.onrender.com/api/dimensions/get-dimensions')
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !dimensionsRes.ok) {
        throw new Error('Failed to fetch initial data.');
      }

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const dimensionsData = await dimensionsRes.json();

      setProducts(Array.isArray(productsData.products) ? productsData.products : []);
      setCategoryList(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);
      setDimensionList(Array.isArray(dimensionsData) ? dimensionsData : []);

    } catch (err) {
      setError(err.message);
      toast.error("Could not fetch data.");
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Move handleAddNewDimension to ViewProducts
  const handleAddNewDimension = async () => {
    const value = newDimensionInput.trim();
    if (!value) {
      toast.error("Please enter a dimension value.");
      return;
    }

    const promise = fetch('https://threebappbackend.onrender.com/api/dimensions/add-dimensions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add dimension');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding dimension...',
      success: () => {
        setNewDimensionInput(''); // Clear the input after successful add
        fetchData(); // Re-fetch dimensions to update lists
        return 'Dimension added successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // onDimensionAdded now just calls fetchData, as the actual add logic is above
  // const handleDimensionAdded = () => { fetchData(); }; // No longer needed as handleAddNewDimension does this
  const handleProductAdded = () => { fetchData(); };
const showCarousel = (images) => { setCarouselImages(images.map(img => img.url)); setCarouselOpen(true); };
  const showQrCode = (url) => { setQrCodeUrl(url); setQrOpen(true); };
  const handleEdit = (product) => { setSelectedProduct(product); setIsUpdateModalOpen(true); };
  const handleUpdateSuccess = () => { fetchData(); };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const promise = fetch(`https://threebapi-1067354145699.asia-south1.run.app/api/products/delete/${productId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) return res.json().then(err => { throw new Error(err.message || 'Delete failed') });
        return res.json();
      });

    toast.promise(promise, {
      loading: 'Deleting product...',
      success: () => { fetchData(); return 'Product deleted successfully!'; },
      error: (err) => `Error: ${err.message}`,
    });
  };

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = searchTerm.toLowerCase() === ''
      ? true
      : product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.about.toLowerCase().includes(searchTerm.toLowerCase()); // Assuming 'about' also searchable

    const matchesCategory = filterCategory === ''
      ? true
      : product.categoryId && product.categoryId._id === filterCategory;

    return matchesSearchTerm && matchesCategory;
  });

  // Pagination Logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString(); // Formats to a human-readable date and time
  };


  if (isLoading) return <div className="text-center p-8 text-lg">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 mt-8">
      <Toaster position="top-right" />
      <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">View All Products</h2>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-[#6A3E9D] hover:bg-[#583281] text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">+ Add Product</button>
        </div>

        {/* Filter and Search Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by product name or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-[#6A3E9D] focus:border-[#6A3E9D] outline-none transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            {/* <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1); // Reset to first page on category filter
              }}
              className="appearance-none w-full sm:w-auto pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-[#6A3E9D] focus:border-[#6A3E9D] outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categoryList.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select> */}
            {/* <FontAwesomeIcon icon={faAngleDown} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Sr No.</th>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Frame</th>
                <th className="px-6 py-3">Dimensions</th>
                <th className="px-6 py-3">Price/Piece</th>
                <th className="px-6 py-3">Piece/Box</th>
                <th className="px-6 py-3">Box Price</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Qty</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Last Modify</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <tr key={product._id} className="bg-white border-b hover:bg-gray-50 align-middle">
                    <td className="px-6 py-4">{(indexOfFirstProduct + index) + 1}</td>
                    <td className="px-6 py-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]?.url}
                          onClick={() => showCarousel(product.images)}
                          className="w-16 h-16 object-cover rounded-md cursor-pointer"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-16 h-16  rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4">{Array.isArray(product.dimensions) ? product.dimensions.map(d => d.value || d).join(', ') : '—'}</td>
                    <td className="px-6 py-4">₹{product.pricePerPiece}</td>
                    <td className="px-6 py-4">{product.totalPiecesPerBox}</td>
                    <td className="px-6 py-4">₹{product.finalPricePerBox || product.mrpPerBox}</td>
                    <td className="px-6 py-4">{product.discountPercentage || 0}%</td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{product.description}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatDateTime(product.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button onClick={() => showQrCode(product.qrCodeUrl)} title="Show QR Code" className="text-gray-500 hover:text-gray-700 p-2"><FontAwesomeIcon icon={faQrcode} /></button>
                      <button onClick={() => handleEdit(product)} title="Edit" className="text-blue-600 hover:text-blue-800 p-2"><FontAwesomeIcon icon={faPenToSquare} /></button>
                      <button onClick={() => handleDelete(product._id)} title="Delete" className="text-red-600 hover:text-red-800 p-2"><FontAwesomeIcon icon={faTrash} /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="px-6 py-4 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center items-center gap-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 border rounded-md ${currentPage === i + 1 ? 'bg-[#6A3E9D] text-white border-[#6A3E9D]' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      <ImageSliderModal
        isOpen={isCarouselOpen}
        onClose={() => setCarouselOpen(false)}
        images={carouselImages}
      />

      <Modal isOpen={isQrOpen} onClose={() => setQrOpen(false)}>
        <div className="p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold mb-4">Product QR Code</h3>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="Product QR Code" className="w-64 h-64 rounded-lg border p-2" />
          ) : (
            <p className="text-gray-500">QR Code not available.</p>
          )}
          <button onClick={() => setQrOpen(false)} className="mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg">Close</button>
        </div>
      </Modal>

      {/* Pass the new dimension states and handler to AddProductModal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={handleProductAdded}
        categories={categoryList}
        dimensions={dimensionList}
        handleAddNewDimension={handleAddNewDimension}
        newDimensionInput={newDimensionInput}
        setNewDimensionInput={setNewDimensionInput}
      />

      {/* Pass the new dimension states and handler to UpdateProductModal */}
      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUpdateSuccess={handleUpdateSuccess}
        product={selectedProduct}
        categories={categoryList}
        dimensions={dimensionList}
        handleAddNewDimension={handleAddNewDimension}
        newDimensionInput={newDimensionInput}
        setNewDimensionInput={setNewDimensionInput}
      />
    </div>
  );
}

export default ViewProducts;