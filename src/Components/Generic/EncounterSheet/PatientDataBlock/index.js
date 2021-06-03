import React, { useEffect, useState } from 'react';
import {
  StyledChipWithImage,
  StyledPatientDataBlock,
  StyledTextInput,
  StyledEncounterDocLabel,
  StyledReasonLabel,
  StyledAdmissionFormButton,
  StyledAvatarIdBlock,
} from './Style';
import AvatarIdBlock from 'Assets/Elements/AvatarIdBlock';
import CustomizedTableButton from 'Assets/Elements/CustomizedTable/CustomizedTableButton';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import ChipWithImage from 'Assets/Elements/StyledChip';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirDocumentReference from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirDocumentReference';
import Loader from 'Assets/Elements/Loader';
//import { combineBase_64 } from 'Utils/Helpers/combineBase_64';
import { calculateFileSize } from 'Utils/Helpers/calculateFileSize';
import { decodeBase_64IntoBlob } from 'Utils/Helpers/decodeBase_64IntoBlob';
import { gotToPatientAdmission } from 'Utils/Helpers/goTo/gotoPatientAdmission';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import isAllowed from 'Utils/Helpers/isAllowed';
import {onExitStandAlone} from 'Assets/Elements/PopUpOnExit/OnExitStandAlone';

