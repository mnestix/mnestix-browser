import '@testing-library/jest-dom'
import { render } from '@testing-library/react';
import { DummyComponent } from 'app/[locale]/viewer/_components/DummyComponent';

describe('DummyComponent', () => {
    it('renders the DummyComponent', () => {
        render(<DummyComponent/>)
    })
})