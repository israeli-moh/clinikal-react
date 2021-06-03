/**
 * @date - 29/07/2020
 * @author Dror Golan drorgo@matrix.co.il
 * @purpose Fields -  The main component which will hold and render EM Test and Treatment instruction form fields.
 * The fields are :
                                TestTreatment
                                TestTreatmentInstructions
                                TestTreatmentRefferal
                                TestTreatmentRemark
                                TestTreatmentStatus
                                TestTreatmentType
 * @returns Fields of the main form Component.
 */

import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import Grid from '@material-ui/core/Grid';
import TestTreatment from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatment';
import TestTreatmentInstructions from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatmentInstructions';
import {
  StyledCardContent,
  StyledCardDetails,
  StyledCardName,
  StyledCardRoot,
  StyledConstantHeaders,
  StyledIconedButton,
  StyledCardInstruction,
  StyledInstructions,
  StyledTreatmentInstructionsButton,
  StyledTypographyHour,
  StyledTypographyName,
} from 'Components/Forms/TestsAndTreatments/Style';
import TestTreatmentType from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatmentType';
import { connect } from 'react-redux';
import normalizeFhirUser from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirUser';
import PLUS from 'Assets/Images/plus.png';
import { useTranslation } from 'react-i18next';
import TestTreatmentReferral from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatmentRefferal';
import TestTreatMentStatus from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatmentStatus';
import TestTreatmentRemark from 'Components/Forms/TestsAndTreatments/Instructions/TestTreatmentRemark';
import normalizeFhirServiceRequest from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirServiceRequest';
import { Delete } from '@material-ui/icons';
import { FHIR } from 'Utils/Services/FHIR';
import { formatTime }  from 'Utils/Helpers/Datetime/formatDate';
import isAllowed from 'Utils/Helpers/isAllowed';


/**
 *
 * @param encounter
 * @param currentUser
 * @param handlePopUpProps
 * @param requiredErrors
 * @param setRequiredErrors
 * @returns {*}
 * @constructor
 */
