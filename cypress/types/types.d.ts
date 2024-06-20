declare namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            setResolution(res: [number, number] | ViewportPreset): Chainable;
            visitViewer(aasId: string): Chainable;
            getByTestId(dataTestId: string): Chainable;
        }
    }
}
