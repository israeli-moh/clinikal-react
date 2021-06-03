/**
 * @date - 29/07/2020
 * @author Dror Golan drorgo@matrix.co.il
 * @purpose TestTreatmentRemark - select - holds the test and treatment instruction classifier type.
 * @returns UI Field of the main form.
 */

import { Controller, useFormContext } from 'react-hook-form';
import CustomizedTextField from 'Assets/Elements/CustomizedTextField';
import React, { useEffect, useState } from 'react';
import { FHIR } from 'Utils/Services/FHIR';
import normalizeFhirValueSet from 'Utils/Helpers/FhirEntities/normalizeFhirEntity/normalizeFhirValueSet';
import { useTranslation } from 'react-i18next';
import TestTreatmentLockedText from 'Components/Forms/TestsAndTreatments/Helpers/TestTreatmentLockedText';
import { StyledPopper } from 'Assets/Elements/AutoComplete/Popper/Style';
import {
  StyledHiddenDiv,
  StyledTypographyList,
} from 'Components/Forms/TestsAndTreatments/Style';

import { KeyboardArrowDown } from '@material-ui/icons';
import { StyledAutoComplete } from 'Assets/Elements/AutoComplete/StyledAutoComplete';
import { VirtualizedListboxComponent } from 'Assets/Elements/AutoComplete/VirtualizedListbox';
import { connect } from 'react-redux';
import { store } from 'index';
import { SET_VALUESET } from 'Store/Actions/ListsBoxActions/ListsboxActionTypes';
import Tooltip from '@material-ui/core/Tooltip';
import StyledTooltip from 'Assets/Elements/StyledTooltip';

/**
 *
* @param item
 * @param index
 * @param requiredErrors
 * @returns UI Field of the main form.
 */
