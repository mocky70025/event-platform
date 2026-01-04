'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-52">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-admin rounded-full animate-spin" />
    </div>
  );
}