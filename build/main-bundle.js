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
                    // Block Found -- Pickup, then drop block when back at tower
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
                        // TODO: Should dop conditionally (buildStaircase())
                        return Action_1.Action.DROP;
                    }
                    else {
                        // return to tower via path taken (this.path)
                        return _this.reverseDirection(_this.path.pop().nextAction);
                    }
                }
            }
        };
    }
    // using new nextAction property to backtrack this time instead of backtrackAction() (TODO: refactor backtrackAction() to use this new property instead, simpler)
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
            // console.log('DROP: Tower found, end FIND_TOWER phase');
            this.holdingBlock = false;
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
    // Derives next Action based on our coordinates (TODO: Refactor. 1. use direction only instead, and 2.could remove this.origin since always 0):
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
    // Updates main state variables
    Stacker.prototype.updateState = function (prevPosition, currentPhase) {
        var _this = this;
        this.phase = currentPhase;
        // this.prevCell = { ...prevPosition }; // TODO: may not be needed due to nextAction property
        // update current cell since weve now moved ahead
        this.path.slice(-1)[0].nextAction = prevPosition.nextAction;
        if (this.backtrackInProgress) {
            this.current = this.path.pop(); // should sync with cell
        }
        else {
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
    // Clears main state variables
    Stacker.prototype.clearState = function () {
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
    // Check if block is found and updates its location
    Stacker.prototype.findBlock = function (direction, dx, dy) {
        if (direction.type === CellType_1.CellType.BLOCK && !this.blockLocation) {
            this.blockLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
                nextAction: null,
            };
        }
    };
    // TODO: build staircase algo. Will need to run findBlock() only when block not in staircase (checkNeighbors())
    Stacker.prototype.buildStaircase = function (cell, current) {
        if (this.staircase.length < 2) {
            // build initial staircase (two 1 block cells)
            if (cell.type === CellType_1.CellType.BLOCK) {
                return this.reverseDirection(this.path.pop().nextAction);
                // return this.reverseDirection(current.nextAction);
            }
            this.staircase.push(__assign(__assign({}, current), { level: 1, type: CellType_1.CellType.BLOCK }));
            console.log('STAIRCASE: add block');
            this.holdingBlock = false;
            this.blockLocation = null;
            return Action_1.Action.DROP;
        }
        // else drop at end of staircase when staircase full
        if (this.staircase[0].level === this.staircase.length) {
            if (this.path.slice(-1)[0].type === CellType_1.CellType.BLOCK) {
                // cell == curent?
                this.staircase.push(__assign(__assign({}, current), { level: 1, type: CellType_1.CellType.BLOCK }));
                console.log('STAIRCASE: add block');
                this.holdingBlock = false;
                this.blockLocation = null;
                this.returningToTower = false;
                this.toVisit = [];
                this.explored = [];
                this.path = [];
                this.path.push(this.current);
                this.explored.push(this.current);
                return Action_1.Action.DROP;
            }
            this.current = this.path.pop();
            return this.reverseDirection(this.current.nextAction);
        }
        // else drop at top of staircase
        this.holdingBlock = false;
        this.blockLocation = null;
        this.path.push(this.current);
        this.explored.push(this.current);
        this.staircase.push(__assign(__assign({}, current), { level: 1, type: CellType_1.CellType.BLOCK }));
        console.log('STAIRCASE: add block');
        return Action_1.Action.DROP;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VGhEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvU3RhY2tlci50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0FjdGlvbi50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0NlbGxUeXBlLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLypcblByb2dyYW0gb25seSBjYXBhYmxlIG9mIGRyb3BwaW5nIHR3byBibG9ja3MgbmVhciBmb3VuZCB0b3dlci5cbllldCB0byBjb2xsZWN0L2Ryb3AgYmxvY2tzIGFwcHJvcHJpYXRlbHkgKGllIGJ1aWxkIHN0YWlyY2FzZSkuXG5Qcm9ncmFtIHdpbGwgY29uc29sZS5sb2coKTogYmFja3RyYWNrIGRpcmVjdGlvbiAoaWYgbmVlZGVkKSwgcGlja3VwL2Ryb3AsIGFuZCB0b3dlciBsb2NhdGlvblxuXG40IG1haW4gYWxnb3MgdG8gZmluZDpcbjEuIHRyYXZlcnNhbCBhbGdvIChkb25lKVxuICAgIC0gc2F2ZSB0b3dlciBsb2NhdGlvbiAoZG9uZSlcbjIuIFRyYXZlcnNhbCBuZWVkcyBiYWNrdHJhY2tpbmcgYWxnbyB0b28gKGRvbmUpXG4zLiBmaW5kIGJsb2NrcyBhbGdvIChjYW4ganVzdCBwb3Agb2ZmIHBhdGhbXSBmb3Igbm93KSAoVE9ETylcbiAgICAtIG9ubHkgcGlja3VwIGlmIG5vdCBzdGFpcmNhc2UgY2VsbFxuICAgIC0gdG90YWwgYmxvY2tzID0gY29sbGVjdCAoKGgtMSkoaCkpLzIgIGJsb2NrcyBpbiB0b3RhbCAod2hlcmUgaCA9IHRvd2VyIGhlaWdodClcbjQuIGJ1aWxkIHN0YWlyY2FzZSBhbGdvIChUT0RPKVxuICAgIC0gSW5pdGlhbCBzdGFpcmNhc2UgYnVpbGQgdW50aWwgc3RhaXJjYXNlLmxlbmd0aCA9IDIgYW5kIHR3byAxIGJsb2NrIGNlbGxzXG4gICAgLSBUaGVuLCBhZGQgYmxvY2sgdG8gZW5kIG9mIHN0YWlyY2FzZSB3aGVuIHN0YWlyY2FzZSBmdWxsIChzdGFpcmNhc2VbMF0gPSBzdGFpcmNhc2UubGVuZ3RoKSwgcmVwZWF0IHRpbGwgdG90YWwgYmxvY2tzIGNvbGxlY3RlZFxuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIHBhdGhzIGNyZWF0ZWQgLS0gcGF0aFtdIGNsZWFyZWQgZWFjaCB0aW1lIHRyb2xsIGF0IHRvd2VyIChUT0RPKVxuLSBleHBsb3JlZCBpcyBhIDJuZCBsaXN0IG9mIGFsbCBleHBsb3JlZCBjZWxscyBpbiBydW4uXG4tIEpvdXJuZXkgPSBwYXRoIHRvIHRvd2VyIG9yIHBhdGggdG8gYSBibG9ja1xuKi9cbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBQaGFzZTtcbihmdW5jdGlvbiAoUGhhc2UpIHtcbiAgICBQaGFzZVtcIkZJTkRfVE9XRVJcIl0gPSBcIkZpbmQgVG93ZXIgUGhhc2VcIjtcbiAgICBQaGFzZVtcIkNPTExFQ1RfQkxPQ0tTXCJdID0gXCJDb2xsZWN0IEJsb2NrcyBQaGFzZVwiO1xuICAgIFBoYXNlW1wiQlVJTERfU1RBSVJDQVNFXCJdID0gXCJCdWlsZCBTdGFpcmNhc2UgUGhhc2VcIjtcbn0pKFBoYXNlIHx8IChQaGFzZSA9IHt9KSk7XG52YXIgU3RhY2tlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFja2VyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgdG93ZXIgb24gbWFwXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24vY2VsbCBvbiBtYXBcbiAgICAgICAgdGhpcy5vcmlnaW4gPSB7IHg6IDAsIHk6IDAsIG5leHRBY3Rpb246IG51bGwgfTsgLy8gb3JvZ2luIGNlbGwgb2YgZW50aXJlIGNvb3JkaW5hdGUgc3lzdGVtIChpZSBzdGFydClcbiAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDsgLy8geCx5IGxvY2F0aW9uIG9mIGJsb2NrIHRvIHBpY2t1cCBvbiBtYXBcbiAgICAgICAgdGhpcy5waGFzZSA9IFBoYXNlLkZJTkRfVE9XRVI7IC8vIGN1cnJlbnQgcGhhc2VcbiAgICAgICAgLy8gRm9yIEJGUy9ERlMgdHJhdmVyc2FsIGFuZCBiYWNrdHJhY2tpbmcgKFRPRE86IGFkZCB0byBNeUNlbGwgaW5zdGVhZCk6XG4gICAgICAgIHRoaXMucGF0aCA9IFtdOyAvLyBUaGUgcGF0aCBhY3R1YWxseSB0YWtlbiB0aHVzIGZhciBmb3IgZWFjaCBqb3VybmV5ICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIG5lZWRlZClcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmVlZGVkIHNpbmNlIHBhdGhbXSByZWd1bGFybHkgcmVtb3ZlZCBmcm9tIGR1cmluZyBiYWNrdHJhY2tpbmcsIGhlbmNlIG5lZWQgYSBnbG9iYWwgY2VsbHMgdmlzaXRlZCBsaXN0IGNsZWFyZWQvZGVsZXRlZCBpbiBmZXdlciBjYXNlcyAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgbmV4dFxuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGN1cnJlbnRseSBiYWNrdHJhY2tpbmdcbiAgICAgICAgdGhpcy5yZXR1cm5pbmdUb1Rvd2VyID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBjdXJyZW50bHkgcmV0dXJuaW5nIHRvIHRvd2VyIGluIHBoYXNlIDJcbiAgICAgICAgdGhpcy5zdGFpcmNhc2UgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byBidWlsZCBzdGFpcmNhc2Ugb25cbiAgICAgICAgLy8gVXNpbmcgdGhlIHRyaWFuZ3VsYXIgbnVtYmVyIGZvcm11bGE6IChoLTEpaC8yICg4IGhhcmRjb2RlZCBmb3Igbm93IHNpbmNlIG9ubHkgZXZlciBzZWVuIDggbGV2ZWwgdG93ZXJzLiBoID0gdG93ZXIgaGVpZ2h0KVxuICAgICAgICAvLyBwcml2YXRlIHN0YWlyY2FzZVRvdGFsOiBudW1iZXIgPSBNYXRoLmFicygoOCAtIDEpICogOCkgLyAyOyAvLyAobm90IHVzZWQpIHRvdGFsIG51bWJlciBvZiBibG9ja3MgcmVxdWlyZWQgdG8gYnVpbGQgc3RhaXJjYXNlXG4gICAgICAgIHRoaXMudHVybiA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAvLyBwaWNrdXAgYmxvY2sgYWxvbmcgdGhlIHdheSBpZiB5b3UgY2FuXG4gICAgICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLmhvbGRpbmdCbG9jayAmJlxuICAgICAgICAgICAgICAgICFfdGhpcy50b3dlckxvY2F0aW9uIC8vIFRPRE86IHNob3VsZCBiZSBhYmxlIHRvIHBpY2sgdXAgYmxvY2sgd2hlbiB0b3dlciBpcyBmb3VuZCB0b28gb2J2LiwgYnV0IGF2b2lkcyBuZXZlci1lbmRpbmcgcGlja3VwL2Ryb3AgbG9vcCBhdCBlbmQgZm9yIG5vd1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUElDS1VQJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAxOiBVcGRhdGUgcG9zaXRpb24gYW5kIHRyYXZlcnNlIG1hcCBmb3IgdG93ZXJcbiAgICAgICAgICAgIGlmICghX3RoaXMuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGF0IHN0YXJ0IG9mIHJ1blxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfX2Fzc2lnbih7fSwgX3RoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlU3RhdGUoX3RoaXMuY3VycmVudCwgUGhhc2UuRklORF9UT1dFUik7IC8vIHVwZGF0ZSBzdGF0ZSB0byBuZXcgcG9zaXRpb25cbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBQaGFzZSAyOiBUb3dlciBsb2NhdGVkLCBub3cgY29sbGVjdCBibG9ja3MvYnVpbGQgc3RhaXJjYXNlIHBoYXNlXG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5ibG9ja0xvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIC4uLnlvdXZlIGp1c3QgZm91bmQgdG93ZXIgYW5kIGRyb3BwZWQgYmxvY2sgZnJvbSB0cmF2ZXJzZU1hcCgpXG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5waGFzZSA9PT0gUGhhc2UuRklORF9UT1dFUikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF9fYXNzaWduKHt9LCBfdGhpcy50b1Zpc2l0LnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBoYXNlID0gUGhhc2UuQ09MTEVDVF9CTE9DS1M7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jbGVhclN0YXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5leHBsb3JlZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgdXBkYXRlIHN0YXRlIGFzIG5vcm1hbFxuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlU3RhdGUoX3RoaXMuY3VycmVudCwgUGhhc2UuQ09MTEVDVF9CTE9DS1MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEJsb2NrIEZvdW5kIC0tIFBpY2t1cCwgdGhlbiBkcm9wIGJsb2NrIHdoZW4gYmFjayBhdCB0b3dlclxuICAgICAgICAgICAgICAgICAgICBpZiAoIV90aGlzLnJldHVybmluZ1RvVG93ZXIgJiYgY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmF2ZXJzZSBiYWNrIHRvIHRvd2VyIHZpYSB0aGlzLnBhdGgsIGJ1dCBub3QgYmVmb3JlIGNvbGxlY3RpbmcgYmxvY2tcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnRvVmlzaXQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnJldHVybmluZ1RvVG93ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBhdGguc2xpY2UoLTEpWzBdLm5leHRBY3Rpb24gPSBfdGhpcy5jdXJyZW50Lm5leHRBY3Rpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUElDS1VQJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlBJQ0tVUDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoX3RoaXMucGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGtub3cgd2UncmUgYXQgdG93ZXIgd2hlbiBwYXRoLmxlbmd0aCA9PT0gMCwgc28gZHJvcCBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RST1AnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5wYXRoLnB1c2goX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5leHBsb3JlZC5wdXNoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogU2hvdWxkIGRvcCBjb25kaXRpb25hbGx5IChidWlsZFN0YWlyY2FzZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHRvIHRvd2VyIHZpYSBwYXRoIHRha2VuICh0aGlzLnBhdGgpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucmV2ZXJzZURpcmVjdGlvbihfdGhpcy5wYXRoLnBvcCgpLm5leHRBY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyB1c2luZyBuZXcgbmV4dEFjdGlvbiBwcm9wZXJ0eSB0byBiYWNrdHJhY2sgdGhpcyB0aW1lIGluc3RlYWQgb2YgYmFja3RyYWNrQWN0aW9uKCkgKFRPRE86IHJlZmFjdG9yIGJhY2t0cmFja0FjdGlvbigpIHRvIHVzZSB0aGlzIG5ldyBwcm9wZXJ0eSBpbnN0ZWFkLCBzaW1wbGVyKVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnJldmVyc2VEaXJlY3Rpb24gPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEFjdGlvbl8xLkFjdGlvbi5VUClcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQWN0aW9uXzEuQWN0aW9uLkRPV04pXG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uTEVGVClcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEFjdGlvbl8xLkFjdGlvbi5SSUdIVClcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICB9O1xuICAgIC8vIFRyYXZlcnNlIG1hcCBieSBhZGRpbmcgdG8gdG9WaXNpdCwgJiBjdXJyZW50IGlzIGFsd2F5cyB1cGRhdGVkIHRvIGxhc3QgZWxlbWVudCBvZiB0b1Zpc2l0XG4gICAgU3RhY2tlci5wcm90b3R5cGUudHJhdmVyc2VNYXAgPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICB2YXIgY2FuTW92ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgbmVpZ2hib3JzID0gW1xuICAgICAgICAgICAgeyBkaXI6IGNlbGwudXAsIGR4OiAwLCBkeTogLTEgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLmxlZnQsIGR4OiAtMSwgZHk6IDAgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLmRvd24sIGR4OiAwLCBkeTogMSB9LFxuICAgICAgICAgICAgeyBkaXI6IGNlbGwucmlnaHQsIGR4OiAxLCBkeTogMCB9LFxuICAgICAgICBdO1xuICAgICAgICAvLyBBZGQgdmFsaWQgbmVpZ2hib3JzIHRvIHRvVmlzaXQgc3RhY2sgZm9yIHRyYXZlcnNhbCwgY2hlY2sgZm9yIHRvd2VyIHRvb1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIG5laWdoYm9yc18xID0gbmVpZ2hib3JzOyBfaSA8IG5laWdoYm9yc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIG4gPSBuZWlnaGJvcnNfMVtfaV07XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja05laWdoYm9ycyhjZWxsLCBuLmRpciwgbi5keCwgbi5keSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgbi5keCxcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBuLmR5LFxuICAgICAgICAgICAgICAgICAgICBuZXh0QWN0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFBlcmZvcm0gYWN0aW9ucyBkZXBlbmRpbmcgb24gY3VycmVudCBwaGFzZVxuICAgICAgICBpZiAodGhpcy50b3dlckxvY2F0aW9uICYmIHRoaXMucGhhc2UgPT09IFBoYXNlLkZJTkRfVE9XRVIpIHtcbiAgICAgICAgICAgIC8vIFRvd2VyIGxvY2F0ZWQgc29tZXdoZXJlIGluIGNlbGwncyBpbW1lZC4gbmVpZ2hib3JpbmcgY2VsbHMuLi5cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdEUk9QOiBUb3dlciBmb3VuZCwgZW5kIEZJTkRfVE9XRVIgcGhhc2UnKTtcbiAgICAgICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIEZpcnN0IGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgdG8gZXhpdCBlYXJseSwgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ibG9ja0xvY2F0aW9uICYmIHRoaXMucGhhc2UgPT09IFBoYXNlLkNPTExFQ1RfQkxPQ0tTKSB7XG4gICAgICAgICAgICAvLyByZXJvdXRlIHRvIGJsb2NrJ3MgcG9zaXRpb24gSU9UIHBpY2t1cFxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3RyYXZlcnNlTWFwOiByb3V0ZSB0byBibG9jayBjZWxsJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROZXh0QWN0aW9uKHRoaXMuYmxvY2tMb2NhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC54ID09PSAwICYmIHRoaXMuY3VycmVudC55ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWFjaGVkIHJ1bidzIGVuZCB3aXRob3V0IGZpbmRpbmcgdG93ZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSB3ZSBqdXN0IGNhbnQgbW92ZSB0byB2YWxpZCBjZWxscywgc28gYmFja3RyYWNrXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iYWNrdHJhY2tBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQmVnaW4gYmFja3RyYWNraW5nIGlmIHN0dWNrIGZvciBhbnkgcmVhc29uXG4gICAgU3RhY2tlci5wcm90b3R5cGUuYmFja3RyYWNrQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAvLyB4IGFuZCB5IGRpcmVjdGlvbiB0byBiYWNrdHJhY2sgdG86XG4gICAgICAgIHRoaXMucGF0aC5wb3AoKTtcbiAgICAgICAgdmFyIHhEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggLSB0aGlzLmN1cnJlbnQueDtcbiAgICAgICAgdmFyIHlEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnkgLSB0aGlzLmN1cnJlbnQueTtcbiAgICAgICAgaWYgKHlEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayBeJyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeURpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIHYnKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIDwtJyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayAtPicpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vdGhpbmcgdG8gYmFja3RyYWNrIHRvJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIHBsYWNlaG9sZGVyIGZvciBub3csIHRyb2xsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIERlcml2ZXMgbmV4dCBBY3Rpb24gYmFzZWQgb24gb3VyIGNvb3JkaW5hdGVzIChUT0RPOiBSZWZhY3Rvci4gMS4gdXNlIGRpcmVjdGlvbiBvbmx5IGluc3RlYWQsIGFuZCAyLmNvdWxkIHJlbW92ZSB0aGlzLm9yaWdpbiBzaW5jZSBhbHdheXMgMCk6XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZ2V0TmV4dEFjdGlvbiA9IGZ1bmN0aW9uIChuZXh0Q2VsbCkge1xuICAgICAgICBpZiAobmV4dENlbGwgPT09IHZvaWQgMCkgeyBuZXh0Q2VsbCA9IHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF07IH1cbiAgICAgICAgdmFyIHggPSB0aGlzLm9yaWdpbi54IC0gdGhpcy5jdXJyZW50LnggKyBuZXh0Q2VsbC54OyAvLyBsYXN0IHRvVmlzaXQgZHVlIHRvIHVzaW5nIHBvcCgpXG4gICAgICAgIHZhciB5ID0gdGhpcy5vcmlnaW4ueSAtIHRoaXMuY3VycmVudC55ICsgbmV4dENlbGwueTtcbiAgICAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgICAgICAvLyBsZWZ0OiAtMXhcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeCA+IDApIHtcbiAgICAgICAgICAgIC8vIHJpZ2h0OiArMXhcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5IDwgMCkge1xuICAgICAgICAgICAgLy8gdXA6IC0xeVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPiAwKSB7XG4gICAgICAgICAgICAvLyBkb3duOiArMXlcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXaGVuIHg9MCBhbmQgeT0wIHdoZW4gdmlzaXRlZCBhbGwgY2VsbHMgb24gbWFwXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gbmV4dCBhY3Rpb24nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQWRkIHRvIGV4cGxvcmVkIGFuZCBwYXRoIGxpc3QgaWYgbm90IGFscmVhZHkgaW4gdGhlcmVcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVQYXRoID0gZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAueCA9PT0gcG9zaXRpb24ueCAmJiBwLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gVXBkYXRlcyBtYWluIHN0YXRlIHZhcmlhYmxlc1xuICAgIFN0YWNrZXIucHJvdG90eXBlLnVwZGF0ZVN0YXRlID0gZnVuY3Rpb24gKHByZXZQb3NpdGlvbiwgY3VycmVudFBoYXNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucGhhc2UgPSBjdXJyZW50UGhhc2U7XG4gICAgICAgIC8vIHRoaXMucHJldkNlbGwgPSB7IC4uLnByZXZQb3NpdGlvbiB9OyAvLyBUT0RPOiBtYXkgbm90IGJlIG5lZWRlZCBkdWUgdG8gbmV4dEFjdGlvbiBwcm9wZXJ0eVxuICAgICAgICAvLyB1cGRhdGUgY3VycmVudCBjZWxsIHNpbmNlIHdldmUgbm93IG1vdmVkIGFoZWFkXG4gICAgICAgIHRoaXMucGF0aC5zbGljZSgtMSlbMF0ubmV4dEFjdGlvbiA9IHByZXZQb3NpdGlvbi5uZXh0QWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5iYWNrdHJhY2tJblByb2dyZXNzKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLnBhdGgucG9wKCk7IC8vIHNob3VsZCBzeW5jIHdpdGggY2VsbFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFuZCBhZGQgY3VycmVudCBjZWxsIHRvIGV4cGxvcmVkIGFuZCBwYXRoIGxpc3RzXG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IF90aGlzLmN1cnJlbnQueCAmJiBlLnkgPT09IF90aGlzLmN1cnJlbnQueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9yZWQucHVzaChfX2Fzc2lnbih7fSwgdGhpcy5jdXJyZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAocCkgeyByZXR1cm4gcC54ID09PSBfdGhpcy5jdXJyZW50LnggJiYgcC55ID09PSBfdGhpcy5jdXJyZW50Lnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgdGhpcy5jdXJyZW50KSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENsZWFycyBtYWluIHN0YXRlIHZhcmlhYmxlc1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmNsZWFyU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfTtcbiAgICAvLyBGaW5kIHdoaWNoIG5laWdoYm9ycyBhcmUgdmFsaWQgdG8gbW92ZSB0byAobm90IHdhbGwsIG5vdCB2aXNpdGVkLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIC8vIGFzIHdlbGwgYXMgaWYgYW55IGFyZSBhIHRvd2VyIGFzIHdlbGxcbiAgICBTdGFja2VyLnByb3RvdHlwZS5jaGVja05laWdoYm9ycyA9IGZ1bmN0aW9uIChjZWxsLCAvLyBjdXJyZW50IGNlbGxcbiAgICBkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBjdXJyZW50IHNob3VsZCA9PT0gY2VsbFxuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgIT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuV0FMTCAmJlxuICAgICAgICAgICAgIXRoaXMucGF0aC5zb21lKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgcC55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pICYmXG4gICAgICAgICAgICAvLyB0aGlzLmV4cGxvcmVkIG5lZWRlZCBzaW5jZSB0aGlzLnBhdGggaGFzIGVsZW1lbnRzIHJlZ3VsYXJseSByZW1vdmVkXG4gICAgICAgICAgICAhdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgZS55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5waGFzZSA9PT0gUGhhc2UuQ09MTEVDVF9CTE9DS1MgJiYgIXRoaXMuYmxvY2tMb2NhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRCbG9jayhkaXJlY3Rpb24sIGR4LCBkeSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMudG93ZXJMb2NhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihkaXJlY3Rpb24sIGR4LCBkeSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlyZWN0aW9uLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFRPRE86IHdoYXQgYWJvdXQgZm9yIENlbGxUeXBlLkdPTEQ/XG4gICAgfTtcbiAgICAvLyBDaGVjayBpZiB0b3dlciBpcyBmb3VuZCBhbmQgdXBkYXRlIGl0cyBsb2NhdGlvbiAob25seSBwZXJmb3JtIGR1cmluZyBwaGFzZSAxKVxuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRUb3dlciA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLmxldmVsID09PSA4ICYmICF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIGR4LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgZHksXG4gICAgICAgICAgICAgICAgbmV4dEFjdGlvbjogbnVsbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENoZWNrIGlmIGJsb2NrIGlzIGZvdW5kIGFuZCB1cGRhdGVzIGl0cyBsb2NhdGlvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRCbG9jayA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiYgIXRoaXMuYmxvY2tMb2NhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgZHgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBkeSxcbiAgICAgICAgICAgICAgICBuZXh0QWN0aW9uOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gVE9ETzogYnVpbGQgc3RhaXJjYXNlIGFsZ28uIFdpbGwgbmVlZCB0byBydW4gZmluZEJsb2NrKCkgb25seSB3aGVuIGJsb2NrIG5vdCBpbiBzdGFpcmNhc2UgKGNoZWNrTmVpZ2hib3JzKCkpXG4gICAgU3RhY2tlci5wcm90b3R5cGUuYnVpbGRTdGFpcmNhc2UgPSBmdW5jdGlvbiAoY2VsbCwgY3VycmVudCkge1xuICAgICAgICBpZiAodGhpcy5zdGFpcmNhc2UubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgLy8gYnVpbGQgaW5pdGlhbCBzdGFpcmNhc2UgKHR3byAxIGJsb2NrIGNlbGxzKVxuICAgICAgICAgICAgaWYgKGNlbGwudHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJldmVyc2VEaXJlY3Rpb24odGhpcy5wYXRoLnBvcCgpLm5leHRBY3Rpb24pO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLnJldmVyc2VEaXJlY3Rpb24oY3VycmVudC5uZXh0QWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVEFJUkNBU0U6IGFkZCBibG9jaycpO1xuICAgICAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBkcm9wIGF0IGVuZCBvZiBzdGFpcmNhc2Ugd2hlbiBzdGFpcmNhc2UgZnVsbFxuICAgICAgICBpZiAodGhpcy5zdGFpcmNhc2VbMF0ubGV2ZWwgPT09IHRoaXMuc3RhaXJjYXNlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aC5zbGljZSgtMSlbMF0udHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgIC8vIGNlbGwgPT0gY3VyZW50P1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU1RBSVJDQVNFOiBhZGQgYmxvY2snKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXR1cm5pbmdUb1Rvd2VyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5wYXRoLnBvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZURpcmVjdGlvbih0aGlzLmN1cnJlbnQubmV4dEFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBkcm9wIGF0IHRvcCBvZiBzdGFpcmNhc2VcbiAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoLnB1c2godGhpcy5jdXJyZW50KTtcbiAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1NUQUlSQ0FTRTogYWRkIGJsb2NrJyk7XG4gICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDtcbiAgICB9O1xuICAgIHJldHVybiBTdGFja2VyO1xufSgpKTtcbndpbmRvdy5TdGFja2VyID0gU3RhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BY3Rpb24gPSB2b2lkIDA7XG4vLyBUaGlzIGlzIHRoZSBsaXN0IG9mIGFjdGlvbnMgdGhhdCB0aGUgU3RhY2tlciBjYW4gdGFrZVxudmFyIEFjdGlvbjtcbihmdW5jdGlvbiAoQWN0aW9uKSB7XG4gICAgQWN0aW9uW1wiTEVGVFwiXSA9IFwibGVmdFwiO1xuICAgIEFjdGlvbltcIlVQXCJdID0gXCJ1cFwiO1xuICAgIEFjdGlvbltcIlJJR0hUXCJdID0gXCJyaWdodFwiO1xuICAgIEFjdGlvbltcIkRPV05cIl0gPSBcImRvd25cIjtcbiAgICBBY3Rpb25bXCJQSUNLVVBcIl0gPSBcInBpY2t1cFwiO1xuICAgIEFjdGlvbltcIkRST1BcIl0gPSBcImRyb3BcIjtcbn0pKEFjdGlvbiB8fCAoZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb24gPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNlbGxUeXBlID0gdm9pZCAwO1xudmFyIENlbGxUeXBlO1xuKGZ1bmN0aW9uIChDZWxsVHlwZSkge1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiRU1QVFlcIl0gPSAwXSA9IFwiRU1QVFlcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIldBTExcIl0gPSAxXSA9IFwiV0FMTFwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiQkxPQ0tcIl0gPSAyXSA9IFwiQkxPQ0tcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkdPTERcIl0gPSAzXSA9IFwiR09MRFwiO1xufSkoQ2VsbFR5cGUgfHwgKGV4cG9ydHMuQ2VsbFR5cGUgPSBDZWxsVHlwZSA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvU3RhY2tlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==