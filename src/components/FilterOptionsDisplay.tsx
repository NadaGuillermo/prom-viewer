/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/

import DateRangePicker from "@components/DateRangePicker";
import type * as Mapping from "@utils/mapping";
import type * as Visualization from "@utils/visualization";

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

/**
 * FilterOptionsDisplay component renders the filter options for selecting questionnaires and dates.
 * It includes checkboxes for questionnaires and dates, a date range picker, and a reset button. 
 */
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
        {/* Questionnaires checkboxes */}
        <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
          {questionnaires.map((questionnaire) => (
            <label
              key={questionnaire.id}
              className={`tw:label ${filteredSelectedQuestionnaires.includes(questionnaire.id) ? "tw:text-base-content" : "tw:text-neutral"}`}
            >
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
        {/* Dates checkboxes */}
        <div className="tw:flex tw:flex-wrap tw:gap-x-4 tw:gap-y-2 tw:justify-start">
          {dates.map((date) => (
            <label
              key={date}
              className={`tw:label ${filteredSelectedDates.includes(date) ? "tw:text-base-content" : "tw:text-neutral"}`}
            >
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
        {/* Date Range Picker */}
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
      {/* Reset Filters Button */}
      <div className="tw:px-4 tw:pt-4">
        <button
          type="button"
          className="tw:btn tw:btn-sm tw:btn-accent tw:shadow-none border-rounded tw:hover:text-accent tw:hover:bg-transparent tw:hover:border-transparent"
          onClick={() => resetHandler()}
        >
          Reset Filters
        </button>
      </div>
    </>
  );
};

export default FilterOptionsDisplay;
