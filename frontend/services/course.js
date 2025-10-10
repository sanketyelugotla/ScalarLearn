import axios from "axios";

const dbUri = process.env.NEXT_PUBLIC_DATABASE_URI;

// Get all courses with search and pagination
export const getAllCourses = async (search = "", category = "", page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        params.append('page', page);
        params.append('limit', limit);
        
        const res = await axios.get(`${dbUri}/courses?${params.toString()}`);
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch courses");
    }
};

// Get single course
export const getCourse = async (courseId, token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${dbUri}/courses/${courseId}`, { headers });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch course");
    }
};

// Create course (Instructor only)
export const createCourse = async (courseData, token, isFormData = false) => {
    try {
        const res = await axios.post(`${dbUri}/courses`, courseData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...(isFormData && { "Content-Type": "multipart/form-data" }),
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create course");
    }
};

// Update course (Instructor only)
export const updateCourse = async (courseId, courseData, token) => {
    try {
        const res = await axios.put(`${dbUri}/courses/${courseId}`, courseData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update course");
    }
};

// Delete course (Instructor only)
export const deleteCourse = async (courseId, token) => {
    try {
        const res = await axios.delete(`${dbUri}/courses/${courseId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete course");
    }
};

// Get instructor's courses
export const getInstructorCourses = async (token) => {
    try {
        const res = await axios.get(`${dbUri}/courses/instructor/my-courses`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch instructor courses");
    }
};

// Enroll in course (Student)
export const enrollInCourse = async (courseId, token) => {
    try {
        const res = await axios.post(`${dbUri}/courses/${courseId}/enroll`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to enroll in course");
    }
};

// Get student's enrolled courses
export const getStudentCourses = async (token) => {
    try {
        const res = await axios.get(`${dbUri}/courses/student/my-courses`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch student courses");
    }
};

// Get course progress (Instructor only)
export const getCourseProgress = async (courseId, token) => {
    try {
        const res = await axios.get(`${dbUri}/courses/${courseId}/progress`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch course progress");
    }
};
