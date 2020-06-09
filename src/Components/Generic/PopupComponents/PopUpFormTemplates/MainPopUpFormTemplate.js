import Grid from '@material-ui/core/Grid';

import React  from 'react';
import { connect } from 'react-redux';
import { StyledRoundButton, CustomizedPaperHeader } from 'Components/Generic/PopupComponents/PopUpFormTemplates/Style';
import { useTranslation } from 'react-i18next';
import PopUpContantList from './PopUpContantList';
import PopUpContext from './PopUpContext';
import l from 'Assets/Images/l.png';
import Icon from 'Assets/Elements/Header/Search/Icon';



const MainPopUpFormTemplate = ({ templates,languageDirection }) => {
  const { t } = useTranslation();
  const handleTransferOfContent = () =>{
    setContext(context+content);
    setCheckAll(false);
  }
  const [content, setContent] = React.useState("");
  const [context, setContext] = React.useState("");
  const [checkAll, setCheckAll] = React.useState(false);
  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
         <PopUpContantList checkAll={checkAll} setCheckAll={setCheckAll} setContent={setContent} templates={templates}/>
      </Grid>
      <StyledRoundButton  variant={'contained'}
                          color={'primary'}
                          fontWeight={'bold'}
                          onClick={handleTransferOfContent}>
        <Icon alt='transfer content icon' img={l}/>
      </StyledRoundButton>
      <Grid item xs={6}>
         <PopUpContext context={context} setContext={setContext}></PopUpContext>
      </Grid>
    </Grid>
  );
};
const mapStateToProps = (state) => {
  return {
    languageDirection: state.settings.lang_dir,
    formatDate: state.settings.format_date,
    verticalName: state.settings.clinikal_vertical,
  };
};

export default connect(mapStateToProps, null)(MainPopUpFormTemplate);
