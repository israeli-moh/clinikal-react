import React from 'react';
import { StyledForm, StyledTemplateSelection } from '../Style';
import { Grid } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { StyledSelectTemplateButton } from 'Assets/Elements/StyledSelectTempleteButton';
import { useTranslation } from 'react-i18next';

const NursingAnamnesis = () => {
  const { t } = useTranslation();

  const {
    permission,
    setPopUpProps,
    setValue,
    register,
    watch,
  } = useFormContext();

  const callBack = (data, name) => {
    setValue(name, data);
  };

  const handlePopUpProps = (title, fields, id, callBack, name) => {
    setPopUpProps((prevState) => {
      return {
        ...prevState,
        popupOpen: true,
        formFieldsTitle: title,
        formFields: fields,
        formID: id,
        setTemplatesTextReturned: callBack,
        name,
      };
    });
  };
  const medicalAdmission = watch([
    'nursingDetails',
  ]);
  const nursingDetails = t('Nursing anamnesis');

  return (<StyledTemplateSelection>
    <Grid
      container
      direction={'row'}
      justify={'flex-start'}
      alignItems={'center'}>
      <Grid item xs={10}>
        <CustomizedTextField
          inputRef={register}
          name='nursingDetails'
          multiline
          width={'85%'}
          label={nursingDetails}
          InputLabelProps={{
            shrink: medicalAdmission['nursingDetails']
              ? true
              : false,
          }}
          disabled={permission === 'view' ? true : false}
        />
      </Grid>
      <Grid item xs={2}>
        <StyledSelectTemplateButton
          disabled={permission === 'view' ? true : false}
          onClick={() =>
            handlePopUpProps(
              nursingDetails,
              'nursing_anamnesis', //to change
              'medical_admission', //to change
              callBack,
              'nursingDetails',
            )
          }>
          {t('Select template')}
        </StyledSelectTemplateButton>
      </Grid>
    </Grid>
  </StyledTemplateSelection>);
};
export default NursingAnamnesis;