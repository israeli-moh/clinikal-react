import styled from 'styled-components';
import { devicesValue } from 'Assets/Themes/BreakPoints';

export const TableRowStyle = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${devicesValue.desktop}px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

export const StyledFilterBox = styled.div`
  display: flex;
  align-items: center;
  margin: 35px 24px 35px 24px;

  & .MuiListItemText-root span {
    color: #000d37;
    font-weight: unset;
    font-stretch: normal;
    font-style: normal;
  }
`;

export default styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f6f6f6;
  padding-right: 87px;
  padding-left: 87px;
  padding-top: 56px;
  min-height: calc(100vh - 88px);
  @media (min-width: ${devicesValue.desktop}px) {
    padding-right: 0;
    padding-left: 0;
  }
`;

export const StyledTitle = styled.div`
  margin: 0px 32px 0px 32px;
  width: 304px;
  height: 38px;
`;
