import type { Patient } from "@customTypes/patient";
import type { PromData } from "@customTypes/promData";

/** Sample questionnaire data */
// EQ-5D-5L
const eq5d5lQuestionnaire: PromData.Questionnaire = {
  id: "eq5d-5l",
  name: "EQ-5D-5L",
  url: "https://example.com/eq5d-5l",
  description: "A health-related quality of life questionnaire",
  items: {
    "mobility": {
      linkId: "mobility",
      text: "Mobility",
      answerOptions: [
        { value: 1, label: "I have no problems in walking about" },
        { value: 2, label: "I have slight problems in walking about" },
        { value: 3, label: "I have moderate problems in walking about" },
        { value: 4, label: "I have severe problems in walking about" },
        { value: 5, label: "I am unable to walk about" },
      ],
    },
    "self-care": {
      linkId: "self-care",
      text: "Self-care",
      answerOptions: [
        { value: 1, label: "I have no problems with self-care" },
        {
          value: 2,
          label: "I have slight problems washing or dressing myself",
        },
        {
          value: 3,
          label: "I have moderate problems washing or dressing myself",
        },
        {
          value: 4,
          label: "I have severe problems washing or dressing myself",
        },
        { value: 5, label: "I am unable to wash or dress myself" },
      ],
    },
    "usual-activities": {
      linkId: "usual-activities",
      text: "Usual activities",
      answerOptions: [
        {
          value: 1,
          label: "I have no problems with performing my usual activities",
        },
        {
          value: 2,
          label: "I have slight problems with performing my usual activities",
        },
        {
          value: 3,
          label: "I have moderate problems with performing my usual activities",
        },
        {
          value: 4,
          label: "I have severe problems with performing my usual activities",
        },
        { value: 5, label: "I am unable to perform my usual activities" },
      ],
    },
    "pain-discomfort": {
      linkId: "pain-discomfort",
      text: "Pain/Discomfort",
      answerOptions: [
        { value: 1, label: "I have no pain or discomfort" },
        { value: 2, label: "I have slight pain or discomfort" },
        { value: 3, label: "I have moderate pain or discomfort" },
        { value: 4, label: "I have severe pain or discomfort" },
        { value: 5, label: "I have extreme pain or discomfort" },
      ],
    },
    "anxiety-depression": {
      linkId: "anxiety-depression",
      text: "Anxiety/Depression",
      answerOptions: [
        { value: 1, label: "I am not anxious or depressed" },
        { value: 2, label: "I am slightly anxious or depressed" },
        { value: 3, label: "I am moderately anxious or depressed" },
        { value: 4, label: "I am severely anxious or depressed" },
        { value: 5, label: "I am extremely anxious or depressed" },
      ],
    },
    "VAS": {
      linkId: "vas",
      text: "How good or bad is your health today?",
      answerOptions: [
        { value: 0, label: "The worst health you can imagine" },
        { value: 100, label: "The best health you can imagine" },
      ]
    },
  },
 /*  scoreItems: {
    "VAS": {
        linkId: "vas",
        name: "VAS",
        minValue: 0,
        maxValue: 100,
        text: "How good or bad is your health today?",
    },
  }, */
  score: {
    name: "EQ-5D Index",
    minValue: 0, //-0.594,
    maxValue: 1.0,
  },
};

