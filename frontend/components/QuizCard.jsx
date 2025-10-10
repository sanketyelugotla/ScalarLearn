import { CiUser } from "react-icons/ci";
import Link from "next/link";

const QuizCard = ({ quiz }) => {

    return (
        <div className="border rounded-lg p-4 shadow-sm border-border hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                <span
                    className={`px-2 py-1 rounded-full text-white ${quiz.level === 'Advanced'
                        ? 'bg-red-500'
                        : quiz.level === 'Beginner'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                >
                    {quiz.level}
                </span>
                <span className="text-gray-500 border border-border rounded-full px-2 py-0.5 whitespace-nowrap">
                    {quiz.duration}
                </span>
            </div>

            <h2 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
                {quiz.title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 line-clamp-2">
                {quiz.description}
            </p>

            <div className="flex gap-2 mb-1 items-center">
                <CiUser className="text-sm" />
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {quiz.author?.name || 'Unknown Author'}
                </p>
            </div>
            <div className="flex justify-between">


                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    {quiz.category} · {quiz.questions} questions
                </p>
                {quiz.attempted &&
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 border border-border rounded-full px-2 py-0.5 whitespace-nowrap">
                        Attempted
                    </p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Start Quiz or Reattempt Quiz */}
                <Link href={`/quizzes/${quiz._id}`} className="w-full">
                    <button
                        className="w-full bg-blue-600 text-white py-1.5 sm:py-2 rounded-md hover:bg-blue-700 transition text-sm sm:text-base cursor-pointer"
                    >
                        {quiz.attempted ? 'Reattempt Quiz' : 'Start Quiz'}
                    </button>
                </Link>

                {/* Show Analysis button only if quiz is attempted */}
                {quiz.attempted && (
                    <Link href={`/quizzes/submit/${quiz.attemptId}`} className="w-full">
                        <button
                            className="w-full bg-green-600 text-white py-1.5 sm:py-2 rounded-md hover:bg-green-700 transition text-sm sm:text-base cursor-pointer"
                        >
                            View Analysis
                        </button>
                    </Link>
                )}
            </div>

        </div>
    );
};

export default QuizCard;
