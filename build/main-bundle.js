/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Stacker.ts":
/*!************************!*\
  !*** ./src/Stacker.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/*
4 diffferent phases:
1. tower finder algo (search algo -- bfs)
2. save tower location
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
        this.treasureFound = false;
        // private treasureLocation: { x: number; y: number; level: number } | null;
        this.towerLocation = null;
        // private collectedBlocks = 0; // the block we have currently in hand, to build the staircase
        // private requiredBlocks = 0;
        // private buildingStaircase = false;
        this.explored = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time)
        // private explored = new Set<string>();
        this.current = null; // current position
        this.origin = { x: 0, y: 0 };
        this.backtrack = {
            inProgress: false,
            // left: 0,
            // right: 0,
            // up: 0,
            // down: 0,
        };
        // Keep track of the path we're following
        // private pathToFollow: Action[] = [];
        // For BFS/DFS traversal
        this.path = []; // The path actually taken for each journey/run (using set would probably be better lookup time)
        // private visited = new Set<string>();
        this.toVisit = []; // list of cells to visit for each journey
        // private toVisit: { x: number; y: number; path: Action[] }[] = []; // list of cells to visit immediately in (x,y,path) format
        this.doneVisiting = false;
        // For block collection
        // private knownBlocks = new Set<string>(); // DNU
        // private targetBlock: { x: number; y: number } | null = null; // DNU
        // For building staircase
        // private staircaseStart: { x: number; y: number } | null = null;
        // private staircaseBuilt = 0;
        this.turn = function (cell) {
            // Phase 0: Update current position tracking only when we move
            if (_this.current === null) {
                // at beginning of run
                _this.current = __assign({}, _this.origin);
                _this.updatePath(_this.current);
                console.log('current: ' + _this.current.x + ',' + _this.current.y);
                return _this.traverseMap(cell);
            }
            else {
                if (_this.backtrack.inProgress) {
                    _this.current = _this.path.pop(); // should sync with cell
                }
                else {
                    _this.current = _this.toVisit.pop();
                    // this.updatePath(this.current);
                }
                _this.updatePath(_this.current);
                // this.current = this.toVisit.pop(); // This wont work on its own as we want it when stuck/should backtrack and will continue pulling from toVisit at those points
                // this.updatePath(this.current);
                console.log('current: ' + _this.current.x + ',' + _this.current.y);
                return _this.traverseMap(cell);
            }
            // Phase 1: Exploration to find treasure/tower
            if (!_this.treasureFound && !_this.doneVisiting) {
                return _this.traverseMap(cell);
                // Logic to explore and find treasure
                // When found, calculate required blocks using triangular number formula
                // this.requiredBlocks = (treasureLevel - 1) * treasureLevel / 2;
                // return this.exploreAction(cell);
            }
            else {
                console.log('pickup phase 1');
                return Action_1.Action.PICKUP; // placeholder for now , stays in place
            }
            // Phase 2: Collect blocks
            // if (this.collectedBlocks < this.requiredBlocks) {
            //     return this.collectBlocksAction(cell);
            // }
            // Phase 3: Build staircase to treasure
            // return this.buildStaircaseAction(cell);
        };
    }
    // traverse map by adding to toVisit if valid action (DFS?)
    Stacker.prototype.traverseMap = function (cell) {
        // let traversedEntireMap = 4;
        var canMove = false;
        if (this.isValidAction(cell, cell.up, 0, -1)) {
            this.toVisit.push({ x: this.current.x, y: this.current.y - 1 });
            canMove = true;
            // console.log('up');
        }
        if (this.isValidAction(cell, cell.left, -1, 0)) {
            this.toVisit.push({ x: this.current.x - 1, y: this.current.y });
            canMove = true;
            // console.log('left');
        }
        if (this.isValidAction(cell, cell.down, 0, 1)) {
            this.toVisit.push({ x: this.current.x, y: this.current.y + 1 });
            canMove = true;
            // console.log('down');
        }
        if (this.isValidAction(cell, cell.right, 1, 0)) {
            this.toVisit.push({ x: this.current.x + 1, y: this.current.y });
            canMove = true;
            // console.log('right');
        }
        if (canMove) {
            this.backtrack.inProgress = false;
            return this.getNextAction();
        }
        else {
            console.log('cant move: ' + this.current.x + ',' + this.current.y);
            if (this.current.x === 0 && this.current.y === 0) {
                console.log('End of journey/run');
                return Action_1.Action.PICKUP; // placeholder for now , stays in place
            }
            return this.backtrackAction();
        }
        // return this.getNextAction(); // DFS due to pop()?
    };
    // Begin backtracking
    Stacker.prototype.backtrackAction = function () {
        this.backtrack.inProgress = true;
        // x and y direction to backtrack to:
        this.path.pop();
        var xDirection = this.path.slice(-1)[0].x - this.current.x;
        var yDirection = this.path.slice(-1)[0].y - this.current.y;
        // console.log('path: ' + this.path.length);
        console.log('prev path: ' +
            this.path.slice(-1)[0].x +
            ',' +
            this.path.slice(-1)[0].y);
        console.log('current: ' + this.current.x + ',' + this.current.y);
        console.log('xDirection: ' + xDirection);
        console.log('yDirection: ' + yDirection);
        if (yDirection < 0) {
            // this.backtrack.up = Math.abs(yDirection);
            console.log('go back up');
            return Action_1.Action.UP;
        }
        else if (yDirection > 0) {
            // this.backtrack.down = yDirection;
            console.log('go back down');
            return Action_1.Action.DOWN;
        }
        else if (xDirection < 0) {
            // this.backtrack.left = xDirection;
            console.log('go back left');
            return Action_1.Action.LEFT;
        }
        else if (xDirection > 0) {
            // this.backtrack.right = xDirection;
            console.log('go back right');
            return Action_1.Action.RIGHT;
        }
        else {
            console.log('nothing to backtrack to');
        }
        // this.backtrack.left = this.path.slice(-1)[0].x - this.current.x;
        // this.backtrack.right = this.current.x - this.path.slice(-1)[0].x;
        // this.backtrack.up = Math.abs(this.path.slice(-1)[0].y - this.current.y);
        // this.backtrack.down = this.current.y - this.path.slice(-1)[0].y;
        // return Action.PICKUP; // placeholder for now , stays in place
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
            // this.toVisit.pop();
            // this.doneVisiting = true;
            // console.log('pickup getNextAction');
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
    // Check if movement is valid (if not wall, not already path, and 1 level away)
    Stacker.prototype.isValidAction = function (cell, // current cell
    direction, dx, dy) {
        var _this = this;
        // TODO: add towerLocation if tower found here (basically when cell.level === 8)
        // Check if the action is valid based on current cell
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
        // TODO: what about for CellType.GOLD, pikcup, and drop?
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL1N0YWNrZXIudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9BY3Rpb24udHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9DZWxsVHlwZS50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuLypcbjQgZGlmZmZlcmVudCBwaGFzZXM6XG4xLiB0b3dlciBmaW5kZXIgYWxnbyAoc2VhcmNoIGFsZ28gLS0gYmZzKVxuMi4gc2F2ZSB0b3dlciBsb2NhdGlvblxuMy4gY29sbGVjdCBibG9ja3MgYWxnbyAoc2VhcmNoIGFsZ28pXG40LiBidWlsZCBzdGFpcmNhc2UgYWxnb1xuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIGpvdXJuZXlzXG4tIEVhY2ggam91cm5leSBoYXMgaXRzIG93biBsaXN0IG9mICdwYXRoJyBibG9ja3MsIGhlbmNlIGBwYXRoYCBzZXQgY2xlYXJzIHJvdXRpbmVseSAoZWcgdG93ZXIgZm91bmQsIGJsYWNrIGFkZGVkIHRvIHN0YWlyY2FzZSwgZXRjLCBhcmUgYWxsIGRpZmZlcmVudCBpbmRpdmlkdWFsIGpvdXJuaWVzIHdpdGhpbiBhIHNpbmdsZSBydW4pXG4tIGV4cGxvcmVkIGlzIGEgbGlzdCBvZiBhbGwgZXhwbG9yZWQgY2VsbHMgaW4gcnVuLCBuZXZlciB0byBiZSByZXNldCBpbiBhIHNpbmdsZSBydW4uXG4qL1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBTdGFja2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0YWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudHJlYXN1cmVGb3VuZCA9IGZhbHNlO1xuICAgICAgICAvLyBwcml2YXRlIHRyZWFzdXJlTG9jYXRpb246IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IGxldmVsOiBudW1iZXIgfSB8IG51bGw7XG4gICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgIC8vIHByaXZhdGUgY29sbGVjdGVkQmxvY2tzID0gMDsgLy8gdGhlIGJsb2NrIHdlIGhhdmUgY3VycmVudGx5IGluIGhhbmQsIHRvIGJ1aWxkIHRoZSBzdGFpcmNhc2VcbiAgICAgICAgLy8gcHJpdmF0ZSByZXF1aXJlZEJsb2NrcyA9IDA7XG4gICAgICAgIC8vIHByaXZhdGUgYnVpbGRpbmdTdGFpcmNhc2UgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmV2ZXIgcmVtb3ZlZCAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSlcbiAgICAgICAgLy8gcHJpdmF0ZSBleHBsb3JlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsOyAvLyBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgIHRoaXMub3JpZ2luID0geyB4OiAwLCB5OiAwIH07XG4gICAgICAgIHRoaXMuYmFja3RyYWNrID0ge1xuICAgICAgICAgICAgaW5Qcm9ncmVzczogZmFsc2UsXG4gICAgICAgICAgICAvLyBsZWZ0OiAwLFxuICAgICAgICAgICAgLy8gcmlnaHQ6IDAsXG4gICAgICAgICAgICAvLyB1cDogMCxcbiAgICAgICAgICAgIC8vIGRvd246IDAsXG4gICAgICAgIH07XG4gICAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIHBhdGggd2UncmUgZm9sbG93aW5nXG4gICAgICAgIC8vIHByaXZhdGUgcGF0aFRvRm9sbG93OiBBY3Rpb25bXSA9IFtdO1xuICAgICAgICAvLyBGb3IgQkZTL0RGUyB0cmF2ZXJzYWxcbiAgICAgICAgdGhpcy5wYXRoID0gW107IC8vIFRoZSBwYXRoIGFjdHVhbGx5IHRha2VuIGZvciBlYWNoIGpvdXJuZXkvcnVuICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lKVxuICAgICAgICAvLyBwcml2YXRlIHZpc2l0ZWQgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgZm9yIGVhY2ggam91cm5leVxuICAgICAgICAvLyBwcml2YXRlIHRvVmlzaXQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IHBhdGg6IEFjdGlvbltdIH1bXSA9IFtdOyAvLyBsaXN0IG9mIGNlbGxzIHRvIHZpc2l0IGltbWVkaWF0ZWx5IGluICh4LHkscGF0aCkgZm9ybWF0XG4gICAgICAgIHRoaXMuZG9uZVZpc2l0aW5nID0gZmFsc2U7XG4gICAgICAgIC8vIEZvciBibG9jayBjb2xsZWN0aW9uXG4gICAgICAgIC8vIHByaXZhdGUga25vd25CbG9ja3MgPSBuZXcgU2V0PHN0cmluZz4oKTsgLy8gRE5VXG4gICAgICAgIC8vIHByaXZhdGUgdGFyZ2V0QmxvY2s6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgPSBudWxsOyAvLyBETlVcbiAgICAgICAgLy8gRm9yIGJ1aWxkaW5nIHN0YWlyY2FzZVxuICAgICAgICAvLyBwcml2YXRlIHN0YWlyY2FzZVN0YXJ0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsID0gbnVsbDtcbiAgICAgICAgLy8gcHJpdmF0ZSBzdGFpcmNhc2VCdWlsdCA9IDA7XG4gICAgICAgIHRoaXMudHVybiA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAvLyBQaGFzZSAwOiBVcGRhdGUgY3VycmVudCBwb3NpdGlvbiB0cmFja2luZyBvbmx5IHdoZW4gd2UgbW92ZVxuICAgICAgICAgICAgaWYgKF90aGlzLmN1cnJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBhdCBiZWdpbm5pbmcgb2YgcnVuXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF9fYXNzaWduKHt9LCBfdGhpcy5vcmlnaW4pO1xuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnQ6ICcgKyBfdGhpcy5jdXJyZW50LnggKyAnLCcgKyBfdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5iYWNrdHJhY2suaW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX3RoaXMucGF0aC5wb3AoKTsgLy8gc2hvdWxkIHN5bmMgd2l0aCBjZWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX3RoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy51cGRhdGVQYXRoKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50ID0gdGhpcy50b1Zpc2l0LnBvcCgpOyAvLyBUaGlzIHdvbnQgd29yayBvbiBpdHMgb3duIGFzIHdlIHdhbnQgaXQgd2hlbiBzdHVjay9zaG91bGQgYmFja3RyYWNrIGFuZCB3aWxsIGNvbnRpbnVlIHB1bGxpbmcgZnJvbSB0b1Zpc2l0IGF0IHRob3NlIHBvaW50c1xuICAgICAgICAgICAgICAgIC8vIHRoaXMudXBkYXRlUGF0aCh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjdXJyZW50OiAnICsgX3RoaXMuY3VycmVudC54ICsgJywnICsgX3RoaXMuY3VycmVudC55KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAxOiBFeHBsb3JhdGlvbiB0byBmaW5kIHRyZWFzdXJlL3Rvd2VyXG4gICAgICAgICAgICBpZiAoIV90aGlzLnRyZWFzdXJlRm91bmQgJiYgIV90aGlzLmRvbmVWaXNpdGluZykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgICAgICAvLyBMb2dpYyB0byBleHBsb3JlIGFuZCBmaW5kIHRyZWFzdXJlXG4gICAgICAgICAgICAgICAgLy8gV2hlbiBmb3VuZCwgY2FsY3VsYXRlIHJlcXVpcmVkIGJsb2NrcyB1c2luZyB0cmlhbmd1bGFyIG51bWJlciBmb3JtdWxhXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5yZXF1aXJlZEJsb2NrcyA9ICh0cmVhc3VyZUxldmVsIC0gMSkgKiB0cmVhc3VyZUxldmVsIC8gMjtcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhpcy5leHBsb3JlQWN0aW9uKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BpY2t1cCBwaGFzZSAxJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7IC8vIHBsYWNlaG9sZGVyIGZvciBub3cgLCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGhhc2UgMjogQ29sbGVjdCBibG9ja3NcbiAgICAgICAgICAgIC8vIGlmICh0aGlzLmNvbGxlY3RlZEJsb2NrcyA8IHRoaXMucmVxdWlyZWRCbG9ja3MpIHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gdGhpcy5jb2xsZWN0QmxvY2tzQWN0aW9uKGNlbGwpO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gUGhhc2UgMzogQnVpbGQgc3RhaXJjYXNlIHRvIHRyZWFzdXJlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhpcy5idWlsZFN0YWlyY2FzZUFjdGlvbihjZWxsKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gdHJhdmVyc2UgbWFwIGJ5IGFkZGluZyB0byB0b1Zpc2l0IGlmIHZhbGlkIGFjdGlvbiAoREZTPylcbiAgICBTdGFja2VyLnByb3RvdHlwZS50cmF2ZXJzZU1hcCA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgIC8vIGxldCB0cmF2ZXJzZWRFbnRpcmVNYXAgPSA0O1xuICAgICAgICB2YXIgY2FuTW92ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQWN0aW9uKGNlbGwsIGNlbGwudXAsIDAsIC0xKSkge1xuICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goeyB4OiB0aGlzLmN1cnJlbnQueCwgeTogdGhpcy5jdXJyZW50LnkgLSAxIH0pO1xuICAgICAgICAgICAgY2FuTW92ZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndXAnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQWN0aW9uKGNlbGwsIGNlbGwubGVmdCwgLTEsIDApKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54IC0gMSwgeTogdGhpcy5jdXJyZW50LnkgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZEFjdGlvbihjZWxsLCBjZWxsLmRvd24sIDAsIDEpKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54LCB5OiB0aGlzLmN1cnJlbnQueSArIDEgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkb3duJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZEFjdGlvbihjZWxsLCBjZWxsLnJpZ2h0LCAxLCAwKSkge1xuICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goeyB4OiB0aGlzLmN1cnJlbnQueCArIDEsIHk6IHRoaXMuY3VycmVudC55IH0pO1xuICAgICAgICAgICAgY2FuTW92ZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5iYWNrdHJhY2suaW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2NhbnQgbW92ZTogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC54ID09PSAwICYmIHRoaXMuY3VycmVudC55ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VuZCBvZiBqb3VybmV5L3J1bicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUElDS1VQOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93ICwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJhY2t0cmFja0FjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTsgLy8gREZTIGR1ZSB0byBwb3AoKT9cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZ1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2suaW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgIC8vIHggYW5kIHkgZGlyZWN0aW9uIHRvIGJhY2t0cmFjayB0bzpcbiAgICAgICAgdGhpcy5wYXRoLnBvcCgpO1xuICAgICAgICB2YXIgeERpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueCAtIHRoaXMuY3VycmVudC54O1xuICAgICAgICB2YXIgeURpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueSAtIHRoaXMuY3VycmVudC55O1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncGF0aDogJyArIHRoaXMucGF0aC5sZW5ndGgpO1xuICAgICAgICBjb25zb2xlLmxvZygncHJldiBwYXRoOiAnICtcbiAgICAgICAgICAgIHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueCArXG4gICAgICAgICAgICAnLCcgK1xuICAgICAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55KTtcbiAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnQ6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55KTtcbiAgICAgICAgY29uc29sZS5sb2coJ3hEaXJlY3Rpb246ICcgKyB4RGlyZWN0aW9uKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3lEaXJlY3Rpb246ICcgKyB5RGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKHlEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay51cCA9IE1hdGguYWJzKHlEaXJlY3Rpb24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgdXAnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeURpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLmRvd24gPSB5RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgZG93bicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5sZWZ0ID0geERpcmVjdGlvbjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIGxlZnQnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2sucmlnaHQgPSB4RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgcmlnaHQnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm90aGluZyB0byBiYWNrdHJhY2sgdG8nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5sZWZ0ID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS54IC0gdGhpcy5jdXJyZW50Lng7XG4gICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLnJpZ2h0ID0gdGhpcy5jdXJyZW50LnggLSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLng7XG4gICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLnVwID0gTWF0aC5hYnModGhpcy5wYXRoLnNsaWNlKC0xKVswXS55IC0gdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5kb3duID0gdGhpcy5jdXJyZW50LnkgLSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnk7XG4gICAgICAgIC8vIHJldHVybiBBY3Rpb24uUElDS1VQOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93ICwgc3RheXMgaW4gcGxhY2VcbiAgICB9O1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmdldE5leHRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGRlcml2ZXMgbmV4dCBBY3Rpb24gYmFzZWQgb24gb3VyIGNvb3JkaW5hdGVzIChjb3VsZCByZW1vdmUgb3JpZ2luIHNpbmNlIGFsd2F5cyAwKTpcbiAgICAgICAgdmFyIHggPSB0aGlzLm9yaWdpbi54IC0gdGhpcy5jdXJyZW50LnggKyB0aGlzLnRvVmlzaXQuc2xpY2UoLTEpWzBdLng7IC8vIGxhc3QgdG9WaXNpdCBkdWUgdG8gdXNpbmcgcG9wKClcbiAgICAgICAgdmFyIHkgPSB0aGlzLm9yaWdpbi55IC0gdGhpcy5jdXJyZW50LnkgKyB0aGlzLnRvVmlzaXQuc2xpY2UoLTEpWzBdLnk7XG4gICAgICAgIGlmICh4IDwgMCkge1xuICAgICAgICAgICAgLy8gbGVmdDogLTF4XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeCA+IDApIHtcbiAgICAgICAgICAgIC8vIHJpZ2h0OiArMXhcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA8IDApIHtcbiAgICAgICAgICAgIC8vIHVwOiAtMXlcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICAgIC8vIGRvd246ICsxeVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8geD0wIGFuZCB5PTAgd2hlbiB2aXNpdGVkIGFsbCBjZWxscyBvbiBtYXBcbiAgICAgICAgICAgIC8vIHRoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgICAgIC8vIHRoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZG9uZVZpc2l0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdwaWNrdXAgZ2V0TmV4dEFjdGlvbicpO1xuICAgICAgICAgICAgLy8gcmV0dXJuIEFjdGlvbi5QSUNLVVA7IC8vIHBsYWNlaG9sZGVyIGZvciBub3cgLCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBhZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggY2VsbHMgaWYgbm90IGFscmVhZHkgaW4gdGhlcmVcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVQYXRoID0gZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudDogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAvLyBVcGRhdGUgdGhlIGV4cGxvcmVkIHNldFxuICAgICAgICAvLyBjb25zdCBrZXkgPSBgJHt0aGlzLmN1cnJlbnRQb3NpdGlvbi54fSwke3RoaXMuY3VycmVudFBvc2l0aW9uLnl9YDtcbiAgICAgICAgLy8gdGhpcy5leHBsb3JlZC5hZGQoa2V5KTtcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGJsb2NrcyBpbiB0aGUgc3Vycm91bmRpbmcgY2VsbHNcbiAgICAgICAgLy8gY29uc3QgbmVpZ2hib3JzID0gW1xuICAgICAgICAvLyAgICAgeyBkaXI6ICdsZWZ0JywgZHg6IC0xLCBkeTogMCB9LCAvLyBkeCA9IGxlZnQvcmlnaHQgZGlyZWN0aW9uLCBkeSA9IHVwL2Rvd24gZGlyZWN0aW9uXG4gICAgICAgIC8vICAgICB7IGRpcjogJ3VwJywgZHg6IDAsIGR5OiAtMSB9LFxuICAgICAgICAvLyAgICAgeyBkaXI6ICdyaWdodCcsIGR4OiAxLCBkeTogMCB9LFxuICAgICAgICAvLyAgICAgeyBkaXI6ICdkb3duJywgZHg6IDAsIGR5OiAxIH0sXG4gICAgICAgIC8vIF07XG4gICAgICAgIC8vIGZvciAoY29uc3QgbmVpZ2hib3Igb2YgbmVpZ2hib3JzKSB7XG4gICAgICAgIC8vICAgICBjb25zdCBuZWlnaGJvckNlbGwgPSBjZWxsW25laWdoYm9yLmRpciBhcyBrZXlvZiBDZWxsSW5mb10gYXMge1xuICAgICAgICAvLyAgICAgICAgIHR5cGU6IENlbGxUeXBlO1xuICAgICAgICAvLyAgICAgICAgIGxldmVsOiBudW1iZXI7XG4gICAgICAgIC8vICAgICB9O1xuICAgICAgICAvLyAgICAgLy8gY29sbGVjdCBsb2NhdGlvbiBvZiBibG9ja3Mgb24gbWFwIHRvIGltcHJvdmUgcGVyZm9ybWFuY2U/XG4gICAgICAgIC8vICAgICBpZiAobmVpZ2hib3JDZWxsLnR5cGUgPT09IENlbGxUeXBlLkJMT0NLKSB7XG4gICAgICAgIC8vICAgICAgICAgY29uc3QgYmxvY2tYID0gdGhpcy5jdXJyZW50UG9zaXRpb24ueCArIG5laWdoYm9yLmR4O1xuICAgICAgICAvLyAgICAgICAgIGNvbnN0IGJsb2NrWSA9IHRoaXMuY3VycmVudFBvc2l0aW9uLnkgKyBuZWlnaGJvci5keTtcbiAgICAgICAgLy8gICAgICAgICBjb25zdCBibG9ja0tleSA9IGAke2Jsb2NrWH0sJHtibG9ja1l9YDsgLy8gVE9ETzogbm90IHVzZWQgeWV0XG4gICAgICAgIC8vICAgICAgICAgLy8gQWRkIHRvIGtub3duIGJsb2NrcyBpZiBub3QgYWxyZWFkeSB0aGVyZVxuICAgICAgICAvLyAgICAgICAgIGlmICh0aGlzLmtub3duQmxvY2tzLmhhcyhibG9ja0tleSkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5rbm93bkJsb2Nrcy5hZGQoYmxvY2tLZXkpO1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuICAgIH07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2sgaWYgbW92ZW1lbnQgaXMgdmFsaWQgKGlmIG5vdCB3YWxsLCBub3QgYWxyZWFkeSBwYXRoLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLmlzVmFsaWRBY3Rpb24gPSBmdW5jdGlvbiAoY2VsbCwgLy8gY3VycmVudCBjZWxsXG4gICAgZGlyZWN0aW9uLCBkeCwgZHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gVE9ETzogYWRkIHRvd2VyTG9jYXRpb24gaWYgdG93ZXIgZm91bmQgaGVyZSAoYmFzaWNhbGx5IHdoZW4gY2VsbC5sZXZlbCA9PT0gOClcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGFjdGlvbiBpcyB2YWxpZCBiYXNlZCBvbiBjdXJyZW50IGNlbGxcbiAgICAgICAgLy8gY3VycmVudCBzaG91bGQgPT09IGNlbGxcbiAgICAgICAgaWYgKGRpcmVjdGlvbi50eXBlICE9PSBDZWxsVHlwZV8xLkNlbGxUeXBlLldBTEwgJiZcbiAgICAgICAgICAgIE1hdGguYWJzKGRpcmVjdGlvbi5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDEgJiZcbiAgICAgICAgICAgICF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2LnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIHYueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSAmJlxuICAgICAgICAgICAgIXRoaXMuZXhwbG9yZWQuc29tZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlLnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIGUueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBUT0RPOiB3aGF0IGFib3V0IGZvciBDZWxsVHlwZS5HT0xELCBwaWtjdXAsIGFuZCBkcm9wP1xuICAgIH07XG4gICAgLy8gVE9ETzogY2FsY3VsYXRlIHJlcXVpcmVkIG51bWJlciBvZiBibG9ja3MgdG8gY29sbGVjdCBmb3IgYnVpbGRpbmcgc3RhaXJjYXNlIChub3QgdXNlZClcbiAgICBTdGFja2VyLnByb3RvdHlwZS5jYWxjdWxhdGVSZXF1aXJlZEJsb2NrcyA9IGZ1bmN0aW9uIChsZXZlbCkge1xuICAgICAgICAvLyB1c2luZyB0aGUgdHJpYW5ndWxhciBudW1iZXIgZm9ybXVsYTogKG4tMSluLzJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKChsZXZlbCAtIDEpICogbGV2ZWwpIC8gMik7XG4gICAgfTtcbiAgICByZXR1cm4gU3RhY2tlcjtcbn0oKSk7XG53aW5kb3cuU3RhY2tlciA9IFN0YWNrZXI7XG4vLyBUT0RPOiBIZWxwZXIgbWV0aG9kcyBmb3IgZGlmZmVyZW50IHBoYXNlc1xuLy8gcHJpdmF0ZSBleHBsb3JlQWN0aW9uKGNlbGw6IENlbGxJbmZvKTogQWN0aW9uIHtcbi8vICAgICAvLyBMb2dpYyBmb3IgZXhwbG9yYXRpb24gKEJGUylcbi8vICAgICBpZiAodGhpcy50b1Zpc2l0Lmxlbmd0aCA9PT0gMCkge1xuLy8gICAgICAgICAvLyBpZiBqdXN0IHN0YXJ0aW5nLi4uXG4vLyAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHtcbi8vICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudFBvc2l0aW9uLngsXG4vLyAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnRQb3NpdGlvbi55LFxuLy8gICAgICAgICAgICAgcGF0aDogW10sXG4vLyAgICAgICAgIH0pO1xuLy8gICAgICAgICB0aGlzLnBhdGguY2xlYXIoKTsgLy8gRE5VOiBzaG91bGRudCBuZWVkIHRoaXMgaWYganVzdCBiZWdpbm5pbmcsIHNvIHRoaXMgY291ZGwgYmUgdXNlZCB3aGVuIHdlIGFyZSBhdCB0aGUgdGFyZ2V0IHBlcmhhcHMgb3Igc29tZSBvdGhlciBjb25kaXRpb24gd2hlbiB0b1Zpc2l0IGlzIGVtcHR5XG4vLyAgICAgICAgIHRoaXMucGF0aC5hZGQoXG4vLyAgICAgICAgICAgICBgJHt0aGlzLmN1cnJlbnRQb3NpdGlvbi54fSwke3RoaXMuY3VycmVudFBvc2l0aW9uLnl9YFxuLy8gICAgICAgICApO1xuLy8gICAgIH1cbi8vICAgICAvLyBwcm9jZXNzIG5leHQgY2VsbCBpbiBCRlMgcXVldWUgaWYgY2VsbHMgc3RpbCB0byB2aXNpdFxuLy8gICAgIHdoaWxlICh0aGlzLnRvVmlzaXQubGVuZ3RoID4gMCkge1xuLy8gICAgICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy50b1Zpc2l0LnNoaWZ0KCk7IC8vIG1ha2VzIGFycmF5L2xpc3QgYSBxdWV1ZSBieSB1c2luZyBzaGlmdFxuLy8gICAgICAgICAvLyBETlU6IGZvbGxvdyB0aGUgcGF0aCBpZiBhdCB0YXJnZXQgKGllIGV4aXQgYW5kIGZvbGxvdyBwYXRoIGluc3RlYWQgb2YgZXhwbG9yaW5nPylcbi8vICAgICAgICAgaWYgKFxuLy8gICAgICAgICAgICAgY3VycmVudC54ID09PSB0aGlzLmN1cnJlbnRQb3NpdGlvbi54ICYmXG4vLyAgICAgICAgICAgICBjdXJyZW50LnkgPT09IHRoaXMuY3VycmVudFBvc2l0aW9uLnkgJiZcbi8vICAgICAgICAgICAgIGN1cnJlbnQucGF0aC5sZW5ndGggPiAwXG4vLyAgICAgICAgICkge1xuLy8gICAgICAgICAgICAgdGhpcy5wYXRoVG9Gb2xsb3cgPSBbLi4uY3VycmVudC5wYXRoXTtcbi8vICAgICAgICAgICAgIHJldHVybiB0aGlzLnBhdGhUb0ZvbGxvdy5zaGlmdCgpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIC8vIGNoZWNrIGFsbCBuZWlnaGJvcnNcbi8vICAgICAgICAgY29uc3QgZGlyZWN0aW9ucyA9IFtcbi8vICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uTEVGVCwgZHg6IC0xLCBkeTogMCwgY2VsbDogY2VsbC5sZWZ0IH0sXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLlJJR0hULCBkeDogMSwgZHk6IDAsIGNlbGw6IGNlbGwucmlnaHQgfSxcbi8vICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uVVAsIGR4OiAwLCBkeTogLTEsIGNlbGw6IGNlbGwudXAgfSxcbi8vICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uRE9XTiwgZHg6IDAsIGR5OiAxLCBjZWxsOiBjZWxsLmRvd24gfSxcbi8vICAgICAgICAgXTtcbi8vICAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlyZWN0aW9ucykge1xuLy8gICAgICAgICAgICAgaWYgKFxuLy8gICAgICAgICAgICAgICAgIGRpci5jZWxsLnR5cGUgIT09IENlbGxUeXBlLldBTEwgJiZcbi8vICAgICAgICAgICAgICAgICBNYXRoLmFicyhkaXIuY2VsbC5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDFcbi8vICAgICAgICAgICAgICkge1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IG5ld1ggPSBjdXJyZW50LnggKyBkaXIuZHg7XG4vLyAgICAgICAgICAgICAgICAgY29uc3QgbmV3WSA9IGN1cnJlbnQueSArIGRpci5keTtcbi8vICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtuZXdYfSwke25ld1l9YDtcbi8vICAgICAgICAgICAgICAgICAvLyBpZiBub3QgcGF0aCwgYWRkIHRvIHRvVmlzaXQgcXVldWUuIE1haW4gd2F5IHRvIHRyYXZlcnNlIHRoZSBtYXAgaGVyZVxuLy8gICAgICAgICAgICAgICAgIGlmICghdGhpcy5wYXRoLmhhcyhrZXkpKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aC5hZGQoa2V5KTtcbi8vICAgICAgICAgICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goe1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgeDogbmV3WCxcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHk6IG5ld1ksXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBwYXRoOiBbLi4uY3VycmVudC5wYXRoLCBkaXIuYWN0aW9uXSwgLy8gRE5VXG4vLyAgICAgICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICAvLyBpZiBubyBwYXRoIGZvdW5kLCB0YWtlIGEgcmFuZG9tIHZhbGlkIG1vdmVcbi8vICAgICBjb25zdCB2YWxpZE1vdmVzID0gW107XG4vLyAgICAgaWYgKFxuLy8gICAgICAgICBjZWxsLmxlZnQudHlwZSAhPT0gQ2VsbFR5cGUuV0FMTCAmJlxuLy8gICAgICAgICBNYXRoLmFicyhjZWxsLmxlZnQubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxXG4vLyAgICAgKSB7XG4vLyAgICAgICAgIHZhbGlkTW92ZXMucHVzaChBY3Rpb24uTEVGVCk7XG4vLyAgICAgfVxuLy8gICAgIGlmIChcbi8vICAgICAgICAgY2VsbC5yaWdodC50eXBlICE9PSBDZWxsVHlwZS5XQUxMICYmXG4vLyAgICAgICAgIE1hdGguYWJzKGNlbGwucmlnaHQubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxXG4vLyAgICAgKSB7XG4vLyAgICAgICAgIHZhbGlkTW92ZXMucHVzaChBY3Rpb24uUklHSFQpO1xuLy8gICAgIH1cbi8vICAgICBpZiAoXG4vLyAgICAgICAgIGNlbGwudXAudHlwZSAhPT0gQ2VsbFR5cGUuV0FMTCAmJlxuLy8gICAgICAgICBNYXRoLmFicyhjZWxsLnVwLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMVxuLy8gICAgICkge1xuLy8gICAgICAgICB2YWxpZE1vdmVzLnB1c2goQWN0aW9uLlVQKTtcbi8vICAgICB9XG4vLyAgICAgaWYgKFxuLy8gICAgICAgICBjZWxsLmRvd24udHlwZSAhPT0gQ2VsbFR5cGUuV0FMTCAmJlxuLy8gICAgICAgICBNYXRoLmFicyhjZWxsLmRvd24ubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxXG4vLyAgICAgKSB7XG4vLyAgICAgICAgIHZhbGlkTW92ZXMucHVzaChBY3Rpb24uRE9XTik7XG4vLyAgICAgfVxuLy8gICAgIGlmICh2YWxpZE1vdmVzLmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgcmV0dXJuIHZhbGlkTW92ZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdmFsaWRNb3Zlcy5sZW5ndGgpXTtcbi8vICAgICB9XG4vLyAgICAgLy8gc2hvdWxkbnQgaGFwcGVuIHdpdGggQkZTLCBidXQgZmFsbGJhY2sgbm9uZXRoZWxlc3Ncbi8vICAgICByZXR1cm4gQWN0aW9uLkxFRlQ7XG4vLyB9XG4vLyBMb2dpYyBmb3IgY29sbGVjdGluZyBibG9ja3Ncbi8vIHByaXZhdGUgY29sbGVjdEJsb2Nrc0FjdGlvbihjZWxsOiBDZWxsSW5mbyk6IEFjdGlvbiB7XG4vLyAgICAgLy8gcGljayB1cCBibG9jayBpZiBvbiBpdCBhbmQgcmV0dXJuIGFuIEFjdGlvblxuLy8gICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlLkJMT0NLKSB7XG4vLyAgICAgICAgICsrdGhpcy5jb2xsZWN0ZWRCbG9ja3M7XG4vLyAgICAgICAgIHJldHVybiBBY3Rpb24uUElDS1VQO1xuLy8gICAgIH1cbi8vICAgICAvLyBpZiB3ZSBoYXZlIGEgdGFyZ2V0IGJsb2NrLCBmb2xsb3cgdGhlIHBhdGggdG8gaXRcbi8vICAgICBpZiAodGhpcy50YXJnZXRCbG9jayA9PT0gbnVsbCkge1xuLy8gICAgICAgICAvLyBmaW5kIG5lYXJlc3QgYmxvY2tcbi8vICAgICAgICAgaWYgKHRoaXMua25vd25CbG9ja3MubGVuZ3RoID4gMCkge1xuLy8gICAgICAgICAgICAgdGhpcy50YXJnZXRCbG9jayA9IHRoaXMua25vd25CbG9ja3Muc2hpZnQoKTtcbi8vICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBwYXRoIHRvIHRhcmdldCBibG9jayB1c2luZyBCRlNcbi8vICAgICAgICAgICAgIHRoaXMudG9WaXNpdCA9IFtcbi8vICAgICAgICAgICAgICAgICB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudFBvc2l0aW9uLngsXG4vLyAgICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudFBvc2l0aW9uLnksXG4vLyAgICAgICAgICAgICAgICAgICAgIHBhdGg6IFtdLFxuLy8gICAgICAgICAgICAgICAgIH0sXG4vLyAgICAgICAgICAgICBdO1xuLy8gICAgICAgICAgICAgdGhpcy5wYXRoLmNsZWFyKCk7XG4vLyAgICAgICAgICAgICB0aGlzLnBhdGguYWRkKFxuLy8gICAgICAgICAgICAgICAgIGAke3RoaXMuY3VycmVudFBvc2l0aW9uLnh9LCR7dGhpcy5jdXJyZW50UG9zaXRpb24ueX1gXG4vLyAgICAgICAgICAgICApO1xuLy8gICAgICAgICAgICAgLy8gQkZTIHRvIGZpbmQgcGF0aCB0byB0YXJnZXQgYmxvY2tcbi8vICAgICAgICAgICAgIHdoaWxlICh0aGlzLnRvVmlzaXQubGVuZ3RoID4gMCkge1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSB0aGlzLnRvVmlzaXQuc2hpZnQoKTtcbi8vICAgICAgICAgICAgICAgICAvLyBpZiAoY3VycmVudC54ID09PSB0aGlzLnRhcmdldEJsb2NrLnggJiYgY3VycmVudC55ID09PSB0aGlzLnRhcmdldEJsb2NrLnkgJiYgY3VycmVudC5wYXRoLmxlbmd0aCA+IDApIHtcbi8vICAgICAgICAgICAgICAgICBpZiAoXG4vLyAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQueCA9PT0gdGhpcy50YXJnZXRCbG9jay54ICYmXG4vLyAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQueSA9PT0gdGhpcy50YXJnZXRCbG9jay55XG4vLyAgICAgICAgICAgICAgICAgKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aFRvRm9sbG93ID0gWy4uLmN1cnJlbnQucGF0aF07XG4vLyAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAvLyBjaGVjayBBTEwgbmVpZ2hib3JzIGZyb20gY3VycmVudCBjZWxsIChzaW11bGF0aW9uIG9mIG1vdmVtZW50KVxuLy8gICAgICAgICAgICAgICAgIGNvbnN0IGRpcmVjdGlvbnMgPSBbXG4vLyAgICAgICAgICAgICAgICAgICAgIHsgYWN0aW9uOiBBY3Rpb24uTEVGVCwgZHg6IC0xLCBkeTogMCB9LFxuLy8gICAgICAgICAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLlJJR0hULCBkeDogMSwgZHk6IDAgfSxcbi8vICAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5VUCwgZHg6IDAsIGR5OiAtMSB9LFxuLy8gICAgICAgICAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkRPV04sIGR4OiAwLCBkeTogMSB9LFxuLy8gICAgICAgICAgICAgICAgIF07XG4vLyAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlyZWN0aW9ucykge1xuLy8gICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdYID0gY3VycmVudC54ICsgZGlyLmR4O1xuLy8gICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdZID0gY3VycmVudC55ICsgZGlyLmR5O1xuLy8gICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtuZXdYfSwke25ld1l9YDtcbi8vICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhdGguaGFzKGtleSkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aC5hZGQoa2V5KTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBuZXdYLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IG5ld1ksXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogWy4uLmN1cnJlbnQucGF0aCwgZGlyLmFjdGlvbl0sXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbi8vICAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIGlmICh0aGlzLnBhdGhUb0ZvbGxvdy5sZW5ndGggPiAwKSB7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucGF0aFRvRm9sbG93LnNoaWZ0KCkhO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIC8vIGNvbnRpbnVlIGV4cGxvcmluZyB0byBmaW5kIGJsb2Nrc1xuLy8gICAgIHJldHVybiB0aGlzLmV4cGxvcmVBY3Rpb24oY2VsbCk7XG4vLyB9XG4vLyBMb2dpYyBmb3IgYnVpbGRpbmcgc3RhaXJjYXNlXG4vLyBwcml2YXRlIGJ1aWxkU3RhaXJjYXNlQWN0aW9uKGNlbGw6IENlbGxJbmZvKTogQWN0aW9uIHtcbi8vICAgICAvLyBmaW5kIHN0YXJ0IG9mIHN0YWlyY2FzZSBzdGFydCBwb2ludCBpZiBub3QgdGhlcmVcbi8vICAgICBpZiAodGhpcy5zdGFpcmNhc2VTdGFydCA9PT0gbnVsbCkge1xuLy8gICAgICAgICB0aGlzLnN0YWlyY2FzZVN0YXJ0ID0geyAuLi50aGlzLmN1cnJlbnRQb3NpdGlvbiB9OyAvLyB4LHksbGV2ZWxcbi8vICAgICAgICAgdGhpcy5zdGFpcmNhc2VCdWlsdCA9IDA7XG4vLyAgICAgfVxuLy8gICAgIC8vIGlmIHBhdGggdG8gZm9sbG93LCBjb250aW51ZSBmb2xsb3dpbmcgaXRcbi8vICAgICBpZiAodGhpcy5wYXRoVG9Gb2xsb3cubGVuZ3RoID4gMCkge1xuLy8gICAgICAgICByZXR1cm4gdGhpcy5wYXRoVG9Gb2xsb3cuc2hpZnQoKSE7XG4vLyAgICAgfVxuLy8gICAgIC8vIGlmIHdlcmUgYXQgdGhlIHJpZ2h0IHBvc2l0aW9uIHRvIGJ1aWxkIHRoZSBuZXh0IHN0YWlyXG4vLyAgICAgaWYgKHRoaXMuc3RhaXJjYXNlQnVpbHQgPCB0aGlzLnRyZWFzdXJlTG9jYXRpb24hLmxldmVsKSB7XG4vLyAgICAgICAgIC8vIGRyb3AgYmxvY2sgdG8gYnVpbGQgc3RhaXJcbi8vICAgICAgICAgaWYgKHRoaXMuY29sbGVjdGVkQmxvY2tzID4gMCkge1xuLy8gICAgICAgICAgICAgLS10aGlzLmNvbGxlY3RlZEJsb2Nrcztcbi8vICAgICAgICAgICAgICsrdGhpcy5zdGFpcmNhc2VCdWlsdDtcbi8vICAgICAgICAgICAgIHJldHVybiBBY3Rpb24uRFJPUDtcbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vICAgICAvLyBpZiB3ZXZlIGJ1aWx0IGFsbCB0aGUgc3RhaXJzIG5lZWRlZCwgdHJ5IHRvIHJlYWNoIHRoZSB0cmVhc3VyZVxuLy8gICAgIGlmICh0aGlzLnN0YWlyY2FzZUJ1aWx0ID09PSB0aGlzLnRyZWFzdXJlTG9jYXRpb24hLmxldmVsKSB7XG4vLyAgICAgICAgIC8vIGlmIHdlcmUgYXQgdGhlIHRyZWFzdXJlLCB3ZXZlIHdvbi9kb25lXG4vLyAgICAgICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlLkdPTEQpIHtcbi8vICAgICAgICAgICAgIHRoaXMudHJlYXN1cmVGb3VuZCA9IHRydWU7XG4vLyAgICAgICAgICAgICByZXR1cm4gQWN0aW9uLlBJQ0tVUDtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICAvLyBzaW1wbGlmaWVkIC0tIGRvZXNudCBoYW5kbGUgY29tcGxleCB0ZXJyYWluIHdoZXJlIHlvdSBtaWdodCBuZWVkIHRvXG4vLyAgICAgICAgIC8vIG5hdmlnYXRlIGFyb3VuZCBvYnN0cmFjbGVzLCBldGMsIGhlbmNlIHNob3VsZCB1c2UgQkZTXG4vLyAgICAgICAgIGNvbnN0IGRpcmVjdGlvbnMgPSBbXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkxFRlQsIGR4OiAtMSwgZHk6IDAsIGNlbGw6IGNlbGwubGVmdCB9LFxuLy8gICAgICAgICAgICAgeyBhY3Rpb246IEFjdGlvbi5SSUdIVCwgZHg6IDEsIGR5OiAwLCBjZWxsOiBjZWxsLnJpZ2h0IH0sXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLlVQLCBkeDogMCwgZHk6IC0xLCBjZWxsOiBjZWxsLnVwIH0sXG4vLyAgICAgICAgICAgICB7IGFjdGlvbjogQWN0aW9uLkRPV04sIGR4OiAwLCBkeTogMSwgY2VsbDogY2VsbC5kb3duIH0sXG4vLyAgICAgICAgIF07XG4vLyAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcmVjdGlvbnMpIHtcbi8vICAgICAgICAgICAgIGlmIChcbi8vICAgICAgICAgICAgICAgICBkaXIuY2VsbC50eXBlID09IENlbGxUeXBlLkdPTEQgJiZcbi8vICAgICAgICAgICAgICAgICBNYXRoLmFicyhkaXIuY2VsbC5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDFcbi8vICAgICAgICAgICAgICkge1xuLy8gICAgICAgICAgICAgICAgIHJldHVybiBkaXIuYWN0aW9uO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gICAgIC8vIGZhbGxiYWNrIC0tIGV4cGxvcmUgdG8gZmluZCBtb3JlIGJsb2NrcyBvciBiZXR0ZXIgcG9zaXRpb25cbi8vICAgICByZXR1cm4gdGhpcy5leHBsb3JlQWN0aW9uKGNlbGwpO1xuLy8gfVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFjdGlvbiA9IHZvaWQgMDtcbi8vIFRoaXMgaXMgdGhlIGxpc3Qgb2YgYWN0aW9ucyB0aGF0IHRoZSBTdGFja2VyIGNhbiB0YWtlXG52YXIgQWN0aW9uO1xuKGZ1bmN0aW9uIChBY3Rpb24pIHtcbiAgICBBY3Rpb25bXCJMRUZUXCJdID0gXCJsZWZ0XCI7XG4gICAgQWN0aW9uW1wiVVBcIl0gPSBcInVwXCI7XG4gICAgQWN0aW9uW1wiUklHSFRcIl0gPSBcInJpZ2h0XCI7XG4gICAgQWN0aW9uW1wiRE9XTlwiXSA9IFwiZG93blwiO1xuICAgIEFjdGlvbltcIlBJQ0tVUFwiXSA9IFwicGlja3VwXCI7XG4gICAgQWN0aW9uW1wiRFJPUFwiXSA9IFwiZHJvcFwiO1xufSkoQWN0aW9uIHx8IChleHBvcnRzLkFjdGlvbiA9IEFjdGlvbiA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2VsbFR5cGUgPSB2b2lkIDA7XG52YXIgQ2VsbFR5cGU7XG4oZnVuY3Rpb24gKENlbGxUeXBlKSB7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJFTVBUWVwiXSA9IDBdID0gXCJFTVBUWVwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiV0FMTFwiXSA9IDFdID0gXCJXQUxMXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJCTE9DS1wiXSA9IDJdID0gXCJCTE9DS1wiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiR09MRFwiXSA9IDNdID0gXCJHT0xEXCI7XG59KShDZWxsVHlwZSB8fCAoZXhwb3J0cy5DZWxsVHlwZSA9IENlbGxUeXBlID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9TdGFja2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9