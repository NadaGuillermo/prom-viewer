interface Props {
  title: string;
  children: React.ReactNode;
  constrainWidth?: boolean;
  name?: string;
}

const Collapse = ({ title, children, constrainWidth, name }: Props) => {
  return (
    <div
      className={`tw:w-full ${constrainWidth ? "tw:max-w-4xl" : ""} tw:pb-2`}
    >
      <details
        className={`tw:collapse tw:collapse-plus tw:bg-base-100 tw:border-base-300 tw:border tw:overflow-visible`}
        name={name ?? title}
      >
        <summary className="tw:collapse-title tw:font-semibold">
          {title}
        </summary>
        <div className="tw:collapse-content tw:overflow-visible">
          {children}
        </div>
      </details>
    </div>
  );
};

export default Collapse;
