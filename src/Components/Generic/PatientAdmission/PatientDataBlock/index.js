import React, { useEffect, useState } from 'react';
import * as Moment from 'moment';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  StyledDiv,
  StyledTextInput,
  StyledButtonBlock,
  StyledGlobalStyle,
} from './Style';
import CustomizedTableButton from 'Assets/Elements/CustomizedTable/CustomizedTableButton';
import { TextField, MenuItem, InputAdornment } from '@material-ui/core';
import CustomizedDatePicker from 'Assets/Elements/CustomizedDatePicker';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { StyledFormGroup } from 'Components/Generic/PatientAdmission/PatientDetailsBlock/Style';
import { normalizeValueData } from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeValueData';
import { connect } from 'react-redux';
import { setPatientDataAfterSave } from 'Store/Actions/FhirActions/fhirActions';
import normalizeFhirPatient from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirPatient';
import {
  getCellPhoneRegexPattern,
  getEmailRegexPattern,
} from 'Utils/Helpers/validation/patterns';
import { FHIR } from 'Utils/Services/FHIR';
import { setPatientAction } from 'Store/Actions/ActiveActions';
import { store } from '../../../../index';
import { emptyArrayAll } from 'Utils/Helpers/emptyArray';
import AvatarIdBlock from 'Assets/Elements/AvatarIdBlock';
import PopUpSessionTimeout from "Assets/Elements/PopUpSessionTimeout"

