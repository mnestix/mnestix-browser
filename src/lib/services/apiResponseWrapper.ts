export class ApiResponseWrapper<T> {
    result: T
    private errorCode: number
    private unknownError = false

    constructor(result: T | null, errorCode?: number) {
        if (result === null) {
            this.unknownError = true
        } else {
            this.result = result
        }
        this.errorCode = errorCode ?? 200
    }

    public isSuccess() {
        return !this.unknownError && this.errorCode >= 200 && this.errorCode < 300
    }
}