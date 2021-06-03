import {
  StyledCurrentExaminationHeader,
  StyledEncountersTicketsCurrent,
  StyledEncountersTicketsOther,
  StyledEncounterTicket,
  StyledFadeElement,
} from 'Components/Generic/EncounterSheet/PatientBackground/Style';
import parseMultipleExaminations from 'Utils/Helpers/parseMultipleExaminations';
import StyledExaminationStatusesWithIcons from 'Components/Generic/EncounterSheet/PatientBackground/StyledExaminationStatusesWithIcons';
import React from 'react';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { formatShortDate, formatTime, currentDate }  from 'Utils/Helpers/Datetime/formatDate';


const EncounterTicket = ({
  hide,
  showAlways,
  parseCurrent,
  summaryLetter,
  encounterSheet,
  key,
  patient,
  encounter,
  languageDirection,
  formatDate,
  verticalName,
  encounterToParse,
  handleCreateData,
}) => {
  const { t } = useTranslation();
  const showAlwaysState = showAlways;

  return encounterToParse ? (
    parseCurrent ? (
      <StyledFadeElement in={showAlwaysState || hide} timeout={1000}>
        <StyledEncounterTicket hide={hide} showAlwaysState={showAlwaysState}>
          <StyledEncountersTicketsCurrent dir={languageDirection} key={key}>
            <StyledCurrentExaminationHeader dir={languageDirection}>
              <div>
                {currentDate('YYYY-MM-DD') ===
                formatShortDate(encounterToParse.startTime, 'YYYY-MM-DD')
                  ? t('Today') +
                    ' - ' +
                    formatTime(encounterToParse.startTime, 'HH:MM')
                  : formatShortDate(encounterToParse.startTime, formatDate)}
              </div>
              <span
                title={parseMultipleExaminations(
                  encounterToParse.serviceType,
                  encounterToParse.examination,
                  t,
                )}>
                {parseMultipleExaminations(
                  encounterToParse.serviceType,
                  encounterToParse.examination,
                  t,
                )}
              </span>
            </StyledCurrentExaminationHeader>
            <StyledExaminationStatusesWithIcons
              handleCreateData={handleCreateData}
              encounterData={encounterToParse}
              patientData={patient}
              summaryLetter={
                encounterToParse.documents &&
                encounterToParse.documents.length > 0
                  ? true
                  : false
              }
              encounterSheet={true}></StyledExaminationStatusesWithIcons>
          </StyledEncountersTicketsCurrent>
        </StyledEncounterTicket>
      </StyledFadeElement>
    ) : (
      <StyledFadeElement in={showAlwaysState || hide} timeout={1000}>
        <StyledEncounterTicket hide={hide} showAlwaysState={showAlwaysState}>
          <StyledEncountersTicketsOther
            elevation={0}
            dir={languageDirection}
            key={key}>
            <StyledCurrentExaminationHeader dir={languageDirection}>
              <div>
                {currentDate('YYYY-MM-DD') ===
                formatShortDate(encounterToParse.startTime, 'YYYY-MM-DD')
                  ? t('Today') +
                    ' - ' +
                    formatTime(encounterToParse.startTime, 'HH:MM')
                  : formatShortDate(encounterToParse.startTime, formatDate)}
              </div>
              <span
                title={parseMultipleExaminations(
                  encounterToParse.serviceType,
                  encounterToParse.examination,
                  t,
                )}>
                {parseMultipleExaminations(
                  encounterToParse.serviceType,
                  encounterToParse.examination,
                  t,
                )}
              </span>
            </StyledCurrentExaminationHeader>
            <StyledExaminationStatusesWithIcons
              handleCreateData={handleCreateData}
              encounterData={encounterToParse}
              patientData={patient}
              summaryLetter={
                encounterToParse.documents &&
                encounterToParse.documents.length > 0
                  ? true
                  : false
              }
              encounterSheet={false}></StyledExaminationStatusesWithIcons>
          </StyledEncountersTicketsOther>
        </StyledEncounterTicket>
      </StyledFadeElement>
    )
  ) : null;
};

const mapStateToProps = (state) => {
  return {
    encounter: state.active.activeEncounter,
    patient: state.active.activePatient,
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
  };
};
export default connect(mapStateToProps, null)(EncounterTicket);
