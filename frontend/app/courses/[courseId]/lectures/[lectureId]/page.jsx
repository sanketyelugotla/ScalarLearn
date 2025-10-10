"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, FileText, ExternalLink } from "lucide-react";
import Cookies from "js-cookie";
import { getLecture, completeReading, submitQuiz, getCourseLectures } from "@/services/lecture";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function LectureViewPage() {
  const params = useParams();
  const router = useRouter();
  const [lecture, setLecture] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    if (params.lectureId && params.courseId) {
      fetchLecture();
      fetchCourseLectures();
    }
  }, [params.lectureId, params.courseId]);

  const fetchLecture = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const data = await getLecture(params.lectureId, token);
      setLecture(data.lecture);
    } catch (error) {
      console.error("Error fetching lecture:", error);
      toast.error(error.message || "Failed to load lecture");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseLectures = async () => {
    try {
      const token = Cookies.get("token");
      const data = await getCourseLectures(params.courseId, token);
      setLectures(data.lectures || []);
    } catch (error) {
      console.error("Error fetching lectures:", error);
    }
  };

  const handleCompleteReading = async () => {
    try {
      setSubmitting(true);
      const token = Cookies.get("token");
      const result = await completeReading(params.lectureId, token);
      toast.success("Lecture completed!");
      
      // Navigate to next lecture if available
      const currentIndex = lectures.findIndex(l => l._id === params.lectureId);
      if (currentIndex < lectures.length - 1) {
        const nextLecture = lectures[currentIndex + 1];
        router.push(`/courses/${params.courseId}/lectures/${nextLecture._id}`);
      } else {
        router.push(`/courses/${params.courseId}`);
      }
    } catch (error) {
      console.error("Error completing lecture:", error);
      toast.error(error.message || "Failed to complete lecture");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length !== lecture.questions.length) {
      toast.warning("Please answer all questions");
      return;
    }

    try {
      setSubmitting(true);
      const token = Cookies.get("token");
      const answers = lecture.questions.map((_, index) => ({
        selectedOption: selectedAnswers[index]
      }));
      
      const result = await submitQuiz(params.lectureId, answers, token);
      setQuizResult(result);
      
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}%`);
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%. Passing score: ${result.passingScore}%`);
      }
      
      // Refresh lectures to update progress
      await fetchCourseLectures();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error(error.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    const currentIndex = lectures.findIndex(l => l._id === params.lectureId);
    if (currentIndex < lectures.length - 1) {
      const nextLecture = lectures[currentIndex + 1];
      router.push(`/courses/${params.courseId}/lectures/${nextLecture._id}`);
    } else {
      router.push(`/courses/${params.courseId}`);
    }
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
    setSelectedAnswers({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Lecture not found</p>
      </div>
    );
  }

  const renderContent = () => {
    if (lecture.content) {
      const html = marked.parse(lecture.content);
      const clean = DOMPurify.sanitize(html);
      return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${params.courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course
        </Button>

        {/* Lecture Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-container-background border border-border rounded-lg p-8"
        >
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-4 capitalize">
              {lecture.type}
            </span>
            <h1 className="text-3xl font-bold mb-4">{lecture.title}</h1>
          </div>

          {/* Reading Lecture */}
          {lecture.type === "reading" && (
            <div>
              {renderContent()}
              
              {lecture.contentLink && (
                <div className="mt-6">
                  <a
                    href={lecture.contentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View External Resource
                  </a>
                </div>
              )}

              {lecture.fileUrl && (
                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Attached File:</p>
                  <a
                    href={`http://localhost:8001${lecture.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                  >
                    <FileText className="h-4 w-4" />
                    {lecture.fileName || "Download File"}
                  </a>
                </div>
              )}

              <div className="mt-8">
                <Button
                  onClick={handleCompleteReading}
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Completing..." : "Mark as Complete"}
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Quiz Lecture */}
          {lecture.type === "quiz" && !quizResult && (
            <div>
              <p className="text-muted-foreground mb-6">
                Passing Score: {lecture.passingScore}%
              </p>

              <div className="space-y-6">
                {lecture.questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-6 bg-secondary rounded-lg">
                    <p className="font-semibold mb-4">
                      {qIndex + 1}. {question.questionText}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <label
                          key={oIndex}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-background transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={option}
                            checked={selectedAnswers[qIndex] === option}
                            onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: option })}
                            className="h-4 w-4"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={submitting || Object.keys(selectedAnswers).length !== lecture.questions.length}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              </div>
            </div>
          )}

          {/* Quiz Result */}
          {quizResult && (
            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${quizResult.passed ? "bg-green-500/10 border border-green-500" : "bg-red-500/10 border border-red-500"}`}>
                <h2 className="text-2xl font-bold mb-4">
                  {quizResult.passed ? "🎉 Congratulations! You Passed!" : "📝 Quiz Completed"}
                </h2>
                <div className="space-y-2 mb-4">
                  <p className="text-xl font-semibold">
                    Score: {quizResult.score}%
                  </p>
                  <p className="text-lg">
                    {quizResult.correctAnswers} out of {quizResult.totalQuestions} questions correct
                  </p>
                  <p className="text-muted-foreground">
                    Passing Score: {quizResult.passingScore}%
                  </p>
                </div>
                <p className={`font-medium ${quizResult.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {quizResult.message}
                </p>
              </div>

              {/* Detailed Results */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Detailed Results</h3>
                {lecture.questions.map((question, qIndex) => {
                  const result = quizResult.gradedAnswers[qIndex];
                  return (
                    <div key={qIndex} className={`p-4 rounded-lg border ${result.isCorrect ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${result.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                          {result.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <span className="text-white text-sm font-bold">✕</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-2">
                            {qIndex + 1}. {question.questionText}
                          </p>
                          <div className="space-y-2">
                            <div className={`p-2 rounded ${result.isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
                              <p className="text-sm font-medium">Your answer:</p>
                              <p className="text-sm">{result.selectedOption}</p>
                            </div>
                            {!result.isCorrect && (
                              <div className="p-2 rounded bg-green-500/10">
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Correct answer:</p>
                                <p className="text-sm">{result.correctAnswer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {quizResult.passed ? (
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="flex-1 min-w-[200px]"
                  >
                    Continue to Next Lecture
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleRetryQuiz}
                    size="lg"
                    variant="outline"
                    className="flex-1 min-w-[200px]"
                  >
                    Retry Quiz
                  </Button>
                )}
                <Button
                  onClick={() => router.push(`/courses/${params.courseId}`)}
                  size="lg"
                  variant="outline"
                  className="min-w-[200px]"
                >
                  Back to Course
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
