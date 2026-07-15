import * as _ from "lodash-es";
import React from "react";
interface Props {
  data: Record<string, string[]>;
}

const GridTable = ({ data }: Props) => {
  const dates = Object.keys(data);
  const questionnaires = _.uniq(
    Object.values(data).flatMap((questionnaire) => questionnaire),
  );

  return (
    <div className="tw:min-w-0">
      <div className={`tw:overflow-x-scroll tw:border border-medium`}>
        <div
          className="tw:grid tw:gap-0 tw:min-w-max"
          style={{
            gridTemplateColumns: `minmax(6rem, 14rem) repeat(${dates.length}, minmax(2.5rem, max-content))`,
          }}
        >
          <div className="tw:border-b tw:border-r border-medium tw:sticky tw:left-0 tw:z-10 tw:bg-base-100" />
          {dates.map((date) => (
            <div
              key={date}
              className={`tw:border-b 
                tw:gap-1 tw:px-2 border-medium tw:bg-base-100 tw:flex tw:flex-col tw:items-center`}
            >
              <div
                aria-hidden="true"
                className="tw:h-2 tw:w-px tw:top-full tw:relative background-border-medium"
              />
              <div className="tw:text-sm tw:whitespace-nowrap tw:select-none tw:text-center tw:pb-2">
                {date}
              </div>
            </div>
          ))}
          {questionnaires.map((questionnaire, i) => (
            <React.Fragment key={questionnaire}>
              <div
                className={`tw:sticky tw:left-0 tw:z-10 tw:bg-base-100 tw:border-r border-medium
              ${i < questionnaires.length - 1 ? "tw:border-b" : ""} tw:py-2 tw:px-2
              `}
              >
                <div className="tw:text-sm tw:whitespace-pre-wrap tw:select-none">
                  {questionnaire}
                </div>
              </div>
              {dates.map((date) => (
                <div
                  key={`${date}:${questionnaire}`}
                  className={`tw:flex tw:justify-center
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
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridTable;
