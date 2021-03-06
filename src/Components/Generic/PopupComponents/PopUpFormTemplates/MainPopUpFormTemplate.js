import Grid from '@material-ui/core/Grid';
import React from 'react';
import { connect } from 'react-redux';
import { StyledRoundButton } from 'Components/Generic/PopupComponents/PopUpFormTemplates/Style';
import { useTranslation } from 'react-i18next';
import PopUpContantList from 'Components/Generic/PopupComponents/PopUpFormTemplates/PopUpContantList';
import PopUpContext from 'Components/Generic/PopupComponents/PopUpFormTemplates/PopUpContext';
import leftIcon from 'Assets/Images/left.png';
import rightIcon from 'Assets/Images/right.png';
import Icon from 'Assets/Elements/Header/Search/Icon';

const MainPopUpFormTemplate = ({
  context,
  setContext,
  defaultContext,
  setDefaultContext,
  templates,
  languageDirection,
  setTemplatesTextReturned,
  handleCloseOperation,
  setTemplateWasSaved,
  name,
}) => {
  const { t } = useTranslation();
  const handleTransferOfContent = () => {
    setContext(context + content);
    setContent('');
    cleanSelection();
  };

  const cleanSelection = () => {
    setChecked([]);
    setCheckAll(false);
  };

  const [content, setContent] = React.useState('');

  const [checkAll, setCheckAll] = React.useState(false);
  const [checked, setChecked] = React.useState([]);
  const handleFirstTimeContext = () => {
    //For future development if we want to show default values

    setContext(`${defaultContext} \r\n ${context}`);
    //setDefaultContext('');
  };

  React.useEffect(() => {
    setContext('');
    if (defaultContext !== '') {
      handleFirstTimeContext();
    }
  }, []);
  return (
    <Grid dir={languageDirection} container spacing={3}>
      <Grid item xs={6}>
        <PopUpContantList
          cleanSelection={cleanSelection}
          checkAll={checkAll}
          setCheckAll={setCheckAll}
          checked={checked}
          setChecked={setChecked}
          setContent={setContent}
          templates={templates}
        />
      </Grid>
      {checked.length > 0 ? (
        <StyledRoundButton
          variant={'contained'}
          color={'primary'}
          fontWeight={'bold'}
          onClick={handleTransferOfContent}>
          <Icon
            alt='transfer content icon'
            img={languageDirection === 'rtl' ? leftIcon : rightIcon}
          />
        </StyledRoundButton>
      ) : null}
      <Grid item xs={6}>
        <PopUpContext
          handleCloseOperation={handleCloseOperation}
          setTemplatesTextReturned={setTemplatesTextReturned}
          name={name}
          context={context}
          setContext={setContext}
          setTemplateWasSaved={setTemplateWasSaved}></PopUpContext>
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
