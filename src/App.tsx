// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library, type IconProp } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
library.add(fas);

// React packages
import React, { useState, useEffect } from "react";
import * as _ from "lodash-es";

// Components
import LineChart from "@components/LineChart";
import Collapse from "@components/Collapse";
import RadarChart from "@components/RadarChart";
import MappingTable from "@components/MappingTable";
import ErrorCard from "@components/ErrorCard";
import GridTable from "@components/GridTable";
import FilterOptionsDisplay from "@components/FilterOptionsDisplay";
import SidebarToggle from "@components/SidebarToggle";
import ErrorPage from "@components/ErrorPage";
import DataLoadingScreen from "@components/DataLoadingScreen";
import { Tooltip } from "react-tooltip";
import Portal from "@components/Portal";
import DataTable from "@components/DataTable";
import NoData from "@components/NoData";
import LineChartGroup from "@components/LineChartGroup";
import DownloadImageButton from "@components/DownloadImageButton";
import DateSlider from "@components/DateSlider";

// Types
import { type Errors, forwardErrorsToUser } from "@utils/errors";
import type { Visualization } from "@utils/visualization";
import type { Mapping } from "@utils/mapping";
import type { Config } from "@utils/config";

// Chart options
import {
  singleLineChartOptions,
  justYAxisLineChartOptions,
  groupedLineChartOptions,
  emptyLineChartOptions,
  justXAxisLineChartOptions,
  radarChartOptions,
} from "@utils/charts";

// Services
import { loadConfig } from "@services/loadConfig";
import {
  loadFhirQuestionnaires,
  loadFhirQuestionnaireResponses,
  loadFhirBundles,
  loadFhirObservationDefinitions,
  loadFhirObservations,
} from "@services/loadFhirData";

// Helper functions

// FHIR
import {
  normalizeQuestionnaireResponse,
  normalizeQuestionnaire,
  normalizeObservation,
  normalizeObservationDefinition,
  // normalizeBundle,
} from "@utils/fhir";

// Mapping
import {
  mapNormalizedObservationToPromDataObservation,
  mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse,
  mapNormalizedQuestionnaireToPromDataQuestionnaire,
  mapNormalizedObservationDefinitionToPromDataObservationDefinition,
} from "@utils/mapping";

// Visualization
import {
  createChartData,
  // calculatePeriodOfObservations,
  sortDomains,
  groupQuestionnaireNamesByDate,
  createTableData,
  createDomainQuestionnaireNamesDimensionsRecord,
  extractGlobalScoresDataSeries,
  extractDomainScoresDataSeries,
  extractDimensionScoresDataSeries,
  extractDomainDataSeries,
  extractItemsDataSeries,
  // createQuestionnaireMostRecentResponseDateRecord,
  createDomainDimensionsRecord,
  filterQuestionnaireResponsesThatAreWithinDates,
  filterQuestionnaireResponsesThatAreOnSingleDates,
  filterQuestionnaireResponsesByQuestionnaireIds,
  extractDatesOfQuestionnaireResponses,
  createPseudoDataSeries,
  createDomainDimensionQuestionnaireTupleArray,
  createDimensionWithQuestionnaireByDomainRecord,
  truncateAtWord,
  sortDates,
  createQuestionnaireDatesRecord,
  getDatesWithinRange,
  filterDataSeriesDataAndDatesForCommonNullValues,
} from "@utils/visualization";

// Config
import {
  addConfigurationsToQuestionnaire,
  addConfigurationsToQuestionnaireResponse,
  extractQuestionnairesFromConfig,
  findQuestionnairesNotListedInConfig,
  extractGlobalHealthDomainsFromConfig,
  extractDomainsFromConfig,
} from "@utils/config";

// export
import {
  buildExportFileName,
  createAndDownloadCSV,
} from "@utils/export";
import { getDateFormatPattern } from "@utils/dateFormat";

