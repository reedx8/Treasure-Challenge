/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Stacker.ts":
/*!************************!*\
  !*** ./src/Stacker.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var Action_1 = __webpack_require__(/*! ./lib/Action */ "./src/lib/Action.ts");
var CellType_1 = __webpack_require__(/*! ./lib/CellType */ "./src/lib/CellType.ts");
var Stacker = /** @class */ (function () {
    function Stacker() {
        var _this = this;
        this.treasureFound = false; // if we have found the treasure on map
        // private treasureLocation: { x: number; y: number; level: number } | null;
        this.towerLocation = null; // x,y location of tower on map
        // private collectedBlocks = 0; // the block we have currently in hand, to build the staircase
        // private requiredBlocks = 0;
        // private buildingStaircase = false;
        this.holdingBlock = false; // if we are holding a block
        this.explored = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
        this.current = null; // current x,y position on map
        this.origin = { x: 0, y: 0 }; // orogin cell of entire coordinate system
        this.backtrack = {
            inProgress: false,
        };
        // Keep track of the path we're following
        // private pathToFollow: Action[] = [];
        // For BFS/DFS traversal
        this.path = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
        // private visited = new Set<string>();
        this.toVisit = []; // list of cells to visit next
        // private toVisit: { x: number; y: number; path: Action[] }[] = []; // list of cells to visit immediately in (x,y,path) format
        // private doneVisiting = false; // not used
        this.turn = function (cell) {
            // Greedy pickup
            if (cell.type === CellType_1.CellType.BLOCK &&
                !_this.holdingBlock &&
                !_this.towerLocation // TODO: should be able to pick up block when tower is found too obv, but avoids never-ending pickup/drop loop at end for now
            ) {
                _this.holdingBlock = true;
                console.log('PICKUP');
                return Action_1.Action.PICKUP;
            }
            // Phase 1: Update position and traverse map for tower (backtrack if nec.).
            if (_this.current === null) {
                // at beginning of run
                _this.current = __assign({}, _this.origin);
                _this.updatePath(_this.current);
                // console.log(
                //     'current (begin): ' + this.current.x + ',' + this.current.y
                // );
                return _this.traverseMap(cell);
            }
            else if (!_this.towerLocation) {
                if (_this.backtrack.inProgress) {
                    _this.current = _this.path.pop(); // should sync with cell
                }
                else {
                    _this.current = _this.toVisit.pop();
                    // this.updatePath(this.current);
                }
                _this.updatePath(_this.current);
                // console.log('current: ' + this.current.x + ',' + this.current.y);
                // this.current = this.toVisit.pop(); // This wont work on its own as we want it when stuck/should backtrack and will continue pulling from toVisit at those points
                return _this.traverseMap(cell);
            }
            else {
                // Phase 2: Tower located
                console.log('STOP | tower found: ' +
                    _this.towerLocation.x +
                    ',' +
                    _this.towerLocation.y);
                if (_this.holdingBlock) {
                    console.log('DROP');
                    _this.holdingBlock = false;
                }
                // TODO: needs to drop only under certain conditions
                return Action_1.Action.DROP; // 2nd drop: placeholder for now (stays in place while dropping too)
            }
            // Phase 3: Collect blocks
            // Phase 4: Build staircase to treasure
        };
    }
    // traverse map by adding to toVisit (BFS?)
    Stacker.prototype.traverseMap = function (cell) {
        // let traversedEntireMap = 4;
        var canMove = false;
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
            return Action_1.Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
        }
        if (canMove) {
            this.backtrack.inProgress = false;
            return this.getNextAction();
        }
        else {
            // console.log('cant move: ' + this.current.x + ',' + this.current.y);
            if (this.current.x === 0 && this.current.y === 0) {
                console.log('End of journey/run');
                return Action_1.Action.DROP; // placeholder for now, troll stays in place
            }
            return this.backtrackAction();
        }
        // return this.getNextAction(); // DFS due to pop()?
    };
    Stacker.prototype.findTower = function (direction, dx, dy) {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
            };
        }
    };
    // Begin backtracking
    Stacker.prototype.backtrackAction = function () {
        this.backtrack.inProgress = true;
        // x and y direction to backtrack to:
        this.path.pop();
        var xDirection = this.path.slice(-1)[0].x - this.current.x;
        var yDirection = this.path.slice(-1)[0].y - this.current.y;
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
            return Action_1.Action.UP;
        }
        else if (yDirection > 0) {
            // this.backtrack.down = yDirection;
            console.log('go back v');
            return Action_1.Action.DOWN;
        }
        else if (xDirection < 0) {
            // this.backtrack.left = xDirection;
            console.log('go back <-');
            return Action_1.Action.LEFT;
        }
        else if (xDirection > 0) {
            // this.backtrack.right = xDirection;
            console.log('go back ->');
            return Action_1.Action.RIGHT;
        }
        else {
            console.log('nothing to backtrack to');
            // TODO: should return an action here
        }
    };
    Stacker.prototype.getNextAction = function () {
        // derives next Action based on our coordinates (could remove origin since always 0):
        var x = this.origin.x - this.current.x + this.toVisit.slice(-1)[0].x; // last toVisit due to using pop()
        var y = this.origin.y - this.current.y + this.toVisit.slice(-1)[0].y;
        if (x < 0) {
            // left: -1x
            return Action_1.Action.LEFT;
        }
        else if (x > 0) {
            // right: +1x
            return Action_1.Action.RIGHT;
        }
        else if (y < 0) {
            // up: -1y
            return Action_1.Action.UP;
        }
        else if (y > 0) {
            // down: +1y
            return Action_1.Action.DOWN;
        }
        else {
            // x=0 and y=0 when visited all cells on map
            // this.toVisit.pop();
            // this.doneVisiting = true;
            // return Action.PICKUP; // placeholder for now , stays in place
        }
    };
    // add to explored and path cells if not already in there
    Stacker.prototype.updatePath = function (position) {
        if (!this.explored.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.explored.push(__assign({}, position));
        }
        if (!this.path.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.path.push(__assign({}, position));
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
    };
    ////////////////////////////////////////////////////////////////////////////////////
    // Check if cell is valid to move to (if not wall, not already visited in path, and 1 level away)
    Stacker.prototype.isValidCell = function (cell, // current cell
    direction, dx, dy) {
        var _this = this;
        // current should === cell
        if (direction.type !== CellType_1.CellType.WALL &&
            Math.abs(direction.level - cell.level) <= 1 &&
            !this.path.some(function (v) {
                return v.x === _this.current.x + dx && v.y === _this.current.y + dy;
            }) &&
            !this.explored.some(function (e) {
                return e.x === _this.current.x + dx && e.y === _this.current.y + dy;
            })) {
            return true;
        }
        return false;
        // TODO: what about for CellType.GOLD?
    };
    // TODO: calculate required number of blocks to collect for building staircase (not used)
    Stacker.prototype.calculateRequiredBlocks = function (level) {
        // using the triangular number formula: (n-1)n/2
        return Math.floor(((level - 1) * level) / 2);
    };
    return Stacker;
}());
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


