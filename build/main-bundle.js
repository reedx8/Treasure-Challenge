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
        // private backtrack: Backtrack = {
        //     inProgress: false,
        // };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUM3RCxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxhQUFhLGNBQWMsY0FBYzs7Ozs7Ozs7Ozs7QUNaN0I7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsZUFBZSxnQkFBZ0IsZ0JBQWdCOzs7Ozs7O1VDVGhEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvU3RhY2tlci50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0FjdGlvbi50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvbGliL0NlbGxUeXBlLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vKlxuMyBtYWluIGFsZ29zIHRvIGZpbmQ6XG4xLiB0cmF2ZXJzYWwgYWxnbyAoZG9uZSlcbiAgICAtIG5lZWRzIGJhY2t0cmFja2luZyB0b28gKGRvbmUpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uIChkb25lKVxuMi4gY29sbGVjdCBibG9ja3MgYWxnbyAoY2FuIGp1c3QgcG9wIG9mZiBwYXRoW10gZm9yIG5vdylcbjMuIGJ1aWxkIHN0YWlyY2FzZSBhbGdvXG4gICAgLSBhbGlnbiAoKGgtMSkoaCkpLzIgIGJsb2NrcyBpbiB0b3RhbCAod2hlcmUgaCA9IHRvd2VyIGhlaWdodClcblxuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIHBhdGhzIGNyZWF0ZWQgLS0gcGF0aFtdIGNsZWFyZWQgZWFjaCB0aW1lIHRyb2xsIGF0IHRvd2VyXG4tIGV4cGxvcmVkIGlzIGEgbGlzdCBvZiBhbGwgZXhwbG9yZWQgY2VsbHMgaW4gcnVuLCBuZXZlciB0byBiZSByZXNldCBpbiBhIHNpbmdsZSBydW4uXG4tIFByb2dyYW0gd2lsbCBjb25zb2xlLmxvZygpOiBiYWNrdHJhY2sgZGlyZWN0aW9uIChpZiBuZWVkZWQpLCBwaWNrdXAvZHJvcCwgYW5kIHRvd2VyIGxvY2F0aW9uXG4qL1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBTdGFja2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0YWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudHJlYXN1cmVGb3VuZCA9IGZhbHNlOyAvLyBpZiB3ZSBoYXZlIGZvdW5kIHRoZSB0cmVhc3VyZSBvbiBtYXAgKG5vdCB1c2VkKVxuICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgdG93ZXIgb24gbWFwXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmV2ZXIgcmVtb3ZlZCAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24gb24gbWFwXG4gICAgICAgIHRoaXMub3JpZ2luID0geyB4OiAwLCB5OiAwIH07IC8vIG9yb2dpbiBjZWxsIG9mIGVudGlyZSBjb29yZGluYXRlIHN5c3RlbVxuICAgICAgICAvLyBwcml2YXRlIGJhY2t0cmFjazogQmFja3RyYWNrID0ge1xuICAgICAgICAvLyAgICAgaW5Qcm9ncmVzczogZmFsc2UsXG4gICAgICAgIC8vIH07XG4gICAgICAgIHRoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcyA9IGZhbHNlOyAvLyBpZiB3ZSBhcmUgY3VycmVudGx5IGJhY2t0cmFja2luZ1xuICAgICAgICAvLyB1c2luZyB0aGUgdHJpYW5ndWxhciBudW1iZXIgZm9ybXVsYTogKGgtMSloLzIgKDggaGFyZGNvZGVkIGZvciBub3cgc2luY2Ugb25seSBldmVyIHNlZW4gOCBsZXZlbCB0b3dlcnMuIGggPSB0b3dlciBoZWlnaHQpXG4gICAgICAgIC8vIHByaXZhdGUgc3RhaXJjYXNlVG90YWwgPSBNYXRoLmFicygoOCAtIDEpICogOCkgLyAyOyAvLyAobm90IHVzZWQgdG8ga2VlcCBzaW1wbGUpIHRvdGFsIG51bWJlciBvZiBibG9ja3MgcmVxdWlyZWQgdG8gYnVpbGQgc3RhaXJjYXNlXG4gICAgICAgIHRoaXMuc3RhaXJjYXNlVG90YWwgPSAzOyAvLyBkdW1teSB2YWx1ZSBmb3Igbm93ICh0byBrZWVwIGl0IHNpbXBsZSlcbiAgICAgICAgLy8gRm9yIEJGUy9ERlMgdHJhdmVyc2FsIGFuZCBiYWNrdHJhY2tpbmdcbiAgICAgICAgdGhpcy5wYXRoID0gW107IC8vIFRoZSBwYXRoIGFjdHVhbGx5IHRha2VuIHRodXMgZmFyIGZvciBlYWNoIGpvdXJuZXkvcnVuICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIG5lZWRlZClcbiAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgbmV4dFxuICAgICAgICB0aGlzLnR1cm4gPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgaWYgKGNlbGwudHlwZSA9PT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5CTE9DSyAmJlxuICAgICAgICAgICAgICAgICFfdGhpcy5ob2xkaW5nQmxvY2sgJiZcbiAgICAgICAgICAgICAgICAhX3RoaXMudG93ZXJMb2NhdGlvbiAvLyBUT0RPOiBzaG91bGQgYmUgYWJsZSB0byBwaWNrIHVwIGJsb2NrIHdoZW4gdG93ZXIgaXMgZm91bmQgdG9vIG9idiwgYnV0IGF2b2lkcyBuZXZlci1lbmRpbmcgcGlja3VwL2Ryb3AgbG9vcCBhdCBlbmQgZm9yIG5vd1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gR3JlZWR5IHBpY2t1cFxuICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1BJQ0tVUCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUElDS1VQO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGhhc2UgMTogVXBkYXRlIHBvc2l0aW9uIGFuZCB0cmF2ZXJzZSBtYXAgZm9yIHRvd2VyIChiYWNrdHJhY2sgaWYgbmVjLikuXG4gICAgICAgICAgICBpZiAoX3RoaXMuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIGF0IGJlZ2lubmluZyBvZiBydW5cbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX19hc3NpZ24oe30sIF90aGlzLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICAvLyAgICAgJ2N1cnJlbnQgKGJlZ2luKTogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnlcbiAgICAgICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnBhdGgucG9wKCk7IC8vIHNob3VsZCBzeW5jIHdpdGggY2VsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnRvVmlzaXQucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudXBkYXRlUGF0aCh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXJyZW50OiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50ID0gdGhpcy50b1Zpc2l0LnBvcCgpOyAvLyBUaGlzIHdvbnQgd29yayBvbiBpdHMgb3duIGFzIHdlIHdhbnQgaXQgd2hlbiBzdHVjay9zaG91bGQgYmFja3RyYWNrIGFuZCB3aWxsIGNvbnRpbnVlIHB1bGxpbmcgZnJvbSB0b1Zpc2l0IGF0IHRob3NlIHBvaW50c1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFBoYXNlIDI6IFRvd2VyIGxvY2F0ZWRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU1RPUCB8IHRvd2VyIGZvdW5kOiAnICtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudG93ZXJMb2NhdGlvbi54ICtcbiAgICAgICAgICAgICAgICAgICAgJywnICtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudG93ZXJMb2NhdGlvbi55KTtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuaG9sZGluZ0Jsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEUk9QJyk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUT0RPXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5wYXRoID0gW107IC8vIHJlc2V0IHBhdGhcbiAgICAgICAgICAgICAgICAvLyB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gcmVzZXQgdG9WaXNpdFxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLnRyYXZlcnNlTWFwKGNlbGwpOyAvLyB0cmF2ZXJzZSBtYXAgYWdhaW5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBuZWVkcyB0byBkcm9wIG9ubHkgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyAybmQgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyAoc3RheXMgaW4gcGxhY2Ugd2hpbGUgZHJvcHBpbmcgdG9vKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGhhc2UgMzogQ29sbGVjdCBibG9ja3NcbiAgICAgICAgICAgIC8vIFBoYXNlIDQ6IEJ1aWxkIHN0YWlyY2FzZSB0byB0cmVhc3VyZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyB0cmF2ZXJzZSBtYXAgYnkgYWRkaW5nIHRvIHRvVmlzaXQgKEJGUz8pXG4gICAgU3RhY2tlci5wcm90b3R5cGUudHJhdmVyc2VNYXAgPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAvLyBsZXQgdHJhdmVyc2VkRW50aXJlTWFwID0gNDtcbiAgICAgICAgdmFyIGNhbk1vdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKCF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIC8vIG9ubHkgZmluZCB0b3dlciBvbmNlXG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLnVwLCAwLCAtMSk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLmxlZnQsIC0xLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZmluZFRvd2VyKGNlbGwuZG93biwgMCwgMSk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLnJpZ2h0LCAxLCAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdG8gdG9WaXNpdCBzdGFjayBpZiB2YWxpZCBjZWxsIGluIG9yZGVyIHRvIHRyYXZlcnNlIG1hcFxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQ2VsbChjZWxsLCBjZWxsLnVwLCAwLCAtMSkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LngsIHk6IHRoaXMuY3VycmVudC55IC0gMSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5sZWZ0LCAtMSwgMCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LnggLSAxLCB5OiB0aGlzLmN1cnJlbnQueSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xlZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQ2VsbChjZWxsLCBjZWxsLmRvd24sIDAsIDEpKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54LCB5OiB0aGlzLmN1cnJlbnQueSArIDEgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkb3duJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5yaWdodCwgMSwgMCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LnggKyAxLCB5OiB0aGlzLmN1cnJlbnQueSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgLy8gVG93ZXIgbGNhdGVkIHNvbWV3aGVyZSBpbiBjZWxsJ3MgaW1tZWQuIG5laWdoYm9yaW5nIGNlbGxzLi4uXG4gICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RST1AnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gRmlyc3QgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyB0byBleGl0IGVhcmx5LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjYW50IG1vdmU6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQueCA9PT0gMCAmJiB0aGlzLmN1cnJlbnQueSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFbmQgb2Ygam91cm5leS9ydW4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIHBsYWNlaG9sZGVyIGZvciBub3csIHRyb2xsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iYWNrdHJhY2tBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXR1cm4gdGhpcy5nZXROZXh0QWN0aW9uKCk7IC8vIERGUyBkdWUgdG8gcG9wKCk/XG4gICAgfTtcbiAgICBTdGFja2VyLnByb3RvdHlwZS5maW5kVG93ZXIgPSBmdW5jdGlvbiAoZGlyZWN0aW9uLCBkeCwgZHkpIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbi5sZXZlbCA9PT0gOCAmJiAhdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5jdXJyZW50LnggKyBkeCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnQueSArIGR5LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQmVnaW4gYmFja3RyYWNraW5nXG4gICAgU3RhY2tlci5wcm90b3R5cGUuYmFja3RyYWNrQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAvLyB4IGFuZCB5IGRpcmVjdGlvbiB0byBiYWNrdHJhY2sgdG86XG4gICAgICAgIHRoaXMucGF0aC5wb3AoKTtcbiAgICAgICAgdmFyIHhEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggLSB0aGlzLmN1cnJlbnQueDtcbiAgICAgICAgdmFyIHlEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnkgLSB0aGlzLmN1cnJlbnQueTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXG4gICAgICAgIC8vICAgICAncHJldiBwYXRoOiAnICtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggK1xuICAgICAgICAvLyAgICAgICAgICcsJyArXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55XG4gICAgICAgIC8vICk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXJyZW50IChidCk6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55KTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3hEaXJlY3Rpb246ICcgKyB4RGlyZWN0aW9uKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3lEaXJlY3Rpb246ICcgKyB5RGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKHlEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay51cCA9IE1hdGguYWJzKHlEaXJlY3Rpb24pO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgXicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2suZG93biA9IHlEaXJlY3Rpb247XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayB2Jyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLmxlZnQgPSB4RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgPC0nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2sucmlnaHQgPSB4RGlyZWN0aW9uO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgLT4nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uUklHSFQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm90aGluZyB0byBiYWNrdHJhY2sgdG8nKTtcbiAgICAgICAgICAgIC8vIFRPRE86IHNob3VsZCByZXR1cm4gYW4gYWN0aW9uIGhlcmVcbiAgICAgICAgfVxuICAgIH07XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZ2V0TmV4dEFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gZGVyaXZlcyBuZXh0IEFjdGlvbiBiYXNlZCBvbiBvdXIgY29vcmRpbmF0ZXMgKGNvdWxkIHJlbW92ZSBvcmlnaW4gc2luY2UgYWx3YXlzIDApOlxuICAgICAgICB2YXIgeCA9IHRoaXMub3JpZ2luLnggLSB0aGlzLmN1cnJlbnQueCArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueDsgLy8gbGFzdCB0b1Zpc2l0IGR1ZSB0byB1c2luZyBwb3AoKVxuICAgICAgICB2YXIgeSA9IHRoaXMub3JpZ2luLnkgLSB0aGlzLmN1cnJlbnQueSArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueTtcbiAgICAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgICAgICAvLyBsZWZ0OiAtMXhcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICAgICAgLy8gcmlnaHQ6ICsxeFxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5IDwgMCkge1xuICAgICAgICAgICAgLy8gdXA6IC0xeVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5ID4gMCkge1xuICAgICAgICAgICAgLy8gZG93bjogKzF5XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBUT0RPOiB4PTAgYW5kIHk9MCB3aGVuIHZpc2l0ZWQgYWxsIGNlbGxzIG9uIG1hcFxuICAgICAgICAgICAgLy8gdGhpcy50b1Zpc2l0LnBvcCgpO1xuICAgICAgICAgICAgLy8gdGhpcy5kb25lVmlzaXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgLy8gcmV0dXJuIEFjdGlvbi5QSUNLVVA7IC8vIHBsYWNlaG9sZGVyIGZvciBub3cgLCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBhZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggbGlzdCBpZiBub3QgYWxyZWFkeSBpbiB0aGVyZVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnVwZGF0ZVBhdGggPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGxvcmVkLnB1c2goX19hc3NpZ24oe30sIHBvc2l0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS54ID09PSBwb3NpdGlvbi54ICYmIGUueSA9PT0gcG9zaXRpb24ueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXJyZW50OiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgfTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBGaW5kIHdoaWNoIG5laWdoYm9ycyBhcmUgdmFsaWQgdG8gbW92ZSB0byAoaWYgbm90IHdhbGwsIG5vdCBhbHJlYWR5IHZpc2l0ZWQgaW4gcGF0aCwgYW5kIDEgbGV2ZWwgYXdheSlcbiAgICBTdGFja2VyLnByb3RvdHlwZS5pc1ZhbGlkQ2VsbCA9IGZ1bmN0aW9uIChjZWxsLCAvLyBjdXJyZW50IGNlbGxcbiAgICBkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBjdXJyZW50IHNob3VsZCA9PT0gY2VsbFxuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgIT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuV0FMTCAmJlxuICAgICAgICAgICAgTWF0aC5hYnMoZGlyZWN0aW9uLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMSAmJlxuICAgICAgICAgICAgIXRoaXMucGF0aC5zb21lKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHYueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgdi55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pICYmXG4gICAgICAgICAgICAhdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgZS55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFRPRE86IHdoYXQgYWJvdXQgZm9yIENlbGxUeXBlLkdPTEQ/XG4gICAgfTtcbiAgICByZXR1cm4gU3RhY2tlcjtcbn0oKSk7XG53aW5kb3cuU3RhY2tlciA9IFN0YWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQWN0aW9uID0gdm9pZCAwO1xuLy8gVGhpcyBpcyB0aGUgbGlzdCBvZiBhY3Rpb25zIHRoYXQgdGhlIFN0YWNrZXIgY2FuIHRha2VcbnZhciBBY3Rpb247XG4oZnVuY3Rpb24gKEFjdGlvbikge1xuICAgIEFjdGlvbltcIkxFRlRcIl0gPSBcImxlZnRcIjtcbiAgICBBY3Rpb25bXCJVUFwiXSA9IFwidXBcIjtcbiAgICBBY3Rpb25bXCJSSUdIVFwiXSA9IFwicmlnaHRcIjtcbiAgICBBY3Rpb25bXCJET1dOXCJdID0gXCJkb3duXCI7XG4gICAgQWN0aW9uW1wiUElDS1VQXCJdID0gXCJwaWNrdXBcIjtcbiAgICBBY3Rpb25bXCJEUk9QXCJdID0gXCJkcm9wXCI7XG59KShBY3Rpb24gfHwgKGV4cG9ydHMuQWN0aW9uID0gQWN0aW9uID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DZWxsVHlwZSA9IHZvaWQgMDtcbnZhciBDZWxsVHlwZTtcbihmdW5jdGlvbiAoQ2VsbFR5cGUpIHtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkVNUFRZXCJdID0gMF0gPSBcIkVNUFRZXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJXQUxMXCJdID0gMV0gPSBcIldBTExcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkJMT0NLXCJdID0gMl0gPSBcIkJMT0NLXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJHT0xEXCJdID0gM10gPSBcIkdPTERcIjtcbn0pKENlbGxUeXBlIHx8IChleHBvcnRzLkNlbGxUeXBlID0gQ2VsbFR5cGUgPSB7fSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL1N0YWNrZXIudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=