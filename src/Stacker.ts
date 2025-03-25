/*
Program only capable of dropping two blocks near found tower.
Yet to collect/drop blocks appropriately (ie build staircase).
Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location

4 main algos to find:
1. traversal algo (done)
    - save tower location (done)
2. Traversal needs backtracking algo too (done)
3. find blocks algo (can just pop off path[] for now) (TODO)
    - only pickup if not staircase cell
    - total blocks = collect ((h-1)(h))/2  blocks in total (where h = tower height)
4. build staircase algo (TODO)
    - Initial staircase build until staircase.length = 2 and two 1 block cells
    - Then, add block to end of staircase when staircase full (staircase[0] = staircase.length), repeat till total blocks collected

- Each run has several paths created -- path[] cleared each time troll at tower (TODO)
- explored is a 2nd list of all explored cells in run.
- Journey = path to tower or path to a block
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

// To create coordinate system (TODO: Refactor. x,y actually only needed for unique identification of each cell).
// Unknown whether its ok to add to CellInfo instead
interface MyCell {
    x: number;
    y: number;
    nextAction: Action | null; // needed for backtracking
    level?: number; // needed for staircase
    type?: CellType; // needed for staircase
}

enum Phase {
    FIND_TOWER = 'Find Tower Phase',
    COLLECT_BLOCKS = 'Collect Blocks Phase',
    BUILD_STAIRCASE = 'Build Staircase Phase', // TODO: probably not needed
}

class Stacker {
    private towerLocation: MyCell | null = null; // x,y location of tower on map
    private holdingBlock: boolean = false; // if we are holding a block
    private current: MyCell | null = null; // current x,y position/cell on map
    private origin: MyCell = { x: 0, y: 0, nextAction: null }; // orogin cell of entire coordinate system (ie start)
    private blockLocation: MyCell | null = null; // x,y location of block to pickup on map
    private phase: Phase = Phase.FIND_TOWER; // current phase

    // For BFS/DFS traversal and backtracking (TODO: add to MyCell instead):
    private path: MyCell[] = []; // The path actually taken thus far for each journey (using set would probably be better lookup time if needed)
    private explored: MyCell[] | null = []; // list of all cells visited in journey/path, needed since path[] regularly removed from during backtracking, hence need a global cells visited list cleared/deleted in fewer cases (using set would probably be better lookup time if ever needed)
    private toVisit: MyCell[] = []; // list of cells to visit next
    private backtrackInProgress: boolean = false; // if we are currently backtracking
    private returningToTower: boolean = false; // if we are currently returning to tower in phase 2
    private staircase: MyCell[] | null = []; // list of cells to build staircase on

    // Using the triangular number formula: (h-1)h/2 (8 hardcoded for now since only ever seen 8 level towers. h = tower height)
    // private staircaseTotal: number = Math.abs((8 - 1) * 8) / 2; // (not used) total number of blocks required to build staircase

    turn = (cell: CellInfo): Action => {
        // pickup block along the way if you can
        if (
            cell.type === CellType.BLOCK &&
            !this.holdingBlock &&
            !this.towerLocation // TODO: should be able to pick up block when tower is found too obv., but avoids never-ending pickup/drop loop at end for now
        ) {
            this.holdingBlock = true;
            console.log('PICKUP');
            return Action.PICKUP;
        }

        // Phase 1: Update position and traverse map for tower
        if (!this.current) {
            // at start of run
            this.current = { ...this.origin };
            this.updatePath(this.current);

            return this.traverseMap(cell);
        } else if (!this.towerLocation) {
            this.updateState(this.current, Phase.FIND_TOWER); // update state to new position

            return this.traverseMap(cell);
        } else {
            // Phase 2: Tower located, now collect blocks/build staircase phase
            if (!this.blockLocation) {
                // ...youve just found tower and dropped block from traverseMap()
                if (this.phase === Phase.FIND_TOWER) {
                    this.current = { ...this.toVisit.pop() };
                    this.phase = Phase.COLLECT_BLOCKS;
                    this.clearState();
                    this.explored = [];
                    this.updatePath(this.current);
                } else {
                    // else update state as normal
                    this.updateState(this.current, Phase.COLLECT_BLOCKS);
                }

                return this.traverseMap(cell);
            } else {
                // Block Found -- Pickup, then drop block when back at tower
                if (!this.returningToTower && cell.type === CellType.BLOCK) {
                    // traverse back to tower via this.path, but not before collecting block
                    this.toVisit = [];
                    this.returningToTower = true;
                    this.holdingBlock = true;
                    this.path.slice(-1)[0].nextAction = this.current.nextAction;
                    console.log('PICKUP');

                    return Action.PICKUP;
                }

                if (this.path.length === 0) {
                    // we know we're at tower when path.length === 0, so drop block
                    console.log('DROP');
                    this.holdingBlock = false;
                    this.blockLocation = null;
                    this.returningToTower = false;

                    this.path.push(this.current);
                    this.explored.push(this.current);

                    // TODO: Should dop conditionally (buildStaircase())
                    return Action.DROP;
                } else {
                    // return to tower via path taken (this.path)
                    return this.reverseDirection(this.path.pop().nextAction);
                }
            }
        }
    };

    // using new nextAction property to backtrack this time instead of backtrackAction() (TODO: refactor backtrackAction() to use this new property instead, simpler)
    private reverseDirection(direction: Action): Action {
        if (direction === Action.UP) return Action.DOWN;
        if (direction === Action.DOWN) return Action.UP;
        if (direction === Action.LEFT) return Action.RIGHT;
        if (direction === Action.RIGHT) return Action.LEFT;
    }

    // Traverse map by adding to toVisit, & current is always updated to last element of toVisit
    private traverseMap(cell: CellInfo): Action {
        let canMove = false;

        const neighbors = [
            { dir: cell.up, dx: 0, dy: -1 },
            { dir: cell.left, dx: -1, dy: 0 },
            { dir: cell.down, dx: 0, dy: 1 },
            { dir: cell.right, dx: 1, dy: 0 },
        ];

        // Add valid neighbors to toVisit stack for traversal, check for tower too
        for (const n of neighbors) {
            if (this.checkNeighbors(cell, n.dir, n.dx, n.dy)) {
                this.toVisit.push({
                    x: this.current.x + n.dx,
                    y: this.current.y + n.dy,
                    nextAction: null,
                });
                canMove = true;
            }
        }

        // Perform actions depending on current phase
        if (this.towerLocation && this.phase === Phase.FIND_TOWER) {
            // Tower located somewhere in cell's immed. neighboring cells...
            this.holdingBlock = false;
            return Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
        }
        if (this.blockLocation && this.phase === Phase.COLLECT_BLOCKS) {
            // route to block's position IOT pickup
            return this.getNextAction(this.blockLocation);
        }

        if (canMove) {
            this.backtrackInProgress = false;
            return this.getNextAction();
        } else {
            if (this.current.x === 0 && this.current.y === 0) {
                console.log(`Reached run's end without finding tower`);
                return Action.DROP; // placeholder for now, troll stays in place
            }
            // else we just cant move to valid cells, so backtrack
            return this.backtrackAction();
        }
    }

    // Begin backtracking if stuck for any reason
    private backtrackAction(): Action {
        this.backtrackInProgress = true;
        // x and y direction to backtrack to:
        if (this.path.length > 0) {
            this.path.pop();
        }

        if (this.path.length === 0) {
            return Action.DROP; // placeholder for now, troll stays in place at end of run here
        }

        const xDirection = this.path.slice(-1)[0].x - this.current.x;
        const yDirection = this.path.slice(-1)[0].y - this.current.y;

        if (yDirection < 0) {
            console.log('go back ^');
            this.current.nextAction = Action.UP;
            return Action.UP;
        } else if (yDirection > 0) {
            console.log('go back v');
            this.current.nextAction = Action.DOWN;
            return Action.DOWN;
        } else if (xDirection < 0) {
            console.log('go back <-');
            this.current.nextAction = Action.LEFT;
            return Action.LEFT;
        } else if (xDirection > 0) {
            console.log('go back ->');
            this.current.nextAction = Action.RIGHT;
            return Action.RIGHT;
        } else {
            console.log('nothing to backtrack to');
            return Action.DROP; // placeholder for now, troll stays in place
        }
    }

    // Derives next Action based on our coordinates (TODO: Refactor. 1. use direction only instead, and 2.could remove this.origin since always 0):
    private getNextAction(
        nextCell: MyCell = this.toVisit.slice(-1)[0]
    ): Action {
        let x = this.origin.x - this.current.x + nextCell.x; // last toVisit due to using pop()
        let y = this.origin.y - this.current.y + nextCell.y;

        if (x < 0) {
            // left: -1x
            this.current.nextAction = Action.LEFT;
            return Action.LEFT;
        } else if (x > 0) {
            // right: +1x
            this.current.nextAction = Action.RIGHT;
            return Action.RIGHT;
        } else if (y < 0) {
            // up: -1y
            this.current.nextAction = Action.UP;
            return Action.UP;
        } else if (y > 0) {
            // down: +1y
            this.current.nextAction = Action.DOWN;
            return Action.DOWN;
        } else {
            // When x=0 and y=0 when visited all cells on map
            console.log('no next action');
            return Action.DROP; // placeholder for now, troll stays in place
        }
    }

    // Add to explored and path list if not already in there
    private updatePath(position: MyCell): void {
        if (
            !this.explored.some((e) => e.x === position.x && e.y === position.y)
        ) {
            this.explored.push({ ...position });
        }
        if (!this.path.some((p) => p.x === position.x && p.y === position.y)) {
            this.path.push({ ...position });
        }
    }

    // Updates main state variables
    private updateState(prevPosition: MyCell, currentPhase: Phase): void {
        this.phase = currentPhase;
        // this.prevCell = { ...prevPosition }; // TODO: may not be needed due to nextAction property

        // update current cell since weve now moved ahead
        if (this.path.length > 0)
            this.path.slice(-1)[0].nextAction = prevPosition.nextAction;

        if (this.backtrackInProgress && this.path.length > 0) {
            this.current = this.path.pop(); // should sync with cell
        } else if (this.toVisit.length > 0) {
            // console.log('toVisit: ', this.toVisit);
            this.current = this.toVisit.pop();
        }

        // and add current cell to explored and path lists
        if (
            !this.explored.some(
                (e) => e.x === this.current.x && e.y === this.current.y
            )
        ) {
            this.explored.push({ ...this.current });
        }
        if (
            !this.path.some(
                (p) => p.x === this.current.x && p.y === this.current.y
            )
        ) {
            this.path.push({ ...this.current });
        }
    }

    // Clears main state variables
    private clearState(): void {
        this.path = [];
        this.toVisit = [];
        this.backtrackInProgress = false;
    }

    // Find which neighbors are valid to move to (not wall, not visited, and 1 level away)
    // as well as if any are a tower as well
    private checkNeighbors(
        cell: CellInfo, // current cell
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ): boolean {
        // current should === cell
        if (
            direction.type !== CellType.WALL &&
            !this.path.some(
                (p) =>
                    p.x === this.current.x + dx && p.y === this.current.y + dy
            ) &&
            // this.explored needed since this.path has elements regularly removed
            !this.explored.some(
                (e) =>
                    e.x === this.current.x + dx && e.y === this.current.y + dy
            )
        ) {
            if (this.phase === Phase.COLLECT_BLOCKS && !this.blockLocation)
                this.findBlock(direction, dx, dy);
            if (!this.towerLocation) this.findTower(direction, dx, dy);
            if (Math.abs(direction.level - cell.level) <= 1) return true;
        }

        return false;
        // TODO: what about for CellType.GOLD?
    }

    // Check if tower is found and update its location (only perform during phase 1)
    private findTower(
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ): void {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
                nextAction: null,
            };
        }
    }

    // Check if block is found and updates its location
    private findBlock(
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ): void {
        if (direction.type === CellType.BLOCK && !this.blockLocation) {
            this.blockLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
                nextAction: null,
            };
        }
    }

    // TODO: build staircase algo. Will need to run findBlock() only when block not in staircase (checkNeighbors())
    private buildStaircase(cell: CellInfo, current: MyCell): Action {
        if (this.staircase.length < 2) {
            // build initial staircase (two 1 block cells)
            if (cell.type === CellType.BLOCK) {
                return this.reverseDirection(this.path.pop().nextAction);
                // return this.reverseDirection(current.nextAction);
            }
            this.staircase.push({ ...current, level: 1, type: CellType.BLOCK });
            console.log('STAIRCASE: add block');
            this.holdingBlock = false;
            this.blockLocation = null;
            return Action.DROP;
        }

        // else drop at end of staircase when staircase full
        if (this.staircase[0].level === this.staircase.length) {
            if (this.path.slice(-1)[0].type === CellType.BLOCK) {
                // cell == curent?
                this.staircase.push({
                    ...current,
                    level: 1,
                    type: CellType.BLOCK,
                });
                console.log('STAIRCASE: add block');
                this.holdingBlock = false;
                this.blockLocation = null;
                this.returningToTower = false;
                this.toVisit = [];
                this.explored = [];
                this.path = [];
                this.path.push(this.current);
                this.explored.push(this.current);
                return Action.DROP;
            }
            this.current = this.path.pop();
            return this.reverseDirection(this.current.nextAction);
        }

        // else drop at top of staircase
        this.holdingBlock = false;
        this.blockLocation = null;
        this.path.push(this.current);
        this.explored.push(this.current);

        this.staircase.push({ ...current, level: 1, type: CellType.BLOCK });
        console.log('STAIRCASE: add block');
        return Action.DROP;
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;
