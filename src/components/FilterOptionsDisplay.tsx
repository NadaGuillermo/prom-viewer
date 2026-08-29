import type * as Mapping from "@utils/mapping";
import type * as Visualization from "@utils/visualization";
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
  filteredSelectedDates: string[];
  filteredSelectedQuestionnaires: string[];
  inactiveDates: string[];
  inactiveQuestionnaires: string[];
  dateFormat: string;
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
  filteredSelectedDates,
  filteredSelectedQuestionnaires,
  inactiveDates,
  inactiveQuestionnaires,
  dateFormat,
}: Props) => {

  return (
    <>
    <div className="tw:px-4 tw:pb-2">
      <div>
        <p className="h5">Questionnaires</p>
      </div>
      <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
        {questionnaires.map((questionnaire) => (
          <label key={questionnaire.id} className={`tw:label ${filteredSelectedQuestionnaires.includes(questionnaire.id) ? "tw:text-base-content" : "tw:text-neutral"}`}>
            <input
              type="checkbox"
              disabled={inactiveQuestionnaires.includes(questionnaire.id)}
              checked={selectedQuestionnaires.includes(questionnaire.id)}
              onChange={() => questionnaireSelectionHandler(questionnaire.id)}
              className="tw:checkbox tw:bg-base-100 tw:border border-medium tw:checkbox-md tw:shadow-none border-rounded"
            />
            <div className="tw:whitespace-normal tw:break-normal">
              {questionnaire.title}
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
          <label key={date} className={`tw:label ${filteredSelectedDates.includes(date) ? "tw:text-base-content" : "tw:text-neutral"}`}>
            <input
              type="checkbox"
              disabled={inactiveDates.includes(date)}
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
          dateFormat={dateFormat}
        />
      </div>
    </div>
    <div className="tw:px-4 tw:pt-4">
        <button className="tw:btn tw:btn-sm tw:btn-accent tw:shadow-none border-rounded tw:hover:text-accent tw:hover:bg-transparent tw:hover:border-transparent" onClick={() => resetHandler()}>
          Reset Filters
        </button>
      </div>
      </>
  );
};

export default FilterOptionsDisplay;
