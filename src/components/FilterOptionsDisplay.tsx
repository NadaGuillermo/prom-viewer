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
}: Props) => {
  return (
    <div className="tw:px-4 tw:pb-2">
                
                  <div className="tw:pb-2 tw:font-semibold">
                    <p>Questionnaires</p>
                  </div>
                  <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
                    {questionnaires.map((questionnaire) => (
                      <label key={questionnaire.id} className="tw:label tw:text-gray-900">
                        <input type="checkbox" checked={selectedQuestionnaires.includes(questionnaire.id)} onChange={() => questionnaireSelectionHandler(questionnaire.id)} className="tw:checkbox" />
                        <div className="tw:whitespace-normal tw:break-normal">
                        {questionnaire.name}
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="tw:pb-2 tw:pt-4 tw:font-semibold">
                    <p>Dates</p>
                  </div>
                  <div className="tw:pb-2">
                    <p>
                      Select single dates
                    </p>
                  </div>
                    <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
                      {dates.map((date) => (
                        <label key={date} className="tw:label tw:text-gray-900">
                          <input type="checkbox" checked={selectedDates.includes(date)} onChange={() => dateSelectionHandler(date)} className="tw:checkbox" />
                          {date}
                        </label>
                      ))}
                    </div>
                  <div className="tw:py-2">
                    <p>Or select a date range</p>
                    <DateRangePicker rangeHandler={rangeSelectionHandler} dateValue={datePickerValue} range={datePickerRange}/>
                  </div>
                
              </div>
  )
}

export default FilterOptionsDisplay;;