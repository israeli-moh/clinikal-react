import React from 'react';
import {
  StyledBottomLinks,
  StyledExpansionPanel,
  StyledExpansionPanelDetails,
  StyledExpansionPanelSummary,
  StyledHrefButton,
  StyledLabelAge,
  StyledLabelPhone,
} from './Style';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {
  StyledLabelName,
  StyledLabelTZ,
} from 'Assets/Elements/Header/Search/DrawThisTable/Style';
import TitleValueComponent from 'Assets/Elements/Header/Search/DrawThisTable/TitleValueComponent';
import GenderIcon from 'Assets/Elements/CustomizedTable/CustomizedTablePersonalInformationCell/GenderIcon';
import maleIcon from 'Assets/Images/maleIcon.png';
import femaleIcon from 'Assets/Images/womanIcon.png';
import AppointmentsPerPatient from 'Assets/Elements/Header/Search/DrawThisTable/AppointmentsPerPatient';
import moment from 'moment';
import normalizeFhirAppointment from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirAppointment';
import { FHIR } from 'Utils/Services/FHIR';
import { store } from 'index';
import { useHistory } from 'react-router-dom';
import PopAppointmentsPerPatient from 'Components/Generic/PopupComponents/PopupAppointmentsPerPatient';
import { gotToPatientAdmission } from 'Utils/Helpers/goTo/gotoPatientAdmission';
import { useSelector } from 'react-redux';
import {
  fhirFormatDate,
  currentDate,
  formatShortDate
} from 'Utils/Helpers/Datetime/formatDate';

