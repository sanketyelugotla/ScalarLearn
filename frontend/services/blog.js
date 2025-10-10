import axios from "axios"
import { Cookie } from "next/font/google";

const dbUri = process.env.NEXT_PUBLIC_DATABASE_URI;

export const getBlogs = async () => {
    try {
        const response = await axios.get(`${dbUri}/blog`);
        return response.data.blogs;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const getBlog = async (id, token) => {
    try {
        const response = await axios.get(`${dbUri}/blog/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log(response.data);
        return response.data.blog;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}
