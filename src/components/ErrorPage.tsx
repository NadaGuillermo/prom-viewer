import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";

interface Props {
  error: string | null;
  heading?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorPage = ({ error, heading, message, onRetry }: Props) => {
  const errorMessage = typeof error === 'string' 
    ? error 
    : 'Unknown error occurred';

  return (
    <div className={`tw:fixed tw:inset-0 tw:bg-base-300 tw:flex tw:items-center tw:justify-center tw:p-4 tw:z-10000`}>
      <div className="tw:max-w-xl tw:w-full tw:text-center">
        {/* Icon */}
        <div className="tw:text-7xl tw:mb-4 tw:opacity-90">
          <FontAwesomeIcon icon={["fas", "triangle-exclamation"] as IconProp} />
        </div>

        {/* Title */}
        <h1 className="tw:text-error tw:mb-4 tw:tracking-tight">
          {heading ?? "Error"}
        </h1>

        {/* Main message */}
        <p className="tw:text-xl tw:mb-8 tw:leading-relaxed">
          {message ?? "We couldn't retrieve the required data from the backend server."}
          </p>

        {/* Error details */}
        <div className="tw:bg-base-100 tw:border border-light tw:p-8 tw:mb-8 tw:text-left tw:shadow-sm border-rounded-prominent">
          <p className="tw:mb-2">Error details:</p>
          <pre className="tw:bg-base-200 tw:border border-light tw:p-4 tw:text-sm tw:whitespace-pre-wrap tw:font-mono tw:overflow-auto tw:max-h-48 border-rounded">
            {errorMessage}
          </pre>
        </div>

        {/* Retry Button */}
        {onRetry && (
          <button
            className="tw:btn tw:btn-primary tw:btn-xl tw:shadow-none border-rounded"
            onClick={onRetry}
          >
            Retry
          </button>
        )}

        {/* Support info */}
        <div className="tw:mt-8">
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