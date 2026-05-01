import type { Patient } from "@customTypes/patient";
import type { PromData } from "@data/mapping/types";
import eq5d5lQuestionnaire from "./eq5d5lQuestionnaire";
import oxfordHipScoreQuestionnaire from "./oxfordHipScoreQuestionnaire";
import qlqC30Questionnaire from "./qlqc30Questionnaire";

/** Sample questionnaire responses */
// QLQ-C30
const qlqC30Response1: PromData.QuestionnaireResponse = {
  id: "response-005",
  questionnaire: qlqC30Questionnaire,
  authored: "2023-10-15",
  items: {
    "qlq-c30-q01": {
      linkId: "qlq-c30-q01",
      answer: 2,
    },
    "qlq-c30-q02": {
      linkId: "qlq-c30-q02",
      answer: 3,
    },
    "qlq-c30-q03": {
      linkId: "qlq-c30-q03",
      answer: 2,
    },
    "qlq-c30-q04": {
      linkId: "qlq-c30-q04",
      answer: 1,
    },
    "qlq-c30-q05": {
      linkId: "qlq-c30-q05",
      answer: 1,
    },
    "qlq-c30-q06": {
      linkId: "qlq-c30-q06",
      answer: 2,
    },
    "qlq-c30-q07": {
      linkId: "qlq-c30-q07",
      answer: 3,
    },
    "qlq-c30-q08": {
      linkId: "qlq-c30-q08",
      answer: 1,
    },
    "qlq-c30-q09": {
      linkId: "qlq-c30-q09",
      answer: 2,
    },
    "qlq-c30-q10": {
      linkId: "qlq-c30-q10",
      answer: 3,
    },
    "qlq-c30-q11": {
      linkId: "qlq-c30-q11",
      answer: 2,
    },
    "qlq-c30-q12": {
      linkId: "qlq-c30-q12",
      answer: 2,
    },
    "qlq-c30-q13": {
      linkId: "qlq-c30-q13",
      answer: 1,
    },
    "qlq-c30-q14": {
      linkId: "qlq-c30-q14",
      answer: 1,
    },
    "qlq-c30-q15": {
      linkId: "qlq-c30-q15",
      answer: 1,
    },
    "qlq-c30-q16": {
      linkId: "qlq-c30-q16",
      answer: 1,
    },
    "qlq-c30-q17": {
      linkId: "qlq-c30-q17",
      answer: 1,
    },
    "qlq-c30-q18": {
      linkId: "qlq-c30-q18",
      answer: 2,
    },
    "qlq-c30-q19": {
      linkId: "qlq-c30-q19",
      answer: 1,
    },
    "qlq-c30-q20": {
      linkId: "qlq-c30-q20",
      answer: 1,
    },
    "qlq-c30-q21": {
      linkId: "qlq-c30-q21",
      answer: 2,
    },
    "qlq-c30-q22": {
      linkId: "qlq-c30-q22",
      answer: 2,
    },
    "qlq-c30-q23": {
      linkId: "qlq-c30-q23",
      answer: 1,
    },
    "qlq-c30-q24": {
      linkId: "qlq-c30-q24",
      answer: 1,
    },
    "qlq-c30-q25": {
      linkId: "qlq-c30-q25",
      answer: 1,
    },
    "qlq-c30-q26": {
      linkId: "qlq-c30-q26",
      answer: 1,
    },
    "qlq-c30-q27": {
      linkId: "qlq-c30-q27",
      answer: 2,
    },
    "qlq-c30-q28": {
      linkId: "qlq-c30-q28",
      answer: 1,
    },
    "qlq-c30-q29": {
      linkId: "qlq-c30-q29",
      answer: 5,
    },
    "qlq-c30-q30": {
      linkId: "qlq-c30-q30",
      answer: 5,
    },
    "score-pf": {
      linkId: "score-pf",
      answer: 73.33,
    },
    "score-rf": {
      linkId: "score-rf",
      answer: 83.33,
    },
    "score-ef": {
      linkId: "score-ef",
      answer: 87.5,
    },
    "score-cf": {
      linkId: "score-cf",
      answer: 100,
    },
    "score-sf": {
      linkId: "score-sf",
      answer: 91.67,
    },
    "score-fa": {
      linkId: "score-fa",
      answer: 22.22,
    },
    "score-nv": {
      linkId: "score-nv",
      answer: 0,
    },
    "score-pa": {
      linkId: "score-pa",
      answer: 16.67,
    },
    "score-dy": {
      linkId: "score-dy",
      answer: 0,
    },
    "score-sl": {
      linkId: "score-sl",
      answer: 33.33,
    },
    "score-ap": {
      linkId: "score-ap",
      answer: 0,
    },
    "score-co": {
      linkId: "score-co",
      answer: 0,
    },
    "score-di": {
      linkId: "score-di",
      answer: 0,
    },
    "score-fi": {
      linkId: "score-fi",
      answer: 0,
    },
    "score-ql": {
      linkId: "score-ql",
      answer: 66.67,
    },
  },
};

