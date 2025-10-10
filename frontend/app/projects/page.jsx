'use client';
import ProjectCard from '@/components/ProjectCard';
import { getProjects } from '@/services/projects';
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import Loading from '../loading';

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        const uniqueCategories = Array.from(new Set(data.map(p => p.category))).filter(Boolean);
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
        if (err.message === 'Network Error') {
          setError("⚠️ Network Error: Please check your internet connection or try again later.");
        } else {
          setError(`⚠️ ${err.message}`);
        }
      }
    };
    fetchProjects();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Loading state
  if (!projects && !error) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }

  // Error state
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

  // Filter projects by category and search query
  const filteredProjects = projects?.filter(project => {
    const matchesCategory = selectedCategory === "All Categories" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Header - Matching Blogs page styling */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 px-4 sm:px-10 md:px-16 lg:px-20 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-screen-xl mx-auto"
          >
            <h1 className="text-4xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-2">
              Explore engineering projects shared by the community and contribute your own projects to showcase your skills.
            </p>
          </motion.div>
        </div>

        {/* Main Content - Keeping original layout structure but with Blogs styling */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-10 py-10">
          {/* Search and Filters - Matching Blogs styling */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"
          >
            <motion.div variants={item} className="w-full sm:w-3/4">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>
            <motion.div variants={item} className="w-full sm:w-1/4">
              <select
                className="w-full p-3 rounded-md border border-border bg-background text-foreground shadow-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </motion.div>
          </motion.div>

          {/* Call to Action - Styled like Blogs but keeping original layout */}
          {/* commented this will release in v2 */}

          {/* <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 mb-10 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-border">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Have a project to share?</h2>
              <p className="text-muted-foreground">
                Showcase your engineering project to the community and get feedback from peers and experts.
              </p>
            </div>
            <button className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition whitespace-nowrap cursor-pointer">
              Submit your project
            </button>
          </div> */}

          {/* Projects Grid - Keeping original layout but with responsive grid like Blogs */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={index}
                variants={item}
                whileHover={{ y: -5 }}
              >
                <ProjectCard
                  project={project}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}