import React from 'react';
import StyledInputBase from './Style'
import { useTranslation} from "react-i18next";

const SearchInput = (props) => {
    const {t} = useTranslation();

    return (
        <StyledInputBase placeholder={t('Locate patient')} value={props.searchInput}/>
    );
};

export default SearchInput;