// Oxford Hip Score
const oxfordHipScoreQuestionnaire: PromData.Questionnaire = {
  id: "ox-hip-score",
  name: "Oxford Hip Score",
  url: "https://example.com/ox-hip-score",
  description: "A health-related quality of life questionnaire",
  items: {
    "pain": {
        linkId: "ox-hip-score-1",
        text: "How would you describe the pain you usually have in your hip?",
        answerOptions: [
            { value: 4, label: "None" },
            { value: 3, label: "Very mild" },
            { value: 2, label: "Mild" },
            { value: 1, label: "Moderate" },
            { value: 0, label: "Severe" },
        ]
    },
    "sudden-pain": {
        linkId: "ox-hip-score-2",
        text: "Have you been troubled by pain from your hip in bed at night?",
        answerOptions: [
            { value: 4, label: "No nights" },
            { value: 3, label: "Only 1 or 2 nights" },
            { value: 2, label: "Some nights" },
            { value: 1, label: "Most nights" },
            { value: 0, label: "Every night" },
        ]
    },
    "night-pain": {
        linkId: "ox-hip-score-3",
        text: "Have you had any sudden, severe pain (shooting, stabbing, or spasms) from your affected hip?",
        answerOptions: [
            { value: 4, label: "No days" },
            { value: 3, label: "Only 1 or 2 days" },
            { value: 2, label: "Some days" },
            { value: 1, label: "Most days" },
            { value: 0, label: "Every day" },
        ]
    },
    "washing": {
        linkId: "ox-hip-score-4",
        text: "Have you been limping when walking because of your hip?",
        answerOptions: [
            { value: 4, label: "Rarely/Never" },
            { value: 3, label: "Sometimes or just at first" },
            { value: 2, label: "Often, not just at first" },
            { value: 1, label: "Most of the time" },
            { value: 0, label: "All of the time" },
        ]
    },
    "transport": {
        linkId: "ox-hip-score-5",
        text: "For how long have you been able to walk before the pain in your hip becomes severe (with or without a walking aid)?",
        answerOptions: [
            { value: 4, label: "No pain/30 minutes or more" },
            { value: 3, label: "16 to 30 minutes" },
            { value: 2, label: "5 to 15 minutes" },
            { value: 1, label: "Around the house only" },
            { value: 0, label: "Not at all" },
        ]
    },
     "dressing": {
        linkId: "ox-hip-score-6",
        text: "Have you been able to climb a flight of stairs?",
        answerOptions: [
            { value: 4, label: "Yes, easily" },
            { value: 3, label: "With little difficulty" },
            { value: 2, label: "With moderate difficulty" },
            { value: 1, label: "With extreme difficulty" },
            { value: 0, label: "No, impossible" },
        ]
    },
     "shopping": {
        linkId: "ox-hip-score-7",
        text: "Have you been able to put on a pair of socks, stockings or tights?",
        answerOptions: [
            { value: 4, label: "Yes, easily" },
            { value: 3, label: "With little difficulty" },
            { value: 2, label: "With moderate difficulty" },
            { value: 1, label: "With extreme difficulty" },
            { value: 0, label: "No, impossible" },
        ]
    },
     "walking": {
        linkId: "ox-hip-score-8",
        text: "After a meal (sat at a table), how painful has it been for you to stand up from a chair because of your hip?",
        answerOptions: [
            { value: 4, label: "Not at all painful" },
            { value: 3, label: "Slightly painful" },
            { value: 2, label: "Moderately painful" },
            { value: 1, label: "Very painful" },
            { value: 0, label: "Unbearable" },
        ]
    },
     "limping": {
        linkId: "ox-hip-score-9",
        text: "Have you had any trouble getting in and out of a car or using public transoportation because of your hip?",
        answerOptions: [
            { value: 4, label: "No trouble at all" },
            { value: 3, label: "Very little trouble" },
            { value: 2, label: "Moderate trouble" },
            { value: 1, label: "Extreme difficulty" },
            { value: 0, label: "Impossible to do" },
        ]
    },
     "stairs": {
        linkId: "ox-hip-score-10",
        text: "Have you had any trouble with washing and drying yourself (all over) because of your hip?",
        answerOptions: [
            { value: 4, label: "No trouble at all" },
            { value: 3, label: "Very little trouble" },
            { value: 2, label: "Moderate trouble" },
            { value: 1, label: "Extreme difficulty" },
            { value: 0, label: "Impossible to do" },
        ]
    },
     "standing": {
        linkId: "ox-hip-score-11",
        text: "Could you do the household shopping on your own?",
        answerOptions: [
            { value: 4, label: "Yes, easily" },
            { value: 3, label: "With little difficulty" },
            { value: 2, label: "With moderate difficulty" },
            { value: 1, label: "With extreme difficulty" },
            { value: 0, label: "No, impossible" },
        ]
    },
     "work": {
        linkId: "ox-hip-score-12",
        text: "How much pain from your hip interfered with your usual work, including housework?",
        answerOptions: [
            { value: 4, label: "Not at all" },
            { value: 3, label: "A little bit" },
            { value: 2, label: "Moderately" },
            { value: 1, label: "Greatly" },
            { value: 0, label: "Totally" },
        ]
    },
  },
  score: {
        name: "Oxford Hip Score",
        minValue: 0,
        maxValue: 48,
    }
}

