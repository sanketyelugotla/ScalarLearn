import React from 'react'
import Image from 'next/image';
import Link from 'next/link';
const FeaturedBlogCard = ({ blog }) => {
    return (
        <div className="flex flex-col lg:flex-row border border-border rounded-lg overflow-hidden shadow-sm bg-container-background mb-10">
            <Image
                src={blog.image}
                alt="Blog"
                width={500}
                height={300}
                unoptimized
                className="w-full lg:w-1/2 object-cover"
            />
            <div className="p-6 flex flex-col justify-between">
                <p className="px-3 py-1 w-fit rounded-full bg-blue-500 text-white text-sm font-medium mb-2">
                    {blog.type}
                </p>
                <h3 className="text-2xl font-bold mb-2">
                    {blog.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                    {blog.description}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                    {blog.author.name} · {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {blog.durationRead} min read
                </p>

                <button className="mt-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition w-fit cursor-pointer">
                    <Link href={`/blogs/${blog._id}`} >
                        Read Full Article
                    </Link>
                </button>
            </div>
        </div>
    );
};



export default FeaturedBlogCard