const TestTreatmentType = ({
  item,
  index,
  requiredErrors,
  language_direction,
  setRequiredErrors,
}) => {
  const { watch, control, getValues, setValue, register } = useFormContext();
  const { t } = useTranslation();

  const { Instruction } = getValues({ nest: true });
  const [
    collectedTestAndTreatmentsTypeFromFhirObject,
    setCollectedTestAndTreatmentsTypeFromFhirObject,
  ] = useState();

  const test_treatment =
    (Instruction && Instruction[index] && Instruction[index].test_treatment) ||
    item.test_treatment;

  const test_treatment_type =
    (Instruction &&
      Instruction[index] &&
      Instruction[index].test_treatment_type) ||
    item.test_treatment_type;

  const [
    currentTestTreatmentsInstructionsDetails,
    setCurrentTestTreatmentsInstructionsDetails,
  ] = useState([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [popperWidth, setPopperWidth] = useState('125px');
  const [languageDirectionByType, setLanguageDirectionByType] = useState(
    language_direction,
  );
  useEffect(() => {
    (async () => {
      if (!test_treatment) return;
      setCurrentTestTreatmentsInstructionsDetails([]);

      let listsDetails;
      //fetch from redux if exist
      if (store.getState().listsBox.hasOwnProperty(`details_${test_treatment}`)) {
        listsDetails = store.getState().listsBox[`details_${test_treatment}`];
      } else {
        //load and save in redux, if not found list saved 'none' in the listbox(resux state)
        const result = await FHIR('ValueSet', 'doWork', {
          functionName: 'getValueSet',
          functionParams: {
            id: `details_${test_treatment}`,
          },
        })
        let objValueset = {};
        if (result.status === 200 && result.data) {
          objValueset[result.data.id] = listsDetails = result.data;
        } else {
          objValueset[`details_${test_treatment}`] = listsDetails =  'none';
        }
        store.dispatch({ type: SET_VALUESET, valueset: objValueset });

      }


     /* listsDetails.push(
        FHIR('ValueSet', 'doWork', {
          functionName: 'getValueSet',
          functionParams: {
            id: `details_${test_treatment}`,
          },
        }),
      );

      const listsDetailsAfterAwait = await Promise.all(listsDetails);
*/
      setCollectedTestAndTreatmentsTypeFromFhirObject(
        listsDetails !== 'none'
          ? listsDetails.expansion.contains
          : [],
      );

      let detailsObj = [];
      if (
          listsDetails !== 'none'
      )
        listsDetails.expansion.contains.map((data) => {
          const dataNormalized = normalizeFhirValueSet(data);
          detailsObj.push({
            title: dataNormalized.name,
            code: dataNormalized.code,
          });
        });
      setCurrentTestTreatmentsInstructionsDetails(detailsObj);
      setCurrentTitle(listsDetails.title);
      setPopperWidth(
        test_treatment === 'x_ray'
          ? '125px'
          : test_treatment === 'providing_medicine'
          ? '50%'
          : '125px',
      );
      setLanguageDirectionByType(
        test_treatment === 'x_ray' && language_direction === 'ltr'
          ? 'ltr'
          : test_treatment === 'providing_medicine'
          ? 'ltr'
          : 'rtl',
      );
    })();
  }, [test_treatment]);
  const popperWidthFixer = function (props) {
    return (
      <StyledPopper
        direction={languageDirectionByType}
        {...props}
        modifiers={{
          setWidth: {
            enabled: true,
            order: 840,
            fn(data) {
              data.offsets.popper.width = data.styles.width = popperWidth;
              return data;
            },
          },
        }}
        placement='bottom-start'
      />
    );
  };

  const search = (nameKey, myArray) => {
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].code === nameKey) {
        return myArray[i].display;
      }
    }
  };
  return (
    <>
      <StyledHiddenDiv dontDisplay={item.locked}>
        {test_treatment &&
        test_treatment !== '' &&
        currentTestTreatmentsInstructionsDetails &&
        currentTestTreatmentsInstructionsDetails.length > 0 ? (
          <Controller
            onChange={([event, data]) => {
              requiredErrors[index].test_treatment_type = false;
              watch(`Instruction`);
              return data;
            }}
            name={`Instruction[${index}].test_treatment_type`}
            control={control}
            defaultValue={item.test_treatment_type} //needed unless you want a uncontrolled controlled issue on your hands
            as={
              <StyledAutoComplete
                PopperComponent={popperWidthFixer}
                blurOnSelect
                disableClearable
                selectOnFocus
                ListboxComponent={VirtualizedListboxComponent}
                options={collectedTestAndTreatmentsTypeFromFhirObject}
                getOptionSelected={(option, value) => {
                  if (value === '' || value.code === '') return;
                  return option.code === value.code;
                }}
                getOptionLabel={(option) => t(option.display) || ''}
                renderOption={(option) => (
                  <StyledTypographyList noWrap>
                    {t(option.display)}
                  </StyledTypographyList>
                )}
                popupIcon={<KeyboardArrowDown />}
                input_direction={test_treatment === 'providing_medicine' ? 'ltr' : language_direction}
                renderInput={(params) => (
                  <StyledTooltip
                    title={params.inputProps.value}
                    aria-label={params.inputProps.value}>
                    <CustomizedTextField
                      iconColor='#1976d2'
                      fullWidth
                      {...params}
                      label={t(currentTitle)}
                      error={
                        requiredErrors[index] &&
                        requiredErrors[index].test_treatment_type &&
                        requiredErrors[index].test_treatment_type.length
                          ? true
                          : false
                      }
                      helperText={
                        requiredErrors[index] &&
                        requiredErrors[index].test_treatment_type
                          ? requiredErrors[index].test_treatment_type
                          : ''
                      }
                    />
                  </StyledTooltip>
                )}
              />
            }
          />
        ) : null}
      </StyledHiddenDiv>
      {item.locked ? (
        <TestTreatmentLockedText
          label={t(currentTitle)}
          name={`Instruction[${index}].test_treatment`}
          value={
            collectedTestAndTreatmentsTypeFromFhirObject &&
            t(
              search(
                item.test_treatment_type,
                collectedTestAndTreatmentsTypeFromFhirObject,
              ),
            )
          }
        />
      ) : null}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    language_direction: state.settings.lang_dir,
  };
};
export default connect(mapStateToProps, null)(TestTreatmentType);
