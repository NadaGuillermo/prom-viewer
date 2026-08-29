import type * as Mapping from "@utils/mapping";

interface Props {
  patient: Mapping.Patient;
}

const PatientInfo = ({ patient }: Props) => {
  const { familyName, givenName, gender, birthDate } = patient;

  return (
    <>
      {/* <div className="tw:card tw:card-border tw:rounded-xl tw:max-w-lg card"> */}
      {/* <div className="tw:card-body"> */}
      {/* <div className="tw:card-title h3">Patient</div> */}

      <div className="tw:flex tw:flex-wrap tw:gap-2 tw:items-baseline tw:max-w-8/10 tw:md:max-w-none">
        <div>
          <div className="tw:mr-4 tw:text-left">
            <span className="h3">Patient</span>
          </div>
        </div>
        <>
          <div className="tw:border-r tw:pr-2 border-medium">
            <span className="tw:font-semibold">Name: </span>{" "}
            {givenName + " " + familyName}
          </div>
        </>
        {birthDate && (
          <>
           <div className="tw:border-r tw:pr-2 border-medium">
              <span className="tw:font-semibold">Birth date: </span> {birthDate}
            </div>
          </>
        )}
        {gender && (
          <>
            <div>
              <span className="tw:font-semibold">Gender: </span> {gender}
            </div>
          </>
        )}
      </div>
      {/* </div> */}
      {/* </div> */}
    </>
  );
};

export default PatientInfo;
