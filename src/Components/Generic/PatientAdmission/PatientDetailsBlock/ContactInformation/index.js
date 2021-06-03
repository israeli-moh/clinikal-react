import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyledFormGroup, StyledDivider, StyledAutoComplete } from '../Style';
import Title from 'Assets/Elements/Title';
import { Tabs, Tab, InputAdornment, CircularProgress } from '@material-ui/core';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { Controller, useFormContext } from 'react-hook-form';
import { getStreets, getCities } from 'Utils/Services/API';

const ContactInformation = ({
  postalCode,
  patientPOBox,
  streetNumber,
  city,
  streetName,
  addressType,
  writePermission,
  initValueFunction
}) => {
  const { t } = useTranslation();
  const {
    control,
    register,
    unregister,
    triggerValidation,
    setValue,
    errors,
  } = useFormContext();

  useEffect(() => {
    register({ name: 'addressCity' });
    initValueFunction([{'addressCity': addressCity.code}]);
    register({ name: 'addressStreet' });
    initValueFunction([{'addressStreet': addressStreet.code}]);
    register({ name: 'POBoxCity' });
    initValueFunction([{'POBoxCity': POBoxCity.code}]);
    register({ name: 'contactInformationTabValue' });
    initValueFunction([{'contactInformationTabValue': 0}]);
    register({ name: 'addressStreetNumber' });
    initValueFunction([{'addressStreetNumber': streetNumber}]);
    register({ name: 'POBox' });
    initValueFunction([{'POBox': POBox}]);
    register({ name: 'POBox' });
    initValueFunction([{'POBox': patientPOBox}]);
    register({ name: 'POBoxPostalCode' });
    initValueFunction([{'POBoxPostalCode': postalCode}]);
    register({ name: 'addressPostalCode' });
    initValueFunction([{'addressPostalCode': postalCode}]);


    return () => {
      unregister([
        'contactInformationTabValue',
        'addressCity',
        'addressStreet',
        'POBoxCity',
      ]);
    };
  }, [setValue, unregister, register]);

  const [contactInformationTabValue, setContactInformationTabValue] = useState(addressType === 'postal' ? 1 : 0);
  const contactInformationTabValueChangeHandler = (event, newValue) => {
    setValue('contactInformationTabValue', newValue);
    triggerValidation(['addressPostalCode', 'POBoxPostalCode']);
    setContactInformationTabValue(newValue);
  };

  const [cities, setCities] = useState([]);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const loadingCities = citiesOpen && cities.length === 0;
  // Contact Information - streets var
  const [streets, setStreets] = useState([]);
  const [streetsOpen, setStreetsOpen] = useState(false);
  const loadingStreets = streetsOpen && streets.length === 0;

  const [addressCity, setAddressCity] = useState(
    city ? { name: t(city), code: city } : {},
  );
  const [addressStreet, setAddressStreet] = useState(
    streetName ? { name: t(streetName), code: streetName } : {},
  );
  // Contact Information - PObox city - var
  const [POBoxCity, setPOBoxCity] = useState(
    city ? { name: t(city), code: city } : {},
  );
  // Contact Information - address - vars
  const [addressStreetNumber, setAddressStreetNumber] = useState('');

  const [addressPostalCode, setAddressPostalCode] = useState(postalCode || '');

  const [POBox, setPOBox] = useState(patientPOBox || '');

  const [POBoxPostalCode, setPOBoxPostalCode] = useState(postalCode || '');
  useEffect(() => {
    if (!citiesOpen) {
      setCities([]);
    }
    if (!streetsOpen) {
      setStreets([]);
    }
  }, [citiesOpen, streetsOpen]);

  useEffect(() => {
    let active = true;

    if (!loadingCities) {
      return undefined;
    }

    (async () => {
      try {
        const cities = await getCities();
        if (active) {
          setCities(
            Object.keys(cities.data).map((cityKey) => {
              let cityObj = {};
              cityObj.code = cities.data[cityKey];
              cityObj.name = t(cities.data[cityKey]);

              return cityObj;
            }),
          );
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingCities]);

  useEffect(() => {
    let active = true;

    if (!loadingStreets) {
      return undefined;
    }

    (async () => {
      try {
        const streets = await getStreets(addressCity.code.split('_')[1]);
        if (active) {
          if (Object.keys(streets.data).length) {
            setStreets(
              Object.keys(streets.data).map((streetKey) => {
                console.log(streetKey)
                let streetObj = {};
                streetObj.code = streetKey;
                streetObj.name = t(streets.data[streetKey]);

                return streetObj;
              }),
            );
          } else {
            const emptyResultsObj = {
              code: 'no_result',
              name: t('No Results'),
            };
            const emptyResults = [emptyResultsObj];
            setStreets(emptyResults);
          }
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingStreets]);

  const onTextBlur = (value, setState) => {
    setState(value);
  };
  return (
    <React.Fragment>
      <StyledFormGroup>
        <Title
          fontSize={'18px'}
          color={'#000b40'}
          label={t('Contact Information')}
          bold
        />
        <StyledDivider variant={'fullWidth'} />
        {/* Contact Information tabs */}
        <Tabs
          value={contactInformationTabValue}
          onChange={contactInformationTabValueChangeHandler}
          indicatorColor='primary'
          textColor='primary'
          variant='standard'
          aria-label='full width tabs example'>
          <Tab label={t('Address')} />
          <Tab label={t('PO box')} />
        </Tabs>
        {/* Contact Information tabs - address */}
        {contactInformationTabValue === 0 ? (
          <React.Fragment>
            {/* Contact Information - address - city */}
            <StyledAutoComplete
              open={citiesOpen}
              onOpen={() => {
                setCitiesOpen(true);
              }}
              onClose={() => {
                setCitiesOpen(false);
              }}
              loading={loadingCities}
              disabled={!writePermission}
              options={cities}
              value={addressCity}
              onChange={(event, newValue) => {
                if (newValue) {
                  setValue([
                    { addressCity: newValue.code },
                    { addressStreet: '' },
                  ]);
                }
                setAddressCity(newValue);
                setAddressStreet({});
              }}
              getOptionLabel={(option) =>
                Object.keys(option).length === 0 &&
                option.constructor === Object
                  ? ''
                  : option.name
              }
              getOptionSelected={(option, value) => option.code === value.code}
              noOptionsText={t('No Results')}
              loadingText={t('Loading')}
              renderInput={(params) => (
                <CustomizedTextField
                  width={'70%'}
                  {...params}
                  label={t('City')}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        <InputAdornment position={'end'}>
                          {loadingCities ? (
                            <CircularProgress color={'inherit'} size={20} />
                          ) : null}
                          {citiesOpen ? <ExpandLess /> : <ExpandMore />}
                        </InputAdornment>
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            {/* Contact Information - address - streets */}
            <StyledAutoComplete
              options={streets}
              loading={loadingStreets}
              open={streetsOpen}
              onOpen={() => addressCity.name && setStreetsOpen(true)}
              onClose={() => setStreetsOpen(false)}
              value={addressStreet}
              disabled={!writePermission}
              getOptionSelected={(option, value) => option.code === value.code}
              onChange={(event, newValue) => {
                if (newValue) {
                  console.log(newValue)
                  setValue('addressStreet', newValue.code);
                }
                setAddressStreet(newValue);
              }}
              getOptionLabel={(option) =>
                Object.keys(option).length === 0 &&
                option.constructor === Object
                  ? ''
                  : option.name
              }
              noOptionsText={t('No Results')}
              loadingText={t('Loading')}
              getOptionDisabled={(option) => option.code === 'no_result'}
              renderInput={(params) => (
                <CustomizedTextField
                  width={'70%'}
                  {...params}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <InputAdornment position={'end'}>
                        {loadingStreets ? (
                          <CircularProgress color={'inherit'} size={20} />
                        ) : null}
                        {streetsOpen ? <ExpandLess /> : <ExpandMore />}
                      </InputAdornment>
                    ),
                  }}
                  label={t('Street')}
                />
              )}
            />
            {/* Contact Information - address - house number */}
            <Controller
              name={'addressStreetNumber'}
              control={control}
              defaultValue={addressStreetNumber || streetNumber}
              onBlur={([event]) => {
                onTextBlur(event.target.value, setAddressStreetNumber);
                return event.target.value;
              }}
              as={
                <CustomizedTextField
                  width={'70%'}
                  id={'addressStreetNumber'}
                  label={t('House number')}
                  InputProps={{
                    autoComplete: 'no',
                  }}
                />
              }
              disabled={!writePermission}
            />
            {/* Contact Information - address - postal code */}
            <Controller
              defaultValue={addressPostalCode || postalCode}
              name={'addressPostalCode'}
              key='addressPostalCode'
              control={control}
              onBlur={([event]) => {
                onTextBlur(event.target.value, setAddressPostalCode);
                return event.target.value;
              }}
              as={
                <CustomizedTextField
                  width={'70%'}
                  id={'addressPostalCode'}
                  label={t('Postal code')}
                  type='number'
                  InputProps={{
                    autoComplete: 'no',
                  }}
                />
              }
              disabled={!writePermission}
              rules={{ maxLength: { value: 7 }, minLength: { value: 7 } }}
              error={errors.addressPostalCode && true}
              helperText={errors.addressPostalCode && 'יש להזין 7 ספרות'}
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* Contact Information - POBox - city */}
            <StyledAutoComplete
              open={citiesOpen}
              onOpen={() => {
                setCitiesOpen(true);
              }}
              onClose={() => {
                setCitiesOpen(false);
              }}
              onChange={(event, newValue) => {
                if (newValue) {
                  setValue('POBoxCity', newValue.code);
                }
                setPOBoxCity(newValue);
              }}
              getOptionSelected={(option, value) => option.code === value.code}
              value={POBoxCity}
              disabled={!writePermission}
              loading={loadingCities}
              options={cities}
              getOptionLabel={(option) => option.name}
              noOptionsText={t('No Results')}
              loadingText={t('Loading')}
              renderInput={(params) => (
                <CustomizedTextField
                  width={'70%'}
                  {...params}
                  label={t('City')}
                  InputProps={{
                    autoComplete: 'chrome-off',
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        <InputAdornment position={'end'}>
                          {loadingCities ? (
                            <CircularProgress color={'inherit'} size={20} />
                          ) : null}
                          {citiesOpen ? <ExpandLess /> : <ExpandMore />}
                        </InputAdornment>
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            {/* Contact Information - POBox - POBox */}
            <Controller
              name={'POBox'}
              control={control}
              defaultValue={POBox}
              onBlur={([event]) => {
                onTextBlur(event.target.value, setPOBox);
                return event.target.value;
              }}
              disabled={!writePermission}
              as={
                <CustomizedTextField
                  width={'70%'}
                  id={'POBox'}
                  label={t('PO box')}
                  InputProps={{
                    autoComplete: 'no',
                  }}
                />
              }
            />
            {/* Contact Information - POBox - postal code */}
            <Controller
              defaultValue={POBoxPostalCode || postalCode}
              name={'POBoxPostalCode'}
              key='POBoxPostalCode'
              control={control}
              disabled={!writePermission}
              onBlur={([event]) => {
                onTextBlur(event.target.value, setPOBoxPostalCode);
                return event.target.value;
              }}
              as={
                <CustomizedTextField
                  width={'70%'}
                  id={'POBoxPostalCode'}
                  label={t('Postal code')}
                  InputLabelProps={{
                    shrink: postalCode && true,
                  }}
                  InputProps={{
                    autoComplete: 'no',
                  }}
                />
              }
              rules={{ maxLength: { value: 7 }, minLength: { value: 7 } }}
              error={errors.POBoxPostalCode && true}
              helperText={errors.POBoxPostalCode && 'יש להזין 7 ספרות'}
            />
          </React.Fragment>
        )}
      </StyledFormGroup>
      <span>
        {t('To find a zip code on the Israel post site')}
        <a
          href={
            'https://mypost.israelpost.co.il/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D/%D7%90%D7%99%D7%AA%D7%95%D7%A8-%D7%9E%D7%99%D7%A7%D7%95%D7%93/'
          }
          target={'_blank'}
          rel='noopener noreferrer'>
          {t('Click here')}
        </a>
      </span>
    </React.Fragment>
  );
};

export default ContactInformation;
