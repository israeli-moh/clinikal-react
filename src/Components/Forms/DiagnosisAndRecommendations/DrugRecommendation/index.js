import React, { useEffect, useState } from 'react';
import Title from 'Assets/Elements/Title';
import { StyledFormGroup } from 'Assets/Elements/StyledFormGroup';
import  StyledSelectTemplateButton  from 'Assets/Elements/StyledSelectTempleteButton';
import { useTranslation } from 'react-i18next';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { Grid, MenuItem, Typography } from '@material-ui/core';
import { StyledDivider } from '../Style';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Delete, KeyboardArrowDown } from '@material-ui/icons';
import * as moment from 'moment';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirMedicationRequest from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirMedicationRequest';
import { VirtualizedListboxComponent } from 'Assets/Elements/AutoComplete/VirtualizedListbox';
import { StyledAutoComplete } from 'Assets/Elements/AutoComplete/StyledAutoComplete';
import { StyledPopper } from 'Assets/Elements/AutoComplete/Popper/Style';
import Tooltip from "@material-ui/core/Tooltip";
import { store } from 'index';
import StyledTooltip from 'Assets/Elements/StyledTooltip';


const DrugRecommendation = ({
  encounterId,
  formatDate,
  handleLoading,
  initValueFunction,
  languageDirection
}) => {
  const { t } = useTranslation();
  const {
    control,
    permission,
    register,
    watch,
    unregister,
    requiredErrors,
    setRequiredErrors,
    setValue,
    setPopUpProps,
    getValues,
  } = useFormContext();
  const { insert, remove, fields, append } = useFieldArray({
    control,
    name: 'drugRecommendation',
  });
  const drugRecommendation = watch('drugRecommendation');

  const callBack = (data, name) => {
    setValue(name, data);
  };

  const popperWidthFixer = function (props) {
    return (
      <StyledPopper
    {...props}
    modifiers={{
      setWidth: {
        enabled: true,
          order: 840,
          fn(data) {
          data.offsets.popper.width = data.styles.width = '700px';
          return data;
        },
      },
    }}
    placement='bottom-start'
      />
  );
  };
  const handlePopUpProps = (
    title,
    fields,
    id,
    callBack,
    name,
    index,
    nestedValue,
  ) => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: true,
        formFieldsTitle: title,
        formFields: fields,
        formID: id,
        setTemplatesTextReturned: callBack,
        name,
        defaultContext: drugRecommendation[index][nestedValue],
      };
    });
  };

  const checkIsDisabled = (name, index) => {
    if (drugRecommendation[index] === undefined) {
      return true;
    } else {
      const value = drugRecommendation[index][name];
      if (!value) {
        return true;
      }
      return permission === 'view' ? true : false;
    }
  };
  const instructionsForTheDrug = t('Instructions for the drug');

  const [drugsData, setDrugsData] = useState({
    drugList: [],
    drugForm: [],
    drugRoute: [],
    drugIntervals: [],
  });

  const fetchDrugsData = React.useCallback(async () => {

    try {
      // const drugList = [{ code: '123', display: 'medicine' }];
      // const drugIntervals = [{ code: '1234', display: '10minutes' }];
      setDrugsData({
        // drugList,
        drugList : store.getState().listsBox.drugs_list.expansion.contains,
        drugForm: store.getState().listsBox.drug_form.expansion.contains,
        drugRoute: store.getState().listsBox.drug_route.expansion.contains,
        drugIntervals: store.getState().listsBox.drug_interval.expansion.contains,
      });
    } catch (error) {
      console.log(error);
    }
  }, []);


  const fetchMedicationRequest = React.useCallback(async () => {
    try {
      // Name of the medicationRequest the comes from the server
      register({ name: 'medicationRequest' });
      const res = await FHIR('MedicationRequest', 'doWork', {
        functionName: 'getMedicationRequest',
        functionParams: {
          encounter: encounterId,
        },
      });
      // I could just do res.status === 204 for no content but I'm not sure that it's implemented in all of the entities
      const medicationUniqData = {};
      if (res.status === 200 && res.data.total) {
        // medicationUniqData
        // [index]: medicationId
        let initData = [];
        res.data.entry.forEach((medicationRequest, medicationRequestIndex) => {
          if (medicationRequest.resource) {
            const normalizedFhirMedicationRequest = normalizeFhirMedicationRequest(
              medicationRequest.resource,
            );
            if (medicationRequestIndex - 1 !== 0) {
              setRequiredErrors((prevState) => {
                const cloneState = [...prevState];
                cloneState.push({
                  quantity: '',
                  drugForm: '',
                  drugRoute: '',
                  intervals: '',
                  duration: '',
                });
                return cloneState;
              });
            }

            let duration = '';
            if (
              normalizedFhirMedicationRequest.timingRepeatEnd &&
              normalizedFhirMedicationRequest.timingRepeatStart
            ) {
              const end = moment(
                normalizedFhirMedicationRequest.timingRepeatEnd,
                'YYYY-MM-DD',
              );
              const start = moment(
                normalizedFhirMedicationRequest.timingRepeatStart,
                'YYYY-MM-DD',
              );
              if (end.isValid() && start.isValid()) {
                duration = end.diff(start, 'days').toString();
              }
            }
            if (medicationRequestIndex - 1 === 0) {
              setValue([
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].drugName`]: {
                    code:
                      normalizedFhirMedicationRequest.medicationCodeableConceptCode ||
                      '',
                    display:
                      normalizedFhirMedicationRequest.medicationCodeableConceptDisplay ||
                      '',
                  },
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].quantity`]:
                    normalizedFhirMedicationRequest.doseQuantity || '',
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].drugForm`]:
                    normalizedFhirMedicationRequest.methodCode || '',
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].drugRoute`]:
                    normalizedFhirMedicationRequest.routeCode || '',
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].intervals`]: normalizedFhirMedicationRequest.timingCode,
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].duration`]: duration,
                },
                {
                  [`drugRecommendation[${medicationRequestIndex - 1}].toDate`]:
                    moment(
                      normalizedFhirMedicationRequest.timingRepeatEnd,
                      'YYYY-MM-DD',
                    ).format(formatDate) || '',
                },
                {
                  [`drugRecommendation[${
                    medicationRequestIndex - 1
                  }].instructionsForTheDrug`]:
                    normalizedFhirMedicationRequest.note || '',
                },
              ]);
              initData.push(
                formStructure(normalizedFhirMedicationRequest, duration),
              );
            } else {
              append({
                drugName: {
                  code:
                      normalizedFhirMedicationRequest.medicationCodeableConceptCode || '',
                  display:
                      normalizedFhirMedicationRequest.medicationCodeableConceptDisplay || '',
                },
                quantity: normalizedFhirMedicationRequest.doseQuantity || '',
                drugForm: normalizedFhirMedicationRequest.methodCode || '',
                drugRoute: normalizedFhirMedicationRequest.routeCode || '',
                intervals: normalizedFhirMedicationRequest.timingCode || '',
                duration,
                toDate:
                  moment(
                    normalizedFhirMedicationRequest.timingRepeatEnd,
                    'YYYY-MM-DD',
                  ).format(formatDate) || '',
                instructionsForTheDrug:
                  normalizedFhirMedicationRequest.note || '',
              });
              initData.push(
                formStructure(normalizedFhirMedicationRequest, duration),
              );
            }

            medicationUniqData[medicationRequestIndex - 1] =
              normalizedFhirMedicationRequest.id;
          } else {
          }
        });
        initValueFunction(
          [
            {
              drugRecommendation: initData,
            },
          ],
          false,
        );
        handleLoading('drugRecommendation');
      }
      initValueFunction([{ medicationRequest: medicationUniqData }]);
      handleLoading('drugRecommendation');
    } catch (error) {
      console.log(error);
    }

    return () => {
      unregister('medicationRequest');
    };
  }, [encounterId, register, setValue, formatDate, unregister]);

  // only for init data for track changes
  const formStructure = (normalizedFhirMedicationRequest, duration) => {
    return {
      toDate:
        moment(
          normalizedFhirMedicationRequest.timingRepeatEnd,
          'YYYY-MM-DD',
        ).format(formatDate) || '',
      instructionsForTheDrug: normalizedFhirMedicationRequest.note || '',
      drugName: {
        code:
          normalizedFhirMedicationRequest.medicationCodeableConceptCode || '',
        display:
          normalizedFhirMedicationRequest.medicationCodeableConceptDisplay ||
          '',
      },
      quantity: normalizedFhirMedicationRequest.doseQuantity || '',
      drugForm: normalizedFhirMedicationRequest.methodCode || '',
      drugRoute: normalizedFhirMedicationRequest.routeCode || '',
      intervals: normalizedFhirMedicationRequest.timingCode || '',
      duration,
    };
  };

  useEffect(() => {
    fetchDrugsData();
    fetchMedicationRequest();
  }, [fetchMedicationRequest, fetchDrugsData]);

  const returnMenuItem = (name) => {
    if (!drugsData[name]) return [];
    if (!drugsData[name].length) return [];
    return drugsData[name].map((form, formIndex) => {
      return (
        <MenuItem value={form.code} key={form.code + formIndex}>
          {t(form.display)}
        </MenuItem>
      );
    });
  };

  return (
    <>
      <StyledFormGroup>
        <Grid container direction='row' justify='space-between'>
          <Title
            label={t('Drug Recommendation')}
            bold
            fontSize='22px'
            color='#000b40'
          />
          <StyledSelectTemplateButton
            disabled={permission === 'view' ? true : false}
            onClick={() => {
              setRequiredErrors((prevState) => {
                const cloneState = [...prevState];
                cloneState.push({
                  quantity: '',
                  drugForm: '',
                  drugRoute: '',
                  intervals: '',
                  duration: '',
                });
                return cloneState;
              });
              if (fields.length) {
                insert(parseInt(0, 10), {
                  drugName: '',
                  quantity: '',
                  drugForm: '',
                  drugRoute: '',
                  intervals: '',
                  duration: '',
                  toDate: '',
                  instructionsForTheDrug: '',
                });
              } else {
                append({
                  drugName: '',
                  quantity: '',
                  drugForm: '',
                  drugRoute: '',
                  intervals: '',
                  duration: '',
                  toDate: '',
                  instructionsForTheDrug: '',
                });
              }
            }}>{` + ${t('Add Drug')}`}</StyledSelectTemplateButton>
        </Grid>
        <StyledDivider />
        {fields.map((item, index) => {
          return (
            <React.Fragment key={item.id}>
              <Controller
                disabled={permission === 'view' ? true : false}
                as={
                  <StyledAutoComplete
                    PopperComponent={popperWidthFixer}
                    blurOnSelect
                    disableClearable
                    selectOnFocus
                    ListboxComponent={VirtualizedListboxComponent}
                    options={drugsData.drugList}
                    getOptionSelected={(option, value) => {
                      return option.code === value.code;
                    }}
                    getOptionLabel={(option) => option.display || ''}
                    renderOption={(option) => (
                      <Tooltip title={option.display} aria-label={option.display}>
                        <Typography noWrap>{option.display}</Typography>
                    </Tooltip>
                    )}
                    popupIcon={<KeyboardArrowDown />}
                    input_direction={'ltr'}
                    renderInput={(params) => (
                      <StyledTooltip
                        title={params.inputProps.value}
                        aria-label={params.inputProps.value}>
                        <CustomizedTextField
                          iconColor='#1976d2'
                          width='60%'
                          {...params}
                          label={t('Drug Name')}
                        />
                      </StyledTooltip>
                    )}
                  />
                }
                onChange={([, data]) => data}
                name={`drugRecommendation[${index}].drugName`}
                control={control}
                defaultValue={item.drugName}
              />
              <Grid container direction='row' justify='space-between'>
                <Controller
                  control={control}
                  defaultValue={item.quantity}
                  name={`drugRecommendation[${index}].quantity`}
                  error={requiredErrors[index].quantity.length ? true : false}
                  helperText={requiredErrors[index].quantity}
                  onChange={([event]) => {
                    const value = event.target.value;
                    console.log(value);
                    if (value) {
                     const isNumber = /^[0-9.]/;
                      if (isNumber.test(value[value.length - 1])) {
                        if (value >= 0) {
                          return value;
                        } else {
                          return '';
                        }
                      }
                      if (typeof value === 'number') {
                        return  value;
                      }
                    }
                    return '';
                  }}
                  as={
                    <CustomizedTextField
                      defaultValue={item.quantity}
                      label={`${t('Quantity')} *`}
                      width='30%'
                      disabled={checkIsDisabled('drugName', index)}
                    />
                  }
                />
                <Controller
                  control={control}
                  name={`drugRecommendation[${index}].drugForm`}
                  defaultValue={item.drugForm}
                  error={requiredErrors[index].drugForm.length ? true : false}
                  helperText={requiredErrors[index].drugForm}
                  onChange={([event]) => event.target.value}
                  as={
                    <CustomizedTextField
                      disabled={checkIsDisabled('drugName', index)}
                      iconColor='#1976d2'
                      width='30%'
                      select
                      label={`${t('Drug form')} *`}>
                      {returnMenuItem('drugForm')}
                    </CustomizedTextField>
                  }
                />
                <Controller
                  control={control}
                  name={`drugRecommendation[${index}].drugRoute`}
                  defaultValue={item.drugRoute}
                  error={requiredErrors[index].drugRoute.length ? true : false}
                  helperText={requiredErrors[index].drugRoute}
                  as={
                    <CustomizedTextField
                      disabled={checkIsDisabled('drugName', index)}
                      iconColor='#1976d2'
                      width='30%'
                      select
                      label={`${t('Drug route')} *`}
                      onChange={([event]) => event.target.value}>
                      {returnMenuItem('drugRoute')}
                    </CustomizedTextField>
                  }
                />
              </Grid>
              <Grid container direction='row' justify='space-between'>
                <Controller
                  control={control}
                  name={`drugRecommendation[${index}].intervals`}
                  defaultValue={item.intervals}
                  error={requiredErrors[index].intervals.length ? true : false}
                  helperText={requiredErrors[index].intervals}
                  as={
                    <CustomizedTextField
                      disabled={checkIsDisabled('drugName', index)}
                      iconColor='#1976d2'
                      width='30%'
                      select
                      label={`${t('Intervals')} *`}
                      onChange={([event]) => event.target.value}>
                      {returnMenuItem('drugIntervals')}
                    </CustomizedTextField>
                  }
                />
                <Controller
                  control={control}
                  defaultValue={item.duration}
                  name={`drugRecommendation[${index}].duration`}
                  error={requiredErrors[index].duration.length ? true : false}
                  helperText={requiredErrors[index].duration}
                  onBlur={([event]) => {
                    setValue(
                      `drugRecommendation[${index}].toDate`,
                      event.target.value
                        ? moment().add(event.target.value, 'd').format('L')
                        : event.target.value,
                    );
                    return event.target.value;
                  }}
                  onChange={([event]) => {
                    if (
                      parseInt(event.target.value, 10) > 0 &&
                      parseInt(event.target.value, 10) < 100
                    ) {
                      return event.target.value;
                    } else {
                      return event.target.value.slice(
                        0,
                        event.target.value.length - 1,
                      );
                    }
                  }}
                  as={
                    <CustomizedTextField
                      disabled={checkIsDisabled('drugName', index)}
                      label={`${t('Duration (days)')} *`}
                      width='30%'
                      type='number'
                    />
                  }
                />
                <CustomizedTextField
                  defaultValue={item.toDate}
                  name={`drugRecommendation[${index}].toDate`}
                  inputRef={register()}
                  disabled
                  InputLabelProps={{
                    shrink:
                      drugRecommendation[index] &&
                      drugRecommendation[index]['duration']
                        ? true
                        : false,
                  }}
                  label={t('To date')}
                  width='30%'
                />
              </Grid>
              <Grid container direction='row' alignItems='baseline'>
                <CustomizedTextField
                  defaultValue={item.instructionsForTheDrug}
                  disabled={checkIsDisabled('drugName', index)}
                  name={`drugRecommendation[${index}].instructionsForTheDrug`}
                  label={instructionsForTheDrug}
                  InputLabelProps={{
                    shrink:
                      drugRecommendation[index] &&
                      drugRecommendation[index]['instructionsForTheDrug']
                        ? true
                        : false,
                  }}
                  inputRef={register()}
                  width='60%'
                />
                <StyledSelectTemplateButton
                  disabled={checkIsDisabled('drugName', index)}
                  onClick={() =>
                    handlePopUpProps(
                      instructionsForTheDrug,
                      'instructions_drug',
                      'diagnosis_and_recommendations',
                      callBack,
                      `drugRecommendation[${index}].instructionsForTheDrug`,
                      index,
                      'instructionsForTheDrug',
                    )
                  }>
                  {t('Select template')}
                </StyledSelectTemplateButton>
              </Grid>
              <Grid container direction='row' justify='flex-end'>
                <Delete
                  color={permission === 'view' ? 'disabled' : 'primary'}
                  onClick={async () => {
                    // Since there is no disabled option for icons I check the permission inside the function
                    if (permission !== 'write') return;
                    const { medicationRequest } = getValues({ nest: true });
                    if (medicationRequest && medicationRequest[index]) {
                      await FHIR('MedicationRequest', 'doWork', {
                        functionName: 'deleteMedicationRequest',
                        functionParams: {
                          _id: medicationRequest[index],
                        },
                      });
                      delete medicationRequest[index];
                      setValue('medicationRequest', medicationRequest);
                    }
                    remove(index);
                    setRequiredErrors((prevState) => {
                      const cloneState = [...prevState];
                      cloneState.splice(index, 1);
                      return cloneState;
                    });
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <span
                  style={{
                    cursor: 'pointer',
                    color: `${permission !== 'write' && 'rgba(0, 0, 0, 0.26)'}`,
                  }}>
                  {t('Delete drug')}
                </span>
              </Grid>
            </React.Fragment>
          );
        })}
      </StyledFormGroup>
    </>
  );
};

export default DrugRecommendation;
