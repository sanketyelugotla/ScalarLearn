"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Users, Plus } from "lucide-react";
import Cookies from "js-cookie";
import { getInstructorCourses } from "@/services/course";
import { useUser } from "@/context/userContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function InstructorDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth?mode=login");
      return;
    }
    if (user.role !== "instructor") {
      toast.error("Access denied. Instructors only.");
      router.push("/");
      return;
    }
    fetchInstructorCourses();
  }, [user]);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const data = await getInstructorCourses(token);
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-lg text-muted-foreground">Manage your courses and track student progress</p>
          </div>
          <Button onClick={() => router.push("/instructor/courses/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-container-background border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-container-background border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </div>

          <div className="bg-container-background border border-border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courses.reduce((sum, c) => sum + (c.totalLectures || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Lectures</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Courses */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
          
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-container-background border border-border rounded-lg">
              <p className="text-lg text-muted-foreground mb-4">You haven't created any courses yet</p>
              <Button onClick={() => router.push("/instructor/courses/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Course
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/instructor/courses/${course._id}`)}
                  className="bg-container-background border border-border rounded-lg p-6 cursor-pointer hover:border-primary transition-all"
                >
                  {course.category && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
                      {course.category}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.totalLectures || 0} lectures</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
