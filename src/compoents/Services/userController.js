const BASE_URL = "https://threebapi-1067354145699.asia-south1.run.app";

export const fetchUserProfiles = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/get-user-profiles`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data.users || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const adminLogin = async (number) => {
    try {
        const response = await fetch(`${BASE_URL}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Login failed");
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const verifyOtp = async (userId, otp, sessionId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/admin/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, otp, sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Verification failed");
        }

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("user", JSON.stringify(data.user));
        }

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};