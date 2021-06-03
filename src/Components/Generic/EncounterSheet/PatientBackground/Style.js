import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import ListItem from '@material-ui/core/ListItem';

const StyledPatientBackground = styled.div`
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-basis: 25%;
  -ms-flex-preferred-size: 25%;
  flex-basis: 25%;
  max-width: 20%;
  margin: 120px 0px 44px 28px;
  height: calc(100vh - 88px - 32px - 32px);
  max-height: calc(100vh - 88px - 32px - 32px);
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
  box-shadow: 0 0 10px 0 rgba(152, 151, 151, 0.3);
  background-color: #fafbff;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0px 32px 0px 32px;
`;

export default StyledPatientBackground;

export const StyledEncountersTicketsCurrent = styled(Paper)`
  width: 95%;

  border-radius: 10px;
  box-shadow: 1 -4px 25px 6px rgba(151, 151, 152, 0.09);
  background-color: #ffffff;
  margin: 6% 2.5%;
  height: 100%;
  padding: 4% 0;
`;
export const StyledEncountersTicketsOther = styled(Paper)`
  width: 95%;
  height: 100px;
  margin: 6% 2.5%;
  background: transparent;
  padding: 2% 0;
`;

export const StyledCurrentExaminationHeader = styled.div`
  display: flex;
  margin: 20px 9px;
  width: 95%;

  div {
    width: 30%;
    height: 22px;
    font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    -webkit-letter-spacing: normal;
    -moz-letter-spacing: normal;
    -ms-letter-spacing: normal;
    letter-spacing: normal;
    padding-left: ${(props) => (props.dir === 'ltr' ? '0' : '4px')};
    padding-right: ${(props) => (props.dir === 'ltr' ? '4px' : '0')};
    text-align: ${(props) => (props.dir === 'ltr' ? 'left' : 'right')};
    color: #000b40;
  }
  span {
    width: 60%;
    font-size: 16px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    -webkit-letter-spacing: normal;
    -moz-letter-spacing: normal;
    -ms-letter-spacing: normal;
    letter-spacing: normal;
    text-align: ${(props) => (props.dir === 'ltr' ? 'left' : 'right')};
    color: #000b40;
    margin-left: 10%;
    /*white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;*/
  }
`;
export const StyledIconContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 0 3%;
`;
export const StyledCameraIcon = styled.div`
  cursor: ${(props) => (props.canClickEncounter ? 'pointer' : 'not-allowed')};
  width: 50%;
  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    margin: -3px 5px;
    @media (max-width: 1400px) {
      margin: -3px 4px;
    }
  }
  span {
    width: 34px;
    height: 18px;
    font-size: ${(props) => (props.lang === 'en' ? '13px' : '16px')};
    @media (max-width: 1400px) {
      font-size: ${(props) => (props.lang === 'en' ? '11px' : '14px')};
    }
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.13;
    letter-spacing: normal;
    text-align: right;
    color: #000b40;
  }
`;

export const StyledMedicalFileIcon = styled.div`
  cursor: ${(props) => (props.canClickMedical ? 'pointer' : 'not-allowed')};

  img {
    width: 12px;
    height: 14px;
    object-fit: contain;
    margin: -1px 5px;
    @media (max-width: 1400px) {
      margin: -1px 4px;
    }
  }
  span {
    width: 71px;
    height: 18px;
    font-size: ${(props) => (props.lang === 'en' ? '13px' : '16px')};;
    @media (max-width: 1400px) {
      font-size: ${(props) => (props.lang === 'en' ? '11px' : '14px')};
    }
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.13;
    letter-spacing: normal;
    text-align: right;
    color: #000b40;
  }
`;
export const StyledHeader = styled.div`
  margin-top: 48px;
  display: flex;
  label {
    left: 0;
    right: 0;
    bottom: 0;
    content: '\\00a0';
    -webkit-transition: border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1)
      0ms;
    transition: border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    border-bottom: 1px solid #ececec;
    pointer-events: none;
    width: 100%;
    height: 24px;
    font-size: 18px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: right;
    color: #000b40;
  }
  div {
    top: 48px;
    height: 30px;
    font-size: 22px;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    -webkit-letter-spacing: normal;
    -moz-letter-spacing: normal;
    -ms-letter-spacing: normal;
    letter-spacing: normal;
    text-align: right;
    color: #000b40;
    margin-right: 8%;
    margin-left: 19%;
    margin-bottom: 9%;
  }
`;
export const StyledEitanButton = styled(Button)`
  width: 113px;
  height: 32px;
  border-radius: 25px;
  color: #002398;
  span {
    width: 78px;
    height: 20px;
    font-size: 15px;
    font-weight: normal;
    font-stretch: normal;
    font-style: normal;
    line-height: normal;
    letter-spacing: normal;
    text-align: center;
    color: #002398;
  }
`;

export const StyledEncountersContainer = styled.div``;
export const StyledFadeElement = styled(Fade)``;
export const StyledEncounterTicket = styled.div`
  display: ${(props) =>
    props.style.visibility === 'hidden' ? 'none' : 'block'};
`;

export const StyledAllButton = styled(Button)`
  display: ${(props) => (props.show === 'true' ? 'block' : 'none')};
`;

export const StyledListItem = styled(ListItem)`
  margin: -16px 0px;
`;

