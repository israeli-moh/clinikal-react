import React, { useEffect } from 'react';
import TitleValueComponent from 'Assets/Elements/Header/Search/DrawThisTable/TitleValueComponent';
import { useTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import {
  StyledHeaderTableAppointment,
  StyledHrefButton,
  StyledHrefTableButton,
  StyledLabelStatusAppointment,
  StyledLabelTableButton,
  StyledTableTextCell,
  StyledTDCell,
} from 'Assets/Elements/Header/Search/DrawThisTable/Style';
import normalizeFhirAppointment from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirAppointment';
import normalizeFhirEncounter from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirEncounter';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import { StyledIconValueComponent } from 'Assets/Elements/Header/Search/Style';
import { useHistory } from 'react-router-dom';
import { goToEncounterSheet } from 'Utils/Helpers/goTo/goToEncounterSheet';
import parseMultipleExaminations from 'Utils/Helpers/parseMultipleExaminations';
import {
  formatDateTime,
  formatShortDate,
  formatTime,
  currentDate,
} from 'Utils/Helpers/Datetime/formatDate';

import { store } from 'index';
import { createSummaryLetter } from 'Utils/Helpers/Letters/createSummaryLetter';
import {FHIR} from 'Utils/Services/FHIR';
import {getNormalizeEncounterStatus} from 'Utils/Helpers/FhirEntities/helpers/getNormalizeEncounterStatus';


const AppointmentsAndEncountersTables = ({
  patientId,
  nextAppointments,
  curEncounters,
  prevEncounters,
  patientTrackingStatuses,
  encounterStatuses,
  gotToPatientAdmission,
  authorizationACO,
  formatDate,
  patient,
  encounter,
  language_direction,
  currentUser,
  facility,
}) => {
  const history = useHistory();
  const hideAppointments = useSelector(
    (state) => state.settings.clinikal.clinikal_hide_appoitments,
  );
  const { t } = useTranslation();
  // eslint-disable-next-line
  const prevEncountersEntry =
    prevEncounters && prevEncounters.data && prevEncounters.data.total > 0
      ? prevEncounters.data.entry[1].resource
      : null;
  // eslint-disable-next-line
  const nextAppointmentsElem =
    nextAppointments && nextAppointments.data && nextAppointments.data.total > 0
      ? nextAppointments.data.entry[1].resource
      : null;
  // eslint-disable-next-line
  const curEncountersElem = curEncounters ? curEncounters : null;
  // eslint-disable-next-line
  const nextAppointmentEntry = nextAppointmentsElem
    ? normalizeFhirAppointment(nextAppointmentsElem)
    : null;
  // eslint-disable-next-line
  const normalizedPrevEncounter = prevEncountersEntry
    ? normalizeFhirEncounter(prevEncountersEntry)
    : null;
  const patientData = patientId;
  const curDate = currentDate(formatDate);

  // eslint-disable-next-line
  const getAppointmentWithTimeOrNot = (nextAppointmentEntry) => {
    let isThisAppToday =
      formatShortDate(nextAppointmentEntry.startTime, formatDate) === curDate
        ? true
        : false;
    return isThisAppToday
      ? formatDateTime(nextAppointmentEntry.startTime, formatDate)
      : curDate;
  };
  const [docID, setDoc] = React.useState(-1);

  const [showAllPastEncounter, setShowAllPastEncounter] = React.useState(false);
  let [pastEncounterCounter, setPastEncounterCounter] = React.useState(2);
  const [existLetter, setExistLetter] = React.useState({});
  const [letterInPreogress, setLetterInPreogress] = React.useState({});
  const [normalizedCurEncounters, setNormalizedCurEncounters] = React.useState([]);
  const [normalizedPrevEncounters, setNormalizedPrevEncounters] = React.useState([]);
  const [normalizedNextAppointments, setNormalizedNextAppointments] = React.useState([]);

  const [
    showAllFutureAppointments,
    setShowAllFutureAppointments,
  ] = React.useState(false);
  let [
    futureAppointmentsCounter,
    setFutureAppointmentsCounter,
  ] = React.useState(2);

  const togglePastEncountersTable = () => {
    if (showAllPastEncounter) {
      setShowAllPastEncounter(false);
      setPastEncounterCounter(2);
    } else {
      setShowAllPastEncounter(true);
      setPastEncounterCounter(prevEncounters.data.total);
    }
  };

  const toggleFutureAppointmentsTable = () => {
    if (showAllFutureAppointments) {
      setShowAllFutureAppointments(false);
      setFutureAppointmentsCounter(2);
    } else {
      setShowAllFutureAppointments(true);
      setFutureAppointmentsCounter(nextAppointments.data.total);
    }
  };

  const existSummeryLetter = async (encounter) => {
    const documentReferenceData = await FHIR('DocumentReference', 'doWork', {
      functionName: 'getDocumentReference',
      searchParams: { category: 5, encounter: encounter.id },
    });

    return (documentReferenceData &&
      documentReferenceData.data &&
      documentReferenceData.data.total >= 1)
      ? setExistLetter((prev) => {
        const cloneExist = { ...prev };
        cloneExist[encounter.id] = documentReferenceData.data.entry[1].resource.id;
        return cloneExist;
      })
      : false;
  };

  /*const handleChartClick = () => {
    //TODO:
  };

 ;*/
  const handleAdmissionClick = (encounter) => {
    gotToPatientAdmission(encounter, patientData, history);
  };

  const handleEncounterSheetClick = (encounter) => {
    goToEncounterSheet(encounter, patientData, history);
  };

  useEffect(() => {

    if (curEncounters && curEncounters.data && curEncounters.data.total > 0) {
      let entry = curEncounters.data.entry;
      // eslint-disable-next-line
      entry.map((response, resourceIndex) => {
        if (
            response &&
            response.resource &&
            response.resource.resourceType === 'Encounter'
        ) {
          let normalizedCurEncounterElem = normalizeFhirEncounter(
              response.resource,
          );
          setNormalizedCurEncounters((prev) => {
            const cloneNormalizedCurEncounters = prev;
            cloneNormalizedCurEncounters.push(normalizedCurEncounterElem);
            return cloneNormalizedCurEncounters;
          })
        }
      });
    }

    if (
        nextAppointments &&
        nextAppointments.data &&
        nextAppointments.data.total > 0
    ) {
      let entry = nextAppointments.data.entry;
      // eslint-disable-next-line
      entry.map((response, resourceIndex) => {
        if (
            response &&
            response.resource &&
            response.resource.resourceType === 'Appointment'
        ) {
          let normalizedNextAppointmentElem = normalizeFhirAppointment(
              response.resource,
          );
          setNormalizedNextAppointments((prev) => {
            const cloneormalizedNextAppointments = prev;
            cloneormalizedNextAppointments.push(normalizedNextAppointmentElem);
            return cloneormalizedNextAppointments;
          })
        }
      });
    }

    if (prevEncounters && prevEncounters.data && prevEncounters.data.total > 0) {
      let entry = prevEncounters.data.entry;
      // eslint-disable-next-line
      entry.map((response, resourceIndex) => {
        if (
            response &&
            response.resource &&
            response.resource.resourceType === 'Encounter'
        ) {
          let normalizedPrevEncounterElem = normalizeFhirEncounter(
              response.resource,
          );
          if (normalizedPrevEncounterElem.status === 'finished') {
            //check if exist summery letter, if not the button need to be disabled
            existSummeryLetter(normalizedPrevEncounterElem);
          }
          setNormalizedPrevEncounters((prev) => {
            const cloneNormalizedPrevEncounters = prev;
            cloneNormalizedPrevEncounters.push(normalizedPrevEncounterElem);
            return cloneNormalizedPrevEncounters;
          })

        }
      });
    }
  },[curEncounters, prevEncounters, nextAppointments]);

  const createLetterFromData = async ({ encounter }) => {
    setLetterInPreogress((prev) => {
      const cloneLetterInPreogress = { ...prev };
      cloneLetterInPreogress[encounter.id] = true;
      return cloneLetterInPreogress;
    })
    let letterId  = existLetter[encounter.id] ? existLetter[encounter.id] : false;
    let docId = await createSummaryLetter({
      encounter,
      patientId,
      currentUser,
      facility,
      letterId
    });
    setDoc(docId);
    setLetterInPreogress((prev) => {
      const cloneLetterInPreogress = { ...prev };
      cloneLetterInPreogress[encounter.id] = false;
      return cloneLetterInPreogress;
    })
  };
  function handleCreateAppointment(patient) {
    return undefined;
  }

  return (
    <React.Fragment>
      <React.Fragment>
        <br />
        <StyledHeaderTableAppointment>
          {t('Current encounter')}
        </StyledHeaderTableAppointment>
        <ul></ul>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <StyledTDCell align='right'>
                  {t("Encounter's hour")}
                </StyledTDCell>
                <StyledTDCell align='right'>
                  {t('Reason for refferal')}
                </StyledTDCell>
                <StyledTDCell align='center'>{t('Status')}</StyledTDCell>
                <StyledTDCell align='right'></StyledTDCell>
                <StyledTDCell align='right'></StyledTDCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {normalizedCurEncounters.length > 0 ? (
                normalizedCurEncounters.map((encounter, encounterID) => {
                  return (
                    <TableRow key={encounterID}>
                      <StyledTDCell align='right' omponent='td' scope='row'>
                        <StyledTableTextCell>
                          {' '}
                          {formatTime(encounter.startTime)}{' '}
                        </StyledTableTextCell>
                      </StyledTDCell>
                      <StyledTDCell align='right'>
                        <StyledTableTextCell
                          title={parseMultipleExaminations(
                            encounter.serviceType,
                            encounter.examination,
                            t,
                          )}>
                          {parseMultipleExaminations(
                            encounter.serviceType,
                            encounter.examination,
                            t,
                          )}
                        </StyledTableTextCell>
                      </StyledTDCell>
                      <StyledTDCell align='center'>
                        <StyledLabelStatusAppointment>
                          <TitleValueComponent
                            name={
                              encounterStatuses && encounter
                                ? t(encounterStatuses[getNormalizeEncounterStatus(encounter)])
                                : ''
                            }
                          />
                        </StyledLabelStatusAppointment>
                      </StyledTDCell>
                      <StyledTDCell align='right'>
                        <StyledHrefTableButton
                          disabled={
                            authorizationACO.encounterSheet !== 'view' &&
                            authorizationACO.encounterSheet !== 'write'
                          }
                          size={'small'}
                          variant='outlined'
                          color='primary'
                          href='#contained-buttons'
                          onClick={(event) =>
                            handleEncounterSheetClick(encounter)
                          }>
                          {t('navigate to encounter sheet')}
                        </StyledHrefTableButton>
                      </StyledTDCell>
                      <StyledTDCell align='right'>
                        <StyledHrefTableButton
                          disabled={
                            authorizationACO.patientAdmission !== 'view' &&
                            authorizationACO.patientAdmission !== 'write'
                          }
                          size={'large'}
                          variant='outlined'
                          color='primary'
                          href='#contained-buttons'
                          onClick={(event) =>
                            handleAdmissionClick(
                              encounter,
                              patientData,
                              history,
                            )
                          }>
                          {t('Admission form')}
                        </StyledHrefTableButton>
                      </StyledTDCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow key={'encounters_no_past_rows'}>
                  <StyledTDCell
                    colSpan='5'
                    align='center'
                    omponent='td'
                    scope='row'>
                    {t('No data found for display')}
                  </StyledTDCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </React.Fragment>
      {hideAppointments !== '1' ? (
        <React.Fragment>
          <br />
          <StyledHeaderTableAppointment>
            {t('Future appointments')}
            <StyledHrefButton
              disabled={
                authorizationACO.createNewAppointment !== 'view' &&
                authorizationACO.createNewAppointment !== 'write'
              }
              size={'small'}
              variant='contained'
              color='primary'
              href='#contained-buttons'
              onClick={() => handleCreateAppointment(patientData)}>
              {t('Create new appointment')}
            </StyledHrefButton>
          </StyledHeaderTableAppointment>
          <ul></ul>
          <TableContainer component={Paper}>
            <Table aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <StyledTDCell align='right'>
                    {t('Appointment time')}
                  </StyledTDCell>
                  <StyledTDCell align='right'>
                    {t('Reason for refferal')}
                  </StyledTDCell>
                  <StyledTDCell align='center'>{t('Status')}</StyledTDCell>
                  <StyledTDCell align='right'></StyledTDCell>
                  <StyledTDCell align='right'></StyledTDCell>
                  <StyledTDCell align='right'></StyledTDCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {normalizedNextAppointments.length > 0 ? (
                  // eslint-disable-next-line
                  normalizedNextAppointments.map(
                    (appointment, appointmentID) => {
                      if (--futureAppointmentsCounter >= 0)
                        return (
                          <TableRow key={appointmentID}>
                            <StyledTDCell
                              align='right'
                              omponent='td'
                              scope='row'>
                              <StyledTableTextCell>
                                {' '}
                                {curDate ===
                                formatShortDate(
                                  appointment.startTime,
                                  formatDate,
                                )
                                  ? `${t('today')} - ${formatTime(
                                      appointment.startTime,
                                    )}`
                                  : formatDateTime(appointment.startTime)}{' '}
                              </StyledTableTextCell>
                            </StyledTDCell>
                            <StyledTDCell align='right'>
                              <StyledTableTextCell
                                title={parseMultipleExaminations(
                                  appointment.serviceType,
                                  appointment.examination,
                                  t,
                                )}></StyledTableTextCell>
                            </StyledTDCell>
                            <StyledTDCell align='center'>
                              <StyledLabelStatusAppointment>
                                <TitleValueComponent
                                  name={
                                    patientTrackingStatuses && appointment
                                      ? t(
                                          patientTrackingStatuses[
                                            appointment.status
                                          ],
                                        )
                                      : ''
                                  }
                                />
                              </StyledLabelStatusAppointment>
                            </StyledTDCell>
                            <StyledTDCell align='right'>
                              <StyledHrefTableButton
                                disabled={
                                  authorizationACO.appointmentDetails !==
                                    'view' &&
                                  authorizationACO.appointmentDetails !==
                                    'write'
                                }
                                size={'small'}
                                variant='outlined'
                                color='primary'
                                href='#contained-buttons'>
                                {t('Appointment details')}
                              </StyledHrefTableButton>
                            </StyledTDCell>
                            <StyledTDCell align='right'>
                              <StyledHrefTableButton
                                disabled={
                                  authorizationACO.cancelAppointment !==
                                    'view' &&
                                  authorizationACO.cancelAppointment !== 'write'
                                }
                                size={'large'}
                                variant='outlined'
                                color='primary'
                                href='#contained-buttons'>
                                {t('Cancel appointment')}
                              </StyledHrefTableButton>
                            </StyledTDCell>
                          </TableRow>
                        );
                    },
                  )
                ) : (
                  <TableRow key={'encounters_no_past_rows'}>
                    <StyledTDCell
                      colSpan='6'
                      align='center'
                      omponent='td'
                      scope='row'>
                      {t('No data found for display')}
                    </StyledTDCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {normalizedNextAppointments.length > 2 ? (
            <StyledLabelTableButton onClick={toggleFutureAppointmentsTable}>
              {t(
                !showAllFutureAppointments
                  ? 'Show all appointments'
                  : 'Show less appointments',
              )}
              <StyledIconValueComponent
                iconType={
                  !showAllFutureAppointments
                    ? 'keyboard_arrow_down'
                    : 'keyboard_arrow_up'
                }
              />
            </StyledLabelTableButton>
          ) : null}
        </React.Fragment>
      ) : null}

      <React.Fragment>
        <br />
        <StyledHeaderTableAppointment>
          {t('Previous encounters')}
        </StyledHeaderTableAppointment>
        <ul></ul>
        <TableContainer component={Paper}>
          <Table aria-label='simple table'>
            <TableHead>
              <TableRow>
                <StyledTDCell align='right'>{t('Date')}</StyledTDCell>
                <StyledTDCell align='right'>
                  {t('Reason for refferal')}
                </StyledTDCell>
                <StyledTDCell align='center'>{t('Status')}</StyledTDCell>
                <StyledTDCell align='right'></StyledTDCell>
                <StyledTDCell align='right'></StyledTDCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {normalizedPrevEncounters !== null &&
              normalizedPrevEncounters.length > 0 ? (
                // eslint-disable-next-line
                normalizedPrevEncounters.map((encounter, encounterID) => {
                  if (--pastEncounterCounter >= 0) {
                    return (
                      <TableRow key={encounterID}>
                        <StyledTDCell align='right' omponent='td' scope='row'>
                          <StyledTableTextCell>
                            {' '}
                            {formatShortDate(
                              encounter.startTime,
                              formatDate,
                            )}{' '}
                          </StyledTableTextCell>
                        </StyledTDCell>
                        <StyledTDCell align='right'>
                          <StyledTableTextCell
                            title={parseMultipleExaminations(
                              encounter.serviceType,
                              encounter.examination,
                              t,
                            )}>
                            {parseMultipleExaminations(
                              encounter.serviceType,
                              encounter.examination,
                              t,
                            )}
                          </StyledTableTextCell>
                        </StyledTDCell>
                        <StyledTDCell align='center'>
                          <StyledLabelStatusAppointment>
                            <TitleValueComponent
                              name={
                                encounterStatuses && encounter
                                  ? t(encounterStatuses[getNormalizeEncounterStatus(encounter)])
                                  : ''
                              }
                            />
                          </StyledLabelStatusAppointment>
                        </StyledTDCell>
                        <StyledTDCell align='right'>
                          <StyledHrefTableButton
                            disabled={
                              authorizationACO.encounterSheet !== 'view' &&
                              authorizationACO.encounterSheet !== 'write'
                            }
                            size={'small'}
                            variant='outlined'
                            color='primary'
                            onClick={(event) =>
                                handleEncounterSheetClick(encounter)
                            }
                            href='#contained-buttons'>
                            {t('Encounter sheet')}
                          </StyledHrefTableButton>
                        </StyledTDCell>
                        <StyledTDCell align='right'>
                          {encounter.status === 'finished'  ||
                          encounter.status === 'waiting_for_release' ? (
                            <>
                              <input
                                type={'hidden'}
                                value={docID}
                                id='doc_id'
                              />
                              <StyledHrefTableButton
                                disabled={
                                  !existLetter[encounter.id] || letterInPreogress[encounter.id] || (
                                  authorizationACO.summaryLetter !== 'view' &&
                                  authorizationACO.summaryLetter !== 'write'
                                  )
                                }
                                onClick={() =>
                                  createLetterFromData({ encounter: encounter })
                                }
                                size={'large'}
                                variant='outlined'
                                color='primary'
                                href='#contained-buttons'>
                                {t('Summary letter')}
                              </StyledHrefTableButton>
                            </>
                          ) : (
                            ''
                          )}
                        </StyledTDCell>
                      </TableRow>
                    );
                  }
                })
              ) : (
                <TableRow key={'encounters_no_past_rows'}>
                  <StyledTDCell
                    colSpan='5'
                    align='center'
                    omponent='td'
                    scope='row'>
                    {t('No data found for display')}
                  </StyledTDCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {normalizedPrevEncounters.length > 2 ? (
          <StyledLabelTableButton onClick={togglePastEncountersTable}>
            {t(
              !showAllPastEncounter
                ? 'Show all encounters'
                : 'Show less encounters',
            )}
            <StyledIconValueComponent
              iconType={
                !showAllPastEncounter
                  ? 'keyboard_arrow_down'
                  : 'keyboard_arrow_up'
              }
            />
          </StyledLabelTableButton>
        ) : null}
      </React.Fragment>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    language_direction: state.settings.lang_dir,
    currentUser: state.active.activeUser,
    facility: store.getState().settings.facility,
  };
};
export default connect(mapStateToProps, null)(AppointmentsAndEncountersTables);