/***/ }),

/***/ "./src/lib/Action.ts":
/*!***************************!*\
  !*** ./src/lib/Action.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Action = void 0;
// This is the list of actions that the Stacker can take
var Action;
(function (Action) {
    Action["LEFT"] = "left";
    Action["UP"] = "up";
    Action["RIGHT"] = "right";
    Action["DOWN"] = "down";
    Action["PICKUP"] = "pickup";
    Action["DROP"] = "drop";
})(Action || (exports.Action = Action = {}));


/***/ }),

/***/ "./src/lib/CellType.ts":
/*!*****************************!*\
  !*** ./src/lib/CellType.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CellType = void 0;
var CellType;
(function (CellType) {
    CellType[CellType["EMPTY"] = 0] = "EMPTY";
    CellType[CellType["WALL"] = 1] = "WALL";
    CellType[CellType["BLOCK"] = 2] = "BLOCK";
    CellType[CellType["GOLD"] = 3] = "GOLD";
})(CellType || (exports.CellType = CellType = {}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/Stacker.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFlLGdCQUFnQixnQkFBZ0I7Ozs7Ozs7VUNUaEQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9TdGFja2VyLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQWN0aW9uLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQ2VsbFR5cGUudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8qXG41IGRpZmZmZXJlbnQgcGhhc2VzOlxuMC4gdHJhdmVyc2FsIGFsZ29cbjEuIHRvd2VyIGZpbmRlciBhbGdvIChzZWFyY2ggYWxnbyAtLSBiZnMpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uXG4yLiBmaW5kIHNob3J0ZXN0IHBhdGggdG8gdG93ZXJcbjMuIGNvbGxlY3QgYmxvY2tzIGFsZ28gKHNlYXJjaCBhbGdvKVxuNC4gYnVpbGQgc3RhaXJjYXNlIGFsZ29cblxuLSBFYWNoIHJ1biBoYXMgc2V2ZXJhbCBqb3VybmV5c1xuLSBFYWNoIGpvdXJuZXkgaGFzIGl0cyBvd24gbGlzdCBvZiAncGF0aCcgYmxvY2tzLCBoZW5jZSBgcGF0aGAgc2V0IGNsZWFycyByb3V0aW5lbHkgKGVnIHRvd2VyIGZvdW5kLCBibGFjayBhZGRlZCB0byBzdGFpcmNhc2UsIGV0YywgYXJlIGFsbCBkaWZmZXJlbnQgaW5kaXZpZHVhbCBqb3VybmllcyB3aXRoaW4gYSBzaW5nbGUgcnVuKVxuLSBleHBsb3JlZCBpcyBhIGxpc3Qgb2YgYWxsIGV4cGxvcmVkIGNlbGxzIGluIHJ1biwgbmV2ZXIgdG8gYmUgcmVzZXQgaW4gYSBzaW5nbGUgcnVuLlxuKi9cbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgQWN0aW9uXzEgPSByZXF1aXJlKFwiLi9saWIvQWN0aW9uXCIpO1xudmFyIENlbGxUeXBlXzEgPSByZXF1aXJlKFwiLi9saWIvQ2VsbFR5cGVcIik7XG52YXIgU3RhY2tlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFja2VyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRyZWFzdXJlRm91bmQgPSBmYWxzZTsgLy8gaWYgd2UgaGF2ZSBmb3VuZCB0aGUgdHJlYXN1cmUgb24gbWFwXG4gICAgICAgIC8vIHByaXZhdGUgdHJlYXN1cmVMb2NhdGlvbjogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgbGV2ZWw6IG51bWJlciB9IHwgbnVsbDtcbiAgICAgICAgdGhpcy50b3dlckxvY2F0aW9uID0gbnVsbDsgLy8geCx5IGxvY2F0aW9uIG9mIHRvd2VyIG9uIG1hcFxuICAgICAgICAvLyBwcml2YXRlIGNvbGxlY3RlZEJsb2NrcyA9IDA7IC8vIHRoZSBibG9jayB3ZSBoYXZlIGN1cnJlbnRseSBpbiBoYW5kLCB0byBidWlsZCB0aGUgc3RhaXJjYXNlXG4gICAgICAgIC8vIHByaXZhdGUgcmVxdWlyZWRCbG9ja3MgPSAwO1xuICAgICAgICAvLyBwcml2YXRlIGJ1aWxkaW5nU3RhaXJjYXNlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmV2ZXIgcmVtb3ZlZCAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24gb24gbWFwXG4gICAgICAgIHRoaXMub3JpZ2luID0geyB4OiAwLCB5OiAwIH07IC8vIG9yb2dpbiBjZWxsIG9mIGVudGlyZSBjb29yZGluYXRlIHN5c3RlbVxuICAgICAgICB0aGlzLmJhY2t0cmFjayA9IHtcbiAgICAgICAgICAgIGluUHJvZ3Jlc3M6IGZhbHNlLFxuICAgICAgICB9O1xuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBwYXRoIHdlJ3JlIGZvbGxvd2luZ1xuICAgICAgICAvLyBwcml2YXRlIHBhdGhUb0ZvbGxvdzogQWN0aW9uW10gPSBbXTtcbiAgICAgICAgLy8gRm9yIEJGUy9ERlMgdHJhdmVyc2FsXG4gICAgICAgIHRoaXMucGF0aCA9IFtdOyAvLyBUaGUgcGF0aCBhY3R1YWxseSB0YWtlbiB0aHVzIGZhciBmb3IgZWFjaCBqb3VybmV5L3J1biAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBuZWVkZWQpXG4gICAgICAgIC8vIHByaXZhdGUgdmlzaXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byB2aXNpdCBuZXh0XG4gICAgICAgIC8vIHByaXZhdGUgdG9WaXNpdDogeyB4OiBudW1iZXI7IHk6IG51bWJlcjsgcGF0aDogQWN0aW9uW10gfVtdID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgaW1tZWRpYXRlbHkgaW4gKHgseSxwYXRoKSBmb3JtYXRcbiAgICAgICAgLy8gcHJpdmF0ZSBkb25lVmlzaXRpbmcgPSBmYWxzZTsgLy8gbm90IHVzZWRcbiAgICAgICAgdGhpcy50dXJuID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgIC8vIEdyZWVkeSBwaWNrdXBcbiAgICAgICAgICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiZcbiAgICAgICAgICAgICAgICAhX3RoaXMuaG9sZGluZ0Jsb2NrICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLnRvd2VyTG9jYXRpb24gLy8gVE9ETzogc2hvdWxkIGJlIGFibGUgdG8gcGljayB1cCBibG9jayB3aGVuIHRvd2VyIGlzIGZvdW5kIHRvbyBvYnYsIGJ1dCBhdm9pZHMgbmV2ZXItZW5kaW5nIHBpY2t1cC9kcm9wIGxvb3AgYXQgZW5kIGZvciBub3dcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BJQ0tVUCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUElDS1VQO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGhhc2UgMTogVXBkYXRlIHBvc2l0aW9uIGFuZCB0cmF2ZXJzZSBtYXAgZm9yIHRvd2VyIChiYWNrdHJhY2sgaWYgbmVjLikuXG4gICAgICAgICAgICBpZiAoX3RoaXMuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIGF0IGJlZ2lubmluZyBvZiBydW5cbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX19hc3NpZ24oe30sIF90aGlzLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAvLyAgICAgJ2N1cnJlbnQgKGJlZ2luKTogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnlcbiAgICAgICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmJhY2t0cmFjay5pblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfdGhpcy5wYXRoLnBvcCgpOyAvLyBzaG91bGQgc3luYyB3aXRoIGNlbGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnVwZGF0ZVBhdGgodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudDogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudCA9IHRoaXMudG9WaXNpdC5wb3AoKTsgLy8gVGhpcyB3b250IHdvcmsgb24gaXRzIG93biBhcyB3ZSB3YW50IGl0IHdoZW4gc3R1Y2svc2hvdWxkIGJhY2t0cmFjayBhbmQgd2lsbCBjb250aW51ZSBwdWxsaW5nIGZyb20gdG9WaXNpdCBhdCB0aG9zZSBwb2ludHNcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBQaGFzZSAyOiBUb3dlciBsb2NhdGVkXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NUT1AgfCB0b3dlciBmb3VuZDogJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueCArXG4gICAgICAgICAgICAgICAgICAgICcsJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmhvbGRpbmdCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZHMgdG8gZHJvcCBvbmx5IHVuZGVyIGNlcnRhaW4gY29uZGl0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gMm5kIGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgKHN0YXlzIGluIHBsYWNlIHdoaWxlIGRyb3BwaW5nIHRvbylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDM6IENvbGxlY3QgYmxvY2tzXG4gICAgICAgICAgICAvLyBQaGFzZSA0OiBCdWlsZCBzdGFpcmNhc2UgdG8gdHJlYXN1cmVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gdHJhdmVyc2UgbWFwIGJ5IGFkZGluZyB0byB0b1Zpc2l0IChCRlM/KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnRyYXZlcnNlTWFwID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgLy8gbGV0IHRyYXZlcnNlZEVudGlyZU1hcCA9IDQ7XG4gICAgICAgIHZhciBjYW5Nb3ZlID0gZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAvLyBvbmx5IGZpbmQgdG93ZXIgb25jZVxuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC51cCwgMCwgLTEpO1xuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC5sZWZ0LCAtMSwgMCk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLmRvd24sIDAsIDEpO1xuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC5yaWdodCwgMSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRvIHRvVmlzaXQgc3RhY2sgaWYgdmFsaWQgY2VsbCBpbiBvcmRlciB0byB0cmF2ZXJzZSBtYXBcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC51cCwgMCwgLTEpKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54LCB5OiB0aGlzLmN1cnJlbnQueSAtIDEgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRDZWxsKGNlbGwsIGNlbGwubGVmdCwgLTEsIDApKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54IC0gMSwgeTogdGhpcy5jdXJyZW50LnkgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5kb3duLCAwLCAxKSkge1xuICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goeyB4OiB0aGlzLmN1cnJlbnQueCwgeTogdGhpcy5jdXJyZW50LnkgKyAxIH0pO1xuICAgICAgICAgICAgY2FuTW92ZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRDZWxsKGNlbGwsIGNlbGwucmlnaHQsIDEsIDApKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54ICsgMSwgeTogdGhpcy5jdXJyZW50LnkgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIC8vIFRvd2VyIGxjYXRlZCBzb21ld2hlcmUgaW4gY2VsbCdzIGltbWVkLiBuZWlnaGJvcmluZyBjZWxscy4uLlxuICAgICAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEUk9QJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIEZpcnN0IGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgdG8gZXhpdCBlYXJseSwgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5iYWNrdHJhY2suaW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NhbnQgbW92ZTogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC54ID09PSAwICYmIHRoaXMuY3VycmVudC55ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VuZCBvZiBqb3VybmV5L3J1bicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJhY2t0cmFja0FjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTsgLy8gREZTIGR1ZSB0byBwb3AoKT9cbiAgICB9O1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRUb3dlciA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLmxldmVsID09PSA4ICYmICF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIGR4LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgZHksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBCZWdpbiBiYWNrdHJhY2tpbmdcbiAgICBTdGFja2VyLnByb3RvdHlwZS5iYWNrdHJhY2tBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYmFja3RyYWNrLmluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAvLyB4IGFuZCB5IGRpcmVjdGlvbiB0byBiYWNrdHJhY2sgdG86XG4gICAgICAgIHRoaXMucGF0aC5wb3AoKTtcbiAgICAgICAgdmFyIHhEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggLSB0aGlzLmN1cnJlbnQueDtcbiAgICAgICAgdmFyIHlEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnkgLSB0aGlzLmN1cnJlbnQueTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXG4gICAgICAgIC8vICAgICAncHJldiBwYXRoOiAnICtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggK1xuICAgICAgICAvLyAgICAgICAgICcsJyArXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55XG4gICAgICAgIC8vICk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXJyZW50IChidCk6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3hEaXJlY3Rpb246ICcgKyB4RGlyZWN0aW9uKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3lEaXJlY3Rpb246ICcgKyB5RGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKHlEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay51cCA9IE1hdGguYWJzKHlEaXJlY3Rpb24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgXicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2suZG93biA9IHlEaXJlY3Rpb247XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayB2Jyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLmxlZnQgPSB4RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgPC0nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2sucmlnaHQgPSB4RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgLT4nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm90aGluZyB0byBiYWNrdHJhY2sgdG8nKTtcbiAgICAgICAgICAgIC8vIFRPRE86IHNob3VsZCByZXR1cm4gYW4gYWN0aW9uIGhlcmVcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZ2V0TmV4dEFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gZGVyaXZlcyBuZXh0IEFjdGlvbiBiYXNlZCBvbiBvdXIgY29vcmRpbmF0ZXMgKGNvdWxkIHJlbW92ZSBvcmlnaW4gc2luY2UgYWx3YXlzIDApOlxuICAgICAgICB2YXIgeCA9IHRoaXMub3JpZ2luLnggLSB0aGlzLmN1cnJlbnQueCArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueDsgLy8gbGFzdCB0b1Zpc2l0IGR1ZSB0byB1c2luZyBwb3AoKVxuICAgICAgICB2YXIgeSA9IHRoaXMub3JpZ2luLnkgLSB0aGlzLmN1cnJlbnQueSArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueTtcbiAgICAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgICAgICAvLyBsZWZ0OiAtMXhcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICAgICAgLy8gcmlnaHQ6ICsxeFxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5IDwgMCkge1xuICAgICAgICAgICAgLy8gdXA6IC0xeVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5ID4gMCkge1xuICAgICAgICAgICAgLy8gZG93bjogKzF5XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB4PTAgYW5kIHk9MCB3aGVuIHZpc2l0ZWQgYWxsIGNlbGxzIG9uIG1hcFxuICAgICAgICAgICAgLy8gdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5kb25lVmlzaXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgLy8gcmV0dXJuIEFjdGlvbi5QSUNLVVA7IC8vIHBsYWNlaG9sZGVyIGZvciBub3cgLCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBhZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggY2VsbHMgaWYgbm90IGFscmVhZHkgaW4gdGhlcmVcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVQYXRoID0gZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudDogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGV4cGxvcmVkIHNldFxuICAgICAgICAvLyBjb25zdCBrZXkgPSBgJHt0aGlzLmN1cnJlbnRQb3NpdGlvbi54fSwke3RoaXMuY3VycmVudFBvc2l0aW9uLnl9YDtcbiAgICAgICAgLy8gdGhpcy5leHBsb3JlZC5hZGQoa2V5KTtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGJsb2NrcyBpbiB0aGUgc3Vycm91bmRpbmcgY2VsbHNcbiAgICAgICAgLy8gY29uc3QgbmVpZ2hib3JzID0gW1xuICAgICAgICAvLyAgICAgeyBkaXI6ICdsZWZ0JywgZHg6IC0xLCBkeTogMCB9LCAvLyBkeCA9IGxlZnQvcmlnaHQgZGlyZWN0aW9uLCBkeSA9IHVwL2Rvd24gZGlyZWN0aW9uXG4gICAgICAgIC8vICAgICB7IGRpcjogJ3VwJywgZHg6IDAsIGR5OiAtMSB9LFxuICAgICAgICAvLyAgICAgeyBkaXI6ICdyaWdodCcsIGR4OiAxLCBkeTogMCB9LFxuICAgICAgICAvLyAgICAgeyBkaXI6ICdkb3duJywgZHg6IDAsIGR5OiAxIH0sXG4gICAgICAgIC8vIF07XG4gICAgICAgIC8vIGZvciAoY29uc3QgbmVpZ2hib3Igb2YgbmVpZ2hib3JzKSB7XG4gICAgICAgIC8vICAgICBjb25zdCBuZWlnaGJvckNlbGwgPSBjZWxsW25laWdoYm9yLmRpciBhcyBrZXlvZiBDZWxsSW5mb10gYXMge1xuICAgICAgICAvLyAgICAgICAgIHR5cGU6IENlbGxUeXBlO1xuICAgICAgICAvLyAgICAgICAgIGxldmVsOiBudW1iZXI7XG4gICAgICAgIC8vICAgICB9O1xuICAgICAgICAvLyAgICAgLy8gY29sbGVjdCBsb2NhdGlvbiBvZiBibG9ja3Mgb24gbWFwIHRvIGltcHJvdmUgcGVyZm9ybWFuY2U/XG4gICAgICAgIC8vICAgICBpZiAobmVpZ2hib3JDZWxsLnR5cGUgPT09IENlbGxUeXBlLkJMT0NLKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc3QgYmxvY2tYID0gdGhpcy5jdXJyZW50UG9zaXRpb24ueCArIG5laWdoYm9yLmR4O1xuICAgICAgICAvLyAgICAgICAgIGNvbnN0IGJsb2NrWSA9IHRoaXMuY3VycmVudFBvc2l0aW9uLnkgKyBuZWlnaGJvci5keTtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBibG9ja0tleSA9IGAke2Jsb2NrWH0sJHtibG9ja1l9YDsgLy8gVE9ETzogbm90IHVzZWQgeWV0XG4gICAgICAgIC8vICAgICAgICAgLy8gQWRkIHRvIGtub3duIGJsb2NrcyBpZiBub3QgYWxyZWFkeSB0aGVyZVxuICAgICAgICAvLyAgICAgICAgIGlmICh0aGlzLmtub3duQmxvY2tzLmhhcyhibG9ja0tleSkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5rbm93bkJsb2Nrcy5hZGQoYmxvY2tLZXkpO1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuICAgIH07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2sgaWYgY2VsbCBpcyB2YWxpZCB0byBtb3ZlIHRvIChpZiBub3Qgd2FsbCwgbm90IGFscmVhZHkgdmlzaXRlZCBpbiBwYXRoLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLmlzVmFsaWRDZWxsID0gZnVuY3Rpb24gKGNlbGwsIC8vIGN1cnJlbnQgY2VsbFxuICAgIGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIGN1cnJlbnQgc2hvdWxkID09PSBjZWxsXG4gICAgICAgIGlmIChkaXJlY3Rpb24udHlwZSAhPT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5XQUxMICYmXG4gICAgICAgICAgICBNYXRoLmFicyhkaXJlY3Rpb24ubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxICYmXG4gICAgICAgICAgICAhdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdi54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiB2LnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkgJiZcbiAgICAgICAgICAgICF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZS54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiBlLnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gVE9ETzogd2hhdCBhYm91dCBmb3IgQ2VsbFR5cGUuR09MRD9cbiAgICB9O1xuICAgIC8vIFRPRE86IGNhbGN1bGF0ZSByZXF1aXJlZCBudW1iZXIgb2YgYmxvY2tzIHRvIGNvbGxlY3QgZm9yIGJ1aWxkaW5nIHN0YWlyY2FzZSAobm90IHVzZWQpXG4gICAgU3RhY2tlci5wcm90b3R5cGUuY2FsY3VsYXRlUmVxdWlyZWRCbG9ja3MgPSBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICAgICAgLy8gdXNpbmcgdGhlIHRyaWFuZ3VsYXIgbnVtYmVyIGZvcm11bGE6IChuLTEpbi8yXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKCgobGV2ZWwgLSAxKSAqIGxldmVsKSAvIDIpO1xuICAgIH07XG4gICAgcmV0dXJuIFN0YWNrZXI7XG59KCkpO1xud2luZG93LlN0YWNrZXIgPSBTdGFja2VyO1xuLy8gVE9ETzogSGVscGVyIG1ldGhvZHMgZm9yIGRpZmZlcmVudCBwaGFzZXNcbi8vIHByaXZhdGUgZXhwbG9yZUFjdGlvbihjZWxsOiBDZWxsSW5mbyk6IEFjdGlvbiB7XG4vLyAgICAgLy8gTG9naWMgZm9yIGV4cGxvcmF0aW9uIChCRlMpXG4vLyAgICAgaWYgKHRoaXMudG9WaXNpdC5sZW5ndGggPT09IDApIHtcbi8vICAgICAgICAgLy8gaWYganVzdCBzdGFydGluZy4uLlxuLy8gICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7XG4vLyAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnRQb3NpdGlvbi54LFxuLy8gICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50UG9zaXRpb24ueSxcbi8vICAgICAgICAgICAgIHBhdGg6IFtdLFxuLy8gICAgICAgICB9KTtcbi8vICAgICAgICAgdGhpcy5wYXRoLmNsZWFyKCk7IC8vIEROVTogc2hvdWxkbnQgbmVlZCB0aGlzIGlmIGp1c3QgYmVnaW5uaW5nLCBzbyB0aGlzIGNvdWRsIGJlIHVzZWQgd2hlbiB3ZSBhcmUgYXQgdGhlIHRhcmdldCBwZXJoYXBzIG9yIHNvbWUgb3RoZXIgY29uZGl0aW9uIHdoZW4gdG9WaXNpdCBpcyBlbXB0eVxuLy8gICAgICAgICB0aGlzLnBhdGguYWRkKFxuLy8gICAgICAgICAgICAgYCR7dGhpcy5jdXJyZW50UG9zaXRpb24ueH0sJHt0aGlzLmN1cnJlbnRQb3NpdGlvbi55fWBcbi8vICAgICAgICAgKTtcbi8vICAgICB9XG4vLyAgICAgLy8gcHJvY2VzcyBuZXh0IGNlbGwgaW4gQkZTIHF1ZXVlIGlmIGNlbGxzIHN0aWwgdG8gdmlzaXRcbi8vICAgICB3aGlsZSAodGhpcy50b1Zpc2l0Lmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMudG9WaXNpdC5zaGlmdCgpOyAvLyBtYWtlcyBhcnJheS9saXN0IGEgcXVldWUgYnkgdXNpbmcgc2hpZnRcbi8vICAgICAgICAgLy8gRE5VOiBmb2xsb3cgdGhlIHBhdGggaWYgYXQgdGFyZ2V0IChpZSBleGl0IGFuZCBmb2xsb3cgcGF0aCBpbnN0ZWFkIG9mIGV4cGxvcmluZz8pXG4vLyAgICAgICAgIGlmIChcbi8vICAgICAgICAgICAgIGN1cnJlbnQueCA9PT0gdGhpcy5jdXJyZW50UG9zaXRpb24ueCAmJlxuLy8gICAgICAgICAgICAgY3VycmVudC55ID09PSB0aGlzLmN1cnJlbnRQb3NpdGlvbi55ICYmXG4vLyAgICAgICAgICAgICBjdXJyZW50LnBhdGgubGVuZ3RoID4gMFxuLy8gICAgICAgICApIHtcbi8vICAgICAgICAgICAgIHRoaXMucGF0aFRvRm9sbG93ID0gWy4uLmN1cnJlbnQucGF0aF07XG4vLyAgICAgICAgICAgICByZXR1cm4gdGhpcy5wYXRoVG9Gb2xsb3cuc2hpZnQoKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICAvLyBjaGVjayBhbGwgbmVpZ2hib3JzXG4vLyAgICAgICAgIGNvbnN0IGRpcmVjdGlvbnMgPSBbXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkxFRlQsIGR4OiAtMSwgZHk6IDAsIGNlbGw6IGNlbGwubGVmdCB9LFxuLy8gICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5SSUdIVCwgZHg6IDEsIGR5OiAwLCBjZWxsOiBjZWxsLnJpZ2h0IH0sXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLlVQLCBkeDogMCwgZHk6IC0xLCBjZWxsOiBjZWxsLnVwIH0sXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkRPV04sIGR4OiAwLCBkeTogMSwgY2VsbDogY2VsbC5kb3duIH0sXG4vLyAgICAgICAgIF07XG4vLyAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcmVjdGlvbnMpIHtcbi8vICAgICAgICAgICAgIGlmIChcbi8vICAgICAgICAgICAgICAgICBkaXIuY2VsbC50eXBlICE9PSBDZWxsVHlwZS5XQUxMICYmXG4vLyAgICAgICAgICAgICAgICAgTWF0aC5hYnMoZGlyLmNlbGwubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxXG4vLyAgICAgICAgICAgICApIHtcbi8vICAgICAgICAgICAgICAgICBjb25zdCBuZXdYID0gY3VycmVudC54ICsgZGlyLmR4O1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IG5ld1kgPSBjdXJyZW50LnkgKyBkaXIuZHk7XG4vLyAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7bmV3WH0sJHtuZXdZfWA7XG4vLyAgICAgICAgICAgICAgICAgLy8gaWYgbm90IHBhdGgsIGFkZCB0byB0b1Zpc2l0IHF1ZXVlLiBNYWluIHdheSB0byB0cmF2ZXJzZSB0aGUgbWFwIGhlcmVcbi8vICAgICAgICAgICAgICAgICBpZiAoIXRoaXMucGF0aC5oYXMoa2V5KSkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGguYWRkKGtleSk7XG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHg6IG5ld1gsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB5OiBuZXdZLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogWy4uLmN1cnJlbnQucGF0aCwgZGlyLmFjdGlvbl0sIC8vIEROVVxuLy8gICAgICAgICAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgLy8gaWYgbm8gcGF0aCBmb3VuZCwgdGFrZSBhIHJhbmRvbSB2YWxpZCBtb3ZlXG4vLyAgICAgY29uc3QgdmFsaWRNb3ZlcyA9IFtdO1xuLy8gICAgIGlmIChcbi8vICAgICAgICAgY2VsbC5sZWZ0LnR5cGUgIT09IENlbGxUeXBlLldBTEwgJiZcbi8vICAgICAgICAgTWF0aC5hYnMoY2VsbC5sZWZ0LmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMVxuLy8gICAgICkge1xuLy8gICAgICAgICB2YWxpZE1vdmVzLnB1c2goQWN0aW9uLkxFRlQpO1xuLy8gICAgIH1cbi8vICAgICBpZiAoXG4vLyAgICAgICAgIGNlbGwucmlnaHQudHlwZSAhPT0gQ2VsbFR5cGUuV0FMTCAmJlxuLy8gICAgICAgICBNYXRoLmFicyhjZWxsLnJpZ2h0LmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMVxuLy8gICAgICkge1xuLy8gICAgICAgICB2YWxpZE1vdmVzLnB1c2goQWN0aW9uLlJJR0hUKTtcbi8vICAgICB9XG4vLyAgICAgaWYgKFxuLy8gICAgICAgICBjZWxsLnVwLnR5cGUgIT09IENlbGxUeXBlLldBTEwgJiZcbi8vICAgICAgICAgTWF0aC5hYnMoY2VsbC51cC5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDFcbi8vICAgICApIHtcbi8vICAgICAgICAgdmFsaWRNb3Zlcy5wdXNoKEFjdGlvbi5VUCk7XG4vLyAgICAgfVxuLy8gICAgIGlmIChcbi8vICAgICAgICAgY2VsbC5kb3duLnR5cGUgIT09IENlbGxUeXBlLldBTEwgJiZcbi8vICAgICAgICAgTWF0aC5hYnMoY2VsbC5kb3duLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMVxuLy8gICAgICkge1xuLy8gICAgICAgICB2YWxpZE1vdmVzLnB1c2goQWN0aW9uLkRPV04pO1xuLy8gICAgIH1cbi8vICAgICBpZiAodmFsaWRNb3Zlcy5sZW5ndGggPiAwKSB7XG4vLyAgICAgICAgIHJldHVybiB2YWxpZE1vdmVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHZhbGlkTW92ZXMubGVuZ3RoKV07XG4vLyAgICAgfVxuLy8gICAgIC8vIHNob3VsZG50IGhhcHBlbiB3aXRoIEJGUywgYnV0IGZhbGxiYWNrIG5vbmV0aGVsZXNzXG4vLyAgICAgcmV0dXJuIEFjdGlvbi5MRUZUO1xuLy8gfVxuLy8gTG9naWMgZm9yIGNvbGxlY3RpbmcgYmxvY2tzXG4vLyBwcml2YXRlIGNvbGxlY3RCbG9ja3NBY3Rpb24oY2VsbDogQ2VsbEluZm8pOiBBY3Rpb24ge1xuLy8gICAgIC8vIHBpY2sgdXAgYmxvY2sgaWYgb24gaXQgYW5kIHJldHVybiBhbiBBY3Rpb25cbi8vICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZS5CTE9DSykge1xuLy8gICAgICAgICArK3RoaXMuY29sbGVjdGVkQmxvY2tzO1xuLy8gICAgICAgICByZXR1cm4gQWN0aW9uLlBJQ0tVUDtcbi8vICAgICB9XG4vLyAgICAgLy8gaWYgd2UgaGF2ZSBhIHRhcmdldCBibG9jaywgZm9sbG93IHRoZSBwYXRoIHRvIGl0XG4vLyAgICAgaWYgKHRoaXMudGFyZ2V0QmxvY2sgPT09IG51bGwpIHtcbi8vICAgICAgICAgLy8gZmluZCBuZWFyZXN0IGJsb2NrXG4vLyAgICAgICAgIGlmICh0aGlzLmtub3duQmxvY2tzLmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgICAgIHRoaXMudGFyZ2V0QmxvY2sgPSB0aGlzLmtub3duQmxvY2tzLnNoaWZ0KCk7XG4vLyAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgcGF0aCB0byB0YXJnZXQgYmxvY2sgdXNpbmcgQkZTXG4vLyAgICAgICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXG4vLyAgICAgICAgICAgICAgICAge1xuLy8gICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnRQb3NpdGlvbi54LFxuLy8gICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnRQb3NpdGlvbi55LFxuLy8gICAgICAgICAgICAgICAgICAgICBwYXRoOiBbXSxcbi8vICAgICAgICAgICAgICAgICB9LFxuLy8gICAgICAgICAgICAgXTtcbi8vICAgICAgICAgICAgIHRoaXMucGF0aC5jbGVhcigpO1xuLy8gICAgICAgICAgICAgdGhpcy5wYXRoLmFkZChcbi8vICAgICAgICAgICAgICAgICBgJHt0aGlzLmN1cnJlbnRQb3NpdGlvbi54fSwke3RoaXMuY3VycmVudFBvc2l0aW9uLnl9YFxuLy8gICAgICAgICAgICAgKTtcbi8vICAgICAgICAgICAgIC8vIEJGUyB0byBmaW5kIHBhdGggdG8gdGFyZ2V0IGJsb2NrXG4vLyAgICAgICAgICAgICB3aGlsZSAodGhpcy50b1Zpc2l0Lmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b1Zpc2l0LnNoaWZ0KCk7XG4vLyAgICAgICAgICAgICAgICAgLy8gaWYgKGN1cnJlbnQueCA9PT0gdGhpcy50YXJnZXRCbG9jay54ICYmIGN1cnJlbnQueSA9PT0gdGhpcy50YXJnZXRCbG9jay55ICYmIGN1cnJlbnQucGF0aC5sZW5ndGggPiAwKSB7XG4vLyAgICAgICAgICAgICAgICAgaWYgKFxuLy8gICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnggPT09IHRoaXMudGFyZ2V0QmxvY2sueCAmJlxuLy8gICAgICAgICAgICAgICAgICAgICBjdXJyZW50LnkgPT09IHRoaXMudGFyZ2V0QmxvY2sueVxuLy8gICAgICAgICAgICAgICAgICkge1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGhUb0ZvbGxvdyA9IFsuLi5jdXJyZW50LnBhdGhdO1xuLy8gICAgICAgICAgICAgICAgICAgICBicmVhaztcbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgLy8gY2hlY2sgQUxMIG5laWdoYm9ycyBmcm9tIGN1cnJlbnQgY2VsbCAoc2ltdWxhdGlvbiBvZiBtb3ZlbWVudClcbi8vICAgICAgICAgICAgICAgICBjb25zdCBkaXJlY3Rpb25zID0gW1xuLy8gICAgICAgICAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkxFRlQsIGR4OiAtMSwgZHk6IDAgfSxcbi8vICAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5SSUdIVCwgZHg6IDEsIGR5OiAwIH0sXG4vLyAgICAgICAgICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uVVAsIGR4OiAwLCBkeTogLTEgfSxcbi8vICAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5ET1dOLCBkeDogMCwgZHk6IDEgfSxcbi8vICAgICAgICAgICAgICAgICBdO1xuLy8gICAgICAgICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcmVjdGlvbnMpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3WCA9IGN1cnJlbnQueCArIGRpci5keDtcbi8vICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3WSA9IGN1cnJlbnQueSArIGRpci5keTtcbi8vICAgICAgICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYCR7bmV3WH0sJHtuZXdZfWA7XG4vLyAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXRoLmhhcyhrZXkpKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGguYWRkKGtleSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogbmV3WCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiBuZXdZLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IFsuLi5jdXJyZW50LnBhdGgsIGRpci5hY3Rpb25dLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICBpZiAodGhpcy5wYXRoVG9Gb2xsb3cubGVuZ3RoID4gMCkge1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhdGhUb0ZvbGxvdy5zaGlmdCgpITtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICAvLyBjb250aW51ZSBleHBsb3JpbmcgdG8gZmluZCBibG9ja3Ncbi8vICAgICByZXR1cm4gdGhpcy5leHBsb3JlQWN0aW9uKGNlbGwpO1xuLy8gfVxuLy8gTG9naWMgZm9yIGJ1aWxkaW5nIHN0YWlyY2FzZVxuLy8gcHJpdmF0ZSBidWlsZFN0YWlyY2FzZUFjdGlvbihjZWxsOiBDZWxsSW5mbyk6IEFjdGlvbiB7XG4vLyAgICAgLy8gZmluZCBzdGFydCBvZiBzdGFpcmNhc2Ugc3RhcnQgcG9pbnQgaWYgbm90IHRoZXJlXG4vLyAgICAgaWYgKHRoaXMuc3RhaXJjYXNlU3RhcnQgPT09IG51bGwpIHtcbi8vICAgICAgICAgdGhpcy5zdGFpcmNhc2VTdGFydCA9IHsgLi4udGhpcy5jdXJyZW50UG9zaXRpb24gfTsgLy8geCx5LGxldmVsXG4vLyAgICAgICAgIHRoaXMuc3RhaXJjYXNlQnVpbHQgPSAwO1xuLy8gICAgIH1cbi8vICAgICAvLyBpZiBwYXRoIHRvIGZvbGxvdywgY29udGludWUgZm9sbG93aW5nIGl0XG4vLyAgICAgaWYgKHRoaXMucGF0aFRvRm9sbG93Lmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgcmV0dXJuIHRoaXMucGF0aFRvRm9sbG93LnNoaWZ0KCkhO1xuLy8gICAgIH1cbi8vICAgICAvLyBpZiB3ZXJlIGF0IHRoZSByaWdodCBwb3NpdGlvbiB0byBidWlsZCB0aGUgbmV4dCBzdGFpclxuLy8gICAgIGlmICh0aGlzLnN0YWlyY2FzZUJ1aWx0IDwgdGhpcy50cmVhc3VyZUxvY2F0aW9uIS5sZXZlbCkge1xuLy8gICAgICAgICAvLyBkcm9wIGJsb2NrIHRvIGJ1aWxkIHN0YWlyXG4vLyAgICAgICAgIGlmICh0aGlzLmNvbGxlY3RlZEJsb2NrcyA+IDApIHtcbi8vICAgICAgICAgICAgIC0tdGhpcy5jb2xsZWN0ZWRCbG9ja3M7XG4vLyAgICAgICAgICAgICArK3RoaXMuc3RhaXJjYXNlQnVpbHQ7XG4vLyAgICAgICAgICAgICByZXR1cm4gQWN0aW9uLkRST1A7XG4vLyAgICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgLy8gaWYgd2V2ZSBidWlsdCBhbGwgdGhlIHN0YWlycyBuZWVkZWQsIHRyeSB0byByZWFjaCB0aGUgdHJlYXN1cmVcbi8vICAgICBpZiAodGhpcy5zdGFpcmNhc2VCdWlsdCA9PT0gdGhpcy50cmVhc3VyZUxvY2F0aW9uIS5sZXZlbCkge1xuLy8gICAgICAgICAvLyBpZiB3ZXJlIGF0IHRoZSB0cmVhc3VyZSwgd2V2ZSB3b24vZG9uZVxuLy8gICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZS5HT0xEKSB7XG4vLyAgICAgICAgICAgICB0aGlzLnRyZWFzdXJlRm91bmQgPSB0cnVlO1xuLy8gICAgICAgICAgICAgcmV0dXJuIEFjdGlvbi5QSUNLVVA7XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgLy8gc2ltcGxpZmllZCAtLSBkb2VzbnQgaGFuZGxlIGNvbXBsZXggdGVycmFpbiB3aGVyZSB5b3UgbWlnaHQgbmVlZCB0b1xuLy8gICAgICAgICAvLyBuYXZpZ2F0ZSBhcm91bmQgb2JzdHJhY2xlcywgZXRjLCBoZW5jZSBzaG91bGQgdXNlIEJGU1xuLy8gICAgICAgICBjb25zdCBkaXJlY3Rpb25zID0gW1xuLy8gICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5MRUZULCBkeDogLTEsIGR5OiAwLCBjZWxsOiBjZWxsLmxlZnQgfSxcbi8vICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uUklHSFQsIGR4OiAxLCBkeTogMCwgY2VsbDogY2VsbC5yaWdodCB9LFxuLy8gICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5VUCwgZHg6IDAsIGR5OiAtMSwgY2VsbDogY2VsbC51cCB9LFxuLy8gICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5ET1dOLCBkeDogMCwgZHk6IDEsIGNlbGw6IGNlbGwuZG93biB9LFxuLy8gICAgICAgICBdO1xuLy8gICAgICAgICBmb3IgKGNvbnN0IGRpciBvZiBkaXJlY3Rpb25zKSB7XG4vLyAgICAgICAgICAgICBpZiAoXG4vLyAgICAgICAgICAgICAgICAgZGlyLmNlbGwudHlwZSA9PSBDZWxsVHlwZS5HT0xEICYmXG4vLyAgICAgICAgICAgICAgICAgTWF0aC5hYnMoZGlyLmNlbGwubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxXG4vLyAgICAgICAgICAgICApIHtcbi8vICAgICAgICAgICAgICAgICByZXR1cm4gZGlyLmFjdGlvbjtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICAvLyBmYWxsYmFjayAtLSBleHBsb3JlIHRvIGZpbmQgbW9yZSBibG9ja3Mgb3IgYmV0dGVyIHBvc2l0aW9uXG4vLyAgICAgcmV0dXJuIHRoaXMuZXhwbG9yZUFjdGlvbihjZWxsKTtcbi8vIH1cbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BY3Rpb24gPSB2b2lkIDA7XG4vLyBUaGlzIGlzIHRoZSBsaXN0IG9mIGFjdGlvbnMgdGhhdCB0aGUgU3RhY2tlciBjYW4gdGFrZVxudmFyIEFjdGlvbjtcbihmdW5jdGlvbiAoQWN0aW9uKSB7XG4gICAgQWN0aW9uW1wiTEVGVFwiXSA9IFwibGVmdFwiO1xuICAgIEFjdGlvbltcIlVQXCJdID0gXCJ1cFwiO1xuICAgIEFjdGlvbltcIlJJR0hUXCJdID0gXCJyaWdodFwiO1xuICAgIEFjdGlvbltcIkRPV05cIl0gPSBcImRvd25cIjtcbiAgICBBY3Rpb25bXCJQSUNLVVBcIl0gPSBcInBpY2t1cFwiO1xuICAgIEFjdGlvbltcIkRST1BcIl0gPSBcImRyb3BcIjtcbn0pKEFjdGlvbiB8fCAoZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb24gPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNlbGxUeXBlID0gdm9pZCAwO1xudmFyIENlbGxUeXBlO1xuKGZ1bmN0aW9uIChDZWxsVHlwZSkge1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiRU1QVFlcIl0gPSAwXSA9IFwiRU1QVFlcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIldBTExcIl0gPSAxXSA9IFwiV0FMTFwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiQkxPQ0tcIl0gPSAyXSA9IFwiQkxPQ0tcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkdPTERcIl0gPSAzXSA9IFwiR09MRFwiO1xufSkoQ2VsbFR5cGUgfHwgKGV4cG9ydHMuQ2VsbFR5cGUgPSBDZWxsVHlwZSA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvU3RhY2tlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==