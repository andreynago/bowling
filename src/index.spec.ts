import { sum } from './index';
import * as sinon from "sinon";
import { expect } from 'chai';
import BowlingManager from './bowling/bowling.manager';
import RandomThrowRunner from './throw-runners/random.throw.runner';

describe('GameManager initialize', () => {

   let runner;
    let getStrikeFrameResult = () => {
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    };
    beforeEach(() => {
        runner = new RandomThrowRunner();
    });
    it('Game Manager should be created with default configuration', () => {
        let manager = new BowlingManager();
        expect(manager).to.be.not.null;
    });

    it('Game Manager should be created with custom configuration', () => {
        let customConfig = {
            frames: 8,
            pins: 5,
            bonusStrikeThrows: 2,
            bonusSpareThrows: 3
        };
        let manager = new BowlingManager(runner, customConfig);
        expect(manager.GameConfiguration).deep.equals(customConfig);
    });

    describe('Throw ball', () => {
        let manager, sandbox;
        let throwRegular = (pins) => {
            sandbox.stub(runner, 'executeThrow').returns(pins);
            let gameResult = manager.throwBall();
            sandbox.restore();
            return gameResult;
        }
        let throwStrike = () => {
            return throwRegular(getStrikeFrameResult());
        };
        let throwSpare = (throw1Pins = null, throw2Pins = null) => {
            sandbox.stub(runner, 'executeThrow').returns(throw1Pins || [0, 1, 2]);
            manager.throwBall();
            sandbox.restore();
            sandbox.stub(runner, 'executeThrow').returns(throw2Pins || [3, 4, 5, 6, 7, 8, 9]);
            let gameResult = manager.throwBall();
            sandbox.restore();
            return gameResult;
        }

        beforeEach(() => {
            manager = new BowlingManager(runner);
            manager.startNewGame();
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it("Should return Game result", () => {
            let gameResult = throwRegular([0, 2, 5]);
            expect(gameResult.frames[0].points).equals(3);
        });

        it("Should sum single frame result", () => {
            let gameResult;
            gameResult = throwRegular([0, 1, 2]);
            expect(gameResult.totalPoints).equals(3);
            gameResult =  gameResult = throwRegular([8, 9, 3]);
            expect(gameResult.totalPoints).equals(6);
        });

        it('Should update points for Spare frame', () => {
            let gameResult;
            throwSpare();
            gameResult = throwRegular([0, 1, 2]);
            expect(gameResult.totalPoints).equals(16);
        });

        it('Should update points for Strike frame', () => {
            let gameResult;
            // frame 1
            gameResult = throwStrike();
            expect(gameResult.totalPoints).equals(10);
            // frame 2
            gameResult = throwRegular([0, 4, 5]);
            expect(gameResult.totalPoints).equals(16);
            gameResult = throwRegular([1, 2, 3]);
            expect(gameResult.totalPoints).equals(22);
        });

        it('Should update points for two Strikes and one regular frame', () => {
            let gameResult;
            // frame 1
            gameResult = throwStrike();
            expect(gameResult.totalPoints).equals(10);
            // frame 2
            gameResult = throwStrike();
            expect(gameResult.totalPoints).equals(30);
            // frame 3
            gameResult = throwRegular([1, 5, 7, 9]);
            expect(gameResult.totalPoints).equals(42);
            // frame 3
            gameResult = throwRegular([0, 2, 3, 4, 8]);
            expect(gameResult.totalPoints).equals(52);
        });


        it('Should get bonus throws', () => {
            let gameResult;
            // frame 1
            throwStrike();
            // frame 2
            throwStrike();
            // frame 3
            throwStrike();
            // frame 4
            throwStrike();
            // frame 5
            throwStrike();
            // frame 6
            throwStrike();
            // frame 7
            throwStrike();
            // frame 8
            throwStrike();
            // frame 9
            throwStrike();
            // frame 10
            throwStrike();
            gameResult = manager.getGameStatus();

            expect(gameResult.bonusThrowsToFinish).equals(2);
            expect(gameResult.totalPoints).equals(270);
            // throw bonus
            if (gameResult.bonusThrowsToFinish > 0) {
                gameResult = throwStrike();
                expect(gameResult.bonusThrowsToFinish).equals(1);
                expect(gameResult.totalPoints).equals(290);
            }

            // throw bonus
            if (gameResult.bonusThrowsToFinish > 0) {
                gameResult = throwStrike();
                expect(gameResult.bonusThrowsToFinish).equals(0);
                expect(gameResult.totalPoints).equals(300);
                expect(gameResult.isGameFinished).equals(true);
            }

        });

    });
});


