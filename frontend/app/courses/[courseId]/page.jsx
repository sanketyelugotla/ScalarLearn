"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/userContext";
import { enrollInCourse, getCourse } from "@/services/course";
import { getCourseLectures } from "@/services/lecture";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import { BookOpen, CheckCircle, FileText, Lock, PlayCircle, Users } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (params.courseId) {
      fetchCourseDetails();
    }
  }, [params.courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Please login to enroll");
        router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const courseData = await getCourse(params.courseId, token);
      courseData.course.isEnrolled = courseData.isEnrolled
      setCourse(courseData.course);
      if (token && courseData.course.isEnrolled) {
        const lecturesData = await getCourseLectures(params.courseId, token);
        console.log(lecturesData)
        setLectures(lecturesData.lectures || []);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const token = Cookies.get("token");
    if (!token) {
      toast.error("Please login to enroll");
      router.push(`/auth?mode=login&redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(params.courseId, token);
      toast.success("Successfully enrolled in course!");
      fetchCourseDetails();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast.error(error.message || "Failed to enroll");
    } finally {
      setEnrolling(false);
    }
  };

  const handleLectureClick = (lectureId, isAccessible) => {
    // isAccessible = true
    if (isAccessible) {
      router.push(`/courses/${params.courseId}/lectures/${lectureId}`);
    } else {
      toast.warning("Complete previous lectures to unlock this one");
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
        <p className="text-lg text-muted-foreground">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-container-background border border-border rounded-lg p-8 mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {course.category && (
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4">
                  {course.category}
                </span>
              )}
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.totalLectures || 0} lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolledStudents?.length || 0} students</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {!course.isEnrolled && user?.role === "student" && (
                <Button
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </Button>
              )}
              {course.isEnrolled && (
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Enrolled</p>
                  {course.progress && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {course.progress.completedLectures}/{course.progress.totalLectures} lectures completed
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Lectures List */}
        {course.isEnrolled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <div className="space-y-3">
              {lectures.map((lecture, index) => (
                <motion.div
                  key={lecture._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleLectureClick(lecture._id, true)}
                  className={`bg-container-background border border-border rounded-lg p-4 flex items-center justify-between ${lecture.isAccessible ? "cursor-pointer hover:border-primary transition-all" : "opacity-60"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${lecture.completed ? "bg-green-500/10" : "bg-primary/10"
                      }`}>
                      {lecture.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : lecture.isAccessible ? (
                        lecture.type === "quiz" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{lecture.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">{lecture.type}</p>
                    </div>
                  </div>
                  {lecture.isAccessible && !lecture.completed && (
                    <PlayCircle className="h-5 w-5 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!course.isEnrolled && user?.role === "student" && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Enroll in this course to view the lectures</p>
          </div>
        )}
      </div>
    </div>
  );
}
