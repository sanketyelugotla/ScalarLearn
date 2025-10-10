"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, FileText, HelpCircle, Plus, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import { createLecture } from "@/services/lecture";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CreateLecturePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;
  
  const [lectureType, setLectureType] = useState("reading"); // "reading" or "quiz"
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contentLink: "",
  });
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size should not exceed 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Please enter a lecture title");
      return;
    }

    if (lectureType === "quiz") {
      // Validate quiz questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText) {
          toast.error(`Please enter text for question ${i + 1}`);
          return;
        }
        if (q.options.some(opt => !opt)) {
          toast.error(`Please fill all options for question ${i + 1}`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const lectureFormData = new FormData();
      lectureFormData.append("title", formData.title);
      lectureFormData.append("type", lectureType);

      if (lectureType === "reading") {
        if (formData.content) lectureFormData.append("content", formData.content);
        if (formData.contentLink) lectureFormData.append("contentLink", formData.contentLink);
        if (file) lectureFormData.append("file", file);
      } else {
        // Transform questions: send the correct answer as string instead of index
        const payloadQuestions = questions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.options[q.correctAnswer] // <-- This is the key change
        }));
        lectureFormData.append("questions", JSON.stringify(payloadQuestions));
      }

      await createLecture(courseId, lectureFormData, token);

      toast.success("Lecture created successfully!");
      router.push(`/instructor/courses/${courseId}`);
    } catch (error) {
      console.error("Error creating lecture:", error);
      toast.error(error.message || "Failed to create lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Add New Lecture</h1>
              <p className="text-muted-foreground">Create a reading or quiz lecture</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lecture Type Selection */}
            <div className="bg-container-background border border-border rounded-lg p-6">
              <label className="block text-sm font-medium mb-3">
                Lecture Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLectureType("reading")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    lectureType === "reading"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <FileText className={`h-8 w-8 mx-auto mb-2 ${lectureType === "reading" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-semibold">Reading</p>
                  <p className="text-xs text-muted-foreground mt-1">Text content or file</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setLectureType("quiz")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    lectureType === "quiz"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <HelpCircle className={`h-8 w-8 mx-auto mb-2 ${lectureType === "quiz" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-semibold">Quiz</p>
                  <p className="text-xs text-muted-foreground mt-1">Multiple choice questions</p>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="bg-container-background border border-border rounded-lg p-6">
              <label className="block text-sm font-medium mb-2">
                Lecture Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Introduction to Variables"
                className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Reading Content */}
            {lectureType === "reading" && (
              <div className="bg-container-background border border-border rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-semibold">Reading Content</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content Text
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter the reading content here..."
                    rows={8}
                    className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    External Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="contentLink"
                    value={formData.contentLink}
                    onChange={handleChange}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: PDF, Word documents, Images (Max 10MB)
                  </p>
                  {file && (
                    <p className="text-sm text-primary mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quiz Questions */}
            {lectureType === "quiz" && (
              <div className="bg-container-background border border-border rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Quiz Questions</h3>
                  <Button type="button" onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <label className="block text-sm font-medium">
                        Question {qIndex + 1} <span className="text-red-500">*</span>
                      </label>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <input
                      type="text"
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                      placeholder="Enter your question"
                      className="w-full px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Options</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswer === oIndex}
                            onChange={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                            className="h-4 w-4"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1 px-4 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Select the radio button for the correct answer
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Lecture"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
