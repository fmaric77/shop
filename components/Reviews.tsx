import { useState } from 'react';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  verified: boolean;
}

interface ReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          } fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const Reviews = ({ reviews, averageRating, totalReviews }: ReviewsProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <div className="border-b pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          {totalReviews > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          )}
        </div>
        
        {totalReviews > 0 && (
          <div className="flex items-center mt-2">
            <StarRating rating={averageRating} size="md" />
            <span className="ml-2 text-lg font-semibold">{averageRating.toFixed(1)}</span>
            <span className="ml-2 text-gray-600">({totalReviews} review{totalReviews > 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {sortedReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map((review) => (
            <div key={review._id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="ml-2 font-semibold">{review.userName}</span>
                    {review.verified && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
