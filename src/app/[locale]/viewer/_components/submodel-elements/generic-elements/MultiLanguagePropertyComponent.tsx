import { Link, Typography } from '@mui/material';
import { getTranslationText } from 'lib/util/SubmodelResolverUtil';
import { useIntl } from 'react-intl';
import { MultiLanguageProperty } from '@aas-core-works/aas-core3.0-typescript/types';
import { isValidUrl } from 'lib/util/UrlUtil';
import { OpenInNew } from '@mui/icons-material';

type MultiLanguagePropertyComponentProps = {
    readonly mLangProp: MultiLanguageProperty;
};

export function MultiLanguagePropertyComponent(props: MultiLanguagePropertyComponentProps) {
    const { mLangProp } = props;
    const intl = useIntl();
    const value = getTranslationText(mLangProp, intl);

    if (isValidUrl(value)) {
        return (
            <Typography data-testid="mlproperty-content">
                <Link component="a" href={value!} target="_blank" rel="noopener noreferrer">
                    {value}
                    <OpenInNew fontSize="small" sx={{ verticalAlign: 'middle', ml: 1 }} />
                </Link>
            </Typography>
        );
    }
    return <Typography data-testid="mlproperty-content">{value || '-'}</Typography>;
}
