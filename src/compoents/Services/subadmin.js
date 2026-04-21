import axios from 'axios';

const BASE_URL = "https://threebapi-1067354145699.asia-south1.run.app";

export const sendOtp = async (phone) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/sub-admin/send-otp`, { phone });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message };
    }
};

export const verifyOtp = async (phone, otp) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/sub-admin/verify-otp`, { phone, otp });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message };
    }
};

export const setPermissions = async (adminId, subAdminId, permissions) => {
    try {
        const response = await axios.put(`${BASE_URL}/api/sub-admin/set-permissions`, {
            adminId,
            subAdminId,
            permissions
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message };
    }
};