const PatientDataBlock = ({
  appointmentData,
  patientData,
  onEditButtonClick,
  edit_mode,
  languageDirection,
  formatDate,
  setPatientDataAfterSave,
  priority,
  mohList
}) => {
  const { t } = useTranslation();

  const [patientBirthDate, setPatientBirthDate] = useState(
    patientData.birthDate !== undefined
      ? Moment(patientData.birthDate, 'YYYY-MM-DD')
      : null,
  );

  const [patientKupatHolimList, setPatientKupatHolimList] = useState([]);
  const [healthManageOrgId, setHealthManageOrgId] = useState('');

  const { register, control, errors, handleSubmit, reset, setValue } = useForm({
    mode: 'onBlur',
    defaultValues: {
      birthDate: patientBirthDate,
      healthManageOrganization: patientData.managingOrganization || null,
    },
  });

  const onSubmit = (data, e) => {
    (async () => {
      try {
        data.birthDate = Moment(data.birthDate, formatDate).format(
          'YYYY-MM-DD',
        );
        const answer = await FHIR('Patient', 'doWork', {
          functionName: 'updatePatientData',
          functionParams: { patientData: patientData.id, data: data },
        });
        store.dispatch(setPatientAction(normalizeFhirPatient(answer.data)));
      } catch (err) {
        console.log(err);
      }
    })();
    onEditButtonClick(0);
  };

  const textFieldSelectNotEmptyRule = {
    validate: { value: (value) => parseInt(value) !== 0 },
  };

  const TextFieldOpts = {
    disabled: edit_mode === 1 ? false : true,
    color: edit_mode === 1 ? 'primary' : 'primary',
    variant: edit_mode === 1 ? 'filled' : 'standard',
    InputLabelProps: {
      shrink: true,
    },
  };

  useEffect(() => {
    try {
      //It is necessary to get data from the server and fill the array.
      let array = emptyArrayAll(t('Choose'));
      (async () => {
        try {
          const {
            entry: dataServiceType,
          } = mohList
          for (let entry of dataServiceType) {
            if (entry.resource !== undefined) {
              entry.resource.name = t(entry.resource.name);
              let setLabelKupatHolim = normalizeValueData(entry.resource);
              array.push(setLabelKupatHolim);
            }
          }
          setPatientKupatHolimList(array);
        } catch (e) {
          console.log('Error during load list of kupat holim');
        }
      })();
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientData.id, patientData.birthDate]);

  useEffect(() => {
    register({ name: 'healthManageOrganization' }, textFieldSelectNotEmptyRule);
    register({ name: 'birthDate' });
  }, [textFieldSelectNotEmptyRule, register]);

  if (
    patientKupatHolimList.length === 0 ||
    (patientData.birthDate && patientData.birthDate.length === 0)
  ) {
    return null;
  }

  const organizationData = patientKupatHolimList.find((obj) => {
    return (
      //eslint-disable-next-line
      obj.code ==
      (!isNaN(healthManageOrgId) && parseInt(healthManageOrgId) >= 0
        ? healthManageOrgId
        : patientData.managingOrganization === null ||
          patientData.managingOrganization === undefined
        ? 0
        : patientData.managingOrganization)
    );
  });

  let patientInitialValues = {
    firstName: patientData.firstName || '',
    lastName: patientData.lastName || '',
    healthManageOrganization: patientData.managingOrganization || 0,
    healthManageOrganizationValue:
      edit_mode === 1 ? organizationData?.code : organizationData?.name,
    mobilePhone: patientData.mobileCellPhone || '',
    patientEmail: patientData.email || '',
  };

  const handleUndoEdittingClick = () => {
    onEditButtonClick(0);
    setHealthManageOrgId('');
    reset(patientInitialValues);
    setPatientBirthDate(Moment(patientData.birthDate, 'YYYY-MM-DD'));
    register({ name: 'healthManageOrganization' }, textFieldSelectNotEmptyRule);
    register({
      name: 'birthDate',
      value: Moment(patientData.birthDate, 'YYYY-MM-DD'),
    });
  };

  const handleHealthManageOrganization = (event) => {
    try {
      setValue('healthManageOrganization', event.target.value, true);
      setHealthManageOrgId(event.target.value);
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  const handleChangeBirthDate = (date) => {
    try {
      if (date) {
        setValue('birthDate', date, true);
        setPatientBirthDate(date);
      }
    } catch (e) {
      console.log('Error: ' + e);
    }
  };

  return (
    <React.Fragment>
      <StyledGlobalStyle
        disable_vertical_scroll={edit_mode === 0 ? false : true}
      />
      <StyledDiv edit_mode={edit_mode}>
        <AvatarIdBlock
          edit_mode={edit_mode}
          showEditButton
          priority={priority}
          patientData={patientData}
          onEditButtonClick={onEditButtonClick}
          showDivider
        />
        <StyledTextInput
          edit_mode={edit_mode}
          languageDirection={languageDirection}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <StyledFormGroup>
              {edit_mode === 1 && (
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-firstName'
                  name='firstName'
                  defaultValue={patientInitialValues.firstName}
                  label={t('First name')}
                  required
                  {...TextFieldOpts}
                />
              )}
              {edit_mode === 1 && (
                <Controller
                  as={TextField}
                  control={control}
                  id='standard-lastName'
                  name='lastName'
                  defaultValue={patientInitialValues.lastName}
                  label={t('Last name')}
                  required
                  {...TextFieldOpts}
                />
              )}
              <Controller
                name='birthDate'
                control={control}
                rules={{
                  validate: {
                    value: (value) => {
                      if (Moment(value, formatDate, true).isValid() === true) {
                        if (
                          Moment(value, formatDate, true).isAfter() !== false
                        ) {
                          return 'Should be entered date less than today';
                        }
                      } else {
                        return 'Date is not in range';
                      }
                      return null;
                    },
                  },
                }}
                as={
                  <CustomizedDatePicker
                    PickerProps={{
                      id: 'standard-birthDate',
                      format: formatDate,
                      name: 'birthDate',
                      required: true,
                      disableToolbar: false,
                      label: t('birth day'),
                      value: patientBirthDate,
                      InputProps: {
                        disableUnderline: edit_mode === 1 ? false : true,
                      },
                      disableFuture: true,
                      color: edit_mode === 1 ? 'primary' : 'primary',
                      disabled: edit_mode === 1 ? false : true,
                      variant: 'inline',
                      inputVariant: edit_mode === 1 ? 'filled' : 'standard',
                      onChange: handleChangeBirthDate,
                      autoOk: true,
                      error: errors.birthDate ? true : false,
                      helperText: errors.birthDate
                        ? t(errors.birthDate.message)
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
              <TextField
                id='standard-healthManageOrganization'
                name='healthManageOrganization'
                value={patientInitialValues.healthManageOrganizationValue}
                label={t('Kupat Cholim')}
                required
                select={edit_mode === 1 ? true : false}
                onChange={handleHealthManageOrganization}
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
                error={errors.healthManageOrganization ? true : false}
                helperText={
                  errors.healthManageOrganization
                    ? t('is a required field.')
                    : null
                }
                InputProps={{
                  disableUnderline: edit_mode === 1 ? false : true,
                  endAdornment: errors.healthManageOrganization && (
                    <InputAdornment position='end'>
                      <ErrorOutlineIcon htmlColor={'#ff0000'} />
                    </InputAdornment>
                  ),
                }}
                {...TextFieldOpts}>
                {patientKupatHolimList.map((option, optionIndex) => (
                  <MenuItem key={optionIndex} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
              <Controller
                as={TextField}
                control={control}
                id='standard-mobilePhone'
                name='mobilePhone'
                defaultValue={patientInitialValues.mobilePhone}
                label={t('Cell phone')}
                rules={{
                  pattern: getCellPhoneRegexPattern(),
                }}
                error={errors.mobilePhone ? true : false}
                helperText={
                  errors.mobilePhone
                    ? t('The number entered is incorrect')
                    : null
                }
                InputProps={{
                  disableUnderline: edit_mode === 1 ? false : true,
                  endAdornment: errors.mobilePhone && (
                    <InputAdornment position='end'>
                      <ErrorOutlineIcon htmlColor={'#ff0000'} />
                    </InputAdornment>
                  ),
                }}
                required
                {...TextFieldOpts}
              />
              <Controller
                as={TextField}
                control={control}
                id='standard-patientEmail'
                name='patientEmail'
                defaultValue={patientInitialValues.patientEmail}
                label={t('Mail address')}
                error={errors.patientEmail ? true : false}
                helperText={
                  errors.patientEmail ? t('Invalid email address') : null
                }
                InputProps={{
                  disableUnderline: edit_mode === 1 ? false : true,
                  endAdornment: errors.patientEmail && (
                    <InputAdornment position='end'>
                      <ErrorOutlineIcon htmlColor={'#ff0000'} />
                    </InputAdornment>
                  ),
                }}
                rules={{
                  pattern: getEmailRegexPattern(),
                }}
                {...TextFieldOpts}
              />
            </StyledFormGroup>
            {edit_mode === 1 && (
              <StyledButtonBlock>
                <CustomizedTableButton
                  variant={'text'}
                  color={'primary'}
                  label={t('Undo editing')}
                  onClickHandler={handleUndoEdittingClick}
                />
                <CustomizedTableButton
                  variant={'contained'}
                  color={'primary'}
                  label={t('save')}
                  other={{ type: 'submit' }}
                />
              </StyledButtonBlock>
            )}
          </form>
        </StyledTextInput>
      </StyledDiv>
      <PopUpSessionTimeout isOpen={false} onClose={() => {}}/>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    mohList: state.listsBox.hmoList
  };
};
export default connect(mapStateToProps, { setPatientDataAfterSave })(PatientDataBlock);
