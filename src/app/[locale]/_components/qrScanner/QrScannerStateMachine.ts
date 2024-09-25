enum State {
    Stopped,
    LoadScanner,
    ShowVideo,
    HandleQr,
}

export class QrScannerStateMachine {
    private state_: State = State.Stopped;
    private readonly handleScanCallback: (scanResult: string) => Promise<void>;
    private readonly handleScanError: (error: Error) => void;
    private readonly loadingVideoFailed: () => void;

    get IsStopped() {
        return this.state_ === State.Stopped;
    }

    get IsVideoShown() {
        return this.state_ === State.ShowVideo;
    }

    get IsLoading() {
        return this.state_ === State.LoadScanner || this.state_ === State.HandleQr;
    }

    get IsActive() {
        return this.state_ === State.LoadScanner || this.state_ === State.ShowVideo;
    }

    constructor(
        handleScan: (scanResult: string) => Promise<void>,
        handleScanError: (error: Error) => void,
        loadingVideoFailed: () => void,
    ) {
        this.handleScanCallback = handleScan;
        this.handleScanError = handleScanError;
        this.loadingVideoFailed = loadingVideoFailed;
    }

    startScanner() {
        this.state_ = State.LoadScanner;
    }

    stopScanner() {
        this.state_ = State.Stopped;
    }

    switchToVideoStream(loadingSuccessful: boolean) {
        if (loadingSuccessful) {
            this.state_ = State.ShowVideo;
        } else {
            this.loadingVideoFailed();
            this.state_ = State.Stopped;
        }
    }

    async handleScan(scanResult: string) {
        this.state_ = State.HandleQr;
        try {
            await this.handleScanCallback(scanResult);
            this.state_ = State.Stopped;
        } catch (e) {
            this.handleScanError(e);
            this.state_ = State.LoadScanner;
        }
    }
}
