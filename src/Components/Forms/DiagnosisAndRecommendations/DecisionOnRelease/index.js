import React, { useEffect, useState } from 'react';
import Title from 'Assets/Elements/Title';
import { Grid, Radio, FormControlLabel, RadioGroup } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { StyledFormGroup } from 'Assets/Elements/StyledFormGroup';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { useFormContext, Controller } from 'react-hook-form';
import { StyledDivider } from '../Style';
import { connect } from 'react-redux';
const RecommendationsOnRelease = ({ initValueFunction, languageDirection}) => {
  const { t } = useTranslation();
  const {
    register,
    unregister,
    setValue,
    permission,
    questionnaireResponse,
    control,
  } = useFormContext();
  const [decision, setDecision] = useState('');
  const [evacuationWay, setEvacuationWay] = useState('');
  const [numberOfDays, setNumberOfDays] = useState('');

  const handleEvacuationWayChange = (event) => {
    setEvacuationWay(event.target.value);
    setValue('evacuationWay', event.target.value);
  };

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
    setValue('decision', event.target.value);
  };

  useEffect(() => {
    register({ name: 'decision' });
    register({ name: 'evacuationWay' });
    register({ name: 'numberOfDays' });
    const { items } = questionnaireResponse;
    if (items) {
      items.forEach((item) => {
        if (item.answer) {
          switch (item.linkId) {
            case '5':
              setDecision(item.answer[0].valueString);
              initValueFunction([{ decision: item.answer[0].valueString }]);
              break;
            case '6':
              setEvacuationWay(item.answer[0].valueString);
              initValueFunction([
                { evacuationWay: item.answer[0].valueString },
              ]);
              break;
            case '7':
              setNumberOfDays(item.answer[0].valueInteger)
              initValueFunction([{ numberOfDays: item.answer[0].valueInteger }]);
              break;
            default:
              break;
          }
        }
      });
    }
    return () => unregister(['decision', 'evacuationWay']);
  }, [register, unregister, questionnaireResponse, setValue]);

  return (
    <StyledFormGroup>
      <Title
        label={t('Decision on release')}
        fontSize='22px'
        bold
        color='#000b40'
      />
      <StyledDivider />
      <Grid container direction='row' justify='flex-start' alignItems='center'>
        <label style={{ width: '73px'}}>{t('Decision')}</label>
        <RadioGroup
          style={{ marginRight: '0', marginLeft: '0' }}
          row
          name='decision'
          value={decision}
          onChange={handleDecisionChange}>
          <FormControlLabel
            style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
            value='Evacuation to hospital'
            label={t('Evacuation to hospital')}
            control={
              <Radio
                style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                color='primary'
                disabled={permission === 'view' ? true : false}
              />
            }
          />
          <FormControlLabel
            style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
            value='Release to home'
            label={t('Release to home')}
            control={
              <Radio
                style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                color='primary'
                disabled={permission === 'view' ? true : false}
              />
            }
          />
        </RadioGroup>
      </Grid>
      <Grid
        container
        direction='row'
        justify='flex-start'
        alignItems={decision === 'Release to home' ? 'baseline' : 'center'}>
        {decision === 'Evacuation to hospital' && (
          <React.Fragment>
            <label style={languageDirection === 'ltr' ? {paddingRight: '10px'} : {paddingLeft: '10px'} } >{t('Evacuation way')}</label>
            <RadioGroup
              row
              name='evacuationWay'
              value={evacuationWay}
              onChange={handleEvacuationWayChange}>
              <FormControlLabel
                style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                value='Ambulance'
                label={t('Ambulance')}
                control={
                  <Radio
                    style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                    color='primary'
                    disabled={permission === 'view' ? true : false}
                  />
                }
              />
              <FormControlLabel
                style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                value='Independent'
                label={t('Independent')}
                control={
                  <Radio
                    style={languageDirection === 'ltr' ? {paddingRight: '0'} : null }
                    color='primary'
                    disabled={permission === 'view' ? true : false}
                  />
                }
              />
            </RadioGroup>
          </React.Fragment>
        )}
        {decision === 'Release to home' && (
          <React.Fragment>
            <label>{t('Sick leave')}</label>
            <Controller
              control={control}
              onChange={([event]) => {
                if (event.target.value <= 0 || event.target.value >= 100) {
                  return '';
                }
                return event.target.value;
              }}
              name='numberOfDays'
              defaultValue={numberOfDays}
              disabled={permission === 'view' ? true : false}
              as={
                <CustomizedTextField
                  style={{ marginLeft: '16px', marginRight: '16px' }}
                  width='10%'
                  label={t('Number of days')}
                  type='number'
                />
              }
            />
          </React.Fragment>
        )}
      </Grid>
    </StyledFormGroup>
  );
};


const mapStateToProps = (state) => {
  return {
    languageDirection: state.settings.lang_dir,
  };
};
export default connect(mapStateToProps)(RecommendationsOnRelease);

