'use client';

import { useState } from 'react';
import { FiStar, FiImage, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface ReviewFormProps {
    productId: number;
    onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
    const { isAuthenticated } = useAuth();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (images.length + files.length > 5) {
            toast.error('You can upload maximum 5 images');
            return;
        }

        // Validate file size (5MB max per image)
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.error('Each image must be less than 5MB');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const invalidTypes = files.filter(file => !validTypes.includes(file.type));
        if (invalidTypes.length > 0) {
            toast.error('Only JPG, JPEG, and PNG images are allowed');
            return;
        }

        setImages([...images, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('product_id', productId.toString());
            formData.append('rating', rating.toString());
            formData.append('comment', comment);

            // Append images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            await api.post('/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Review submitted! It will appear after admin approval.');
            setRating(0);
            setComment('');
            setImages([]);
            setImagePreviews([]);
            onReviewSubmitted();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <FiStar className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Share Your Experience</h3>
                <p className="text-slate-600 mb-4">Please login to leave a review</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FiStar className="w-6 h-6 text-accent" />
                Write a Review
            </h3>

            {/* Star Rating */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Your Rating *</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-all hover:scale-125 active:scale-110"
                        >
                            <FiStar
                                className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                                    ? 'fill-accent text-accent drop-shadow-md'
                                    : 'text-slate-300 hover:text-slate-400'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                        {rating === 5 ? '⭐ Excellent!' : rating === 4 ? '👍 Good' : rating === 3 ? '😊 Average' : rating === 2 ? '😐 Below Average' : '👎 Poor'}
                    </p>
                )}
            </div>

            {/* Comment */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Your Review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Share your experience with this product... What did you like? What could be improved?"
                />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Add Photos (Optional)
                    <span className="text-xs font-normal text-slate-500 ml-2">Max 5 images, 5MB each</span>
                </label>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mb-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group">
                                <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Button */}
                {images.length < 5 && (
                    <label className="flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <FiImage className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                                {images.length === 0 ? 'Click to upload images' : `Add more (${5 - images.length} remaining)`}
                            </span>
                            <p className="text-xs text-slate-500 mt-1">JPG, JPEG or PNG • Max 5MB</p>
                        </div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            <button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
                {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                    </span>
                ) : 'Submit Review'}
            </button>
        </form>
    );
}
