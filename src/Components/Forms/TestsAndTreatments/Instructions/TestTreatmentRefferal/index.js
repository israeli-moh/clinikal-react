/**
 * @date - 29/07/2020
 * @author Dror Golan drorgo@matrix.co.il
 * @purpose TestTreatmentReferral - A button ,
 *                                  will create a referral x-ray photography (pdf).
 * @returns UI Field of the main form.
 */
import PDF from 'Assets/Images/pdf.png';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StyledHiddenDiv,
  StyledIconedButton,
} from 'Components/Forms/TestsAndTreatments/Style';
import { Controller, useFormContext } from 'react-hook-form';
import { connect } from 'react-redux';
import openDocumentInANewWindow from 'Utils/Helpers/openDocumentInANewWindow';
import { store } from 'index';
import { createLetter } from 'Utils/Services/API';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirDocumentReference from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirDocumentReference';

/**
 *
 * @param index
 * @returns UI Field of the main form.
 */

const TestTreatmentReferral = ({
  index,
  item,
  encounter,
  language_direction,
  patient,
  currentUser,
  requiredErrors,
  setRequiredErrors,
}) => {
  const { control, watch, getValues, setValue } = useFormContext();
  const { Instruction } = getValues({ nest: true });
  const { t } = useTranslation();

  const test_treatment =
    (Instruction && Instruction[index] && Instruction[index].test_treatment) ||
    item.test_treatment;

  const reason_referance_doc_id =
    (Instruction &&
      Instruction[index] &&
      Instruction[index].reason_referance_doc_id) ||
    item.reason_referance_doc_id;
  const createNewLetter = async () => {
    const { Instruction } = getValues({ nest: true });

    try {
      if (!Instruction[index].test_treatment_type) {
        requiredErrors[index].test_treatment_type = true;
        setRequiredErrors((prevState) => {
          const cloneState = [...prevState];
          cloneState[index]['test_treatment_type'] = t('Value is required');
          return cloneState;
        });
        return;
      }

      let facility = store.getState().settings.facility;
      let owner = currentUser && currentUser.id;

      const xRayDoc = await createLetter({
        letter_type: 'letter_x_ray',
        encounter: encounter && encounter.id,
        patient: patient && patient.id,
        owner: owner,
        facility: facility,
        id: Instruction[index].reason_referance_doc_id,
        x_ray_type: Instruction[index].test_treatment_type,
        name_of_letter: 'Referral for X-ray',
        instructions: Instruction[index].instructions,
        remark: Instruction[index].test_treatment_remark,
      });

      if (xRayDoc.status === 200) {
        let xRayDocData = xRayDoc.data;
        setValue(
          `Instruction[${index}].reason_referance_doc_id`,
          xRayDocData.id,
        );
        openDocumentInANewWindow({
          data: xRayDocData.base64_data,
          contentType: xRayDocData.mimetype,
          name: xRayDocData.file_name,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getLetterIfExists = async (id) => {
    /*
    console.log("Manufacturing of document with id :"+ id)
    */
    if (!id) return;
    const documentReferenceData = await FHIR('DocumentReference', 'doWork', {
      functionName: 'readDocumentReference',
      functionParams: {
        documentReferenceId: id,
      },
    });
    if (documentReferenceData.status === 200) {
      let documentReferenceDataReturned = normalizeFhirDocumentReference(
        documentReferenceData.data,
      );
      openDocumentInANewWindow({
        data: documentReferenceDataReturned.data,
        contentType: documentReferenceDataReturned.contentType,
        name: `x_ray_patient_${patient}.pdf`,
      });
    }
    /*setValue(`Instruction[${index}].reason_referance_doc_id`,xRayDoc)*/
  };
  useEffect(() => {}, [test_treatment]);
  return (
    test_treatment === 'x_ray' && (
      <>
        <Controller
          hidden
          name={`Instruction[${index}].reason_referance_doc_id`}
          defaultValue={reason_referance_doc_id}
          as={<input />}
        />

        <StyledIconedButton
          disabled={encounter.status === 'finished' && typeof reason_referance_doc_id === 'undefined'}
          onClick={
            /* !(reason_referance_doc_id && encounter.status === 'completed') &&*/
            encounter.status === 'finished' && typeof reason_referance_doc_id !== 'undefined'
              ? () => getLetterIfExists(reason_referance_doc_id)
              : createNewLetter
          }
          /* name={`Instruction[${index}].test_treatment_referral`}*/
        >
          <div>
            <img src={PDF} />
          </div>
          <p>{t('Referral for x-ray')}</p>
        </StyledIconedButton>
      </>
    )
  );
};

const mapStateToProps = (state) => {
  return {
    patient: state.active.activePatient,
    encounter: state.active.activeEncounter,
    language_direction: state.settings.lang_dir,
    currentUser: state.active.activeUser,
  };
};
export default connect(mapStateToProps, null)(TestTreatmentReferral);
