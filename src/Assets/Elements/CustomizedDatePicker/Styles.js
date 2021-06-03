import styled, { createGlobalStyle } from 'styled-components';
import { DatePicker, KeyboardDatePicker } from '@material-ui/pickers';

export const StyledDatePicker = styled(DatePicker)`
  width: 157px;
  height: 22px;
  & .MuiInputBase-root {
    text-align: center !important;
  }
  & .MuiInputBase-root .MuiInput-input {
    text-align: center;
    margin: 0px 2px 0px 2px;
    padding: 0px;
    color: ${(props) => (props.text_color ? props.text_color : null)};
  }
`;

export const StyledKeyboardDatePicker = styled(KeyboardDatePicker)`
  .Mui-required {
    // color: #ff0000;
  }
`;

export const GlobalStyledDatePicker = createGlobalStyle`
  .MuiPopover-paper .MuiPickersCalendarHeader-dayLabel {
    color: #000000;
    font-weight: bold;
    font-size: 16px;
  }

  .MuiPaper-root .MuiPickersCalendarHeader-switchHeader p.MuiTypography-root {
    color: ${(props) => (props.iconColor ? props.iconColor : null)}
  }

  .MuiPaper-root .MuiPickersCalendarHeader-switchHeader span.MuiIconButton-label {
    transform: rotate(${(props) =>
      props.langDirection === 'rtl' ? '180deg' : '0def'});
    color: ${(props) => (props.iconColor ? props.iconColor : null)} !important;
  }
`;
