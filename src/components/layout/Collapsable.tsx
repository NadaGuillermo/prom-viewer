import React from "react";
import "src/style.css";


const Collapsable = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="tw:max-w-7xl tw:p-2">
    <div tabIndex={0} className="tw:collapse tw:collapse-plus tw:bg-base-100 tw:border-base-300 tw:border">
      <div className="tw:collapse-title tw:font-semibold">
        {title}
      </div>
      <div className="tw:collapse-content tw:text-sm">{children}</div>
    </div>
    </div>
  );
};

export default Collapsable;