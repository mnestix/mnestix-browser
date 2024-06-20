import { PropsWithChildren } from 'react';
import 'moment/locale/de';
import { defaultLanguage, translationLists } from './localization';
import moment from 'moment';
import { IntlProvider } from 'react-intl';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

moment.locale(defaultLanguage);

// Configures and injects the internationalization context.
export function Internationalization(props: PropsWithChildren<unknown>) {
    return (
        <LocalizationProvider dateAdapter={AdapterMoment} dateLibInstance={moment} adapterLocale={defaultLanguage}>
            <IntlProvider
                defaultLocale={defaultLanguage}
                locale={defaultLanguage}
                messages={translationLists[defaultLanguage]}
            >
                {props.children}
            </IntlProvider>
        </LocalizationProvider>
    );
}
