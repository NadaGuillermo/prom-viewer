import "cally";
import type { Visualization } from "@utils/visualization";

import { useState } from "react";

interface RangeState {
  start: string;
  end: string;
}

const DateRangePicker = (
  { rangeHandler, dateValue, range }: Visualization.DateRangePickerProps
) => {

    return (
      <>
      <button popoverTarget="rdp-popover" className="tw:input tw:input-border tw:my-2" style={{ anchorName: "--rdp" } as React.CSSProperties}>
        {range.start && range.end ? `${range.start} \u2013 ${range.end}` : `Pick start and end date`}
      </button>
      <button className="tw:btn tw:btn-outline tw:btn-secondary tw:btn-sm tw:mt-2 tw:ml-2" onClick={() => rangeHandler(new Event("clear"))}>
        Clear
      </button>
      <div popover="auto" id="rdp-popover" className="tw:dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
       
        <calendar-range value={dateValue} onchange={rangeHandler} className="tw:cally tw:bg-base-100 tw:border tw:border-base-300 tw:shadow-lg tw:rounded-box">
          <svg aria-label="Previous" className="tw:fill-current tw:size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
          <svg aria-label="Next" className="tw:fill-current tw:size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
        <calendar-month></calendar-month>
        </calendar-range>
        
   
    </div>
     {/* <div style={{ marginTop: "15px" }}>
        <p><strong>Start Date:</strong> {range.start || "Not selected"}</p>
        <p><strong>End Date:</strong> {range.end || "Not selected"}</p>
      </div> */}
     </> 
  );
}

export default DateRangePicker;
