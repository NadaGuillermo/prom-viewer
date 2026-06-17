import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";

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
      className={`tw:btn tw:btn-neutral tw:rounded-none tw:border-none tw:text-accent tw:text-lg
        tw:hidden tw:lg:flex tw:items-center tw:justify-center
        tw:h-12 tw:w-12
        tw:fixed
        tw:z-50
        tw:transition-all ${
        showSidebar ? "tw:lg:right-80 tw:ease-in tw:duration-200" : "tw:lg:right-0 tw:ease-out tw:duration-250"
      }`}
      // className={`tw:btn tw:btn-neutral tw:hidden tw:lg:flex tw:items-center tw:justify-center 
      //   tw:fixed tw:top-1/2 tw:-translate-y-1/2 tw:h-14 tw:w-10 
      //   tw:rounded-l-full 
      //   tw:z-50 
      //   tw:transition-all ${
      //   showSidebar ? "tw:lg:right-80 tw:ease-in tw:duration-200" : "tw:lg:right-0 tw:ease-out tw:duration-250"
      // }`}
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
