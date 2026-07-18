// import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";

import Portal from "./Portal";
import { Tooltip } from "react-tooltip";

interface Props {
  dates: string[];
  selectedDate: string;
  changeDate: (date: string, dates: string[], direction: "previous" | "next") => void;
}

const DateSlider = ({ dates, selectedDate, changeDate }: Props) => {
//  const [selectedDate, setSelectedDate] = useState<string>("");

//   const selectDate = (date: string, direction: "previous" | "next") => {
//   console.log("in selectDate: ", date, direction)
//   let newDate: string = "";
//   if (direction === "previous") {
//     const index = dates.indexOf(date);
//     if (index > -1) {
//       if (index === 0) {
//         newDate = dates[index];
//       } else {
//         newDate = dates[index - 1];
//       }
//     }
//   } else {
//     const index = dates.indexOf(date);
//     if (index > - 1 ) {
//       if (index === dates.length - 1) {
//         newDate = dates[index];
//       } else {
//         newDate = dates[index + 1];
//       }
//     }
//   }
//   console.log("new Date: ", newDate)
//   setSelectedDate(newDate);
// }

  if (dates.length === 0) {
    return;
  }
  // const preSelectedDate = preSelected === "last" ? dates[dates.length - 1] : dates[0];
  // setSelectedDate(preSelectedDate);

  // useEffect(() => {
  //   setSelectedDate(preSelectedDate);
  // }, [
  //   dates,
  // ]);

  return (
    <>
      <div className="tw:flex tw:items-center">
        <div className="tw:flex-none">
          <a data-tooltip-id="Previous">
            <button 
            onClick={() => changeDate(selectedDate, dates, "previous")}
            disabled={dates.indexOf(selectedDate) === 0}
            className="tw:btn tw:btn-xs tw:p-1 tw:my-1 tw:shadow-none tw:bg-base-100 tw:border-none tw:hover:bg-base-200"
            >  
              <div className="tw:text-lg tw:leading-none tw:text-center">
                <FontAwesomeIcon
                  aria-label="Previous date"
                  icon={["fas", "caret-left"] as IconProp}
                />
              </div>
            </button>
          </a>
          <Portal>
            <Tooltip
              id="Previous"
              opacity={1}
              className="custom-tooltip tooltip-light tw:z-10"
            >
              <div className="tw:w-32">
                <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
                  Select previous date
                </div>
              </div>
            </Tooltip>
          </Portal>
        </div>
        <div className="tw:flex-auto tw:mx-1 tw:border border-medium border-rounded tw:px-4 tw:py-2">
          <div className="tw:leading-none tw:text-center">
            {selectedDate}
          </div>
        </div>
        <div className="tw:flex-none">
          <a data-tooltip-id="Next">
            <button 
            onClick={() => changeDate(selectedDate, dates, "next")}
            disabled={dates.indexOf(selectedDate) === dates.length - 1}
            className="tw:btn tw:btn-xs tw:p-1 tw:my-1 tw:border-none tw:shadow-none tw:bg-base-100 tw:hover:bg-base-200">
              <div className="tw:text-lg tw:leading-none tw:text-center">
                <FontAwesomeIcon
                  aria-label="Next date"
                  icon={["fas", "caret-right"] as IconProp}
                />
              </div>
            </button>
          </a>
          <Portal>
            <Tooltip
              id="Next"
              opacity={1}
              className="custom-tooltip tooltip-light tw:z-10"
            >
              <div className="tw:w-32">
                <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
                  Select next date
                </div>
              </div>
            </Tooltip>
          </Portal>
        </div>
      </div>
    </>
  );
};

export default DateSlider;
