import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import StyledEncounterSheet from './Style';
import PatientDataBlock from './PatientDataBlock';
import PatientBackground from './PatientBackground';
import EncounterForms from './EncounterForms';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirEncounter from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirEncounter';
import {fhirFormatDateTime} from 'Utils/Helpers/Datetime/formatDate';

const EncounterSheet = ({
  patient,
  encounter,
  formatDate,
  languageDirection,
  history,
  verticalName,
}) => {
  const [prevEncounterId, setPrevEncounterId] = useState(null);
  const isSomethingWasChanged = React.useRef(() => false);

  //force update when the encounter details are changed
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  useEffect(() => {
    (async () => {
      try {
        const FHIRPrevEncounter = await FHIR('Encounter', 'doWork', {
          functionName: 'getNextPrevEncounterPerPatient',
          functionParams: {
            statusUpdateDate:fhirFormatDateTime(
              encounter.extensionStatusUpdateDate,
            ),
            patient: patient.id,
            prev: true,
          },
        });

        if (FHIRPrevEncounter.data.total) {
          const { data } = FHIRPrevEncounter;
          const normalizedPrevEncounter = normalizeFhirEncounter(
            data.entry[1].resource,
          );
          setPrevEncounterId(normalizedPrevEncounter.id);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [encounter.extensionStatusUpdateDate, patient.id]);

  return (
    <React.Fragment>
      <StyledEncounterSheet>
        <PatientDataBlock
          encounter={encounter}
          patient={patient}
          formatDate={formatDate}
          languageDirection={languageDirection}
          isSomethingWasChanged={isSomethingWasChanged}
        />
        <PatientBackground
          prevEncounterId={prevEncounterId}
          encounter={encounter}
          patient={patient}
          formatDate={formatDate}
          languageDirection={languageDirection}
        />
        <EncounterForms
          prevEncounterId={prevEncounterId}
          encounter={encounter}
          patient={patient}
          formatDate={formatDate}
          languageDirection={languageDirection}
          verticalName={verticalName}
          isSomethingWasChanged={isSomethingWasChanged}
          forceEncounterSheetUpdate={forceUpdate}
        />
      </StyledEncounterSheet>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
  };
};
export default connect(mapStateToProps, null)(EncounterSheet);
