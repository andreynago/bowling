import ThrowResult from '../models/throw.result';

interface IFrameStatus {
    points: number;
    type: string;
}

interface IGameStatus {
    frames: Array<IFrameStatus>;
    totalPoints: number;
    isGameFinished: boolean;
    framesToFinish: number;
    bonusThrowsResults: Array<ThrowResult>,
    bonusThrowsToFinish: number;
}

interface IBowlingGame {
    throwBall() : IGameStatus;
    getGameStatus(): IGameStatus;
}

interface IBowlingGameConfiguration {
    frames: number;
    pins: number;
    bonusStrikeThrows: number;
    bonusSpareThrows: number;
}

export {IFrameStatus, IGameStatus, IBowlingGame, IBowlingGameConfiguration}
