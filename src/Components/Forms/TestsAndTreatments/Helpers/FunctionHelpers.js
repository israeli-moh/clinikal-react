/**
 * @author Dror Golan drorgo@matrix.co.il
 * purpose : these functions handle click in the ui and other things that are to be taken cared of
 * as requested like : padding a number with zero.
 */

import { StyledVariantTextField } from 'Components/Forms/TestsAndTreatments/Style.js';
import FormattedInputs from 'Assets/Elements/MaskedControllers/FormattedInputs/FormattedInputs';

/**
 *
 * @param evt
 * @param variantIndicators
 * @param setVariantIndicators
 */
export const handleVarientCustomClickFunction = (
  evt,
  variantIndicators,
  setVariantIndicators,
) => {
  const name = evt.target.name;
  const newValue = evt.target.value;
  const valid = evt.target.validity.valid;
  const tempVariantIndicators = { ...variantIndicators };
  tempVariantIndicators[name].value = newValue;
  setVariantIndicators(tempVariantIndicators);
};
/**
 *
 * @param evt
 * @param variantIndicators
 * @param setVariantIndicators
 */
export const handleVarientPaddTheZeroPlaceClickFunction = (
  evt,
  variantIndicators,
  setVariantIndicators,
) => {
  const name = evt.target.name;
  let newValue = evt.target.value;
  const valid = evt.target.validity.valid;
  const tempVariantIndicators = { ...variantIndicators };
  //pad Fever With Zeros
  tempVariantIndicators[name].value = padTheZeroPlace(newValue);
  setVariantIndicators(tempVariantIndicators);
};

/**
 *
 * @param newValue
 * @returns {*}
 */
function padTheZeroPlace(newValue) {
  return newValue;
}
export function explodeMultipleIndicators(
  variantIndicatorsNormalizedData,
  keyOne,
  seperator,
) {
  let keysPlaces = [];
  Object.entries(variantIndicatorsNormalizedData).map(([key, dataset]) => {
    if (dataset && dataset['description'] === keyOne) {
      keysPlaces.push(key);
    }
  });
  if (keysPlaces.length > 0) {
    let variantIndicatorsNormalizedDataTemp = JSON.parse(
      JSON.stringify(variantIndicatorsNormalizedData),
    );
    let indicatorOne = variantIndicatorsNormalizedDataTemp[keysPlaces[0]][
      'description'
    ].split(seperator)[0];
    let indicatorTwo = variantIndicatorsNormalizedDataTemp[keysPlaces[0]][
      'description'
    ].split(seperator)[1];

    variantIndicatorsNormalizedDataTemp[indicatorOne] = {};
    variantIndicatorsNormalizedDataTemp[indicatorTwo] = {};
    Object.entries(variantIndicatorsNormalizedDataTemp[keysPlaces]).map(
      ([key, value]) => {
        let indicatorOneValue = null;
        let indicatorTwoValue = null;
        if (
          variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key] == true ||
          variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key] == false ||
          variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key].indexOf(
            seperator,
          ) < 0
        ) {
          indicatorOneValue =
            variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key];
          indicatorTwoValue =
            variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key];
        } else {
          indicatorOneValue = variantIndicatorsNormalizedDataTemp[
            keysPlaces[0]
          ][key].split(seperator)[0]
            ? variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key].split(
                seperator,
              )[0]
            : variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key];
          indicatorTwoValue = variantIndicatorsNormalizedDataTemp[
            keysPlaces[0]
          ][key].split(seperator)[1]
            ? variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key].split(
                seperator,
              )[1]
            : variantIndicatorsNormalizedDataTemp[keysPlaces[0]][key];
        }

        variantIndicatorsNormalizedDataTemp[indicatorOne][
          key
        ] = indicatorOneValue;
        variantIndicatorsNormalizedDataTemp[indicatorTwo][
          key
        ] = indicatorTwoValue;
      },
    );

    delete variantIndicatorsNormalizedDataTemp[keysPlaces[0]];
    return variantIndicatorsNormalizedDataTemp;
  }
  return variantIndicatorsNormalizedData;
}

export function mergeMultipleIndicators(
  variantIndicatorsNormalizedData,
  keyOne,
  keyTwo,
  seperator,
) {
  let keysPlaces = [];
  Object.entries(variantIndicatorsNormalizedData).map(([key, dataset]) => {
    if (
      dataset &&
      (dataset['description'] === keyOne || dataset['description'] === keyTwo)
    ) {
      keysPlaces.push(key);
    }
  });
  if (keysPlaces.length > 0) {

    let variantIndicatorsNormalizedDataTemp = JSON.parse(
      JSON.stringify(variantIndicatorsNormalizedData),
    );
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['description'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['description']
    }${seperator}${
      variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['description']
    }`;
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['unit'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['unit']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['unit']}`;
    if (
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value'] &&
      variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
    ) {
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value'] = `${
        variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value']
          ? variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['value']
          : ''
      }${seperator}${
        variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
          ? variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['value']
          : ''
      }`;
    }
   /* variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['mask'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['mask']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['mask']}`;*/
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['placeholder'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['placeholder']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['placeholder']}`;
    variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['code'] = `${
      variantIndicatorsNormalizedDataTemp[keysPlaces[0]]['code']
    }${seperator}${variantIndicatorsNormalizedDataTemp[keysPlaces[1]]['code']}`;

    delete variantIndicatorsNormalizedDataTemp[keysPlaces[1]];

    return variantIndicatorsNormalizedDataTemp;
  }
  return variantIndicatorsNormalizedData;
}

/**
 *
 * @param newRow
 * @param dataset
 * @param label
 * @param i
 * @param disabled
 * @param variantIndicatorsNew
 * @param sizeTemp
 * @param key
 */
export function thickenWithDataFunction({
  newRow,
  dataset,
  label,
  i,
  disabled,
  variantIndicatorsNew,
  sizeTemp,
  key,
}) {
  dataset.disabled = disabled;
  dataset.idTemp = i;
  dataset.newRow = newRow;
  dataset.name = dataset.label ? dataset.label : key;
  dataset.value =
    dataset.value && dataset.value !== 0 && dataset.value !== '0.00'
      ? dataset.value
      : variantIndicatorsNew[label]
      ? variantIndicatorsNew[label]
      : '';
  dataset.componentType = disabled ? StyledVariantTextField : FormattedInputs;
  dataset.id = `blood_pressure_${sizeTemp > 0 ? sizeTemp : i}`;
  dataset.componenttype = 'textFieldWithMask';
}
