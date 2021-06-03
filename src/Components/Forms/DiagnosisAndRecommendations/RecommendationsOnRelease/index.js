import React from 'react';
import Title from 'Assets/Elements/Title';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { StyledFormGroup } from 'Assets/Elements/StyledFormGroup';
import  StyledSelectTemplateButton from 'Assets/Elements/StyledSelectTempleteButton';
import { StyledDivider } from '../Style';
import { useFormContext } from 'react-hook-form';
const RecommendationsOnRelease = ({ initValueFunction }) => {
  const { t } = useTranslation();
  const {
    permission,
    register,
    watch,
    setPopUpProps,
    setValue,
    questionnaireResponse,
  } = useFormContext();
  const instructionsForFurtherTreatment = watch(
    'instructionsForFurtherTreatment',
  );
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
        defaultContext: instructionsForFurtherTreatment,
      };
    });
  };
  const instructionsName = t('Instructions for further treatment');

  React.useEffect(() => {
    const { items } = questionnaireResponse;
    if (items) {
      items.forEach((item) => {
        if (item.answer) {
          switch (item.linkId) {
            case '4':
              initValueFunction([
                {
                  instructionsForFurtherTreatment: item.answer[0].valueString,
                },
              ]);
              break;
            default:
              break;
          }
        }
      });
    }
  }, [questionnaireResponse, setValue]);

  return (
    <StyledFormGroup>
      <Title
        label={t('Recommendations on release')}
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
          name='instructionsForFurtherTreatment'
          inputRef={register}
          label={instructionsName}
          width='45%'
          multiline
          InputLabelProps={{
            shrink: instructionsForFurtherTreatment ? true : false,
          }}
          disabled={permission === 'view' ? true : false}
        />
        <StyledSelectTemplateButton
          disabled={permission === 'view' ? true : false}
          onClick={() =>
            handlePopUpProps(
              instructionsName,
              'instructions_further_treatment',
              'diagnosis_and_recommendations',
              callBack,
              'instructionsForFurtherTreatment',
            )
          }>
          {t('Select template')}
        </StyledSelectTemplateButton>
      </Grid>
    </StyledFormGroup>
  );
};

export default RecommendationsOnRelease;
