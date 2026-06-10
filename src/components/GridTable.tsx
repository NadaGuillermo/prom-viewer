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

  return (
    <div
      className={`tw:w-full tw:overflow-x-scroll tw:min-w-xs
      ${constrainWidth && dates.length < 2 ? "tw:max-w-md" : ""}
      ${constrainWidth && dates.length >= 2 && dates.length < 4 ? "tw:max-w-lg" : ""}
      ${constrainWidth && dates.length >= 4 && dates.length < 6 ? "tw:max-w-2xl" : ""}
      ${constrainWidth && dates.length >= 6 && dates.length < 8 ? "tw:max-w-4xl" : ""}
      ${constrainWidth && dates.length >= 8 && dates.length < 10 ? "tw:max-w-6xl" : ""}
      ${constrainWidth && dates.length >= 10 && dates.length < 12 ? "tw:max-w-7xl" : "tw:min-w-sm"}
      
      tw:border tw:border-gray-300`}
    >
      <div
        className={`tw:grid tw:gap-0`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        <div className="tw:col-span-2 tw:border-b tw:border-gray-300 tw:py-4"></div>
        {dates.map((date) => (
          <div
            key={date}
            className="tw:col-span-1 tw:border-b tw:border-gray-300 tw:py-4"
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
            ${i < questionnaires.length - 1 ? "tw:border-b tw:border-gray-300" : ""} tw:py-2 tw:px-2`}
            >
              <div className="tw:text-sm tw:whitespace-pre-wrap tw:select-none">
                {questionnaire}
              </div>
            </div>
            {dates.map((date) => (
              <div
                key={`${date}:${questionnaire}`}
                className={`tw:col-span-1 tw:flex tw:justify-center 
              tw:items-center ${i < questionnaires.length - 1 ? "tw:border-b tw:border-gray-300" : ""} 
              tw:py-2`}
              >
                <div className="tw:select-none">
                  {data[date] && data[date].includes(questionnaire) ? (
                    <svg
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="tw:fill-gray-400 tw:rounded-full"
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
