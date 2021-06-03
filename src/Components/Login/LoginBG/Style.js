import styled from 'styled-components';

const StyledBG = styled.div`
  display: flex;
  min-width: 47%;
  position: relative;
  height: 100vh;
  background-image: url(${(props) => (props.url) });
`;

export default StyledBG;

export const CenteredText = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  top: 50%;
  left: 58%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  & > .MuiTypography-h1 {
    font-size: 45px;
    line-height: 1.55;
    letter-spacing: -0.75px;
  }
  & > .MuiTypography-h2 {
    font-weight: bold;
    font-size: 90px;
    letter-spacing: 16px;
  }
  & > .MuiTypography-h3 {
    font-size: 24px;
  }
`;

export const BGImage = styled.img`
  object-fit: cover;
`;
