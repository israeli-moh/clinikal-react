import React, { useEffect, useState } from 'react';
import {
  StyledForm,
  StyledPatientDetails,
  StyledFormGroup,
  StyledDivider,
  StyledTextField,
  StyledAutoComplete,
  StyledSwitch,
} from './Style';
import { useTranslation } from 'react-i18next';
import Title from '../../../../Assets/Elements/Title';
import Switch from '@material-ui/core/Switch';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { DevTool } from 'react-hook-form-devtools';
import { useForm, Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { ExpandMore, ExpandLess, CheckBox } from '@material-ui/icons';
import CheckBoxOutlineBlankOutlinedOutlined from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import { getCities, getStreets } from '../../../../Utils/Services/API';
import { getValueSet } from '../../../../Utils/Services/FhirAPI';
import Grid from '@material-ui/core/Grid';
import normalizeFhirValueSet from '../../../../Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { Checkbox, TextField } from '@material-ui/core';

const PatientDetailsBlock = ({ patientData, edit_mode, encounterData }) => {
  const { t } = useTranslation();
  const { register, control, handleSubmit } = useForm({
    submitFocusError: true,
    mode: 'onBlur',
  });

  ///////////////////////////////////
  const [value, setValue] = React.useState([]);
  const [pendingValue, setPendingValue] = React.useState([]);

  //////////////////////////////////

  const [addressCity, setAddressCity] = useState({});

  const [selecetedServicesType, setSelecetedServicesType] = useState([]);

  const [cities, setCities] = useState([]);
  const [citiesOpen, setCitiesOpen] = useState(false);

  const [streets, setStreets] = useState([]);
  const [streetsOpen, setStreetsOpen] = useState(false);

  const [servicesType, setServicesType] = useState([]);
  const [servicesTypeOpen, setServicesTypeOpen] = useState(false);

  const loadingCities = citiesOpen && cities.length === 0;
  const loadingStreets = streetsOpen && streets.length === 0;
  const loadingServicesType = servicesTypeOpen && servicesType.length === 0;

  const [isEscorted, setIsEscorted] = useState(false);
  const isEscortedSwitchOnChangeHandle = () => {
    setIsEscorted(prevState => !prevState);
  };

  const [isUrgent, setIsUrgent] = useState(false);
  const isUrgentSwitchOnChangeHandler = () => {
    setIsUrgent(prevState => !prevState);
  };

  //Tabs
  const [tabValue, setTabValue] = useState(0);

  //Sending the form
  const onSubmit = data => {
    console.log(data);
  };
  // Default values
  useEffect(() => {
    if (patientData.city) {
      const defaultAddressCityObj = {
        name: t(patientData.city),
        code: patientData.city,
      };
      setAddressCity(defaultAddressCityObj);
    }
    if (encounterData) {
      if (encounterData.priority > 1) {
        setIsUrgent(true);
      }
    }
  }, [encounterData, patientData]);
  //Loading services type
  useEffect(() => {
    let active = true;

    if (!loadingServicesType) {
      return undefined;
    }

    (async () => {
      try {
        const serviceTypeResponse = await getValueSet('service_types');
        if (active) {
          const servicesTypeObj = {};
          // for (const serviceTypeIndex in serviceTypeResponse.data.expansion.contains) {
          //     const normalizedServiceType = normalizeFhirValueSet(serviceTypeResponse.data.expansion.contains[serviceTypeIndex]);
          //     Promise.all()
            
          // }
          const allReasonsCode = await Promise.all(serviceTypeResponse.data.expansion.contains.map(serviceType => {
            const normalizedServiceType = normalizeFhirValueSet(serviceType);
            servicesTypeObj[normalizedServiceType.code] = normalizedServiceType;
            return getValueSet(`reason_codes_${normalizedServiceType.code}`)
          }));
          for (let reasonsIndex = 0; reasonsIndex < allReasonsCode.length; reasonsIndex ++) {
            servicesTypeObj[allReasonsCode[reasonsIndex].data.id.split('_')[2]]['reasonCodes'] = allReasonsCode[reasonsIndex].data.expansion.contains.map(reasonCode => normalizeFhirValueSet(reasonCode))
          }
          setServicesType(servicesTypeObj);
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      active = false;
    };
  }, [loadingServicesType]);
  // loadingServiceType add it to useEffect dep

  //Loading cities
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
            Object.keys(cities.data).map(cityKey => {
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
  //Loading streets
  useEffect(() => {
    let active = true;

    if (!loadingStreets) {
      return undefined;
    }

    (async () => {
      try {
        const streets = await getStreets(addressCity.code.split('_')[1]);
        if (active) {
          if (streets.data.length) {
            setStreets(
              Object.keys(streets.data).map(streetKey => {
                let streetObj = {};
                streetObj.code = streets.data[streetKey];
                streetObj.name = t(streets.data[streetKey]);

                return streetObj;
              }),
            );
          } else {
            const emptyResultsObj = {};
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
  //Reset options for auto compelete
  useEffect(() => {
    if (!citiesOpen) {
      setCities([]);
    }
    if (!streetsOpen) {
      setStreets([]);
    }
    if (!servicesTypeOpen) {
      setServicesType([]);
    }
  }, [citiesOpen, streetsOpen, servicesTypeOpen]);

  return (
    <StyledPatientDetails edit={edit_mode}>
      <StyledForm onSubmit={handleSubmit(onSubmit)}>
        <Title
          marginTop={'55px'}
          fontSize={'28px'}
          color={'#002398'}
          label={'Patient Details'}
        />
        <StyledFormGroup>
          <Title fontSize={'18px'} variant={'fullWidth'} />
          <Grid
            container
            direction={'row'}
            justify={'flex-start'}
            alignItems={'baseline'}>
            <span>{t('Patient arrived with an escort?')}</span>
            {/* <StyledSwitch
              size={'medium'}
              color={'primary'}
              onChange={switchOnChangeHandle}
              value={isEscorted}
              beforeContent={t('yes')}
              afterContent={t('no')}
            /> */}
            <Switch
              size={'medium'}
              color={'primary'}
              onChange={isEscortedSwitchOnChangeHandle}
              checked={isEscorted}
            />
          </Grid>
        </StyledFormGroup>
        {isEscorted ? (
          <StyledFormGroup>
            <Title
              fontSize={'18px'}
              color={'#000b40'}
              label={t('Escort details')}
              bold
            />
            <StyledDivider variant={'fullWidth'} />
            <StyledTextField
              inputRef={register}
              name={'escortName'}
              id={'escortName'}
              label={t('Escort name')}
            />
            <StyledTextField
              inputRef={register}
              name={'escortMobilePhone'}
              id={'escortMobilePhone'}
              label={t('Escort cell phone ')}
            />
          </StyledFormGroup>
        ) : null}
        <StyledFormGroup>
          <Title
            fontSize={'18px'}
            color={'#000b40'}
            label={t('Contact Information')}
            bold
          />
          <StyledDivider variant={'fullWidth'} />
          <Tabs
            value={tabValue}
            onChange={(event, newValue) => {
              setTabValue(newValue);
            }}
            indicatorColor='primary'
            textColor='primary'
            variant='standard'
            aria-label='full width tabs example'>
            <Tab label={t('Address')} />
            <Tab label={t('PO box')} />
          </Tabs>
          {tabValue === 0 ? (
            <React.Fragment>
              <StyledAutoComplete
                id='addressCity'
                open={citiesOpen}
                onOpen={() => {
                  setCitiesOpen(true);
                }}
                onClose={() => {
                  setCitiesOpen(false);
                }}
                loading={loadingCities}
                options={cities}
                value={addressCity}
                onChange={(event, newValue) => {
                  setAddressCity(newValue);
                }}
                getOptionLabel={option =>
                  Object.keys(option).length === 0 &&
                  option.constructor === Object
                    ? ''
                    : option.name
                }
                noOptionsText={t('No Results')}
                loadingText={t('Loading')}
                renderInput={params => (
                  <StyledTextField
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

              <Autocomplete
                options={streets}
                loading={loadingStreets}
                open={streetsOpen}
                onOpen={() => addressCity.name && setStreetsOpen(true)}
                onClose={() => setStreetsOpen(false)}
                id='addressStreet'
                getOptionLabel={option => (option === '' ? '' : option.name)}
                noOptionsText={t('No Results')}
                loadingText={t('Loading')}
                getOptionDisabled={option => option.code === 'no_result'}
                renderInput={params => (
                  <StyledTextField
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

              <Controller
                name={'addressHouseNumber'}
                control={control}
                as={
                  <StyledTextField
                    id={'addressHouseNumber'}
                    label={t('House number')}
                  />
                }
              />
              <Controller
                defaultValue={patientData.postalCode}
                name={'addressPostalCode'}
                as={
                  <StyledTextField
                    id={'addressPostalCode'}
                    label={t('Postal code')}
                  />
                }
                control={control}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <StyledAutoComplete
                name='POBoxCity'
                id='POBoxCity'
                open={citiesOpen}
                onOpen={() => {
                  setCitiesOpen(true);
                }}
                onClose={() => {
                  setCitiesOpen(false);
                }}
                value={addressCity}
                loading={loadingCities}
                options={cities}
                getOptionLabel={option => option.name}
                noOptionsText={t('No Results')}
                loadingText={t('Loading')}
                renderInput={params => (
                  <StyledTextField
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
              <Controller
                name={'POBox'}
                control={control}
                as={<StyledTextField id={'POBox'} label={t('PO box')} />}
              />
              <Controller
                defaultValue={patientData.postalCode}
                name={'POBoxPostalCode'}
                as={
                  <StyledTextField
                    id={'POBoxPostalCode'}
                    label={t('Postal code')}
                  />
                }
                control={control}
              />
            </React.Fragment>
          )}
        </StyledFormGroup>
        <span>
          {t('To find a zip code on the Israel post site')}{' '}
          <a
            href={
              'https://mypost.israelpost.co.il/%D7%A9%D7%99%D7%A8%D7%95%D7%AA%D7%99%D7%9D/%D7%90%D7%99%D7%AA%D7%95%D7%A8-%D7%9E%D7%99%D7%A7%D7%95%D7%93/'
            }
            target={'_blank'}>
            {t('click here')}
          </a>
        </span>

        <Title
          marginTop={'80px'}
          fontSize={'28px'}
          color={'#002398'}
          label={'Patient Details'}
        />
        {/* REQUESTED SERVICE */}
        <StyledFormGroup>
          <Title
            fontSize={'18px'}
            color={'#000b40'}
            label={'Requested service'}
            bold
          />
          <StyledDivider variant={'fullWidth'} />
          <Grid
            container
            direction={'row'}
            justify={'flex-start'}
            alignItems={'baseline'}>
            <span>{t('Is urgent?')}</span>
            <Switch
              size={'medium'}
              color={'primary'}
              onChange={isUrgentSwitchOnChangeHandler}
              checked={isUrgent}
            />
          </Grid>
          <Autocomplete
            multiple
            noOptionsText={t('No Results')}
            loadingText={t('Loading')}
            open={servicesTypeOpen}
            onOpen={() => setServicesTypeOpen(true)}
            onClose={() => {
              setServicesTypeOpen(false);
              setValue(pendingValue);
            }}
            value={pendingValue}
            onChange={(event, newValue) => {
              setPendingValue(newValue);
            }}
            disableCloseOnSelect
            renderTags={() => null}
            renderOption={(option, state) => (
              <React.Fragment>
                {
                  <Checkbox
                    icon={<CheckBoxOutlineBlankOutlinedOutlined />}
                    checkedIcon={<CheckBox />}
                    checked={state.selected}
                  />
                }
                {option.name}
              </React.Fragment>
            )}
            options={labels}
            getOptionLabel={option => option.name}
            renderInput={params => (
              <StyledTextField
                {...params}
                label={t('Select test')}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      <InputAdornment position={'end'}>
                        {loadingServicesType ? (
                          <CircularProgress color={'inherit'} size={20} />
                        ) : null}
                        {servicesTypeOpen ? <ExpandLess /> : <ExpandMore />}
                      </InputAdornment>
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          {value.map(option => {
            return <span>{option.name}</span>;
          })}
          {/* <Autocomplete
            multiple
            renderTags={() => null} //So it won't show tags inside
            id='servicesType'
            open={servicesTypeOpen}
            onOpen={() => {
              setServicesTypeOpen(true);
            }}
            onClose={() => {
              setServicesTypeOpen(false);
            }}
            loading={loadingServicesType}
            options={servicesType}
            value={selecetedServicesType}
            onChange={(event, newValue) => {
              setServicesType(newValue);
            }}
            getOptionLabel={option => option.name
              // Object.keys(option).length === 0 && option.constructor === Object
              //   ? ''
              //   : option.name
            }
            disablePortal
            disableCloseOnSelect // Used for multiple selects
            noOptionsText={t('No Results')}
            loadingText={t('Loading')}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                { selected ?  <CheckBox /> : <CheckBoxOutlineBlank />}
                {option.name}
              </React.Fragment>
            )}
            renderInput={params => (
              <StyledTextField
                {...params}
                label={t('Select test')}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      <InputAdornment position={'end'}>
                        {loadingServicesType ? (
                          <CircularProgress color={'inherit'} size={20} />
                        ) : null}
                        {servicesTypeOpen ? <ExpandLess /> : <ExpandMore />}
                      </InputAdornment>
                    </React.Fragment>
                  ),
                }}
              />
            )}
          /> */}
        </StyledFormGroup>
      </StyledForm>
      {/* <DevTool control={control} /> */}
    </StyledPatientDetails>
  );
};
const mapStateToProps = state => {
  return {
    languageDirection: state.settings.lang_dir,
  };
};
export default connect(mapStateToProps, null)(PatientDetailsBlock);

const labels = [
  {
    name: 'good first issue',
    color: '#7057ff',
    description: 'Good for newcomers',
  },
  {
    name: 'help wanted',
    color: '#008672',
    description: 'Extra attention is needed',
  },
  {
    name: 'priority: critical',
    color: '#b60205',
    description: '',
  },
  {
    name: 'priority: high',
    color: '#d93f0b',
    description: '',
  },
  {
    name: 'priority: low',
    color: '#0e8a16',
    description: '',
  },
  {
    name: 'priority: medium',
    color: '#fbca04',
    description: '',
  },
  {
    name: "status: can't reproduce",
    color: '#fec1c1',
    description: '',
  },
  {
    name: 'status: confirmed',
    color: '#215cea',
    description: '',
  },
  {
    name: 'status: duplicate',
    color: '#cfd3d7',
    description: 'This issue or pull request already exists',
  },
  {
    name: 'status: needs information',
    color: '#fef2c0',
    description: '',
  },
  {
    name: 'status: wont do/fix',
    color: '#eeeeee',
    description: 'This will not be worked on',
  },
  {
    name: 'type: bug',
    color: '#d73a4a',
    description: "Something isn't working",
  },
  {
    name: 'type: discussion',
    color: '#d4c5f9',
    description: '',
  },
  {
    name: 'type: documentation',
    color: '#006b75',
    description: '',
  },
  {
    name: 'type: enhancement',
    color: '#84b6eb',
    description: '',
  },
  {
    name: 'type: epic',
    color: '#3e4b9e',
    description: 'A theme of work that contain sub-tasks',
  },
  {
    name: 'type: feature request',
    color: '#fbca04',
    description: 'New feature or request',
  },
  {
    name: 'type: question',
    color: '#d876e3',
    description: 'Further information is requested',
  },
];
