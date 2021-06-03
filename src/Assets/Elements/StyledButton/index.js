import { Button } from '@material-ui/core';
import styled from 'styled-components';

export const StyledButton = styled(Button)`
  border-radius: 25px;
  height: ${(props) => (props.height ? props.height : '50px')};
  width: ${(props) => (props.width ? props.width : '158px')};
  letter-spacing: ${({ letterSpacing }) => letterSpacing || null};
  font-weight: ${({ fontWeight }) => fontWeight || null};
  font-size: ${({ fontSize }) => fontSize || null};
  margin: ${(props) => props.margin};
  .MuiButton-startIcon {
    margin-left: 8px;
  }
`;
