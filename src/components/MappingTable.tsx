import * as _ from "lodash-es";

interface Props {
  data: Record<string, [string, string][]>;
}

const MappingTable = ({ data }: Props) => {

  const symbolRecord: Record<string, string> = {
    "Group 1": "\u03B1",
    "Group 2": "\u03B2",
    "Group 3": "\u03B3",
    "Group 4": "\u03B4",
    "Group 5": "\u03B5",
    "Group 6": "\u03B6",
    "Group 7": "\u03B7",
    "Group 8": "\u03B8",
    "Group 9": "\u03B9",
    "Group 10": "\u03BA",
    "Group 11": "\u03BB",
    "Group 12": "\u03BC",
    "Group 13": "\u03BD",
    "Group 14": "\u03BE",
    "Group 15": "\u03BF",
    "Group 16": "\u03C0",
    "Group 17": "\u03C1",
    "Group 18": "\u03C2",
    "Group 19": "\u03C3",
    "Group 20": "\u03C4",
    "Group 21": "\u03C5",
    "Group 22": "\u03C6",
    "Group 23": "\u03C7",
    "Group 24": "\u03C8",
    "Group 25": "\u03C9",
    "Group 26": "\u0391",
    "Group 27": "\u0392",
    "Group 28": "\u0393",
    "Group 29": "\u0394",
    "Group 30": "\u0395",
    "Group 31": "\u0396",
    "Group 32": "\u0397",
    "Group 33": "\u0398",
    "Group 34": "\u0399",
    "Group 35": "\u039A",
    "Group 36": "\u039B",
    "Group 37": "\u039C",
    "Group 38": "\u039D",
    "Group 39": "\u039E",
    "Group 40": "\u039F",
    "Group 41": "\u03A0",
    "Group 42": "\u03A1",
    "Group 43": "\u03A3",
    "Group 44": "\u03A4",
    "Group 45": "\u03A5",
    "Group 46": "\u03A6",
    "Group 47": "\u03A7",
    "Group 48": "\u03A8",
    "Group 49": "\u03A9",
  }

  const borderColorClassRecord: Record<string, string> = {
    orange: "tw:border-orange-300",
    green: "tw:border-green-300",
    sky: "tw:border-sky-300",
    violet: "tw:border-violet-300",
    rose: "tw:border-rose-300",
    amber: "tw:border-amber-300",
    purple: "tw:border-purple-300",
    yellow: "tw:border-yellow-300",
    teal: "tw:border-teal-300",
    indigo: "tw:border-indigo-300",
    fuchsia: "tw:border-fuchsia-300",
    red: "tw:border-red-300",
    lime: "tw:border-lime-300",
    cyan: "tw:border-cyan-300",
    pink: "tw:border-pink-300",
    zinc: "tw:border-zinc-300",
    neutral: "tw:border-neutral-300",    
    stone: "tw:border-stone-300",
    taupe: "tw:border-taupe-300",
    mauve: "tw:border-mauve-300",
    mist: "tw:border-mist-300",
    olive: "tw:border-olive-300",  
    gray: "tw:border-gray-300",
    slate: "tw:border-slate-300",
    // blue: "tw:border-blue-300", 
    // emerald: "tw:border-emerald-300",
  };

  const backgroundClassRecord: Record<string, string> = {
    orange: "tw:bg-orange-50",
    green: "tw:bg-green-50",
    sky: "tw:bg-sky-50",
    violet: "tw:bg-violet-50",
    rose: "tw:bg-rose-50",
    amber: "tw:bg-amber-50",
    purple: "tw:bg-purple-50",
    yellow: "tw:bg-yellow-50",
    teal: "tw:bg-teal-50",
    indigo: "tw:bg-indigo-50",
    fuchsia: "tw:bg-fuchsia-50",
    red: "tw:bg-red-50",
    lime: "tw:bg-lime-50",
    cyan: "tw:bg-cyan-50",
    pink: "tw:bg-pink-50",
    zinc: "tw:bg-zinc-50",
    neutral: "tw:bg-neutral-50",    
    stone: "tw:bg-stone-50",
    taupe: "tw:bg-taupe-50",
    mauve: "tw:bg-mauve-50",
    mist: "tw:bg-mist-50",
    olive: "tw:bg-olive-50",  
    gray: "tw:bg-gray-50",
    slate: "tw:bg-slate-50",
    // blue: "tw:bg-blue-50",
    // emerald: "tw:bg-emerald-50",
  }

  const questionnaires = _.uniq(
    Object.values(data).flatMap((dimensionWithQuestionnaireArray) =>
      dimensionWithQuestionnaireArray.flatMap(
        (dimensionAndQuestionnaire) => dimensionAndQuestionnaire[1],
      ),
    ),
  );

  const questionnaireSymbolColorRecord: Record<string, {symbol: string, color: string}> = {};
  questionnaires.forEach((questionnaire, index) => {
    //questionnaireSymbolColorRecord[questionnaire] = {};
    const symbol = symbolRecord[`Group ${(index % Object.keys(symbolRecord).length) + 1}`];
    const color = Object.keys(borderColorClassRecord)[index % Object.keys(borderColorClassRecord).length];
    questionnaireSymbolColorRecord[questionnaire] = { symbol: symbol, color: color};
  });

  const pill = (label: string, symbol = "", color = "slate", symbolPosition= "right") => {
    const key = `${symbol}:${label}`;
    const borderClass = borderColorClassRecord[color] ?? borderColorClassRecord.slate;
    const backgroundClass = backgroundClassRecord[color] ?? backgroundClassRecord.slate;
    return (
      <div
        key={key}
        className={`tw:border ${borderClass} tw:rounded-full ${backgroundClass}
          tw:text-xs tw:px-3.5 tw:py-1.5
          tw:leading-snug tw:text-center tw:whitespace-nowrap`}
        >
        {symbol.length > 0 ? symbolPosition === "left" ? symbol + ": " + label : label + " (" + symbol + ")" : label}
      </div>
    );
  };
  const domainPill = (label: string) => {
    const key = `${label}`;
    return (
      <div
        key={key}
        className={`tw:text-xs tw:font-semibold
          tw:leading-snug tw:text-center tw:whitespace-pre-wrap`}
        >
        {label}
      </div>
    );
  };

  return (
    <div className="tw:flex tw:flex-col tw:gap-y-2 tw:gap-x-4">
      <div className="tw:grid tw:grid-cols-3 tw:md:grid-cols-4 tw:lg:grid-cols-5 tw:2xl:grid-cols-6 tw:gap-4">
        <div
          className="tw:col-span-1 tw:text-sm tw:text-left tw:font-semibold tw:uppercase tw:tracking-widest tw:select-none"
        >
          Domains
        </div>
        <div
          className="tw:col-span-2 tw:col-start-2 tw:md:col-span-3 tw:lg:col-span-4 tw:2xl:col-span-5
          tw:text-sm tw:font-semibold tw:uppercase tw:tracking-widest tw:select-none"
        >
          Dimensions
        </div>
      </div>
      <div className="tw:divider tw:my-0"></div>
      {Object.entries(data).map(
        ([domain, dimensionsWithQuestionnaire], i) =>
          dimensionsWithQuestionnaire.length > 0 && (
            <>
              <div key={`${domain}: ${dimensionsWithQuestionnaire[0]}: ${dimensionsWithQuestionnaire[1]}`} 
                className="tw:grid tw:grid-cols-3 tw:md:grid-cols-4 tw:lg:grid-cols-5 tw:2xl:grid-cols-6 
                  tw:gap-4 tw:items-center">
                
                <div className="tw:col-span-1 tw:ml-2">
                 {domainPill(domain)}
                </div>
                
                <div className="tw:col-span-2 tw:col-start-2 tw:md:col-span-3 tw:lg:col-span-4 tw:2xl:col-span-5 tw:mr-2">
                  <div className="tw:flex tw:flex-wrap tw:justify-start tw:gap-2">
                    {dimensionsWithQuestionnaire.map(
                      (dimensionAndQuestionnaire) => 
                       
                        pill(
                          dimensionAndQuestionnaire[0],
                          questionnaireSymbolColorRecord[dimensionAndQuestionnaire[1]].symbol,
                          questionnaireSymbolColorRecord[dimensionAndQuestionnaire[1]].color,
                        )
                        
                      
                    )}
                  </div>
                </div>
              </div>
              <div className={`tw:divider tw:my-0 ${i < dimensionsWithQuestionnaire.length - 1 ? "tw:mx-2" : ""}`}></div>
            </>
          ),
      )}
        <div className="tw:flex tw:flex-wrap tw:justify-start">
          <div
            className="tw:col-span-1 tw:text-sm tw:font-semibold 
            tw:uppercase tw:tracking-widest tw:select-none"
          >
            Legend
          </div>
        </div>
        
        <div className="tw:flex tw:flex-wrap tw:justify-start tw:gap-y-2 tw:gap-x-4 tw:mx-4">
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire} className="tw:inline-flex tw:text-sm tw:leading-snug tw:whitespace-pre-wrap">
              {/* {questionnaireSymbolColorRecord[questionnaire].symbol}: {questionnaire} */}
              {pill(
                questionnaire, 
                questionnaireSymbolColorRecord[questionnaire].symbol,
                
                questionnaireSymbolColorRecord[questionnaire].color,
                "left",
                
                )}
            </div>
          ))}
        </div>
        
      </div>
  );
};

export default MappingTable;
