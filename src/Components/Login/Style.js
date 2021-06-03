import styled from 'styled-components';
import Chip from '@material-ui/core/Chip';
const StyledLogin = styled.div`
  display: flex;
  width: 100%;
  max-height: 100vh;
  direction: rtl;
`;

export default StyledLogin;

export const StyledErrorChip = styled(Chip)`
  background-color: rgba(255, 230, 237, 0.5);
  border-radius: 24px;
  width: 338px;
  height: 36px;
  color: #000b40;
  text-align: center;
  font-size: 14px;
  direction: ltr;
`;

export const StyledDivider = styled.hr`
  width: 80px;
  height: 2px;
  color: #002398;
  background-color: #002398;
`;

export const LoginTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 96px 0 122px 0;
  @media (max-width: 1400px) {
    margin: 96px 0 96px 0;
  }
  & .MuiTypography-root {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 6px;
    color: #002398;
  }
`;

export const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  padding-right:286px;
  & > .MuiTypography-root {
    font-size: 32px;
    color: #000b40;
  }
  padding-left:150px;
  @media (min-width: 1500px) {
    padding-left:286px;
  }
  direction: ${(props) => (props.dir)};
`;

export const LoginLogo = styled.img`
  object-fit: contain;
`;
