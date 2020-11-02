//MedicalAdmission
import { connect } from 'react-redux';
import React, { useEffect, useState, useRef } from 'react';
import VisitDetails from 'Components/Generic/PatientAdmission/PatientDetailsBlock/VisitDetails';
import { FormContext, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  StyledForm,
  StyledRadioGroupChoice,
  StyledMedicalAdmission,
} from './Style';
import RadioGroupChoice from 'Assets/Elements/RadioGroupChoice';
import PopUpFormTemplates from 'Components/Generic/PopupComponents/PopUpFormTemplates';
import NursingAnamnesis from './NursingAnamnesis';
import { FHIR } from 'Utils/Services/FHIR';
import UrgentAndInsulation from './UrgentAndInsulation';
import Sensitivities from './Sensitivities';
import BackgroundDiseases from './BackgroundDiseases';
import ChronicMedication from './ChronicMedication';
import { Checkbox, Grid, ListItemText } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlankOutlined } from '@material-ui/icons';
import normalizeFhirQuestionnaireResponse from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirQuestionnaireResponse';
import SaveForm from '../GeneralComponents/SaveForm';
import { store } from 'index';
import { fhirFormatDateTime } from 'Utils/Helpers/Datetime/formatDate';

const MedicalAdmission = ({
  patient,
  encounter,
  formatDate,
  languageDirection,
  history,
  verticalName,
  permission,
  validationFunction,
  functionToRunOnTabChange,
  isSomethingWasChanged,
  prevEncounterId,
  setLoading,
}) => {
  const { t } = useTranslation();
  const methods = useForm({
    mode: 'onBlur',
    submitFocusError: true,
  });

  const { handleSubmit, register, setValue, unregister, getValues } = methods;

  /*
  * <FORM DIRTY FUNCTIONS>
  * */
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
    const currentValues = getValues({ nest: true });
    for (const index in initValueObj) {
      if (
        (typeof initValueObj[index] === "undefined" && currentValues[index].length > 0)
        || (typeof initValueObj[index] !== "undefined" && JSON.stringify(initValueObj[index]) !== JSON.stringify(currentValues[index]))
      ) {
        console.log(`changed - ${index}`);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    isSomethingWasChanged.current = isFormDirty;
  }, [initValueObj]);

  /*
 * </END FORM DIRTY FUNCTIONS>
 * */

  const [requiredErrors, setRequiredErrors] = useState({
    examinationCode: '',
    sensitivitiesCodes: '',
    sensitivities: '',
    backgroundDiseasesCodes: '',
    background_diseases: '',
    chronicMedicationCodes: '',
    medication: '',
  });

  // KEEP this comment code here need that for later
  // const requiredErrorsRef = useRef({
  //   examinationCode: '',
  //   sensitivitiesCodes: '',
  //   sensitivities: '',
  //   backgroundDiseasesCodes: '',
  //   background_diseases: '',
  //   chronicMedicationCodes: '',
  //   medication: '',
  // });

  /*
   * setLoading - hide/show loader
   * loadingStatus - stores the status of the loading of the component in the screen
   * handleLoading update the status of the loading
   * */
  const [loadingStatus, setLoadingStatus] = useState({
    questionnaireResponse: false,
    sensitivities: false,
    medication: false,
    backgroundDiseases: false,
  });
  const [disabledOnSubmit, setdisabledOnSubmit] = useState(false);

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

  const requiredFields = React.useMemo(() => {
    return {
      examinationCode: {
        name: 'examinationCode',
        required: function (data) {
          return data[this.name] && data[this.name].length > 0;
        },
      },
      sensitivitiesCodes: {
        name: 'sensitivitiesCodes',
        required: function (data) {
          if (data.sensitivities === '' || data.sensitivities === 'Not known') {
            return true;
          }
          return data[this.name] && data[this.name].length > 0;
        },
      },
      sensitivities: {
        name: 'sensitivities',
        required: function (data) {
          return data[this.name] && data[this.name].length > 0;
        },
      },
      backgroundDiseasesCodes: {
        name: 'backgroundDiseasesCodes',
        required: function (data) {
          if (
            data.background_diseases === '' ||
            data.background_diseases === 'Usually healthy'
          ) {
            return true;
          }
          return data[this.name] && data[this.name].length > 0;
        },
      },
      background_diseases: {
        name: 'background_diseases',
        required: function (data) {
          return data[this.name] && data[this.name].length > 0;
        },
      },
      chronicMedicationCodes: {
        name: 'chronicMedicationCodes',
        required: function (data) {
          if (data.medication === '' || data.medication === "Doesn't exist") {
            return true;
          }
          return data[this.name] && data[this.name].length > 0;
        },
      },
      medication: {
        name: 'medication',
        required: function (data) {
          return data[this.name] && data[this.name].length > 0;
        },
      },
    };
  }, []);

  const isRequiredValidation = (data) => {
    let clean = true;
    if (!data) data = getValues({ nest: true });
    console.log(data);
    const cloneRequiredErrors = { ...requiredErrors };
    for (const fieldKey in requiredFields) {
      if (requiredFields.hasOwnProperty(fieldKey)) {
        const field = requiredFields[fieldKey];
        const answer = field.required(data);
        if (answer) {
          cloneRequiredErrors[field.name] = '';
        } else {
          cloneRequiredErrors[field.name] = t(
            'A value must be entered in the field',
          );
          clean = false;
        }
      }
    }
    setRequiredErrors(cloneRequiredErrors);
    return clean;
  };

  const handlePopUpClose = () => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: false,
      };
    });
  };
  const [defaultContext, setDefaultContext] = React.useState('');
  const [popUpProps, setPopUpProps] = React.useState({
    popupOpen: false,
    formID: '',
    encounter,
    formFieldsTitle: '',
    defaultContext,
    setDefaultContext,
    handlePopupClose: handlePopUpClose,
    setTemplatesTextReturned: null,
    name: '',
  });

  const [questionnaireResponseItems, setQuestionnaireResponseItems] = useState(
    [],
  );
  const [prevEncounterResponse, setPrevEncounterResponse] = useState([]);

  useEffect(() => {
    (async () => {
      initValue([
        { reasonForReferralDetails: encounter.extensionReasonCodeDetails },
      ])
      try {
        let normalizedFhirQuestionnaireResponse = {};
        const q = await FHIR('Questionnaire', 'doWork', {
          functionName: 'getQuestionnaire',
          functionParams: {
            QuestionnaireName: 'medical_admission_questionnaire',
          },
        });
        const questionnaireResponseArr = [];
        questionnaireResponseArr.push(
          FHIR('QuestionnaireResponse', 'doWork', {
            functionName: 'getQuestionnaireResponse',
            functionParams: {
              encounterId: encounter.id,
              patientId: patient.id,
              questionnaireId: q.data.entry[1].resource.id,
            },
          }),
        );
        if (prevEncounterId) {
          questionnaireResponseArr.push(
            FHIR('QuestionnaireResponse', 'doWork', {
              functionName: 'getQuestionnaireResponse',
              functionParams: {
                encounterId: prevEncounterId,
                patientId: patient.id,
                questionnaireId: q.data.entry[1].resource.id,
              },
            }),
          );
        }
        const qrResponse = await Promise.all(questionnaireResponseArr);

        if (qrResponse[0].data.total) {
          // Set that curr response is available
          normalizedFhirQuestionnaireResponse = normalizeFhirQuestionnaireResponse(
            qrResponse[0].data.entry[1].resource,
          );

          setQuestionnaireResponseItems(
            normalizedFhirQuestionnaireResponse.items,
          );
          register({ name: 'currentQuestionnaireItems' });
          initValue([
            {
              currentQuestionnaireItems:
                normalizedFhirQuestionnaireResponse.items,
            },
          ]);
        } else if (
          prevEncounterId &&
          qrResponse[1] &&
          qrResponse[1].data.total
        ) {
          // if there is prev response
          setPrevEncounterResponse(
            normalizeFhirQuestionnaireResponse(
              qrResponse[1].data.entry[1].resource,
            ).items,
          );
        }
        const Questionnaire = q.data.entry[1].resource;
        register({ name: 'questionnaire' });
        register({ name: 'questionnaireResponseId' });
        initValue([
          { questionnaire: Questionnaire },
          { questionnaireResponseId: normalizedFhirQuestionnaireResponse.id },
        ]);
        handleLoading('questionnaireResponse');
      } catch (error) {
        console.log(error);
      }
    })();

    return () => unregister(['questionnaire', 'questionnaireResponseId']);
  }, [
    register,
    setValue,
    unregister,
    encounter.id,
    patient.id,
    prevEncounterId,
  ]);

  useEffect(() => {
    register({ name: 'isPregnancy' });
    return () => unregister(['isPregnancy']);
  }, [register, unregister]);

  useEffect(() => {
    validationFunction.current = isRequiredValidation;
    functionToRunOnTabChange.current = onSubmit;
    return () => {
      functionToRunOnTabChange.current = () => [];
      validationFunction.current = () => true;
      isSomethingWasChanged.current = () => false;
    };
    stopSavingProcess();
  }, []);

  //Radio buttons for pregnancy
  const pregnancyRadioList = ['No', 'Yes'];

  const medicalAdmissionRenderOption = (option, state) => {
    return (
      <React.Fragment>
        <Grid container justify='flex-start' alignItems='center'>
          <Grid item xs={3}>
            <Checkbox
              color='primary'
              icon={<CheckBoxOutlineBlankOutlined />}
              checkedIcon={<CheckBox />}
              checked={state.selected}
            />
          </Grid>
          {option.serviceType && option.serviceType.name && (
            <Grid item xs={3}>
              <ListItemText primary={t(option.serviceType.name)} />
            </Grid>
          )}
          {option.reasonCode && option.reasonCode.name && (
            <Grid item xs={3}>
              <ListItemText primary={t(option.reasonCode.name)} />
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  };

  const medicalAdmissionChipLabel = (selected) => {
    return `${t(selected.reasonCode.name)}`;
  };

  const answerType = (type, data) => {
    if (type === 'string') {
      return [
        {
          valueString: data,
        },
      ];
    } else if (type === 'boolean') {
      return [
        {
          valueBoolean: data,
        },
      ];
    } else {
      return `No such type: ${type}`;
    }
  };

  const savingProcess = () => {
    //   setLoading(true);
    //  setSaveLoading(() => {return true});
    setdisabledOnSubmit(true);
  };

  const stopSavingProcess = () => {
    //   setLoading(false);
    //  setSaveLoading(false);
    setdisabledOnSubmit(false);
  };

  const onSubmit = async (data) => {
    if (!data) data = getValues({ nest: true });
    if (!isRequiredValidation(data)) return;
    savingProcess();
    if (isFormDirty()) {
      try {
        const APIsArray = [];
        const items = data.questionnaire.item.map((i) => {
          const item = {
            linkId: i.linkId,
            text: i.text,
          };
          switch (i.linkId) {
            case '1':
              item['answer'] = answerType(i.type, data.isInsulationInstruction);

              break;
            case '2':
              item['answer'] = answerType(
                i.type,
                data.insulationInstruction || '',
              );
              break;
            case '3':
              item['answer'] = answerType(i.type, data.nursingDetails);
              break;
            case '4':
              item['answer'] = answerType(
                i.type,
                data.isPregnancy === 'Yes' ? true : false,
              );
              break;
            case '5':
              item['answer'] = answerType(
                i.type,
                data.sensitivities === 'Known' ? true : false,
              );
              break;
            case '6':
              item['answer'] = answerType(
                i.type,
                data.background_diseases === 'There are diseases' ? true : false,
              );
              break;
            case '7':
              item['answer'] = answerType(
                i.type,
                data.medication === 'Exist' ? true : false,
              );
              break;
            default:
              break;
          }
          return item;
        });
        if (data.questionnaireResponseId) {
          APIsArray.push(
            FHIR('QuestionnaireResponse', 'doWork', {
              functionName: 'patchQuestionnaireResponse',
              questionnaireResponseId: data.questionnaireResponseId,
              questionnaireResponseParams: {
                item: items,
              },
            }),
          );
        } else {
          APIsArray.push(
            FHIR('QuestionnaireResponse', 'doWork', {
              functionName: 'createQuestionnaireResponse',
              functionParams: {
                questionnaireResponse: {
                  questionnaire: data.questionnaire.id,
                  status: 'completed',
                  patient: patient.id,
                  encounter: encounter.id,
                  author: store.getState().login.userID,
                  authored: fhirFormatDateTime(),
                  source: patient.id,
                  item: items,
                },
              },
            }),
          );
        }
        const cloneEncounter = {...encounter};
        cloneEncounter['examinationCode'] = data.examinationCode;
        cloneEncounter['serviceTypeCode'] = data.serviceTypeCode;
        cloneEncounter['priority'] = data.isUrgent;
        cloneEncounter['extensionReasonCodeDetails'] =
          data.reasonForReferralDetails;
        APIsArray.push(
          FHIR('Encounter', 'doWork', {
            functionName: 'updateEncounter',
            functionParams: {
              encounterId: encounter.id,
              encounter: cloneEncounter,
            },
          }),
        );
        console.log(data);
        //Creating new conditions for sensitivities
        if (data.sensitivities === 'Known') {
          data.sensitivitiesCodes.forEach((sensitivities) => {
            if (
              data.sensitiveConditionsIds &&
              Object.keys(data.sensitiveConditionsIds).length
            ) {
              if (
                !data.sensitiveConditionsIds[sensitivities] ||
                (data.sensitiveConditionsIds[sensitivities] &&
                  !data.currentQuestionnaireItems.length)
              ) {
                APIsArray.push(
                  FHIR('Condition', 'doWork', {
                    functionName: 'createCondition',
                    functionParams: {
                      condition: {
                        encounter: encounter.id,
                        categorySystem:
                          'http://clinikal/condition/category/sensitive',
                        codeSystem:
                          'http://clinikal/diagnosis/type/sensitivities',
                        codeCode: sensitivities,
                        patient: patient.id,
                        recorder: store.getState().login.userID,
                        clinicalStatus: 'active',
                      },
                    },
                  }),
                );
              }
            } else {
              APIsArray.push(
                FHIR('Condition', 'doWork', {
                  functionName: 'createCondition',
                  functionParams: {
                    condition: {
                      categorySystem:
                        'http://clinikal/condition/category/sensitive',
                      codeSystem: 'http://clinikal/diagnosis/type/sensitivities',
                      codeCode: sensitivities,
                      patient: patient.id,
                      recorder: store.getState().login.userID,
                      clinicalStatus: 'active',
                      encounter: encounter.id,
                    },
                  },
                }),
              );
            }
          });
        } else {
          if (
            data.sensitivitiesCodes &&
            data.sensitivitiesCodes.length &&
            data.sensitiveConditionsIds &&
            Object.keys(data.sensitiveConditionsIds).length &&
            data.currentQuestionnaireItems.length
          ) {
            data.sensitivitiesCodes.forEach((code) => {
              if (data.sensitiveConditionsIds[code]) {
                APIsArray.push(
                  FHIR('Condition', 'doWork', {
                    functionName: 'patchCondition',
                    functionParams: {
                      conditionId: data.sensitiveConditionsIds[code].id,
                      patchParams: {
                        clinicalStatus: 'inactive',
                        encounter: encounter.id,
                      },
                    },
                  }),
                );
              }
            });
          }
        }

        //Creating new conditions for backgroundDiseases
        if (data.background_diseases === 'There are diseases') {
          data.backgroundDiseasesCodes.forEach((backgroundDisease) => {
            if (
              data.backgroundDiseasesIds &&
              Object.keys(data.backgroundDiseasesIds).length
            ) {
              if (
                !data.backgroundDiseasesIds[backgroundDisease] ||
                (data.backgroundDiseasesIds[backgroundDisease] &&
                  !data.currentQuestionnaireItems.length)
              ) {
                APIsArray.push(
                  FHIR('Condition', 'doWork', {
                    functionParams: {
                      condition: {
                        categorySystem:
                          'http://clinikal/condition/category/medical_problem',
                        codeSystem: 'http://clinikal/diagnosis/type/bk_diseases',
                        codeCode: backgroundDisease,
                        patient: patient.id,
                        recorder: store.getState().login.userID,
                        clinicalStatus: 'active',
                        encounter: encounter.id,
                      },
                    },
                    functionName: 'createCondition',
                  }),
                );
              }
            } else {
              APIsArray.push(
                FHIR('Condition', 'doWork', {
                  functionParams: {
                    condition: {
                      categorySystem:
                        'http://clinikal/condition/category/medical_problem',
                      codeSystem: 'http://clinikal/diagnosis/type/bk_diseases',
                      codeCode: backgroundDisease,
                      patient: patient.id,
                      recorder: store.getState().login.userID,
                      clinicalStatus: 'active',
                      encounter: encounter.id,
                    },
                  },
                  functionName: 'createCondition',
                }),
              );
            }
          });
        } else {
          if (
            data.backgroundDiseasesCodes &&
            data.backgroundDiseasesCodes.length &&
            data.backgroundDiseasesIds &&
            Object.keys(data.backgroundDiseasesIds).length &&
            data.currentQuestionnaireItems.length
          ) {
            data.backgroundDiseasesCodes.forEach((code) => {
              if (data.backgroundDiseasesIds[code]) {
                APIsArray.push(
                  FHIR('Condition', 'doWork', {
                    functionName: 'patchCondition',
                    functionParams: {
                      conditionId: data.backgroundDiseasesIds[code].id,
                      patchParams: {
                        clinicalStatus: 'inactive',
                        encounter: encounter.id,
                      },
                    },
                  }),
                );
              }
            });
          }
        }

        // Creating a new medicationStatement
        if (data.medication === 'Exist') {
          data.chronicMedicationCodes.forEach((medication) => {
            if (
              data.chronicMedicationIds &&
              Object.keys(data.chronicMedicationIds).length
            ) {
              if (
                !data.chronicMedicationIds[medication] ||
                (data.backgroundDiseasesIds[medication] &&
                  !data.currentQuestionnaireItems.length)
              ) {
                APIsArray.push(
                  FHIR('MedicationStatement', 'doWork', {
                    functionName: 'createMedicationStatement',
                    functionParams: {
                      medicationStatement: {
                        categorySystem:
                          'http://clinikal/medicationStatement/category/medication',
                        status: 'active',
                        patient: patient.id,
                        informationSource: store.getState().login.userID,
                        medicationCodeableConceptCode: medication,
                        medicationCodeableConceptSystem:
                          'http://clinikal/valueset/drugs_list',
                        encounter: encounter.id,
                      },
                    },
                  }),
                );
              }
            } else {
              APIsArray.push(
                FHIR('MedicationStatement', 'doWork', {
                  functionName: 'createMedicationStatement',
                  functionParams: {
                    medicationStatement: {
                      categorySystem:
                        'http://clinikal/medicationStatement/category/medication',
                      status: 'active',
                      patient: patient.id,
                      informationSource: store.getState().login.userID,
                      medicationCodeableConceptCode: medication,
                      medicationCodeableConceptSystem:
                        'http://clinikal/valueset/drugs_list',
                      encounter: encounter.id,
                    },
                  },
                }),
              );
            }
          });
        } else {
          if (
            data.chronicMedicationCodes &&
            data.chronicMedicationCodes.length &&
            data.chronicMedicationIds &&
            Object.keys(data.chronicMedicationIds).length &&
            data.currentQuestionnaireItems.length
          ) {
            data.chronicMedicationCodes.forEach((code) => {
              if (data.chronicMedicationIds[code]) {
                FHIR('MedicationStatement', 'doWork', {
                  functionName: 'patchMedicationStatement',
                  functionParams: {
                    medicationStatementId: data.chronicMedicationIds[code].id,
                    patchParams: {
                      status: 'inactive',
                      encounter: encounter.id,
                    },
                  },
                });
              }
            });
          }
        }
        return APIsArray;
      } catch (error) {
        stopSavingProcess();
        console.log(error);
      }
    }

  };

  const permissionHandler = React.useCallback(() => {
    let clonePermission = permission;
    if (encounter.status === 'finished') clonePermission = 'view';
    return clonePermission;
  }, [encounter.status, permission]);

  return (
    <StyledMedicalAdmission>
      <PopUpFormTemplates {...popUpProps} />
      <FormContext
        {...methods}
        currEncounterResponse={questionnaireResponseItems}
        prevEncounterResponse={prevEncounterResponse}
        requiredErrors={requiredErrors}
        setPopUpProps={setPopUpProps}
        patientId={patient.id}
        permission={permissionHandler()}>
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <VisitDetails
            reasonCodeDetails={encounter.extensionReasonCodeDetails}
            examination={encounter.examination}
            examinationCode={encounter.examinationCode}
            serviceType={encounter.serviceType}
            serviceTypeCode={encounter.serviceTypeCode}
            priority={encounter.priority}
            disableHeaders={false}
            disableButtonIsUrgent={false}
            initValueFunction={initValue}
          />
          <UrgentAndInsulation
            requiredUrgent
            requiredInsulation
            items={questionnaireResponseItems}
            initValueFunction={initValue}
          />
          <NursingAnamnesis initValueFunction={initValue} />
          {/*need to make a new component for radio select*/}
          {(patient.gender === 'female' || patient.gender === 'other') && (
            <StyledRadioGroupChoice>
              <RadioGroupChoice
                gridLabel={t('Pregnancy')}
                radioName={'isPregnancy'}
                listValues={pregnancyRadioList}
              />
            </StyledRadioGroupChoice>
          )}
          <Sensitivities
            defaultRenderOptionFunction={medicalAdmissionRenderOption}
            defaultChipLabelFunction={medicalAdmissionChipLabel}
            handleLoading={handleLoading}
            initValueFunction={initValue}
          />
          <BackgroundDiseases
            defaultRenderOptionFunction={medicalAdmissionRenderOption}
            defaultChipLabelFunction={medicalAdmissionChipLabel}
            handleLoading={handleLoading}
            initValueFunction={initValue}
          />
          <ChronicMedication
            // defaultRenderOptionFunction={medicalAdmissionRenderOption}
            defaultChipLabelFunction={medicalAdmissionChipLabel}
            handleLoading={handleLoading}
            initValueFunction={initValue}
          />
          <SaveForm
            encounter={encounter}
            mainStatus={'triaged'}
            onSubmit={onSubmit}
            validationFunction={isRequiredValidation}
            disabledOnSubmit={disabledOnSubmit}
            setLoading={setLoading}
          />
        </StyledForm>
      </FormContext>
    </StyledMedicalAdmission>
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
export default connect(mapStateToProps, null)(MedicalAdmission);
