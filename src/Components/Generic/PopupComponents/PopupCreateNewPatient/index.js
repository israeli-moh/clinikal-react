import React, { useState, useEffect } from 'react';
import * as Moment from 'moment';
import CustomizedPopup from 'Assets/Elements/CustomizedPopup';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { InputAdornment, MenuItem, TextField } from '@material-ui/core';
import {
  StyledColumnFirst,
  StyledColumnSecond,
  StyledForm,
  StyledRowEmail,
  StyledBox,
} from './Style';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { connect } from 'react-redux';
import CustomizedDatePicker from 'Assets/Elements/CustomizedDatePicker';
import {
  getCellPhoneRegexPattern,
  getEmailRegexPattern,
  getPatientNamePattern
} from 'Utils/Helpers/validation/patterns';
import { normalizeValueData } from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeValueData';
import { emptyArrayAll } from 'Utils/Helpers/emptyArray';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { FHIR } from 'Utils/Services/FHIR';
import moment from 'moment';
import { store } from 'index';
import normalizeFhirAppointment from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirAppointment';
import { useHistory } from 'react-router-dom';
import { validateLuhnAlgorithm } from 'Utils/Helpers/validation/validateLuhnAlgorithm';
import { getOnlyNumbersRegexPattern } from 'Utils/Helpers/validation/patterns';
import PopUpOnExit from 'Assets/Elements/PopUpOnExit';
import normalizeFhirPatient from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirPatient';
import { gotToPatientAdmission } from 'Utils/Helpers/goTo/gotoPatientAdmission';
import { fhirFormatDate }  from 'Utils/Helpers/Datetime/formatDate';
import { showSnackbar } from "Store/Actions/UiActions/ToastActions.js";


