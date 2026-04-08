import "@styles/style.css";
import type { Visualization } from "@customTypes/visualization";


const Collapse = ({title, children}: Visualization.CollapseProps) => {
  return (
    <div className="tw:w-8/10">
    <details className="tw:collapse tw:collapse-plus tw:join-item tw:bg-base-100 tw:border-base-300 tw:border" name={title}>
      <summary className="tw:collapse-title tw:font-semibold">
        {title}
      </summary>
      <div className="tw:collapse-content">{children}</div>
    </details>
    </div>
  );
};

export default Collapse;