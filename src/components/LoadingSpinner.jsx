export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-1 border-4 border-secondary rounded-full border-b-transparent animate-spin"></div>
      </div>
    </div>
  );
}
