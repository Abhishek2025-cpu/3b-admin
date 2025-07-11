// src/pages/Categories.jsx

import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

const baseUrl = "https://threebapi-1067354145699.asia-south1.run.app/api/categories";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({
    id: "",
    name: "",
    categoryId: "",
    images: [],
    imagesToDelete: [],
    existingImages: [],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${baseUrl}/all-category`);
      const data = await res.json();
      setCategories(data);
    } catch {
      alert("Failed to fetch categories.");
    }
  }

  function handleFileChange(e) {
    setFormState((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(e.target.files)],
    }));
    e.target.value = "";
  }

  function openAddModal() {
    setFormState({
      id: "",
      name: "",
      categoryId: "",
      images: [],
      imagesToDelete: [],
      existingImages: [],
    });
    setShowModal(true);
  }

  async function openEditModal(id) {
    const res = await fetch(`${baseUrl}/get-categories`);
    const data = await res.json();
    const category = data.find((c) => c._id === id);
    if (category) {
      setFormState({
        id: category._id,
        name: category.name,
        categoryId: category.categoryId,
        images: [],
        imagesToDelete: [],
        existingImages: category.images || [],
      });
      setShowModal(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", formState.name);
    formData.append("categoryId", formState.categoryId);
    formState.images.forEach((file) => formData.append("images", file));
    if (formState.id && formState.imagesToDelete.length) {
      formData.append("imagesToDelete", JSON.stringify(formState.imagesToDelete));
    }

    const method = formState.id ? "PUT" : "POST";
    const url = formState.id
      ? `${baseUrl}/update-categories/${formState.id}`
      : `${baseUrl}/add-category`;

    await fetch(url, { method, body: formData });
    setShowModal(false);
    loadCategories();
  }

  async function deleteCategory(id) {
    if (confirm("Delete this category?")) {
      await fetch(`${baseUrl}/delete-categories/${id}`, { method: "DELETE" });
      loadCategories();
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <a href="/manager/dashboard" className="text-gray-600 flex items-center gap-2 mb-4">
        <FaArrowLeft /> Back
      </a>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-700">All Categories</h2>
        <button
          className="bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800"
          onClick={openAddModal}
        >
          <FaPlus className="inline mr-2" /> Add Category
        </button>
      </div>

      <table className="w-full table-auto border bg-white rounded shadow text-sm">
        <thead className="bg-purple-100 text-purple-700 font-semibold">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Category Name</th>
            <th className="p-2 border">Category ID</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr key={cat._id}>
              <td className="p-2 border text-center">{i + 1}</td>
              <td className="p-2 border text-center">
                {cat.images?.[0]?.url ? (
                  <img src={cat.images[0].url} alt="" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </td>
              <td className="p-2 border">{cat.name}</td>
              <td className="p-2 border">{cat.categoryId}</td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  onClick={() => openEditModal(cat._id)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteCategory(cat._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg max-w-md w-full relative"
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-red-600"
              onClick={() => setShowModal(false)}
            >
              <FaTimes />
            </button>

            <h2 className="text-xl font-bold mb-4">{formState.id ? "Edit" : "Add"} Category</h2>

            <label className="block mb-2">Category Name</label>
            <input
              type="text"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              className="w-full border p-2 rounded mb-4"
              required
            />

            <label className="block mb-2">Category ID</label>
            <input
              type="text"
              value={formState.categoryId}
              onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
              className="w-full border p-2 rounded mb-4"
              required
            />

            <label className="block mb-2">Images</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mb-4"
              accept="image/*"
            />

            <div className="flex flex-wrap gap-2">
              {formState.images.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== idx),
                      }))
                    }
                    className="absolute top-0 right-0 text-white bg-red-600 rounded-full"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}

              {formState.existingImages.map((img, idx) => (
                <div key={img.url} className="relative">
                  <img
                    src={img.url}
                    alt=""
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        existingImages: prev.existingImages.filter((_, i) => i !== idx),
                        imagesToDelete: [...prev.imagesToDelete, img.url],
                      }))
                    }
                    className="absolute top-0 right-0 text-white bg-red-600 rounded-full"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-purple-700 text-white p-2 rounded hover:bg-purple-800"
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
