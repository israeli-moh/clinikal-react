import styled from 'styled-components';
import { devicesValue } from 'Assets/Themes/BreakPoints';
import { Divider, Chip, Button } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

export const StyledButton = styled(Button)`
  border-radius: 25px;
  height: 50px;
  width: 158px;
  letter-spacing: ${({ letterSpacing }) => letterSpacing || null};
  font-weight: ${({ fontWeight }) => fontWeight || null};
  .MuiButton-startIcon {
    margin-left: 8px;
  }
`;

export const StyledDivider = styled(Divider)`
  margin: 10px 0 40px 0;
`;

export const StyledAutoComplete = styled(Autocomplete)`
   //how to disabled the browser autocomplete and autofill - https://github.com/mui-org/material-ui/blob/85cc6e5824108a8a1513ae17f5f0bc0b15d1f1bf/docs/src/pages/components/autocomplete/autocomplete.md#autocompleteautofill
  .MuiFormControl-root .MuiInputBase-root {
    padding-right: 0;
  }
`;

export const StyledForm = styled.form`
  margin: 0px 55px 0 55px;
  width: calc(100% - 110px);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

export const StyledPatientDetails = styled.div`
  position: relative;
  display: flex;
  flex-basis: 70%;
  box-shadow: 0 1px 10px 0 rgba(152, 151, 151, 0.3);
  background-color: #ffffff;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0 25px 0 25px;
  z-index: ${(props) => (props.edit ? '0' : '2')};
  height: calc(100vh - 88px - 32px);
  margin: 120px 38px 0 38px;
  overflow-y: ${(props) => (!props.loading ? 'scroll' : 'hidden')};
  @media (min-width: ${devicesValue.desktop}px) {
    flex-basis: 50%;
  }
  input[type='file'] {
    display: none;
  }
`;

export const StyledChip = styled(Chip)`
  max-width: fit-content;
  background-color: rgba(0, 58, 199, 0.13);
  margin: 0 14px 14px 14px;
  .MuiChip-deleteIcon {
    margin: 0;
    color: #000b40;
  }
  .MuiChip-label {
    font-size: 13px;
    color: #000b40;
  }
`;

export const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px 0 50px 0;
`;
