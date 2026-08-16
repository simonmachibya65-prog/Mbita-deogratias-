export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-navy-600 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
