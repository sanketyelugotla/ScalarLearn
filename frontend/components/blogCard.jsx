import Link from 'next/link';
import React from 'react';
import { CiUser } from 'react-icons/ci';

export default function BlogCard({ blog }) {
    return (
        <div className="border border-border rounded-lg bg-container-background p-4 shadow-sm hover:shadow-md transition flex flex-col">
            {/* Blog Image - Added at the top */}
            <img
                src={blog.image}
                alt={blog.title}
                
                className="w-full h-48 object-cover rounded-md mb-4"
            />

            {/* Blog Type Badge - Moved below image */}
            <span className={`px-3 py-1 rounded-full text-white text-xs font-medium w-fit mb-3
                ${blog.type === 'Career' ? 'bg-purple-500' :
                    blog.type === 'Technical' ? 'bg-green-600' : 'bg-blue-500'}`}>
                {blog.type}
            </span>

            {/* Blog Title - Larger and more prominent */}
            <h2 className="font-bold text-xl text-foreground mb-3">
                {blog.title}
            </h2>

            {/* Blog Description - More space and larger text */}
            <p className="text-base text-muted-foreground mb-6">
                {blog.description}
            </p>

            {/* Author + Date + Read Time - Adjusted layout */}
            <div className="flex justify-between items-center mt-auto text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CiUser className="text-base" />
                    <span>{blog.author?.name || "Unknown Author"}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{blog.durationRead} min read</span>
                </div>
            </div>

            {/* Read More link - Added as shown in image */}
            <div className="mt-4 flex justify-between items-center">
                <Link href={`/blogs/${blog._id}`} className="text-primary/80 hover:text-primary font-medium">
                    Read More →
                </Link>
            </div>
        </div>
    );
}