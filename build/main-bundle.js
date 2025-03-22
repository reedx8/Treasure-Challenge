/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Stacker.ts":
/*!************************!*\
  !*** ./src/Stacker.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/*
3 main algos to find:
1. traversal algo (done)
    - needs backtracking too (done)
    - save tower location (done)
2. collect blocks algo (can just pop off path[] for now)
3. build staircase algo
    - align ((h-1)(h))/2  blocks in total (where h = tower height)


- Each run has several paths created -- path[] cleared each time troll at tower
- explored is a list of all explored cells in run, never to be reset in a single run.
- Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location
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
        this.treasureFound = false; // if we have found the treasure on map (not used)
        this.towerLocation = null; // x,y location of tower on map
        this.holdingBlock = false; // if we are holding a block
        this.explored = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
        this.current = null; // current x,y position on map
        this.origin = { x: 0, y: 0 }; // orogin cell of entire coordinate system
        this.backtrackInProgress = false; // if we are currently backtracking
        // using the triangular number formula: (h-1)h/2 (8 hardcoded for now since only ever seen 8 level towers. h = tower height)
        // private staircaseTotal = Math.abs((8 - 1) * 8) / 2; // (not used to keep simple) total number of blocks required to build staircase
        this.staircaseTotal = 3; // dummy value for now (to keep it simple)
        // For BFS/DFS traversal and backtracking
        this.path = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
        this.toVisit = []; // list of cells to visit next
        this.turn = function (cell) {
            if (cell.type === CellType_1.CellType.BLOCK &&
                !_this.holdingBlock &&
                !_this.towerLocation // TODO: should be able to pick up block when tower is found too obv, but avoids never-ending pickup/drop loop at end for now
            ) {
                // Greedy pickup
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
                if (_this.backtrackInProgress) {
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
                // TODO
                // this.path = []; // reset path
                // this.toVisit = []; // reset toVisit
                // return this.traverseMap(cell); // traverse map again
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
            this.backtrackInProgress = false;
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
        this.backtrackInProgress = true;
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
            // TODO: x=0 and y=0 when visited all cells on map
            // this.toVisit.pop();
            // this.doneVisiting = true;
            // return Action.PICKUP; // placeholder for now , stays in place
        }
    };
    // add to explored and path list if not already in there
    Stacker.prototype.updatePath = function (position) {
        if (!this.explored.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.explored.push(__assign({}, position));
        }
        if (!this.path.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.path.push(__assign({}, position));
        }
        // console.log('current: ' + this.current.x + ',' + this.current.y);
    };
    ////////////////////////////////////////////////////////////////////////////////////
    // Find which neighbors are valid to move to (if not wall, not already visited in path, and 1 level away)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxhQUFhLGNBQWMsY0FBYzs7Ozs7Ozs7Ozs7QUNaN0I7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsZUFBZSxnQkFBZ0IsZ0JBQWdCOzs7Ozs7O1VDVGhEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvU3RhY2tlci50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0FjdGlvbi50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0NlbGxUeXBlLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuMyBtYWluIGFsZ29zIHRvIGZpbmQ6XG4xLiB0cmF2ZXJzYWwgYWxnbyAoZG9uZSlcbiAgICAtIG5lZWRzIGJhY2t0cmFja2luZyB0b28gKGRvbmUpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uIChkb25lKVxuMi4gY29sbGVjdCBibG9ja3MgYWxnbyAoY2FuIGp1c3QgcG9wIG9mZiBwYXRoW10gZm9yIG5vdylcbjMuIGJ1aWxkIHN0YWlyY2FzZSBhbGdvXG4gICAgLSBhbGlnbiAoKGgtMSkoaCkpLzIgIGJsb2NrcyBpbiB0b3RhbCAod2hlcmUgaCA9IHRvd2VyIGhlaWdodClcblxuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIHBhdGhzIGNyZWF0ZWQgLS0gcGF0aFtdIGNsZWFyZWQgZWFjaCB0aW1lIHRyb2xsIGF0IHRvd2VyXG4tIGV4cGxvcmVkIGlzIGEgbGlzdCBvZiBhbGwgZXhwbG9yZWQgY2VsbHMgaW4gcnVuLCBuZXZlciB0byBiZSByZXNldCBpbiBhIHNpbmdsZSBydW4uXG4tIFByb2dyYW0gd2lsbCBjb25zb2xlLmxvZygpOiBiYWNrdHJhY2sgZGlyZWN0aW9uIChpZiBuZWVkZWQpLCBwaWNrdXAvZHJvcCwgYW5kIHRvd2VyIGxvY2F0aW9uXG4qL1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBTdGFja2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0YWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudHJlYXN1cmVGb3VuZCA9IGZhbHNlOyAvLyBpZiB3ZSBoYXZlIGZvdW5kIHRoZSB0cmVhc3VyZSBvbiBtYXAgKG5vdCB1c2VkKVxuICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgdG93ZXIgb24gbWFwXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmV2ZXIgcmVtb3ZlZCAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24gb24gbWFwXG4gICAgICAgIHRoaXMub3JpZ2luID0geyB4OiAwLCB5OiAwIH07IC8vIG9yb2dpbiBjZWxsIG9mIGVudGlyZSBjb29yZGluYXRlIHN5c3RlbVxuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGN1cnJlbnRseSBiYWNrdHJhY2tpbmdcbiAgICAgICAgLy8gdXNpbmcgdGhlIHRyaWFuZ3VsYXIgbnVtYmVyIGZvcm11bGE6IChoLTEpaC8yICg4IGhhcmRjb2RlZCBmb3Igbm93IHNpbmNlIG9ubHkgZXZlciBzZWVuIDggbGV2ZWwgdG93ZXJzLiBoID0gdG93ZXIgaGVpZ2h0KVxuICAgICAgICAvLyBwcml2YXRlIHN0YWlyY2FzZVRvdGFsID0gTWF0aC5hYnMoKDggLSAxKSAqIDgpIC8gMjsgLy8gKG5vdCB1c2VkIHRvIGtlZXAgc2ltcGxlKSB0b3RhbCBudW1iZXIgb2YgYmxvY2tzIHJlcXVpcmVkIHRvIGJ1aWxkIHN0YWlyY2FzZVxuICAgICAgICB0aGlzLnN0YWlyY2FzZVRvdGFsID0gMzsgLy8gZHVtbXkgdmFsdWUgZm9yIG5vdyAodG8ga2VlcCBpdCBzaW1wbGUpXG4gICAgICAgIC8vIEZvciBCRlMvREZTIHRyYXZlcnNhbCBhbmQgYmFja3RyYWNraW5nXG4gICAgICAgIHRoaXMucGF0aCA9IFtdOyAvLyBUaGUgcGF0aCBhY3R1YWxseSB0YWtlbiB0aHVzIGZhciBmb3IgZWFjaCBqb3VybmV5L3J1biAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBuZWVkZWQpXG4gICAgICAgIHRoaXMudG9WaXNpdCA9IFtdOyAvLyBsaXN0IG9mIGNlbGxzIHRvIHZpc2l0IG5leHRcbiAgICAgICAgdGhpcy50dXJuID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiZcbiAgICAgICAgICAgICAgICAhX3RoaXMuaG9sZGluZ0Jsb2NrICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLnRvd2VyTG9jYXRpb24gLy8gVE9ETzogc2hvdWxkIGJlIGFibGUgdG8gcGljayB1cCBibG9jayB3aGVuIHRvd2VyIGlzIGZvdW5kIHRvbyBvYnYsIGJ1dCBhdm9pZHMgbmV2ZXItZW5kaW5nIHBpY2t1cC9kcm9wIGxvb3AgYXQgZW5kIGZvciBub3dcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIEdyZWVkeSBwaWNrdXBcbiAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQSUNLVVAnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlBJQ0tVUDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDE6IFVwZGF0ZSBwb3NpdGlvbiBhbmQgdHJhdmVyc2UgbWFwIGZvciB0b3dlciAoYmFja3RyYWNrIGlmIG5lYy4pLlxuICAgICAgICAgICAgaWYgKF90aGlzLmN1cnJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBhdCBiZWdpbm5pbmcgb2YgcnVuXG4gICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF9fYXNzaWduKHt9LCBfdGhpcy5vcmlnaW4pO1xuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgLy8gICAgICdjdXJyZW50IChiZWdpbik6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55XG4gICAgICAgICAgICAgICAgLy8gKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghX3RoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfdGhpcy5wYXRoLnBvcCgpOyAvLyBzaG91bGQgc3luYyB3aXRoIGNlbGxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnVwZGF0ZVBhdGgodGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudDogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuY3VycmVudCA9IHRoaXMudG9WaXNpdC5wb3AoKTsgLy8gVGhpcyB3b250IHdvcmsgb24gaXRzIG93biBhcyB3ZSB3YW50IGl0IHdoZW4gc3R1Y2svc2hvdWxkIGJhY2t0cmFjayBhbmQgd2lsbCBjb250aW51ZSBwdWxsaW5nIGZyb20gdG9WaXNpdCBhdCB0aG9zZSBwb2ludHNcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBQaGFzZSAyOiBUb3dlciBsb2NhdGVkXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NUT1AgfCB0b3dlciBmb3VuZDogJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueCArXG4gICAgICAgICAgICAgICAgICAgICcsJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmhvbGRpbmdCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVE9ET1xuICAgICAgICAgICAgICAgIC8vIHRoaXMucGF0aCA9IFtdOyAvLyByZXNldCBwYXRoXG4gICAgICAgICAgICAgICAgLy8gdGhpcy50b1Zpc2l0ID0gW107IC8vIHJlc2V0IHRvVmlzaXRcbiAgICAgICAgICAgICAgICAvLyByZXR1cm4gdGhpcy50cmF2ZXJzZU1hcChjZWxsKTsgLy8gdHJhdmVyc2UgbWFwIGFnYWluXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZHMgdG8gZHJvcCBvbmx5IHVuZGVyIGNlcnRhaW4gY29uZGl0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gMm5kIGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgKHN0YXlzIGluIHBsYWNlIHdoaWxlIGRyb3BwaW5nIHRvbylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDM6IENvbGxlY3QgYmxvY2tzXG4gICAgICAgICAgICAvLyBQaGFzZSA0OiBCdWlsZCBzdGFpcmNhc2UgdG8gdHJlYXN1cmVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gdHJhdmVyc2UgbWFwIGJ5IGFkZGluZyB0byB0b1Zpc2l0IChCRlM/KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnRyYXZlcnNlTWFwID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgLy8gbGV0IHRyYXZlcnNlZEVudGlyZU1hcCA9IDQ7XG4gICAgICAgIHZhciBjYW5Nb3ZlID0gZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAvLyBvbmx5IGZpbmQgdG93ZXIgb25jZVxuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC51cCwgMCwgLTEpO1xuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC5sZWZ0LCAtMSwgMCk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLmRvd24sIDAsIDEpO1xuICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoY2VsbC5yaWdodCwgMSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWRkIHRvIHRvVmlzaXQgc3RhY2sgaWYgdmFsaWQgY2VsbCBpbiBvcmRlciB0byB0cmF2ZXJzZSBtYXBcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC51cCwgMCwgLTEpKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54LCB5OiB0aGlzLmN1cnJlbnQueSAtIDEgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd1cCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRDZWxsKGNlbGwsIGNlbGwubGVmdCwgLTEsIDApKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54IC0gMSwgeTogdGhpcy5jdXJyZW50LnkgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5kb3duLCAwLCAxKSkge1xuICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goeyB4OiB0aGlzLmN1cnJlbnQueCwgeTogdGhpcy5jdXJyZW50LnkgKyAxIH0pO1xuICAgICAgICAgICAgY2FuTW92ZSA9IHRydWU7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZG93bicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRDZWxsKGNlbGwsIGNlbGwucmlnaHQsIDEsIDApKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54ICsgMSwgeTogdGhpcy5jdXJyZW50LnkgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIC8vIFRvd2VyIGxjYXRlZCBzb21ld2hlcmUgaW4gY2VsbCdzIGltbWVkLiBuZWlnaGJvcmluZyBjZWxscy4uLlxuICAgICAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEUk9QJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIEZpcnN0IGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgdG8gZXhpdCBlYXJseSwgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuTW92ZSkge1xuICAgICAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROZXh0QWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY2FudCBtb3ZlOiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50LnggPT09IDAgJiYgdGhpcy5jdXJyZW50LnkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRW5kIG9mIGpvdXJuZXkvcnVuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3RyYWNrQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpOyAvLyBERlMgZHVlIHRvIHBvcCgpP1xuICAgIH07XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZmluZFRvd2VyID0gZnVuY3Rpb24gKGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24ubGV2ZWwgPT09IDggJiYgIXRoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgdGhpcy50b3dlckxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgZHgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBkeSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZ1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgLy8geCBhbmQgeSBkaXJlY3Rpb24gdG8gYmFja3RyYWNrIHRvOlxuICAgICAgICB0aGlzLnBhdGgucG9wKCk7XG4gICAgICAgIHZhciB4RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS54IC0gdGhpcy5jdXJyZW50Lng7XG4gICAgICAgIHZhciB5RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55IC0gdGhpcy5jdXJyZW50Lnk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFxuICAgICAgICAvLyAgICAgJ3ByZXYgcGF0aDogJyArXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS54ICtcbiAgICAgICAgLy8gICAgICAgICAnLCcgK1xuICAgICAgICAvLyAgICAgICAgIHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueVxuICAgICAgICAvLyApO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudCAoYnQpOiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd4RGlyZWN0aW9uOiAnICsgeERpcmVjdGlvbik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCd5RGlyZWN0aW9uOiAnICsgeURpcmVjdGlvbik7XG4gICAgICAgIGlmICh5RGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2sudXAgPSBNYXRoLmFicyh5RGlyZWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIF4nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeURpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLmRvd24gPSB5RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgdicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5sZWZ0ID0geERpcmVjdGlvbjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIDwtJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLnJpZ2h0ID0geERpcmVjdGlvbjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIC0+Jyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vdGhpbmcgdG8gYmFja3RyYWNrIHRvJyk7XG4gICAgICAgICAgICAvLyBUT0RPOiBzaG91bGQgcmV0dXJuIGFuIGFjdGlvbiBoZXJlXG4gICAgICAgIH1cbiAgICB9O1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmdldE5leHRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIGRlcml2ZXMgbmV4dCBBY3Rpb24gYmFzZWQgb24gb3VyIGNvb3JkaW5hdGVzIChjb3VsZCByZW1vdmUgb3JpZ2luIHNpbmNlIGFsd2F5cyAwKTpcbiAgICAgICAgdmFyIHggPSB0aGlzLm9yaWdpbi54IC0gdGhpcy5jdXJyZW50LnggKyB0aGlzLnRvVmlzaXQuc2xpY2UoLTEpWzBdLng7IC8vIGxhc3QgdG9WaXNpdCBkdWUgdG8gdXNpbmcgcG9wKClcbiAgICAgICAgdmFyIHkgPSB0aGlzLm9yaWdpbi55IC0gdGhpcy5jdXJyZW50LnkgKyB0aGlzLnRvVmlzaXQuc2xpY2UoLTEpWzBdLnk7XG4gICAgICAgIGlmICh4IDwgMCkge1xuICAgICAgICAgICAgLy8gbGVmdDogLTF4XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeCA+IDApIHtcbiAgICAgICAgICAgIC8vIHJpZ2h0OiArMXhcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA8IDApIHtcbiAgICAgICAgICAgIC8vIHVwOiAtMXlcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uVVA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeSA+IDApIHtcbiAgICAgICAgICAgIC8vIGRvd246ICsxeVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVE9ETzogeD0wIGFuZCB5PTAgd2hlbiB2aXNpdGVkIGFsbCBjZWxscyBvbiBtYXBcbiAgICAgICAgICAgIC8vIHRoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuZG9uZVZpc2l0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIHJldHVybiBBY3Rpb24uUElDS1VQOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93ICwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gYWRkIHRvIGV4cGxvcmVkIGFuZCBwYXRoIGxpc3QgaWYgbm90IGFscmVhZHkgaW4gdGhlcmVcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVQYXRoID0gZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnY3VycmVudDogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgIH07XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gRmluZCB3aGljaCBuZWlnaGJvcnMgYXJlIHZhbGlkIHRvIG1vdmUgdG8gKGlmIG5vdCB3YWxsLCBub3QgYWxyZWFkeSB2aXNpdGVkIGluIHBhdGgsIGFuZCAxIGxldmVsIGF3YXkpXG4gICAgU3RhY2tlci5wcm90b3R5cGUuaXNWYWxpZENlbGwgPSBmdW5jdGlvbiAoY2VsbCwgLy8gY3VycmVudCBjZWxsXG4gICAgZGlyZWN0aW9uLCBkeCwgZHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gY3VycmVudCBzaG91bGQgPT09IGNlbGxcbiAgICAgICAgaWYgKGRpcmVjdGlvbi50eXBlICE9PSBDZWxsVHlwZV8xLkNlbGxUeXBlLldBTEwgJiZcbiAgICAgICAgICAgIE1hdGguYWJzKGRpcmVjdGlvbi5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDEgJiZcbiAgICAgICAgICAgICF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2LnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIHYueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSAmJlxuICAgICAgICAgICAgIXRoaXMuZXhwbG9yZWQuc29tZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlLnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIGUueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBUT0RPOiB3aGF0IGFib3V0IGZvciBDZWxsVHlwZS5HT0xEP1xuICAgIH07XG4gICAgcmV0dXJuIFN0YWNrZXI7XG59KCkpO1xud2luZG93LlN0YWNrZXIgPSBTdGFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFjdGlvbiA9IHZvaWQgMDtcbi8vIFRoaXMgaXMgdGhlIGxpc3Qgb2YgYWN0aW9ucyB0aGF0IHRoZSBTdGFja2VyIGNhbiB0YWtlXG52YXIgQWN0aW9uO1xuKGZ1bmN0aW9uIChBY3Rpb24pIHtcbiAgICBBY3Rpb25bXCJMRUZUXCJdID0gXCJsZWZ0XCI7XG4gICAgQWN0aW9uW1wiVVBcIl0gPSBcInVwXCI7XG4gICAgQWN0aW9uW1wiUklHSFRcIl0gPSBcInJpZ2h0XCI7XG4gICAgQWN0aW9uW1wiRE9XTlwiXSA9IFwiZG93blwiO1xuICAgIEFjdGlvbltcIlBJQ0tVUFwiXSA9IFwicGlja3VwXCI7XG4gICAgQWN0aW9uW1wiRFJPUFwiXSA9IFwiZHJvcFwiO1xufSkoQWN0aW9uIHx8IChleHBvcnRzLkFjdGlvbiA9IEFjdGlvbiA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2VsbFR5cGUgPSB2b2lkIDA7XG52YXIgQ2VsbFR5cGU7XG4oZnVuY3Rpb24gKENlbGxUeXBlKSB7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJFTVBUWVwiXSA9IDBdID0gXCJFTVBUWVwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiV0FMTFwiXSA9IDFdID0gXCJXQUxMXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJCTE9DS1wiXSA9IDJdID0gXCJCTE9DS1wiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiR09MRFwiXSA9IDNdID0gXCJHT0xEXCI7XG59KShDZWxsVHlwZSB8fCAoZXhwb3J0cy5DZWxsVHlwZSA9IENlbGxUeXBlID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9TdGFja2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9