import "cally";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";

import type * as Visualization from "@utils/visualization";
import { formatDate } from "@utils/dateFormat";
interface Props {
  rangeHandler: (event: Event) => void;
  dateValue: string;
  range: Visualization.RangeState;
  dateFormat: string;
}

/**
 * DateRangePicker component renders a date range picker that allows users to select a start and end date.
 * It includes a button to open the calendar popover, a clear button to reset the selection, and displays the selected date range.
 * The component uses the "cally" library for the calendar functionality.
 */
const DateRangePicker = ({
  rangeHandler,
  dateValue,
  range,
  dateFormat,
}: Props) => {
  const startDateFormatted = formatDate(range.start, dateFormat);
  const endDateFormatted = formatDate(range.end, dateFormat);

  return (
    <div className="tw:mt-2 tw:mr-2">
      {/* Date Range Picker Button */}
      <button
        type="button"
        popoverTarget="rdp-popover"
        className="tw:input tw:input-border border-medium tw:bg-base-100 border-rounded"
        style={{ anchorName: "--rdp" } as React.CSSProperties}
      >
        {range.start && range.end
          ? `${startDateFormatted} \u2013 ${endDateFormatted}`
          : `Pick start and end date`}
      </button>
      {/* Clear Button */}
      <div className="tw:mt-2">
        <button
          type="button"
          className="tw:btn tw:btn-sm tw:btn-outline tw:text-base-content tw:hover:text-neutral-content tw:hover:bg-neutral tw:shadow-none tw:hover:border-neutral! border-medium border-rounded"
          onClick={() => rangeHandler(new Event("clear"))}
        >
          Clear
        </button>
      </div>
      {/* Calendar Popover */}
      <div
        popover="auto"
        id="rdp-popover"
        className="tw:dropdown"
        style={{ positionAnchor: "--rdp" } as React.CSSProperties}
      >
        <calendar-range
          value={dateValue}
          onchange={rangeHandler}
          className="tw:cally tw:bg-base-100 tw:border border-medium tw:rounded-box border-rounded"
        >
          <FontAwesomeIcon
            aria-label="Previous"
            className="tw:fill-current tw:size-4"
            slot="previous"
            icon={["fas", "caret-left"] as IconProp}
          />
          <FontAwesomeIcon
            aria-label="Next"
            className="tw:fill-current tw:size-4"
            slot="next"
            icon={["fas", "caret-right"] as IconProp}
          />
          <calendar-month></calendar-month>
        </calendar-range>
      </div>
    </div>
  );
};

export default DateRangePicker;
