import styled from 'styled-components';
import NumberFormat from 'react-number-format';

export const StyledMaskedInput = styled(NumberFormat)`
  text-align: center;
  input {
    text-align: center;
  }

  .MuiInputLabel-shrink {
    transform: translate(37.5px, 5.5px) scale(0.75);
    transform-origin: top left;
  }
`;
