import * as React from 'react';
import MedicalFile from 'Assets/Images/medical-file@2x.png';
import Camera from 'Assets/Images/camera@2x.png';
import {
  StyledCameraIcon,
  StyledIconContainer,
  StyledListItem,
  StyledMedicalFileIcon,
} from 'Components/Generic/EncounterSheet/PatientBackground/Style';
import { useTranslation } from 'react-i18next';
import { setEncounterAndPatient } from 'Store/Actions/ActiveActions';
import { store } from 'index';
import { connect } from 'react-redux';
import List from '@material-ui/core/List';
import openDocumentInANewWindow from 'Utils/Helpers/openDocumentInANewWindow';
import { createSummaryLetter } from 'Utils/Helpers/Letters/createSummaryLetter';
import { FHIR } from 'Utils/Services/FHIR';
import { useEffect } from 'react';

const StyledExaminationStatusesWithIcons = ({
  encounterData,
  encounterSheet,
  patient,
  handleCreateData,
  currentUser,
  facility,
  languageCode
}) => {
  const { t } = useTranslation();
  const MedicalFileClick = (doc) => {
    openDocumentInANewWindow(doc);
  };
  const CameraClick = () => {
    //If we wish to reload all the info again - multiple users ? then run
    // handleCreateData(true);
    store.dispatch(setEncounterAndPatient(encounterData, patient));
  };
  const [existLetter, setExistLetter] = React.useState(false);
  const [letterInPreogress, setLetterInPreogress] = React.useState(false);

  useEffect(() => {
    if (
      encounterData.status === 'finished' ||
      encounterData.extensionSecondaryStatus === 'waiting_for_release'
    ) {
      existSummeryLetter();
    }
  }, []);

  const createLetter = async (existLetterId) => {
    if ((encounterData.status === 'finished' && existLetterId) ||
    encounterData.extensionSecondaryStatus === 'waiting_for_release')
    {
      setLetterInPreogress(true)
      let docId = await createSummaryLetter({
        encounter: encounterData,
        patientId: patient.id,
        currentUser,
        facility,
        docID: existLetterId,
      });
      setExistLetter(docId);
      setLetterInPreogress(false)
    }
  };

  const existSummeryLetter = async () => {
    const documentReferenceData = await FHIR('DocumentReference', 'doWork', {
      functionName: 'getDocumentReference',
      searchParams: { category: 5, encounter: encounterData.id },
    });
    console.log(documentReferenceData)
    return documentReferenceData &&
      documentReferenceData.data &&
      documentReferenceData.data.total >= 1
      ? setExistLetter(documentReferenceData.data.entry[1].resource.id)
      : false;
  };

  return (
    <React.Fragment>
      <StyledIconContainer>
        <StyledCameraIcon
          canClickEncounter={encounterSheet ? false : true}
          onClick={!encounterSheet ? CameraClick : null} lang={languageCode}>
          <img alt={'Camera'} src={Camera} />
          <span>{t('Encounter sheet')}</span>
        </StyledCameraIcon>
        <List>
          {/*<input value={docID} />
            <input value={encounterData.status} />*/}
          <StyledListItem>
            <StyledMedicalFileIcon
              lang={languageCode}
              onClick={() => {
                createLetter(existLetter)
              }}
              canClickMedical={
                (encounterData.status === 'finished' && existLetter && !letterInPreogress) ||
                (encounterData.extensionSecondaryStatus === 'waiting_for_release' && !letterInPreogress)

              }>
              <img alt={'MedicalFile'} src={MedicalFile} />
              <span>{t('Summary letter')}</span>
            </StyledMedicalFileIcon>
          </StyledListItem>
        </List>
      </StyledIconContainer>
    </React.Fragment>
  );
};
const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    languageDirection: state.settings.lang_dir,
    languageCode: state.settings.lang_code,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
    currentUser: state.active.activeUser,
    facility: store.getState().settings.facility,
  };
};
export default connect(
  mapStateToProps,
  null,
)(StyledExaminationStatusesWithIcons);
