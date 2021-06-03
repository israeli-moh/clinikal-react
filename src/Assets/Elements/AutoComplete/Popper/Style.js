import styled from "styled-components";
import Popper from "@material-ui/core/Popper";

export const StyledPopper = styled(Popper)`
  ul {
    direction: ${(props) =>
  props.direction ? `${props.direction} !important` : 'ltr'};
  }
  
`;