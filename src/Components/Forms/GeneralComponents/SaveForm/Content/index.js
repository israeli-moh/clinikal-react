import React, { useEffect, useState } from 'react';

import StyledContent, { StyledHeader, StyledSubHeader } from './Style';
import { RadioGroup, FormControlLabel, Radio, Grid } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
const Content = ({ statuses, currentStatus }) => {
  const { permission, setValue, register, unregister } = useFormContext();

  useEffect(() => {
    register({ name: 'nextStatus' });
    return () => {
      unregister('nextStatus');
    };
  }, [register, unregister]);

  const { t } = useTranslation();

  const [nextStatus, setNextStatus] = useState('');
  const handleNextStatusChange = (event) => {
    setNextStatus(event.target.value);
    setValue('nextStatus', event.target.value);
  };
  return (
    <>
      <Grid item xs={12}>
        <StyledHeader
          marginTop='47px'
          label='Please Note'
          bold
          fontSize='24px'
          color='#000b40'
        />
      </Grid>
      <Grid item xs={12}>
        <StyledSubHeader
          marginTop='16px'
          label='Please select whom to transfer the treatment before saving and closing'
          fontSize='16px'
          color='#000b40'
        />
      </Grid>
      <Grid item xs={9}>
        <RadioGroup
          style={{ marginBottom: '109px' }}
          row
          name='nextStatus'
          value={nextStatus}
          onChange={handleNextStatusChange}>
          {statuses.map((status, statusIndex) => (
            <FormControlLabel
              style={{ marginRight: '0', marginLeft: '0' }}
              key={statusIndex}
              value={status.value}
              label={t(status.label)}
              control={
                <Radio
                  style={{ paddingRight: statusIndex === 0 && '0' }}
                  color='primary'
                  disabled={
                    permission === 'view'
                      ? true
                      : false
                  }
                />
              }
            />
          ))}
        </RadioGroup>
      </Grid>
    </>
  );
};

export default Content;
