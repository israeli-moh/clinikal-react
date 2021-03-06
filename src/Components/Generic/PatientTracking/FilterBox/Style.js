import styled from 'styled-components';

export const StyledCustomizedSelect = styled.div`
  display: flex;
  margin: 0px 10px 0px 10px;

  & > .MuiListItemText-root {
    height: 22px;
  }
`;

export default styled.div`
  display: flex;
  align-items: center;

  & .MuiListItemText-root span {
    color: #000b40;
    font-weight: unset !important;
    font-stretch: normal;
    font-style: normal;
  }

  button.MuiIconButton-root {
    padding: 5px;
  }
`;
