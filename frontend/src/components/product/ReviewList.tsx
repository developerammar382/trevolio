'use client';

import { useState } from 'react';
import { FiStar, FiThumbsUp, FiCheckCircle, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Image from 'next/image';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
    id: number;
    user: {
        name: string;
    };
    rating: number;
    comment: string;
    created_at: string;
    images?: string[];
    is_verified_purchase?: boolean;
    helpful_count?: number;
}

interface ReviewListProps {
    reviews: Review[];
    loading?: boolean;
}

export default function ReviewList({ reviews, loading }: ReviewListProps) {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [votedReviews, setVotedReviews] = useState<Set<number>>(new Set());

    const openGallery = (images: string[], startIndex: number = 0) => {
        setSelectedImages(images);
        setCurrentImageIndex(startIndex);
    };

    const closeGallery = () => {
        setSelectedImages([]);
        setCurrentImageIndex(0);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
    };

    const handleHelpful = async (reviewId: number) => {
        if (votedReviews.has(reviewId)) {
            toast.error('You have already voted on this review');
            return;
        }

        try {
            await api.post(`/reviews/${reviewId}/helpful`);
            toast.success('Thank you for your feedback!');
            setVotedReviews(new Set([...votedReviews, reviewId]));
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        </div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <FiStar className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3>
                <p className="text-slate-600">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {reviews.map((review) => {
                    const fullImageUrls = (review.images || []).map(
                        img => `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/storage/${img}`
                    );

                    return (
                        <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {review.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900">{review.user.name}</h4>
                                            {review.is_verified_purchase && (
                                                <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                    <FiCheckCircle className="w-3 h-3" />
                                                    Verified Purchase
                                                </span>
                                            )}
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FiStar
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= review.rating
                                                        ? 'fill-accent text-accent'
                                                        : 'text-slate-300'
                                                        }`}
                                                />
                                            ))}
                                            <span className="text-sm text-slate-500 ml-2">
                                                {review.rating}.0
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Date */}
                                <span className="text-sm text-slate-500">
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-slate-700 leading-relaxed mb-4">{review.comment}</p>
                            )}

                            {/* Review Images */}
                            {fullImageUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {fullImageUrls.map((imageUrl, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 hover:scale-105 transition-all group"
                                            onClick={() => openGallery(fullImageUrls, index)}
                                        >
                                            <Image
                                                src={imageUrl}
                                                alt={`Review image ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Helpfulness Voting */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <span className="text-sm text-slate-600 font-medium">Was this helpful?</span>
                                <button
                                    onClick={() => handleHelpful(review.id)}
                                    disabled={votedReviews.has(review.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 hover:border-emerald-200"
                                >
                                    <FiThumbsUp className="w-4 h-4" />
                                    <span>Helpful</span>
                                    {(review.helpful_count || 0) > 0 && (
                                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                            {review.helpful_count}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Enhanced Image Gallery Modal with Slider */}
            {selectedImages.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center backdrop-blur-lg animate-fadeIn"
                    onClick={closeGallery}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeGallery}
                        className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 backdrop-blur-sm transition-all hover:scale-110 hover:rotate-90 z-30 group"
                        aria-label="Close gallery"
                    >
                        <FiX className="w-6 h-6 transition-transform" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-semibold z-30 shadow-lg">
                        {currentImageIndex + 1} / {selectedImages.length}
                    </div>

                    {/* Navigation Arrows */}
                    {selectedImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 backdrop-blur-sm transition-all hover:scale-110 z-30 group"
                                aria-label="Previous image"
                            >
                                <FiChevronLeft className="w-7 h-7 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-4 backdrop-blur-sm transition-all hover:scale-110 z-30 group"
                                aria-label="Next image"
                            >
                                <FiChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}

                    {/* Main Image Container */}
                    <div
                        className="relative max-w-6xl max-h-[85vh] w-full h-full mx-4 flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image with smooth transition */}
                        <div className="relative w-full h-full animate-slideIn" key={currentImageIndex}>
                            <Image
                                src={selectedImages[currentImageIndex]}
                                alt={`Review image ${currentImageIndex + 1}`}
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>

                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30 pointer-events-none rounded-2xl" />
                    </div>

                    {/* Thumbnail Strip */}
                    {selectedImages.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md p-3 rounded-2xl z-30 max-w-2xl overflow-x-auto">
                            {selectedImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${idx === currentImageIndex
                                            ? 'border-white scale-110 shadow-lg'
                                            : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-sm font-medium z-30 flex items-center gap-2 shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Click outside to close</span>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </>
    );
}
