import React, { useState, useEffect } from 'react';
import { StyledFormGroup, StyledDivider, StyledAutoComplete } from '../Style';
import Title from 'Assets/Elements/Title';
import { Tabs, Tab, Grid, InputAdornment, CircularProgress } from '@material-ui/core';
import TabPanel from '../TabPanel';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import StyledToggleButtonGroup from 'Assets/Elements/StyledToggleButtonGroup';
import StyledToggleButton from 'Assets/Elements/StyledToggleButton';
import { Controller, useFormContext } from 'react-hook-form';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import CustomizedKeyboardDatePicker from 'Assets/Elements/CustomizedKeyboardDatePicker';
import { useTranslation } from 'react-i18next';
import MomentUtils from '@date-io/moment';
import { checkCurrencyFormat } from 'Utils/Helpers/validation/checkCurrencyFormat';
import { formatToCurrency } from 'Utils/Helpers/validation/formatToCurrency';
import moment from 'moment';
import { normalizeFhirOrganization } from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirOrganization';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirQuestionnaireResponse from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirQuestionnaireResponse';
import {
  ParseQuestionnaireResponseInt,
  ParseQuestionnaireResponseText
} from 'Utils/Helpers/FhirEntities/helpers/ParseQuestionnaireResponseItem';
import { connect } from 'react-redux';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { emptyArrayAll } from 'Utils/Helpers/emptyArray';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import MenuItem from '@material-ui/core/MenuItem';


