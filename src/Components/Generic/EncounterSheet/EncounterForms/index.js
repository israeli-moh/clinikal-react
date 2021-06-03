import React from 'react';
import StyledPatientFiles from './Style';
import { getForms } from 'Utils/Services/API';
import FormsContainer from './FormsContainer';
import HeaderPatient from 'Assets/Elements/HeaderPatient';
import { useHistory } from 'react-router-dom';
import { devicesValue } from 'Assets/Themes/BreakPoints';
import { useMediaQuery } from '@material-ui/core';
import * as Moment from 'moment';
import { useTranslation } from 'react-i18next';
import {onExitStandAlone} from 'Assets/Elements/PopUpOnExit/OnExitStandAlone'


const EncounterForms = ({
  encounter,
  patient,
  languageDirection,
  formatDate,
  prevEncounterId,
  verticalName,
  isSomethingWasChanged,
  forceEncounterSheetUpdate
}) => {
  const [formsPerSheet, setFormsPerSheet] = React.useState();
  const { t } = useTranslation();
  const history = useHistory();

  const isTabletMode = useMediaQuery(
    `(max-width: ${devicesValue.tabletPortrait}px)`,
  );
  const allBreadcrumbs = [
    {
      text: t('Encounter sheet'),
      separator: 'NavigateNextIcon',
      url: '#',
    },
    {
      text: `${patient.firstName} ${patient.lastName} ${
        !isTabletMode ? `${t('Encounter date')}: ` : ''
      } ${Moment(encounter.startTime).format(formatDate)}`,
      separator: false,
      url: '#',
    },
  ];



  const handleCloseClick = () => {
    if(isSomethingWasChanged.current()) {
      //need to create custom popup because if the popup is part of the component the lazy load form rerender when the popup open
      onExitStandAlone(() => history.push(`/${verticalName}/PatientTracking`))
    } else {
      history.push(`/${verticalName}/PatientTracking`)
    }
  };

  React.useEffect(() => {
    (async () => {
      try {
       if (typeof encounter.serviceTypeCode !== 'undefined' && encounter.serviceTypeCode !== null &&
         typeof encounter.examinationCode !== 'undefined' && encounter.examinationCode !== null
       ) {
         const forms = await getForms(
           encounter.serviceTypeCode,
           encounter.examinationCode,
         );
         setFormsPerSheet(forms);
       }

      } catch (error) {
        console.log(error);
      }
    })();
  }, [encounter.serviceTypeCode, encounter.examinationCode]);
  return (
    <>
      <HeaderPatient
        breadcrumbs={allBreadcrumbs}
        languageDirection={languageDirection}
        onCloseClick={handleCloseClick}
      />
      <StyledPatientFiles>
        {formsPerSheet ? (
          <FormsContainer
            dir={languageDirection}
            tabs={formsPerSheet}
            prevEncounterId={prevEncounterId}
            isSomethingWasChanged={isSomethingWasChanged}
            forceEncounterSheetUpdate={forceEncounterSheetUpdate}
          />
        ) : null}
      </StyledPatientFiles>
    </>
  );
};

export default EncounterForms;
