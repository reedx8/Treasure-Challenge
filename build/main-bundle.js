/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Stacker.ts":
/*!************************!*\
  !*** ./src/Stacker.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
/*
Program only capable of dropping a single block near found tower.
Yet to collect additional blocks and build staircase.
Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location

4 main algos to find:
1. traversal algo (done)
    - save tower location (done)
2. Traversal needs backtracking algo too (done)
3. find blocks algo (can just pop off path[] for now) (TODO)
    - only pickup if not staircase cell
    - total blocks = collect ((h-1)(h))/2  blocks in total (where h = tower height)
4. build staircase algo (TODO)
    - Initial: build until staircase.length = 2 and 2 block dropped
    - Add block to end of staircase when staircase full (staircase[0] = staircase.length), repeat till total blocks collected

- Each run has several paths created -- path[] cleared each time troll at tower (TODO)
- explored is a 2nd list of all explored cells in run.
- Journey = path to tower or path to a block
*/
var Action_1 = __webpack_require__(/*! ./lib/Action */ "./src/lib/Action.ts");
var CellType_1 = __webpack_require__(/*! ./lib/CellType */ "./src/lib/CellType.ts");
var Phase;
(function (Phase) {
    Phase["FIND_TOWER"] = "Find Tower Phase";
    Phase["COLLECT_BLOCKS"] = "Collect Blocks Phase";
    Phase["BUILD_STAIRCASE"] = "Build Staircase Phase";
})(Phase || (Phase = {}));
var Stacker = /** @class */ (function () {
    function Stacker() {
        var _this = this;
        this.towerLocation = null; // x,y location of tower on map
        this.holdingBlock = false; // if we are holding a block
        this.current = null; // current x,y position/cell on map
        this.prevCell = null; // previous cell
        this.origin = { x: 0, y: 0, nextAction: null }; // orogin cell of entire coordinate system (ie start)
        this.blockLocation = null; // x,y location of block to pickup on map
        this.phase = Phase.FIND_TOWER; // current phase
        // For BFS/DFS traversal and backtracking (TODO: add to MyCell instead):
        this.path = []; // The path actually taken thus far for each journey (using set would probably be better lookup time if needed)
        this.explored = []; // list of all cells visited in journey/path, needed since path[] regularly removed from during backtracking, hence need a global cells visited list cleared/deleted in fewer cases (using set would probably be better lookup time if ever needed)
        this.toVisit = []; // list of cells to visit next
        this.backtrackInProgress = false; // if we are currently backtracking
        this.returningToTower = false; // if we are currently returning to tower in phase 2
        this.staircase = []; // list of cells to build staircase on
        // Using the triangular number formula: (h-1)h/2 (8 hardcoded for now since only ever seen 8 level towers. h = tower height)
        // private staircaseTotal: number = Math.abs((8 - 1) * 8) / 2; // (not used) total number of blocks required to build staircase
        this.turn = function (cell) {
            // pickup block along the way if you can
            if (cell.type === CellType_1.CellType.BLOCK &&
                !_this.holdingBlock &&
                !_this.towerLocation // TODO: should be able to pick up block when tower is found too obv., but avoids never-ending pickup/drop loop at end for now
            ) {
                _this.holdingBlock = true;
                console.log('PICKUP');
                return Action_1.Action.PICKUP;
            }
            // Phase 1: Update position and traverse map for tower
            if (!_this.current) {
                // at start of run
                _this.current = __assign({}, _this.origin);
                _this.updatePath(_this.current);
                return _this.traverseMap(cell);
            }
            else if (!_this.towerLocation) {
                _this.updateState(_this.current, Phase.FIND_TOWER); // update state to new position
                return _this.traverseMap(cell);
            }
            else {
                // Phase 2: Tower located, now collect blocks/build staircase phase
                if (!_this.blockLocation) {
                    // ...youve just found tower and dropped block from traverseMap()
                    if (_this.phase === Phase.FIND_TOWER) {
                        // Begin collecting blocks phase
                        _this.current = __assign({}, _this.toVisit.pop());
                        _this.phase = Phase.COLLECT_BLOCKS;
                        _this.clearState();
                        _this.explored = [];
                        _this.updatePath(_this.current);
                    }
                    else {
                        // else update state as normal
                        _this.updateState(_this.current, Phase.COLLECT_BLOCKS);
                    }
                    return _this.traverseMap(cell);
                }
                else {
                    // Block Found -- Pickup, then drop block wehn back at tower
                    if (!_this.returningToTower && cell.type === CellType_1.CellType.BLOCK) {
                        // traverse back to tower via this.path, but not before collecting block
                        _this.toVisit = [];
                        _this.returningToTower = true;
                        _this.holdingBlock = true;
                        _this.path.slice(-1)[0].nextAction = _this.current.nextAction;
                        console.log('PICKUP');
                        return Action_1.Action.PICKUP;
                    }
                    if (_this.path.length === 0) {
                        // we know we're at tower when path.length === 0, so drop block
                        console.log('DROP');
                        _this.holdingBlock = false;
                        _this.blockLocation = null;
                        _this.path.push(_this.current);
                        _this.explored.push(_this.current);
                        return Action_1.Action.DROP;
                    }
                    else {
                        // return to tower
                        return _this.reverseDirection(_this.path.pop().nextAction);
                        // return this.returnToTower();
                    }
                }
                ////////////////////////////////////////////////////////////////////////////////////
                // console.log(
                //     'STOP | tower found: ' +
                //         this.towerLocation.x +
                //         ',' +
                //         this.towerLocation.y
                // );
                // if (this.holdingBlock) {
                //     console.log('DROP');
                //     this.holdingBlock = false;
                // }
                // // TODO: needs to drop only under certain conditions
                // return Action.DROP; // 2nd drop: placeholder for now (stays in place while dropping too)
            }
        };
    }
    Stacker.prototype.buildStaircase = function (cell, current) {
        if (this.staircase.length < 2) {
            // build initial staircase (two 1 block cells)
            if (cell.type === CellType_1.CellType.BLOCK) {
                return this.reverseDirection(this.path.pop().nextAction);
                // return this.reverseDirection(current.nextAction);
            }
            this.staircase.push(__assign(__assign({}, current), { level: 1 }));
            console.log('STAIRCASE: add block');
            this.holdingBlock = false;
            this.blockLocation = null;
            return Action_1.Action.DROP;
        }
        // else drop at end of staircase when staircase full
        if (this.staircase[0].level === this.staircase.length &&
            this.path.length > 0) {
            if (cell.type === CellType_1.CellType.BLOCK) {
                // cell == curent?
                this.staircase.push(__assign(__assign({}, current), { level: 1 }));
                console.log('STAIRCASE: add block');
                this.holdingBlock = false;
                this.blockLocation = null;
                return Action_1.Action.DROP;
            }
            else {
                this.current = this.path.pop();
                return this.reverseDirection(this.current.nextAction);
            }
        }
        // else drop at top of staircase
        this.holdingBlock = false;
        this.blockLocation = null;
        this.path.push(this.current);
        this.explored.push(this.current);
        this.staircase.push(__assign(__assign({}, current), { level: 1 }));
        console.log('STAIRCASE: add block');
        return Action_1.Action.DROP;
    };
    // using new nextAction property to backtrack this time instead of backtrackAction() (TODO: refactor backtrackAction to use this new property instead, simpler)
    Stacker.prototype.reverseDirection = function (direction) {
        if (direction === Action_1.Action.UP)
            return Action_1.Action.DOWN;
        if (direction === Action_1.Action.DOWN)
            return Action_1.Action.UP;
        if (direction === Action_1.Action.LEFT)
            return Action_1.Action.RIGHT;
        if (direction === Action_1.Action.RIGHT)
            return Action_1.Action.LEFT;
    };
    // using new nextAction property to backtrack this time instead of backtrackAction() (TODO: refactor backtrackAction to use this new property instead, simpler)
    Stacker.prototype.returnToTower = function () {
        var prevCell = this.path.pop();
        if (prevCell.nextAction === Action_1.Action.UP) {
            console.log('go back v');
            return Action_1.Action.DOWN;
        }
        else if (prevCell.nextAction === Action_1.Action.DOWN) {
            console.log('go back ^');
            return Action_1.Action.UP;
        }
        else if (prevCell.nextAction === Action_1.Action.LEFT) {
            console.log('go back ->');
            return Action_1.Action.RIGHT;
        }
        else if (prevCell.nextAction === Action_1.Action.RIGHT) {
            console.log('go back <-');
            return Action_1.Action.LEFT;
        }
    };
    // Traverse map by adding to toVisit, & current is always updated to last element of toVisit
    Stacker.prototype.traverseMap = function (cell) {
        var canMove = false;
        var neighbors = [
            { dir: cell.up, dx: 0, dy: -1 },
            { dir: cell.left, dx: -1, dy: 0 },
            { dir: cell.down, dx: 0, dy: 1 },
            { dir: cell.right, dx: 1, dy: 0 },
        ];
        // Add valid neighbors to toVisit stack for traversal, check for tower too
        for (var _i = 0, neighbors_1 = neighbors; _i < neighbors_1.length; _i++) {
            var n = neighbors_1[_i];
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
            // console.log('DROP: Tower found, end FIND_TOWER phase');
            return Action_1.Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
        }
        if (this.blockLocation && this.phase === Phase.COLLECT_BLOCKS) {
            // reroute to block's position IOT pickup
            // console.log('traverseMap: route to block cell');
            return this.getNextAction(this.blockLocation);
        }
        if (canMove) {
            this.backtrackInProgress = false;
            return this.getNextAction();
        }
        else {
            if (this.current.x === 0 && this.current.y === 0) {
                console.log("Reached run's end without finding tower");
                return Action_1.Action.DROP; // placeholder for now, troll stays in place
            }
            // else we just cant move to valid cells, so backtrack
            return this.backtrackAction();
        }
    };
    // Begin backtracking if stuck for any reason
    Stacker.prototype.backtrackAction = function () {
        this.backtrackInProgress = true;
        // x and y direction to backtrack to:
        this.path.pop();
        var xDirection = this.path.slice(-1)[0].x - this.current.x;
        var yDirection = this.path.slice(-1)[0].y - this.current.y;
        if (yDirection < 0) {
            console.log('go back ^');
            this.current.nextAction = Action_1.Action.UP;
            return Action_1.Action.UP;
        }
        else if (yDirection > 0) {
            console.log('go back v');
            this.current.nextAction = Action_1.Action.DOWN;
            return Action_1.Action.DOWN;
        }
        else if (xDirection < 0) {
            console.log('go back <-');
            this.current.nextAction = Action_1.Action.LEFT;
            return Action_1.Action.LEFT;
        }
        else if (xDirection > 0) {
            console.log('go back ->');
            this.current.nextAction = Action_1.Action.RIGHT;
            return Action_1.Action.RIGHT;
        }
        else {
            console.log('nothing to backtrack to');
            return Action_1.Action.DROP; // placeholder for now, troll stays in place
        }
    };
    // Derives next Action based on our coordinates (could remove this.origin since always 0):
    Stacker.prototype.getNextAction = function (nextCell) {
        if (nextCell === void 0) { nextCell = this.toVisit.slice(-1)[0]; }
        var x = this.origin.x - this.current.x + nextCell.x; // last toVisit due to using pop()
        var y = this.origin.y - this.current.y + nextCell.y;
        if (x < 0) {
            // left: -1x
            this.current.nextAction = Action_1.Action.LEFT;
            return Action_1.Action.LEFT;
        }
        else if (x > 0) {
            // right: +1x
            this.current.nextAction = Action_1.Action.RIGHT;
            return Action_1.Action.RIGHT;
        }
        else if (y < 0) {
            // up: -1y
            this.current.nextAction = Action_1.Action.UP;
            return Action_1.Action.UP;
        }
        else if (y > 0) {
            // down: +1y
            this.current.nextAction = Action_1.Action.DOWN;
            return Action_1.Action.DOWN;
        }
        else {
            // When x=0 and y=0 when visited all cells on map
            console.log('no next action');
            return Action_1.Action.DROP; // placeholder for now, troll stays in place
        }
    };
    // Add to explored and path list if not already in there
    Stacker.prototype.updatePath = function (position) {
        if (!this.explored.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.explored.push(__assign({}, position));
        }
        if (!this.path.some(function (p) { return p.x === position.x && p.y === position.y; })) {
            this.path.push(__assign({}, position));
        }
    };
    Stacker.prototype.updateState = function (prevPosition, currentPhase) {
        var _this = this;
        this.phase = currentPhase;
        this.prevCell = __assign({}, prevPosition); // TODO: may not be needed due to nextAction property
        // update current cell since weve now moved ahead
        this.path.slice(-1)[0].nextAction = prevPosition.nextAction;
        if (this.backtrackInProgress) {
            this.current = this.path.pop(); // should sync with cell
        }
        else {
            // this.path.slice(-1)[0].nextAction = this.current.nextAction;
            this.current = this.toVisit.pop();
        }
        // and add current cell to explored and path lists
        if (!this.explored.some(function (e) { return e.x === _this.current.x && e.y === _this.current.y; })) {
            this.explored.push(__assign({}, this.current));
        }
        if (!this.path.some(function (p) { return p.x === _this.current.x && p.y === _this.current.y; })) {
            this.path.push(__assign({}, this.current));
        }
    };
    Stacker.prototype.clearState = function () {
        this.prevCell = null;
        this.path = [];
        this.toVisit = [];
        this.backtrackInProgress = false;
    };
    // Find which neighbors are valid to move to (not wall, not visited, and 1 level away)
    // as well as if any are a tower as well
    Stacker.prototype.checkNeighbors = function (cell, // current cell
    direction, dx, dy) {
        var _this = this;
        // current should === cell
        if (direction.type !== CellType_1.CellType.WALL &&
            !this.path.some(function (p) {
                return p.x === _this.current.x + dx && p.y === _this.current.y + dy;
            }) &&
            // this.explored needed since this.path has elements regularly removed
            !this.explored.some(function (e) {
                return e.x === _this.current.x + dx && e.y === _this.current.y + dy;
            })) {
            if (this.phase === Phase.COLLECT_BLOCKS && !this.blockLocation)
                this.findBlock(direction, dx, dy);
            if (!this.towerLocation)
                this.findTower(direction, dx, dy);
            if (Math.abs(direction.level - cell.level) <= 1)
                return true;
        }
        return false;
        // TODO: what about for CellType.GOLD?
    };
    // Check if tower is found and update its location (only perform during phase 1)
    Stacker.prototype.findTower = function (direction, dx, dy) {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
                nextAction: null,
            };
        }
    };
    Stacker.prototype.findBlock = function (direction, dx, dy) {
        if (direction.type === CellType_1.CellType.BLOCK && !this.blockLocation) {
            this.blockLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
                nextAction: null,
            };
        }
    };
    return Stacker;
}());
window.Stacker = Stacker;


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBLENBQUMsYUFBYSxjQUFjLGNBQWM7Ozs7Ozs7Ozs7O0FDWjdCO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGVBQWUsZ0JBQWdCLGdCQUFnQjs7Ozs7OztVQ1RoRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL1N0YWNrZXIudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9BY3Rpb24udHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9DZWxsVHlwZS50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qXG5Qcm9ncmFtIG9ubHkgY2FwYWJsZSBvZiBkcm9wcGluZyBhIHNpbmdsZSBibG9jayBuZWFyIGZvdW5kIHRvd2VyLlxuWWV0IHRvIGNvbGxlY3QgYWRkaXRpb25hbCBibG9ja3MgYW5kIGJ1aWxkIHN0YWlyY2FzZS5cblByb2dyYW0gd2lsbCBjb25zb2xlLmxvZygpOiBiYWNrdHJhY2sgZGlyZWN0aW9uIChpZiBuZWVkZWQpLCBwaWNrdXAvZHJvcCwgYW5kIHRvd2VyIGxvY2F0aW9uXG5cbjQgbWFpbiBhbGdvcyB0byBmaW5kOlxuMS4gdHJhdmVyc2FsIGFsZ28gKGRvbmUpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uIChkb25lKVxuMi4gVHJhdmVyc2FsIG5lZWRzIGJhY2t0cmFja2luZyBhbGdvIHRvbyAoZG9uZSlcbjMuIGZpbmQgYmxvY2tzIGFsZ28gKGNhbiBqdXN0IHBvcCBvZmYgcGF0aFtdIGZvciBub3cpIChUT0RPKVxuICAgIC0gb25seSBwaWNrdXAgaWYgbm90IHN0YWlyY2FzZSBjZWxsXG4gICAgLSB0b3RhbCBibG9ja3MgPSBjb2xsZWN0ICgoaC0xKShoKSkvMiAgYmxvY2tzIGluIHRvdGFsICh3aGVyZSBoID0gdG93ZXIgaGVpZ2h0KVxuNC4gYnVpbGQgc3RhaXJjYXNlIGFsZ28gKFRPRE8pXG4gICAgLSBJbml0aWFsOiBidWlsZCB1bnRpbCBzdGFpcmNhc2UubGVuZ3RoID0gMiBhbmQgMiBibG9jayBkcm9wcGVkXG4gICAgLSBBZGQgYmxvY2sgdG8gZW5kIG9mIHN0YWlyY2FzZSB3aGVuIHN0YWlyY2FzZSBmdWxsIChzdGFpcmNhc2VbMF0gPSBzdGFpcmNhc2UubGVuZ3RoKSwgcmVwZWF0IHRpbGwgdG90YWwgYmxvY2tzIGNvbGxlY3RlZFxuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIHBhdGhzIGNyZWF0ZWQgLS0gcGF0aFtdIGNsZWFyZWQgZWFjaCB0aW1lIHRyb2xsIGF0IHRvd2VyIChUT0RPKVxuLSBleHBsb3JlZCBpcyBhIDJuZCBsaXN0IG9mIGFsbCBleHBsb3JlZCBjZWxscyBpbiBydW4uXG4tIEpvdXJuZXkgPSBwYXRoIHRvIHRvd2VyIG9yIHBhdGggdG8gYSBibG9ja1xuKi9cbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBQaGFzZTtcbihmdW5jdGlvbiAoUGhhc2UpIHtcbiAgICBQaGFzZVtcIkZJTkRfVE9XRVJcIl0gPSBcIkZpbmQgVG93ZXIgUGhhc2VcIjtcbiAgICBQaGFzZVtcIkNPTExFQ1RfQkxPQ0tTXCJdID0gXCJDb2xsZWN0IEJsb2NrcyBQaGFzZVwiO1xuICAgIFBoYXNlW1wiQlVJTERfU1RBSVJDQVNFXCJdID0gXCJCdWlsZCBTdGFpcmNhc2UgUGhhc2VcIjtcbn0pKFBoYXNlIHx8IChQaGFzZSA9IHt9KSk7XG52YXIgU3RhY2tlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFja2VyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgdG93ZXIgb24gbWFwXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24vY2VsbCBvbiBtYXBcbiAgICAgICAgdGhpcy5wcmV2Q2VsbCA9IG51bGw7IC8vIHByZXZpb3VzIGNlbGxcbiAgICAgICAgdGhpcy5vcmlnaW4gPSB7IHg6IDAsIHk6IDAsIG5leHRBY3Rpb246IG51bGwgfTsgLy8gb3JvZ2luIGNlbGwgb2YgZW50aXJlIGNvb3JkaW5hdGUgc3lzdGVtIChpZSBzdGFydClcbiAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDsgLy8geCx5IGxvY2F0aW9uIG9mIGJsb2NrIHRvIHBpY2t1cCBvbiBtYXBcbiAgICAgICAgdGhpcy5waGFzZSA9IFBoYXNlLkZJTkRfVE9XRVI7IC8vIGN1cnJlbnQgcGhhc2VcbiAgICAgICAgLy8gRm9yIEJGUy9ERlMgdHJhdmVyc2FsIGFuZCBiYWNrdHJhY2tpbmcgKFRPRE86IGFkZCB0byBNeUNlbGwgaW5zdGVhZCk6XG4gICAgICAgIHRoaXMucGF0aCA9IFtdOyAvLyBUaGUgcGF0aCBhY3R1YWxseSB0YWtlbiB0aHVzIGZhciBmb3IgZWFjaCBqb3VybmV5ICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIG5lZWRlZClcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmVlZGVkIHNpbmNlIHBhdGhbXSByZWd1bGFybHkgcmVtb3ZlZCBmcm9tIGR1cmluZyBiYWNrdHJhY2tpbmcsIGhlbmNlIG5lZWQgYSBnbG9iYWwgY2VsbHMgdmlzaXRlZCBsaXN0IGNsZWFyZWQvZGVsZXRlZCBpbiBmZXdlciBjYXNlcyAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgbmV4dFxuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGN1cnJlbnRseSBiYWNrdHJhY2tpbmdcbiAgICAgICAgdGhpcy5yZXR1cm5pbmdUb1Rvd2VyID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBjdXJyZW50bHkgcmV0dXJuaW5nIHRvIHRvd2VyIGluIHBoYXNlIDJcbiAgICAgICAgdGhpcy5zdGFpcmNhc2UgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byBidWlsZCBzdGFpcmNhc2Ugb25cbiAgICAgICAgLy8gVXNpbmcgdGhlIHRyaWFuZ3VsYXIgbnVtYmVyIGZvcm11bGE6IChoLTEpaC8yICg4IGhhcmRjb2RlZCBmb3Igbm93IHNpbmNlIG9ubHkgZXZlciBzZWVuIDggbGV2ZWwgdG93ZXJzLiBoID0gdG93ZXIgaGVpZ2h0KVxuICAgICAgICAvLyBwcml2YXRlIHN0YWlyY2FzZVRvdGFsOiBudW1iZXIgPSBNYXRoLmFicygoOCAtIDEpICogOCkgLyAyOyAvLyAobm90IHVzZWQpIHRvdGFsIG51bWJlciBvZiBibG9ja3MgcmVxdWlyZWQgdG8gYnVpbGQgc3RhaXJjYXNlXG4gICAgICAgIHRoaXMudHVybiA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAvLyBwaWNrdXAgYmxvY2sgYWxvbmcgdGhlIHdheSBpZiB5b3UgY2FuXG4gICAgICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLmhvbGRpbmdCbG9jayAmJlxuICAgICAgICAgICAgICAgICFfdGhpcy50b3dlckxvY2F0aW9uIC8vIFRPRE86IHNob3VsZCBiZSBhYmxlIHRvIHBpY2sgdXAgYmxvY2sgd2hlbiB0b3dlciBpcyBmb3VuZCB0b28gb2J2LiwgYnV0IGF2b2lkcyBuZXZlci1lbmRpbmcgcGlja3VwL2Ryb3AgbG9vcCBhdCBlbmQgZm9yIG5vd1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUElDS1VQJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAxOiBVcGRhdGUgcG9zaXRpb24gYW5kIHRyYXZlcnNlIG1hcCBmb3IgdG93ZXJcbiAgICAgICAgICAgIGlmICghX3RoaXMuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGF0IHN0YXJ0IG9mIHJ1blxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfX2Fzc2lnbih7fSwgX3RoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlU3RhdGUoX3RoaXMuY3VycmVudCwgUGhhc2UuRklORF9UT1dFUik7IC8vIHVwZGF0ZSBzdGF0ZSB0byBuZXcgcG9zaXRpb25cbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBQaGFzZSAyOiBUb3dlciBsb2NhdGVkLCBub3cgY29sbGVjdCBibG9ja3MvYnVpbGQgc3RhaXJjYXNlIHBoYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5ibG9ja0xvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLnlvdXZlIGp1c3QgZm91bmQgdG93ZXIgYW5kIGRyb3BwZWQgYmxvY2sgZnJvbSB0cmF2ZXJzZU1hcCgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5waGFzZSA9PT0gUGhhc2UuRklORF9UT1dFUikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmVnaW4gY29sbGVjdGluZyBibG9ja3MgcGhhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfX2Fzc2lnbih7fSwgX3RoaXMudG9WaXNpdC5wb3AoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5waGFzZSA9IFBoYXNlLkNPTExFQ1RfQkxPQ0tTO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY2xlYXJTdGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZXhwbG9yZWQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbHNlIHVwZGF0ZSBzdGF0ZSBhcyBub3JtYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVN0YXRlKF90aGlzLmN1cnJlbnQsIFBoYXNlLkNPTExFQ1RfQkxPQ0tTKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBCbG9jayBGb3VuZCAtLSBQaWNrdXAsIHRoZW4gZHJvcCBibG9jayB3ZWhuIGJhY2sgYXQgdG93ZXJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5yZXR1cm5pbmdUb1Rvd2VyICYmIGNlbGwudHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJhdmVyc2UgYmFjayB0byB0b3dlciB2aWEgdGhpcy5wYXRoLCBidXQgbm90IGJlZm9yZSBjb2xsZWN0aW5nIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy50b1Zpc2l0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5yZXR1cm5pbmdUb1Rvd2VyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5wYXRoLnNsaWNlKC0xKVswXS5uZXh0QWN0aW9uID0gX3RoaXMuY3VycmVudC5uZXh0QWN0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BJQ0tVUCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLnBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBrbm93IHdlJ3JlIGF0IHRvd2VyIHdoZW4gcGF0aC5sZW5ndGggPT09IDAsIHNvIGRyb3AgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEUk9QJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmJsb2NrTG9jYXRpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucGF0aC5wdXNoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZXhwbG9yZWQucHVzaChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0byB0b3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnJldmVyc2VEaXJlY3Rpb24oX3RoaXMucGF0aC5wb3AoKS5uZXh0QWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLnJldHVyblRvVG93ZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAvLyAgICAgJ1NUT1AgfCB0b3dlciBmb3VuZDogJyArXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24ueCArXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAnLCcgK1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgdGhpcy50b3dlckxvY2F0aW9uLnlcbiAgICAgICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgICAgIC8vIGlmICh0aGlzLmhvbGRpbmdCbG9jaykge1xuICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAvLyAvLyBUT0RPOiBuZWVkcyB0byBkcm9wIG9ubHkgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zXG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIEFjdGlvbi5EUk9QOyAvLyAybmQgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyAoc3RheXMgaW4gcGxhY2Ugd2hpbGUgZHJvcHBpbmcgdG9vKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBTdGFja2VyLnByb3RvdHlwZS5idWlsZFN0YWlyY2FzZSA9IGZ1bmN0aW9uIChjZWxsLCBjdXJyZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YWlyY2FzZS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAvLyBidWlsZCBpbml0aWFsIHN0YWlyY2FzZSAodHdvIDEgYmxvY2sgY2VsbHMpXG4gICAgICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZURpcmVjdGlvbih0aGlzLnBhdGgucG9wKCkubmV4dEFjdGlvbik7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRoaXMucmV2ZXJzZURpcmVjdGlvbihjdXJyZW50Lm5leHRBY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zdGFpcmNhc2UucHVzaChfX2Fzc2lnbihfX2Fzc2lnbih7fSwgY3VycmVudCksIHsgbGV2ZWw6IDEgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NUQUlSQ0FTRTogYWRkIGJsb2NrJyk7XG4gICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDtcbiAgICAgICAgfVxuICAgICAgICAvLyBlbHNlIGRyb3AgYXQgZW5kIG9mIHN0YWlyY2FzZSB3aGVuIHN0YWlyY2FzZSBmdWxsXG4gICAgICAgIGlmICh0aGlzLnN0YWlyY2FzZVswXS5sZXZlbCA9PT0gdGhpcy5zdGFpcmNhc2UubGVuZ3RoICYmXG4gICAgICAgICAgICB0aGlzLnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKGNlbGwudHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgIC8vIGNlbGwgPT0gY3VyZW50P1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU1RBSVJDQVNFOiBhZGQgYmxvY2snKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5wYXRoLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJldmVyc2VEaXJlY3Rpb24odGhpcy5jdXJyZW50Lm5leHRBY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2UgZHJvcCBhdCB0b3Agb2Ygc3RhaXJjYXNlXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMucGF0aC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgIHRoaXMuZXhwbG9yZWQucHVzaCh0aGlzLmN1cnJlbnQpO1xuICAgICAgICB0aGlzLnN0YWlyY2FzZS5wdXNoKF9fYXNzaWduKF9fYXNzaWduKHt9LCBjdXJyZW50KSwgeyBsZXZlbDogMSB9KSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdTVEFJUkNBU0U6IGFkZCBibG9jaycpO1xuICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7XG4gICAgfTtcbiAgICAvLyB1c2luZyBuZXcgbmV4dEFjdGlvbiBwcm9wZXJ0eSB0byBiYWNrdHJhY2sgdGhpcyB0aW1lIGluc3RlYWQgb2YgYmFja3RyYWNrQWN0aW9uKCkgKFRPRE86IHJlZmFjdG9yIGJhY2t0cmFja0FjdGlvbiB0byB1c2UgdGhpcyBuZXcgcHJvcGVydHkgaW5zdGVhZCwgc2ltcGxlcilcbiAgICBTdGFja2VyLnByb3RvdHlwZS5yZXZlcnNlRGlyZWN0aW9uID0gZnVuY3Rpb24gKGRpcmVjdGlvbikge1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uVVApXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEFjdGlvbl8xLkFjdGlvbi5ET1dOKVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQWN0aW9uXzEuQWN0aW9uLkxFRlQpXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uUklHSFQpXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgfTtcbiAgICAvLyB1c2luZyBuZXcgbmV4dEFjdGlvbiBwcm9wZXJ0eSB0byBiYWNrdHJhY2sgdGhpcyB0aW1lIGluc3RlYWQgb2YgYmFja3RyYWNrQWN0aW9uKCkgKFRPRE86IHJlZmFjdG9yIGJhY2t0cmFja0FjdGlvbiB0byB1c2UgdGhpcyBuZXcgcHJvcGVydHkgaW5zdGVhZCwgc2ltcGxlcilcbiAgICBTdGFja2VyLnByb3RvdHlwZS5yZXR1cm5Ub1Rvd2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldkNlbGwgPSB0aGlzLnBhdGgucG9wKCk7XG4gICAgICAgIGlmIChwcmV2Q2VsbC5uZXh0QWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uVVApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIHYnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwcmV2Q2VsbC5uZXh0QWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uRE9XTikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgXicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwcmV2Q2VsbC5uZXh0QWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uTEVGVCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgLT4nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocHJldkNlbGwubmV4dEFjdGlvbiA9PT0gQWN0aW9uXzEuQWN0aW9uLlJJR0hUKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayA8LScpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBUcmF2ZXJzZSBtYXAgYnkgYWRkaW5nIHRvIHRvVmlzaXQsICYgY3VycmVudCBpcyBhbHdheXMgdXBkYXRlZCB0byBsYXN0IGVsZW1lbnQgb2YgdG9WaXNpdFxuICAgIFN0YWNrZXIucHJvdG90eXBlLnRyYXZlcnNlTWFwID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgdmFyIGNhbk1vdmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIG5laWdoYm9ycyA9IFtcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLnVwLCBkeDogMCwgZHk6IC0xIH0sXG4gICAgICAgICAgICB7IGRpcjogY2VsbC5sZWZ0LCBkeDogLTEsIGR5OiAwIH0sXG4gICAgICAgICAgICB7IGRpcjogY2VsbC5kb3duLCBkeDogMCwgZHk6IDEgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLnJpZ2h0LCBkeDogMSwgZHk6IDAgfSxcbiAgICAgICAgXTtcbiAgICAgICAgLy8gQWRkIHZhbGlkIG5laWdoYm9ycyB0byB0b1Zpc2l0IHN0YWNrIGZvciB0cmF2ZXJzYWwsIGNoZWNrIGZvciB0b3dlciB0b29cbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBuZWlnaGJvcnNfMSA9IG5laWdoYm9yczsgX2kgPCBuZWlnaGJvcnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBuID0gbmVpZ2hib3JzXzFbX2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tOZWlnaGJvcnMoY2VsbCwgbi5kaXIsIG4uZHgsIG4uZHkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIG4uZHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgbi5keSxcbiAgICAgICAgICAgICAgICAgICAgbmV4dEFjdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBQZXJmb3JtIGFjdGlvbnMgZGVwZW5kaW5nIG9uIGN1cnJlbnQgcGhhc2VcbiAgICAgICAgaWYgKHRoaXMudG93ZXJMb2NhdGlvbiAmJiB0aGlzLnBoYXNlID09PSBQaGFzZS5GSU5EX1RPV0VSKSB7XG4gICAgICAgICAgICAvLyBUb3dlciBsb2NhdGVkIHNvbWV3aGVyZSBpbiBjZWxsJ3MgaW1tZWQuIG5laWdoYm9yaW5nIGNlbGxzLi4uXG4gICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ0RST1A6IFRvd2VyIGZvdW5kLCBlbmQgRklORF9UT1dFUiBwaGFzZScpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBGaXJzdCBkcm9wOiBwbGFjZWhvbGRlciBmb3Igbm93IHRvIGV4aXQgZWFybHksIHRyb2xsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYmxvY2tMb2NhdGlvbiAmJiB0aGlzLnBoYXNlID09PSBQaGFzZS5DT0xMRUNUX0JMT0NLUykge1xuICAgICAgICAgICAgLy8gcmVyb3V0ZSB0byBibG9jaydzIHBvc2l0aW9uIElPVCBwaWNrdXBcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0cmF2ZXJzZU1hcDogcm91dGUgdG8gYmxvY2sgY2VsbCcpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbih0aGlzLmJsb2NrTG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQueCA9PT0gMCAmJiB0aGlzLmN1cnJlbnQueSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVhY2hlZCBydW4ncyBlbmQgd2l0aG91dCBmaW5kaW5nIHRvd2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2Ugd2UganVzdCBjYW50IG1vdmUgdG8gdmFsaWQgY2VsbHMsIHNvIGJhY2t0cmFja1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3RyYWNrQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZyBpZiBzdHVjayBmb3IgYW55IHJlYXNvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgLy8geCBhbmQgeSBkaXJlY3Rpb24gdG8gYmFja3RyYWNrIHRvOlxuICAgICAgICB0aGlzLnBhdGgucG9wKCk7XG4gICAgICAgIHZhciB4RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS54IC0gdGhpcy5jdXJyZW50Lng7XG4gICAgICAgIHZhciB5RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55IC0gdGhpcy5jdXJyZW50Lnk7XG4gICAgICAgIGlmICh5RGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgXicpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHlEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayB2Jyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayA8LScpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgLT4nKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdub3RoaW5nIHRvIGJhY2t0cmFjayB0bycpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBEZXJpdmVzIG5leHQgQWN0aW9uIGJhc2VkIG9uIG91ciBjb29yZGluYXRlcyAoY291bGQgcmVtb3ZlIHRoaXMub3JpZ2luIHNpbmNlIGFsd2F5cyAwKTpcbiAgICBTdGFja2VyLnByb3RvdHlwZS5nZXROZXh0QWN0aW9uID0gZnVuY3Rpb24gKG5leHRDZWxsKSB7XG4gICAgICAgIGlmIChuZXh0Q2VsbCA9PT0gdm9pZCAwKSB7IG5leHRDZWxsID0gdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXTsgfVxuICAgICAgICB2YXIgeCA9IHRoaXMub3JpZ2luLnggLSB0aGlzLmN1cnJlbnQueCArIG5leHRDZWxsLng7IC8vIGxhc3QgdG9WaXNpdCBkdWUgdG8gdXNpbmcgcG9wKClcbiAgICAgICAgdmFyIHkgPSB0aGlzLm9yaWdpbi55IC0gdGhpcy5jdXJyZW50LnkgKyBuZXh0Q2VsbC55O1xuICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgIC8vIGxlZnQ6IC0xeFxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICAgICAgLy8gcmlnaHQ6ICsxeFxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPCAwKSB7XG4gICAgICAgICAgICAvLyB1cDogLTF5XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICAgIC8vIGRvd246ICsxeVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdoZW4geD0wIGFuZCB5PTAgd2hlbiB2aXNpdGVkIGFsbCBjZWxscyBvbiBtYXBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBuZXh0IGFjdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBBZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggbGlzdCBpZiBub3QgYWxyZWFkeSBpbiB0aGVyZVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnVwZGF0ZVBhdGggPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGxvcmVkLnB1c2goX19hc3NpZ24oe30sIHBvc2l0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAocCkgeyByZXR1cm4gcC54ID09PSBwb3NpdGlvbi54ICYmIHAueSA9PT0gcG9zaXRpb24ueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVTdGF0ZSA9IGZ1bmN0aW9uIChwcmV2UG9zaXRpb24sIGN1cnJlbnRQaGFzZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnBoYXNlID0gY3VycmVudFBoYXNlO1xuICAgICAgICB0aGlzLnByZXZDZWxsID0gX19hc3NpZ24oe30sIHByZXZQb3NpdGlvbik7IC8vIFRPRE86IG1heSBub3QgYmUgbmVlZGVkIGR1ZSB0byBuZXh0QWN0aW9uIHByb3BlcnR5XG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGNlbGwgc2luY2Ugd2V2ZSBub3cgbW92ZWQgYWhlYWRcbiAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS5uZXh0QWN0aW9uID0gcHJldlBvc2l0aW9uLm5leHRBY3Rpb247XG4gICAgICAgIGlmICh0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMucGF0aC5wb3AoKTsgLy8gc2hvdWxkIHN5bmMgd2l0aCBjZWxsXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLm5leHRBY3Rpb24gPSB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbjtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhbmQgYWRkIGN1cnJlbnQgY2VsbCB0byBleHBsb3JlZCBhbmQgcGF0aCBsaXN0c1xuICAgICAgICBpZiAoIXRoaXMuZXhwbG9yZWQuc29tZShmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS54ID09PSBfdGhpcy5jdXJyZW50LnggJiYgZS55ID09PSBfdGhpcy5jdXJyZW50Lnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGxvcmVkLnB1c2goX19hc3NpZ24oe30sIHRoaXMuY3VycmVudCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAueCA9PT0gX3RoaXMuY3VycmVudC54ICYmIHAueSA9PT0gX3RoaXMuY3VycmVudC55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5wYXRoLnB1c2goX19hc3NpZ24oe30sIHRoaXMuY3VycmVudCkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTdGFja2VyLnByb3RvdHlwZS5jbGVhclN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnByZXZDZWxsID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoID0gW107XG4gICAgICAgIHRoaXMudG9WaXNpdCA9IFtdO1xuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICB9O1xuICAgIC8vIEZpbmQgd2hpY2ggbmVpZ2hib3JzIGFyZSB2YWxpZCB0byBtb3ZlIHRvIChub3Qgd2FsbCwgbm90IHZpc2l0ZWQsIGFuZCAxIGxldmVsIGF3YXkpXG4gICAgLy8gYXMgd2VsbCBhcyBpZiBhbnkgYXJlIGEgdG93ZXIgYXMgd2VsbFxuICAgIFN0YWNrZXIucHJvdG90eXBlLmNoZWNrTmVpZ2hib3JzID0gZnVuY3Rpb24gKGNlbGwsIC8vIGN1cnJlbnQgY2VsbFxuICAgIGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIGN1cnJlbnQgc2hvdWxkID09PSBjZWxsXG4gICAgICAgIGlmIChkaXJlY3Rpb24udHlwZSAhPT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5XQUxMICYmXG4gICAgICAgICAgICAhdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKHApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcC54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiBwLnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkgJiZcbiAgICAgICAgICAgIC8vIHRoaXMuZXhwbG9yZWQgbmVlZGVkIHNpbmNlIHRoaXMucGF0aCBoYXMgZWxlbWVudHMgcmVndWxhcmx5IHJlbW92ZWRcbiAgICAgICAgICAgICF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZS54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiBlLnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBoYXNlID09PSBQaGFzZS5DT0xMRUNUX0JMT0NLUyAmJiAhdGhpcy5ibG9ja0xvY2F0aW9uKVxuICAgICAgICAgICAgICAgIHRoaXMuZmluZEJsb2NrKGRpcmVjdGlvbiwgZHgsIGR5KTtcbiAgICAgICAgICAgIGlmICghdGhpcy50b3dlckxvY2F0aW9uKVxuICAgICAgICAgICAgICAgIHRoaXMuZmluZFRvd2VyKGRpcmVjdGlvbiwgZHgsIGR5KTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhkaXJlY3Rpb24ubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gVE9ETzogd2hhdCBhYm91dCBmb3IgQ2VsbFR5cGUuR09MRD9cbiAgICB9O1xuICAgIC8vIENoZWNrIGlmIHRvd2VyIGlzIGZvdW5kIGFuZCB1cGRhdGUgaXRzIGxvY2F0aW9uIChvbmx5IHBlcmZvcm0gZHVyaW5nIHBoYXNlIDEpXG4gICAgU3RhY2tlci5wcm90b3R5cGUuZmluZFRvd2VyID0gZnVuY3Rpb24gKGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24ubGV2ZWwgPT09IDggJiYgIXRoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgdGhpcy50b3dlckxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgZHgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBkeSxcbiAgICAgICAgICAgICAgICBuZXh0QWN0aW9uOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZmluZEJsb2NrID0gZnVuY3Rpb24gKGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24udHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSyAmJiAhdGhpcy5ibG9ja0xvY2F0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmJsb2NrTG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5jdXJyZW50LnggKyBkeCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnQueSArIGR5LFxuICAgICAgICAgICAgICAgIG5leHRBY3Rpb246IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gU3RhY2tlcjtcbn0oKSk7XG53aW5kb3cuU3RhY2tlciA9IFN0YWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQWN0aW9uID0gdm9pZCAwO1xuLy8gVGhpcyBpcyB0aGUgbGlzdCBvZiBhY3Rpb25zIHRoYXQgdGhlIFN0YWNrZXIgY2FuIHRha2VcbnZhciBBY3Rpb247XG4oZnVuY3Rpb24gKEFjdGlvbikge1xuICAgIEFjdGlvbltcIkxFRlRcIl0gPSBcImxlZnRcIjtcbiAgICBBY3Rpb25bXCJVUFwiXSA9IFwidXBcIjtcbiAgICBBY3Rpb25bXCJSSUdIVFwiXSA9IFwicmlnaHRcIjtcbiAgICBBY3Rpb25bXCJET1dOXCJdID0gXCJkb3duXCI7XG4gICAgQWN0aW9uW1wiUElDS1VQXCJdID0gXCJwaWNrdXBcIjtcbiAgICBBY3Rpb25bXCJEUk9QXCJdID0gXCJkcm9wXCI7XG59KShBY3Rpb24gfHwgKGV4cG9ydHMuQWN0aW9uID0gQWN0aW9uID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DZWxsVHlwZSA9IHZvaWQgMDtcbnZhciBDZWxsVHlwZTtcbihmdW5jdGlvbiAoQ2VsbFR5cGUpIHtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkVNUFRZXCJdID0gMF0gPSBcIkVNUFRZXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJXQUxMXCJdID0gMV0gPSBcIldBTExcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkJMT0NLXCJdID0gMl0gPSBcIkJMT0NLXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJHT0xEXCJdID0gM10gPSBcIkdPTERcIjtcbn0pKENlbGxUeXBlIHx8IChleHBvcnRzLkNlbGxUeXBlID0gQ2VsbFR5cGUgPSB7fSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL1N0YWNrZXIudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=