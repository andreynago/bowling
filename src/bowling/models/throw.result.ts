export default class ThrowResult {
    public frameID: number;
    public knockDownPinIds: Array<number>
    public throwNumber: number;

    constructor(frameID: number, knockDownPins:  Array<number>, throwNumber: number) {
        this.frameID = frameID;
        this.knockDownPinIds = knockDownPins;
        this.throwNumber = throwNumber;
    }
}
