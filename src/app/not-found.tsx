import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919] text-[#eeeeee] p-4">
      <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
      <p className="text-[#a0a0a0] mb-6 text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#333333] hover:bg-[#444444] text-[#eeeeee] rounded-md transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
