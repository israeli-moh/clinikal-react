import styled from 'styled-components';

const StyledPatientFiles = styled.div`
  display: flex;
  flex-basis: 54%;
  max-width: 54%;
  overflow-y: scroll;
  margin: 120px 0 0 32px;
  height: calc(100vh - 88px - 32px - 32px);
  max-height: calc(100vh - 88px - 32px - 32px);
  flex-direction: column;
  background-color: #ffffff;
  box-shadow: 0 0 10px 0 rgba(152, 151, 151, 0.3);
  overflow-y: scroll;  
  .MuiBox-root {
    direction: ${(props) => (props.dir === 'rtl' ? 'rtl' : 'ltr')};
    padding: 0px 63px 0 63px;
  }
`;

export default StyledPatientFiles;

export const StyledTabContainer = styled.div`
  position: relative;
  background-color: #ffffff;
  width: 100%;
  header {
    background-color: #ffffff;
  }
  .MuiBox-root {
    direction: rtl;
    padding: 31px 21px 34px 21px;
}
`;
