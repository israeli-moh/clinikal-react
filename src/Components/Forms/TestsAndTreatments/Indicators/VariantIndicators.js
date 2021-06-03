/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param {object} VariantIndicators
 * @returns UI DRAW OF VariantIndicators
 */

import {
  StyledTable,
  StyledVariantForm,
  StyledVarientIndicatorsTR,
} from 'Components/Forms/TestsAndTreatments/Style';
import React from 'react';
import { useTranslation } from 'react-i18next';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import TableCell from '@material-ui/core/TableCell';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { connect } from 'react-redux';

const VariantIndicators = ({ variantIndicators, setFormDirty, language_direction }) => {
  const normalizeMask = (mask, value) => {
    if(mask === '##.#' && !value.includes('.')) {
      return value + '.0';
    }
    return value;
  }

  let rowCounter = 0;
  const { t } = useTranslation();
  if (!variantIndicators) {
    return null;
  } else {
    return (
      <React.Fragment>
        <StyledVariantForm autoComplete='off'>
          <TableContainer component={Paper}>
            <StyledTable language_direction={language_direction}>
              <TableBody>
                {Object.entries(variantIndicators).map(([index, tr]) => {
                  return (
                    <StyledVarientIndicatorsTR key={`variant_tr_${index}`}>
                      {Object.entries(tr).map(([index, value]) => {
                        rowCounter++;
                        return value && value.componentType !== undefined ? (
                          <TableCell key={index}>
                            <value.componentType
                              name={value.name}
                              componenttype={value.componenttype}
                              placeholder={value.placeholder}
                              symbol={value.symbol ? value.symbol : false}
                              mask={value.mask ? value.mask : false}
                              disabled={value.disabled}
                              onChange={value.handleOnChange}
                              onKeyUp={() => setFormDirty(true)}
                              id={value.id + '_' + rowCounter}
                              label={t(value.label)}
                              labelEng={value.label}
                              value={
                                value.disabled && (value.value === '')
                                  ? '-'
                                  : value.disabled && value.mask ? normalizeMask(value.mask, value.value) : value.value
                              }
                              dir={'ltr'}
                              InputProps={{
                                endAdornment: value.symbol && (
                                  <InputAdornment>
                                    <IconButton size={'small'}>
                                      {value.symbol}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />
                          </TableCell>
                        ) : null;
                      })}
                    </StyledVarientIndicatorsTR>
                  );
                })}
              </TableBody>
            </StyledTable>
          </TableContainer>
        </StyledVariantForm>
      </React.Fragment>
    );
  }
};

const mapStateToProps = (state) => {
  return {
    language_direction: state.settings.lang_dir,
  };
};

export default connect(mapStateToProps, null)(VariantIndicators);
