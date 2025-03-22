/*
Program only capable of dropping a single block near found tower.
Yet to collect additional blocks and build staircase.
Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location

4 main algos to find:
1. traversal algo (done)
    - save tower location (done)
2. Traversal needs backtracking algo too (done)
3. collect blocks algo (can just pop off path[] for now) (TODO)
4. build staircase algo (TODO)
    - align ((h-1)(h))/2  blocks in total (where h = tower height)

- Each run has several paths created -- path[] cleared each time troll at tower (TODO)
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

// To create coordinate system -- unknown whether its ok to add to CellInfo instead
interface MyCell {
    x: number;
    y: number;
}

class Stacker {
    private towerLocation: MyCell | null = null; // x,y location of tower on map
    private holdingBlock: boolean = false; // if we are holding a block
    private explored: MyCell[] | null = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
    private current: MyCell | null = null; // current x,y position on map
    private origin: MyCell = { x: 0, y: 0 }; // orogin cell of entire coordinate system

    // For BFS/DFS traversal and backtracking:
    private path: MyCell[] = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
    private toVisit: MyCell[] = []; // list of cells to visit next
    private backtrackInProgress: boolean = false; // if we are currently backtracking
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

        // Phase 1: Update position and traverse map for tower (backtrack if nec.).
        if (!this.current) {
            // at beginning of run
            this.current = { ...this.origin };
            this.updatePath(this.current);
            return this.traverseMap(cell);
        } else if (!this.towerLocation) {
            // update current position
            if (this.backtrackInProgress) {
                this.current = this.path.pop(); // should sync with cell
            } else {
                this.current = this.toVisit.pop();
            }
            this.updatePath(this.current);
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

        // Phase 3: Collect blocks (TODO)

        // Phase 4: Build staircase to treasure (TODO)
    };

    // Traverse map by adding to toVisit (DFS?)
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
                });
                canMove = true;
            }
        }

        if (this.towerLocation) {
            // Tower located somewhere in cell's immed. neighboring cells...
            this.holdingBlock = false;
            console.log('DROP');
            return Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
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
        this.path.pop();
        const xDirection = this.path.slice(-1)[0].x - this.current.x;
        const yDirection = this.path.slice(-1)[0].y - this.current.y;

        if (yDirection < 0) {
            console.log('go back ^');
            return Action.UP;
        } else if (yDirection > 0) {
            console.log('go back v');
            return Action.DOWN;
        } else if (xDirection < 0) {
            console.log('go back <-');
            return Action.LEFT;
        } else if (xDirection > 0) {
            console.log('go back ->');
            return Action.RIGHT;
        } else {
            console.log('nothing to backtrack to');
            return Action.DROP; // placeholder for now, troll stays in place
        }
    }

    // Derives next Action based on our coordinates (could remove this.origin since always 0):
    private getNextAction(): Action {
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
        if (!this.path.some((e) => e.x === position.x && e.y === position.y)) {
            this.path.push({ ...position });
        }
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
            !this.explored.some(
                (e) =>
                    e.x === this.current.x + dx && e.y === this.current.y + dy
            )
        ) {
            if (!this.towerLocation) this.findTower(direction, dx, dy);
            if (Math.abs(direction.level - cell.level) <= 1) return true;
        }

        return false;
        // TODO: what about for CellType.GOLD?
    }

    // Check if tower is found and update its location
    private findTower(
        direction: { type: CellType; level: number },
        dx: number,
        dy: number
    ): void {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
            };
        }
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;