const DrawThisTable = ({
  result,
  searchParam,
  setPopupApppointmentsAndEncounters,
  authorizationACO,
}) => {
  const hideAppointments = useSelector(
    (state) => state.settings.clinikal.clinikal_hide_appoitments,
  );
  const { t } = useTranslation();
  const ADMISSIONWITHOUTAPPOINTMENT = 0;
  const ADMISSIONWITHAPPOINTMENT = 1;
  const [expanded, setExpanded] = React.useState('');
  const [nextAppointment, setNextAppointment] = React.useState('');
  const [nextAppointments, setNextAppointments] = React.useState('');
  const [prevEncounter, setPrevEncounter] = React.useState('');
  const [prevEncounters, setPrevEncounters] = React.useState('');
  const [curEncounter, setCurEncounter] = React.useState('');
  const [encounterStatuses, setEncounterStatuses] = React.useState('');
  const [patientTrackingStatuses, setPatientTrackingStatuses] = React.useState(
    '',
  );
  const [admissionState, setAdmissionState] = React.useState(
    ADMISSIONWITHAPPOINTMENT,
  );
  const [appointmentPopUpData, setAppointmentPopUpData] = React.useState(null);
  const history = useHistory();
  const [
    popUpAppointmentsPerPatient,
    setPopUpAppointmentsPerPatient,
  ] = React.useState(false);

  //let patientTrackingStatuses =  null;

  const handleCreateAppointment = async (patient, nextAppointment) => {
    let encounterData = null;
    switch (admissionState) {
      case ADMISSIONWITHOUTAPPOINTMENT:
        encounterData = await FHIR('Encounter', 'doWork', {
          functionName: 'createNewEncounter',
          functionParams: {
            facility: store.getState().settings.facility,
            practitioner: 'practitioner',
            patient: patient,
            status: 'planned',
          },
        });
        gotToPatientAdmission(encounterData, patient, history);
        break;
      case ADMISSIONWITHAPPOINTMENT:
        if (nextAppointment) {
          let fhirappointment =
            nextAppointment &&
            nextAppointment.data &&
            nextAppointment.data.total > 0
              ? normalizeFhirAppointment(nextAppointment.data.entry[1].resource)
              : null;
          encounterData = await FHIR('Encounter', 'doWork', {
            functionName: 'createNewEncounter',
            functionParams: {
              facility: store.getState().settings.facility,
              appointment: fhirappointment,
              patient: { id: patient.id },
            },
          });
          gotToPatientAdmission(encounterData, patient, history);
          console.log('admission with appointment');
        }
        break;
      default:
        break;
    }
  };

  const handleTextOfCurrentAppointmentButton = (
    curEncounter,
    nextAppointment,
  ) => {
    if (hideAppointments === '1')  {
      if (admissionState !== ADMISSIONWITHOUTAPPOINTMENT) {
        setAdmissionState(ADMISSIONWITHOUTAPPOINTMENT);
      }
      return t('Patient Admission');
    }
    let thereIsEncounterToday =
      curEncounter && curEncounter.data && curEncounter.data.total > 0
        ? true
        : false;
    let nextAppointmetCheckNormelized =
      nextAppointment && nextAppointment.data && nextAppointment.data.total > 0
        ? normalizeFhirAppointment(nextAppointment.data.entry[1].resource)
        : null;
    let theAppointmentIsToday = false;
    if (nextAppointmetCheckNormelized) {
      theAppointmentIsToday =
        formatShortDate(nextAppointmetCheckNormelized.startTime, 'DD/MM/YYYY') === currentDate('DD/MM/YYYY')
          ? true
          : false;
    }

    if (!thereIsEncounterToday) {
      if (theAppointmentIsToday) {
        if (admissionState !== ADMISSIONWITHAPPOINTMENT) {
          setAdmissionState(ADMISSIONWITHAPPOINTMENT);
        }
        return t('Patient admission');
      } else {
        if (admissionState !== ADMISSIONWITHOUTAPPOINTMENT) {
          setAdmissionState(ADMISSIONWITHOUTAPPOINTMENT);
        }
        return t('Admission without appointment');
      }
    } else {
      return t('Patient admission');
    }
  };

  const requestValueSet = (valueSet) => {
    if (typeof valueSet === "undefined" ) {
      return;
    }
    const {
        expansion: { contains },
    } = valueSet;
    let options = {};
    if (contains) {
      for (let status of contains) {
        options[status.code] = status.display;
      }
    }

    return options;
  };
  const clearValuesOfExpention = () => {
    setNextAppointment('');
    setPrevEncounter('');
    setCurEncounter('');
    setNextAppointments('');
    setPrevEncounters('');
  };
  const handleChange = (panel, patient) => async (event, newExpanded) => {
    clearValuesOfExpention();
    setExpanded(newExpanded ? panel : false);
    if (newExpanded) {
      let identifier = patient.id;
      let currentDate = fhirFormatDate();

      const ApiCalls = [];

      ApiCalls.push(
        FHIR('Encounter', 'doWork', {
          functionName: 'getNextPrevEncounterPerPatient',
          functionParams: {
            date: currentDate,
            patient: identifier,
            prev: true,
          },
        })
      );

      ApiCalls.push(
        FHIR('Encounter', 'doWork', {
          functionName: 'getCurrentEncounterPerPatient',
          functionParams: {
            date: currentDate,
            patient: identifier,
            specialOrder: `_sort=service-type,-priority,date`,
          },
        })
      );

      ApiCalls.push(
        FHIR('Encounter', 'doWork', {
          functionName: 'getNextPrevEncountersPerPatient',
          functionParams: {
            date: currentDate,
            patient: identifier,
            prev: true,
          },
        })
      );

      if (hideAppointments !== '1') {

        ApiCalls.push(
          FHIR('Appointment', 'doWork', {
            functionName: 'getNextPrevAppointmentsPerPatient',
            functionParams: {
              date: currentDate,
              patient: identifier,
              prev: false,
            },
          })
        );

        ApiCalls.push(
          FHIR('Appointment', 'doWork', {
            functionName: 'getNextPrevAppointmentPerPatient',
            functionParams: {
              date: currentDate,
              patient: identifier,
              prev: false,
            },
          })
        );

        ApiCalls.push(
          FHIR('ValueSet', 'doWork', {
            functionName: 'getValueSet',
            functionParams: {id: 'appointment_statuses'},
          })
        );

      }

      const [FHIRPrevEncounter, FHIRCurEncounter, FHIRPrevEncounters, FHIRNextAppointments, FHIRNextAppointment ,appointmentStatPromise] = await Promise.all(ApiCalls);


      setPrevEncounter(FHIRPrevEncounter);
      setCurEncounter(FHIRCurEncounter);
      setPrevEncounters(FHIRPrevEncounters);

      const encounterStat = requestValueSet(store.getState().listsBox.encounter_statuses);
      const encounterSecStat = requestValueSet(store.getState().listsBox.encounter_secondary_statuses);
      const statusesList = {...encounterStat, ...encounterSecStat};
      if (!encounterStatuses) setEncounterStatuses(statusesList);

      setNextAppointments(FHIRNextAppointments);
      setNextAppointment(FHIRNextAppointment);
      const appointmentStat = requestValueSet(appointmentStatPromise);
      if (!patientTrackingStatuses)
        setPatientTrackingStatuses(appointmentStat);



    }
  };

  function _calculateAge(birthday) {
    // birthday is a date
    var ageDifMs = Date.now() - Date.parse(birthday);
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const handleShowAppointmentsAndEncounters = (
    patient,
    prevEncounters,
    nextAppointments,
    curEncounter,
    encounterStatuses,
    patientTrackingStatuses,
  ) => {
    if (!patient) return;

    setAppointmentPopUpData({
      patient: patient,
      prevEncounter: prevEncounters,
      nextAppointment: nextAppointments,
      curEncounter: curEncounter,
      encounterStatuses: encounterStatuses,
      patientTrackingStatuses: patientTrackingStatuses,
    });

    setPopUpAppointmentsPerPatient(true);
    setPopupApppointmentsAndEncounters(true);
  };

  const handlePopupClose = () => {
    setPopUpAppointmentsPerPatient(false);
    setPopupApppointmentsAndEncounters(false);
    if (!popUpAppointmentsPerPatient) {
      setAppointmentPopUpData(null);
    }
  };

  if (result) {
    return result.map((patient, patientIndex) => {
      if (patient) {
        return (
          <React.Fragment key={patientIndex}>
            <PopAppointmentsPerPatient
              key={'PopUp' + patientIndex}
              popupOpen={popUpAppointmentsPerPatient}
              content={appointmentPopUpData}
              handlePopupClose={handlePopupClose}
              authorizationACO={authorizationACO}
              patient={patient}
              gotToPatientAdmission={
                gotToPatientAdmission
              }></PopAppointmentsPerPatient>
            <StyledExpansionPanel
              key={'ExpansionPanel_' + patientIndex}
              expanded={expanded === 'panel' + patientIndex}
              onChange={handleChange('panel' + patientIndex, patient)}>
              <StyledExpansionPanelSummary
                key={'ExpansionPanel_' + patientIndex + '_summary'}
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1a-content'
                id='panel1a-header'>
                <GenderIcon
                  key={'gender_' + patientIndex}
                  alt={'gender icon'}
                  src={patient.gender === 'male' ? maleIcon : femaleIcon}
                />
                <StyledLabelName key={'name_' + patientIndex}>
                  <TitleValueComponent
                    searchParam={searchParam}
                    name={patient.firstName + ' ' + patient.lastName}
                  />
                </StyledLabelName>
                <StyledLabelTZ key={'StyledLabelTZ_' + patientIndex}>
                  <TitleValueComponent
                    key={'identifier_' + patientIndex}
                    searchParam={searchParam}
                    name={t(patient.identifierTypeText)}
                    value={patient.identifier}
                  />
                </StyledLabelTZ>
                <StyledLabelPhone key={'phone_' + patientIndex}>
                  {
                    patient.mobileCellPhone ? (
                      <TitleValueComponent
                        key={'mobile_phone_' + patientIndex}
                        searchParam={searchParam}
                        name={t('Mobile Phone')}
                        value={patient.mobileCellPhone}
                      />
                    ) : (
                      ''
                    )
                    /*patient.homePhone ? < TitleValueComponent name = {t('Phone number')}   value = {patient.homePhone} /> : ''*/
                  }
                </StyledLabelPhone>
                <StyledLabelAge key={'age_' + patientIndex}>
                  <TitleValueComponent
                    key={'calculate_age_' + patientIndex}
                    name={t(patient.ageGenderType)}
                    value={_calculateAge(patient.birthDate)}
                  />
                </StyledLabelAge>
              </StyledExpansionPanelSummary>
              <StyledExpansionPanelDetails key={'details_' + patientIndex}>
                <AppointmentsPerPatient
                  hideAppointments={hideAppointments}
                  key={'appointment_' + patientIndex}
                  nextAppointment={nextAppointment}
                  prevEncounter={prevEncounter}
                  curEncounter={curEncounter}
                  encounterStatuses={encounterStatuses}
                  patientTrackingStatuses={patientTrackingStatuses}
                  gotToPatientAdmission={gotToPatientAdmission}
                  authorizationACO={authorizationACO}
                  patient={patient}
                />
                <StyledBottomLinks key={'bottom_links_' + patientIndex}>
                  <StyledHrefButton
                    key={'bottom_links_first_' + patientIndex}
                    size={'small'}
                    variant='outlined'
                    color='primary'
                    href='#contained-buttons'
                    disabled={
                      (authorizationACO.appointmentsAndEncounters === 'view' ||
                        authorizationACO.appointmentsAndEncounters ===
                          'write') &&
                      ((nextAppointments &&
                        nextAppointments.data &&
                        nextAppointments.data.total > 0) ||
                        (prevEncounters &&
                          prevEncounters.data &&
                          prevEncounters.data.total > 0) ||
                        (curEncounter &&
                          curEncounter.data &&
                          curEncounter.data.total > 0))
                        ? false
                        : true
                    }
                    onClick={() =>
                      handleShowAppointmentsAndEncounters(
                        patient,
                        prevEncounters,
                        nextAppointments,
                        curEncounter,
                        encounterStatuses,
                        patientTrackingStatuses,
                      )
                    }>
                    {t(
                      hideAppointments === '1'
                        ? 'All encounters'
                        : 'Encounters and appointments',
                    )}
                  </StyledHrefButton>
                  {hideAppointments !== '1' ? (
                    <StyledHrefButton
                      key={'bottom_links_second_' + patientIndex}
                      size={'small'}
                      variant='contained'
                      color='primary'
                      href='#contained-buttons'
                      disabled={
                        authorizationACO.createNewAppointment !== 'view' &&
                        authorizationACO.createNewAppointment !== 'write'
                          ? true
                          : false
                      }>
                      {t('New appointment')}
                    </StyledHrefButton>
                  ) : null}

                  <StyledHrefButton
                    key={'bottom_links_third_' + patientIndex}
                    size={'small'}
                    variant='contained'
                    color='primary'
                    href='#contained-buttons'
                    disabled={
                      (authorizationACO.patientAdmission !== 'view' &&
                        authorizationACO.patientAdmission !== 'write') ||
                      (curEncounter &&
                        curEncounter.data &&
                        curEncounter.data.total > 0)
                        ? true
                        : false
                    }
                    onClick={() =>
                      handleCreateAppointment(patient, nextAppointment)
                    }>
                    {handleTextOfCurrentAppointmentButton(
                      curEncounter,
                      nextAppointment,
                    )}
                  </StyledHrefButton>
                </StyledBottomLinks>
              </StyledExpansionPanelDetails>
            </StyledExpansionPanel>
          </React.Fragment>
        );
      } else {
        return null;
      }
    });
  } else {
    return null;
  }
};

export default DrawThisTable;