// EQ-5D-5L
const eq5d5lResponse1: PromData.QuestionnaireResponse = {
  id: "response-001",
  questionnaire: eq5d5lQuestionnaire,
  authored: "2023-10-15",
  items: {
    mobility: {
      linkId: "mobility",
      answer: 2,
    },
    "self-care": {
      linkId: "self-care",
      answer: 2,
    },
    "usual-activities": {
      linkId: "usual-activities",
      answer: 3,
    },
    "pain-discomfort": {
      linkId: "pain-discomfort",
      answer: 3,
    },
    "anxiety-depression": {
      linkId: "anxiety-depression",
      answer: 2,
    },
    vas: {
      linkId: "vas",
      answer: 55,
    },
    "eq-5d-index": {
      linkId: "eq-5d-index",
      answer: -0.074,
    },
  },
};

const eq5d5lResponse2: PromData.QuestionnaireResponse = {
  id: "response-003",
  questionnaire: eq5d5lQuestionnaire,
  authored: "2024-02-01",
  items: {
    mobility: {
      linkId: "mobility",
      answer: 2,
    },
    "self-care": {
      linkId: "self-care",
      answer: 1,
    },
    "usual-activities": {
      linkId: "usual-activities",
      answer: 2,
    },
    "pain-discomfort": {
      linkId: "pain-discomfort",
      answer: 1,
    },
    "anxiety-depression": {
      linkId: "anxiety-depression",
      answer: 1,
    },
    vas: {
      linkId: "vas",
      answer: 69,
    },
    "eq-5d-index": {
      linkId: "eq-5d-index",
      answer: 0.814,
    },
  },
};

const oxfordHipScoreResponse1: PromData.QuestionnaireResponse = {
  id: "response-002",
  questionnaire: oxfordHipScoreQuestionnaire,
  authored: "2023-10-18",
  items: {
    pain: {
      linkId: "pain",
      answer: 0,
    },
    "night-pain": {
      linkId: "night-pain",
      answer: 0,
    },
    "sudden-pain": {
      linkId: "sudden-pain",
      answer: 0,
    },
    washing: {
      linkId: "washing",
      answer: 1,
    },
    transport: {
      linkId: "transport",
      answer: 1,
    },
    dressing: {
      linkId: "dressing",
      answer: 1,
    },
    shopping: {
      linkId: "shopping",
      answer: 1,
    },
    walking: {
      linkId: "walking",
      answer: 0,
    },
    limping: {
      linkId: "limping",
      answer: 0,
    },
    stairs: {
      linkId: "stairs",
      answer: 1,
    },
    standing: {
      linkId: "standing",
      answer: 1,
    },
    work: {
      linkId: "work",
      answer: 0,
    },
    "ox-hip-score": {
      linkId: "ox-hip-score",
      answer: 6.0,
    },
  },
};

const oxfordHipScoreResponse2: PromData.QuestionnaireResponse = {
  id: "response-004",
  questionnaire: oxfordHipScoreQuestionnaire,
  authored: "2024-02-01",
  items: {
    pain: {
      linkId: "pain",
      answer: 4,
    },
    "night-pain": {
      linkId: "night-pain",
      answer: 4,
    },
    "sudden-pain": {
      linkId: "sudden-pain",
      answer: 4,
    },
    washing: {
      linkId: "washing",
      answer: 4,
    },
    transport: {
      linkId: "transport",
      answer: 4,
    },
    dressing: {
      linkId: "dressing",
      answer: 3,
    },
    shopping: {
      linkId: "shopping",
      answer: 4,
    },
    walking: {
      linkId: "walking",
      answer: 4,
    },
    limping: {
      linkId: "limping",
      answer: 3,
    },
    stairs: {
      linkId: "stairs",
      answer: 4,
    },
    standing: {
      linkId: "standing",
      answer: 3,
    },
    work: {
      linkId: "work",
      answer: 4,
    },
    "ox-hip-score": {
      linkId: "ox-hip-score",
      answer: 45.0,
    },
  },
};

// Mock patient data
export const mockPatient: Patient.Patient = {
  patientId: "P001",
  name: "John Doe",
  proms: {
    "eq5d-5l-response-1": eq5d5lResponse1,
    "eq5d-5l-response-2": eq5d5lResponse2,
    "ox-hip-score-response-1": oxfordHipScoreResponse1,
    "ox-hip-score-response-2": oxfordHipScoreResponse2,
    "qlq-c30-response-1": qlqC30Response1,
  },
};
