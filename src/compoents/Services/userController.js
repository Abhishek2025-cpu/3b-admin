const API_URL = "https://threebapi-1067354145699.asia-south1.run.app/api/auth/get-user-profiles";

export const fetchUserProfiles = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
      
        return data.users || [];
    } catch (error) {
        console.error("Error fetching user profiles:", error);
        return [];
    }
};