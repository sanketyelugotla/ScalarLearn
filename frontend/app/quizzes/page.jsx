'use client';
import { getQuizzes } from '@/services/quizz';
import React, { useEffect, useState } from 'react';
import QuizCard from '@/components/QuizCard';
import Cookies from 'js-cookie';
import Loading from '../loading';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from "sonner"
import { motion } from 'framer-motion';
import { useUser } from '@/context/userContext';

// Faster animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Reduced from 0.1
      delayChildren: 0.1,    // Reduced from 0.2
      duration: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 }, // Reduced y from 20
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,  // Reduced from 0.4
      ease: "easeOut"
    }
  }
};

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const token = Cookies.get("token");
  const { dark } = useUser();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getQuizzes(token);
        setQuizzes(data);
        const uniqueCategories = Array.from(new Set(data.map(q => q.category))).filter(Boolean);
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
        if (err.message === 'Network Error') {
          setError("⚠️ Network Error: Please check your internet connection or try again later.");
        }
        else if (err.message == "Invalid or expired token.") {
          toast.warning("Please login to continue" );
          router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
        }
        else {
          setError(`⚠️ ${err.message}`);
        }
      }
    };
    fetchQuizzes();
  }, []);

  // Loading state
  if (!quizzes && !error) {
    return <Loading />;
  }

  // Error state - faster fade in
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        className="p-6 text-red-500 font-semibold bg-red-100 rounded-md max-w-screen-md mx-auto mt-6"
      >
        {error}
      </motion.div>
    );
  }

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const categoryMatch = selectedCategory === "All Categories" || quiz.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === "All Difficulties" || quiz.level === selectedDifficulty;
    const searchMatch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && difficultyMatch && searchMatch;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-background min-h-screen"
    >
      {/* Header - faster animation */}
      <motion.div
        variants={containerVariants}
        className="relative bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-10 md:px-16 lg:px-20 py-10"
      >
        <motion.div variants={itemVariants} className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground mt-2">
            Test your knowledge with our collection of engineering quizzes. Each quiz is designed to challenge
            your understanding and help you prepare for exams and interviews.
          </p>
        </motion.div>
      </motion.div>

      {/* Search and Filters - snappier animations */}
      <motion.div
        variants={containerVariants}
        className="max-w-screen-xl mx-auto px-4 sm:px-10 py-10"
      >
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {/* Search with faster hover */}
          <motion.input
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            type="text"
            placeholder="Search quizzes..."
            className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filters with faster hover */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-4"
          >
            <motion.select
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </motion.select>

            <motion.select
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.1 }}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option>All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </motion.select>
          </motion.div>
        </motion.div>

        {/* Quizzes Grid - faster staggered animation */}
        {filteredQuizzes.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.1 }} // Faster hover
              >
                <QuizCard quiz={quiz} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-10 text-muted-foreground"
          >
            No quizzes found matching your criteria.
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}