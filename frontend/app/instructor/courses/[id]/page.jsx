"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Plus, Edit, Trash2, Users, BarChart } from "lucide-react";
import Cookies from "js-cookie";
import { getCourse, deleteCourse } from "@/services/course";
import { getCourseLectures, deleteLecture } from "@/services/lecture";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ManageCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      const [courseData, lecturesData] = await Promise.all([
        getCourse(courseId, token),
        getCourseLectures(courseId, token)
      ]);
      
      setCourse(courseData.course);
      setLectures(lecturesData.lectures || []);
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (!confirm("Are you sure you want to delete this lecture?")) return;

    try {
      const token = Cookies.get("token");
      await deleteLecture(lectureId, token);
      toast.success("Lecture deleted successfully");
      fetchCourseData();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error(error.message || "Failed to delete lecture");
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("Are you sure you want to delete this entire course? This action cannot be undone.")) return;

    try {
      const token = Cookies.get("token");
      await deleteCourse(courseId, token);
      toast.success("Course deleted successfully");
      router.push("/instructor/dashboard");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error.message || "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Course not found</p>
          <Button onClick={() => router.push("/instructor/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/instructor/dashboard")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Course Header */}
          <div className="bg-container-background border border-border rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {course.category && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
                    {course.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-muted-foreground mb-4">{course.description}</p>
                
                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{lectures.length} lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>{course.students?.length || 0} students</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/instructor/courses/${courseId}/progress`)}
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  View Progress
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteCourse}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </div>
            </div>
          </div>

          {/* Lectures Section */}
          <div className="bg-container-background border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Lectures</h2>
              <Button onClick={() => router.push(`/instructor/courses/${courseId}/lectures/create`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Lecture
              </Button>
            </div>

            {lectures.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No lectures yet</p>
                <Button onClick={() => router.push(`/instructor/courses/${courseId}/lectures/create`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Lecture
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {lectures.map((lecture, index) => (
                  <motion.div
                    key={lecture._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{lecture.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                            {lecture.type === "reading" ? "Reading" : "Quiz"}
                          </span>
                          {lecture.type === "quiz" && (
                            <span>{lecture.questions?.length || 0} questions</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/instructor/courses/${courseId}/lectures/${lecture._id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLecture(lecture._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
