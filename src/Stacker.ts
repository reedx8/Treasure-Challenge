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
    private collectedBlocks = 0;
    private requiredBlocks = 0;
    private buildingStaircase = false;
    private explored = new Set<string>();
    private currentPosition = { x: 0, y: 0, level: 0 };

    // Keep track of the path we're following
    private pathToFollow: Action[] = [];

    // For BFS
    private visited = new Set<string>();
    private toVisit: { x: number; y: number; path: Action[] }[] = [];

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
    private exploreAction(cell: any): Action {
        // Logic for exploration
        return Action.LEFT; // to remove type checking error for now
    }

    private collectBlocksAction(cell: any): Action {
        // Logic for collecting blocks
        return Action.PICKUP; // to remove type checking error for now
    }

    private buildStaircaseAction(cell: any): Action {
        // Logic for building staircase
        return Action.DROP; // to remove type checking error for now
    }
}

// Add Stacker to the global window object for use in the challenge.js file
declare global {
    interface Window {
        Stacker: typeof Stacker;
    }
}

window.Stacker = Stacker;
