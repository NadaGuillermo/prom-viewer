import "cally";
import type { Visualization } from "@utils/visualization";

import { useState } from "react";

interface RangeState {
  start: string;
  end: string;
}

const DateRangePicker = () => {
  const [dateValue, setDateValue] = useState<string>("");

    const [range, setRange] = useState<RangeState>({ start: "", end: "" });

  const handleRangeChange = (event: Event) => {
    // Cast the target to access both value (start) and valueEnd (end)
    const target = event.target as HTMLInputElement;
    const cutPosition = target.value.indexOf("/");
    const start = target.value.substring(0, cutPosition);
    const end = target.value.substring(cutPosition + 1);
    setRange({
      start: start,    // e.g., "2026-05-19"
      end: end,   // e.g., "2026-05-26" (or empty string if not clicked yet)
    });
    setDateValue(target.value);
  };

    return (
      <>
      <button popoverTarget="rdp-popover" className="tw:input tw:input-border tw:my-2" style={{ anchorName: "--rdp" } as React.CSSProperties}>
        {range.start && range.end ? `${range.start} \u2013 ${range.end}` : `Pick start and end dates`}
      </button>
      <div popover="auto" id="rdp-popover" className="tw:dropdown" style={{ positionAnchor: "--rdp" } as React.CSSProperties}>
       
        <calendar-range value={dateValue} onchange={handleRangeChange} className="tw:cally tw:bg-base-100 tw:border tw:border-base-300 tw:shadow-lg tw:rounded-box">
          <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
          <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
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
