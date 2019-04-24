import Pin from './pin';
import ThrowResult from './throw.result';
import {FRAME_TYPE} from '../consts/bowling.consts';
import {IFrameStatus} from '../interfaces/bowling.interfaces';

export default class Frame {
    _pins: Array<Pin> = [];
    _id: number;
    _throwCounter = 0;
    _throwResults: Array<ThrowResult> = [];
    _frameType: string = FRAME_TYPE.REGULAR;
    _framePoints: number = 0;
    _spireThrowsCounter: number;
    _strikeThrowsCounter: number;

    constructor(id: number, pins: number, spireThrows: number, strikeThrows: number) {
        this.initFrame(pins);
        this._id = id;
        this._spireThrowsCounter = spireThrows;
        this._strikeThrowsCounter = strikeThrows;
    }

    public get Type(): string {
        return this._frameType;
    }

    public get ThrowsNumber(): number {
        return this._throwCounter;
    }

    public get KnockedPinsNumber(): number {
        return this.getPinLocations(true).length;
    }

    public get Points(): number {
        return this._framePoints;
    }

    public get Id(): number {
        return this._id;
    }

    public addPoints(points: number) {
        if (this._frameType === FRAME_TYPE.SPARE && this._spireThrowsCounter > 0) {
            this._framePoints += points;
            this._spireThrowsCounter--;
        }

        if (this._frameType === FRAME_TYPE.STRIKE && this._strikeThrowsCounter > 0) {
            this._framePoints += points;
            this._strikeThrowsCounter--;
        }
    }

    public setFrameStatus(status: IFrameStatus ) {
        this._framePoints = status.points;
        this._frameType = status.type;
    }

    public getAllResults() {
        return this._throwResults; // TODO add get interface
    }

    public getPinLocations(isKnocked: boolean): Array<number> {
        let result = this._pins.filter((pin) => pin.IsKnocked === isKnocked);
        let pinIds = result.map((pin) => pin.LocationIdentifier);
        return pinIds;
    }

    public addThrow(throwResult: ThrowResult) {
        if (this._throwResults.length > 1) {
            throw new Error("You achieved maximum throw in this frame!");
        }

        if (this._throwResults.length == 1 && this._frameType === FRAME_TYPE.STRIKE) {
            throw new Error("Frame is strike. You can not throw in this frame!");
        }
        throwResult.knockDownPinIds.forEach((pinIndex) => {
            this._pins[pinIndex].IsKnocked = true;
        });
        this._throwResults.push(throwResult);
    }

    private initFrame(pins: number) {
        for (let i =0; i < pins; i++) {
            this._pins.push(new Pin(i));
        }
    }



}
