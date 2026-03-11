import "./style.css";
import { useState } from "react";
import LineChart from "@components/charts/LineChart";
import Header from "@components/layout/Header";
import Footer from "@components/layout/Footer";
import { BarChart } from "@components/charts/BarChart";
import Matrix from "@components/charts/Matrix";
import { ExpandableMatrixDemo } from "@components/charts/ExpandableMatrix";
import { CollapsibleMatrixDemo } from "@components/charts/CollapsibleMatrix";

function App() {
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  const toggleItemsDetails = () => setShowItemDetails((prev) => !prev);
  const toggleExpandAll = () => setExpandAll((prev) => !prev);

  return (
    <div className="tw:@container">
      <div className="tw:min-h-screen">
        <Header />
        <main className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:flex tw:flex-col tw:h-full tw:justify-center tw:px-4">
          <div className="tw:grid tw:grid-cols-3 tw:gap-4 tw:py-8 tw:justify-items-center">
            <div className="tw:card tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">Patient Info</h2>
                <p>Name: John Doe</p>
                <p>Examination period: 2024-2025</p>
              </div>
            </div>
            <div className="tw:card tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">PROM Info</h2>
                <p>EQ-5D-5L: Beschreibung/LINK </p>
                <p>SF-12: Beschreibung/LINK </p>
              </div>
            </div>
             <div className="tw:card tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">Data Info</h2>
                <p>Total number of questoinnaires: 5</p>
                <p>Number of different questoinnaires: 2</p>
              </div>
            </div>
          </div>
          <div className="tw:divider"/>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <LineChart />
          </div>
          <div className="tw:divider"/>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={true} />
          </div>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={false} />
          </div>
          <div className="tw:divider"/>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            {/* <div className="tw:text-center"> */}
            <button onClick={toggleItemsDetails} className="tw:btn">
              {showItemDetails ? "Show Dimensions Only" : "Show Item Details"}
            </button>
            {/* </div> */}
            <Matrix showItemDetails={showItemDetails} />
          </div>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <button onClick={toggleExpandAll} className="tw:btn">
              {expandAll ? "Collapse All" : "Expand All"}
            </button>
            <CollapsibleMatrixDemo allExpanded={expandAll} />
          </div>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <ExpandableMatrixDemo />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
