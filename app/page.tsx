import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-purple-50 p-6 text-gray-800">
      <div className="flex flex-col items-center text-center">
        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-purple-700 md:text-6xl lg:text-7xl">
          Welcome to Food Tracker
        </h1>

        <p className="mb-8 text-lg font-medium text-gray-600 md:text-xl lg:text-2xl">
          Track your meal!!!
        </p>

        <div className="relative mb-8 h-32 w-48 md:h-48 md:w-64 lg:h-64 lg:w-96">
          <Image
            src="/foodtracker.jpg"
            alt="A delicious meal"
            layout="fill"
            objectFit="cover"
            className="rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>

        <div className="mt-4 flex space-x-4">
          <Link
            href="/register"
            className="transform rounded-full bg-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Register
          </Link>

          <Link
            href="/login"
            className="transform rounded-full border border-purple-600 px-8 py-3 font-semibold text-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
