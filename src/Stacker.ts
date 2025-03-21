/*
5 diffferent phases:
0. traversal algo
1. tower finder algo (search algo -- bfs)
    - save tower location
2. find shortest path to tower
3. collect blocks algo (search algo)
4. build staircase algo

- Each run has several journeys
- Each journey has its own list of 'path' blocks, hence `path` set clears routinely (eg tower found, black added to staircase, etc, are all different individual journies within a single run)
- explored is a list of all explored cells in run, never to be reset in a single run. 
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

interface Backtrack {
    inProgress: boolean; // backtracking currently in progress
    left?: number; // go left x turns, right x turns, etc... (not used)
    right?: number;
    up?: number;
    down?: number;
}

// To create coordinate system -- unknown whether its ok to add to CellInfo instead
interface MyCell {
    x: number;
    y: number;
    level?: number; // may not be needed
}

class Stacker {
    private treasureFound = false; // if we have found the treasure on map
    // private treasureLocation: { x: number; y: number; level: number } | null;
    private towerLocation: MyCell | null = null; // x,y location of tower on map

    // private collectedBlocks = 0; // the block we have currently in hand, to build the staircase
    // private requiredBlocks = 0;
    // private buildingStaircase = false;
    private holdingBlock = false; // if we are holding a block
    private explored: MyCell[] | null = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
    private current: MyCell | null = null; // current x,y position on map
    private origin: MyCell = { x: 0, y: 0 }; // orogin cell of entire coordinate system
    private backtrack: Backtrack = {
        inProgress: false,
    };

    // Keep track of the path we're following
    // private pathToFollow: Action[] = [];

    // For BFS/DFS traversal
    private path: MyCell[] = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
    // private visited = new Set<string>();
    private toVisit: MyCell[] = []; // list of cells to visit next
    // private toVisit: { x: number; y: number; path: Action[] }[] = []; // list of cells to visit immediately in (x,y,path) format
    // private doneVisiting = false; // not used

    turn = (cell: CellInfo): Action => {
        // Greedy pickup
        if (
            cell.type === CellType.BLOCK &&
            !this.holdingBlock &&
            !this.towerLocation // TODO: should be able to pick up block when tower is found too obv, but avoids never-ending pickup/drop loop at end for now
        ) {
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
            if (this.backtrack.inProgress) {
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
            this.backtrack.inProgress = false;
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
        this.backtrack.inProgress = true;
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
            // x=0 and y=0 when visited all cells on map
            // this.toVisit.pop();
            // this.doneVisiting = true;
            // return Action.PICKUP; // placeholder for now , stays in place
        }
    }

    // add to explored and path cells if not already in there
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

        // Update the explored set
        // const key = `${this.currentPosition.x},${this.currentPosition.y}`;
        // this.explored.add(key);

        // Check for blocks in the surrounding cells
        // const neighbors = [
        //     { dir: 'left', dx: -1, dy: 0 }, // dx = left/right direction, dy = up/down direction
        //     { dir: 'up', dx: 0, dy: -1 },
        //     { dir: 'right', dx: 1, dy: 0 },
        //     { dir: 'down', dx: 0, dy: 1 },
        // ];

        // for (const neighbor of neighbors) {
        //     const neighborCell = cell[neighbor.dir as keyof CellInfo] as {
        //         type: CellType;
        //         level: number;
        //     };

        //     // collect location of blocks on map to improve performance?
        //     if (neighborCell.type === CellType.BLOCK) {
        //         const blockX = this.currentPosition.x + neighbor.dx;
        //         const blockY = this.currentPosition.y + neighbor.dy;
        //         const blockKey = `${blockX},${blockY}`; // TODO: not used yet

        //         // Add to known blocks if not already there
        //         if (this.knownBlocks.has(blockKey)) {
        //             this.knownBlocks.add(blockKey);
        //         }
        //     }
        // }
    }

    ////////////////////////////////////////////////////////////////////////////////////

    // Check if cell is valid to move to (if not wall, not already visited in path, and 1 level away)
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

    // TODO: calculate required number of blocks to collect for building staircase (not used)
    private calculateRequiredBlocks(level: number): number {
        // using the triangular number formula: (n-1)n/2
        return Math.floor(((level - 1) * level) / 2);
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;

// TODO: Helper methods for different phases
// private exploreAction(cell: CellInfo): Action {
//     // Logic for exploration (BFS)
//     if (this.toVisit.length === 0) {
//         // if just starting...
//         this.toVisit.push({
//             x: this.currentPosition.x,
//             y: this.currentPosition.y,
//             path: [],
//         });
//         this.path.clear(); // DNU: shouldnt need this if just beginning, so this coudl be used when we are at the target perhaps or some other condition when toVisit is empty
//         this.path.add(
//             `${this.currentPosition.x},${this.currentPosition.y}`
//         );
//     }
//     // process next cell in BFS queue if cells stil to visit
//     while (this.toVisit.length > 0) {
//         const current = this.toVisit.shift(); // makes array/list a queue by using shift

//         // DNU: follow the path if at target (ie exit and follow path instead of exploring?)
//         if (
//             current.x === this.currentPosition.x &&
//             current.y === this.currentPosition.y &&
//             current.path.length > 0
//         ) {
//             this.pathToFollow = [...current.path];
//             return this.pathToFollow.shift();
//         }

//         // check all neighbors
//         const directions = [
//             { action: Action.LEFT, dx: -1, dy: 0, cell: cell.left },
//             { action: Action.RIGHT, dx: 1, dy: 0, cell: cell.right },
//             { action: Action.UP, dx: 0, dy: -1, cell: cell.up },
//             { action: Action.DOWN, dx: 0, dy: 1, cell: cell.down },
//         ];

//         for (const dir of directions) {
//             if (
//                 dir.cell.type !== CellType.WALL &&
//                 Math.abs(dir.cell.level - cell.level) <= 1
//             ) {
//                 const newX = current.x + dir.dx;
//                 const newY = current.y + dir.dy;
//                 const key = `${newX},${newY}`;

//                 // if not path, add to toVisit queue. Main way to traverse the map here
//                 if (!this.path.has(key)) {
//                     this.path.add(key);
//                     this.toVisit.push({
//                         x: newX,
//                         y: newY,
//                         path: [...current.path, dir.action], // DNU
//                     });
//                 }
//             }
//         }
//     }

//     // if no path found, take a random valid move
//     const validMoves = [];
//     if (
//         cell.left.type !== CellType.WALL &&
//         Math.abs(cell.left.level - cell.level) <= 1
//     ) {
//         validMoves.push(Action.LEFT);
//     }
//     if (
//         cell.right.type !== CellType.WALL &&
//         Math.abs(cell.right.level - cell.level) <= 1
//     ) {
//         validMoves.push(Action.RIGHT);
//     }
//     if (
//         cell.up.type !== CellType.WALL &&
//         Math.abs(cell.up.level - cell.level) <= 1
//     ) {
//         validMoves.push(Action.UP);
//     }
//     if (
//         cell.down.type !== CellType.WALL &&
//         Math.abs(cell.down.level - cell.level) <= 1
//     ) {
//         validMoves.push(Action.DOWN);
//     }

//     if (validMoves.length > 0) {
//         return validMoves[Math.floor(Math.random() * validMoves.length)];
//     }

//     // shouldnt happen with BFS, but fallback nonetheless
//     return Action.LEFT;
// }

// Logic for collecting blocks
// private collectBlocksAction(cell: CellInfo): Action {
//     // pick up block if on it and return an Action
//     if (cell.type === CellType.BLOCK) {
//         ++this.collectedBlocks;
//         return Action.PICKUP;
//     }

//     // if we have a target block, follow the path to it
//     if (this.targetBlock === null) {
//         // find nearest block
//         if (this.knownBlocks.length > 0) {
//             this.targetBlock = this.knownBlocks.shift();

//             // Calculate path to target block using BFS
//             this.toVisit = [
//                 {
//                     x: this.currentPosition.x,
//                     y: this.currentPosition.y,
//                     path: [],
//                 },
//             ];
//             this.path.clear();
//             this.path.add(
//                 `${this.currentPosition.x},${this.currentPosition.y}`
//             );

//             // BFS to find path to target block
//             while (this.toVisit.length > 0) {
//                 const current = this.toVisit.shift();

//                 // if (current.x === this.targetBlock.x && current.y === this.targetBlock.y && current.path.length > 0) {
//                 if (
//                     current.x === this.targetBlock.x &&
//                     current.y === this.targetBlock.y
//                 ) {
//                     this.pathToFollow = [...current.path];
//                     break;
//                 }

//                 // check ALL neighbors from current cell (simulation of movement)
//                 const directions = [
//                     { action: Action.LEFT, dx: -1, dy: 0 },
//                     { action: Action.RIGHT, dx: 1, dy: 0 },
//                     { action: Action.UP, dx: 0, dy: -1 },
//                     { action: Action.DOWN, dx: 0, dy: 1 },
//                 ];

//                 for (const dir of directions) {
//                     const newX = current.x + dir.dx;
//                     const newY = current.y + dir.dy;
//                     const key = `${newX},${newY}`;

//                     if (!this.path.has(key)) {
//                         this.path.add(key);
//                         this.toVisit.push({
//                             x: newX,
//                             y: newY,
//                             path: [...current.path, dir.action],
//                         });
//                     }
//                 }
//             }
//             if (this.pathToFollow.length > 0) {
//                 return this.pathToFollow.shift()!;
//             }
//         }
//     }

//     // continue exploring to find blocks
//     return this.exploreAction(cell);
// }

// Logic for building staircase
// private buildStaircaseAction(cell: CellInfo): Action {
//     // find start of staircase start point if not there
//     if (this.staircaseStart === null) {
//         this.staircaseStart = { ...this.currentPosition }; // x,y,level
//         this.staircaseBuilt = 0;
//     }

//     // if path to follow, continue following it
//     if (this.pathToFollow.length > 0) {
//         return this.pathToFollow.shift()!;
//     }

//     // if were at the right position to build the next stair
//     if (this.staircaseBuilt < this.treasureLocation!.level) {
//         // drop block to build stair
//         if (this.collectedBlocks > 0) {
//             --this.collectedBlocks;
//             ++this.staircaseBuilt;
//             return Action.DROP;
//         }
//     }

//     // if weve built all the stairs needed, try to reach the treasure
//     if (this.staircaseBuilt === this.treasureLocation!.level) {
//         // if were at the treasure, weve won/done
//         if (cell.type === CellType.GOLD) {
//             this.treasureFound = true;
//             return Action.PICKUP;
//         }

//         // simplified -- doesnt handle complex terrain where you might need to
//         // navigate around obstracles, etc, hence should use BFS
//         const directions = [
//             { action: Action.LEFT, dx: -1, dy: 0, cell: cell.left },
//             { action: Action.RIGHT, dx: 1, dy: 0, cell: cell.right },
//             { action: Action.UP, dx: 0, dy: -1, cell: cell.up },
//             { action: Action.DOWN, dx: 0, dy: 1, cell: cell.down },
//         ];

//         for (const dir of directions) {
//             if (
//                 dir.cell.type == CellType.GOLD &&
//                 Math.abs(dir.cell.level - cell.level) <= 1
//             ) {
//                 return dir.action;
//             }
//         }
//     }
//     // fallback -- explore to find more blocks or better position
//     return this.exploreAction(cell);
// }
