import { MessageDescriptorWithId } from 'lib/i18n/localization';

export class LocalizedError extends Error {
    descriptor: MessageDescriptorWithId;

    constructor(message: MessageDescriptorWithId) {
        const trueProto = new.target.prototype;
        super();
        Object.setPrototypeOf(this, trueProto);
        this.descriptor = message;
    }
}