const PopupCreateNewPatient = ({
  popupOpen,
  handlePopupClose,
  languageDirection,
  formatDate,
  facility,
  authorizationACO,
  hideAppointment,
  listsBox
}) => {


  const { t } = useTranslation();
  const [idTypesList, setIdTypesList] = useState([]);
  const [genderList, setGenderList] = useState([]);
  const [kupatHolimList, setKupatHolimList] = useState([]);
  const [typeSubmitForButton, setTypeSubmitForButton] = useState({});

  const patientIdTypeMain = 'teudat_zehut';

  const [patientData, setPatientData] = useState([]);
  const [patientIdentifier, setPatientIdentifier] = useState(0);
  const [patientIdNumber, setPatientIdNumber] = useState('');
  const [patientGender, setPatientGender] = useState(0);
  const [patientIdType, setPatientIdType] = useState(patientIdTypeMain);
  const [patientBirthDate, setPatientBirthDate] = useState(null);
  const [patientManagingOrganizationValue, setPatientKupatHolim] = useState(0);

  const [patientWasFound, setPatientWasFound] = useState(false);

  //const [selectedIdType, setSelectedIdType] = useState(0);
  const [formButtonSave, setFormButtonSave] = useState('write');
  const [formButtonCreatApp, setFormButtonCreatApp] = useState('view');
  const [formButtonPatientAdm, setFormButtonPatientAdm] = useState(
    authorizationACO?.patientAdmission,
  );

  const [afterSaveAction, setAfterSaveAction] = useState('');

  const [isFound, setIsFound] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [errorRequired, setErrorRequired] = useState({
    identifier: false,
    firstName: false,
    lastName: false,
    mobileCellPhone: false,
    email: false,
    gender: false,
    managingOrganization: false,
  });

  const [errorIdNumber, setErrorIdNumber] = useState(false);
  const [errorIdNumberText, setErrorIdNumberText] = useState('');
  const [alertDuringSave, setAlertDuringSave] = useState({
    severity: '',
    message: '',
    show: false,
  });



  const textFieldSelectNotEmptyRule = {
    validate: {
      value: (value) => (value !== undefined && value !== 0) || 'error',
    },
  };
  const managingOrganizationSelectNotEmptyRule = {
    validate: {
      value: (value) => {
        const formValues = getValues();
        return formValues.identifierType &&
          formValues.identifierType !== patientIdTypeMain
          ? true
          : value !== undefined && value !== 0
          ? true
          : 'error';
      },
    },
  };

  const history = useHistory();

  let patientInitialValues = {
    identifier: '',
    firstName: '',
    lastName: '',
    mobileCellPhone: '',
    email: '',
    birthDate: null,
  };

  const {
    register,
    control,
    errors,
    reset,
    setError,
    clearError,
    handleSubmit,
    triggerValidation,
    setValue,
    getValues,
    formState,
    watch
  } = useForm({
    mode: 'onBlur',
    validateCriteriaMode: 'all',
    defaultValues: {
      identifierType: patientIdTypeMain,
    },
  });

  //Check if form was changed
  const { dirty } = formState;
  useEffect(() => {
    setIsDirty(dirty);
  }, [dirty, setIsDirty]);

  const currentIdentifier = watch('identifier');

  const onSubmit = (patient, e) => {
    //
    if (afterSaveAction === 'newEncounterForNewPatient' && patientWasFound) {
      createNewEncounterForCurrentPatient(patientIdentifier, patientData);
    }

    //Save action
    if (errors && errors.length !== undefined) {
      setFormButtonSave('view');
    } else {
      if (
        !validateLuhnAlgorithm(patient.identifier) &&
        patient.identifierType === patientIdTypeMain
      ) {
        setError('identifier', 'notValid', 'The number entered is incorrect');
        setErrorIdNumber(true);
        setErrorIdNumberText(t('The number entered is incorrect'));
        setFormButtonSave('write');
      } else {
        (() => {
          try {
            patient.birthDate = fhirFormatDate(patient.birthDate, formatDate);
            FHIR('Patient', 'doWork', {
              functionName: 'createPatient',
              functionParams: {
                patient,
              },
            })
              .then((saved_patient) => {
                setFormButtonSave('view');
                if (afterSaveAction === 'normalSave') {
                  clearPopupCreateNewPatient();
                  store.dispatch(showSnackbar(t('The patient was successfully added'), 'check'));
                } else if (afterSaveAction === 'newEncounterForNewPatient') {
                  let new_patient = normalizeFhirPatient(saved_patient.data);
                  createNewEncounterForCurrentPatient(
                    new_patient.id,
                    new_patient,
                  );
                }
              })
              .catch((error) => {
                  console.error('Error during create a new patient!');
              });
          } catch (e) {}
        })();
      }
    }
  };

  //Register TextField components in react-hook-forms
  useEffect(() => {
    register({ name: 'identifierType' }, textFieldSelectNotEmptyRule);
    register({ name: 'gender' }, textFieldSelectNotEmptyRule);
    register(
      { name: 'managingOrganization' },
      managingOrganizationSelectNotEmptyRule,
    );
  }, [
    textFieldSelectNotEmptyRule,
    managingOrganizationSelectNotEmptyRule,
    register,
  ]);

  //useEffect block
  useEffect(() => {
    //Load id types list
    (() => {
      try {
          const {
              expansion: { contains },
          } = listsBox.identifier_type_list;
          let options = emptyArrayAll(t('Choose'));
          for (let status of contains) {
            options.push(normalizeFhirValueSet(status));
          }
          setIdTypesList(options);
          let selectedIdType = options.find((obj) => {
            return obj.code === patientIdTypeMain;
          });
          if (selectedIdType.code !== 0) {
            setValue('identifierType', selectedIdType.code);
          }
      } catch (e) {
        console.log(e);
      }
    })();

    //Load KupatHolim list
    (() => {
      try {
        const {
          entry
        } = listsBox.hmoList;
        let array = emptyArrayAll(t('Choose'));
        for (let row of entry) {
          if (row.resource !== undefined) {
            row.resource.name = t(row.resource.name);
            let setLabelKupatHolim = normalizeValueData(row.resource);
            array.push(setLabelKupatHolim);
          }
        }
        setKupatHolimList(array);

      } catch (e) {
        console.log(e);
      }
    })();

    //Load gender list
    (() => {
      try {
          const {
              expansion: { contains },
          } = listsBox.gender;
          let options = emptyArrayAll(t('Choose'));
          for (let status of contains) {
            options.push(normalizeFhirValueSet(status));
          }
          setGenderList(options);
      } catch (e) {
        console.log(e);
      }
    })();
  }, [setValue, t]);
  //end of useEffect block

  //Block of handle's function
  const handleChangeBirthDate = (date) => {
    try {
      let newBirthDate = date.format(formatDate).toString();
      setValue('birthDate', newBirthDate, true);
      setPatientBirthDate(date);
      setErrorRequired({
        ...errorRequired,
        birthDate: false,
      });
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  //Searching patient by id,checking id number for correct value
  useEffect(() => {
    (async () => {
      if (
        patientIdType !== 0 && typeof currentIdentifier !== "undefined" &&
        ((patientIdType === patientIdTypeMain && currentIdentifier.length === 9) || (patientIdType !== patientIdTypeMain && currentIdentifier.length > 1))
      ) {
        setIsFound(true);
        const result = await triggerValidation('identifier');
        setFormButtonCreatApp('view');
        try {
          FHIR('Patient', 'doWork', {
            functionName: 'searchPatientById',
            functionParams: {
              identifierValue: currentIdentifier,
              identifierType: patientIdType,
            },
          }).then((patients) => {
            if (patients && result && patients.id > 0) {
              patients.birthDate = Moment(patients.birthDate, 'YYYY-MM-DD');
              setValue('firstName', patients.firstName);
              setValue('lastName', patients.lastName);
              setValue(
                'birthDate',
                Moment(patients.birthDate).format(formatDate),
              );
              setValue('mobileCellPhone', patients.mobileCellPhone);
              setValue('email', patients.email);
              setValue('identifierType', patients.identifierType);
              setValue('gender', patients.gender);
              setValue('managingOrganization', patients.managingOrganization);

              setPatientIdentifier(patients.id);
              setPatientBirthDate(patients.birthDate);
              setPatientData(patients);
              setPatientIdType(patients.identifierType);
              setPatientGender(patients.gender);
              setPatientKupatHolim(patients.managingOrganization);

              setError(
                'identifier',
                'patientExist',
                'The patient exists in the system',
              );
              setErrorIdNumber(true);
              setErrorIdNumberText(t(errors?.identifier?.message));

              setPatientWasFound(true);

              //clear required error
              setErrorRequired({
                ...errorRequired,
                birthDate: false,
                identifier: false,
                firstName: false,
                lastName: false,
                mobileCellPhone: false,
                gender: false,
                managingOrganization: false,
              });
              setFormButtonSave('view');
              setFormButtonCreatApp('write');
              setFormButtonPatientAdm(authorizationACO?.patientAdmission);
            } else {
              if (
                (!validateLuhnAlgorithm(patientIdNumber) &&
                  patientIdType === patientIdTypeMain) ||
                !getOnlyNumbersRegexPattern().test(patientIdNumber) ||
                parseInt(patientIdNumber) === 0
              ) {
                setError(
                  'identifier',
                  'notValid',
                  'The number entered is incorrect',
                );
                setErrorIdNumber(true);
                setErrorIdNumberText(t('The number entered is incorrect'));
                setFormButtonSave('write');
              } else {
                clearForm();
              }
            }
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        clearForm();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientIdNumber, patientIdType, currentIdentifier]);

  const clearForm = () => {
    if (patientWasFound) {
      //we will need to make this after reset of react-hook-form
      let nullValues = [
        { identifier: patientIdNumber },
        { gender: 0 },
        { managingOrganization: 0 },
        { birthDate: null },
        { lastName: '' },
        { firstName: '' },
        { mobileCellPhone: '' },
        { email: '' },
      ];
      setValue(nullValues);
      setPatientGender(0);
      setPatientKupatHolim(0);
      setPatientBirthDate(null);
      setPatientWasFound(false);
    }
    clearIdNumberError();
    setFormButtonSave('write');
  }

  //Change button type for patientAdmission
  useEffect(() => {
    if (!patientWasFound) {
      //type for patient admission
      setTypeSubmitForButton({
        type: 'submit',
        form: 'createNewPatient',
        tabIndex: 11,
      });
    } else {
      //clear type submit for patient admission
      setTypeSubmitForButton({});
    }
  }, [patientWasFound]);

  const handleIdTypeChange = (event) => {
    try {
      setValue('identifierType', event.target.value, true);
      setPatientIdType(event.target.value);
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  const handlePatientIdNumberChange = (event) => {
    try {
      console.log(event.target.value)
      setValue('identifier', event.target.value, true);
      setPatientIdentifier(event.target.value);
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  const handleGenderChange = (event) => {
    try {
      setValue('gender', event.target.value, true);
      setPatientGender(event.target.value);
      setErrorRequired({
        ...errorRequired,
        gender: false,
      });
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  const handleChangeHealthManageOrg = (event) => {
    try {
      setValue('managingOrganization', event.target.value, true);
      setPatientKupatHolim(event.target.value);
      setErrorRequired({
        ...errorRequired,
        managingOrganization: false,
      });
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  const getIsFound = () => {
    return isFound;
  };

  const clearIdNumberError = () => {
    clearError('identifier');
    setPatientIdentifier(0);
    setErrorIdNumber(false);
    setErrorIdNumberText('');
    setErrorRequired({
      ...errorRequired,
      birthDate: false,
      identifier: false,
      firstName: false,
      lastName: false,
      mobileCellPhone: false,
      gender: false,
      managingOrganization: false,
    });
  };

  const patientAdmissionAction = () => {
    if (!patientWasFound) {
      setAfterSaveAction('newEncounterForNewPatient');
      return true;
    } else {
      createNewEncounterForCurrentPatient();
    }
  };
  const savePatientAction = () => {
    setAfterSaveAction('normalSave');
  };

  const createNewEncounterForCurrentPatient = (patient_id, patient_data) => {
    let currentDate = fhirFormatDate();
    (async () => {
      try {
        let patient_identifier =
          patient_id === undefined ? patientIdentifier : patient_id;
        let patient_current_data =
          patient_data === undefined ? patientData : patient_data;

        FHIR('Appointment', 'doWork', {
          functionName: 'getAppointmentPerPatient',
          functionParams: {
            dayPosition: 'current',
            date: currentDate,
            patient: patient_identifier,
          },
        }).then((appointments) => {
          //If appointment exists, will check for encounter
          if (
            appointments &&
            appointments.data &&
            appointments.data.total === 1
          ) {
            let appointment = normalizeFhirAppointment(
              appointments.data.entry[1].resource,
            );
            //set data to reducers appointment and change route tp patientAdmission
            (async () => {
              let encounterData = await FHIR('Encounter', 'doWork', {
                functionName: 'createNewEncounter',
                functionParams: {
                  facility: store.getState().settings.facility,
                  appointment: appointment,
                },
              });
              gotToPatientAdmission(
                encounterData,
                patient_current_data,
                history,
              );
            })();
          } else {
            if (patientData !== null) {
              (async () => {
                let encounterData = await FHIR('Encounter', 'doWork', {
                  functionName: 'createNewEncounter',
                  functionParams: {
                    facility: store.getState().settings.facility,
                    practitioner: 'practitioner',
                    patient: patient_current_data,
                    status: 'planned',
                  },
                });
                gotToPatientAdmission(
                  encounterData,
                  patient_current_data,
                  history,
                );
              })();
            }
          }
        });
      } catch (e) {
        console.log('Error: ' + e);
      }
    })();
  };

  const handlePopupCloseAndClear = () => {
    if (isDirty) {
      setIsPopUpOpen(true);
    } else {
      clearPopupCreateNewPatient();
    }
  };
  //End block of handle's function

  const bottomButtonsData = [
    {
      label: t('Save patient'),
      variant: 'text',
      color: 'primary',
      mode: formButtonSave,
      other: { type: 'submit', form: 'createNewPatient', tabIndex: 10 },
      onClickHandler: savePatientAction,
    },
    {
      label: t('Patient Admission'),
      variant: 'contained',
      color: 'primary',
      mode: formButtonPatientAdm,
      onClickHandler: patientAdmissionAction, //user function
      other: typeSubmitForButton,
    },
  ];
  if (hideAppointment !== '1') {
    bottomButtonsData.push({
      label: t('Create appointment'),
      variant: 'contained',
      color: 'primary',
      mode: formButtonCreatApp,
      onClickHandler: handlePopupClose, //user function
      other: { tabIndex: 12 },
    });
  }

  const PopupTextFieldOpts = {
    color: 'primary',
    variant: 'filled',
    autoComplete: 'off',
  };

  const clearPopupCreateNewPatient = () => {
    reset(patientInitialValues);
    setPatientIdNumber('');
    setValue('identifier', '');

    clearIdNumberError();
    setFormButtonSave('write');
    setPatientGender(0);
    setPatientKupatHolim(0);
    setPatientBirthDate(null);

    register(
      { name: 'identifierType', value: patientIdTypeMain },
      textFieldSelectNotEmptyRule,
    );
    setPatientIdType(patientIdTypeMain);

    register({ name: 'gender' }, textFieldSelectNotEmptyRule);
    register(
      { name: 'managingOrganization' },
      managingOrganizationSelectNotEmptyRule,
    );

    setAlertDuringSave({
      ...alertDuringSave,
      message: '',
      severity: '',
      show: false,
    });
    handlePopupClose();
  };

  //PopupOnExit
  const onPopUpCloseHandler = () => {
    setIsPopUpOpen(false);
  };
  const returnHandler = () => {
    setIsPopUpOpen(false);
  };
  const exitWithoutSavingHandler = () => {
    clearPopupCreateNewPatient();
  };

  const handlerOnInvalidField = (event) => {
    event.preventDefault();
    event.target.setCustomValidity('');
    let field = event.target.name;
    let fieldIsRequired = t('Value is required');
    let fieldWithError = false;
    if (field === 'identifier') {
      setErrorIdNumberText(fieldIsRequired);
    }
    //manual checking for select type fields: identifierType, gender, managingOrganization.
    for (let [key, value] of Object.entries(errorRequired)) {
      if (key && value !== false) fieldWithError = true;
    }
    setErrorRequired({
      ...errorRequired,
      [field]: !event.target.validity.valid ? fieldIsRequired : false,
      gender: patientGender === 0 && fieldWithError ? fieldIsRequired : false,
      managingOrganization:
        patientManagingOrganizationValue === 0 &&
        fieldWithError &&
        patientIdType === patientIdTypeMain
          ? fieldIsRequired
          : false,
    });
  };

  return (
    <React.Fragment>
      <PopUpOnExit
        isOpen={isPopUpOpen}
        onClose={onPopUpCloseHandler}
        returnFunction={returnHandler}
        exitWithOutSavingFunction={exitWithoutSavingHandler}
      />

      <CustomizedPopup
        isOpen={popupOpen}
        onClose={handlePopupCloseAndClear}
        title={t('Add New Patient')}
        content_dividers={false}
        bottomButtons={bottomButtonsData}
        dialogMaxWidth={'md'}
        AlertMessage={alertDuringSave}>
        <form onSubmit={handleSubmit(onSubmit)} id={'createNewPatient'}>
          <StyledForm languageDirection={languageDirection}>
            <StyledBox>
              <StyledColumnFirst>
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-identifier'
                  name='identifier'
                  defaultValue={patientIdNumber}
                  label={t('id number')}
                  required
                  onInvalid={handlerOnInvalidField}
                  onInput={handlerOnInvalidField}
                  rules={{
                    validate: (value) => {
                      const formValues = getValues('identifierType');
                      console.log(formValues)
                      if (formValues && formValues.identifier !== undefined) {
                        setPatientIdNumber(formValues.identifier.trim());
                      }
                      if (formValues.identifierType === patientIdTypeMain && !validateLuhnAlgorithm(value)) {
                        return true;
                      }
                      return getIsFound() === true;
                    },
                  }}
                  color={'primary'}
                  variant={'filled'}
                  error={
                    errorIdNumber || (errorRequired.identifier)
                  }
                  helperText={errorIdNumberText || errorRequired.identifier}
                  title={''}
                  inputProps={{ tabIndex: 1 }}
                  InputProps={{
                    autoComplete: 'off',
                    endAdornment: (!errorRequired.identifier
                      ? false
                      : true) && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-firstName'
                  name='firstName'
                  defaultValue={patientInitialValues.firstName}
                  label={t('First Name')}
                  required
                  onInvalid={handlerOnInvalidField}
                  onInput={handlerOnInvalidField}
                  rules={{
                    validate: (value) => {
                      return !getPatientNamePattern().test(value);
                    }
                  }}
                  error={
                    errors.firstName ||
                    (!errorRequired.firstName ? false : true)
                      ? true
                      : false
                  }
                  helperText={
                    errors.firstName
                      ? t('Invalid first name entered')
                      : errorRequired.firstName
                      ? errorRequired.firstName
                      : null
                  }
                  title={''}
                  inputProps={{ tabIndex: 3 }}
                  InputProps={{
                    autoComplete: 'off',
                    endAdornment: (!errorRequired.firstName ? false : true) && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  disabled={formButtonSave === 'view'}
                  {...PopupTextFieldOpts}
                />
                <TextField
                  id='standard-gender'
                  name='gender'
                  value={patientGender}
                  label={t('Gender')}
                  required
                  select
                  onChange={handleGenderChange}
                  defaultValue={{}}
                  SelectProps={{
                    MenuProps: {
                      elevation: 0,
                      keepMounted: true,
                      getContentAnchorEl: null,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                    },
                  }}
                  error={
                    errors.gender ? true : !errorRequired.gender ? false : true
                  }
                  helperText={
                    errors.gender
                      ? t('Value is required')
                      : !errorRequired.gender
                      ? null
                      : errorRequired.gender
                  }
                  inputProps={{ tabIndex: 5 }}
                  InputProps={{
                    endAdornment: errors.gender && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  disabled={formButtonSave === 'view'}
                  {...PopupTextFieldOpts}>
                  {genderList.map((option, optionIndex) => (
                    <MenuItem key={optionIndex} value={option.code}>
                      {t(option.name)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  id='standard-managingOrganization'
                  name='managingOrganization'
                  value={patientManagingOrganizationValue}
                  label={t('Kupat Cholim')}
                  required={patientIdType === patientIdTypeMain ? true : false}
                  select
                  onChange={handleChangeHealthManageOrg}
                  SelectProps={{
                    MenuProps: {
                      elevation: 0,
                      keepMounted: true,
                      getContentAnchorEl: null,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                    },
                  }}
                  error={
                    errors.managingOrganization
                      ? true
                      : errorRequired.managingOrganization
                  }
                  helperText={
                    errors.managingOrganization
                      ? t('Value is required')
                      : !errorRequired.managingOrganization
                      ? null
                      : errorRequired.managingOrganization
                  }
                  inputProps={{ tabIndex: 7 }}
                  InputProps={{
                    endAdornment: errors.managingOrganization && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  disabled={formButtonSave === 'view'}
                  {...PopupTextFieldOpts}>
                  {kupatHolimList.map((option, optionIndex) => (
                    <MenuItem key={optionIndex} value={option.code}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </StyledColumnFirst>
              <StyledColumnSecond>
                <TextField
                  id='standard-identifierType'
                  name='identifierType'
                  value={patientIdType}
                  label={t('ID Type')}
                  required
                  select
                  onChange={handleIdTypeChange}
                  SelectProps={{
                    MenuProps: {
                      elevation: 0,
                      keepMounted: true,
                      getContentAnchorEl: null,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                    },
                  }}
                  error={errors.identifierType ? true : false}
                  helperText={
                    errors.identifierType ? t('Value is required') : null
                  }
                  inputProps={{ tabIndex: 2 }}
                  InputProps={{
                    endAdornment: errors.identifierType && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  {...PopupTextFieldOpts}>
                  {idTypesList.map((option, optionIndex) => (
                    <MenuItem
                      key={optionIndex}
                      value={option.code}
                      name={option.code}>
                      {t(option.name)}
                    </MenuItem>
                  ))}
                </TextField>
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-lastName'
                  name='lastName'
                  defaultValue={patientInitialValues.lastName}
                  label={t('Last Name')}
                  required
                  onInvalid={handlerOnInvalidField}
                  onInput={handlerOnInvalidField}
                  rules={{
                    validate: (value) => {
                      return getPatientNamePattern().test(value) ? false : true;
                    }
                  }}
                  error={
                    errors.lastName ||
                    (!errorRequired.lastName ? false : true)
                      ? true
                      : false
                  }
                  helperText={
                    errors.lastName
                      ? t('Invalid family name entered')
                      : errorRequired.lastName
                      ? errorRequired.lastName
                      : null
                  }
                  title={''}
                  inputProps={{ tabIndex: 4 }}
                  InputProps={{
                    autoComplete: 'off',
                    endAdornment: (!errorRequired.lastName ? false : true) && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  disabled={formButtonSave === 'view'}
                  {...PopupTextFieldOpts}
                />
                <Controller
                  name='birthDate'
                  control={control}
                  rules={{
                    validate: {
                      value: (value) => {
                        if (
                          Moment(value, formatDate, true).isValid() === true
                        ) {
                          if (
                            Moment(value, formatDate, true).isAfter() !== false
                          ) {
                            return t('Should be entered date less than today');
                          }
                          if (
                            Moment(value, formatDate, true).isBefore(
                              '1900-01-01',
                            ) === true
                          ) {
                            return (
                              t('Should be entered date more than') +
                              '1900-01-01'
                            );
                          }
                        } else {
                          return t('Date is not in range');
                        }
                        return null;
                      },
                    },
                  }}
                  as={
                    <CustomizedDatePicker
                      PickerProps={{
                        id: 'standard-birthDate',
                        format: 'DD/MM/YYYY',
                        minDate: new Date('1900-01-01'),
                        name: 'birthDate',
                        required: true,
                        onInvalid: handlerOnInvalidField,
                        onInput: handlerOnInvalidField,
                        disableToolbar: false,
                        label: t('birth day'),
                        value: patientBirthDate,
                        inputProps: { tabIndex: 6 },
                        InputProps: {
                          autoComplete: 'off',
                        },
                        disableFuture: true,
                        color: 'primary',
                        variant: 'inline',
                        inputVariant: 'filled',
                        onChange: handleChangeBirthDate,
                        autoOk: true,
                        disabled: formButtonSave === 'view',
                        error: errors.birthDate
                          ? true
                          : !errorRequired.birthDate
                          ? false
                          : true,
                        helperText: errors.birthDate
                          ? errors.birthDate.message
                          : errorRequired.birthDate
                          ? errorRequired.birthDate
                          : null,
                      }}
                      CustomizedProps={{
                        keyBoardInput: true,
                        showNextArrow: false,
                        showPrevArrow: false,
                      }}
                    />
                  }
                />
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-mobileCellPhone'
                  name='mobileCellPhone'
                  defaultValue={patientInitialValues.mobileCellPhone}
                  label={t('Cell phone')}
                  rules={{
                    pattern: getCellPhoneRegexPattern(),
                  }}
                  error={
                    errors.mobileCellPhone ||
                    (!errorRequired.mobileCellPhone ? false : true)
                      ? true
                      : false
                  }
                  helperText={
                    errors.mobileCellPhone
                      ? t('The number entered is incorrect')
                      : errorRequired.mobileCellPhone
                      ? errorRequired.mobileCellPhone
                      : null
                  }
                  title={''}
                  inputProps={{ tabIndex: 8 }}
                  InputProps={{
                    endAdornment: (errors.mobileCellPhone ||
                    !errorRequired.mobileCellPhone
                      ? false
                      : true) && (
                      <InputAdornment position='end'>
                        <ErrorOutlineIcon htmlColor={'#ff0000'} />
                      </InputAdornment>
                    ),
                  }}
                  required
                  onInvalid={handlerOnInvalidField}
                  onInput={handlerOnInvalidField}
                  disabled={formButtonSave === 'view'}
                  {...PopupTextFieldOpts}
                />
              </StyledColumnSecond>
            </StyledBox>
            <StyledRowEmail>
              <Controller
                as={TextField}
                control={control}
                id='standard-email'
                name='email'
                defaultValue={patientInitialValues.email}
                label={t('Mail address')}
                error={errors.email ? true : false}
                helperText={errors.email ? t('Invalid email address') : null}
                title={''}
                inputProps={{ tabIndex: 9 }}
                InputProps={{
                  endAdornment: errors.email && (
                    <InputAdornment position='end'>
                      <ErrorOutlineIcon htmlColor={'#ff0000'} />
                    </InputAdornment>
                  ),
                }}
                rules={{
                  pattern: getEmailRegexPattern(),
                }}
                disabled={formButtonSave === 'view'}
                {...PopupTextFieldOpts}
              />
            </StyledRowEmail>
          </StyledForm>
        </form>
      </CustomizedPopup>
    </React.Fragment>
  );
};
const mapStateToProps = (state) => {
  return {
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    facility: state.settings.facility,
    hideAppointment: state.settings.clinikal.clinikal_hide_appoitments,
    listsBox: state.listsBox
  };
};

export default connect(mapStateToProps, null)(PopupCreateNewPatient);
