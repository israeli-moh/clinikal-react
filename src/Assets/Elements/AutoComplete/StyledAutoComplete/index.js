import styled from 'styled-components';
import { Autocomplete } from '@material-ui/lab';

export const StyledAutoComplete = styled(Autocomplete)`
  .MuiFormControl-root .MuiInputBase-root {
    padding-right: 0;
  }
  .MuiAutocomplete-endAdornment {
    right: unset;
    left: 0;
  }
  .MuiAutocomplete-input {
    flex-grow: 0.8;
    direction: ${(props) =>
            props.input_direction ? `${props.input_direction}` : 'inherit'};
  }
`;
