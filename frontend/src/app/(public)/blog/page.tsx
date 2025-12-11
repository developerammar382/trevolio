'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    image?: string;
    created_at: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await api.get('/blogs');
                setPosts(res.data.data || res.data);
            } catch (error) {
                console.error('Failed to fetch blog posts', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Our Blog</h1>

            {posts.length === 0 ? (
                <div className="text-center text-gray-500">No blog posts found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48">
                                {/* Placeholder for blog image */}
                            </div>
                            <div className="p-6">
                                <div className="text-sm text-gray-500 mb-2">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </div>
                                <h2 className="text-xl font-bold mb-2 text-gray-800">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <Link href={`/blog/${post.slug}`} className="text-indigo-600 font-medium hover:text-indigo-800">
                                    Read More →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
