'use client';
import { getBlogs } from '@/services/blog';
import React, { useEffect, useState } from 'react';
import BlogCard from '@/components/blogCard';
import Loading from '../loading';
import { toast } from "sonner"
import FeaturedBlogCard from '@/components/FeaturedBlogCard';
import { motion } from 'framer-motion';
import { useUser } from '@/context/userContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function Blogs() {
  const [blogs, setBlogs] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { dark } = useUser();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getBlogs();
        setBlogs(data);
        const uniqueCategories = Array.from(new Set(data.map(q => q.type))).filter(Boolean);
        setCategories(uniqueCategories);
      } catch (err) {
        const msg = err.message || "Unknown Error";
        toast.error(msg   );

        if (msg === 'Network Error') {
          setError("⚠️ Network Error: Please check your internet connection or try again later.");
        } else {
          setError(`⚠️ ${msg}`);
        }
      }
    };
    getData();
  }, [dark]);

  if (!blogs && !error) {
    return <Loading />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 text-red-500 font-semibold bg-red-100 rounded-md max-w-screen-md mx-auto mt-6"
      >
        {error}
      </motion.div>
    );
  }

  const filteredBlogs = blogs?.filter(blog => {
    const matchesCategory = selectedCategory === "All Categories" || blog.type === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-10 md:px-16 lg:px-20 py-10"
      >
        <motion.div variants={itemVariants} className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Blogs</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with the latest news, industry trends, interview experiences, and technical insights in
            the field of VLSI and engineering.
          </p>
        </motion.div>
      </motion.section>

      {/* Search + Filters */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-screen-xl mx-auto px-4 sm:px-10 py-10"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search blogs..."
            className="w-full sm:w-3/4 p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="w-full sm:w-1/4 p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option>All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </motion.div>

        {/* Featured Blog */}
        <motion.div variants={containerVariants} className="mb-10">
          {filteredBlogs.map((blog, index) => (
            blog.isFeatured && (
              <motion.div key={index} variants={itemVariants}>
                <FeaturedBlogCard blog={blog} />
              </motion.div>
            )
          ))}
        </motion.div>

        {/* Blog Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBlogs.map((blog, index) => (
            !blog.isFeatured && (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="transition-all duration-200"
              >
                <BlogCard blog={blog} />
              </motion.div>
            )
          ))}
        </motion.div>

        {filteredBlogs.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center py-10"
          >
            <h3 className="text-xl font-medium text-muted-foreground">
              No blogs found matching your criteria
            </h3>
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}
