import React from 'react';
import { StyledTemplateSelection } from '../Style';
import { Grid } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import  StyledSelectTemplateButton from 'Assets/Elements/StyledSelectTempleteButton';
import { useTranslation } from 'react-i18next';

const NursingAnamnesis = (initValueFunction) => {
  const { t } = useTranslation();

  const {
    permission,
    setPopUpProps,
    setValue,
    register,
    watch,
    getValues
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
        defaultContext: getValues({ nest: true })[name],
      };
    });
  };
  const medicalAdmission = watch(['nursingDetails']);
  const nursingDetails = t('Nursing anamnesis');

  return (
    <StyledTemplateSelection>
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
              shrink: medicalAdmission['nursingDetails'] ? true : false,
            }}
            disabled={permission === 'write' ? false : true}
          />
        </Grid>
        <Grid item xs={2}>
          <StyledSelectTemplateButton
            disabled={permission === 'write' ? false : true}
            onClick={() =>
              handlePopUpProps(
                nursingDetails,
                'nursing_anamnesis',
                'medical_admission',
                callBack,
                'nursingDetails',
              )
            }>
            {t('Select template')}
          </StyledSelectTemplateButton>
        </Grid>
      </Grid>
    </StyledTemplateSelection>
  );
};
export default NursingAnamnesis;
