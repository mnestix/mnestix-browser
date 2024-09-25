import { QrScannerStateMachine } from 'app/[locale]/_components/qrScanner/QrScannerStateMachine';
import Semaphore from 'ts-semaphore';

describe('QrScannerStateMachine', () => {
    it('Init StateMachine in the off state', async () => {
        const state = new QrScannerStateMachine(
            async (_) => {},
            (_) => {},
            () => {},
        );

        expectScannerStopped(state);
    });
    it('Switch StateMachine to Loading on start', async () => {
        const fn = jest.fn();

        const state = new QrScannerStateMachine(
            async (_) => {},
            (_) => {},
            fn,
        );

        state.startScanner();

        expectScannerStarted(state);
    });
    it('Video loading finished successful', async () => {
        const fn = jest.fn();

        const state = new QrScannerStateMachine(
            async (_) => {},
            (_) => {},
            fn,
        );

        state.startScanner();
        state.switchToVideoStream(true);

        expectScannerVideo(state);
        expect(fn).not.called;
    });
    it('Get notified when video loading finished with an error', async () => {
        const fn = jest.fn();

        const state = new QrScannerStateMachine(
            async (_) => {},
            (_) => {},
            fn,
        );

        state.startScanner();
        state.switchToVideoStream(false);

        expectScannerStopped(state);
        expect(fn).calledOnce;
    });
    it('Handle a good scanResult and stop the QrScanner', async () => {
        const callbackFn = jest.fn(async (_: string) => {});
        const errorFn = jest.fn();

        const state = new QrScannerStateMachine(callbackFn, errorFn, () => {});

        state.startScanner();
        state.switchToVideoStream(true);
        await state.handleScan('Hello, world!');

        expectScannerStopped(state);
        expect(callbackFn).called;
        expect(errorFn).not.called;
    });
    it('Handle a bad scanResult, get notified and restart the QrScanner', async () => {
        const callbackFn = jest.fn(async (_: string) => {
            throw new Error('Hello, error!');
        });
        const errorFn = jest.fn();

        const state = new QrScannerStateMachine(callbackFn, errorFn, () => {});

        state.startScanner();
        state.switchToVideoStream(true);
        await state.handleScan('Hello, world!');

        expectScannerStarted(state);
        expect(callbackFn).called;
        expect(errorFn).called;
    });
    it('Switch to Loading, during handling the QrScan', async () => {
        const semaphore = new Semaphore(1);
        await semaphore.aquire();

        const state = new QrScannerStateMachine(
            (_) => semaphore.aquire(),
            (_) => {},
            () => {},
        );

        state.startScanner();
        state.switchToVideoStream(true);
        state.handleScan('Hello, world!').catch();

        expectScannerHandling(state);

        semaphore.release();

        expectScannerStopped(state);
    });
});

function expectScannerStopped(state: QrScannerStateMachine) {
    expect(state.IsStopped);
    expect(!state.IsLoading);
    expect(!state.IsVideoShown);
    expect(!state.IsActive);
}

function expectScannerStarted(state: QrScannerStateMachine) {
    expect(state.IsStopped);
    expect(!state.IsLoading);
    expect(!state.IsVideoShown);
    expect(!state.IsActive);
}

function expectScannerVideo(state: QrScannerStateMachine) {
    expect(state.IsStopped);
    expect(!state.IsLoading);
    expect(!state.IsVideoShown);
    expect(!state.IsActive);
}

function expectScannerHandling(state: QrScannerStateMachine) {
    expect(state.IsStopped);
    expect(!state.IsLoading);
    expect(!state.IsVideoShown);
    expect(!state.IsActive);
}
