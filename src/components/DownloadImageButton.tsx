import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import Portal from "@components/Portal";
import { Tooltip } from "react-tooltip";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  tooltipText?: string;
}

const DownloadImageButton = ({
  onClick,
  disabled = false,
  label = "Save as image",
  tooltipText = "Download",
  className,
}: Props) => {
  const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return (
    <div className={`${className}`}>
      <a data-tooltip-id={id}>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          className={`tw:btn tw:btn-xs tw:btn-circle tw:bg-base-100 tw:border-base-300 tw:shadow-none tw:text-neutral
            tw:hover:bg-base-300 tw:hover:text-base-content
            tw:z-10
            tw:disabled:opacity-40 tw:disabled:cursor-default`}
        >
          <FontAwesomeIcon icon={["fas", "download"] as IconProp} />
        </button>
      </a>
      <Portal>
        <Tooltip
          id={id}
          opacity={1}
          className="custom-tooltip tooltip-basic tw:z-10"
        >
          <div className="tw:w-24">
            <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
              <p>
                {tooltipText ? tooltipText : label}
              </p>
            </div>
          </div>
        </Tooltip>
      </Portal>
    </div>
  );
};

export default DownloadImageButton;