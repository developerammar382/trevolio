'use client';

import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface ReviewsSectionProps {
    productId: number;
}

export default function ReviewsSection({ productId }: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews`);
            const data = await response.json();
            setReviews(data.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleReviewSubmitted = () => {
        fetchReviews();
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-20">
            <div className="border-t border-slate-200 pt-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Customer Reviews</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="font-semibold text-lg text-accent">{averageRating}</span>
                            <span>out of 5 stars</span>
                            <span className="text-slate-400">•</span>
                            <span>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ReviewList reviews={reviews} loading={loading} />
                    </div>
                    <div>
                        <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />
                    </div>
                </div>
            </div>
        </div>
    );
}
