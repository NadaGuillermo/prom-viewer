type AnimationType = 'spinner' | 'dots' | 'bars';

interface Props {
  message?: string;
  subMessage?: string;
  animation?: AnimationType;
}

/**
 * DataLoadingScreen component displays a full-screen loading overlay with a customizable message, optional sub-message, and different animation styles (spinner, dots, or bars). 
 * It is used to indicate that data is being loaded or processed in the application.
 */
const DataLoadingScreen = ({
  message = "Loading",
  subMessage,
  animation = 'spinner',
}: Props) => {
  return (
    <div className={`tw:fixed tw:inset-0 tw:bg-base-300 tw:flex tw:items-center tw:justify-center tw:p-6 tw:z-10000`}>
      <div className="tw:max-w-md tw:w-full tw:text-center">
        {/* Animation */}
        <div className="tw:flex tw:justify-center tw:mb-8">
          {animation === 'spinner' && (
            <div className="tw:loading tw:loading-spinner tw:loading-xl" />
          )}

          {animation === 'dots' && (
            <div className="tw:loading tw:loading-dots tw:loading-xl" />
          )}

          {animation === 'bars' && (
            <div className="tw:loading tw:loading-bars tw:loading-xl" />
          )}
        </div>

        {/* Main Message */}
        <h1 className="tw:mb-4 tw:tracking-tight">
          {message}
        </h1>

        {/* Optional Sub-message */}
        {subMessage !== undefined && (
          <p className="tw:text-lg">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default DataLoadingScreen;