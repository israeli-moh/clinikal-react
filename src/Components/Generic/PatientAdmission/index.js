import React, { useState } from 'react';
import { connect } from 'react-redux';
import HeaderPatient from 'Assets/Elements/HeaderPatient';
import { useTranslation } from 'react-i18next';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import PatientDataBlock from './PatientDataBlock';
import PatientDetailsBlock from './PatientDetailsBlock';
import { StyledPatientRow, StyledDummyBlock, StyledBackdrop } from './Style';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { devicesValue } from 'Assets/Themes/BreakPoints';
import { FHIR } from 'Utils/Services/FHIR';
import PopUpOnExit from 'Assets/Elements/PopUpOnExit';
import { formatShortDate }  from 'Utils/Helpers/Datetime/formatDate';


const PatientAdmission = ({
  patient,
  encounter,
  languageDirection,
  formatDate,
  history,
  PatientAdmissionSettings,
}) => {
  const deletingEncounter = async () => {
    if (encounter.status === 'planned') {
      await FHIR('Encounter', 'doWork', {
        functionName: 'deleteEncounter',
        functionParams: {
          encounterId: encounter.id,
        },
      });
    }
  };

  const { t } = useTranslation();
  const isSomethingWasChanged = React.useRef(() => false);
  const [edit, setEdit] = useState(0);

  const isTabletMode = useMediaQuery(
    `(max-width: ${devicesValue.tabletPortrait}px)`,
  );

  const allBreadcrumbs = [
    {
      text: t('Patient Admission'),
      separator: 'NavigateNextIcon',
      url: '#',
    },
    {
      text:
        patient.firstName +
        ' ' +
        patient.lastName +
        ' ' +
        (!isTabletMode ? t('Encounter date') + ': ' : '') +
        formatShortDate(encounter.startTime,formatDate),
      separator: false,
      url: '#',
    },
  ];

  const handleCloseClick = () => {
    let foundChanges = isSomethingWasChanged.current();
    if (foundChanges) {
      setIsPopUpOpen(true);
    } else {
      deletingEncounter();
      history.push(`${baseRoutePath()}/imaging/patientTracking`);
    }
  };

  const handleEditButtonClick = (isEdit) => {
    setEdit(isEdit);
  };

  const onPopUpCloseHandler = () => {
    setIsPopUpOpen(false);
  };

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const returnHandler = () => {
    setIsPopUpOpen(false);
  };

  const exitWithoutSavingHandler = () => {
    deletingEncounter();
    history.push(`${baseRoutePath()}/imaging/patientTracking`);
  };
  return (
    <React.Fragment>
      <PopUpOnExit
        isOpen={isPopUpOpen}
        onClose={onPopUpCloseHandler}
        returnFunction={returnHandler}
        exitWithOutSavingFunction={exitWithoutSavingHandler}
      />
      <HeaderPatient
        breadcrumbs={allBreadcrumbs}
        languageDirection={languageDirection}
        onCloseClick={handleCloseClick}
        edit_mode={edit}
      />
      <StyledPatientRow>
        <StyledBackdrop open={true} edit_mode={edit}>
          {Object.values(patient).length > 0 &&
            Object.values(encounter).length > 0 && (
              <PatientDataBlock
                patientData={patient}
                onEditButtonClick={handleEditButtonClick}
                edit_mode={edit}
                languageDirection={languageDirection}
                formatDate={formatDate}
                priority={encounter.priority}
              />
            )}
        </StyledBackdrop>
        <StyledDummyBlock edit_mode={edit} />
        {Object.values(patient).length > 0 &&
          Object.values(encounter).length > 0 && (
            <PatientDetailsBlock
              configuration={PatientAdmissionSettings}
              encounterData={encounter}
              patientData={patient}
              edit_mode={edit}
              formatDate={formatDate}
              isSomethingWasChanged={isSomethingWasChanged}
            />
          )}
      </StyledPatientRow>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    PatientAdmissionSettings: state.settings.clinikal['patient admission'],
  };
};

export default connect(mapStateToProps, null)(PatientAdmission);
