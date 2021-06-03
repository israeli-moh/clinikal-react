import React, { useEffect } from 'react';
import { StyledTemplateSelection } from '../Style';
import { Grid } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { StyledSelectTemplateButton } from 'Assets/Elements/StyledSelectTempleteButton';
import { useTranslation } from 'react-i18next';
import {
  ParseQuestionnaireResponseBoolean,
  ParseQuestionnaireResponseText
} from 'Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem';

const MedicalBackgroundComments = ({initValueFunction, items, prevEncounterResponse}) => {
  const { t } = useTranslation();
  const MedicalBackgroundCommentsLinkId = '8';
  const {
    permission,
    setValue,
    register,
    watch,
  } = useFormContext();

  useEffect(() => {
    console.log(items)
    if (typeof items.items !== "undefined" && items.items.length) {
      const MedicalBackgroundCommentsContent = ParseQuestionnaireResponseText(items, MedicalBackgroundCommentsLinkId)

      initValueFunction([
        {
          medicalBackgroundComments: MedicalBackgroundCommentsContent,
        }
      ]);
    } else {
      console.log(prevEncounterResponse)
      if ( typeof prevEncounterResponse.items !== 'undefined' && prevEncounterResponse.items.length) {
        const MedicalBackgroundCommentsContent = ParseQuestionnaireResponseText(prevEncounterResponse, MedicalBackgroundCommentsLinkId)
        initValueFunction([
          {
            medicalBackgroundComments: MedicalBackgroundCommentsContent,
          }
        ]);

      }
    }
  },[prevEncounterResponse, items])

  const callBack = (data, name) => {
    setValue(name, data);
  };

  const medicalBackground = watch(['medicalBackgroundComments']);
  const label = t('Medical Background Comments');

  /*useEffect(() => {
    console.log(medicalBackground)
  }, [medicalBackground])
*/
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
            name='medicalBackgroundComments'
            multiline
            width={'85%'}
            label={label}
            InputLabelProps={{
              shrink:medicalBackground['medicalBackgroundComments'] && medicalBackground['medicalBackgroundComments'].length > 0,
            }}
            disabled={permission !== 'write'}
          />
        </Grid>
      </Grid>
    </StyledTemplateSelection>
  );
};
export default MedicalBackgroundComments;
