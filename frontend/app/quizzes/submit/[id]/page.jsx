'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { getAttempt } from '@/services/quizz';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Only import what you need

const Submit = ({ params }) => {
    const [attempt, setAttempt] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = Cookies.get("token");
    const { id } = React.use(params)
    const router = useRouter();

    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const data = await getAttempt(token, id);
                setAttempt(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchAttempt();
    }, [token, id]);

    // Simple fade animation
    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading your results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 p-4">
                Error: {error}
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="p-4">
                No attempt data found
            </div>
        );
    }

    const { score, totalQuestions, answers } = attempt;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto px-5 py-8 text-foreground"
        >
            <button
                onClick={() => router.back()}
                className="flex items-center text-primary/80 cursor-pointer mb-6 hover:text-primary"
            >
                ← Back to Quizzes
            </button>

            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-semibold text-primary mb-2">Quiz Completed!</h1>
                <p className="text-muted-foreground">
                    Your score: <span className="text-accent-foreground font-bold">{score}</span> out of {totalQuestions}
                </p>
            </motion.header>

            <div className="space-y-8">
                {answers.map((answer, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-secondary-background rounded-lg p-6 border border-border"
                    >
                        <h3 className="text-lg font-medium mb-4">
                            Question {index + 1}: {answer.questionId.title}
                            {answer.isCorrect ? (
                                <span className="ml-2 text-sm text-green-600">✓ Correct</span>
                            ) : (
                                <span className="ml-2 text-sm text-red-600">✗ Incorrect</span>
                            )}
                        </h3>

                        <ul className="space-y-3 mb-4">
                            {answer.questionId.options.map((option, oIndex) => {
                                let optionClasses = "p-4 rounded-lg border";
                                const isUserSelected = option === answer.selectedAnswer;
                                const isCorrectOption = option === answer.questionId.answer;

                                if (isUserSelected && isCorrectOption) {
                                    optionClasses += " border-l-4 border-success text-success-foreground";
                                } else if (isUserSelected) {
                                    optionClasses += " border-l-4 border-error text-error-foreground";
                                } else if (isCorrectOption) {
                                    optionClasses += " border-l-4 border-success text-success-foreground";
                                } else {
                                    optionClasses += " bg-container-background border-border";
                                }

                                return (
                                    <motion.li
                                        key={oIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 * index + 0.05 * oIndex }}
                                        className={optionClasses}
                                    >
                                        {option}
                                        {isCorrectOption && !isUserSelected && (
                                            <span className="ml-2 text-xs text-muted-foreground">(Correct Answer)</span>
                                        )}
                                    </motion.li>
                                );
                            })}
                        </ul>

                        {answer.questionId.explanation && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className="mt-4 p-4 bg-muted rounded-lg"
                            >
                                <h4 className="font-medium mb-2">Explanation:</h4>
                                <p className="text-muted-foreground">{answer.questionId.explanation}</p>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default Submit;