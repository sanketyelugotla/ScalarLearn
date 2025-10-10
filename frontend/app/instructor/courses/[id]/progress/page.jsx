"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import Cookies from "js-cookie";
import { getCourse, getCourseProgress } from "@/services/course";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CourseProgressPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [course, setCourse] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, [courseId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      const [courseData, progressResult] = await Promise.all([
        getCourse(courseId, token),
        getCourseProgress(courseId, token)
      ]);
      
      setCourse(courseData.course);
      setProgressData(progressResult.progress || []);
      setStats(progressResult.stats || {});
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage === 0) return "text-gray-500";
    if (percentage < 50) return "text-red-500";
    if (percentage < 100) return "text-yellow-500";
    return "text-green-500";
  };

  const getProgressBg = (percentage) => {
    if (percentage === 0) return "bg-gray-500/10";
    if (percentage < 50) return "bg-red-500/10";
    if (percentage < 100) return "bg-yellow-500/10";
    return "bg-green-500/10";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading progress data...</p>
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
        >
          <Button
            variant="ghost"
            onClick={() => router.push(`/instructor/courses/${courseId}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Student Progress</h1>
            <p className="text-muted-foreground">{course?.title}</p>
          </div>

          {/* Statistics */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-container-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </div>

              <div className="bg-container-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedStudents}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-container-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgressStudents}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-container-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Student Progress List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-container-background border border-border rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-6">Students</h2>

            {progressData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No students enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressData.map((progress, index) => (
                  <motion.div
                    key={progress._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-border rounded-lg p-4 hover:border-primary transition-all cursor-pointer"
                    onClick={() => setSelectedStudent(selectedStudent?._id === progress._id ? null : progress)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {progress.student?.name?.charAt(0).toUpperCase() || "S"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{progress.student?.name || "Unknown Student"}</h3>
                          <p className="text-sm text-muted-foreground">{progress.student?.email}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getProgressColor(progress.progressPercentage)}`}>
                          {progress.progressPercentage}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {progress.completedLectures}/{progress.totalLectures} lectures
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress.progressPercentage === 0 ? "bg-gray-500" :
                          progress.progressPercentage < 50 ? "bg-red-500" :
                          progress.progressPercentage < 100 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${progress.progressPercentage}%` }}
                      />
                    </div>

                    {/* Expanded Details */}
                    {selectedStudent?._id === progress._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 pt-4 border-t border-border space-y-2"
                      >
                        <h4 className="font-semibold mb-3">Lecture Progress:</h4>
                        {progress.lecturesProgress?.map((lp, lpIndex) => (
                          <div key={lpIndex} className="flex items-center justify-between text-sm py-2 px-3 rounded bg-muted">
                            <div className="flex items-center gap-2">
                              {lp.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span>{lp.lecture?.title || `Lecture ${lpIndex + 1}`}</span>
                              {lp.lecture?.type === "quiz" && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                  Quiz
                                </span>
                              )}
                            </div>
                            {lp.lecture?.type === "quiz" && lp.bestScore > 0 && (
                              <span className="text-primary font-semibold">
                                Best Score: {lp.bestScore}%
                              </span>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
