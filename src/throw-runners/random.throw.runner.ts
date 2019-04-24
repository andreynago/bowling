import {IThrowRunner} from '../bowling/interfaces/bowling.interfaces';

export default class RandomThrowRunner implements IThrowRunner {
    executeThrow(pins: Array<number>): Array<number> {
        // for each pin we decide if it should be randomly naked out
        return pins.filter(() => Math.round(Math.random()));
    }
}
