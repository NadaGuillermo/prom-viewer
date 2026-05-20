import type { Visualization } from "@utils/visualization";

const ErrorModal = ({ data, open, onClose }: Visualization.ErrorModalProps) => {
  if (!open) return null;

  return (
    <div className="tw:fixed tw:inset-0 tw:flex tw:items-center tw:justify-center tw:z-50">
      <div className="tw:absolute tw:inset-0 tw:bg-gray-50 tw:opacity-75"></div>
      <div className="tw:relative tw:bg-base-100 tw:p-6 tw:rounded-xl tw:shadow-xl tw:z-10 tw:w-96 tw:max-h-[80vh] tw:flex tw:flex-col">
        <div className="tw:p-4">
          <div className="tw:text-xl tw:font-semibold tw:mb-2">Data Issues</div>
          <div>Some issues have occured while processing the data.</div>
        </div>
        <div className="tw:overflow-y-auto tw:flex-1 tw:px-4">
          {data.some((issue) => issue.level === "error") && (
            <p className="tw:mb-2 tw:mt-2">
              <span className="tw:font-semibold">Errors </span>
              <span>(possibly flawed data)</span>
            </p>
          )}
          {data.map(
            (issue) =>
              issue.level === "error" && (
                <div
                  key={issue.id}
                  role="tw:alert"
                  className="tw:alert tw:alert-error tw:alert-outline tw:mb-2"
                >
                  <p>{issue.message}</p>
                </div>
              ),
          )}
          {data.some((issue) => issue.level === "warning") && (
            <p className="tw:mt-4 tw:mb-2">
              <span className="tw:font-semibold">Warnings </span>
              <span>(possibly ill-formatted data)</span>
            </p>
          )}
          {data.map(
            (issue) =>
              issue.level === "warning" && (
                <div
                  key={issue.id}
                  role="tw:alert"
                  className="tw:alert tw:alert-warning tw:alert-outline tw:mb-2"
                >
                  <p>{issue.message}</p>
                </div>
              ),
          )}
        </div>
        <div className="tw:px-4 tw:pt-4">
          <button className="tw:btn tw:btn-primary tw:w-full" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
