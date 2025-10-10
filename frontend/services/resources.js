import axios from "axios"

const dbUri = process.env.NEXT_PUBLIC_DATABASE_URI;

export const getResources = async (token) => {
    try {
        let response;
        if (token) {
            response = await axios.get(`${dbUri}/resource/my-resources`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } else {
            response = await axios.get(`${dbUri}/resource`);
        }
        // console.log(response)
        return response.data.resources;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const getResource = async (token, resourceId) => {
    try {
        let response;
        if (token) {
            response = await axios.get(`${dbUri}/resource/${resourceId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } else {
            response = await axios.get(`${dbUri}/resource`);
        }
        console.log(response)
        return response.data.resource;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const saveResource = async (token, resourceId) => {
    try {
        const response = await axios.post(
            `${dbUri}/user/save-resource`,
            { resourceId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        // console.log(response)
        return response.data.resources;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const unSaveResource = async (token, resourceId) => {
    try {
        const response = await axios.delete(`${dbUri}/user/save-resource/${resourceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // console.log(response)
        return response.data.resources;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const downloadResource = async (token, resourceId) => {
    try {
        const response = await axios.post(
            `${dbUri}/resource/download/${resourceId}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        // console.log(response)
        return response.data;
    } catch (error) {
        // console.log(error)
        throw new Error(error.response.data.message);
    }
}