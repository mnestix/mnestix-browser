import '@testing-library/jest-dom'
import { render } from '@testing-library/react';
import { DummyComponent } from 'app/[locale]/viewer/_components/DummyComponent';
import { NextIntlClientProvider } from 'next-intl';

import enMessages from './../../../../locale/en.json';
import deMessages from './../../../../locale/de.json';
import { ReactNode } from 'react';

const messages = {
    en: enMessages,
    es: deMessages
};

export const loadMessages = (locale: string) => {
    return messages[locale] || messages['en'];
};

interface WrapperProps {
    children: ReactNode;
}

const customRender = (ui: ReactNode, { locale = 'en', ...renderOptions } = {}) => {
    const messages = loadMessages(locale)
    // eslint-disable-next-line react/prop-types
    const Wrapper: React.FC<WrapperProps> = ({ children }) => (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );

    return render(ui, { wrapper: Wrapper, ...renderOptions });
};

describe('DummyComponent', () => {
    it('renders the DummyComponent', async () => {
        customRender(
                <DummyComponent/>
        )
    })
})