const Fields = ({
  serviceRequests,
  encounter,
  currentUser,
  handlePopUpProps,
  requiredErrors,
  setRequiredErrors,
  permission,
  language_direction,
  formatDate
}) => {
  const [practitioners, setPreactitioners] = useState([]);
  const { control, watch, register, setValue, getValues } = useFormContext();
  const { fields, insert, prepend, append, remove } = useFieldArray({
    control,
    name: 'Instruction',
  });
  useEffect(() => {
    (async () => {
      let practitionersTemp = [];
      if (
        serviceRequests &&
        serviceRequests !== '' &&
        serviceRequests.total > 0
      ) {
        let fieldsArray = [];
        await serviceRequests.entry.map((value, index) => {
          if (
            value &&
            value.resource &&
            value.resource.resourceType &&
            value.resource.resourceType === 'ServiceRequest'
          ) {
            const serviceReq = normalizeFhirServiceRequest(value.resource);

            fieldsArray.push(
              createDataFromRecord({ serviceReq, locked: true }),
            );
          } else if (
            value &&
            value.resource &&
            value.resource.resourceType &&
            value.resource.resourceType === 'Practitioner'
          ) {
            const user = normalizeFhirUser(value.resource);

            practitionersTemp[user.id] = user.name.join(' ');
            setPreactitioners(practitionersTemp);
          }
        });
        const fieldsArrayTemp = await Promise.all(fieldsArray);
        fieldsArrayTemp.map((index, value) => {
          setRequiredErrors((prevState) => {
            const cloneState = [...prevState];
            cloneState.unshift({
              test_treatment_type: '',
            });
            return cloneState;
          });
        });
        append(fieldsArrayTemp);
      }
    })();
  }, [serviceRequests]);

  const isAllowAddNewInstruction = () => {
    return isAllowed('add_new_treatment_instruction') === 'write' ? true : false;
  }

  const createDataFromRecord = async ({ serviceReq, locked }) => {
    let serviceReqTemp = {
      occurrence: serviceReq.occurrence,
      authoredOn: serviceReq.authoredOn,
      performer: serviceReq.performer,
      requester: serviceReq.requester,
      test_treatment: serviceReq.instructionCode,
      test_treatment_type: serviceReq.orderDetailCode,
      instructions: serviceReq.patientInstruction,
      test_treatment_status:
        serviceReq.status === 'active' ? 'not_done' : 'done',
      test_treatment_remark: serviceReq.note,
      serviceReqID: serviceReq.id,
      reason_referance_doc_id: serviceReq.reasonReferenceDocId,
      locked: locked,
    };
    return serviceReqTemp;
  };
  const appendInsertData = async ({ serviceReq }) => {
    if (!serviceReq) {
      serviceReq = {};
      serviceReq.occurrence = '';
      serviceReq.authoredOn = '';
      serviceReq.performer = '';
      serviceReq.requester = '';
      serviceReq.instructionCode = '';
      serviceReq.orderDetailCode = '';
      serviceReq.patientInstruction = '';
      serviceReq.status = 'not_done';
      serviceReq.note = '';
      serviceReq.serviceReqID = '';
      serviceReq.reason_referance_doc_id = '';
    }
    if (fields.length > 0) {
      await insert(parseInt(0, 10), {
        occurrence: serviceReq.occurrence,
        authoredOn: serviceReq.authoredOn,
        performer: serviceReq.performer,
        requester: serviceReq.requester,
        test_treatment: serviceReq.instructionCode,
        test_treatment_type: serviceReq.orderDetailCode,
        instructions: serviceReq.patientInstruction,
        test_treatment_status:
          serviceReq.status === 'active' ? 'not_done' : 'done',
        test_treatment_remark: serviceReq.note,
        serviceReqID: serviceReq.id,
        reason_referance_doc_id: serviceReq.reasonReferenceDocId,
      });
    } else {
      await append({
        occurrence: serviceReq.occurrence,
        authoredOn: serviceReq.authoredOn,
        performer: serviceReq.performer,
        requester: serviceReq.requester,
        test_treatment: serviceReq.instructionCode,
        test_treatment_type: serviceReq.orderDetailCode,
        instructions: serviceReq.patientInstruction,
        test_treatment_status:
          serviceReq.status === 'active' ? 'not_done' : 'done',
        test_treatment_remark: serviceReq.note,
        serviceReqID: serviceReq.id,
        reason_referance_doc_id: serviceReq.reasonReferenceDocId,
      });
    }
  };
  let user = normalizeFhirUser(currentUser);

  const addNewInstruction = async () => {
    //prepend has a bug in hookform soI used it like this :

    //1) set the errors in a new error array of errors
    setRequiredErrors((prevState) => {
      const cloneState = [...prevState];
      cloneState.unshift({
        test_treatment_type: '',
      });
      return cloneState;
    });

    //2) if it is the first record do append otherwise do insert this is basically prepend
    if (fields.length > 0) {
      await insert(parseInt(0, 10), {
        occurrence: '',
        authoredOn: '',
        performer: '',
        requester: '',
        test_treatment: '',
        test_treatment_type: '',
        instructions: '',
        test_treatment_status: 'not_done',
        test_treatment_remark: '',
        serviceReqID: '',
        reason_referance_doc_id: '',
        locked: false,
        test_treatment_title: '',
      });
    } else {
      await append({
        occurrence: '',
        authoredOn: '',
        performer: '',
        requester: '',
        test_treatment: '',
        test_treatment_type: '',
        instructions: '',
        test_treatment_status: 'not_done',
        test_treatment_remark: '',
        serviceReqID: '',
        reason_referance_doc_id: '',
        locked: false,
        test_treatment_title: '',
      });
    }
    //3)render all the elements to the screen  with watch
    watch();
  };
  const { t } = useTranslation();

  return (
    <>
      <StyledConstantHeaders>
        {t('Instructions for treatment')}
      </StyledConstantHeaders>
      {permission === 'write' && isAllowAddNewInstruction() &&
      <>
        <StyledTreatmentInstructionsButton
            language_direction={language_direction}
            onClick={addNewInstruction}>
          <img alt='plus icon' src={PLUS}/>
          {t('Instructions for treatment')}
        </StyledTreatmentInstructionsButton>
      </>
      }
      <hr />
      <StyledInstructions id='newRefInstructions'>
        {fields.map((item, index) => {
          //I am missing the data of the include in order to complete username
          return (
            <div key={item.id}>
              <StyledCardRoot>
                <StyledCardInstruction>
                <StyledCardDetails>
                  <StyledCardContent language_direction={language_direction}>
                    <StyledTypographyName component='h5' variant='h5'>
                      <Controller
                        hidden
                        name={`Instruction[${index}].requester`}
                        defaultValue={item.requester === ''
                      ? user.id
                      : item.requester}
                        as={<input />}
                      />
                      {item.requester === ''
                        ? user.name.toString()
                        : practitioners[item.requester]}
                    </StyledTypographyName>
                    <StyledTypographyHour variant='subtitle1' color='primary'>
                      <Controller
                        hidden
                        name={`Instruction[${index}].authoredOn`}
                        defaultValue={item.authoredOn}
                        as={<input />}
                      />
                      {item.locked
                        ? formatTime(item.authoredOn, formatDate)
                        : ''}
                    </StyledTypographyHour>
                  </StyledCardContent>
                  <StyledCardName></StyledCardName>
                </StyledCardDetails>

                <Grid container spacing={4}>
                  <Controller
                    hidden
                    name={`Instruction[${index}].serviceReqID`}
                    defaultValue={item.serviceReqID}
                    onChange={([event]) => {
                      setValue(
                        `Instruction[${index}].serviceReqID`,
                        event.target.value,
                      );
                      return event.target.value;
                    }}
                    as={<input />}
                  />
                  <Grid item xs={3}>
                    <Controller
                      hidden
                      name={`Instruction[${index}].test_treatment_title`}
                      defaultValue={item.test_treatment_title}
                      as={<input />}
                    />

                    <TestTreatment
                      setRequiredErrors={setRequiredErrors}
                      index={index}
                      item={item}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TestTreatmentType
                      requiredErrors={requiredErrors}
                      index={index}
                      item={item}
                      setRequiredErrors={setRequiredErrors}
                    />
                  </Grid>
                  {/*<Grid item xs={2}></Grid>*/}
                  <Grid justify="flex-start" item xs={3}>
                    <TestTreatmentReferral
                      setRequiredErrors={setRequiredErrors}
                      requiredErrors={requiredErrors}
                      index={index}
                      item={item}
                    />
                  </Grid>
                  <Grid container item xs={12}>
                  <TestTreatmentInstructions
                    index={index}
                    item={item}
                    handlePopUpProps={handlePopUpProps}
                  />
                  </Grid>
                </Grid>
              </StyledCardInstruction>
                <StyledCardInstruction>
                <StyledCardDetails>
                  <StyledCardContent language_direction={language_direction}>
                    <StyledTypographyName component='h5' variant='h5'>
                      <Controller
                        hidden
                        name={`Instruction[${index}].performer`}
                        defaultValue={typeof item.performer === "undefined" || item.performer === ''
                          ? user.id
                          : item.performer}
                        as={<input />}
                      />
                      {typeof item.performer === "undefined" || item.performer === ''
                        ? user.name.toString()
                        : practitioners[item.performer]}
                    </StyledTypographyName>
                    <StyledTypographyHour variant='subtitle1' color='primary'>
                      <Controller
                        hidden
                        name={`Instruction[${index}].occurrence`}
                        defaultValue={item.occurrence}
                        as={<input />}
                      />
                      {item.locked && item.test_treatment_status === 'done'
                        ? formatTime(item.occurrence, formatDate)
                        : ''}
                    </StyledTypographyHour>
                  </StyledCardContent>
                  <StyledCardName></StyledCardName>
                </StyledCardDetails>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <TestTreatMentStatus
                      /*  requiredErrors={requiredErrors}*/
                      index={index}
                      item={item}
                      permission={permission}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TestTreatmentRemark index={index} item={item} permission={permission} />
                  </Grid>
                  {!item.locked ? (
                    <Grid container direction='row' justify='flex-end'>
                    <div
                      style={{
                        paddingRight:language_direction === 'ltr' ? '25px' : null,
                        paddingLeft:language_direction === 'rtl' ? '25px' : null,
                        paddingBottom:'25px',
                      }}
                      onClick={async () => {
                    // Since there is no disabled option for icons I check the permission inside the function
                    if (permission !== 'write') return;
                    const { Instruction } = getValues({
                      nest: true,
                    });
                    //console.log(Instruction);
                    if (
                      Instruction &&
                      Instruction[index] &&
                      Instruction[index].serviceReqID &&
                      Instruction[index].serviceReqID !== ''
                    ) {
                      await FHIR('ServiceRequests', 'doWork', {
                        functionName: 'deleteServiceRequest',
                        functionParams: {
                          _id: Instruction[index].serviceReqID,
                        },
                      });
                      delete Instruction[index];
                      setValue('medicationRequest', Instruction);
                    }
                    setRequiredErrors((prevState) => {
                      const cloneState = [...prevState];
                      cloneState.splice(index, 1);
                      return cloneState;
                    });
                    remove(index);
                  }}
                    >
                      <Delete
                        color={permission === 'view' ? 'disabled' : 'primary'}

                        style={{ cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          cursor: 'pointer',
                          color: `${
                            permission !== 'write' && 'rgba(0, 0, 0, 0.26)'
                          }`,
                        }}>
                        {t('Delete Instruction')}
                      </span>
                    </div>
                    </Grid>
                  ) : null}
                </Grid>
              </StyledCardInstruction>
              </StyledCardRoot>
            </div>
          );
        })}
      </StyledInstructions>
    </>
  );
};

/**
 *
 * @param state
 * @returns {{formatDate: any, currentUser: {}, language_direction: any, patient: {}, encounter: {}}}
 */
const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    language_direction: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    currentUser: state.active.activeUser,
  };
};
export default connect(mapStateToProps, null)(Fields);
