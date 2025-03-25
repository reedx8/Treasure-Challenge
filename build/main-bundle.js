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
                        _this.returningToTower = false;
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
            this.holdingBlock = false;
            return Action_1.Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
        }
        if (this.blockLocation && this.phase === Phase.COLLECT_BLOCKS) {
            // route to block's position IOT pickup
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
        if (this.path.length > 0) {
            this.path.pop();
        }
        if (this.path.length === 0) {
            return Action_1.Action.DROP; // placeholder for now, troll stays in place at end of run here
        }
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
        if (this.path.length > 0)
            this.path.slice(-1)[0].nextAction = prevPosition.nextAction;
        if (this.backtrackInProgress && this.path.length > 0) {
            this.current = this.path.pop(); // should sync with cell
        }
        else if (this.toVisit.length > 0) {
            // console.log('toVisit: ', this.toVisit);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0EsQ0FBQyxlQUFlLGdCQUFnQixnQkFBZ0I7Ozs7Ozs7VUNUaEQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9TdGFja2VyLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQWN0aW9uLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQ2VsbFR5cGUudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKlxuUHJvZ3JhbSBvbmx5IGNhcGFibGUgb2YgZHJvcHBpbmcgdHdvIGJsb2NrcyBuZWFyIGZvdW5kIHRvd2VyLlxuWWV0IHRvIGNvbGxlY3QvZHJvcCBibG9ja3MgYXBwcm9wcmlhdGVseSAoaWUgYnVpbGQgc3RhaXJjYXNlKS5cblByb2dyYW0gd2lsbCBjb25zb2xlLmxvZygpOiBiYWNrdHJhY2sgZGlyZWN0aW9uIChpZiBuZWVkZWQpLCBwaWNrdXAvZHJvcCwgYW5kIHRvd2VyIGxvY2F0aW9uXG5cbjQgbWFpbiBhbGdvcyB0byBmaW5kOlxuMS4gdHJhdmVyc2FsIGFsZ28gKGRvbmUpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uIChkb25lKVxuMi4gVHJhdmVyc2FsIG5lZWRzIGJhY2t0cmFja2luZyBhbGdvIHRvbyAoZG9uZSlcbjMuIGZpbmQgYmxvY2tzIGFsZ28gKGNhbiBqdXN0IHBvcCBvZmYgcGF0aFtdIGZvciBub3cpIChUT0RPKVxuICAgIC0gb25seSBwaWNrdXAgaWYgbm90IHN0YWlyY2FzZSBjZWxsXG4gICAgLSB0b3RhbCBibG9ja3MgPSBjb2xsZWN0ICgoaC0xKShoKSkvMiAgYmxvY2tzIGluIHRvdGFsICh3aGVyZSBoID0gdG93ZXIgaGVpZ2h0KVxuNC4gYnVpbGQgc3RhaXJjYXNlIGFsZ28gKFRPRE8pXG4gICAgLSBJbml0aWFsIHN0YWlyY2FzZSBidWlsZCB1bnRpbCBzdGFpcmNhc2UubGVuZ3RoID0gMiBhbmQgdHdvIDEgYmxvY2sgY2VsbHNcbiAgICAtIFRoZW4sIGFkZCBibG9jayB0byBlbmQgb2Ygc3RhaXJjYXNlIHdoZW4gc3RhaXJjYXNlIGZ1bGwgKHN0YWlyY2FzZVswXSA9IHN0YWlyY2FzZS5sZW5ndGgpLCByZXBlYXQgdGlsbCB0b3RhbCBibG9ja3MgY29sbGVjdGVkXG5cbi0gRWFjaCBydW4gaGFzIHNldmVyYWwgcGF0aHMgY3JlYXRlZCAtLSBwYXRoW10gY2xlYXJlZCBlYWNoIHRpbWUgdHJvbGwgYXQgdG93ZXIgKFRPRE8pXG4tIGV4cGxvcmVkIGlzIGEgMm5kIGxpc3Qgb2YgYWxsIGV4cGxvcmVkIGNlbGxzIGluIHJ1bi5cbi0gSm91cm5leSA9IHBhdGggdG8gdG93ZXIgb3IgcGF0aCB0byBhIGJsb2NrXG4qL1xudmFyIEFjdGlvbl8xID0gcmVxdWlyZShcIi4vbGliL0FjdGlvblwiKTtcbnZhciBDZWxsVHlwZV8xID0gcmVxdWlyZShcIi4vbGliL0NlbGxUeXBlXCIpO1xudmFyIFBoYXNlO1xuKGZ1bmN0aW9uIChQaGFzZSkge1xuICAgIFBoYXNlW1wiRklORF9UT1dFUlwiXSA9IFwiRmluZCBUb3dlciBQaGFzZVwiO1xuICAgIFBoYXNlW1wiQ09MTEVDVF9CTE9DS1NcIl0gPSBcIkNvbGxlY3QgQmxvY2tzIFBoYXNlXCI7XG4gICAgUGhhc2VbXCJCVUlMRF9TVEFJUkNBU0VcIl0gPSBcIkJ1aWxkIFN0YWlyY2FzZSBQaGFzZVwiO1xufSkoUGhhc2UgfHwgKFBoYXNlID0ge30pKTtcbnZhciBTdGFja2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0YWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IG51bGw7IC8vIHgseSBsb2NhdGlvbiBvZiB0b3dlciBvbiBtYXBcbiAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGhvbGRpbmcgYSBibG9ja1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsOyAvLyBjdXJyZW50IHgseSBwb3NpdGlvbi9jZWxsIG9uIG1hcFxuICAgICAgICB0aGlzLm9yaWdpbiA9IHsgeDogMCwgeTogMCwgbmV4dEFjdGlvbjogbnVsbCB9OyAvLyBvcm9naW4gY2VsbCBvZiBlbnRpcmUgY29vcmRpbmF0ZSBzeXN0ZW0gKGllIHN0YXJ0KVxuICAgICAgICB0aGlzLmJsb2NrTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgYmxvY2sgdG8gcGlja3VwIG9uIG1hcFxuICAgICAgICB0aGlzLnBoYXNlID0gUGhhc2UuRklORF9UT1dFUjsgLy8gY3VycmVudCBwaGFzZVxuICAgICAgICAvLyBGb3IgQkZTL0RGUyB0cmF2ZXJzYWwgYW5kIGJhY2t0cmFja2luZyAoVE9ETzogYWRkIHRvIE15Q2VsbCBpbnN0ZWFkKTpcbiAgICAgICAgdGhpcy5wYXRoID0gW107IC8vIFRoZSBwYXRoIGFjdHVhbGx5IHRha2VuIHRodXMgZmFyIGZvciBlYWNoIGpvdXJuZXkgKHVzaW5nIHNldCB3b3VsZCBwcm9iYWJseSBiZSBiZXR0ZXIgbG9va3VwIHRpbWUgaWYgbmVlZGVkKVxuICAgICAgICB0aGlzLmV4cGxvcmVkID0gW107IC8vIGxpc3Qgb2YgYWxsIGNlbGxzIHZpc2l0ZWQgaW4gam91cm5leS9wYXRoLCBuZWVkZWQgc2luY2UgcGF0aFtdIHJlZ3VsYXJseSByZW1vdmVkIGZyb20gZHVyaW5nIGJhY2t0cmFja2luZywgaGVuY2UgbmVlZCBhIGdsb2JhbCBjZWxscyB2aXNpdGVkIGxpc3QgY2xlYXJlZC9kZWxldGVkIGluIGZld2VyIGNhc2VzICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIGV2ZXIgbmVlZGVkKVxuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byB2aXNpdCBuZXh0XG4gICAgICAgIHRoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcyA9IGZhbHNlOyAvLyBpZiB3ZSBhcmUgY3VycmVudGx5IGJhY2t0cmFja2luZ1xuICAgICAgICB0aGlzLnJldHVybmluZ1RvVG93ZXIgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGN1cnJlbnRseSByZXR1cm5pbmcgdG8gdG93ZXIgaW4gcGhhc2UgMlxuICAgICAgICB0aGlzLnN0YWlyY2FzZSA9IFtdOyAvLyBsaXN0IG9mIGNlbGxzIHRvIGJ1aWxkIHN0YWlyY2FzZSBvblxuICAgICAgICAvLyBVc2luZyB0aGUgdHJpYW5ndWxhciBudW1iZXIgZm9ybXVsYTogKGgtMSloLzIgKDggaGFyZGNvZGVkIGZvciBub3cgc2luY2Ugb25seSBldmVyIHNlZW4gOCBsZXZlbCB0b3dlcnMuIGggPSB0b3dlciBoZWlnaHQpXG4gICAgICAgIC8vIHByaXZhdGUgc3RhaXJjYXNlVG90YWw6IG51bWJlciA9IE1hdGguYWJzKCg4IC0gMSkgKiA4KSAvIDI7IC8vIChub3QgdXNlZCkgdG90YWwgbnVtYmVyIG9mIGJsb2NrcyByZXF1aXJlZCB0byBidWlsZCBzdGFpcmNhc2VcbiAgICAgICAgdGhpcy50dXJuID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgIC8vIHBpY2t1cCBibG9jayBhbG9uZyB0aGUgd2F5IGlmIHlvdSBjYW5cbiAgICAgICAgICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiZcbiAgICAgICAgICAgICAgICAhX3RoaXMuaG9sZGluZ0Jsb2NrICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLnRvd2VyTG9jYXRpb24gLy8gVE9ETzogc2hvdWxkIGJlIGFibGUgdG8gcGljayB1cCBibG9jayB3aGVuIHRvd2VyIGlzIGZvdW5kIHRvbyBvYnYuLCBidXQgYXZvaWRzIG5ldmVyLWVuZGluZyBwaWNrdXAvZHJvcCBsb29wIGF0IGVuZCBmb3Igbm93XG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQSUNLVVAnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlBJQ0tVUDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDE6IFVwZGF0ZSBwb3NpdGlvbiBhbmQgdHJhdmVyc2UgbWFwIGZvciB0b3dlclxuICAgICAgICAgICAgaWYgKCFfdGhpcy5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gYXQgc3RhcnQgb2YgcnVuXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF9fYXNzaWduKHt9LCBfdGhpcy5vcmlnaW4pO1xuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRyYXZlcnNlTWFwKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIV90aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVTdGF0ZShfdGhpcy5jdXJyZW50LCBQaGFzZS5GSU5EX1RPV0VSKTsgLy8gdXBkYXRlIHN0YXRlIHRvIG5ldyBwb3NpdGlvblxuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFBoYXNlIDI6IFRvd2VyIGxvY2F0ZWQsIG5vdyBjb2xsZWN0IGJsb2Nrcy9idWlsZCBzdGFpcmNhc2UgcGhhc2VcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLmJsb2NrTG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gLi4ueW91dmUganVzdCBmb3VuZCB0b3dlciBhbmQgZHJvcHBlZCBibG9jayBmcm9tIHRyYXZlcnNlTWFwKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLnBoYXNlID09PSBQaGFzZS5GSU5EX1RPV0VSKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX19hc3NpZ24oe30sIF90aGlzLnRvVmlzaXQucG9wKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucGhhc2UgPSBQaGFzZS5DT0xMRUNUX0JMT0NLUztcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmNsZWFyU3RhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmV4cGxvcmVkID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxzZSB1cGRhdGUgc3RhdGUgYXMgbm9ybWFsXG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVTdGF0ZShfdGhpcy5jdXJyZW50LCBQaGFzZS5DT0xMRUNUX0JMT0NLUyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRyYXZlcnNlTWFwKGNlbGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQmxvY2sgRm91bmQgLS0gUGlja3VwLCB0aGVuIGRyb3AgYmxvY2sgd2hlbiBiYWNrIGF0IHRvd2VyXG4gICAgICAgICAgICAgICAgICAgIGlmICghX3RoaXMucmV0dXJuaW5nVG9Ub3dlciAmJiBjZWxsLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRyYXZlcnNlIGJhY2sgdG8gdG93ZXIgdmlhIHRoaXMucGF0aCwgYnV0IG5vdCBiZWZvcmUgY29sbGVjdGluZyBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMudG9WaXNpdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucmV0dXJuaW5nVG9Ub3dlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMucGF0aC5zbGljZSgtMSlbMF0ubmV4dEFjdGlvbiA9IF90aGlzLmN1cnJlbnQubmV4dEFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQSUNLVVAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUElDS1VQO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChfdGhpcy5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Uga25vdyB3ZSdyZSBhdCB0b3dlciB3aGVuIHBhdGgubGVuZ3RoID09PSAwLCBzbyBkcm9wIGJsb2NrXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnJldHVybmluZ1RvVG93ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnBhdGgucHVzaChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmV4cGxvcmVkLnB1c2goX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBTaG91bGQgZG9wIGNvbmRpdGlvbmFsbHkgKGJ1aWxkU3RhaXJjYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZXR1cm4gdG8gdG93ZXIgdmlhIHBhdGggdGFrZW4gKHRoaXMucGF0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5yZXZlcnNlRGlyZWN0aW9uKF90aGlzLnBhdGgucG9wKCkubmV4dEFjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIHVzaW5nIG5ldyBuZXh0QWN0aW9uIHByb3BlcnR5IHRvIGJhY2t0cmFjayB0aGlzIHRpbWUgaW5zdGVhZCBvZiBiYWNrdHJhY2tBY3Rpb24oKSAoVE9ETzogcmVmYWN0b3IgYmFja3RyYWNrQWN0aW9uKCkgdG8gdXNlIHRoaXMgbmV3IHByb3BlcnR5IGluc3RlYWQsIHNpbXBsZXIpXG4gICAgU3RhY2tlci5wcm90b3R5cGUucmV2ZXJzZURpcmVjdGlvbiA9IGZ1bmN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQWN0aW9uXzEuQWN0aW9uLlVQKVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSBBY3Rpb25fMS5BY3Rpb24uRE9XTilcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IEFjdGlvbl8xLkFjdGlvbi5MRUZUKVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gQWN0aW9uXzEuQWN0aW9uLlJJR0hUKVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgIH07XG4gICAgLy8gVHJhdmVyc2UgbWFwIGJ5IGFkZGluZyB0byB0b1Zpc2l0LCAmIGN1cnJlbnQgaXMgYWx3YXlzIHVwZGF0ZWQgdG8gbGFzdCBlbGVtZW50IG9mIHRvVmlzaXRcbiAgICBTdGFja2VyLnByb3RvdHlwZS50cmF2ZXJzZU1hcCA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgIHZhciBjYW5Nb3ZlID0gZmFsc2U7XG4gICAgICAgIHZhciBuZWlnaGJvcnMgPSBbXG4gICAgICAgICAgICB7IGRpcjogY2VsbC51cCwgZHg6IDAsIGR5OiAtMSB9LFxuICAgICAgICAgICAgeyBkaXI6IGNlbGwubGVmdCwgZHg6IC0xLCBkeTogMCB9LFxuICAgICAgICAgICAgeyBkaXI6IGNlbGwuZG93biwgZHg6IDAsIGR5OiAxIH0sXG4gICAgICAgICAgICB7IGRpcjogY2VsbC5yaWdodCwgZHg6IDEsIGR5OiAwIH0sXG4gICAgICAgIF07XG4gICAgICAgIC8vIEFkZCB2YWxpZCBuZWlnaGJvcnMgdG8gdG9WaXNpdCBzdGFjayBmb3IgdHJhdmVyc2FsLCBjaGVjayBmb3IgdG93ZXIgdG9vXG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgbmVpZ2hib3JzXzEgPSBuZWlnaGJvcnM7IF9pIDwgbmVpZ2hib3JzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgbiA9IG5laWdoYm9yc18xW19pXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrTmVpZ2hib3JzKGNlbGwsIG4uZGlyLCBuLmR4LCBuLmR5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5jdXJyZW50LnggKyBuLmR4LFxuICAgICAgICAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnQueSArIG4uZHksXG4gICAgICAgICAgICAgICAgICAgIG5leHRBY3Rpb246IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgY2FuTW92ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUGVyZm9ybSBhY3Rpb25zIGRlcGVuZGluZyBvbiBjdXJyZW50IHBoYXNlXG4gICAgICAgIGlmICh0aGlzLnRvd2VyTG9jYXRpb24gJiYgdGhpcy5waGFzZSA9PT0gUGhhc2UuRklORF9UT1dFUikge1xuICAgICAgICAgICAgLy8gVG93ZXIgbG9jYXRlZCBzb21ld2hlcmUgaW4gY2VsbCdzIGltbWVkLiBuZWlnaGJvcmluZyBjZWxscy4uLlxuICAgICAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gRmlyc3QgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyB0byBleGl0IGVhcmx5LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmJsb2NrTG9jYXRpb24gJiYgdGhpcy5waGFzZSA9PT0gUGhhc2UuQ09MTEVDVF9CTE9DS1MpIHtcbiAgICAgICAgICAgIC8vIHJvdXRlIHRvIGJsb2NrJ3MgcG9zaXRpb24gSU9UIHBpY2t1cFxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbih0aGlzLmJsb2NrTG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQueCA9PT0gMCAmJiB0aGlzLmN1cnJlbnQueSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVhY2hlZCBydW4ncyBlbmQgd2l0aG91dCBmaW5kaW5nIHRvd2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2Ugd2UganVzdCBjYW50IG1vdmUgdG8gdmFsaWQgY2VsbHMsIHNvIGJhY2t0cmFja1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3RyYWNrQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZyBpZiBzdHVjayBmb3IgYW55IHJlYXNvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgLy8geCBhbmQgeSBkaXJlY3Rpb24gdG8gYmFja3RyYWNrIHRvOlxuICAgICAgICBpZiAodGhpcy5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucGF0aC5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZSBhdCBlbmQgb2YgcnVuIGhlcmVcbiAgICAgICAgfVxuICAgICAgICB2YXIgeERpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueCAtIHRoaXMuY3VycmVudC54O1xuICAgICAgICB2YXIgeURpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueSAtIHRoaXMuY3VycmVudC55O1xuICAgICAgICBpZiAoeURpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIF4nKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgdicpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgPC0nKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5uZXh0QWN0aW9uID0gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIC0+Jyk7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm90aGluZyB0byBiYWNrdHJhY2sgdG8nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gRGVyaXZlcyBuZXh0IEFjdGlvbiBiYXNlZCBvbiBvdXIgY29vcmRpbmF0ZXMgKFRPRE86IFJlZmFjdG9yLiAxLiB1c2UgZGlyZWN0aW9uIG9ubHkgaW5zdGVhZCwgYW5kIDIuY291bGQgcmVtb3ZlIHRoaXMub3JpZ2luIHNpbmNlIGFsd2F5cyAwKTpcbiAgICBTdGFja2VyLnByb3RvdHlwZS5nZXROZXh0QWN0aW9uID0gZnVuY3Rpb24gKG5leHRDZWxsKSB7XG4gICAgICAgIGlmIChuZXh0Q2VsbCA9PT0gdm9pZCAwKSB7IG5leHRDZWxsID0gdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXTsgfVxuICAgICAgICB2YXIgeCA9IHRoaXMub3JpZ2luLnggLSB0aGlzLmN1cnJlbnQueCArIG5leHRDZWxsLng7IC8vIGxhc3QgdG9WaXNpdCBkdWUgdG8gdXNpbmcgcG9wKClcbiAgICAgICAgdmFyIHkgPSB0aGlzLm9yaWdpbi55IC0gdGhpcy5jdXJyZW50LnkgKyBuZXh0Q2VsbC55O1xuICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgIC8vIGxlZnQ6IC0xeFxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICAgICAgLy8gcmlnaHQ6ICsxeFxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPCAwKSB7XG4gICAgICAgICAgICAvLyB1cDogLTF5XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQubmV4dEFjdGlvbiA9IEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICAgIC8vIGRvd246ICsxeVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Lm5leHRBY3Rpb24gPSBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdoZW4geD0wIGFuZCB5PTAgd2hlbiB2aXNpdGVkIGFsbCBjZWxscyBvbiBtYXBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBuZXh0IGFjdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBBZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggbGlzdCBpZiBub3QgYWxyZWFkeSBpbiB0aGVyZVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnVwZGF0ZVBhdGggPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGxvcmVkLnB1c2goX19hc3NpZ24oe30sIHBvc2l0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAocCkgeyByZXR1cm4gcC54ID09PSBwb3NpdGlvbi54ICYmIHAueSA9PT0gcG9zaXRpb24ueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBVcGRhdGVzIG1haW4gc3RhdGUgdmFyaWFibGVzXG4gICAgU3RhY2tlci5wcm90b3R5cGUudXBkYXRlU3RhdGUgPSBmdW5jdGlvbiAocHJldlBvc2l0aW9uLCBjdXJyZW50UGhhc2UpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5waGFzZSA9IGN1cnJlbnRQaGFzZTtcbiAgICAgICAgLy8gdGhpcy5wcmV2Q2VsbCA9IHsgLi4ucHJldlBvc2l0aW9uIH07IC8vIFRPRE86IG1heSBub3QgYmUgbmVlZGVkIGR1ZSB0byBuZXh0QWN0aW9uIHByb3BlcnR5XG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGNlbGwgc2luY2Ugd2V2ZSBub3cgbW92ZWQgYWhlYWRcbiAgICAgICAgaWYgKHRoaXMucGF0aC5sZW5ndGggPiAwKVxuICAgICAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS5uZXh0QWN0aW9uID0gcHJldlBvc2l0aW9uLm5leHRBY3Rpb247XG4gICAgICAgIGlmICh0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgJiYgdGhpcy5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMucGF0aC5wb3AoKTsgLy8gc2hvdWxkIHN5bmMgd2l0aCBjZWxsXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy50b1Zpc2l0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0b1Zpc2l0OiAnLCB0aGlzLnRvVmlzaXQpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFuZCBhZGQgY3VycmVudCBjZWxsIHRvIGV4cGxvcmVkIGFuZCBwYXRoIGxpc3RzXG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IF90aGlzLmN1cnJlbnQueCAmJiBlLnkgPT09IF90aGlzLmN1cnJlbnQueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9yZWQucHVzaChfX2Fzc2lnbih7fSwgdGhpcy5jdXJyZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAocCkgeyByZXR1cm4gcC54ID09PSBfdGhpcy5jdXJyZW50LnggJiYgcC55ID09PSBfdGhpcy5jdXJyZW50Lnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgdGhpcy5jdXJyZW50KSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENsZWFycyBtYWluIHN0YXRlIHZhcmlhYmxlc1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmNsZWFyU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfTtcbiAgICAvLyBGaW5kIHdoaWNoIG5laWdoYm9ycyBhcmUgdmFsaWQgdG8gbW92ZSB0byAobm90IHdhbGwsIG5vdCB2aXNpdGVkLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIC8vIGFzIHdlbGwgYXMgaWYgYW55IGFyZSBhIHRvd2VyIGFzIHdlbGxcbiAgICBTdGFja2VyLnByb3RvdHlwZS5jaGVja05laWdoYm9ycyA9IGZ1bmN0aW9uIChjZWxsLCAvLyBjdXJyZW50IGNlbGxcbiAgICBkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBjdXJyZW50IHNob3VsZCA9PT0gY2VsbFxuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgIT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuV0FMTCAmJlxuICAgICAgICAgICAgIXRoaXMucGF0aC5zb21lKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgcC55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pICYmXG4gICAgICAgICAgICAvLyB0aGlzLmV4cGxvcmVkIG5lZWRlZCBzaW5jZSB0aGlzLnBhdGggaGFzIGVsZW1lbnRzIHJlZ3VsYXJseSByZW1vdmVkXG4gICAgICAgICAgICAhdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgZS55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5waGFzZSA9PT0gUGhhc2UuQ09MTEVDVF9CTE9DS1MgJiYgIXRoaXMuYmxvY2tMb2NhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRCbG9jayhkaXJlY3Rpb24sIGR4LCBkeSk7XG4gICAgICAgICAgICBpZiAoIXRoaXMudG93ZXJMb2NhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihkaXJlY3Rpb24sIGR4LCBkeSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlyZWN0aW9uLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFRPRE86IHdoYXQgYWJvdXQgZm9yIENlbGxUeXBlLkdPTEQ/XG4gICAgfTtcbiAgICAvLyBDaGVjayBpZiB0b3dlciBpcyBmb3VuZCBhbmQgdXBkYXRlIGl0cyBsb2NhdGlvbiAob25seSBwZXJmb3JtIGR1cmluZyBwaGFzZSAxKVxuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRUb3dlciA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLmxldmVsID09PSA4ICYmICF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIGR4LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgZHksXG4gICAgICAgICAgICAgICAgbmV4dEFjdGlvbjogbnVsbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIENoZWNrIGlmIGJsb2NrIGlzIGZvdW5kIGFuZCB1cGRhdGVzIGl0cyBsb2NhdGlvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRCbG9jayA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiYgIXRoaXMuYmxvY2tMb2NhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgZHgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBkeSxcbiAgICAgICAgICAgICAgICBuZXh0QWN0aW9uOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gVE9ETzogYnVpbGQgc3RhaXJjYXNlIGFsZ28uIFdpbGwgbmVlZCB0byBydW4gZmluZEJsb2NrKCkgb25seSB3aGVuIGJsb2NrIG5vdCBpbiBzdGFpcmNhc2UgKGNoZWNrTmVpZ2hib3JzKCkpXG4gICAgU3RhY2tlci5wcm90b3R5cGUuYnVpbGRTdGFpcmNhc2UgPSBmdW5jdGlvbiAoY2VsbCwgY3VycmVudCkge1xuICAgICAgICBpZiAodGhpcy5zdGFpcmNhc2UubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgLy8gYnVpbGQgaW5pdGlhbCBzdGFpcmNhc2UgKHR3byAxIGJsb2NrIGNlbGxzKVxuICAgICAgICAgICAgaWYgKGNlbGwudHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJldmVyc2VEaXJlY3Rpb24odGhpcy5wYXRoLnBvcCgpLm5leHRBY3Rpb24pO1xuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLnJldmVyc2VEaXJlY3Rpb24oY3VycmVudC5uZXh0QWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVEFJUkNBU0U6IGFkZCBibG9jaycpO1xuICAgICAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBkcm9wIGF0IGVuZCBvZiBzdGFpcmNhc2Ugd2hlbiBzdGFpcmNhc2UgZnVsbFxuICAgICAgICBpZiAodGhpcy5zdGFpcmNhc2VbMF0ubGV2ZWwgPT09IHRoaXMuc3RhaXJjYXNlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucGF0aC5zbGljZSgtMSlbMF0udHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSykge1xuICAgICAgICAgICAgICAgIC8vIGNlbGwgPT0gY3VyZW50P1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU1RBSVJDQVNFOiBhZGQgYmxvY2snKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tMb2NhdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXR1cm5pbmdUb1Rvd2VyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aCA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5wYXRoLnBvcCgpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2ZXJzZURpcmVjdGlvbih0aGlzLmN1cnJlbnQubmV4dEFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxzZSBkcm9wIGF0IHRvcCBvZiBzdGFpcmNhc2VcbiAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ibG9ja0xvY2F0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXRoLnB1c2godGhpcy5jdXJyZW50KTtcbiAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKHRoaXMuY3VycmVudCk7XG4gICAgICAgIHRoaXMuc3RhaXJjYXNlLnB1c2goX19hc3NpZ24oX19hc3NpZ24oe30sIGN1cnJlbnQpLCB7IGxldmVsOiAxLCB0eXBlOiBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLIH0pKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1NUQUlSQ0FTRTogYWRkIGJsb2NrJyk7XG4gICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDtcbiAgICB9O1xuICAgIHJldHVybiBTdGFja2VyO1xufSgpKTtcbndpbmRvdy5TdGFja2VyID0gU3RhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BY3Rpb24gPSB2b2lkIDA7XG4vLyBUaGlzIGlzIHRoZSBsaXN0IG9mIGFjdGlvbnMgdGhhdCB0aGUgU3RhY2tlciBjYW4gdGFrZVxudmFyIEFjdGlvbjtcbihmdW5jdGlvbiAoQWN0aW9uKSB7XG4gICAgQWN0aW9uW1wiTEVGVFwiXSA9IFwibGVmdFwiO1xuICAgIEFjdGlvbltcIlVQXCJdID0gXCJ1cFwiO1xuICAgIEFjdGlvbltcIlJJR0hUXCJdID0gXCJyaWdodFwiO1xuICAgIEFjdGlvbltcIkRPV05cIl0gPSBcImRvd25cIjtcbiAgICBBY3Rpb25bXCJQSUNLVVBcIl0gPSBcInBpY2t1cFwiO1xuICAgIEFjdGlvbltcIkRST1BcIl0gPSBcImRyb3BcIjtcbn0pKEFjdGlvbiB8fCAoZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb24gPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNlbGxUeXBlID0gdm9pZCAwO1xudmFyIENlbGxUeXBlO1xuKGZ1bmN0aW9uIChDZWxsVHlwZSkge1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiRU1QVFlcIl0gPSAwXSA9IFwiRU1QVFlcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIldBTExcIl0gPSAxXSA9IFwiV0FMTFwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiQkxPQ0tcIl0gPSAyXSA9IFwiQkxPQ0tcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkdPTERcIl0gPSAzXSA9IFwiR09MRFwiO1xufSkoQ2VsbFR5cGUgfHwgKGV4cG9ydHMuQ2VsbFR5cGUgPSBDZWxsVHlwZSA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvU3RhY2tlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==