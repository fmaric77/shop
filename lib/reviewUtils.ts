import Review from '@/models/Review';
import Product from '@/models/Product';

export async function updateProductRating(productId: string) {
  try {
    // Get all reviews for this product
    const reviews = await Review.find({ productId });
    
    if (reviews.length === 0) {
      // No reviews, reset rating
      await Product.findByIdAndUpdate(productId, {
        'rating.average': 0,
        'rating.count': 0,
      });
      return;
    }
    
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Update product rating
    await Product.findByIdAndUpdate(productId, {
      'rating.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      'rating.count': reviews.length,
    });
    
    return {
      average: averageRating,
      count: reviews.length,
    };
  } catch (error) {
    console.error('Error updating product rating:', error);
    throw error;
  }
}
