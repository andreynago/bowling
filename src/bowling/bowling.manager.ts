import Frame from './models/frame';
import {FRAME_TYPE} from './consts/bowling.consts';
import ThrowResult from './models/throw.result';
import {IGameStatus, IBowlingGame, IBowlingGameConfiguration} from './interfaces/bowling.interfaces';
import ThrowHelper from './throw.helper';
import Pin from './models/pin';

const defaultConfiguration: IBowlingGameConfiguration = {
   frames: 10,
   pins: 10,
   bonusSpareThrows: 1,
   bonusStrikeThrows: 2
}

export default class BowlingManager implements IBowlingGame {
    private _gameFrames: Array<Frame> = [];
    private _gameConfig: IBowlingGameConfiguration;
    private _activeFrameIndex: number = -1;
    private _totalPoints: number;
    private _throwCounter: number;
    private _bonusThrowsResults: Array<ThrowResult>;
    private _bonusThrows: number;
    private _isEndOfGame: boolean;
    private _bonusPins: Array<Pin> = [];
    private _virtualFrame: Frame;
    private _isBonusGame: boolean;

    public get GameConfiguration(): IBowlingGameConfiguration {
        return Object.assign({}, this._gameConfig); // We use Object assign in order to prevent change configuration object outside the manager
    }

    constructor(gameConfiguration?: IBowlingGameConfiguration) {
        this._gameConfig = Object.assign({}, defaultConfiguration, gameConfiguration);
    }

    public startNewGame() {
        this.resetGame();
        this.addFrame();
    }

    public throwBall() : IGameStatus {
        if (!this.isThrowAllowed()) {
            throw new Error('You have finished the game already. Please start the new one!');
        }
        let activeFrame = this.getActiveFrame();
        if (!activeFrame) {
            throw new Error('You have no bonus throws. Please start the new one!');
        }
        let throwResult = this.throwFramePins(activeFrame);
        this.handleThrowResult(throwResult, activeFrame);
        return this.getGameStatus();
    }

    public getGameStatus(): IGameStatus {
        return {
            frames: this._gameFrames.map((frame) => {return {type: frame.Type, points: frame.Points}}),
            totalPoints: this._totalPoints,
            isGameFinished: this._isEndOfGame,
            bonusThrowsResults: this._bonusThrowsResults,
            bonusThrowsToFinish: this._bonusThrows,
            framesToFinish: this._gameConfig.frames - this._gameFrames.length
        }
    }

    private isThrowAllowed() {
       return false === this._isEndOfGame;
    }

    private resetGame() {
        this._gameFrames = [];
        this._activeFrameIndex = -1;
        this._isEndOfGame = false;
        this._isBonusGame = false;
        this._bonusThrowsResults = [];
        this._throwCounter = 0;
    }

    private handleThrowResult(frameThrow: ThrowResult, frame: Frame) {
        frame.addThrow(frameThrow);
        let type = FRAME_TYPE.REGULAR;
        let moveNext = false;
        if (frame.ThrowsNumber === 2) {
            // check if spare
            moveNext = true;
            if (frame.KnockedPinsNumber === this._gameConfig.pins) {
                type = FRAME_TYPE.SPARE;
            }
        } else { // first throw
            // check if strike
            if (frame.KnockedPinsNumber === this._gameConfig.pins) {
                type = FRAME_TYPE.STRIKE;
                moveNext = true;
            }
        }
        frame.setFrameStatus({points: frame.KnockedPinsNumber, type: type});
        if (frameThrow.knockDownPinIds.length > 0) {
            this.updateFramesPoints(frameThrow);
        }
        this.updateTotalPoints();
        if (this._isBonusGame) {
            this._bonusThrowsResults.push(frameThrow);
        }
        if (moveNext) {
            this.tryMoveToNextFrame(frame);
        }
    }

    private getActiveFrame() {
        if (this._isBonusGame) {
            if (this._bonusThrows == 0) {
                return null;
            }
            // Create new frame in case it doesn't exist or there all pins in this frame is knocked out
            if (this._virtualFrame == null || this._virtualFrame != null && this._virtualFrame.Points == this._gameConfig.pins) {
                this._activeFrameIndex++;
                this._virtualFrame = new Frame(this._activeFrameIndex, this._gameConfig.pins, this._gameConfig.bonusSpareThrows, this._gameConfig.bonusStrikeThrows);
            }
            // if user is playing bonus frame -> continue with this frame
            return this._virtualFrame
        } else {
            return this._gameFrames[this._activeFrameIndex];
        }
    }

    private tryMoveToNextFrame(frame: Frame): void {
        if (this._isBonusGame) {
            if (this._bonusThrows === 0) {
                this._isEndOfGame = true;
            }
            return;
        }
        if (this._activeFrameIndex === this._gameConfig.frames - 1) {
            switch (frame.Type) {
                case FRAME_TYPE.STRIKE:
                    this._bonusThrows = this._gameConfig.bonusStrikeThrows;
                    this._isBonusGame = true;
                    break;
                case FRAME_TYPE.SPARE:
                    this._bonusThrows = this._gameConfig.bonusSpareThrows;
                    this._isBonusGame = true;
                    break;
                default:
                    this._isEndOfGame = true;
                    break;
            }
            return;
        }
        else {
            this.addFrame();
        }
    }

    private updateFramesPoints(lastThrow: ThrowResult) {
        let frameThrows = [];

        let previousThrowCounter = Math.max(this._gameConfig.bonusSpareThrows, this._gameConfig.bonusStrikeThrows);
        let startSearchFrom = this._isBonusGame === true ? this._gameFrames.length - 1 : this._gameFrames.length - 2;
        for(let i = startSearchFrom; i > -1 && previousThrowCounter > 0; i--) {
            let frame = this._gameFrames[i];
            if (frame.Type === FRAME_TYPE.SPARE) {
                frame.addPoints(lastThrow.knockDownPinIds.length);
            }
            if (frame.Type === FRAME_TYPE.STRIKE) {
                frame.addPoints(lastThrow.knockDownPinIds.length);
            }
            previousThrowCounter-=frame.ThrowsNumber;
        }
    }

    private addFrame(): void {
        this._activeFrameIndex++;
        this._gameFrames.push(new Frame(this._activeFrameIndex, this._gameConfig.pins, this._gameConfig.bonusSpareThrows, this._gameConfig.bonusStrikeThrows));
    }

    private updateTotalPoints() {
        let totalPoints = 0;
        this._gameFrames.forEach((frame) => totalPoints+=frame.Points);
        this._totalPoints = totalPoints;
    }

    private throwFramePins(frame: Frame): ThrowResult {
        let pinsToknockedOut = frame.getPinLocations(false);
        let knockedPins = ThrowHelper.getRandomThrowResult(pinsToknockedOut);
        this._throwCounter++;
        if (this._isBonusGame) {
            this._bonusThrows--;
        }
        return new ThrowResult(frame.Id, knockedPins, this._throwCounter);
    }

}
