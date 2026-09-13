interface Props {
  title: string;
  children: React.ReactNode;
  constrainWidth?: boolean;
  name?: string;
  titleSmall?: boolean;
}

/**
 * Collapse component renders a collapsible section with a title and content.
 * It uses the HTML <details> and <summary> elements to create the collapsible behavior.
 */
const Collapse = ({ title, children, constrainWidth, name, titleSmall = false }: Props) => {
  return (
    <div
      className={`tw:w-full ${constrainWidth ? "tw:max-w-4xl" : ""} tw:pb-2`}
    >
      <details
        className={`tw:collapse tw:collapse-plus tw:bg-base-100 tw:border tw:overflow-visible border-medium border-rounded-prominent`}
        name={name ?? title}
      >
        {titleSmall ? (
          <summary className="tw:collapse-title tw:font-semibold tw:text-sm">
          {title}
        </summary>
        ) :
         <summary className="tw:collapse-title tw:font-semibold">
          {title}
        </summary>
      }
        <div className="tw:collapse-content tw:overflow-visible">
          {children}
        </div>
      </details>
    </div>
  );
};

export default Collapse;
