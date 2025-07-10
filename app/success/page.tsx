import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-static'; // Ensures static rendering
// Server component receives searchParams directly
export default function SuccessPage({ searchParams }: any) {
  const sessionId = searchParams?.session_id ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been confirmed and will be processed shortly.
        </p>
        
        {sessionId && (
          <p className="text-sm text-gray-500 mb-6">
            Order ID: {sessionId.slice(-8)}
          </p>
        )}
        
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
          
          <Link
            href="/orders"
            className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
