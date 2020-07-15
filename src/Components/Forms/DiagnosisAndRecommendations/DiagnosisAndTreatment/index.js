import React from 'react';
import Title from 'Assets/Elements/Title';
import { StyledFormGroup } from 'Assets/Elements/StyledFormGroup';
import { StyledSelectTemplateButton } from 'Assets/Elements/StyledSelectTempleteButton';
import { useTranslation } from 'react-i18next';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { Grid } from '@material-ui/core';
import { StyledDivider } from '../Style';
import { useFormContext } from 'react-hook-form';

const DiagnosisAndTreatment = () => {
  const { t } = useTranslation();
  const {
    permission,
    setPopUpProps,
    setValue,
    register,
    watch,
  } = useFormContext();

  const diagnosisAndTreatmentFields = watch([
    'findingsDetails',
    'diagnosisDetails',
    'treatmentDetails',
  ]);
  const callBack = (data, name) => {
    setValue(name, data);
  };

  const handlePopUpProps = (title, fields, id, callBack, name) => {
    console.log('asdasdas' + diagnosisAndTreatmentFields[name], name);
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: true,
        formFieldsTitle: title,
        formFields: fields,
        formID: id,
        setTemplatesTextReturned: callBack,
        name,
        defaultContext: diagnosisAndTreatmentFields[name],
      };
    });
  };

  const treatmentDetails = t('Treatment details');
  const diagnosisDetails = t('Diagnosis details');
  const findingsDetails = t('Findings details');
  return (
    <StyledFormGroup>
      <Title
        label={t('Diagnosis and treatment')}
        fontSize='22px'
        bold
        color='#000b40'
      />
      <StyledDivider />
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='baseline'>
        <CustomizedTextField
          name='findingsDetails'
          inputRef={register}
          label={findingsDetails}
          width='45%'
          multiline
          InputLabelProps={{
            shrink: diagnosisAndTreatmentFields['findingsDetails']
              ? true
              : false,
          }}
          disabled={permission === 'view' ? true : false}
        />
        <StyledSelectTemplateButton
          disabled={permission === 'view' ? true : false}
          onClick={() =>
            handlePopUpProps(
              findingsDetails,
              'findings_details',
              'diagnosis_and_recommendations',
              callBack,
              'findingsDetails',
            )
          }>
          {t('Select template')}
        </StyledSelectTemplateButton>
      </Grid>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='baseline'>
        <CustomizedTextField
          inputRef={register}
          name='diagnosisDetails'
          label={diagnosisDetails}
          InputLabelProps={{
            shrink: diagnosisAndTreatmentFields['diagnosisDetails']
              ? true
              : false,
          }}
          width='45%'
          multiline
          disabled={permission === 'view' ? true : false}
        />
        <StyledSelectTemplateButton
          disabled={permission === 'view' ? true : false}
          onClick={() =>
            handlePopUpProps(
              diagnosisDetails,
              'diagnosis_details',
              'diagnosis_and_recommendations',
              callBack,
              'diagnosisDetails',
            )
          }>
          {t('Select template')}
        </StyledSelectTemplateButton>
      </Grid>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems='baseline'>
        <CustomizedTextField
          inputRef={register}
          name='treatmentDetails'
          label={treatmentDetails}
          InputLabelProps={{
            shrink: diagnosisAndTreatmentFields['treatmentDetails']
              ? true
              : false,
          }}
          width='45%'
          multiline
          disabled={permission === 'view' ? true : false}
        />
        <StyledSelectTemplateButton
          disabled={permission === 'view' ? true : false}
          onClick={() =>
            handlePopUpProps(
              treatmentDetails,
              'treatment_details',
              'diagnosis_and_recommendations',
              callBack,
              'treatmentDetails',
            )
          }>
          {t('Select template')}
        </StyledSelectTemplateButton>
      </Grid>
    </StyledFormGroup>
  );
};

export default DiagnosisAndTreatment;
