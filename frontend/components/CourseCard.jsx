"use client";
import { motion } from "framer-motion";
import { BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course._id}`}>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-container-background border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all cursor-pointer h-full flex flex-col"
      >
        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="w-full h-40 mb-4 rounded-lg overflow-hidden bg-secondary">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Category Badge */}
        {course.category && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
              {course.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow">
          {course.description}
        </p>

        {/* Footer Info */}
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
    </Link>
  );
}
