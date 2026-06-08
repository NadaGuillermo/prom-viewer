interface Props {
  title: string;
  children: React.ReactNode;
  constrainWidth?: boolean;
}

const Collapse = ({ title, children, constrainWidth }: Props) => {
  return (
    <div className={`tw:w-full ${constrainWidth ? "tw:md:w-9/10 tw:lg:w-8/10 tw:2xl:w-7/10" : ""}`}>
      <details
        className={`tw:collapse tw:collapse-plus tw:bg-base-100 tw:border-base-300 tw:border`}
        name={title}
      >
        <summary className="tw:collapse-title tw:font-semibold">
          {title}
        </summary>
        <div className="tw:collapse-content">{children}</div>
      </details>
    </div>
  );
};

export default Collapse;