function App() {
  // React states
  // Data loading
  const [dataLoaded, setDataLoaded] = useState({
    config: false,
    fhirData: false,
  });
  const [fhirError, setFhirError] = useState<string | null>(null);
  const [config, setConfig] = useState<Config.PromConfig>();
  const [configError, setConfigError] = useState<string | null>(null);
  const [questionnairesReady, setQuestionnairesReady] = useState(false);

  // Data pipeline
  const [fhirQuestionnaires, setFhirQuestionnaires] = useState<any[]>([]);
  const [fhirQuestionnaireResponses, setFhirQuestionnaireResponses] = useState<
    any[]
  >([]);
  const [fhirObservationDefinitions, setFhirObservationDefinitions] = useState<
    any[]
  >([]);
  const [fhirObservations, setFhirObservations] = useState<any[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Mapping.Questionnaire[]>(
    [],
  );
  const [questionnaireResponses, setQuestionnaireResponses] = useState<
    Record<string, Mapping.QuestionnaireResponse>
  >({});
  const [dataIssues, setDataIssues] = useState<Errors.DataIssue[]>([]);
  const [dataIssuesForUser, setDataIssuesForUser] = useState<
    Errors.DataIssue[]
  >([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [showItemsForDomain, setShowItemsForDomain] = useState<
    Record<string, boolean>
  >({});

  // Data transformation
  const [questionnaireNamesByDate, setQuestionnaireNamesByDate] = useState<
    Record<string, string[]>
  >({});

  // const [periodOfObservations, setPeriodOfObservations] = useState<string[]>(
  //   [],
  // );

  // const [questionnaireResponsesForChart, setQuestionnaireResponsesForChart] =
  //   useState<Record<string, Mapping.QuestionnaireResponse>>({});
  // const [questionnairesForChart, setQuestionnairesForChart] = useState<
  //   Mapping.Questionnaire[]
  // >([]);
  // const [scoreChartSubTitle, setScoreChartSubTitle] = useState<string[]>([]);
  // const [globalScoreChartData, setGlobalScoreChartData] = useState<
  //   Visualization.DataSeries[] | undefined
  // >();

  // Visualization
  const [tableDataByQuestionnaire, setTableDataByQuestionnaire] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [heatmapDataByDomain, setHeatmapDataByDomain] = useState<
    Record<string, Visualization.ChartData>
  >({});
  const [questionnaireCardData, setQuestionnaireCardData] = useState<
    Record<string, [string, string[]]>
  >({});
  // const [
  //   questionnairesWithMostRecentResponseDate,
  //   setQuestionnairesWithMostRecentResponseDate,
  // ] = useState<Record<string, string>>({});
  const [chartXData, setChartXData] = useState<string[]>([]);
  const [globalScoresDataSeries, setGlobalScoresDataSeries] = useState<
    Visualization.DataSeries[]
  >([]);
  const [
    dimensionScoresDataSeriesByDomain,
    setDimensionScoresDataSeriesByDomain,
  ] = useState<Record<string, Visualization.DataSeries[]>>({});
  const [
    itemDataSeriesByDomainAndDimension,
    setItemDataSeriesByDomainAndDimension,
  ] = useState<Record<string, Record<string, Visualization.DataSeries[]>>>({});
  const [
    dimensionsWithQuestionnaireByDomain,
    setDimensionsWithQuestionnaireByDomain,
  ] = useState<Record<string, [string, string][]>>();
  const [domainsForChart, setDomainsForChart] = useState<string[]>([]);
  const [dimensionsByDomain, setDimensionsByDomain] = useState<
    Record<string, string[]>
  >({});
  const [
    lengthOfLongestQuestionnaireName,
    setLengthOfLongestQuestionnaireName,
  ] = useState<number>(0);
  const [itemWarningsByQuestionnaireId, setItemWarningsByQuestionnaireId] =
    useState<Record<string, Errors.DataIssue[]>>({});
  const [
    allDatesOfQuestionnaireResponses,
    setAllDatesOfQuestionnaireResponses,
  ] = useState<string[]>([]);
  // const [datesOfSelectedQuestionnaires, setDatesOfSelectedQuestionnaires] = useState<string[]>([]);
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState<
    string[]
  >([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedDimensionsByDomain, setSelectedDimensionsByDomain] = useState<
    Record<string, string[]>
  >({});
  // const [displayedQuestionnaires, setDisplayedQuestionnaires] = useState<Mapping.Questionnaire[]>([]);
  const [displayedQuestionnaireResponses, setDisplayedQuestionnaireResponses] = useState<Record<string, Mapping.QuestionnaireResponse>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [dateValue, setDateValue] = useState<string>("");
  const [dateRange, setDateRange] = useState<Visualization.RangeState>({
    start: "",
    end: "",
  });
  const [filteredSelectedQuestionnaires, setFilteredSelectedQuestionnaires] = useState<string[]>([]);
  const [filteredSelectedDates, setFilteredSelectedDates] = useState<string[]>([]);
  const [inactiveQuestionnaires, setInactiveQuestionnaires] = useState<string[]>([]);
  const [inactiveDates, setInactiveDates] = useState<string[]>([]);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [radarChartDate, setRadarChartDate] = useState<string>("");
  const [radarChartDates, setRadarChartDates] = useState<string[]>([]);

  const [dateFormatPattern, setDateFormatPattern] = useState<string>("");
  const [datesByQuestionnaireId, setDatesByQuestionnaireId] = useState<Record<string, string[]>>({});

  // Load data
  useEffect(() => {
    // Config
    const fetchConfig = async () => {
      try {
        const result = await loadConfig();
       
        setConfig(result);
        setDataLoaded((prev) => ({ ...prev, config: true }));
        
      } catch (error) {
        console.error("Error fetching config file:", error);
        setConfigError("Error fetching config file: " + error);
      }
    };

    // FHIR Data
    const loadFhirData = async () => {
      try {
        const questionnaires = await loadFhirQuestionnaires();
        const responses = await loadFhirQuestionnaireResponses();
        const bundles = await loadFhirBundles();
        const observationDefinitions = await loadFhirObservationDefinitions();
        const observations = await loadFhirObservations();

        // extract bundles and add to questionnaires and responses
        let bundleQuestionnaires: any[] = [];
        let bundleResponses: any[] = [];
        let bundleObservations: any[] = [];
        bundles.forEach((bundle) => {
          const questionnaireEntries = bundle.entry.filter(
            (entry: any) => entry.resource.resourceType === "Questionnaire",
          );
          const responseEntries = bundle.entry.filter(
            (entry: any) =>
              entry.resource.resourceType === "QuestionnaireResponse",
          );
          const observationEntries = bundle.entry.filter(
            (entry: any) => entry.resource.resourceType === "Observation",
          );
          bundleQuestionnaires.push(
            ...questionnaireEntries.map((entry: any) => entry.resource),
          );
          bundleResponses.push(
            ...responseEntries.map((entry: any) => entry.resource),
          );
          bundleObservations.push(
            ...observationEntries.map((entry: any) => entry.resource),
          );
        });

        // set variables
        setFhirQuestionnaires([...questionnaires, ...bundleQuestionnaires]);
        setFhirQuestionnaireResponses([...responses, ...bundleResponses]);
        setFhirObservations([...observations, ...bundleObservations]);
        setFhirObservationDefinitions([...observationDefinitions]);
        setDataLoaded((prev) => ({ ...prev, fhirData: true }));
      } catch (error) {
        console.error("Error loading FHIR data: ", error);
        setFhirError("Error loading FHIR data: " + error);
      }
    };

    fetchConfig();
    loadFhirData();
  }, []);

  // Process data through pipeline
  useEffect(() => {
    // Don't process until all data is loaded
    if (!dataLoaded.config || !dataLoaded.fhirData) {
      return;
    }
    const errors: Errors.DataIssue[] = [];

    // only questionnaires and responses that are defined in config file
    const questionnairesInConfig: string[] = config !== undefined ? extractQuestionnairesFromConfig(config) : [];

    /* ----------------------- Normalize FHIR data ------------------------*/
    /* Questionnaires */
    const normalizedFhirQuestionnairesResult = fhirQuestionnaires
      .map((questionnaire) => normalizeQuestionnaire(questionnaire))
      .filter((result) => questionnairesInConfig.includes(result.data.url));
    const normalizedFhirQuestionnaires = normalizedFhirQuestionnairesResult.map(
      (questionnaire) => questionnaire.data,
    );
    const normalizedFhirQuestionnaireIssues =
      normalizedFhirQuestionnairesResult.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...normalizedFhirQuestionnaireIssues);
    console.log(
      "Normalized FHIR Questionnaires: ",
      normalizedFhirQuestionnaires,
    );

    /* Questionnaire Responses */
    const allNormalizedFhirQuestionnaireResponsesResult =
      fhirQuestionnaireResponses.map((response) =>
        normalizeQuestionnaireResponse(response, normalizedFhirQuestionnaires),
      );
    const allNormalizedFhirQuestionnaireResponses =
      allNormalizedFhirQuestionnaireResponsesResult.map(
        (response) => response.data,
      );
    const normalizedFhirQuestionnaireResponsesResult =
      allNormalizedFhirQuestionnaireResponsesResult.filter(
        (result) =>
          result.data !== undefined &&
          result.data.questionnaire !== undefined &&
          questionnairesInConfig.includes(result.data.questionnaire),
      );
    const normalizedFhirQuestionnaireResponses =
      normalizedFhirQuestionnaireResponsesResult.map(
        (response) => response.data,
      );

    const questionnairesNotInConfigResult = findQuestionnairesNotListedInConfig(
      questionnairesInConfig,
      allNormalizedFhirQuestionnaireResponses,
      normalizedFhirQuestionnaires,
    );
    if (questionnairesNotInConfigResult.issues.length > 0) {
      errors.push(...questionnairesNotInConfigResult.issues);
    }
    const normalizedFhirQuestionnaireResponseIssues =
      normalizedFhirQuestionnaireResponsesResult.flatMap(
        (response) => response.issues,
      );
    errors.push(...normalizedFhirQuestionnaireResponseIssues);
    console.log(
      "Normalized FHIR Questionnaire Responses: ",
      normalizedFhirQuestionnaireResponses,
    );

    /* Observations */
    const normalizedFhirObservationsResult = fhirObservations.map(
      (observation) => normalizeObservation(observation),
    );
    const normalizedFhirObservations = normalizedFhirObservationsResult.map(
      (observation) => observation.data,
    );
    const normalizedFhirObservationIssues =
      normalizedFhirObservationsResult.flatMap(
        (observation) => observation.issues,
      );
    errors.push(...normalizedFhirObservationIssues);
    console.log("Normalized FHIR Observations: ", normalizedFhirObservations);

    /* Observation Definitions */
    const normalizedFhirObservationDefinitionsResult =
      fhirObservationDefinitions.map((observationDefinition) =>
        normalizeObservationDefinition(observationDefinition),
      );
    const normalizedFhirObservationDefinitions =
      normalizedFhirObservationDefinitionsResult.map(
        (observationDefinition) => observationDefinition.data,
      );
    const normalizedFhirObservationDefinitionIssues =
      normalizedFhirObservationDefinitionsResult.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    errors.push(...normalizedFhirObservationDefinitionIssues);
    console.log(
      "Normalized FHIR Observation Definitions: ",
      normalizedFhirObservationDefinitions,
    );

    /* ----------------------- Mapping ------------------------ */
    /* Questionnaires */
    const promDataQuestionnairesResult = normalizedFhirQuestionnaires.map(
      (questionnaire) =>
        mapNormalizedQuestionnaireToPromDataQuestionnaire(questionnaire),
    );
    const promDataQuestionnaires = promDataQuestionnairesResult.map(
      (questionnaire) => questionnaire.data,
    );
    const promDataQuestionnaireIssues = promDataQuestionnairesResult.flatMap(
      (questionnaire) => questionnaire.issues,
    );
    errors.push(...promDataQuestionnaireIssues);
    console.log("Mapping Questionnaires: ", promDataQuestionnaires); // ok

    /* QuestionnaireResponses */
    const questionnaireResponsesResult =
      normalizedFhirQuestionnaireResponses.map((response) =>
        mapNormalizedQuestionnaireResponseToPromDataQuestionnaireResponse(
          response,
          promDataQuestionnaires,
        ),
      );
    const promDataQuestionnaireResponses = questionnaireResponsesResult.map(
      (questionnaireResponse) => questionnaireResponse.data,
    );
    console.log(
      "Mapping Questionnaire Responses: ",
      promDataQuestionnaireResponses,
    );
    const promDataQuestionnaireResponseIssues =
      questionnaireResponsesResult.flatMap(
        (questionnaireResponse) => questionnaireResponse.issues,
      );
    errors.push(...promDataQuestionnaireResponseIssues);

    /* Observations */
    const promDataObservationsResult = normalizedFhirObservations
      .map((observation) =>
        mapNormalizedObservationToPromDataObservation(observation),
      )
      .filter((result) =>
        promDataQuestionnaireResponses
          .map((response) => response.id)
          .includes(result.data.questionnaireResponse),
      );
    console.log(
      "Mapping Observations with Error Messages: ",
      promDataObservationsResult,
    );
    const promDataObservations = promDataObservationsResult.map(
      (observation) => observation.data,
    );
    const promDataObservationIssues = promDataObservationsResult.flatMap(
      (observation) => observation.issues,
    );
    console.log("Mapping Observation Issues: ", promDataObservationIssues);
    errors.push(...promDataObservationIssues);
    console.log("Mapping Observations: ", promDataObservations); // ok

    /* ObservationDefinitions */
    const promDataObservationDefinitionsResult =
      normalizedFhirObservationDefinitions
        .map((observationDefinition) =>
          mapNormalizedObservationDefinitionToPromDataObservationDefinition(
            observationDefinition,
          ),
        )
        .filter((result) =>
          promDataObservations
            .map((observation) => observation.observationDefinition)
            .includes(result.data.url),
        );

    const promDataObservationDefinitions =
      promDataObservationDefinitionsResult.map(
        (observationDefinition) => observationDefinition.data,
      );
    const promDataObservationDefinitionIssues =
      promDataObservationDefinitionsResult.flatMap(
        (observationDefinition) => observationDefinition.issues,
      );
    errors.push(...promDataObservationDefinitionIssues);
    console.log(
      "Mapping Observation Definitions: ",
      promDataObservationDefinitions,
    );

    // Filter errors for Observations and Observation Definitions
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.resourceType === "Observation") {
        const observation = promDataObservations.find(
          (observation) => observation.id === error.context.resourceId,
        );
        if (observation === undefined) {
          errors.splice(i, 1);
          i = i - 1;
        }
      }
      if (error.resourceType === "ObservationDefinition") {
        const observationDefinition = promDataObservationDefinitions.find(
          (observationDefinition) =>
            observationDefinition.id === error.context.resourceId,
        );
        if (observationDefinition === undefined) {
          errors.slice(i, 1);
          i = i - 1;
        }
      }
    }

    /* ----------------------- Add config data ------------------------ */
    /* Questionnaire */
    let promDataQuestionnairesWithConfigurations = promDataQuestionnaires;
    let promDataQuestionnaireResponsesWithConfigurations = promDataQuestionnaireResponses;
    let domainsFromConfig: string[] = []
    if (config !== undefined) {
    const promDataQuestionnairesWithConfigurationsAndErrorMessages =
      promDataQuestionnaires.map((questionnaire) => {
        const responses = promDataQuestionnaireResponses.filter((response) => response.questionnaire === questionnaire);
        const observations = promDataObservations.filter((obs) => responses.map((res) => res.id).includes(obs.questionnaireResponse));
        const observationDefinitions = promDataObservationDefinitions.filter((obsDef) => observations.map((obs) => obs.observationDefinition).includes(obsDef.url));
        return addConfigurationsToQuestionnaire(
          questionnaire,
          observationDefinitions,
          config,
        );
      });
    promDataQuestionnairesWithConfigurations =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.map(
        (questionnaire) => questionnaire.data,
      );
    const promDataQuestionnaireConfigurationIssues =
      promDataQuestionnairesWithConfigurationsAndErrorMessages.flatMap(
        (questionnaire) => questionnaire.issues,
      );
    errors.push(...promDataQuestionnaireConfigurationIssues);
    console.log(
      "Mapping Questionnaires with Configurations: ",
      promDataQuestionnairesWithConfigurations,
    );

    /* Questionnaire Response */
    const promDataQuestionnaireResponsesWithConfigurationsAndErrorMessages =
      promDataQuestionnaireResponses.map((questionnaireResponse) =>
        addConfigurationsToQuestionnaireResponse(
          questionnaireResponse,
          promDataObservations,
          config,
        ),
      );
    promDataQuestionnaireResponsesWithConfigurations =
      promDataQuestionnaireResponsesWithConfigurationsAndErrorMessages.map(
        (response) => response.data,
      );
    const promDataQuestionnaireResponsesConfigurationIssues =
      promDataQuestionnaireResponsesWithConfigurationsAndErrorMessages.flatMap(
        (response) => response.issues,
      );
    errors.push(...promDataQuestionnaireResponsesConfigurationIssues);
    console.log(
      "Mapping Questionnaire Responses with Configurations: ",
      promDataQuestionnaireResponsesWithConfigurations,
    );

    // Domains
    // const globalHealthDimensionsFromConfig =
    //   extractGlobalHealthDimensionsFromConfig(config);
    const domainRecordFromConfig = extractDomainsFromConfig(config);
    // const domainsFromConfig = Object.keys(domainCountFromConfig);
    console.log("domains from config: ", domainRecordFromConfig)
    const globalHealthDomainsFromConfig =
      extractGlobalHealthDomainsFromConfig(config);
    console.log(
      "Global Health Domains from Config: ",
      globalHealthDomainsFromConfig,
    );
    domainsFromConfig = sortDomains(
      domainRecordFromConfig,
      globalHealthDomainsFromConfig,
    );
    // const domainsWithUnspecifiedDomain = addUnspecifiedDimensionToDomains(domains);
  }

    /* ----------------------- Clean data ------------------------ */
    /* Questionnaire Response */
    const questionnaireResponseIdsWithErrors = errors
      .filter(
        (error) =>
          error.level === "error" &&
          error.resourceType === "QuestionnaireResponse" &&
          error.context.field === undefined,
      )
      .map((error) => error.context.resourceId);
    const linkIdsWithErrors = errors
      .filter(
        (error) => error.level === "error" && error.context.field !== undefined,
      )
      .map((error) => error.context.field);
    const promDataQuestionnaireResponsesWithoutErrors =
      promDataQuestionnaireResponses.filter(
        (questionnaireResponse) =>
          !questionnaireResponseIdsWithErrors.includes(
            questionnaireResponse.id,
          ),
      );
    const promDataQuestionnaireResponsesWithFilteredItems =
      promDataQuestionnaireResponsesWithoutErrors.map((response) => {
        const items: Record<string, Mapping.ResponseItem> = {};
        Object.keys(response.items).forEach((linkId) => {
          if (!linkIdsWithErrors.includes(linkId)) {
            items[linkId] = response.items[linkId];
          }
        });
        return {
          ...response,
          items: items,
        };
      });

    // Tranform Questionnaire Responses to Record
    // const questionnaireResponsesRecord: Record<
    //   string,
    //   Mapping.QuestionnaireResponse
    // > = {};
    // promDataQuestionnaireResponsesWithConfigurations.forEach(
    //   (questionnaireResponse) => {
    //     questionnaireResponsesRecord[questionnaireResponse.id] =
    //       questionnaireResponse;
    //   },
    // );
    // console.log(
    //   "Questionnaire Responses in Record: ",
    //   // questionnaireResponsesRecord,
    // );
    const questionnaireResponsesWithFilteredItems: Record<
      string,
      Mapping.QuestionnaireResponse
    > = {};
    promDataQuestionnaireResponsesWithFilteredItems.forEach(
      (questionnaireResponse) => {
        questionnaireResponsesWithFilteredItems[questionnaireResponse.id] =
          questionnaireResponse;
      },
    );
    console.log(
      "Filtered Questionnaire Responses in Record: ",
      questionnaireResponsesWithFilteredItems,
    );

    /* Errors and Warnings */
    const uniqueErrors = _.uniqBy(errors, (error) => error.id);
    const errorsForDisplay = errors.filter((error) => error.showUser);
    const uniqueErrorsForDisplay: Errors.DataIssue[] = _.uniqBy(
      errorsForDisplay,
      (error) => error.userMessage,
    );
    console.log("unique errors: ", uniqueErrors)
    console.log("Unique Errors for Display: ", uniqueErrorsForDisplay);

    /* Questionnaires */
    const questionnaires = _.uniqBy(
      promDataQuestionnairesWithConfigurations,
      (questionnaire) => questionnaire.url,
    );
    console.log("Questionnaires: ", questionnaires);

    const allResponseDates = extractDatesOfQuestionnaireResponses(
      questionnaireResponsesWithFilteredItems,
    );

    const dateFormat = getDateFormatPattern();

    // Set variables
    setQuestionnaires(questionnaires);
    setQuestionnaireResponses(questionnaireResponsesWithFilteredItems);
    setDataIssuesForUser(uniqueErrorsForDisplay); // ForDisplay
    setDataIssues(uniqueErrors);
    // setGlobalHealthDimensions(globalHealthDimensionsFromConfig);
    setDomains(domainsFromConfig);
    setQuestionnairesReady(true);
    setSelectedQuestionnaires(
      questionnaires.map((questionnaire) => questionnaire.id),
    );
    setAllDatesOfQuestionnaireResponses(allResponseDates);
    setSelectedDates(allResponseDates);
    setRadarChartDates(allResponseDates);
    setDateFormatPattern(dateFormat);
    // setDisplayedQuestionnaires(questionnaires);
    // setDisplayedQuestionnaireResponses(questionnaireResponsesWithFilteredItems);
  }, [
    fhirQuestionnaires,
    fhirQuestionnaireResponses,
    fhirObservationDefinitions,
    fhirObservations,
    dataLoaded,
  ]);

  // Data visualization

  useEffect(() => {
    if (!questionnairesReady) {
      return;
    }
    // if (dataIssues.length > 0 && !modalShown) {
    //   setIsModalOpen(true);
    // }

    // Questionnaires, Questionnaire Responses and domains for chart
    const questionnairesForChart = questionnaires.filter((questionnaire) =>
      selectedQuestionnaires.includes(questionnaire.id),
    );
    console.log("Questionnaires for Chart: ", questionnairesForChart);
    //const questionnaireResponsesForChart: Record<string, Mapping.QuestionnaireResponse> = questionnaireResponses;
    const questionnaireResponsesFilteredBySelectedQuestionnaires: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesByQuestionnaireIds(
      questionnaireResponses,
      selectedQuestionnaires,
    );
    const questionnaireResponsesFilteredBySelectedDates: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesThatAreOnSingleDates(
      questionnaireResponses,
      selectedDates,
    );
    const questionnaireResponsesFilteredBySelectedRange: Record<
      string,
      Mapping.QuestionnaireResponse
    > = filterQuestionnaireResponsesThatAreWithinDates(
      questionnaireResponses,
      dateRange.start,
      dateRange.end,
    );

    console.log(
      "Questionnaire Responses Filtered by Selected Questionnaires: ",
      questionnaireResponsesFilteredBySelectedQuestionnaires,
    );
    console.log(
      "Questionnaire Responses Filtered by Selected Dates: ",
      questionnaireResponsesFilteredBySelectedDates,
    );
    console.log(
      "Questionnaire Responses Filtered by Selected Range: ",
      questionnaireResponsesFilteredBySelectedRange,
    );

    const questionnaireResponseIdsForChart = _.intersection(
      Object.keys(questionnaireResponsesFilteredBySelectedQuestionnaires),
      Object.keys(questionnaireResponsesFilteredBySelectedDates),
      Object.keys(questionnaireResponsesFilteredBySelectedRange),
    );

    const questionnaireResponsesForChart: Record<
      string,
      Mapping.QuestionnaireResponse
    > = {};
    questionnaireResponseIdsForChart.forEach((id) => {
      questionnaireResponsesForChart[id] = questionnaireResponses[id];
    });
    // questionnaireResponsesFilteredBySelectedQuestionnaires && Object.keys(questionnaireResponsesFilteredBySelectedQuestionnaires).forEach((id) => {
    //   questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedQuestionnaires[id];
    // });
    // questionnaireResponsesFilteredBySelectedDates && Object.keys(questionnaireResponsesFilteredBySelectedDates).forEach((id) => {
    //   if (questionnaireResponsesForChart[id] === undefined) {
    //     questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedDates[id];
    //   }
    // });
    // questionnaireResponsesFilteredBySelectedRange && Object.keys(questionnaireResponsesFilteredBySelectedRange).forEach((id) => {
    //   if (questionnaireResponsesForChart[id] === undefined) {
    //     questionnaireResponsesForChart[id] = questionnaireResponsesFilteredBySelectedRange[id];
    //   }
    // });
    console.log(
      "Questionnaire Responses for Chart: ",
      questionnaireResponsesForChart,
    );

    const domainsForChart = domains.filter((domain) =>
      questionnairesForChart.some((questionnaire) =>
        Object.values(questionnaire.items).some(
          (item) => item.domain === domain,
        ),
      ),
    );
    console.log("Domains for Chart: ", domainsForChart);
    const questionnaireNamesByDate: Record<string, string[]> =
      groupQuestionnaireNamesByDate(questionnaireResponses);
    // const questionnaireMostRecentResponseDateRecord: Record<string, string> =
    //   createQuestionnaireMostRecentResponseDateRecord(questionnaireNamesByDate);

    // Chart Data
    const chartData = createChartData(questionnaireResponsesForChart);
    const allChartData = createChartData(questionnaireResponses);
    console.log("Chart Data: ", chartData);

    // Data series for different charts
    const chartDataSeriesByDomain: Record<string, Visualization.DataSeries[]> =
      {};
    const globalScoresDataSeries: Visualization.DataSeries[] =
      extractGlobalScoresDataSeries(chartData.yData, questionnairesForChart);
    const domainScoresDataSeriesByDomain: Record<
      string,
      Visualization.DataSeries[]
    > = {};
    const dimensionScoresDataSeriesByDomain: Record<
      string,
      Visualization.DataSeries[]
    > = {};
    const domainDimensionItemsDataSeriesRecord: Record<
      string,
      Record<string, Visualization.DataSeries[]>
    > = {};
    const selectedDimensionsByDomain: Record<string, string[]> = {};
    const showItemsFlagByDomain: Record<string, boolean> = {};

    domainsForChart.forEach((domain) => {
      chartDataSeriesByDomain[domain] = extractDomainDataSeries(
        chartData.yData,
        questionnairesForChart,
        domain,
      );
      // domain and dimension scores not necessarily disjoint!
      domainScoresDataSeriesByDomain[domain] = extractDomainScoresDataSeries(
        chartDataSeriesByDomain[domain],
        questionnairesForChart,
      );
      dimensionScoresDataSeriesByDomain[domain] =
        extractDimensionScoresDataSeries(
          chartDataSeriesByDomain[domain],
          questionnairesForChart,
          domainScoresDataSeriesByDomain[domain],
        );
      domainDimensionItemsDataSeriesRecord[domain] = extractItemsDataSeries(
        chartDataSeriesByDomain[domain],
        dimensionScoresDataSeriesByDomain[domain],
        questionnairesForChart,
      );
      selectedDimensionsByDomain[domain] = [];
      showItemsFlagByDomain[domain] = false;
    });

    console.log(
      "Dimension scores by domain: ",
      dimensionScoresDataSeriesByDomain,
    );

    console.log(
      "Items by domain and dimension: ",
      domainDimensionItemsDataSeriesRecord,
    );

    const dimensionsByDomain: Record<string, string[]> =
      createDomainDimensionsRecord(
        questionnairesForChart,
        dimensionScoresDataSeriesByDomain,
      );

    console.log("Dimensions by Domain: ", dimensionsByDomain);

    // const domainScoresDataSeries = chartData.yData.filter(
    //   (dataseries) =>
    //     dataseries.isDomainScore === true,
    // );
    // const dimensionScoresDataSeries = chartData.yData.filter(
    //   (dataseries) =>
    //     dataseries.isDimensionScore === true,
    // );
    // console.log("Scores: ", globalScoresDataSeries);
    // console.log("Dimension Scores: ", dimensionScoresDataSeries);

    // const itemsDataSeries = chartData.yData.filter(
    //   (dataseries) => dataseries.seriesType === ITEM_TYPES.item,
    // );
    // console.log("Items: ", itemsDataSeries);

    // const allScoresDataSeries =
    //   globalScoresDataSeries !== undefined
    //     ? [...globalScoresDataSeries, ...dimensionScoresDataSeries]
    //     : dimensionScoresDataSeries;
    // console.log("All Scores: ", allScoresDataSeries);

    // const chartDimensions = [
    //   ...new Set([
    //     ...itemDataSeries.map((item) => item.dimension),
    //     ...scoreDataSeries.map((score) => score.dimension),
    //   ]),
    // ];

    // Questionnaire Card
    // const questionnaireCardData = createQuestionnaireCardData(
    //   questionnairesForChart,
    // );
    // console.log("Questionnaire Card Data: ", questionnaireCardData);
    // const questionnaireNames = Object.keys(questionnaireCardData);
    // const longestQuestionnaireName = questionnaireNames.reduce(
    //   (longest, current) =>
    //     current.length > longest.length ? current : longest,
    //   "",
    // );
    // const lengthOfLongestQuestionnaireName = longestQuestionnaireName.length;

    // const scoreChartSubTitle = Array.from(
    //   new Set(
    //     Object.values(questionnaireResponsesForChart).map(
    //       (questionnaireResponse) => {
    //         return questionnaireResponse.questionnaire.name;
    //       },
    //     ),
    //   ),
    // );

    // Radar Chart
    // const mostRecentDomainScoresRadarData = createRadarData({
    //   xData: chartData.xData,
    //   yData: domainScoresDataSeriesByDomain});
    // console.log("Radar data: ", mostRecentDomainScoresRadarData)

    // Domain Dimension Mapping Sankey
    const domainQuestionnaireDimensionRecord =
      createDomainQuestionnaireNamesDimensionsRecord(
        dimensionScoresDataSeriesByDomain,
      );

    const domainDimensionQuestionnaireTuples =
      createDomainDimensionQuestionnaireTupleArray(
        dimensionScoresDataSeriesByDomain,
      );

    console.log(
      "Domain Questionnaire Dimension Record: ",
      domainQuestionnaireDimensionRecord,
    );
    console.log(
      "Domain Dimension Questionnaire Tuples: ",
      domainDimensionQuestionnaireTuples,
    );

    const domainDimensionWithQuestionnaireRecord =
      createDimensionWithQuestionnaireByDomainRecord(
        dimensionScoresDataSeriesByDomain,
      );
    console.log(
      "Domain Dimension With Questionnaire Record: ",
      domainDimensionWithQuestionnaireRecord,
    );

    // Heatmap
    // const heatmapDataByDomain: Record<string, Visualization.ChartData> =
    //   createHeatmapData(
    //     domainsForChart,
    //     chartData.yData,
    //     chartData.xData,
    //   );
    // console.log("Chart Data by Dimension: ", heatmapDataByDomain);

    // Table
    const tableDataByQuestionnaire: Record<string, Visualization.ChartData> =
      createTableData(questionnaires, allChartData);
    console.log("Table Data by Questionnaire: ", tableDataByQuestionnaire);

    // Header Cards
    // const resourceIdsWithIssues = dataIssues
    //   .map((issue) => issue.context.resourceId)
    //   .filter((id) => id !== undefined);
    // console.log("IDs of resources with issues: ", resourceIdsWithIssues);

    // const itemWarningsByQuestionnaireId = _.groupBy(
    //   dataIssues.filter(
    //     (issue) => issue.level === "warning" && issue.context.field !== undefined,
    //   ),
    //   (issue) => issue.context.resourceId,
    // );
    // console.log(
    //   "Item Warnings by Questionnaire ID: ",
    //   itemWarningsByQuestionnaireId,
    // );
    forwardErrorsToUser(dataIssues);

    // const periodOfObservations = calculatePeriodOfObservations(
    //   questionnaireResponses,
    // );

    const datesByQuestionnaire = createQuestionnaireDatesRecord(questionnaireResponses);

    const filteredDates = dateRange.start !== "" && dateRange.end !== "" ? getDatesWithinRange(selectedDates, [dateRange.start, dateRange.end]) : selectedDates;
    const filteredQuestionnaires = Object.entries(datesByQuestionnaire).filter(([_, dates]) => 
      dates.some((d) => filteredDates.includes(d))
      ).map(([qId, _]) => qId);
    const filteredSelectedQuestionnaires = _.intersection(selectedQuestionnaires, filteredQuestionnaires);
    const filteredSelectedDates = filteredDates.filter((d) => filteredSelectedQuestionnaires.some((q) => datesByQuestionnaire[q].includes(d)));
    const inactiveDates = _.difference(selectedDates, filteredSelectedDates);
    const inactiveQuestionnaires = _.difference(selectedQuestionnaires, filteredSelectedQuestionnaires);
    
    const datesOfSelectedQuestionnaires = _.uniq(Object.entries(datesByQuestionnaire).filter(([qId, _]) => 
      filteredSelectedQuestionnaires.includes(qId)
    ).flatMap(([_, dates]) => dates));
    const datesForRadarChart = _.intersection(datesOfSelectedQuestionnaires, filteredSelectedDates).sort((a, b) => sortDates(a, b, "ascending"));
    const dateForRadarChart = datesForRadarChart.includes(radarChartDate) ? radarChartDate : datesForRadarChart[datesForRadarChart.length - 1];

    // set variables
    // setDisplayedQuestionnaires(questionnairesForChart);
    setDisplayedQuestionnaireResponses(questionnaireResponsesForChart);
    setDomainsForChart(domainsForChart);
    setDimensionsByDomain(dimensionsByDomain);
    setChartXData(chartData.xData);
    setGlobalScoresDataSeries(globalScoresDataSeries);
    setDimensionScoresDataSeriesByDomain(dimensionScoresDataSeriesByDomain);
    setItemDataSeriesByDomainAndDimension(domainDimensionItemsDataSeriesRecord);
    setLengthOfLongestQuestionnaireName(lengthOfLongestQuestionnaireName);
    setQuestionnaireNamesByDate(questionnaireNamesByDate);
    setHeatmapDataByDomain(heatmapDataByDomain);
    setTableDataByQuestionnaire(tableDataByQuestionnaire);
    setItemWarningsByQuestionnaireId(itemWarningsByQuestionnaireId);
    setQuestionnaireCardData(questionnaireCardData);
    setSelectedDimensionsByDomain(selectedDimensionsByDomain);
    setShowItemsForDomain(showItemsFlagByDomain);
    setDimensionsWithQuestionnaireByDomain(
      domainDimensionWithQuestionnaireRecord,
    );
    // setQuestionnairesWithMostRecentResponseDate(
    //   questionnaireMostRecentResponseDateRecord,
    // );
    setRadarChartDates(datesForRadarChart);
    setRadarChartDate(dateForRadarChart);
    // setDatesOfSelectedQuestionnaires(datesOfSelectedQuestionnaires);
    setDatesByQuestionnaireId(datesByQuestionnaire);
    setFilteredSelectedDates(filteredSelectedDates);
    setFilteredSelectedQuestionnaires(filteredSelectedQuestionnaires);
    setInactiveDates(inactiveDates);
    setInactiveQuestionnaires(inactiveQuestionnaires);
    // setRadarChartData(radarData);
    // setPeriodOfObservations(periodOfObservations);
    // setScoreChartSubTitle(scoreChartSubTitle);
    // setIdsOfResourcesWithIssues(resourceIdsWithIssues);
  }, [
    questionnaires,
    questionnaireResponses,
    dataIssues,
    questionnairesReady,
    domains,
    selectedQuestionnaires,
    dateRange,
    selectedDates,
  ]);

  useEffect(() => {
    const isFilterActive = Object.keys(displayedQuestionnaireResponses).length !== Object.keys(questionnaireResponses).length;
    setIsFilterActive(isFilterActive);
  }, [
    displayedQuestionnaireResponses,
    questionnaireResponses,
  ]);

  // Handlers

  const toggleShowItemsForDomain = (domain: string) => {
    setShowItemsForDomain((prev) => {
      return {
        ...prev,
        [domain]: !prev[domain],
      };
    });
    console.log("Toggled showItemsFlagByDomain: ", showItemsForDomain);
  };

  const selectAllDomains = (domains: string[]) => {
    // if (selectAllDomains) {
    //   setSelectedDomains([]);
    //   setSelectedDimensionsByDomain({});
    // } else {
    //   setSelectedDomains(domains);
    // }
    // if (!allDomainsSelected) {
    setSelectedDomains(domains);
    // }
    // setAllDomainsSelected((prev) => !prev);
  };

  const selectAllDimensionsForDomain = (
    domain: string,
    dimensions: string[],
  ) => {
    setSelectedDimensionsByDomain((prev) => {
      return {
        ...prev,
        [domain]: dimensions,
      };
    });
    console.log(
      "Selected dimensions by domain (all selected): ",
      selectedDimensionsByDomain,
    );
  };

  const resetFilters = () => {
    const questionnaireIds = questionnaires.map(
      (questionnaire) => questionnaire.id,
    );
    const allDates = extractDatesOfQuestionnaireResponses(
      questionnaireResponses,
    );
    const dateForRadarChart = allDates[allDates.length - 1];
    setSelectedQuestionnaires(questionnaireIds);
    setSelectedDates(allDates);
    setDateRange({ start: "", end: "" });
    setDateValue("");
    setRadarChartDate(dateForRadarChart);
  };

  const handleQuestionnaireSelection = (questionnaireId: string) => {
    setSelectedQuestionnaires((prev) => {
      const index = prev.indexOf(questionnaireId);
      if (index === -1) {
        return [...prev, questionnaireId];
      } else {
        return prev.filter((id) => id !== questionnaireId);
      }
    });
    console.log("Selected Questionnaires: ", selectedQuestionnaires);
  };

  const handleDateSelection = (date: string) => {
    setSelectedDates((prev) => {
      const index = prev.indexOf(date);
      if (index === -1) {
        return [...prev, date].sort((a, b,) => sortDates(a, b, "ascending"));
      } else {
        return prev.filter((d) => d !== date);
      }
    });
    console.log("Selected Dates: ", selectedDates);
  };

  const handleDomainSelection = (domain: string) => {
    setSelectedDomains((prev) => {
      const index = prev.indexOf(domain);
      if (index === -1) {
        return [...prev, domain];
      } else {
        return prev.filter((d) => d !== domain);
      }
    });
    console.log("Selected Domains: ", selectedDomains);
  };

  const handleDimensionSelection = (domain: string, dimension: string) => {
    setSelectedDimensionsByDomain((prev) => {
      const selectedDimensions = prev[domain] || [];
      const index = selectedDimensions.indexOf(dimension);
      if (index === -1) {
        return {
          ...prev,
          [domain]: [...selectedDimensions, dimension],
        };
      } else {
        return {
          ...prev,
          [domain]: selectedDimensions.filter((d) => d !== dimension),
        };
      }
    });
    console.log("Selected Dimensions by Domain: ", selectedDimensionsByDomain);
  };

  const toggleShowErrors = () => {
    setShowErrors((prev) => !prev);
  };

  const handleRangeChange = (event: Event) => {
    if (event.type === "clear") {
      setDateRange({ start: "", end: "" });
      setDateValue("");
      return;
    }
    // Cast the target to access both value (start) and valueEnd (end)
    const target = event.target as HTMLInputElement;
    const cutPosition = target.value.indexOf("/");
    const start = target.value.substring(0, cutPosition);
    const end = target.value.substring(cutPosition + 1);
    console.log("Selected range: ", { start, end });
    setDateRange({
      start: start, // e.g., "2026-05-19"
      end: end, // e.g., "2026-05-26" (or empty string if not clicked yet)
    });
    setDateValue(target.value);
  };

  const selectDateForRadarChart = (date: string, dates: string[], direction: "previous" | "next") => {
  console.log("in selectDate: ", date, direction)
  let newDate: string = "";
  if (direction === "previous") {
    const index = dates.indexOf(date);
    if (index > -1) {
      if (index === 0) {
        newDate = dates[index];
      } else {
        newDate = dates[index - 1];
      }
    }
  } else {
    const index = dates.indexOf(date);
    if (index > - 1 ) {
      if (index === dates.length - 1) {
        newDate = dates[index];
      } else {
        newDate = dates[index + 1];
      }
    }
  }
  console.log("new Date: ", newDate)
  setRadarChartDate(newDate);
}


  const toggleShowSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  const retryLoading = () => {
    window.location.reload();
  };

  // Loading Errors
  if (configError)
    return (
      <ErrorPage
        error={fhirError}
        heading={"Failed to load configuration file"}
        onRetry={retryLoading}
      />
    );
  if (fhirError)
    return (
      <ErrorPage
        error={fhirError}
        heading={"Failed to load FHIR data"}
        onRetry={retryLoading}
      />
    );
  if (!dataLoaded.config || !dataLoaded.fhirData)
    return <DataLoadingScreen message="Loading" animation="spinner" />;

  if (!questionnairesReady)
    return <DataLoadingScreen message="Processing" animation="bars" />;

  return (
    // <body>
    <div className="tw:@container">
      {/* <div className="tw:min-h-screen"> */}
      <main>
            <div className="tw:lg:hidden">
              
                <label
                  htmlFor="filter-drawer"
                  data-tooltip-id="filters"
                  className={`tw:btn tw:bg-base-300 tw:rounded-none tw:border-none tw:text-accent 
                    tw:text-md
                    tw:flex tw:items-center tw:justify-center
                    tw:h-11 tw:w-11
                    tw:fixed
                    tw:z-10
                    tw:top-0 tw:right-0
                    tw:hover:text-base-content                     
                  `}
                >
                  {/* <span>Filters</span> */}
                  {isFilterActive ? (
                  <span aria-label="Show filters, some filters are active"><FontAwesomeIcon icon={["fas", "filter-circle-xmark"] as IconProp} /></span>                    
                  ): 
                  <span aria-label="Show filters"><FontAwesomeIcon icon={["fas", "filter"] as IconProp} /></span>                    
                  }
                </label>
              
              <Portal>
                <Tooltip
                  id="filters"
                  opacity={1}
                  className="custom-tooltip tooltip-basic tw:z-10"
                  place="left"
                  positionStrategy="fixed"
                >
                  <div className={`${isFilterActive ? "tw:w-44" : "tw:w-24"}`}>
                    <div className="tw:text-center tw:text-sm tw:whitespace-normal tw:break-normal">
                        {isFilterActive ? 
                          <span>Show filters, some are active</span>
                        :
                        <span>Show filters</span>
                        }
                    </div>
                  </div>
                </Tooltip>
              </Portal>
                  </div>
        <div className={`tw:drawer tw:drawer-end tw:lg:drawer-open`}>
          <input
            id="filter-drawer"
            type="checkbox"
            className="tw:drawer-toggle"
          />
          <div className="tw:drawer-content tw:relative">
            <SidebarToggle
              showSidebar={showSidebar}
              toggleShowSidebar={toggleShowSidebar}
              isFilterActive={isFilterActive}
              resetFilters={resetFilters}
            />
            <section className="tw:bg-base-100">
              {/* <div className="tw:max-w-screen tw:xl:max-w-9/10 tw:mx-auto tw:h-full tw:justify-center tw:px-6"> */}
              <div className="layout tw:flex tw:flex-col tw:items-center tw:justify-center tw:text-base-content tw:min-h-screen">
                <div className="section">
                  <h1>Overview</h1>
                  <div className="tw:flex tw:justify-start">
                    {questionnaireNamesByDate && (
                      <GridTable
                        data={questionnaireNamesByDate}
                        constrainWidth={true}
                      />
                    )}
                  </div>
                  {dataIssuesForUser.length > 0 && (
                    <div className="tw:px-4 tw:pt-4">
                      <div className="tw:flex tw:flex-wrap tw:gap-4 tw:items-end tw:pb-4">
                        <div
                          role="alert"
                          className="tw:alert tw:alert-warning tw:alert-soft tw:max-w-md border-rounded"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="tw:h-6 tw:w-6 tw:shrink-0 tw:stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <span>
                            Some Questionnaires could not be processed.
                          </span>
                        </div>
                        <button
                          className="tw:btn button-neutral"
                          onClick={toggleShowErrors}
                        >
                          {showErrors ? "Hide Details" : "Show Details"}
                        </button>
                      </div>
                      {showErrors && (
                        <div className="tw:pb-4">
                          <ErrorCard data={dataIssuesForUser} />
                        </div>
                      )}
                    </div>
                  )}
                  {dimensionsWithQuestionnaireByDomain && (
                    <div className="tw:pt-4">
                      <Collapse
                        title="Domain-to-Dimension Mapping"
                        children={
                          <>
                            <div className="tw:flex tw:justify-start tw:pb-4">                              
                              <div data-tooltip-id="mapping-info">
                                <div
                                className="tw:text-sm text-tooltip-basic"                                
                                >
                                  About this Diagram
                                </div>
                              </div>
                              <Portal>                    
                              <Tooltip id="mapping-info" opacity={1} className="custom-tooltip tooltip-neutral"> 
                                <div className="tw:w-64">
                                  <div className="tw:text-sm tw:text-left tw:whitespace-normal tw:break-normal">
                                    <p>
                                      This grid shows how{" "}
                                      {
                                        Object.keys(
                                          dimensionsWithQuestionnaireByDomain,
                                        ).length
                                      }{" "}
                                      domains (left) map to their
                                      corresponding questionnaire scores
                                      (right). 
                                    </p>
                                    <p>Greek letters indicate the
                                      source questionnaire for each score
                                      (see legend at the bottom).
                                    </p>
                                  </div>
                                </div>  
                              </Tooltip>
                              </Portal>                                               
                            </div>
                            <div className="tw:py-4">
                              <MappingTable
                                data={dimensionsWithQuestionnaireByDomain}
                              />
                            </div>
                          </>
                        }
                        constrainWidth={true}
                      />
                    </div>
                  )}
                  {/* <div className="tw:pt-2 tw:lg:hidden">
                    <label
                      htmlFor="filter-drawer"
                      className="tw:btn button-primary"
                    >
                      <span>Filters</span>
                      <span aria-hidden="true"><FontAwesomeIcon icon={["fas", "filter"] as IconProp} /></span>                    
                    </label>
                  </div> */}
                </div>
                <div className="section">
                  <h1>Global Health</h1>
                  <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-7 tw:2xl:grid-cols-5">
                    <div className="tw:row-start-1 tw:lg:col-span-3 tw:lg:px-4 tw:2xl:col-span-2">
                      <h2>Health Indication</h2>
                    </div>
                    <div className="tw:row-start-5 tw:lg:row-start-1 tw:lg:col-start-4 tw:lg:col-span-4 tw:lg:px-4 tw:2xl:col-start-3 tw:2xl:col-span-3">
                      <h2>Normalized Global Health Scores</h2>
                    </div>
                    <div className="tw:row-start-2 tw:lg:col-span-3 tw:lg:px-4 tw:2xl:col-span-2">
                      {dimensionsWithQuestionnaireByDomain && (
                        <div className="tw:flex tw:justify-center tw:md:px-8 tw:lg:px-0">
                          <Collapse
                            title={`Explanation`}
                            children={
                              <>
                                <div className="tw:text-sm">
                                  <p className="h5">About this Diagram</p>
                                  <p>
                                    This radar chart provides a high-level
                                    overview of the patient&rsquo;s health
                                    status across{" "}
                                    {
                                      Object.keys(
                                        dimensionsWithQuestionnaireByDomain,
                                      ).length
                                    }{" "}
                                    domains per response date. Each axis
                                    represents one domain. Use the arrows below to switch between dates.
                                  </p>
                                  <p className="h5">The Polygons</p>
                                  <p>
                                    For each questionnaire, the domain scores
                                    are visualized using two distinct shapes:
                                  </p>
                                  <ul className="tw:list-disc tw:list-inside">
                                    <li>
                                      <span className="tw:font-semibold">
                                        Thick Line Polygon:
                                      </span>{" "}
                                      Represents the{" "}
                                      <span className="tw:font-semibold">
                                        best (highest)
                                      </span>{" "}
                                      dimension score within that domain.
                                    </li>
                                    <li>
                                      <span className="tw:font-semibold">
                                        Darker Shaded Area Polygon:
                                      </span>{" "}
                                      Represents the{" "}
                                      <span className="tw:font-semibold">
                                        worst (lowest)
                                      </span>{" "}
                                      dimension score within that domain.
                                    </li>
                                    <li>
                                      <span className="tw:italic">
                                        Note: The (darker) shaded polygon will always sit
                                        inside or match the thick line polygon.
                                      </span>
                                    </li>
                                  </ul>
                                  <p className="h5">Clinical Interpretation</p>
                                  <ul className="tw:list-disc tw:list-inside">
                                    <li>
                                      <span className="tw:font-semibold">
                                        Score Direction:
                                      </span>{" "}
                                      Edges closer to the outer margin indicate
                                      better patient scores; edges closer to the
                                      center indicate worse scores.
                                    </li>
                                    <li>
                                      <span className="tw:font-semibold">
                                        Domain Variance:
                                      </span>{" "}
                                      The closer the shaded edge is to the thick
                                      line edge, the less variance (fluctuation)
                                      there is among the scores in that domain.
                                    </li>
                                    <li>
                                      <span className="tw:font-semibold">
                                        Missing Data:
                                      </span>{" "}
                                      If a questionnaire does not provide scores
                                      for a domain, both polygon edges for that
                                      axis will sit at the center.
                                    </li>
                                  </ul>
                                </div>
                              </>
                            }
                            constrainWidth={true}
                            name={"Domains Radar"}
                          />
                        </div>
                      )}
                    </div>
                    <div className="tw:row-start-6 tw:lg:row-start-2 tw:lg:col-span-4 tw:lg:px-4 tw:2xl:col-span-3 tw:flex tw:justify-start tw:lg:justify-center">
                      <div className="tw:md:px-8 tw:lg:px-0">
                        <div data-tooltip-id="global-scores-explanation">
                                <div className="text-tooltip-basic tw:text-md">
                                  About this Diagram
                                </div>
                              </div>
                              <Portal>                                              
                              <Tooltip id="global-scores-explanation" opacity={1} className="custom-tooltip tooltip-neutral"> 
                                <div className="tw:w-64">
                                  <div className="tw:text-sm tw:text-left tw:whitespace-normal tw:break-normal">
                                    <p>
                                  This chart shows the progress over time of
                                  those scores which represent global or overall
                                  health of the patient. 
                                </p>
                                <p>
                                  Negative scores are displayed as 0.
                                </p>
                                  </div>
                                </div>  
                              </Tooltip>                              
                              </Portal> 
                      </div>
                    </div>
                    
                      
                          <div className="tw:row-start-3 tw:lg:col-span-3 tw:lg:px-4 tw:2xl:col-span-2">
                            {dimensionScoresDataSeriesByDomain && Object.keys(dimensionScoresDataSeriesByDomain).length > 0 &&
                      displayedQuestionnaireResponses && Object.keys(displayedQuestionnaireResponses).length > 0 && 
                      radarChartDates.length > 0 && radarChartDate && radarChartDate.length > 0 && (
                          <div className="tw:flex tw:justify-center tw:pt-4">
                            <DateSlider
                            dates={radarChartDates}
                            selectedDate={radarChartDate}
                            changeDate={selectDateForRadarChart}
                            />
                          </div>
                          )
                          }
                          </div>
                        
                          
                    <div className="tw:row-start-4 tw:lg:col-span-3 tw:lg:px-4 tw:2xl:col-span-2">
                      {dimensionScoresDataSeriesByDomain && Object.keys(dimensionScoresDataSeriesByDomain).length > 0 &&
                      displayedQuestionnaireResponses && Object.keys(displayedQuestionnaireResponses).length > 0 &&
                      radarChartDate && radarChartDate.length > 0
                         ? (
                          <>
                          <div className="tw:flex tw:justify-center">
                            <RadarChart
                              data={dimensionScoresDataSeriesByDomain}
                              dates={chartXData}
                              date={radarChartDate}
                              titleOptions={radarChartOptions.title}
                              legendOptions={radarChartOptions.legend}
                              gridOptions={radarChartOptions.grid}
                              tooltipOptions={radarChartOptions.tooltip}
                              radarOptions={radarChartOptions.radar}
                              seriesOptions={radarChartOptions.series}
                              enableExport={true}
                              exportFileName="Domains Radar"
                            />
                          </div>
                          </>
                        ) : 
                        <NoData 
                          title="No Data Found"
                          message="No data could be found for this visualization. Please try to adjust your filters. 
                          If this does not help, it is possible that there are no domains or dimension scores defined for the selected questionnaires."
                          action={{label: "Reset Filters", onClick: () => resetFilters()}}
                          />
                          
                        }
                    </div>
                    <div className="tw:row-start-7 tw:lg:row-start-4 tw:lg:col-start-4 tw:lg:col-span-4 tw:lg:px-4 tw:2xl:col-span-3 tw:2xl:col-start-3">
                      {globalScoresDataSeries.length > 0 ? (
                        <>
                          <div className="tw:flex tw:justify-center tw:overflow-visible">
                            <LineChart
                              height={400}
                              data={{
                                xData: chartXData,
                                yData: globalScoresDataSeries,
                              }}
                              minMaxYLabels={["Worst Health", "Best Health"]}
                              titleOptions={singleLineChartOptions.title}
                              legendOptions={singleLineChartOptions.legend}
                              gridOptions={singleLineChartOptions.grid}
                              xAxisOptions={singleLineChartOptions.xAxis}
                              yAxisOptions={singleLineChartOptions.yAxis}
                              tooltipOptions={singleLineChartOptions.tooltip}
                              lineOption={singleLineChartOptions.series}
                              enableExport={true}
                              exportFileName="Normalized Global Health Scores"
                            />
                          </div>
                        </>
                      ) :
                      <NoData
                        title = "No Global Health Scores Available"
                        message="No data could be found for this visualization. Please try to adjust your filters. 
                        If this does not help, it is possible that there are no global health scores defined for the selected questionnaires."
                        action={{label: "Reset Filters", onClick: () => resetFilters()}}
                        />
                      }
                    </div>
                  </div>
                </div>
                <div className="section">
                  <h1>Selected PROs by Domain</h1>
                  {domainsForChart.length > 0 && displayedQuestionnaireResponses && Object.keys(displayedQuestionnaireResponses).length > 0 ? (
                    <>
                  <div>
                    <p>
                      Please select one or more domains to view the scores
                      belonging to them.
                    </p>
                  </div>
                  <div className="tw:flex tw:flex-wrap tw:gap-4 tw:justify-start tw:py-4">
                    {domainsForChart.map(
                      (domain) =>
                        dimensionScoresDataSeriesByDomain[domain] && dimensionScoresDataSeriesByDomain[domain].length >
                          0 && (
                          <label key={domain} className={`tw:label ${selectedDomains.includes(domain) ? "tw:text-base-content" : "tw:text-base-content-light"}`}>
                            <input
                              type="checkbox"
                              checked={selectedDomains.includes(domain)}
                              onChange={() => handleDomainSelection(domain)}
                              className="tw:checkbox tw:checkbox-md tw:shadow-none border-rounded"
                            />
                            {domain}
                          </label>
                        ),
                    )}
                  </div>
                  {domainsForChart.length > 1 && (
                    <div className="tw:py-2">
                      <button
                        className="tw:btn button-neutral"
                        onClick={() => selectAllDomains(domainsForChart)}
                      >
                        Select all
                      </button>
                    </div>
                  )}
                  {selectedDomains.map(
                    (domain) =>
                      dimensionScoresDataSeriesByDomain[domain] && dimensionScoresDataSeriesByDomain[domain].length > 0 && (
                        <React.Fragment key={domain}>
                          <h3>{domain}</h3>
                          <LineChartGroup
                            name={domain}
                            hasReferenceValues={dimensionScoresDataSeriesByDomain[
                              domain
                            ].some(
                              (series) =>
                                (series.referenceValues?.length ?? 0) > 0,
                            )}
                          >
                          <div className="tw:overflow-visible">
                            <div className="tw:grid tw:grid-cols-5 tw:md:grid-cols-9 tw:xl:grid-cols-11 tw:2xl:grid-cols-13 tw:gap-0 tw:mt-2 tw:mb-8 tw:min-w-xs">
                              {dimensionScoresDataSeriesByDomain[domain].map(
                                (dataSeries, index) => (
                                  <React.Fragment key={dataSeries.id}>
                                    {/* cell with y axis */}
                                    <div
                                      className={`tw:col-span-1 
                              ${index % 2 === 1 ? "tw:md:hidden" : ""}
                              tw:h-25`}
                                    >
                                      <LineChart
                                        data={{
                                          xData: [""],
                                          yData: [createPseudoDataSeries(0)],
                                        }}
                                        height={100}
                                        minMaxYLabels={["Worst", "Best"]}
                                        minMaxYValues={[-0.15, 1.55]}
                                        minMaxYValuesPosition={[0, 1]}
                                        titleOptions={
                                          justYAxisLineChartOptions.title
                                        }
                                        legendOptions={
                                          justYAxisLineChartOptions.legend
                                        }
                                        gridOptions={
                                          justYAxisLineChartOptions.grid
                                        }
                                        xAxisOptions={
                                          justYAxisLineChartOptions.xAxis
                                        }
                                        yAxisOptions={
                                          justYAxisLineChartOptions.yAxis
                                        }
                                        tooltipOptions={
                                          justYAxisLineChartOptions.tooltip
                                        }
                                      />
                                    </div>
                                    <div
                                      className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6
                                      ${index % 2 === 0 ? "tw:col-start-2 tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2" : ""} 
                                      tw:border-l tw:border-r tw:border-b border-light
                                      ${index % 2 === 0 && dimensionScoresDataSeriesByDomain[domain].length > 1 ? "tw:md:border-r-0" : ""}
                                      ${index < 1 ? "tw:border-t" : ""} 
                                      ${index === 1 ? "tw:md:border-t" : ""} 
                                      tw:h-25
                                    `}
                                    >
                                      {/* cell with dimension score */}
                                      <LineChart
                                        key={domain + "-" + dataSeries.id}
                                        data={{
                                          xData: chartXData,
                                          yData: [dataSeries],
                                        }}
                                        // title={domain}
                                        height={100}
                                        minMaxYValues={[-0.15, 1.55]}
                                        minMaxYValuesPosition={[0, 1]}
                                        titleOptions={
                                          groupedLineChartOptions.title
                                        }
                                        legendOptions={
                                          groupedLineChartOptions.legend
                                        }
                                        gridOptions={
                                          groupedLineChartOptions.grid
                                        }
                                        xAxisOptions={
                                          groupedLineChartOptions.xAxis
                                        }
                                        yAxisOptions={
                                          groupedLineChartOptions.yAxis
                                        }
                                        tooltipOptions={
                                          groupedLineChartOptions.tooltip
                                        }
                                        lineOption={
                                          groupedLineChartOptions.series
                                        }
                                        markAreaOptions={
                                          groupedLineChartOptions.markArea
                                        }
                                        markLineOptions={
                                          groupedLineChartOptions.markLine
                                        }
                                      />
                                    </div>
                                  </React.Fragment>
                                ),
                              )}
                              {dimensionScoresDataSeriesByDomain[domain]
                                .length > 0 &&
                                dimensionScoresDataSeriesByDomain[domain]
                                  .length %
                                  2 ===
                                  1 && (
                                  <div
                                    className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6
                                    ${dimensionScoresDataSeriesByDomain[domain].length > 1 ? "tw:border tw:border-b tw:border-l tw:border-r border-light" : ""} 
                                    tw:hidden tw:md:block
                                    tw:h-25`}
                                  >
                                    {/* empty data cell if number of dimensions is odd */}
                                    <LineChart
                                      data={{
                                        xData: chartXData,
                                        yData: [
                                          createPseudoDataSeries(
                                            chartXData.length,
                                          ),
                                        ],
                                      }}
                                      height={100}
                                      titleOptions={emptyLineChartOptions.title}
                                      legendOptions={
                                        emptyLineChartOptions.legend
                                      }
                                      gridOptions={emptyLineChartOptions.grid}
                                      xAxisOptions={emptyLineChartOptions.xAxis}
                                      yAxisOptions={emptyLineChartOptions.yAxis}
                                      tooltipOptions={
                                        emptyLineChartOptions.tooltip
                                      }
                                    />
                                  </div>
                                )}
                              <div className="tw:col-span-4 tw:col-start-2 tw:md:col-span-4 tw:xl:col-span-5 
                              tw:2xl:col-span-6 tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2
                              tw:h-7.5">
                                {/* left cell with x axis*/}
                                <LineChart
                                  data={{
                                    xData: chartXData,
                                    yData: [
                                      createPseudoDataSeries(chartXData.length),
                                    ],
                                  }}
                                  height={30}
                                  titleOptions={justXAxisLineChartOptions.title}
                                  legendOptions={
                                    justXAxisLineChartOptions.legend
                                  }
                                  gridOptions={justXAxisLineChartOptions.grid}
                                  xAxisOptions={justXAxisLineChartOptions.xAxis}
                                  yAxisOptions={justXAxisLineChartOptions.yAxis}
                                  tooltipOptions={
                                    justXAxisLineChartOptions.tooltip
                                  }
                                />
                              </div>
                              {dimensionScoresDataSeriesByDomain[domain]
                                .length > 1 && (
                                <div
                                  className={`tw:col-span-4 tw:md:col-span-4 tw:xl:col-span-5 tw:2xl:col-span-6 
                                    tw:hidden tw:md:block
                                    tw:h-7.5`}
                                >
                                  {/* right cell with x axis */}
                                  <LineChart
                                    data={{
                                      xData: chartXData,
                                      yData: [
                                        createPseudoDataSeries(
                                          chartXData.length,
                                        ),
                                      ],
                                    }}
                                    height={30}
                                    titleOptions={
                                      justXAxisLineChartOptions.title
                                    }
                                    legendOptions={
                                      justXAxisLineChartOptions.legend
                                    }
                                    gridOptions={justXAxisLineChartOptions.grid}
                                    xAxisOptions={
                                      justXAxisLineChartOptions.xAxis
                                    }
                                    yAxisOptions={
                                      justXAxisLineChartOptions.yAxis
                                    }
                                    tooltipOptions={
                                      justXAxisLineChartOptions.tooltip
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          </LineChartGroup>
                          {/* children */}
                          {Object.keys(
                            itemDataSeriesByDomainAndDimension[domain],
                          ) &&
                            Object.keys(
                              itemDataSeriesByDomainAndDimension[domain],
                            ).length > 0 && (
                              <div className="tw:md:px-8 tw:pb-4">
                                <div className="tw:pb-4 tw:pt-2">
                                  <button
                                    className="tw:btn button-primary"
                                    onClick={() =>
                                      toggleShowItemsForDomain(domain)
                                    }
                                  >
                                    {showItemsForDomain[domain]
                                      ? "Hide Items"
                                      : "Show Items"}
                                  </button>
                                </div>
                                {showItemsForDomain[domain] && (
                                  <React.Fragment>
                                    <div className="tw:ml-0 tw:px-4 tw:py-2 tw:border border-medium border-rounded-prominent">
                                      <div>
                                        <p>
                                          Please select one or more dimensions (scores)
                                          to view the items belonging to them{" "}
                                          <a data-tooltip-id={`${domain}-info`} className="tw:text-info">
                                            <FontAwesomeIcon
                                              icon={
                                                [
                                                  "fas",
                                                  "circle-info",
                                                ] as IconProp
                                              }
                                            />
                                          </a>.
                                          <Portal>                                                      
                                          <Tooltip id={`${domain}-info`} opacity={1} className="custom-tooltip tooltip-info">                                                                
                                            <div className="tw:w-52">
                                              <div className="tw:text-left tw:whitespace-normal tw:break-normal">
                                                <p>
                                                  Only dimensions containing items are displayed.
                                                </p>
                                              </div>
                                            </div>
                                          </Tooltip>
                                          </Portal>                                           
                                        </p>
                                      </div>
                                      <div className="tw:flex tw:flex-wrap tw:gap-4 tw:justify-start tw:py-4">
                                        {dimensionsByDomain[domain].map(
                                          (dimension) =>
                                            itemDataSeriesByDomainAndDimension[
                                              domain
                                            ][dimension] !== undefined && (
                                              <label
                                                key={domain + "-" + dimension}
                                                className={`tw:label 
                                                  ${selectedDimensionsByDomain[domain].includes(dimension) ? "tw:text-base-content" : "tw:text-base-content-light"}`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={selectedDimensionsByDomain[
                                                    domain
                                                  ].includes(dimension)}
                                                  onChange={() =>
                                                    handleDimensionSelection(
                                                      domain,
                                                      dimension,
                                                    )
                                                  }
                                                  className="tw:checkbox tw:checkbox-md tw:shadow-none border-rounded"
                                                />
                                                {dimension}
                                              </label>
                                            ),
                                        )}
                                      </div>
                                      {dimensionsByDomain[domain].length >
                                        0 && (
                                        <div className="tw:pb-4 tw:pt-2">
                                          <button
                                            className="tw:btn button-neutral"
                                            onClick={() =>
                                              selectAllDimensionsForDomain(
                                                domain,
                                                dimensionsByDomain[domain],
                                              )
                                            }
                                          >
                                            Select all
                                          </button>
                                        </div>
                                      )}
                                      {selectedDimensionsByDomain[domain].map(
                                        (dimension) =>
                                          itemDataSeriesByDomainAndDimension[
                                            domain
                                          ][dimension] !== undefined &&
                                          itemDataSeriesByDomainAndDimension[
                                            domain
                                          ][dimension].length > 0 && (
                                            <React.Fragment
                                              key={domain + "-" + dimension}
                                            >
                                              <h5>{dimension}</h5>
                                              <LineChartGroup
                                                name={domain + "-" + dimension}
                                                hasReferenceValues={itemDataSeriesByDomainAndDimension[
                                                  domain
                                                ][dimension].some(
                                                  (series) =>
                                                    (series.referenceValues
                                                      ?.length ?? 0) > 0,
                                                )}
                                              >
                                              <div
                                                className={`tw:w-full tw:overflow-visible tw:max-w-5xl`}
                                              >
                                                <div className="tw:grid tw:grid-cols-3 tw:xl:grid-cols-4 tw:2xl:grid-cols-5 tw:gap-0 tw:mt-2 tw:mb-8 tw:min-w-xs">
                                                  {itemDataSeriesByDomainAndDimension[
                                                    domain
                                                  ][dimension].map(
                                                    (dataSeries, index) => (
                                                      <React.Fragment
                                                        key={dataSeries.id}
                                                      >
                                                        <div className="tw:col-span-1 tw:flex tw:h-12 tw:items-center tw:justify-start tw:border-b tw:first:border-t tw:md:border-none border-light">
                                                          {dataSeries.name !== truncateAtWord(dataSeries.name, 80) ? (   
                                                            <>
                                                              <div data-tooltip-id={`${dataSeries.id}`} className="tw:text-xs tw:break-normal tw:mr-4">
                                                                {
                                                                truncateAtWord(dataSeries.name, 80)
                                                                }
                                                              </div>
                                                              <Portal>
                                                              <Tooltip id={`${dataSeries.id}`} place="top" opacity={1} className="custom-tooltip tooltip-neutral">
                                                                
                                                                <div className="tw:w-52">
                                                                   <div className="tw:text-left tw:text-xs tw:whitespace-pre-wrap tw:break-normal">
                                                                    {
                                                                       dataSeries.name
                                                                     }
                                                                   </div>
                                                                 </div>
                                                                   
                                                                 </Tooltip>
                                                                 </Portal>
                                                                 
                                                                
                                                                 </>

                                                          )
                                                          :
                                                          <div className="tw:text-xs tw:break-normal tw:mr-4">
                                                            {
                                                              dataSeries.name.slice(0, 80)
                                                            }
                                                          </div>

                                                          }
                                                          
                                                        </div>
                                                        <div
                                                          className={`tw:col-span-2 tw:xl:col-span-3 tw:2xl:col-span-4 tw:col-start-2
                                                            tw:border-b tw:border-l tw:border-r border-light
                                                            ${index < 1 ? "tw:border-t" : ""}
                                                            tw:h-12
                                                          `}
                                                          >
                                                          {/* cell with dimension score */}
                                                          <LineChart
                                                            key={
                                                              domain +
                                                              "-" +
                                                              dataSeries.id
                                                            }
                                                            data={{
                                                              xData: filterDataSeriesDataAndDatesForCommonNullValues(itemDataSeriesByDomainAndDimension[
                                                    domain
                                                  ][dimension], chartXData).xData, // filter
                                                              yData: [
                                                                filterDataSeriesDataAndDatesForCommonNullValues(itemDataSeriesByDomainAndDimension[
                                                    domain
                                                  ][dimension], chartXData).dataSeries[index],
                                                              ],
                                                            }}
                                                            // title={domain}
                                                            height={48}
                                                            minMaxYValues={[
                                                              -0.2, 1.2,
                                                            ]}
                                                            //minMaxYValuesPosition={[0, 1]}
                                                            titleOptions={
                                                              groupedLineChartOptions.title
                                                            }
                                                            legendOptions={
                                                              emptyLineChartOptions.legend
                                                            }
                                                            gridOptions={
                                                              groupedLineChartOptions.grid
                                                            }
                                                            xAxisOptions={
                                                              groupedLineChartOptions.xAxis
                                                            }
                                                            yAxisOptions={
                                                              groupedLineChartOptions.yAxis
                                                            }
                                                            tooltipOptions={
                                                              groupedLineChartOptions.tooltip
                                                            }
                                                            lineOption={
                                                              groupedLineChartOptions.series
                                                            }
                                                            markAreaOptions={
                                                              groupedLineChartOptions.markArea
                                                            }
                                                            markLineOptions={
                                                              groupedLineChartOptions.markLine
                                                            }
                                                            displayNameInTooltip={false}
                                                          />
                                                        </div>
                                                      </React.Fragment>
                                                    ),
                                                  )}
                                                  <div className="tw:col-span-2 tw:col-start-2 tw:xl:col-span-3 tw:2xl:col-span-4 
                                                  tw:md:col-start-2 tw:xl:col-start-2 tw:2xl:col-start-2 tw:h-7.5">
                                                    {/* left cell with x axis*/}
                                                    <LineChart
                                                      data={{
                                                        xData: filterDataSeriesDataAndDatesForCommonNullValues(itemDataSeriesByDomainAndDimension[
                                                    domain
                                                  ][dimension], chartXData).xData, // filter
                                                        yData: [
                                                          createPseudoDataSeries(
                                                            filterDataSeriesDataAndDatesForCommonNullValues(itemDataSeriesByDomainAndDimension[
                                                    domain
                                                  ][dimension], chartXData).xData.length,
                                                          ),
                                                        ],
                                                      }}
                                                      height={30}
                                                      titleOptions={
                                                        justXAxisLineChartOptions.title
                                                      }
                                                      legendOptions={
                                                        justXAxisLineChartOptions.legend
                                                      }
                                                      gridOptions={
                                                        justXAxisLineChartOptions.grid
                                                      }
                                                      xAxisOptions={
                                                        justXAxisLineChartOptions.xAxis
                                                      }
                                                      yAxisOptions={
                                                        justXAxisLineChartOptions.yAxis
                                                      }
                                                      tooltipOptions={
                                                        justXAxisLineChartOptions.tooltip
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                              </LineChartGroup>
                                            </React.Fragment>
                                          ),
                                      )}
                                    </div>
                                  </React.Fragment>
                                )}
                              </div>
                            )}
                          {/* <div className="tw:divider"></div> */}
                        </React.Fragment>
                      ),
                  )}
                </>
                  ): 
                  <NoData
                  title = "No Domain Data Available"
                  message="No data could be found for this visualization. Please try to adjust your filters. 
                  If this does not help, it is possible that there are no domains defined for the selected questionnaires."
                  action={{label: "Reset Filters", onClick: () => resetFilters()}}
                  />
                }
                </div>
                
                <div className="section">
                  <h1>Complete PROs by Questionnaire</h1>
                  <div className="tw:join tw:join-vertical tw:flex tw:justify-center tw:gap-y-2">
                    {questionnaires &&
                      tableDataByQuestionnaire &&
                      questionnaires.map((questionnaire) => (
                        <React.Fragment key={questionnaire.id}>
                          {tableDataByQuestionnaire[questionnaire.id] !==
                            undefined && (
                            <>
                            <Collapse
                              title={questionnaire.name}
                              children={
                                <>
                                
                                <DataTable
                                  data={
                                    tableDataByQuestionnaire[questionnaire.id]
                                  }
                                />
                                <DownloadImageButton
                              onClick={() => createAndDownloadCSV(
                              tableDataByQuestionnaire[questionnaire.id],
                              buildExportFileName(questionnaire.name, "csv"))}
                              disabled={false}
                              className="tw:mt-2 tw:text-right"
                              tooltipText="Save as CSV"
                            />
                            </>
                              }
                            />
      
                              </>
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div
            className={`tw:drawer-side tw:transition-all 
                tw:lg:overflow-hidden ${
                  showSidebar
                    ? "tw:lg:translate-x-0 tw:ease-in tw:duration-200"
                    : "tw:lg:translate-x-full tw:lg:pointer-events-none tw:lg:w-0 tw:ease-out tw:duration-250"
                }`}
          >
            <label
              htmlFor="filter-drawer"
              aria-label="close sidebar"
              className="tw:drawer-overlay"
            ></label>
            <ul className="tw:menu tw:bg-base-300 tw:min-h-full tw:w-80 tw:p-4">
              <div className="h4">
                <p>Filter Questionnaires</p>
              </div>

              <FilterOptionsDisplay
                questionnaires={questionnaires}
                selectedQuestionnaires={selectedQuestionnaires}
                questionnaireSelectionHandler={handleQuestionnaireSelection}
                dates={allDatesOfQuestionnaireResponses}
                selectedDates={selectedDates}
                dateSelectionHandler={handleDateSelection}
                datePickerValue={dateValue}
                datePickerRange={dateRange}
                rangeSelectionHandler={handleRangeChange}
                resetHandler={resetFilters}
                filteredSelectedDates={filteredSelectedDates}
                filteredSelectedQuestionnaires={filteredSelectedQuestionnaires}
                inactiveDates={inactiveDates}
                inactiveQuestionnaires={inactiveQuestionnaires}
                dateFormat={dateFormatPattern}
              />
            </ul>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
      {/* </div> */}
    </div>
    
  );
}

export default App;
