/**
 * @author Dror Golan drorgo@matrix.co.il
 * @param {object} props
 * @returns masked text ui
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import { StyledMaskedInput } from './Style';
import { StyledVariantTextField } from 'Components/Forms/TestsAndTreatments/Style';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';

/* todo- for now not on used */
function TextMaskCustom(props) {
  const { inputRef, ...other } = props;
  return (
    <StyledMaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      format={other['aria-describedby']}
      dir='ltr'
    />
  );
}

function BloodPressMask(props) {
  const { inputRef, ...other } = props;
  const [format, setFormat] = useState('###/###')
  return (
    <StyledMaskedInput
      {...other}
      ref={(ref) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      onKeyDown={(e) => {
        const n = e.target.value.replace(/\D/g, "").length;
        if (n > 3 ) {
          setFormat("###/###");
        } else {
          setFormat("##/##");
        }
        //delete from 5 to 4
        if(n === 5 && e.keyCode === 8) {
          setFormat("##/##");
        }
      }}
      onKeyUp={(e)=> {
        console.log(e.target.value);
        const n = e.target.value.replace(/\D/g, "").length;
        if (n === 4) {
          setFormat("##/##");
        }
        if (n === 5) {
          setFormat("###/##")
        }
        if (n === 6) {
          setFormat("###/###");
        }
      }}
      format={format}
      dir='ltr'
    />
  );
}



TextMaskCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
};

export default function FormattedInputs({
  componenttype,
  value,
  id,
  onChange,
  onKeyUp,
  label,
  mask,
  placeholder,
  name,
  symbol,
  labelEng
}) {
  function renderSwitch({
    componenttype,
    value,
    onChange,
    onKeyUp,
    id,
    label,
    placeholder,
    mask,
    name,
    symbol,
    labelEng
  }) {
    switch (componenttype) {
      case 'regularMasked':
        return (
          <FormControl>
            <InputLabel htmlFor={`formatted-text-mask-input-${label}-${id}`}>
              {label}
            </InputLabel>
            <Input
              dir={'ltr'}
              value={value && value.replace('.00', '')}
              onChange={onChange}
              onKeyUp={onKeyUp}
              name={`textmask-${label}-${id}`}
              id={`formatted-text-mask-input-${label}-${id}`}
              aria-describedby={mask}
              inputComponent={TextMaskCustom}
            />
          </FormControl>
        );

      case 'textFieldWithMask':
        return (
          <StyledVariantTextField
            InputLabelProps={{
              shrink:true
            }}
            dir={'ltr'}
            label={label}
            value={value}
            onChange={onChange}
            onKeyUp={onKeyUp}
            autoComplete="no"
            name={name}
            type={'text'}
            onInput = {(e) =>{
              if (placeholder && !mask) {
                if(/[a-zA-Z&^*#@]+$/.test(e.target.value)){
                  e.target.value = e.target.value.slice(0, -1);
                }
                e.target.value = e.target.value.substring(0,placeholder.length)
              }
            }}
            id={`formatted-numberformat-input-${label}-${id}`}
            placeholder={placeholder}
            InputProps={{
              'aria-describedby': mask,
              autoComplete:"off",
              // special mask logic for blood press
              inputComponent: mask ? labelEng === 'Blood pressure' ? BloodPressMask : TextMaskCustom : 'input',
              endAdornment: symbol && (
                <InputAdornment>
                  <IconButton size={'small'}>
                    {symbol}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        );

      default:
        return '';
    }
  }

  return renderSwitch({
    componenttype,
    mask,
    placeholder,
    value,
    id,
    onChange,
    onKeyUp,
    label,
    name,
    symbol,
    labelEng
  });

}