const PatientDataBlock = ({
  encounter,
  patient,
  languageDirection,
  formatDate,
  isSomethingWasChanged
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [selectedServicesType, setSelectedServicesType] = useState([]);

  // Files scan - vars - globals
  const FILES_OBJ = { type: 'MB', valueInBytes: 1000000, maxSize: 2, fix: 1 };
  const labelFileButtonSpace = 7;
  const referralRef = React.useRef();
  const commitmentRef = React.useRef();
  const additionalDocumentRef = React.useRef();
  const [additionalDocumentFile, setAdditionalDocumentFile] = useState({});
  const [documents, setDocuments] = useState([]);
  const [referralFile, setReferralFile] = useState({});
  const [referralBlob, setReferralBlob] = useState('');
  const [commitmentBlob, setCommitmentBlob] = useState('');
  //const [referralFile_64, setReferralFile_64] = useState('');
  //const [commitmentFile_64, setCommitmentFile_64] = useState('');
  const [commitmentFile, setCommitmentFile] = useState({});
  const [additionalDocumentBlob, setAdditionalDocumentBlob] = useState('');
  //const [additionalDocumentFile_64, setAdditionalDocumentFile_64] = useState('');
  const [admissionFormButton, setAdmissionForm] = useState({});
  const [loading, setLoading] = useState(true);

  const authorizationACO = {
    patientAdmission: isAllowed('patient_admission'),
  };

  useEffect(() => {
    if (encounter) {
      if (encounter.examination && encounter.examination.length) {
        const selectedArr = encounter.examination.map(
          (reasonCodeEl, reasonCodeElIndex) => {
            return {
              serviceType: {
                name: encounter.serviceType,
                code: encounter.serviceTypeCode,
              },
              reasonCode: {
                name: reasonCodeEl,
                code: encounter.examinationCode[reasonCodeElIndex],
              },
            };
          },
        );
        setSelectedServicesType(selectedArr);
      }
    }

    //Loading documents
    if (encounter.id && patient.id) {
      (async () => {
        const documentReferenceData = await FHIR(
          'DocumentReference',
          'doWork',
          {
            functionName: 'getDocumentReference',
            searchParams: {
              encounter: encounter.id,
              patient: patient.id,
            },
          },
        );
        if (documentReferenceData.data.total) {
          const documentsArray = [];
          for (
            let documentIndex = 0;
            documentReferenceData.data.entry.length > documentIndex;
            documentIndex++
          ) {
            if (documentReferenceData.data.entry[documentIndex].resource) {
              const normalizedFhirDocumentReference = normalizeFhirDocumentReference(
                documentReferenceData.data.entry[documentIndex].resource,
              );

              documentsArray.push(normalizedFhirDocumentReference);
              // const base_64 = combineBase_64(
              //   normalizedFhirDocumentReference.data,
              //   normalizedFhirDocumentReference.contentType,
              // );
              const [, SizeInMB] = calculateFileSize(
                atob(normalizedFhirDocumentReference.data).length,
                FILES_OBJ.valueInBytes,
                FILES_OBJ.fix,
                FILES_OBJ.maxSize,
              );
              let obj = {
                name: normalizedFhirDocumentReference.url,
                size: SizeInMB,
              };
              const blob = decodeBase_64IntoBlob(
                normalizedFhirDocumentReference.data,
                normalizedFhirDocumentReference.contentType,
              );
              if (normalizedFhirDocumentReference.url.startsWith('Referral')) {
                setReferralBlob(blob);
                //setReferralFile_64(base_64);
                setReferralFile(obj);
                referralRef.current = 'Referral';
              } else if (
                normalizedFhirDocumentReference.url.startsWith('Commitment')
              ) {
                setCommitmentBlob(blob);
                //setCommitmentFile_64(base_64);
                setCommitmentFile(obj);
                commitmentRef.current = 'Commitment';
              } else {
                setAdditionalDocumentBlob(blob);
                //setAdditionalDocumentFile_64(base_64);
                setAdditionalDocumentFile(obj);
                additionalDocumentRef.current = 'Document';
              }
            }
          }
          setDocuments(documentsArray);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })();
    }

    if (
      authorizationACO.patientAdmission === 'view' ||
      authorizationACO.patientAdmission === 'write'
    ) {
      setAdmissionForm({
        label: t('To admission form'),
        variant: 'text',
        color: 'primary',
        onClickHandler: () => {
          if (isSomethingWasChanged.current()) {
            //need to create custom popup because if the popup is part of the component the lazy load form rerender when the popup open
            onExitStandAlone(() => gotToPatientAdmission(encounter, patient, history))
          } else {
             gotToPatientAdmission(encounter, patient, history) //user function
          }
        }
      })
    } else {
      setAdmissionForm({
        label: t('To admission form'),
        variant: 'text',
        color: 'primary',
        mode: 'view'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encounter, patient]);

  const onClickFileHandler = (event, ref) => {
    event.stopPropagation();
    event.preventDefault();
    let refId = ref.current;
    if (documents.length) {
      if (documents.find((doc) => doc.url.startsWith(refId))) {
        if (refId.startsWith('Referral')) {
          window.open(URL.createObjectURL(referralBlob), referralFile.name);
        } else if (refId.startsWith('Commitment')) {
          window.open(URL.createObjectURL(commitmentBlob), commitmentFile.name);
        } else if (refId.startsWith('Document')) {
          window.open(
            URL.createObjectURL(additionalDocumentBlob),
            additionalDocumentFile.name,
          );
        }
      }
    }
  };

  return (
    <StyledPatientDataBlock>

      <StyledAvatarIdBlock>
        <AvatarIdBlock
          edit_mode={0}
          showEditButton={false}
          priority={encounter.priority}
          patientData={patient}
          showDivider
        />
      </StyledAvatarIdBlock>
      {/*</StyledPatientDataBlock>*/}
      <StyledTextInput>
        <StyledReasonLabel>{t('Reason for referral')}</StyledReasonLabel>
        <Typography variant='subtitle1' gutterBottom>
          {selectedServicesType.map((selected, selectedIndex) => (
            <span key={selectedIndex}>
              {`${t(selected.serviceType.name)} - ${t(
                selected.reasonCode.name,
              )}`}
              {selectedIndex + 1 < selectedServicesType.length ? ' , ' : ' '}
            </span>
          ))}
        </Typography>
      </StyledTextInput>

      <StyledTextInput>
        <StyledEncounterDocLabel>
          {t('Encounter documents')}
        </StyledEncounterDocLabel>
        {Object.values(referralFile).length > 0 && (
          <Grid
            container={true}
            spacing={labelFileButtonSpace}
            style={{ marginBottom: '34px' }}>
            <Grid item xs={3}>
              <label
                style={{
                  color: `${'#000b40'}`,
                }}
                htmlFor='Referral'>
                {`${t('Referral')}`}
              </label>
            </Grid>
            <Grid item xs={4}>
              <StyledChipWithImage>
                <ChipWithImage
                  htmlFor='Referral'
                  label={referralFile.name}
                  size={referralFile.size}
                  onClick={(event) => onClickFileHandler(event, referralRef)}
                />
              </StyledChipWithImage>
            </Grid>
          </Grid>
        )}
        {Object.values(commitmentFile).length > 0 && (
          <Grid
            container={true}
            spacing={labelFileButtonSpace}
            style={{ marginBottom: '34px' }}>
            <Grid item xs={3}>
              <label
                style={{
                  color: `${'#000b40'}`,
                }}
                htmlFor='Commitment'>
                {`${t('Commitment')}`}
              </label>
            </Grid>
            <Grid item xs={4}>
              <StyledChipWithImage>
                <ChipWithImage
                  htmlFor='Commitment'
                  label={commitmentFile.name}
                  size={commitmentFile.size}
                  onClick={(event) => onClickFileHandler(event, commitmentRef)}
                />
              </StyledChipWithImage>
            </Grid>
          </Grid>
        )}
        {Object.values(additionalDocumentFile).length > 0 && (
          <Grid
            container={true}
            spacing={labelFileButtonSpace}
            style={{ marginBottom: '34px' }}>
            <Grid item xs={3}>
              <label
                style={{
                  color: `${'#000b40'}`,
                  whiteSpace: `${'nowrap'}`,
                }}
                htmlFor='AdditionalDocument'>
                {`${t('Additional document')}`}
              </label>
            </Grid>
            <Grid item xs={4}>
              <StyledChipWithImage>
                <ChipWithImage
                  htmlFor='AdditionalDocument'
                  label={additionalDocumentFile.name}
                  size={additionalDocumentFile.size}
                  onClick={(event) =>
                    onClickFileHandler(event, additionalDocumentRef)
                  }
                />
              </StyledChipWithImage>
            </Grid>
          </Grid>
        )}
      </StyledTextInput>

      <StyledAdmissionFormButton>
        <CustomizedTableButton height='32px' {...admissionFormButton} />
      </StyledAdmissionFormButton>
      {loading && <Loader />}
    </StyledPatientDataBlock>
  );
};

export default PatientDataBlock;
