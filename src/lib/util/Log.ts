import { TrackerEmitter, TrackerListener } from 'lib/util/tracker';

export class Log {
    private tracker: TrackerEmitter<unknown>;

    private constructor(private console: Console) {
        this.tracker = new TrackerEmitter();
    }

    static create() {
        return new Log(console);
    }

    static createNull() {
        return new Log(new NulledLog());
    }

    public log(message?: unknown, ...optionalParams: unknown[]): void {
        this.console.log(message, ...optionalParams);
        this.tracker.emit({ level: 'normal', message: message });
    }

    public warn(message?: unknown, ...optionalParams: unknown[]): void {
        this.console.log(message, ...optionalParams);
        this.tracker.emit({ level: 'warning', message: message });
    }

    public getTracker(): TrackerListener<unknown> {
        return this.tracker.getTracker();
    }
}

export interface LogEntry {
    level: string;
    message: string;
}

class NulledLog implements Console {
    private logs: LogEntry[] = [];

    constructor() {}

    assert(value?: unknown, message?: unknown, ...optionalParams: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    clear(): void {
        throw new Error('Method not implemented.');
    }

    count(label?: unknown): void {
        throw new Error('Method not implemented.');
    }

    countReset(label?: unknown): void {
        throw new Error('Method not implemented.');
    }

    debug(message?: unknown, ...optionalParams: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    dir(obj?: unknown, options?: unknown): void {
        throw new Error('Method not implemented.');
    }

    dirxml(...data: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    error(message?: unknown, ...optionalParams: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    group(...label: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    groupCollapsed(...label: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    groupEnd(): void {
        throw new Error('Method not implemented.');
    }

    info(message?: unknown, ...optionalParams: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    log(message?: unknown, ...optionalParams: unknown[]): void {
        this.logs.push({ level: 'normal', message: JSON.stringify(message) });
    }

    table(tabularData?: unknown, properties?: unknown): void {
        throw new Error('Method not implemented.');
    }

    time(label?: unknown): void {
        throw new Error('Method not implemented.');
    }

    timeEnd(label?: unknown): void {
        throw new Error('Method not implemented.');
    }

    timeLog(label?: unknown, ...data: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    timeStamp(label?: unknown): void {
        throw new Error('Method not implemented.');
    }

    trace(message?: unknown, ...optionalParams: unknown[]): void {
        throw new Error('Method not implemented.');
    }

    warn(message?: unknown, ...optionalParams: unknown[]): void {
        this.logs.push({ level: 'warning', message: JSON.stringify(message) });
    }

    Console: console.ConsoleConstructor;

    profile(label?: string | undefined): void {
        throw new Error('Method not implemented.');
    }

    profileEnd(label?: string | undefined): void {
        throw new Error('Method not implemented.');
    }
}
