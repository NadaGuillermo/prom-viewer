import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type IconProp } from "@fortawesome/fontawesome-svg-core";
import { Tooltip } from "react-tooltip";
import Portal from "@components/Portal";

interface Props {
  showSidebar: boolean;
  toggleShowSidebar: () => void;
  isFilterActive: boolean;
  resetFilters: () => void;
}

const SidebarToggle = ({ showSidebar, toggleShowSidebar, isFilterActive, resetFilters }: Props) => {
  return (
    <>
    <button
      id="sidebar-toggle"
      type="button"
      onClick={toggleShowSidebar}
      aria-label={showSidebar ? "Hide filter sidebar" : "Show filter sidebar"}
      data-tooltip-id="sidebar-toggle-tooltip"
      className={`tw:btn tw:bg-base-300 tw:rounded-none tw:border-none tw:text-accent tw:text-xl
        tw:hidden tw:lg:flex tw:items-center tw:justify-center tw:shadow-none
        tw:h-12 tw:w-12
        tw:fixed
        tw:top-0
        tw:z-50
        tw:hover:text-base-content
        tw:transition-all ${
        showSidebar ? "tw:right-80 tw:ease-in tw:duration-200" : "tw:right-0 tw:ease-out tw:duration-250"
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
    <Portal>
      <Tooltip
        id="sidebar-toggle-tooltip"
        opacity={1}
        className="custom-tooltip tooltip-light tw:z-50"
        place="left"
        positionStrategy="fixed"
      >
        <div className="tw:w-32">
            <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
              
                {showSidebar ? "Hide filter sidebar" : "Show filter sidebar"}
              
            </div>
          </div>
      </Tooltip>
    </Portal>
      {isFilterActive && !showSidebar && (
        <>
        <button
        type="button"
        onClick={resetFilters}
        aria-label={"Filter is active"}
        data-tooltip-id="filter-status-tooltip"
        className={`
          tw:btn
          tw:bg-base-100 tw:text-neutral tw:shadow-none
          tw:rounded-none
          tw:hidden tw:items-center tw:justify-center
          tw:border-none
          tw:h-12 tw:w-12
          tw:fixed
          tw:top-12          
          tw:lg:z-50
          tw:text-sm
          tw:hover:text-base-content          
          tw:transition-all ${
            showSidebar ? "tw:lg:hidden tw:right-80 tw:ease-in tw:duration-200" : "tw:lg:flex tw:right-0 tw:ease-out tw:duration-250"
          }
          `}
        >
         
        <FontAwesomeIcon
        icon={
            (["fas", "filter-circle-xmark"] as IconProp)
        }        
      
      />
      </button>
       <Portal>
      <Tooltip
        id="filter-status-tooltip"
        opacity={1}
        className="custom-tooltip tooltip-light tw:z-50"
        place="left"
        positionStrategy="fixed"
      >
        <div className="tw:w-24">
            <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">              
                Reset filters              
            </div>
          </div>
      </Tooltip>
    </Portal>
    </>
      )}
    
    </>
  );
};

export default SidebarToggle;
