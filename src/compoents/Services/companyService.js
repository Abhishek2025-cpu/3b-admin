import axios from 'axios';

const BASE_URL = 'https://threebapi-1067354145699.asia-south1.run.app';

// 1. Get All Companies
export const get__CompaniesList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/company/get-company`);
    return response?.data || [];
  } catch (error) {
    console.error("❌ Error fetching companies:", error);
    throw error;
  }
};

// 2. Get All Categories
export const get__AllCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/categories/all-category`);
   
    return response?.data;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    throw error;
  }
};

// 3. Add New Company
export const add__NewCompany = async (formData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/company/add-company`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error adding company:", error);
    throw error;
  }
};