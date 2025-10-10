import axios from "axios"

const dbUri = process.env.NEXT_PUBLIC_DATABASE_URI;

export const getQuizzes = async (token) => {

    try {
        if (!token) {
            const response = await axios.get(`${dbUri}/quiz`);
            return response.data.quizzes;
        } else {
            const response = await axios.get(`${dbUri}/quiz/my-quizzes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.quizzes;
        }
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}

export const getQuestions = async (id, token) => {
    try {
        const response = await axios.get(`${dbUri}/question/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // console.log(response);
        let questions = response.data.questions;

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        questions = questions.map((question) => {
            return {
                ...question,
                options: shuffleArray([...question.options])
            };
        });

        questions = shuffleArray(questions);

        return questions;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const submitAnswers = async (id, answers, token) => {
    try {
        const response = await axios.post(
            `${dbUri}/question/${id}/submit`,
            { answers },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
};

export const getAttempt = async (token, attemptId) => {
    try {
        const response = await axios.get(`${dbUri}/quiz/attempt/${attemptId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data.attempt
    } catch (error) {
        throw new Error(error.response.data.message);
    }
}