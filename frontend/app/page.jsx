"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, BookOpen, FileText, CheckCircle, Users } from "lucide-react"
import Image from "next/image"
import { useUser } from "@/context/userContext"
import { motion } from "framer-motion"

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
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

export default function Home() {
  const { dark } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex items-center justify-center text-center sm:text-left h-[100vh] sm:h-full bg-gradient-to-r from-primary/10 to-primary/5 pb-40 sm:py-20 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="space-y-6">
                <h1 className="text-5xl font-semibold lg:text-6xl lg:font-bold sm:tracking-tight">
                  Elevate Your <span className="text-primary">Learning</span> Journey
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg">
                  Access comprehensive courses with interactive quizzes and reading materials tailored for engineering students and professionals.
                </p>
                <motion.div
                  variants={containerVariants}
                  className="flex flex-wrap gap-4 justify-center sm:justify-normal"
                >
                  <motion.div variants={itemVariants}>
                    <Button size="lg" asChild>
                      <Link href="/courses">
                        Explore Courses <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden items-center pb-10 justify-center sm:flex opacity-88"
              >
                <Image
                  src={dark ? "/logo_light.png" : "/logo_dark.png"}
                  alt="Logo"
                  width={380}
                  height={380}
                  priority
                />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-bold text-center mb-12"
            >
              Platform Features
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <BookOpen className="h-6 w-6 text-primary" />,
                  title: "Structured Courses",
                  desc: "Learn with well-organized courses featuring reading materials and quizzes."
                },
                {
                  icon: <CheckCircle className="h-6 w-6 text-primary" />,
                  title: "Interactive Quizzes",
                  desc: "Test your knowledge with quizzes and get instant feedback on your performance."
                },
                {
                  icon: <FileText className="h-6 w-6 text-primary" />,
                  title: "Progress Tracking",
                  desc: "Track your learning progress and see how far you've come in each course."
                },
                {
                  icon: <Users className="h-6 w-6 text-primary" />,
                  title: "Expert Instructors",
                  desc: "Learn from experienced instructors who create quality educational content."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                  whileHover={{ y: -5 }}
                >
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ScalarLearn Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-bold mb-4"
            >
              Why Choose ScalarLearn?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
            >
              ScalarLearn offers a unique combination of interactive learning, community-driven projects, and expert insights. Here's why you should join us:
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Comprehensive Resources",
                  desc: "Get access to a variety of study materials, industry reports, and expert blogs tailored to your needs."
                },
                {
                  title: "Hands-On Learning",
                  desc: "Participate in interactive quizzes and projects to apply your knowledge in real-world scenarios."
                },
                {
                  title: "Community Collaboration",
                  desc: "Connect with like-minded professionals, share ideas, and collaborate on semiconductor-related projects."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to enhance your skills?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our community of engineering professionals and students to access exclusive content and track your
              progress.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" asChild>
                <Link href="/auth?mode=signup">Sign Up Now</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}