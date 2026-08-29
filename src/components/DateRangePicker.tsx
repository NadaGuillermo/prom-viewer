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

const DateRangePicker = (
  { rangeHandler, dateValue, range, dateFormat }: Props
) => {

  const startDateFormatted = formatDate(range.start, dateFormat);
  const endDateFormatted = formatDate(range.end, dateFormat)

    return (
      <div className="tw:mt-2 tw:mr-2">
      <button 
      popoverTarget="rdp-popover" 
      className="tw:input tw:input-border border-medium tw:bg-base-100 border-rounded" style={{ anchorName: "--rdp" } as React.CSSProperties}>
        {range.start && range.end ? `${startDateFormatted} \u2013 ${endDateFormatted}` : `Pick start and end date`}
      </button>
      {/* <div className="tw:flex tw:justify-end tw:self-end"> */}
      <div className="tw:mt-2">
      <button
      className="tw:btn tw:btn-sm tw:btn-outline tw:text-base-content tw:hover:text-neutral-content tw:hover:bg-neutral tw:shadow-none tw:hover:border-neutral! border-medium border-rounded"
      onClick={() => rangeHandler(new Event("clear"))}
      >
        Clear
      </button>
      </div>
      {/* </div> */}
      <div popover="auto" id="rdp-popover" className="tw:dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
       
        <calendar-range value={dateValue} onchange={rangeHandler} className="tw:cally tw:bg-base-100 tw:border border-medium tw:rounded-box border-rounded">
          <FontAwesomeIcon
                  aria-label="Previous"
                  className="tw:fill-current tw:size-4"
                  slot="previous"
                  icon={["fas", "caret-left"] as IconProp}
                />
          {/* <svg aria-label="Previous" className="tw:fill-current tw:size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg> */}
          {/* <svg aria-label="Next" className="tw:fill-current tw:size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg> */}
          <FontAwesomeIcon
                  aria-label="Next"
                  className="tw:fill-current tw:size-4"
                  slot="next"
                  icon={["fas", "caret-right"] as IconProp}
                />
        <calendar-month></calendar-month>
        </calendar-range>
        
   
    </div>
     {/* <div style={{ marginTop: "15px" }}>
        <p><strong>Start Date:</strong> {range.start || "Not selected"}</p>
        <p><strong>End Date:</strong> {range.end || "Not selected"}</p>
      </div> */}
     </div> 
  );
}

export default DateRangePicker;