const Payment = ({ pid, eid, formatDate, managingOrganization, handleLoading, writePermission, initValueFunction, noPaymentReasonsValueset }) => {
  const { t } = useTranslation();

  const {
    register,
    control,
    setValue,
    requiredErrors,
    errors,
    unregister,
    isCommitmentForm,

  } = useFormContext();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [noPaymentReason, setNoPaymentReason] = useState(0);
  const [noPaymentComment, setNoPaymentComment] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [noPaymentReasonsList, setNoPaymentReasonsList] = useState([]);
  const defaultPaymentTab = 'Private';
  useEffect(() => {
    const {
      expansion: { contains },
    } = noPaymentReasonsValueset;
    let options = emptyArrayAll(t('Choose'));
    for (let status of contains) {
      options.push(normalizeFhirValueSet(status));
    }
    console.log(options)
    setNoPaymentReasonsList(options);
  }, [])

  const paymentMethodHandler = (event, method) => {
    setValue('paymentMethod', method);
    setPaymentMethod(method);
  };
  const [
    commitmentAndPaymentTabValue,
    setCommitmentAndPaymentTabValue,
  ] = useState(isCommitmentForm === '1' ? 'HMO' : 'Private');

  const setCommitmentAndPaymentTabValueChangeHandler = (event, newValue) => {
    setCommitmentAndPaymentTabValue(newValue);
    setValue([
      { paymentTab: newValue }
    ]);

  };

  const [paymentAmount, setPaymentAmount] = useState('');
  const [
    commitmentAndPaymentCommitmentDate,
    setCommitmentAndPaymentCommitmentDate,
  ] = useState(new Date());
  const [
    commitmentAndPaymentCommitmentValidity,
    setCommitmentAndPaymentCommitmentValidity,
  ] = useState(new Date());
  const onChangePaymentAmountHandler = (event) => {
    if (checkCurrencyFormat(event.target.value))
      setPaymentAmount(event.target.value);
  };

  const onBlurPaymentAmountHandler = (event) => {
    const format = formatToCurrency(event.target.value);
    setValue('paymentAmount', format);
    setPaymentAmount(formatToCurrency(format));
  };

  // Commitment And Payment - functions
  const validateDate = (date, type) => {
    switch (type) {
      case 'before':
        return moment(date).isSameOrBefore(moment(), 'day');

      case 'after':
        return moment(date).isSameOrAfter(moment(), 'day');

      default:
        return false;
    }
  };
  const dateOnChangeHandler = (date, valueName, set) => {
    try {
      setValue(valueName, date, true);
      set(date);
    } catch (e) {
      console.log('Error: ' + e);
    }
  };
  const [HMO, setHMO] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const Organization = await FHIR('Organization', 'doWork', {
          functionName: 'readOrganization',
          functionParams: {
            OrganizationId: managingOrganization,
          },
        });
        const normalizedOrganization = normalizeFhirOrganization(
          Organization.data,
        );
        setHMO(normalizedOrganization);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [managingOrganization]);

  useEffect(() => {
    register({ name: 'questionnaireId' });
    register({ name: 'questionnaire' });
    register({ name: 'questionnaireResponse' });
    if (isCommitmentForm !== '1') {
      register({ name: 'paymentMethod' });
      register({ name: 'paymentAmount' });
      register({ name: 'receiptNumber' });
    }
    register({ name: 'paymentTab' });
    setValue({ paymentTab: commitmentAndPaymentTabValue })
    register({ name: 'exemptionReason' });
    register({ name: 'noPaymentComment' });

    (async () => {
      try {
        const questionnaire = await FHIR('Questionnaire', 'doWork', {
          functionName: 'getQuestionnaire',
          functionParams: { QuestionnaireName: 'commitment_questionnaire' },
        });
        if (questionnaire.data.total) {
          setValue('questionnaireId', questionnaire.data.entry[1].resource.id);
          setValue('questionnaire', questionnaire.data.entry[1].resource);
          const questionnaireResponseData = await FHIR(
            'QuestionnaireResponse',
            'doWork',
            {
              functionName: 'getQuestionnaireResponse',
              functionParams: {
                patientId: pid,
                encounterId: eid,
                questionnaireId: questionnaire.data.entry[1].resource.id,
              },
            },
          );
          if (questionnaireResponseData.data.total !== 0) {
            const normalizedQuestionnaireResponse = normalizeFhirQuestionnaireResponse(
              questionnaireResponseData.data.entry[1].resource,
            );
            if (normalizedQuestionnaireResponse.items.length) {
              setValue(
                'questionnaireResponse',
                normalizedQuestionnaireResponse.id || '',
              );

              const commitmentDate = normalizedQuestionnaireResponse.items.find(
                (item) => item.text === 'Commitment date',
              );
              const commitmentValidity = normalizedQuestionnaireResponse.items.find(
                (item) => item.text === 'Commitment expiration date',
              );
              if (commitmentDate && typeof commitmentDate.answer !== 'undefined') {
                setCommitmentAndPaymentCommitmentDate(
                  moment(commitmentDate.answer[0].valueDate),
                );
              }
              if (commitmentValidity && typeof commitmentValidity.answer !== 'undefined') {
                setCommitmentAndPaymentCommitmentValidity(
                  moment(commitmentValidity.answer[0].valueDate),
                );
              }
              const commitmentAndPaymentReferenceForPaymentCommitment = ParseQuestionnaireResponseInt(normalizedQuestionnaireResponse, 1)|| '';
              const commitmentAndPaymentDoctorsName = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '4') || '';
              const commitmentAndPaymentDoctorsLicense = ParseQuestionnaireResponseInt(normalizedQuestionnaireResponse, 5)|| '';
              /*initValueFunction([
                {
                  commitmentAndPaymentReferenceForPaymentCommitment:
                    commitmentAndPaymentReferenceForPaymentCommitment || '',
                },
                {
                  commitmentAndPaymentDoctorsName:
                    commitmentAndPaymentDoctorsName || '',
                },
                {
                  commitmentAndPaymentDoctorsLicense:
                    commitmentAndPaymentDoctorsLicense || '',
                },
              ]);*/

              const paymentAmount = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '6');
              const paymentMethod = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '7');
              const receiptNumberResult = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '8');
              initValueFunction([
                {
                  paymentAmount: paymentAmount || '',
                },
                {
                  paymentMethod: paymentMethod || '',
                },
                {
                  questionnaireResponse:
                    normalizedQuestionnaireResponse.id || '',
                },
                {
                  receiptNumber: receiptNumberResult || '',
                },
              ]);
              if (paymentMethod) {
                setPaymentMethod(paymentMethod);
              }
              if (paymentAmount) {
                setPaymentAmount(paymentAmount);
              }
              if (receiptNumberResult) {
                setReceiptNumber(receiptNumberResult)
              }

              const exemptionReason = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '9');
              const noPaymentCommentResult = ParseQuestionnaireResponseText(normalizedQuestionnaireResponse, '10');

              initValueFunction([
                {
                  exemptionReason: exemptionReason || '',
                },
                {
                  noPaymentComment: noPaymentCommentResult || '',
                }
              ])
              if (exemptionReason) {
                setNoPaymentReason(exemptionReason);
              }
              if (noPaymentCommentResult) {
                setNoPaymentComment(noPaymentCommentResult)
              }

              /* active tab */
              let activeTab = getActiceTab(commitmentAndPaymentReferenceForPaymentCommitment, paymentAmount, exemptionReason || noPaymentCommentResult)
              setCommitmentAndPaymentTabValue(activeTab);
              initValueFunction([
                { paymentTab: activeTab }
              ])
            }


            handleLoading('payment');
          } else {
            handleLoading('payment');
          }
        } else {
          handleLoading('payment');
        }
      } catch (error) {
        console.error(error);
        handleLoading('payment');
      }
    })();
    return () => {
      if (isCommitmentForm !== '1') {
        unregister(['paymentMethod', 'paymentAmount']);
      }
      unregister(['questionnaireId', 'questionnaireResponse']);
    };
  }, [setValue, pid, eid, isCommitmentForm, register, unregister]);

  const getActiceTab = (HMOtab, paymentTab, noPaymentTab) => {
      if (HMOtab !== undefined && HMOtab.length > 0 ) return 'HMO';
      if (paymentTab !== undefined && paymentTab.length > 0 ) return 'Private';
      if (noPaymentTab!== undefined && noPaymentTab.length > 0 ) return 'noPayment';
      return defaultPaymentTab;
  }

  const changeNoPayment = (event) => {
    console.log(event.target.value)
    setNoPaymentReason(event.target.value)
    setValue('exemptionReason', event.target.value)
  }

  const changeNoPaymentComment  = (event) => {
    setNoPaymentComment(event.target.value)
    setValue('noPaymentComment', event.target.value)
  }

  const changeReceiptNumber = (event) => {
    setReceiptNumber(event.target.value);
    setValue('receiptNumber', event.target.value)
  }

  return (
    <StyledFormGroup>
      <Title
        fontSize={'18px'}
        color={'#000b40'}
        label={t('Commitment and payment')}
        bold
      />
      <Title
        fontSize={'14px'}
        color={'#000b40'}
        label={t(
          `Please fill in the payer details for the current ${
            isCommitmentForm === '1' ? 'test' : 'visit'
          }`,
        )}
      />
      <StyledDivider variant='fullWidth' />
      {/* Commitment and payment - tabs */}
      <Tabs
        value={commitmentAndPaymentTabValue}
        onChange={setCommitmentAndPaymentTabValueChangeHandler}
        indicatorColor='primary'
        textColor='primary'
        variant='standard'
        aria-label='full width tabs example'>
        {isCommitmentForm === '1' ? (
          <Tab label={t('HMO')} value={'HMO'} />
        ) : (
          <Tab label={t('Private')} value={'Private'} />
        )}
        <Tab label={t('No payment')} value={'noPayment'} />
        {/* <Tab label={t('insurance company')} /> */}
      </Tabs>
      <TabPanel value='Private' selectedValue={commitmentAndPaymentTabValue}>
        <CustomizedTextField
          width={'70%'}
          name='paymentAmount'
          onChange={onChangePaymentAmountHandler}
          onBlur={onBlurPaymentAmountHandler}
          disabled={!writePermission}
          value={paymentAmount}
          label={t('Payment amount')}
          InputProps={{
            autoComplete: 'off',
          }}
        />
        <Grid
          container
          direction='row'
          justify={'flex-start'}
          alignItems={'center'}
          style={{ margin: '24px 0 24px 0' }}>
          <span>{t('Payment method')}</span>
          <StyledToggleButtonGroup
            value={paymentMethod}
            onChange={paymentMethodHandler}
            disabled={!writePermission}
            exclusive
            aria-label='Payment method'>
            <StyledToggleButton value='Cash' aria-label='Cash'>
              {t('Cash')}
            </StyledToggleButton>
            <StyledToggleButton value='Credit card' aria-label='Credit card'>
              {t('Credit Card')}
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Grid>
        <CustomizedTextField
          name='receiptNumber'
          width={'70%'}
          value={receiptNumber}
          onChange={changeReceiptNumber}
          label={t('Receipt number')}
          InputLabelProps={{
            shrink: true
          }}
          InputProps={{
            autoComplete: 'off'
          }}
        />
      </TabPanel>
      <TabPanel value='noPayment' selectedValue={commitmentAndPaymentTabValue}>
            <CustomizedTextField
              select
              value={noPaymentReason}
              iconColor='#1976d2'
              width='70%'
              label={t('Exemption reason')}
              onChange={changeNoPayment}
              InputLabelProps={{
                shrink: true
              }}
              inputProps={{
                autoComplete: 'off'
              }}
              >
              {noPaymentReasonsList.map((value, index) => (
                  <MenuItem key={index} value={value.code}>
                    {t(value.name)}
                  </MenuItem>
              ))}
            </CustomizedTextField>
        <CustomizedTextField
          name='noPaymentComment'
          width={'70%'}
          value={noPaymentComment}
          onChange={changeNoPaymentComment}
          label={t('Comment')}
          InputLabelProps={{
            shrink: true
          }}
          inputProps={{
            autoComplete: 'off'
          }}
        />
      </TabPanel>
      <TabPanel value='HMO' selectedValue={commitmentAndPaymentTabValue}>
        <CustomizedTextField
          width={'70%'}
          value={HMO.name || ''}
          label={t('HMO')}
          id={'commitmentAndPaymentHMO'}
          disabled
        />
        <CustomizedTextField
          width={'70%'}
          name='commitmentAndPaymentReferenceForPaymentCommitment'
          label={`${t('Reference for payment commitment')} *`}
          inputRef={register}
          id={'commitmentAndPaymentReferenceForPaymentCommitment'}
          type='number'
          disabled={!writePermission}
          InputLabelProps={{ shrink: true }}
          error={
            requiredErrors.commitmentAndPaymentReferenceForPaymentCommitment
              ? true
              : false
          }
          helperText={
            requiredErrors.commitmentAndPaymentReferenceForPaymentCommitment
          }
          InputProps={{
            autoComplete: 'off',
          }}
        />
        <Controller
          name='commitmentAndPaymentCommitmentDate'
          rules={{
            validate: {
              value: (value) => validateDate(value, 'before'),
            },
          }}
          disabled={!writePermission}
          defaultValue={commitmentAndPaymentCommitmentDate}
          control={control}
          as={
            <MuiPickersUtilsProvider
              utils={MomentUtils}
              moment={moment}
              libInstance={moment}>
              <CustomizedKeyboardDatePicker
                disableToolbar
                autoOk
                variant='inline'
                allowKeyboardControl={true}
                format={formatDate}
                margin='normal'
                id='commitmentAndPaymentCommitmentDate'
                label={`${t('Commitment date')} *`}
                value={commitmentAndPaymentCommitmentDate}
                onChange={(date) =>
                  dateOnChangeHandler(
                    date,
                    'commitmentAndPaymentCommitmentDate',
                    setCommitmentAndPaymentCommitmentDate,
                  )
                }
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                error={errors.commitmentAndPaymentCommitmentDate && true}
                helperText={
                  errors.commitmentAndPaymentCommitmentDate &&
                  t('An equal date or less than today must be entered')
                }
              />
            </MuiPickersUtilsProvider>
          }
        />
        <Controller
          name='commitmentAndPaymentCommitmentValidity'
          control={control}
          rules={{
            validate: {
              value: (value) => validateDate(value, 'after'),
            },
          }}
          defaultValue={commitmentAndPaymentCommitmentValidity}
          disabled={!writePermission}
          as={
            <MuiPickersUtilsProvider utils={MomentUtils} moment={moment}>
              <CustomizedKeyboardDatePicker
                disableToolbar
                allowKeyboardControl={true}
                autoOk
                variant='inline'
                format={formatDate}
                margin='normal'
                id='commitmentAndPaymentCommitmentValidity'
                label={`${t('Commitment validity')} *`}
                value={commitmentAndPaymentCommitmentValidity}
                onChange={(date) =>
                  dateOnChangeHandler(
                    date,
                    'commitmentAndPaymentCommitmentValidity',
                    setCommitmentAndPaymentCommitmentValidity,
                  )
                }
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                error={errors.commitmentAndPaymentCommitmentValidity && true}
                helperText={
                  errors.commitmentAndPaymentCommitmentValidity &&
                  t('An equal or greater date must be entered than today')
                }
              />
            </MuiPickersUtilsProvider>
          }
        />
        <CustomizedTextField
          width={'70%'}
          name='commitmentAndPaymentDoctorsName'
          label={`${t('Doctors name')} *`}
          inputRef={register}
          disabled={!writePermission}
          id={'commitmentAndPaymentDoctorsName'}
          InputLabelProps={{ shrink: true }}
          error={requiredErrors.commitmentAndPaymentDoctorsName ? true : false}
          helperText={requiredErrors.commitmentAndPaymentDoctorsName || ''}
        />
        <CustomizedTextField
          width={'70%'}
          label={`${t('Doctors license')} *`}
          name='commitmentAndPaymentDoctorsLicense'
          inputRef={register}
          disabled={!writePermission}
          id={'commitmentAndPaymentDoctorsLicense'}
          type='number'
          InputLabelProps={{
            shrink: true
          }}
          InputProps={{
            autoComplete: 'off'
          }}
          error={
            requiredErrors.commitmentAndPaymentDoctorsLicense ? true : false
          }
          helperText={requiredErrors.commitmentAndPaymentDoctorsLicense || ''}
        />
      </TabPanel>
    </StyledFormGroup>
  );
};


const mapStateToProps = (state) => {
  return {
    noPaymentReasonsValueset: state.listsBox.no_payment_reasons,
  };
};

export default connect(mapStateToProps)(Payment);