/** Sample questionnaire responses */ 
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
    "vas": {
        linkId: "vas",
        answer: 55,
    },
  },
  scoreValue: -0.074,
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
    "vas": {
        linkId: "vas",
        answer: 69,
    },
  },
  scoreValue: 0.814,
};

const oxfordHipScoreResponse1: PromData.QuestionnaireResponse = {
  id: "response-002",
  questionnaire: oxfordHipScoreQuestionnaire,
  authored: "2023-10-18",
  items: {
    "pain": {
        linkId: "ox-hip-score-1",
        answer: 0
    },
    "night-pain": {
        linkId: "ox-hip-score-2",
        answer: 0
    },
    "sudden-pain": {
        linkId: "ox-hip-score-3",
        answer: 0
    },
    "washing": {
        linkId: "ox-hip-score-4",
        answer: 1
    },
    "transport": {
        linkId: "ox-hip-score-5",
        answer: 1
    },
    "dressing": {
        linkId: "ox-hip-score-6",
        answer: 1
    },
    "shopping": {
        linkId: "ox-hip-score-7",
        answer: 1
    },
    "walking": {
        linkId: "ox-hip-score-8",
        answer: 0
    },
    "limping": {
        linkId: "ox-hip-score-9",
        answer: 0
    },
    "stairs": {
        linkId: "ox-hip-score-10",
        answer: 1
    },
    "standing": {
        linkId: "ox-hip-score-11",
        answer: 1
    },
    "work": {
        linkId: "ox-hip-score-12",
        answer: 0
    },
    },
    scoreValue: 6.0,
};

const oxfordHipScoreResponse2: PromData.QuestionnaireResponse = {
  id: "response-004",
  questionnaire: oxfordHipScoreQuestionnaire,
  authored: "2024-02-01",
  items: {
    "pain": {
        linkId: "ox-hip-score-1",
        answer: 4
    },
    "night-pain": {
        linkId: "ox-hip-score-2",
        answer: 4
    },
    "sudden-pain": {
        linkId: "ox-hip-score-3",
        answer: 4
    },
    "washing": {
        linkId: "ox-hip-score-4",
        answer: 4
    },
    "transport": {
        linkId: "ox-hip-score-5",
        answer: 4
    },
    "dressing": {
        linkId: "ox-hip-score-6",
        answer: 3
    },
    "shopping": {
        linkId: "ox-hip-score-7",
        answer: 4
    },
    "walking": {
        linkId: "ox-hip-score-8",
        answer: 4
    },
    "limping": {
        linkId: "ox-hip-score-9",
        answer: 3
    },
    "stairs": {
        linkId: "ox-hip-score-10",
        answer: 4
    },
    "standing": {
        linkId: "ox-hip-score-11",
        answer: 3
    },
    "work": {
        linkId: "ox-hip-score-12",
        answer: 4
    },
    },
    scoreValue: 45.0,
};






// Mock patient data
export const mockPatient: Patient.Patient = {
  patientId: "P001",
  firstName: "John",
  lastName: "Doe",
  proms: {
    "eq5d-5l-response-1": eq5d5lResponse1,
    "eq5d-5l-response-2": eq5d5lResponse2,
    "ox-hip-score-response-1": oxfordHipScoreResponse1,
    "ox-hip-score-response-2": oxfordHipScoreResponse2,
  },
};
