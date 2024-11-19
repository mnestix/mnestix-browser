import { CustomRender } from 'test-utils/CustomRender';
import { screen } from '@testing-library/react';
import { expect } from '@jest/globals';
import { Map } from 'ol';
import { AddressPerLifeCyclePhase, ProductJourney } from './ProductJourney';
import { ProductLifecycleStage } from 'lib/enums/ProductLifecycleStage.enum';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ResizeObserver {
    observe() {}
    unobserve() {}
}
//window.ResizeObserver = ResizeObserver;
window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

const firstAdress: AddressPerLifeCyclePhase =
    { address:
            { street:'teststreet', cityTown:'testtowm', country: 'testcountry',
                latitude: 52.321705475489594, longitude: 9.811600807768746 },
        lifeCyclePhase: ProductLifecycleStage.A3Production
    };
const secondAdress: AddressPerLifeCyclePhase =
    { address:
         { street:'teststreet', cityTown:'testtowm', country: 'testcountry',
           latitude: 48.36854557956184, longitude: 10.93445997546203 },
        lifeCyclePhase: ProductLifecycleStage.B6UsageEnergy
    }

describe('ProductJourney', () => {
    it('renders the ProductJourney', async () => {

        CustomRender(<ProductJourney addressesPerLifeCyclePhase={[firstAdress, secondAdress]} />);
        const map = screen.getByTestId('test-map');
        expect(map).toBeDefined();
        expect(map).toBeInTheDocument();

        const addressList = screen.getByTestId('test-address-list');
        expect(addressList).toBeDefined();
        expect(addressList).toBeInTheDocument();
    });

    it('shows positions on the map', async () => {

        CustomRender(<ProductJourney addressesPerLifeCyclePhase={[firstAdress, secondAdress]} />);

        const map = screen.getByTestId('test-map');
        expect(map).toBeDefined();
        expect(map).toBeInTheDocument();

        const olMap: Map = map;
        expect(olMap).toBeDefined();
       // expect(olMap.getView()).toBeDefined();
        expect(olMap.getLayers()).toBeDefined();
    });
});
