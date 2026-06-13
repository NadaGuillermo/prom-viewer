

interface Props {
  error: string | null;
  heading?: string;
  onRetry?: () => void;
}

const ErrorPage = ({ error, heading, onRetry }: Props) => {
  const errorMessage = typeof error === 'string' 
    ? error 
    : 'Unknown error occurred';

  return (
    <div className={`tw:fixed tw:inset-0 tw:bg-slate-100 tw:flex tw:items-center tw:justify-center tw:p-6 tw:z-[10000]`}>
      <div className="tw:max-w-xl tw:w-full tw:text-center">
        {/* Icon */}
        <div className="tw:text-7xl tw:mb-8 tw:opacity-90">
          ⚠️
        </div>

        {/* Title */}
        <h1 className="tw:text-4xl tw:font-semibold tw:text-red-600 tw:mb-6 tw:tracking-tight">
          {heading ?? "Error"}
        </h1>

        {/* Main message */}
        <p className="tw:text-xl tw:text-slate-700 tw:mb-10 tw:leading-relaxed">
          We couldn't connect to the backend server to retrieve the required data.
        </p>

        {/* Error details */}
        <div className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:p-6 tw:mb-10 tw:text-left tw:shadow-sm">
          <p className="tw:font-medium tw:text-slate-700 tw:mb-3">Error details:</p>
          <pre className="tw:bg-slate-50 border tw:border-slate-100 tw:p-4 tw:rounded-lg tw:text-sm tw:text-slate-600 tw:whitespace-pre-wrap tw:font-mono tw:overflow-auto tw:max-h-48">
            {errorMessage}
          </pre>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="tw:bg-blue-600 tw:hover:bg-blue-700 tw:text-white tw:font-medium tw:text-lg tw:px-10 tw:py-4 tw:rounded-xl tw:transition-colors tw:focus:outline-none tw:focus:ring-4 tw:focus:ring-blue-200"
          >
            Retry
          </button>
        )}

        {/* Support info */}
        <div className="tw:mt-12 tw:text-slate-500 tw:text-base">
          <p>
            If the problem persists, please contact your IT administrator 
            and provide the error details above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;