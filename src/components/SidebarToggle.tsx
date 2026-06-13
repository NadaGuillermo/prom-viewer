import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import "@styles/style.css";

interface Props {
  showSidebar: boolean;
  toggleShowSidebar: () => void;
}

const SidebarToggle = ({ showSidebar, toggleShowSidebar }: Props) => {
  return (
    <button
      id="sidebar-toggle"
      type="button"
      onClick={toggleShowSidebar}
      aria-label={showSidebar ? "Hide filter sidebar" : "Show filter sidebar"}
      className={`tw:hidden tw:lg:flex tw:items-center tw:justify-center 
        tw:fixed tw:top-1/2 tw:-translate-y-1/2 tw:h-14 tw:w-12 
        tw:rounded-l-full tw:bg-base-200 tw:border tw:border-base-300 
        tw:text-base-content tw:shadow-lg tw:z-50 
        tw:transition-all ${
        showSidebar ? "tw:lg:right-80 tw:ease-in tw:duration-200" : "tw:lg:right-0 tw:ease-out tw:duration-250"
      }`}
    >
      <FontAwesomeIcon
        icon={
          showSidebar
            ? (["fas", "chevron-right"] as IconProp)
            : (["fas", "chevron-left"] as IconProp)
        }
      />
    </button>
  );
};

export default SidebarToggle;
