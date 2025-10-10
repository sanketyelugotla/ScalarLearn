import axios from "axios";

const dbUri = process.env.NEXT_PUBLIC_DATABASE_URI;

// Get course lectures
export const getCourseLectures = async (courseId, token) => {
    try {
        const res = await axios.get(`${dbUri}/lectures/course/${courseId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch lectures");
    }
};

// Get single lecture
export const getLecture = async (lectureId, token) => {
    try {
        const res = await axios.get(`${dbUri}/lectures/${lectureId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch lecture");
    }
};

// Create lecture (Instructor only)
export const createLecture = async (courseId, formData, token) => {
    try {
        const res = await axios.post(`${dbUri}/lectures/${courseId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create lecture");
    }
};

// Update lecture (Instructor only)
export const updateLecture = async (lectureId, formData, token) => {
    try {
        const res = await axios.put(`${dbUri}/lectures/${lectureId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update lecture");
    }
};

// Delete lecture (Instructor only)
export const deleteLecture = async (lectureId, token) => {
    try {
        const res = await axios.delete(`${dbUri}/lectures/${lectureId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete lecture");
    }
};

// Complete reading lecture (Student)
export const completeReading = async (lectureId, token) => {
    try {
        const res = await axios.post(`${dbUri}/lectures/${lectureId}/complete`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to complete lecture");
    }
};

// Submit quiz (Student)
export const submitQuiz = async (lectureId, answers, token) => {
    try {
        const res = await axios.post(`${dbUri}/lectures/${lectureId}/quiz`, { answers }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to submit quiz");
    }
};
