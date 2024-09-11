import { EventEmitter } from 'events';

export class TrackerEmitter<T> {
    private readonly emitter: EventEmitter;
    private eventName: string;

    constructor(eventName: string = 'TrackerEmitterEmitter') {
        this.emitter = new EventEmitter();
        this.eventName = eventName;
    }

    public getTracker(): TrackerListener<T> {
        return new TrackerListener<T>(this.emitter, this.eventName);
    }

    public emit(data: T): void {
        this.emitter.emit(this.eventName, data);
    }
}

export class TrackerListener<T> {
    public readonly stopListening: () => void;
    private readonly data: T[] = [];
    private readonly trackerFn: (data: T) => void;

    constructor(emitter: EventEmitter, eventName: string) {
        this.trackerFn = (data) => {
            this.data.push(data);
        };
        this.stopListening = () => emitter.off(eventName, this.trackerFn);
        emitter.on(eventName, this.trackerFn);
    }

    public getData(): readonly T[] {
        return this.data;
    }

    public clear(): readonly T[] {
        const result = [...this.data];
        this.data.length = 0;
        return result;
    }
}
