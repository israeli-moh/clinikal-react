import React, { useEffect, useState } from 'react';
import { useForm, FormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setEncounterAndPatient } from 'Store/Actions/ActiveActions';
import normalizeFhirRelatedPerson from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirRelatedPerson';
import { splitBase_64 } from 'Utils/Helpers/splitBase_64';
import { baseRoutePath } from 'Utils/Helpers/baseRoutePath';
import {
  StyledButton,
  StyledForm,
  StyledFormGroup,
  StyledPatientDetails,
} from './Style';
import { useTranslation } from 'react-i18next';
import EscortPatient from './EscortPatient';
import ContactInformation from './ContactInformation';
import VisitDetails from './VisitDetails';
import Payment from './Payment';
import Documents from './Documents';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import { fhirFormatDateTime } from 'Utils/Helpers/Datetime/formatDate';
import { FHIR } from 'Utils/Services/FHIR';
import { store } from 'index';
import Loader from 'Assets/Elements/Loader';
import { showSnackbar } from 'Store/Actions/UiActions/ToastActions';
import isAllowed from "../../../../Utils/Helpers/isAllowed";
import { answerType } from 'Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem';
// import { DevTool } from 'react-hook-form-devtools';

const PatientDetailsBlock = ({
  patientData,
  edit_mode,
  encounterData,
  formatDate,
  setIsDirty,
  configuration,
  isSomethingWasChanged
}) => {
  const { t } = useTranslation();
  let history = useHistory();
  const methods = useForm({
    mode: 'onBlur',
    submitFocusError: true,
  });
  const { handleSubmit, formState, setValue, getValues } = methods;

  const [initValueObj, setInitValueObj] = useState({});
  /*
  * Save all the init value in the state than call to setValue
  * */
  const initValue = (arrayValues) => {
    setInitValueObj((prev) => {
      const initValues = { ...prev };
      arrayValues.forEach((val) => {
        for (const index in val) {
          if (!initValues.hasOwnProperty(index)) {
            initValues[index] = val[index];
          }
        }
      });
      return initValues;
    });
    setValue(arrayValues);
  };

  /*
  * compare initValueObj with currentValues and find changes
  * */
  const isFormDirty = () => {
    if (!writePermission()) return false;
    const currentValues = getValues({ nest: true });
   // console.log(currentValues)
  //  console.log(initValueObj)

    const emptyInFirst = [
        'Referral',
        'additionalDocumentFile_64',
        'addressPostalCode',
        'escortMobilePhone',
        'escortName',
        'examinationCode',
        'isEscorted',
        'paymentAmount',
        'paymentMethod',
        'receiptNumber',
        'reasonForReferralDetails'
    ];
    for (const elem of emptyInFirst) {
      if (
          typeof currentValues[elem] !== 'undefined' &&
          currentValues[elem] !== null &&
          ( currentValues[elem].length > 0 || currentValues[elem] === true || ( typeof currentValues[elem] === 'object' && currentValues[elem] !== {} )   ) &&
          typeof initValueObj[elem] === 'undefined'
      ) {
      //  console.log(`missing - ${elem}`);
        return true;
      }
    }

    for (const index in initValueObj) {
      if (
          (typeof initValueObj[index] === "undefined" && (typeof currentValues[index] !== "undefined" && currentValues[index].length > 0))
          || (typeof initValueObj[index] !== "undefined" && JSON.stringify(initValueObj[index]) !== JSON.stringify(currentValues[index]))
      ) {
       // console.log(`changed - ${index}`);
        return true;
      }
    }
    return false;
  };

    useEffect(() => {
      initValue([
        { reasonForReferralDetails: encounterData.extensionReasonCodeDetails },
      ])
    }, []);

  /*
 * </END FORM DIRTY FUNCTIONS>
 * */



  // Giving the patientAdmission if the form is dirty
  // meaning that there has been changes in the form
  const { dirty } = formState;

  useEffect(() => {
   // setIsDirty(dirty);
  }, [dirty, setIsDirty]);

  useEffect(() => {
    isSomethingWasChanged.current = isFormDirty;
    return () => {
      isSomethingWasChanged.current = () => false;

    };
  }, [initValueObj]);


  /*
   * setLoading - hide/show loader
   * loadingStatus - stores the status of the loading of the component in the screen
   * handleLoading update the status of the loading
   * */
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState({
    payment: false,
    documents: false,
    escort: false,
  });

  useEffect(() => {
    for (const val in loadingStatus) {
      if (!loadingStatus[val]) return;
    }
    setLoading(false);
  }, [loadingStatus]);

  const handleLoading = (componentName) => {
    setLoadingStatus((prev) => {
      const cloneLoadingStatus = { ...prev };
      cloneLoadingStatus[componentName] = true;
      return cloneLoadingStatus;
    });
  };

  const writePermission = React.useCallback(() => {
    if (isAllowed('patient_admission') === 'view') {
      return false;
    }
    if (encounterData.status === 'finished') {
      return false;
    }
    if (isAllowed('patient_admission') === 'write') {
      return true;
    }
    return false;
  });
  //Sending the form
  const [requiredErrors, setRequiredErrors] = useState({
    selectTest: '',
    commitmentAndPaymentReferenceForPaymentCommitment: '',
    commitmentAndPaymentCommitmentDate: '',
    commitmentAndPaymentCommitmentValidity: '',
    commitmentAndPaymentDoctorsName: '',
    commitmentAndPaymentDoctorsLicense: '',
    arrivalWay: '',
  });
  const onSubmit = async (data) => {

    if(writePermission()) {
      try {
        const clear = isRequiredValidation(data);
        if (clear) {
          setLoading(true);
          const APIsArray = [];
          //Updating patient
          let patientPatchParams = {};
          if (data.contactInformationTabValue === 0) {
            if (data.addressCity) {
              patientPatchParams['city'] = data.addressCity;
            }
            if (data.addressStreet && data.addressStreet.trim()) {
              console.log(data.addressStreet)
              patientPatchParams['streetName'] = data.addressStreet;
            }
            if (data.addressStreetNumber && data.addressStreetNumber.trim()) {
              patientPatchParams['streetNumber'] = data.addressStreetNumber;
            }
            if (data.addressPostalCode) {
              patientPatchParams['postalCode'] = data.addressPostalCode;
            }
          } else {
            if (data.POBoxCity) {
              patientPatchParams['city'] = data.POBoxCity;
            }
            if (data.POBox) {
              patientPatchParams['POBox'] = data.POBox;
            }
            if (data.POBoxPostalCode) {
              patientPatchParams['postalCode'] = data.POBoxPostalCode;
            }
          }
          if (Object.keys(patientPatchParams).length) {
            APIsArray.push(
              FHIR('Patient', 'doWork', {
                functionName: 'patchPatient',
                functionParams: {patientPatchParams, patientId: patientData.id},
              }),
            );
          }

          if (encounterData.appointment) {
            APIsArray.push(
              FHIR('Appointment', 'doWork', {
                functionName: 'updateAppointment',
                functionParams: {
                  functionParams: {
                    appointmentId: encounterData.appointment,
                    appointmentParams: {
                      status: 'arrived',
                    },
                  },
                },
              }),
            );
          }

          const items = data.questionnaire.item.map((i) => {
            const item = {
              linkId: i.linkId,
              text: i.text,
            };
            switch (i.linkId) {
              case '1':
                 (data.commitmentAndPaymentReferenceForPaymentCommitment && data.paymentTab === 'HMO') ?
                  item['answer'] = answerType(i.type, data.commitmentAndPaymentReferenceForPaymentCommitment) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '2':
                 (data.commitmentAndPaymentCommitmentDate && data.paymentTab === 'HMO') ?
                  item['answer'] = answerType(i.type, data.commitmentAndPaymentCommitmentDate) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '3':
                 (data.commitmentAndPaymentCommitmentValidity && data.paymentTab === 'HMO') ?
                  item['answer'] = answerType(i.type, data.commitmentAndPaymentCommitmentValidity) :
                   item['answer'] = answerType(i.type, null);
                break;
              case '4':
                 (data.commitmentAndPaymentDoctorsName && data.paymentTab === 'HMO') ?
                  item['answer'] = answerType(
                      i.type,
                      data.commitmentAndPaymentDoctorsName,
                  ) :
                   item['answer'] = answerType(i.type, null);
                break;
              case '5':
                (data.commitmentAndPaymentDoctorsLicense && data.paymentTab === 'HMO') ?
                  item['answer'] = answerType(i.type, data.commitmentAndPaymentDoctorsLicense) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '6':
                 (data.paymentAmount && data.paymentTab === 'Private') ?
                  item['answer'] = answerType(i.type, data.paymentAmount) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '7':
                 (data.paymentMethod && data.paymentTab === 'Private') ?
                  item['answer'] = answerType(i.type, data.paymentMethod) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '8':
                 (data.receiptNumber && data.paymentTab === 'Private') ?
                  item['answer'] = answerType(i.type, data.receiptNumber):
                  item['answer'] = answerType(i.type, null);
                break;
              case '9':
                 (data.exemptionReason && data.paymentTab === 'noPayment') ?
                  item['answer'] = answerType(i.type, data.exemptionReason) :
                  item['answer'] = answerType(i.type, null);
                break;
              case '10':
                 (data.noPaymentComment && data.paymentTab === 'noPayment') ?
                  item['answer'] = answerType(i.type, data.noPaymentComment) :
                  item['answer'] = answerType(i.type, null);
                break;

              default:
                break;
            }
            return item;
          });

          if (data.questionnaireResponse) {
            APIsArray.push(
              FHIR('QuestionnaireResponse', 'doWork', {
                functionName: 'patchQuestionnaireResponse',
                questionnaireResponseId: data.questionnaireResponse,
                questionnaireResponseParams: {
                  item: items,
                  author: store.getState().login.userID,
                  authored: fhirFormatDateTime(),
                },
              }),
            );
          } else {
            APIsArray.push(
              FHIR('QuestionnaireResponse', 'doWork', {
                functionName: 'createQuestionnaireResponse',
                functionParams: {
                  questionnaireResponse: {
                    questionnaire: data.questionnaireId,
                    status: 'completed',
                    patient: patientData.id,
                    encounter: encounterData.id,
                    author: store.getState().login.userID,
                    authored: fhirFormatDateTime(),
                    source: patientData.id,
                    item: items,
                  },
                },
              }),
            );
          }
          //Updating/Creating relatedPerson
          if (data.isEscorted) {
            let relatedPersonParams = {};
            if (encounterData.relatedPerson) {
              if (data.escortName) relatedPersonParams['name'] = data.escortName;
              if (data.escortMobilePhone)
                relatedPersonParams['mobilePhone'] = data.escortMobilePhone;
              APIsArray.push(
                FHIR('RelatedPerson', 'doWork', {
                  functionName: 'updateRelatedPerson',
                  functionParams: {
                    relatedPersonParams,
                    relatedPersonId: encounterData.relatedPerson,
                  },
                }),
              );
            } else {
              if (data.escortName) {
                relatedPersonParams['name'] = data.escortName;
              }
              if (data.escortMobilePhone) {
                relatedPersonParams['mobilePhone'] = data.escortMobilePhone;
              }
              if (patientData && patientData.id) {
                relatedPersonParams['patient'] = patientData.id;
              }
              APIsArray.push(
                FHIR('RelatedPerson', 'doWork', {
                  functionName: 'createRelatedPerson',
                  functionParams: {
                    relatedPersonParams,
                  },
                }),
              );
            }
          }
          const promises = await Promise.all(APIsArray);
          const encounter = {...encounterData};
          encounter.examinationCode = data.examinationCode;
          encounter.serviceTypeCode = data.serviceTypeCode;
          if (configuration.clinikal_pa_arrival_way === '1') {
            encounter['extensionArrivalWay'] = data.arrivalWay;
          }
          if (data.reasonForReferralDetails) {
            encounter['extensionReasonCodeDetails'] =
              data.reasonForReferralDetails;
          }
          if (data.isEscorted) {
            if (!encounter.relatedPerson) {
              const NewRelatedPerson = normalizeFhirRelatedPerson(
                promises[APIsArray.length - 1].data,
              );
              encounter['relatedPerson'] = NewRelatedPerson.id;
            }
          } else {
            delete encounter['relatedPerson'];
          }
          if (data.isUrgent) {
            encounter['priority'] = 2;
          } else {
            encounter['priority'] = 1;
          }
          if (encounter.status === 'planned') {
            encounter.status = configuration.clinikal_pa_next_enc_status;
          }
          await FHIR('Encounter', 'doWork', {
            functionName: 'updateEncounter',
            functionParams: {
              encounterId: encounter.id,
              encounter: encounter,
            },
          });
          // TODO: Check if the document came from the server or not if it did don't send it
          if (data.Referral && data.ReferralChanged) {
            await saveDocument(data.Referral);
          }
          if (
            configuration.clinikal_pa_commitment_form === '1' &&
            data.Commitment &&
            data.CommitmentChanged
          ) {
            await saveDocument(data.Commitment);
          }
          if (
            data.additionalDocumentFile_64 &&
            data.additionalDocumentFile_64Changed
          ) {
            await saveDocument(data.additionalDocumentFile_64);
          }
          store.dispatch(
            showSnackbar(t('The patient was successfully admitted'), 'check'),
          );
          history.push(`${baseRoutePath()}/imaging/patientTracking`);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      history.push(`${baseRoutePath()}/imaging/patientTracking`);
    }
  };

  const saveDocument = async (object) => {
    const base_commitment_64Obj = splitBase_64(object.base_64);
    const documentReferenceCommitment = {
      encounter: encounterData.id,
      patient: patientData.id,
      contentType: base_commitment_64Obj.type,
      data: base_commitment_64Obj.data,
      categoryCode: '2',
      url: object.name,
    };

    await FHIR('DocumentReference', 'doWork', {
      documentReference: documentReferenceCommitment,
      functionName: 'createDocumentReference',
    });
  };

  const requiredFields = {
    arrivalWay: {
      name: 'arrivalWay',
      required: function (data) {
        return data[this.name];
      },
    },
    selectTest: {
      name: 'selectTest',
      required: function (data) {
        return data.examinationCode && data.examinationCode.length > 0;
      },
    },
    commitmentAndPaymentReferenceForPaymentCommitment: {
      name: 'commitmentAndPaymentReferenceForPaymentCommitment',
      linkId: '1',
      codeText: 'Commitment number',
      required: function (data) {
        return data[this.name] && data[this.name].trim().length;
      },
    },
    commitmentAndPaymentCommitmentDate: {
      name: 'commitmentAndPaymentCommitmentDate',
      linkId: '2',
      codeText: 'Commitment date',
      required: function (data) {
        return (
          data[this.name] &&
          moment(data[this.name]).toString().length > 0 &&
          moment(data[this.name]).isValid
        );
      },
    },
    commitmentAndPaymentCommitmentValidity: {
      name: 'commitmentAndPaymentCommitmentValidity',
      linkId: '3',
      codeText: 'Commitment expiration date',
      required: function (data) {
        return (
          data[this.name] &&
          moment(data[this.name]).toString().length > 0 &&
          moment(data[this.name]).isValid
        );
      },
    },
    commitmentAndPaymentDoctorsName: {
      name: 'commitmentAndPaymentDoctorsName',
      linkId: '4',
      codeText: 'Signing doctor',
      required: function (data) {
        return data[this.name] && data[this.name].trim().length;
      },
    },
    commitmentAndPaymentDoctorsLicense: {
      name: 'commitmentAndPaymentDoctorsLicense',
      linkId: '5',
      codeText: 'doctor license number',
      required: function (data) {
        return data[this.name] && data[this.name].trim().length;
      },
    },
  };

  const isRequiredValidation = (data) => {
    console.log(data);
    let clean = true;
    for (const fieldKey in requiredFields) {
      if (requiredFields.hasOwnProperty(fieldKey)) {
        let answer;
        if (configuration.clinikal_pa_commitment_form === '1') {
          answer = !requiredFields[fieldKey].required(data);
        } else {
          if (
            !requiredFields[fieldKey].name
              .toLowerCase()
              .startsWith('commitment')
          ) {
            answer = !requiredFields[fieldKey].required(data);
          }
        }
        if (answer) {
          setRequiredErrors((prevState) => {
            const cloneState = { ...prevState };
            cloneState[requiredFields[fieldKey].name] = t('Value is required');
            return cloneState;
          });
          clean = false;
        } else {
          setRequiredErrors((prevState) => {
            const cloneState = { ...prevState };
            cloneState[requiredFields[fieldKey].name] = '';
            return cloneState;
          });
        }
      }
    }
    return clean;
  };
  return (
    <React.Fragment>
      <StyledPatientDetails edit={edit_mode} loading={loading}>
        <FormContext
          {...methods}
          requiredErrors={requiredErrors}
          permission={writePermission() ? 'write' : 'view'}
          isCommitmentForm={configuration.clinikal_pa_commitment_form}>
          <StyledForm >
            <EscortPatient
              writePermission={writePermission()}
              relatedPersonId={encounterData.relatedPerson}
              isArrivalWay={configuration.clinikal_pa_arrival_way}
              encounterArrivalWay={encounterData.extensionArrivalWay}
              handleLoading={handleLoading}
              initValueFunction={initValue}
            />
            <ContactInformation
              writePermission={writePermission()}
              city={patientData.city}
              patientPOBox={patientData.POBox}
              postalCode={patientData.postalCode}
              streetName={patientData.streetName}
              streetNumber={patientData.streetNumber}
              addressType={patientData.addressType}
              initValueFunction={initValue}
            />
            <VisitDetails
              reasonCodeDetails={encounterData.extensionReasonCodeDetails}
              examination={encounterData.examination}
              examinationCode={encounterData.examinationCode}
              serviceType={encounterData.serviceType}
              serviceTypeCode={encounterData.serviceTypeCode}
              priority={encounterData.priority}
              disableHeaders={false}
              initValueFunction={initValue}
            />
            <Payment
              writePermission={writePermission()}
              pid={patientData.id}
              eid={encounterData.id}
              formatDate={formatDate}
              managingOrganization={patientData.managingOrganization}
              handleLoading={handleLoading}
              initValueFunction={initValue}
            />
            <Documents
              writePermission={writePermission()}
              eid={encounterData.id}
              pid={patientData.id}
              handleLoading={handleLoading}
              initValueFunction={initValue}
            />
            <StyledFormGroup>
              <Grid container direction='row' justify='flex-end'>
                <Grid item lg={3} sm={4}>
                  <StyledButton
                    onClick={handleSubmit(onSubmit)}
                    color='primary'
                    variant='contained'
                    type='button'
                    disabled={loading}
                    letterSpacing={'0.1'}>
                    {t(writePermission() ? 'Save & Close' : 'Close')}
                  </StyledButton>
                </Grid>
                {/* <Grid item lg={3} sm={4}>
                <StyledButton
                  color='primary'
                  variant='contained'
                  fontWeight={'bold'}
                  onClick={() => {
                    setEncounterAndPatient(encounterData, patientData);
                    history.push(`${baseRoutePath()}/generic/encounterSheet`);
                  }}>
                  {t('Medical questionnaire')}
                </StyledButton>
              </Grid> */}
              </Grid>
            </StyledFormGroup>
          </StyledForm>
        </FormContext>
        {/* <DevTool control={control} /> */}
        {loading ? <Loader /> : null}
      </StyledPatientDetails>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    languageDirection: state.settings.lang_dir,
  };
};

export default connect(mapStateToProps, { setEncounterAndPatient })(
  PatientDetailsBlock,
);
