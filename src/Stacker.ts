/*
4 diffferent phases:
1. tower finder algo (search algo -- bfs)
2. save tower location
3. collect blocks algo (search algo)
4. build staircase algo
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

class Stacker {
    private treasureFound = false;
    private treasureLocation: { x: number; y: number; level: number } | null =
        null;
    private collectedBlocks = 0; // the block we have currently in hand, to build the staircase
    private requiredBlocks = 0;
    private buildingStaircase = false;
    private explored = new Set<string>();
    private currentPosition = { x: 0, y: 0, level: 0 };

    // Keep track of the path we're following
    private pathToFollow: Action[] = [];

    // For BFS
    private visited = new Set<string>(); // list of visited blocks expressed as key of x,y
    private toVisit: { x: number; y: number; path: Action[] }[] = []; // list of cells to visit immediately in (x,y,path) format

    // For block collection
    private knownBlocks: { x: number; y: number }[] = [];
    private targetBlock: { x: number; y: number } | null = null;

    // For building staircase
    private staircaseStart: { x: number; y: number } | null = null;
    private staircaseBuilt = 0;

    turn = (cell: CellInfo): Action => {
        // Update current position tracking when we move
        this.updateExplored(cell);

        // Phase 1: Exploration to find treasure/tower
        if (!this.treasureFound) {
            // Logic to explore and find treasure
            // When found, calculate required blocks using triangular number formula
            // this.requiredBlocks = (treasureLevel - 1) * treasureLevel / 2;
            return this.exploreAction(cell);
        }

        // Phase 2: Collect blocks
        if (this.collectedBlocks < this.requiredBlocks) {
            return this.collectBlocksAction(cell);
        }

        // Phase 3: Build staircase to treasure
        return this.buildStaircaseAction(cell);

        // Pick an action randomly
        // replace this with your own logic
        // var n = (Math.random() * 6) >> 0;
        // if (n == 0) return Action.LEFT;
        // if (n == 1) return Action.UP;
        // if (n == 2) return Action.RIGHT;
        // if (n == 3) return Action.DOWN;
        // if (n == 4) return Action.PICKUP;
        // if (n == 5) return Action.DROP;
    };

    private updateExplored(cell: CellInfo): void {
        // Update the explored set
        const key = `${this.currentPosition.x},${this.currentPosition.y}`;
        this.explored.add(key);

        // Check for blocks in the surrounding cells
        const neighbors = [
            { dir: 'left', dx: -1, dy: 0 }, // dx = left/right direction, dy = up/down direction
            { dir: 'up', dx: 0, dy: -1 },
            { dir: 'right', dx: 1, dy: 0 },
            { dir: 'down', dx: 0, dy: 1 },
        ];

        for (const neighbor of neighbors) {
            const neighborCell = cell[neighbor.dir as keyof CellInfo] as {
                type: CellType;
                level: number;
            };
            if (neighborCell.type === CellType.BLOCK) {
                const blockX = this.currentPosition.x + neighbor.dx;
                const blockY = this.currentPosition.y + neighbor.dy;
                const blockKey = `${blockX},${blockY}`; // TODO: not used yet

                // Add to known blocks if not already there
                if (
                    !this.knownBlocks.some(
                        (b) => b.x === blockX && b.y === blockY
                    )
                ) {
                    this.knownBlocks.push({ x: blockX, y: blockY });
                }
            }
        }
    }

    // calculate required number of blocks to collect for building staircase
    private calculateRequiredBlocks(level: number): number {
        // using the triangular number formula: (n-1)n/2
        return Math.floor(((level - 1) * level) / 2);
    }

    private isValidAction(action: Action, cell: CellInfo): boolean {
        // Check if the action is valid based on current cell
        if (
            action === Action.LEFT &&
            cell.left.type !== CellType.WALL &&
            Math.abs(cell.left.level - cell.level) <= 1
        ) {
            return true;
        } else if (
            action === Action.UP &&
            cell.up.type !== CellType.WALL &&
            Math.abs(cell.up.level - cell.level) <= 1
        ) {
            return true;
        } else if (
            action === Action.RIGHT &&
            cell.right.type !== CellType.WALL &&
            Math.abs(cell.right.level - cell.level) <= 1
        ) {
            return true;
        } else if (
            action === Action.DOWN &&
            cell.down.type !== CellType.WALL &&
            Math.abs(cell.down.level - cell.level) <= 1
        ) {
            return true;
        } else if (action === Action.PICKUP && cell.type == CellType.BLOCK) {
            return true;
        } else if (action === Action.DROP && this.collectedBlocks > 0) {
            return true;
        }
        // TODO: what about for CellType.GOLD?

        return false;
    }

    // Helper methods for different phases
    private exploreAction(cell: CellInfo): Action {
        // Logic for exploration (BFS)
        if (this.toVisit.length === 0) {
            this.toVisit.push({
                x: this.currentPosition.x,
                y: this.currentPosition.y,
                path: [],
            });
            this.visited.clear();
            this.visited.add(
                `${this.currentPosition.x},${this.currentPosition.y}`
            );
        }
        // process next cell in BFS queue
        while (this.toVisit.length > 0) {
            const current = this.toVisit.shift();

            // follow the path if at target
            if (
                current.x === this.currentPosition.x &&
                current.y === this.currentPosition.y &&
                current.path.length > 0
            ) {
                this.pathToFollow = [...current.path];
                return this.pathToFollow.shift();
            }

            // check all neighbors
            const directions = [
                { action: Action.LEFT, dx: -1, dy: 0, cell: cell.left },
                { action: Action.RIGHT, dx: 1, dy: 0, cell: cell.right },
                { action: Action.UP, dx: 0, dy: -1, cell: cell.up },
                { action: Action.DOWN, dx: 0, dy: 1, cell: cell.down },
            ];

            for (const dir of directions) {
                if (
                    dir.cell.type !== CellType.WALL &&
                    Math.abs(dir.cell.level - cell.level) <= 1
                ) {
                    const newX = current.x + dir.dx;
                    const newY = current.y + dir.dy;
                    const key = `${newX},${newY}`;
                    if (!this.visited.has(key)) {
                        this.visited.add(key);
                        this.toVisit.push({
                            x: newX,
                            y: newY,
                            path: [...current.path, dir.action],
                        });
                    }
                }
            }
        }

        // if no path found, take a random valid move
        const validMoves = [];
        if (
            cell.left.type !== CellType.WALL &&
            Math.abs(cell.left.level - cell.level) <= 1
        ) {
            validMoves.push(Action.LEFT);
        }
        if (
            cell.right.type !== CellType.WALL &&
            Math.abs(cell.right.level - cell.level) <= 1
        ) {
            validMoves.push(Action.RIGHT);
        }
        if (
            cell.up.type !== CellType.WALL &&
            Math.abs(cell.up.level - cell.level) <= 1
        ) {
            validMoves.push(Action.UP);
        }
        if (
            cell.down.type !== CellType.WALL &&
            Math.abs(cell.down.level - cell.level) <= 1
        ) {
            validMoves.push(Action.DOWN);
        }

        if (validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        // shouldnt happen with BFS, but fallback nonetheless
        return Action.LEFT;
    }

    // Logic for collecting blocks
    private collectBlocksAction(cell: CellInfo): Action {
        // pick up block if on it and return an Action
        if (cell.type === CellType.BLOCK) {
            ++this.collectedBlocks;
            return Action.PICKUP;
        }

        // if we have a target block, follow the path to it
        if (this.targetBlock === null) {
            // find nearest block
            if (this.knownBlocks.length > 0) {
                this.targetBlock = this.knownBlocks.shift();

                // Calculate path to target block using BFS
                this.toVisit = [
                    {
                        x: this.currentPosition.x,
                        y: this.currentPosition.y,
                        path: [],
                    },
                ];
                this.visited.clear();
                this.visited.add(
                    `${this.currentPosition.x},${this.currentPosition.y}`
                );

                // BFS to find path to target block
                while (this.toVisit.length > 0) {
                    const current = this.toVisit.shift();

                    // if (current.x === this.targetBlock.x && current.y === this.targetBlock.y && current.path.length > 0) {
                    if (
                        current.x === this.targetBlock.x &&
                        current.y === this.targetBlock.y
                    ) {
                        this.pathToFollow = [...current.path];
                        break;
                    }

                    // check ALL neighbors from current cell (simulation of movement)
                    const directions = [
                        { action: Action.LEFT, dx: -1, dy: 0 },
                        { action: Action.RIGHT, dx: 1, dy: 0 },
                        { action: Action.UP, dx: 0, dy: -1 },
                        { action: Action.DOWN, dx: 0, dy: 1 },
                    ];

                    for (const dir of directions) {
                        const newX = current.x + dir.dx;
                        const newY = current.y + dir.dy;
                        const key = `${newX},${newY}`;

                        if (!this.visited.has(key)) {
                            this.visited.add(key);
                            this.toVisit.push({
                                x: newX,
                                y: newY,
                                path: [...current.path, dir.action],
                            });
                        }
                    }
                }
                if (this.pathToFollow.length > 0) {
                    return this.pathToFollow.shift()!;
                }
            }
        }

        // continue exploring to find blocks
        return this.exploreAction(cell);
    }

    // Logic for building staircase
    private buildStaircaseAction(cell: CellInfo): Action {
        // find start of staircase start point if not there
        if (this.staircaseStart === null) {
            this.staircaseStart = { ...this.currentPosition }; // x,y,level
            this.staircaseBuilt = 0;
        }

        // if path to follow, continue following it
        if (this.pathToFollow.length > 0) {
            return this.pathToFollow.shift()!;
        }

        // if were at the right position to build the next stair
        if (this.staircaseBuilt < this.treasureLocation!.level) {
            // drop block to build stair
            if (this.collectedBlocks > 0) {
                --this.collectedBlocks;
                ++this.staircaseBuilt;
                return Action.DROP;
            }
        }

        // if weve built all the stairs needed, try to reach the treasure
        if (this.staircaseBuilt === this.treasureLocation!.level) {
            // if were at the treasure, weve won/done
            if (cell.type === CellType.GOLD) {
                return Action.PICKUP;
            }

            // simplified -- doesnt handle complex terrain where you might need to
            // navigate around obstracles, etc, hence should use BFS
            const directions = [
                { action: Action.LEFT, dx: -1, dy: 0, cell: cell.left },
                { action: Action.RIGHT, dx: 1, dy: 0, cell: cell.right },
                { action: Action.UP, dx: 0, dy: -1, cell: cell.up },
                { action: Action.DOWN, dx: 0, dy: 1, cell: cell.down },
            ];

            for (const dir of directions) {
                if (
                    dir.cell.type == CellType.GOLD &&
                    Math.abs(dir.cell.level - cell.level) <= 1
                ) {
                    return dir.action;
                }
            }
        }
        // fallback -- explore to find more blocks or better position
        return this.exploreAction(cell);
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;
