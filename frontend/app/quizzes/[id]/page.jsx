'use client';
import React, { useState, useEffect } from 'react';
import { getQuestions, submitAnswers } from '@/services/quizz';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from "sonner"
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/userContext';

export default function QuizPage({ params }) {
  const { id } = React.use(params);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState([]);
  const router = useRouter();
  const token = Cookies.get("token");
  const pathname = usePathname();
  const { dark } = useUser();

  // Animation variants
  const questionVariants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 100 : -100,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        x: direction > 0 ? -100 : 100,
        opacity: 0
      };
    }
  };

  useEffect(() => {
    if (!token) {
      toast.warning("Please login to continue" );
      router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    getData();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (questions && questions[currentQuestionIndex]) {
      const currentAnswer = answers.find(a => a.questionId === questions[currentQuestionIndex]._id);
      setSelectedOption(currentAnswer?.selectedAnswer || null);
    }
  }, [currentQuestionIndex, questions]);

  const getData = async () => {
    try {
      const data = await getQuestions(id, token);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.message === "Invalid or expired token.") {
        toast.warning("Please login to continue" );
        router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
      }
      console.log(error.message);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    const currentQuestionId = questions[currentQuestionIndex]._id;

    setAnswers(prev => {
      const updated = [...prev];
      const existing = updated.find(a => a.questionId === currentQuestionId);
      if (existing) {
        existing.selected = option;
      } else {
        updated.push({ questionId: currentQuestionId, selectedAnswer: option });
      }
      return updated;
    });
  };

  const handleNext = () => {
    const direction = 1;
    if (selectedOption === null) {
      handleOptionSelect("skipped");
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (selectedOption === null) {
        handleOptionSelect("skipped");
      }
      handleSubmit();
    }
    setSelectedOption(null);
  };

  const handlePrev = () => {
    const direction = -1;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const token = Cookies.get('token');
    const response = await submitAnswers(id, answers, token);
    setResult(response.result.detailedResults);
    const correctCount = response.result.detailedResults.reduce((count, item) => {
      return count + (item.isCorrect ? 1 : 0);
    }, 0);

    setScore(correctCount);
    setQuizSubmitted(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!questions) {
    return (
      <motion.div
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-foreground text-center mt-10"
      >
        Loading questions...
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div
        transition={{ duration: 0.2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto px-5 py-8 text-muted-foreground text-center"
      >
        <h1 className="text-2xl font-semibold text-destructive mb-2">No Questions Available</h1>
        <p className="text-muted-foreground mt-2">It looks like there are no questions in this quiz. Please check back later or contact the administrator.</p>
      </motion.div>
    );
  }

  if (quizSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-3xl mx-auto px-5 py-8 text-foreground"
      >
        <motion.button
          whileHover={{ x: -3 }}
          onClick={() => router.back()}
          className="flex items-center text-primary/80 cursor-pointer mb-6 hover:text-primary"
        >
          ← Back to Quizzes
        </motion.button>
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-primary mb-2">Quiz Completed!</h1>
          <p className="text-muted-foreground">
            Your score: <span className="text-accent-foreground font-bold">{score}</span> out of {result.length}
          </p>
          <p className="text-muted-foreground">
            Correct: {score} | Incorrect: {result.length - score}
          </p>
        </header>

        <div className="space-y-8">
          {result.map((questionResult, qIndex) => {
            const question = questions.find(q => q._id === questionResult.questionId);
            if (!question) return null;

            return (
              <motion.div
                key={qIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // transition={{ delay: qIndex * 0.1 }}
                transition={{ duration: 0.1 }}
                className="bg-secondary-background rounded-lg p-6 border border-border"
              >
                <h3 className="text-lg font-medium mb-4">
                  Question {qIndex + 1}: {questionResult.questionTitle || question.title}
                  {questionResult.isCorrect ? (
                    <span className="ml-2 text-sm text-success-foreground">✓ Correct ({questionResult.points} points)</span>
                  ) : (
                    <span className="ml-2 text-sm text-error-foreground">X Incorrect (0 points)</span>
                  )}
                </h3>

                <ul className="space-y-3 mb-4">
                  {question.options.map((option, oIndex) => {
                    let optionClasses = "p-4 rounded-lg border";
                    const isUserSelected = option === questionResult.selectedAnswer;
                    const isCorrectOption = option === questionResult.correctAnswer;

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
                        // transition={{ delay: oIndex * 0.05 }}
                        transition={{ delay: 0.2 }}
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

                {questionResult.explanation && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 p-4 bg-muted rounded-lg"
                  >
                    <h4 className="font-medium mb-2">Explanation:</h4>
                    <p className="text-muted-foreground">{questionResult.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl my-10 mx-4 sm:mx-auto px-5 py-8 text-foreground relative bg-container-background rounded-xl shadow-lg border border-border"
    >
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-primary mb-2">FPGA Architecture and Design</h1>
        <p className="text-muted-foreground text-sm mb-6">Test your knowledge of FPGA architecture, design flow, and implementation techniques.</p>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <motion.div
            className="w-full bg-secondary-background rounded-full h-2"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
          <span className="text-foreground font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="bg-secondary-text px-3 py-1 rounded-full text-xs text-red-500 font-extrabold border border-border"
          >
            ⏱ {formatTime(timeLeft)} remaining
          </motion.span>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentQuestionIndex}
            custom={1}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
          >
            <div className="bg-container-background rounded-lg p-6 mb-6 border border-border">
              <div className="text-lg mb-6 leading-relaxed text-foreground">
                {currentQuestion?.title}
              </div>

              <ul className="space-y-3 mb-6">
                {currentQuestion?.options.map((option, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ y: -2 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all border border-border
                      ${selectedOption === option ? 'border-primary border-l-4 text-primary' : 'bg-secondary-background hover:bg-secondary'}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all border border-border cursor-pointer
              ${currentQuestionIndex === 0 ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-secondary hover:bg-secondary-background text-foreground'}`}
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all border border-primary cursor-pointer
              ${!selectedOption ? 'bg-primary' : 'bg-primary'}`}
            onClick={handleNext}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Submit' : !selectedOption ? "Skip" : "Next"}
          </motion.button>
        </div>
      </main>
    </motion.div>
  );
}