import { DIMENSIONS, SCORE_HEALTH_CORRELATIONS, ITEM_TYPES } from "@constants/dimensions";



export namespace VariableDomains {
    type Day = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31";
    type Month = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12";
    type Year = number;

    type DateFormat = `${Year}-${Month}-${Day}`;

    type NumberOrNull = number | null;

    type ScoreHealthCorrelation = SCORE_HEALTH_CORRELATIONS.increase | SCORE_HEALTH_CORRELATIONS.decrease;

    type ItemType = ITEM_TYPES.item | ITEM_TYPES.score;

    type Dimension = typeof DIMENSIONS[number];

}
