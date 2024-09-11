declare global {
    interface Window {
        Cypress: {
            scannerCallback: (string) => Promise<void>;
        };
    }
}

export {};
