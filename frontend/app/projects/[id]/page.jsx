'use client';

import { getProject } from '@/services/projects';
import DOMPurify from 'dompurify';
import Cookies from 'js-cookie';
import { marked } from 'marked';
import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from "sonner"
import { motion } from 'framer-motion';
import { useUser } from '@/context/userContext';

export default function BlogDetailPage({ params }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get("token");
  const pathname = usePathname();
  const { dark } = useUser();

  useEffect(() => {
    if (!token) {
      toast.warning("Please login to continue" );
      router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
  }, [])

  const fetchProject = async (id) => {
    try {
      const data = await getProject(id, token);
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  // Loading animation variants
  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={loadingVariants}
          className="w-full max-w-4xl px-4 sm:px-6 py-8"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="h-6 w-24 bg-muted rounded mb-6"
              variants={itemVariants}
            />
            <motion.div
              className="h-10 w-full bg-muted rounded mb-4"
              variants={itemVariants}
            />
            <motion.div
              className="h-4 w-3/4 bg-muted rounded mb-6"
              variants={itemVariants}
            />
            <motion.div
              className="h-4 w-48 bg-muted rounded"
              variants={itemVariants}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="h-4 w-full bg-muted rounded"
              />
            ))}
            <motion.div className="h-4 w-2/3 bg-muted rounded" variants={itemVariants} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>Project not found</p>
        </motion.div>
      </div>
    );
  }

  const htmlContent = DOMPurify.sanitize(marked.parse(project.content || ""));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-background text-foreground">
        <Head>
          <title>{project.title} | ScalarLearn</title>
        </Head>

        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => router.back()}
              className="flex items-center text-primary/80 cursor-pointer mb-6 hover:text-primary"
            >
              ← Back to Projects
            </button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={loadingVariants}
            className="mb-8"
          >
            <motion.h1
              className="text-3xl font-bold mb-4"
              variants={itemVariants}
            >
              {project.title}
            </motion.h1>
            <motion.p
              className="text-muted-foreground mb-4"
              variants={itemVariants}
            >
              {project.description}
            </motion.p>
            <motion.div
              className="flex items-center text-muted-foreground mb-6"
              variants={itemVariants}
            >
              <span>{new Date(project.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </motion.div>
          </motion.div>

          <motion.article
            className="prose prose-invert max-w-none [&_*]:text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </motion.article>
        </main>
      </div>
    </motion.div>
  );
}