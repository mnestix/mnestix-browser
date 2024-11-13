import '@testing-library/jest-dom'
import { DummyComponent } from 'app/[locale]/viewer/_components/DummyComponent';
import { CustomRender } from 'test-utils/CustomRender';

describe('DummyComponent', () => {
    it('renders the DummyComponent', async () => {
        CustomRender(
            <DummyComponent/>
        )
    })
})