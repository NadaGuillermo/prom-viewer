import type { Errors } from "@utils/errors";


interface Props {
  data: Errors.DataIssue[],
}
const ErrorCard = ({ data }: Props) => {

  return (
    <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md tw:overflow-y-auto tw:max-h-[60vh]">
      <div className="tw:card-body">
        <h3 className="tw:card-title">Data Issues</h3>
        <div>Some issues have occured while processing the data.</div>
        
        <div className="tw:overflow-y-auto tw:flex-1">
          {data.some((issue) => issue.level === "error") && (
            <p className="tw:mb-2 tw:mt-2">
              <span className="tw:font-semibold">Errors </span>
              <span>(possibly flawed data)</span>
            </p>
          )}
          {data.filter((issue) => issue.level === "error").map(
            (issue) =>
              (
                <div
                  key={issue.id}
                  role="tw:alert"
                  className="tw:alert tw:alert-error tw:alert-outline tw:mb-2"
                >
                  <p>{issue.userMessage}</p>
                </div>
              ),
          )}
          {data.some((issue) => issue.level === "warning") && (
            <p className="tw:mt-4 tw:mb-2">
              <span className="tw:font-semibold">Warnings </span>
              <span>(possibly ill-formatted data)</span>
            </p>
          )}
          {data.filter((issue) => issue.level === "warning").map(
            (issue) =>
              (
                <div
                  key={issue.id}
                  role="tw:alert"
                  className="tw:alert tw:alert-warning tw:alert-outline tw:mb-2"
                >
                  <p>{issue.userMessage}</p>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
