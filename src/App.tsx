import "@styles/style.css";
import { useState, useMemo } from "react";
import LineChart from "@components/LineChart";
import Header from "src/layouts/Header";
import Footer from "src/layouts/Footer";
import { BarChart } from "@components/BarChart";
import Matrix from "@components/Matrix";
import { ExpandableMatrixDemo } from "@components/ExpandableMatrix";
import { CollapsibleMatrixDemo } from "@components/CollapsibleMatrix";
import { createChartData } from "@utils/dataTransformation";

import { mockPatient } from "./mock/mockPatient";
import type { Visualization } from "@customTypes/visualization";


function App() {
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [showScoreChart, setShowScoreChart] = useState(true);

  const toggleItemsDetails = () => setShowItemDetails((prev) => !prev);
  const toggleExpandAll = () => setExpandAll((prev) => !prev);

  const scoreChartTitle = "Scores";

  const chartData = useMemo(() => 
    createChartData(mockPatient.proms), [mockPatient.proms]
  );
  const chartXData = chartData.xData;
  const chartScoreData = chartData.yScoreData?.map((score) => {
    return {
      name: score.name,
      data: score.data
    } as Visualization.DataSeries
  });
  const chartItemsData  = chartData.yItemsData;

  if ( chartScoreData === undefined) {
    setShowScoreChart(false);
  }


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
            { showScoreChart && chartScoreData && <LineChart 
              title={scoreChartTitle} 
              xData={chartXData} 
              yData={chartScoreData} /> }
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
