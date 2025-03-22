/*
3 main algos to find:
1. traversal algo (done)
    - needs backtracking too (done)
    - save tower location (done)
2. collect blocks algo (can just pop off path[] for now) 
3. build staircase algo
    - align ((h-1)(h))/2  blocks in total (where h = tower height)


- Each run has several paths created -- path[] cleared each time troll at tower
- explored is a list of all explored cells in run, never to be reset in a single run. 
- Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location
*/

import { Action } from './lib/Action';
import { CellType } from './lib/CellType';

interface CellInfo {
    left: { type: CellType; level: number }; // information about the cell to the left
    up: { type: CellType; level: number }; // information about the cell above
    right: { type: CellType; level: number }; // information about the cell to the right
    down: { type: CellType; level: number }; // information about the cell below
    type: CellType; // the type for the current cell
    level: number; // the level of the current cell
}

// interface Backtrack {
//     inProgress: boolean; // backtracking currently in progress
//     left?: number; // go left x turns, right x turns, etc... (not used)
//     right?: number;
//     up?: number;
//     down?: number;
// }

// To create coordinate system -- unknown whether its ok to add to CellInfo instead
interface MyCell {
    x: number;
    y: number;
    level?: number; // may not be needed
}

class Stacker {
    private treasureFound = false; // if we have found the treasure on map (not used)
    private towerLocation: MyCell | null = null; // x,y location of tower on map
    private holdingBlock = false; // if we are holding a block
    private explored: MyCell[] | null = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
    private current: MyCell | null = null; // current x,y position on map
    private origin: MyCell = { x: 0, y: 0 }; // orogin cell of entire coordinate system
    // private backtrack: Backtrack = {
    //     inProgress: false,
    // };
    private backtrackInProgress = false; // if we are currently backtracking

    // using the triangular number formula: (h-1)h/2 (8 hardcoded for now since only ever seen 8 level towers. h = tower height)
    // private staircaseTotal = Math.abs((8 - 1) * 8) / 2; // (not used to keep simple) total number of blocks required to build staircase
    private staircaseTotal = 3; // dummy value for now (to keep it simple)

    // For BFS/DFS traversal and backtracking
    private path: MyCell[] = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
    private toVisit: MyCell[] = []; // list of cells to visit next

    turn = (cell: CellInfo): Action => {
        if (
            cell.type === CellType.BLOCK &&
            !this.holdingBlock &&
            !this.towerLocation // TODO: should be able to pick up block when tower is found too obv, but avoids never-ending pickup/drop loop at end for now
        ) {
            // Greedy pickup
            this.holdingBlock = true;
            console.log('PICKUP');
            return Action.PICKUP;
        }

        // Phase 1: Update position and traverse map for tower (backtrack if nec.).
        if (this.current === null) {
            // at beginning of run
            this.current = { ...this.origin };
            this.updatePath(this.current);
            // console.log(
            //     'current (begin): ' + this.current.x + ',' + this.current.y
            // );
            return this.traverseMap(cell);
        } else if (!this.towerLocation) {
            if (this.backtrackInProgress) {
                this.current = this.path.pop(); // should sync with cell
            } else {
                this.current = this.toVisit.pop();
                // this.updatePath(this.current);
            }
            this.updatePath(this.current);
            // console.log('current: ' + this.current.x + ',' + this.current.y);
            // this.current = this.toVisit.pop(); // This wont work on its own as we want it when stuck/should backtrack and will continue pulling from toVisit at those points
            return this.traverseMap(cell);
        } else {
            // Phase 2: Tower located
            console.log(
                'STOP | tower found: ' +
                    this.towerLocation.x +
                    ',' +
                    this.towerLocation.y
            );

            if (this.holdingBlock) {
                console.log('DROP');
                this.holdingBlock = false;
            }

            // TODO
            // this.path = []; // reset path
            // this.toVisit = []; // reset toVisit
            // return this.traverseMap(cell); // traverse map again

            // TODO: needs to drop only under certain conditions
            return Action.DROP; // 2nd drop: placeholder for now (stays in place while dropping too)
        }

        // Phase 3: Collect blocks

        // Phase 4: Build staircase to treasure
    };

