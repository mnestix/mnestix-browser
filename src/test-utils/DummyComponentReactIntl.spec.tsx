import { screen } from '@testing-library/react';
import { expect } from '@jest/globals';
import { CustomRenderReactIntl } from 'test-utils/CustomRenderReactIntl';
import { DummyComponentReactIntl } from 'test-utils/DummyComponentReactIntl';

describe('DummyComponent', () => {
    it('renders the DummyComponent React Intl', async () => {
        CustomRenderReactIntl(<DummyComponentReactIntl />);
        const text = screen.getByTestId('test-text');
        expect(text).toBeDefined();
        expect(text).toBeInTheDocument();
    });
});
