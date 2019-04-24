export default class ThrowHelper {
    static getRandomThrowResult(pinIndexes) {
        // for each pin we decide if it should be randomly naked out
        return pinIndexes.filter(() => Math.round(Math.random()));
    }
}
