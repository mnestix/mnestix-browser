import { DummyComponent } from 'test-utils/DummyComponent';
import { CustomRender } from 'test-utils/CustomRender';
import { screen } from '@testing-library/react';
import { expect } from '@jest/globals';

describe('DummyComponent', () => {
    it('renders the DummyComponent', async () => {
        CustomRender(<DummyComponent />);
        const text = screen.getByTestId('test-text');
        expect(text).toBeDefined();
        expect(text).toBeInTheDocument();
    });
});