    // traverse map by adding to toVisit (BFS?)
    private traverseMap(cell: CellInfo): Action {
        // let traversedEntireMap = 4;
        let canMove = false;

        if (!this.towerLocation) {
            // only find tower once
            this.findTower(cell.up, 0, -1);
            this.findTower(cell.left, -1, 0);
            this.findTower(cell.down, 0, 1);
            this.findTower(cell.right, 1, 0);
        }

        // Add to toVisit stack if valid cell in order to traverse map
        if (this.isValidCell(cell, cell.up, 0, -1)) {
            this.toVisit.push({ x: this.current.x, y: this.current.y - 1 });
            canMove = true;
            // console.log('up');
        }
        if (this.isValidCell(cell, cell.left, -1, 0)) {
            this.toVisit.push({ x: this.current.x - 1, y: this.current.y });
            canMove = true;
            // console.log('left');
        }
        if (this.isValidCell(cell, cell.down, 0, 1)) {
            this.toVisit.push({ x: this.current.x, y: this.current.y + 1 });
            canMove = true;
            // console.log('down');
        }
        if (this.isValidCell(cell, cell.right, 1, 0)) {
            this.toVisit.push({ x: this.current.x + 1, y: this.current.y });
            canMove = true;
            // console.log('right');
        }

        if (this.towerLocation) {
            // Tower lcated somewhere in cell's immed. neighboring cells...
            this.holdingBlock = false;
            console.log('DROP');
            return Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
        }
        if (canMove) {
            this.backtrackInProgress = false;
            return this.getNextAction();
        } else {
            // console.log('cant move: ' + this.current.x + ',' + this.current.y);
            if (this.current.x === 0 && this.current.y === 0) {
                console.log('End of journey/run');
                return Action.DROP; // placeholder for now, troll stays in place
            }
            return this.backtrackAction();
        }
        // return this.getNextAction(); // DFS due to pop()?
    }

    private findTower(
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ) {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
            };
        }
    }

    // Begin backtracking
    private backtrackAction(): Action {
        this.backtrackInProgress = true;
        // x and y direction to backtrack to:
        this.path.pop();
        const xDirection = this.path.slice(-1)[0].x - this.current.x;
        const yDirection = this.path.slice(-1)[0].y - this.current.y;

        // console.log(
        //     'prev path: ' +
        //         this.path.slice(-1)[0].x +
        //         ',' +
        //         this.path.slice(-1)[0].y
        // );
        // console.log('current (bt): ' + this.current.x + ',' + this.current.y);
        // console.log('xDirection: ' + xDirection);
        // console.log('yDirection: ' + yDirection);

        if (yDirection < 0) {
            // this.backtrack.up = Math.abs(yDirection);
            console.log('go back ^');
            return Action.UP;
        } else if (yDirection > 0) {
            // this.backtrack.down = yDirection;
            console.log('go back v');
            return Action.DOWN;
        } else if (xDirection < 0) {
            // this.backtrack.left = xDirection;
            console.log('go back <-');
            return Action.LEFT;
        } else if (xDirection > 0) {
            // this.backtrack.right = xDirection;
            console.log('go back ->');
            return Action.RIGHT;
        } else {
            console.log('nothing to backtrack to');
            // TODO: should return an action here
        }
    }

    private getNextAction(): Action {
        // derives next Action based on our coordinates (could remove origin since always 0):
        let x = this.origin.x - this.current.x + this.toVisit.slice(-1)[0].x; // last toVisit due to using pop()
        let y = this.origin.y - this.current.y + this.toVisit.slice(-1)[0].y;

        if (x < 0) {
            // left: -1x
            return Action.LEFT;
        } else if (x > 0) {
            // right: +1x
            return Action.RIGHT;
        } else if (y < 0) {
            // up: -1y
            return Action.UP;
        } else if (y > 0) {
            // down: +1y
            return Action.DOWN;
        } else {
            // TODO: x=0 and y=0 when visited all cells on map
            // this.toVisit.pop();
            // this.doneVisiting = true;
            // return Action.PICKUP; // placeholder for now , stays in place
        }
    }

    // add to explored and path list if not already in there
    private updatePath(position: MyCell): void {
        if (
            !this.explored.some((e) => e.x === position.x && e.y === position.y)
        ) {
            this.explored.push({ ...position });
        }
        if (!this.path.some((e) => e.x === position.x && e.y === position.y)) {
            this.path.push({ ...position });
        }
        // console.log('current: ' + this.current.x + ',' + this.current.y);
    }

    ////////////////////////////////////////////////////////////////////////////////////

    // Find which neighbors are valid to move to (if not wall, not already visited in path, and 1 level away)
    private isValidCell(
        cell: CellInfo, // current cell
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ): boolean {
        // current should === cell
        if (
            direction.type !== CellType.WALL &&
            Math.abs(direction.level - cell.level) <= 1 &&
            !this.path.some(
                (v) =>
                    v.x === this.current.x + dx && v.y === this.current.y + dy
            ) &&
            !this.explored.some(
                (e) =>
                    e.x === this.current.x + dx && e.y === this.current.y + dy
            )
        ) {
            return true;
        }

        return false;
        // TODO: what about for CellType.GOLD?
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;
