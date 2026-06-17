import type { Mapping } from "@utils/mapping";
import type { Visualization } from "@utils/visualization";
import DateRangePicker from "@components/DateRangePicker";

interface Props {
  questionnaires: Mapping.Questionnaire[];
  selectedQuestionnaires: string[];
  questionnaireSelectionHandler: (id: string) => void;
  dates: string[];
  selectedDates: string[];
  dateSelectionHandler: (date: string) => void;
  datePickerValue: string;
  datePickerRange: Visualization.RangeState;
  rangeSelectionHandler: (event: Event) => void;
  resetHandler: () => void;
}

const FilterOptionsDisplay = ({
  questionnaires,
  selectedQuestionnaires,
  questionnaireSelectionHandler,
  dates,
  selectedDates,
  dateSelectionHandler,
  datePickerValue,
  datePickerRange,
  rangeSelectionHandler,
  resetHandler,
}: Props) => {
  return (
    <>
    <div className="tw:px-4 tw:pb-2">
      <div>
        <p className="h5">Questionnaires</p>
      </div>
      <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
        {questionnaires.map((questionnaire) => (
          <label key={questionnaire.id} className={`tw:label ${selectedQuestionnaires.includes(questionnaire.id) ? "tw:text-base-content" : "tw:text-base-content-light"}`}>
            <input
              type="checkbox"
              checked={selectedQuestionnaires.includes(questionnaire.id)}
              onChange={() => questionnaireSelectionHandler(questionnaire.id)}
              className="tw:checkbox tw:bg-base-100 tw:border border-medium tw:checkbox-md tw:shadow-none border-rounded"
            />
            <div className="tw:whitespace-normal tw:break-normal">
              {questionnaire.name}
            </div>
          </label>
        ))}
      </div>
      <div>
        <p className="h5">Dates</p>
      </div>
      <div className="tw:pb-2">
        <p>Select single dates</p>
      </div>
      <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
        {dates.map((date) => (
          <label key={date} className={`tw:label ${selectedDates.includes(date) ? "tw:text-base-content" : "tw:text-base-content-light"}`}>
            <input
              type="checkbox"
              checked={selectedDates.includes(date)}
              onChange={() => dateSelectionHandler(date)}
              className="tw:checkbox tw:bg-base-100 tw:border border-medium tw:checkbox-md tw:shadow-none border-rounded"
            />
            {date}
          </label>
        ))}
      </div>
      <div className="tw:py-2">
        <p>Or select a date range</p>
        <DateRangePicker
          rangeHandler={rangeSelectionHandler}
          dateValue={datePickerValue}
          range={datePickerRange}
        />
      </div>
    </div>
    <div className="tw:px-4 tw:pt-4">
        <button className="tw:btn tw:btn-outline tw:btn-accent tw:btn-sm border-rounded" onClick={() => resetHandler()}>
          Reset Filters
        </button>
      </div>
      </>
  );
};

export default FilterOptionsDisplay;
