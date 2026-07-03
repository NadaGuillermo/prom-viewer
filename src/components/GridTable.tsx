import * as _ from "lodash-es";

interface Props {
  data: Record<string, string[]>;
  constrainWidth?: boolean;
}

const GridTable = ({ data, constrainWidth }: Props) => {
  const dates = Object.keys(data);
  const questionnaires = _.uniq(
    Object.values(data).flatMap((questionnaire) => questionnaire),
  );
  const columns = dates.length + 2;
  // ${constrainWidth && dates.length >= 10 && dates.length < 12 ? "tw:max-w-7xl" : ""}
  return (
    <div
      className={`tw:w-full tw:overflow-x-auto
      ${constrainWidth && dates.length < 2 ? "tw:max-w-md" : ""}
      ${constrainWidth && dates.length >= 2 && dates.length < 4 ? "tw:max-w-lg" : ""}
      ${constrainWidth && dates.length >= 4 && dates.length < 6 ? "tw:max-w-2xl" : ""}
      ${constrainWidth && dates.length >= 6 && dates.length < 8 ? "tw:max-w-4xl" : ""}
      ${constrainWidth && dates.length >= 8 && dates.length < 10 ? "tw:max-w-6xl" : ""}
      tw:border border-medium`}
    >
      <div
        className={`tw:grid tw:gap-0 tw:min-w-xs`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        <div className="tw:col-span-2 tw:border-b tw:py-4 border-medium" />
        {dates.map((date) => (
          <div
            key={date}
            className="tw:col-span-1 tw:border-b tw:py-4 border-medium"
          >
            <div className="tw:text-sm tw:text-center tw:whitespace-pre-wrap tw:px-2 tw:select-none">
              {date}
            </div>
          </div>
        ))}
        {questionnaires.map((questionnaire, i) => (
          <>
            <div
              key={questionnaire}
              className={`tw:col-span-2 
            ${i < questionnaires.length - 1 ? "tw:border-b border-medium" : ""} tw:py-2 tw:px-2`}
            >
              <div className="tw:text-sm tw:whitespace-pre-wrap tw:select-none">
                {questionnaire}
              </div>
            </div>
            {dates.map((date) => (
              <div
                key={`${date}:${questionnaire}`}
                className={`tw:col-span-1 tw:flex tw:justify-center 
              tw:items-center ${i < questionnaires.length - 1 ? "tw:border-b border-medium" : ""} 
              tw:py-2`}
              >
                <div className="tw:select-none">
                  {data[date] && data[date].includes(questionnaire) ? (
                    <svg
                      aria-label="Response exists"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="tw:fill-accent tw:rounded-full"
                        cx="10"
                        cy="10"
                        r="6"
                      />
                    </svg>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
};

export default GridTable;
