import "@styles/style.css";
import React, { useState, useMemo } from "react";
import LineChart from "@components/LineChart";
import RadarChart from "@components/RadarChart";
import _ from "lodash";

// import Header from "src/layouts/Header";
// import Footer from "src/layouts/Footer";
// import { BarChart } from "@components/BarChart";
// 
import Matrix from "@components/Matrix";
import Table from "@components/Table";
// import { ExpandableMatrixDemo } from "@components/ExpandableMatrix";
// import CollapsibleMatrix from "@components/CollapsibleMatrix";
import Collapse from "@components/Collapse";
import { createChartData, createRadarData } from "@utils/dataTransformation";

import { mockPatient } from "./mock/mockPatient";
import type { Visualization } from "@customTypes/visualization";
import { globalDimension, ITEM_TYPES } from "@utils/constants";
// import type { PromData } from "@customTypes/promData";

import { 
  getUniqueQuestionnaires, 
  calculatePeriodOfObservations, 
  sortDimensions, 
  createDateQuestionnairesRecord, 
  createQuestionnaireChartDataRecord, 
  createDimensionChartDataRecord } from "@utils/helpers";

function App() {
  // const [showItemDetails, setShowItemDetails] = useState(false);
  // const [expandAll, setExpandAll] = useState(false);
  const [showScoreChart, setShowScoreChart] = useState(true);

  // const toggleItemsDetails = () => setShowItemDetails((prev) => !prev);
  // const toggleExpandAll = () => setExpandAll((prev) => !prev);


  const patientData = useMemo(() => {
    return mockPatient;
  }, [mockPatient]);

  const questionnaires = getUniqueQuestionnaires(patientData.proms);

  const questionnairesByDate: Record<string, string[]> = createDateQuestionnairesRecord(patientData.proms);

  const chartData = createChartData(patientData.proms);
  console.log("Chart Data: ", chartData)

  const chartGlobalScoreData = chartData.yData.filter(dataseries => 
    dataseries.seriesType === ITEM_TYPES.score && dataseries.dimension === globalDimension
  );
  const chartDimensionScoreData = chartData.yData.filter(dataseries => 
    dataseries.seriesType === ITEM_TYPES.score && dataseries.dimension !== globalDimension
  );
  console.log("Scores: ", chartGlobalScoreData)
  console.log("Dimension Scores: ", chartDimensionScoreData)

  const itemDataSeries = chartData.yData.filter(dataseries => 
    dataseries.seriesType === ITEM_TYPES.item
  );
  console.log("Items: ", itemDataSeries)

  const scoreDataSeries = [...chartGlobalScoreData, ...chartDimensionScoreData];
  console.log("All Scores: ", scoreDataSeries)

  const chartDimensions = [...new Set([
    ...itemDataSeries.map(item => item.dimension),
    ...scoreDataSeries.map(score => score.dimension),
  ])];
  
  const dimensions = sortDimensions(chartDimensions);
  console.log("Sorted Dimensions: ", dimensions)

  // const unusedDimensions = _.difference(DIMENSIONS, chartDimensions);

  // group chartData by dimension for Matrix
  // TO add: sort scores and items within each dimension by their values (e.g. mean or min)
  // and do not show items which are part of score calculation. 
  // FILTER ITEMS
  const chartDataByDimension: Record<string, Visualization.ChartData> = createDimensionChartDataRecord(dimensions, questionnaires, scoreDataSeries, itemDataSeries, chartData.xData);
  console.log("Chart Data by Dimension: ", chartDataByDimension)
  

  //const matrixData = createMatrixData(patientData.proms, chartData);
  //console.log("Matrix Data: ", matrixData);


  // const matrixDimensions = createMatrixDimensionsData(
  //   patientData.proms,
  //   chartItemsData,
  //   chartScoreData,
  // );
  //console.log(matrixDimensions);  

  // group chartData by questionnaireId for table
  const chartDataByQuestionnaire: Record<string, Visualization.ChartData> = createQuestionnaireChartDataRecord(questionnaires, chartData);
  console.log("Chart Data by Questionnaire: ", chartDataByQuestionnaire)

  const radarChartData = createRadarData(chartData);
  console.log("Radar Chart Data: ", radarChartData);

  const periodOfObservations = calculatePeriodOfObservations(patientData.proms);


  const scoreChartSubTitle = Array.from(
    new Set(
      Object.values(patientData.proms).map((questionnaireResponse) => {
        return questionnaireResponse.questionnaire.name;
      }),
    ),
  );

  if (chartGlobalScoreData === undefined) {
    setShowScoreChart(false);
  }

  


  return (
    <div className="tw:@container">
      <div className="tw:min-h-screen">
        {/* <Header /> */}
        <main className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-4">
        
          <div className="tw:flex tw:flex-col tw:md:flex-row tw:gap-8 tw:py-16 tw:justify-center tw:items-start">
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md"> {/* tw:col-span-3 tw:sm:col-span-3 tw:lg:col-span-1*/}
              <div className="tw:card-body">
                <h2 className="tw:card-title">Patient Info</h2>
                <p>Name: <b>{mockPatient.name}</b></p>
              </div>
            </div>
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">PROM Info</h2>
                {questionnaires.map((questionnaire) => (
                  <p key={questionnaire.id}>{questionnaire.name}: {questionnaire.url ? 
                    <a className="tw:link tw:link-hover" target="_blank" href={questionnaire.url} rel="noopener noreferrer">
                      {questionnaire.url}
                    </a> : "No URL available"}
                  </p>
                ))}
              </div>
            </div>
            <div className="tw:card tw:lg:basis-1/3 tw:xl:basis-md tw:bg-base-100 tw:shadow-md">
              <div className="tw:card-body">
                <h2 className="tw:card-title">Data Info</h2>
                {/* <p>Total number of questionnaires: {Object.keys(patientData.proms).length}</p>
                <p>Number of different questionnaires: {questionnaires.length}</p>
                <p>Period of observations: {calculatePeriodOfObservations(patientData.proms)}</p> */}
                <p>Date | Completed Questionnaires</p>
                {Object.entries(questionnairesByDate).map(([date, questionnaires]) => (
                  <p key={date}>{date}: {questionnaires.join(", ")}</p>
                ))}
                <p>
                  A total of {Object.keys(patientData.proms).length} questionnaires were completed 
                  {periodOfObservations.length > 1 && ` between ${periodOfObservations[0]} and ${periodOfObservations[1]}`}
                  {periodOfObservations.length === 1 && ` in ${periodOfObservations[0]}`}.
                </p>
              </div>
            </div>
          </div>
          {/* <div className="tw:divider" /> */}

          <div className="tw:grid tw:grid-cols-15 tw:item-center tw:py-4">
              <div className="tw:col-span-15 tw:lg:col-span-6 tw:2xl:col-span-5">
              <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">Health Indication</p>
              <RadarChart
                data={radarChartData}
                //subtitle={"Health indication per dimension where points closer to edges indicate better health status"}
              />
              </div>
           
          {/* </div>
          
          <div className="tw:flex-1 tw:item-center tw:py-4"> */}
          <div className="tw:col-span-15 tw:lg:col-span-9 tw:2xl:col-span-10">
            {showScoreChart && chartGlobalScoreData && (
              <>
              <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">Global Health Scores (Normalized)</p>
              <LineChart
                subtitle={"Questionnaires: " +scoreChartSubTitle.join(", ")}
                data={{ xData: chartData.xData, yData: chartGlobalScoreData }}
              />
              </>
            )}
          </div>
           
          </div>
          {/* <div className="tw:divider" /> */}
          {/* <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={true} />
          </div>
          <div className="tw:flex-1 tw:item-center tw:py-4">
            <BarChart timeXAxis={false} />
          </div> */}
          {/* <div className="tw:divider"/> */}
          {/* <div className="tw:flex-1 tw:item-center tw:py-4">
            
            <button onClick={toggleItemsDetails} className="tw:btn">
              {showItemDetails ? "Show Dimensions Only" : "Show Item Details"}
            </button>
           
            <Matrix showItemDetails={showItemDetails} />
          </div> */}

          {/* <div className="tw:flex-1 tw:py-8">
            <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>   
            <Matrix data={chartData} />
            
          </div>
          </div> */}
          <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">Selected PROM-Data by Dimensions</p>

          <div className="tw:grid tw:grid-cols-6 tw:py-8">
            {/* <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>    */}
              {dimensions.map((dimension) => (
                <div className="tw:col-span-6 tw:md:col-span-3 tw:lg:col-span-2" key={dimension}>
                  <p className="tw:text-lg tw:font-bold tw:text-[#333]">{dimension}</p>
                  <Matrix data={chartDataByDimension[dimension]} />
                </div>   
              ))
              }
              {/* {unusedDimensions.map((dimension) => (
                <React.Fragment key={dimension}>
                  <p className="tw:text-lg tw:font-bold tw:text-[#333]">{dimension}</p>
                  <Collapse title={dimension} children={"No data available"}/>
                </React.Fragment>
              ))
              } */}
            {/* </div> */}
          </div>

          <p className="tw:text-xl tw:font-bold tw:text-center tw:text-[#333]">Complete PROM-Data by Questionnaire</p>

          <div className="tw:flex-1 tw:py-8">
            <div className="tw:join tw:join-vertical tw:bg-base-100" style={{display: "flex", alignItems: "center"}}>   
            {questionnaires.map((questionnaire) => (
              <React.Fragment key={questionnaire.id}>
              <Collapse title={questionnaire.name} children={<Table data={chartDataByQuestionnaire[questionnaire.id]} />}/>
              </React.Fragment>
            ))
            }
          </div>
          </div>

          {/* <div className="tw:flex-1 tw:item-center tw:py-4"> */}
            {/* <button onClick={toggleExpandAll} className="tw:btn">
              {expandAll ? "Collapse All" : "Expand All"}
            </button> */}
            {/* <CollapsibleMatrix
              columns={chartXData}
              dimensions={matrixDimensions}
              allRowsExpanded={expandAll}
            />
          </div> */}
          
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default App;
