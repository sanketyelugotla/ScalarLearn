'use client';

import ResourceCard from '@/components/ResourceCard';
import { getResources } from '@/services/resources';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '../loading';
import { toast } from "sonner"
import { motion } from 'framer-motion';
import { useUser } from '@/context/userContext';

// Animation variants for consistent transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export default function Resources() {
  const [resources, setResources] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all categories");
  const [selectedFileType, setSelectedFileType] = useState("all types");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const token = Cookies.get("token");
  const pathname = usePathname();

  // Format labels (e.g., "lecture-notes" -> "Lecture Notes")
  const formatLabel = (str) =>
    str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources(token);
        const resources = data.resources;
        setResources(resources);

        const uniqueCategories = Array.from(
          new Set(resources.map(r => r.typeOfMaterial?.toLowerCase().trim()))
        ).filter(Boolean);

        const uniqueFileTypes = Array.from(
          new Set(resources.map(r => r.typeOfFile?.toLowerCase().trim()))
        ).filter(Boolean);

        setCategories(uniqueCategories);
        setFileTypes(uniqueFileTypes);
      } catch (err) {
        console.error(err);
        if (err.message === 'Network Error') {
          setError("⚠️ Network Error: Please check your internet connection or try again later.");
        } else if (err.message === "Invalid or expired token.") {
          toast.warning("Please login to continue" );
          router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
        } else {
          setError(`⚠️ ${err.message}`);
        }
      }
    };
    fetchResources();
  }, []);

  if (!resources && !error) {
    return <Loading />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="p-6 text-red-500 font-semibold bg-red-100 rounded-md max-w-screen-md mx-auto mt-6"
      >
        {error}
      </motion.div>
    );
  }

  const filteredResources = resources.filter(resource => {
    const categoryMatch =
      selectedCategory === "all categories" ||
      resource.typeOfMaterial?.toLowerCase().trim() === selectedCategory.toLowerCase().trim();

    const typeMatch =
      selectedFileType === "all types" ||
      resource.typeOfFile?.toLowerCase().trim() === selectedFileType.toLowerCase().trim();

    const searchMatch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && typeMatch && searchMatch;
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-background min-h-screen"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        className="relative bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-10 md:px-16 lg:px-20 py-10"
      >
        <motion.div variants={itemVariants} className="max-w-screen-xl mx-auto">
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Access a wide range of study materials, lecture notes, question papers and more to enhance your learning experience.
          </p>
        </motion.div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        variants={containerVariants}
        className="max-w-screen-xl mx-auto px-4 sm:px-10 py-10"
      >
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {/* Search */}
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            placeholder="Search resources..."
            className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filters */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 gap-4"
          >
            {/* Category Dropdown */}
            <motion.select
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="w-full p-3 pr-8 rounded-md border border-border bg-background text-foreground shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all categories">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {formatLabel(cat)}
                </option>
              ))}
            </motion.select>

            {/* File Type Dropdown */}
            <motion.select
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className="w-full p-3 pr-8 rounded-md border border-border bg-background text-foreground shadow-sm"
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
            >
              <option value="all types">All Types</option>
              {fileTypes.map((type, idx) => (
                <option key={idx} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </motion.select>
          </motion.div>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource._id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ResourceCard resource={resource} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}