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
3. collect blocks algo (can just pop off path[] for now) (TODO)
4. build staircase algo (TODO)
    - align ((h-1)(h))/2  blocks in total (where h = tower height)

- Each run has several paths created -- path[] cleared each time troll at tower (TODO)
- explored is a list of all explored cells in run, never to be reset in a single run.
*/
var Action_1 = __webpack_require__(/*! ./lib/Action */ "./src/lib/Action.ts");
var CellType_1 = __webpack_require__(/*! ./lib/CellType */ "./src/lib/CellType.ts");
var Stacker = /** @class */ (function () {
    function Stacker() {
        var _this = this;
        this.towerLocation = null; // x,y location of tower on map
        this.holdingBlock = false; // if we are holding a block
        this.explored = []; // list of all cells visited in journey/path, never removed (using set would probably be better lookup time if ever needed)
        this.current = null; // current x,y position on map
        this.origin = { x: 0, y: 0 }; // orogin cell of entire coordinate system
        // For BFS/DFS traversal and backtracking:
        this.path = []; // The path actually taken thus far for each journey/run (using set would probably be better lookup time if needed)
        this.toVisit = []; // list of cells to visit next
        this.backtrackInProgress = false; // if we are currently backtracking
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
            // Phase 1: Update position and traverse map for tower (backtrack if nec.).
            if (!_this.current) {
                // at beginning of run
                _this.current = __assign({}, _this.origin);
                _this.updatePath(_this.current);
                return _this.traverseMap(cell);
            }
            else if (!_this.towerLocation) {
                // update current position
                if (_this.backtrackInProgress) {
                    _this.current = _this.path.pop(); // should sync with cell
                }
                else {
                    _this.current = _this.toVisit.pop();
                }
                _this.updatePath(_this.current);
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
            // Phase 3: Collect blocks (TODO)
            // Phase 4: Build staircase to treasure (TODO)
        };
    }
    // Traverse map by adding to toVisit (DFS?)
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
                });
                canMove = true;
            }
        }
        if (this.towerLocation) {
            // Tower located somewhere in cell's immed. neighboring cells...
            this.holdingBlock = false;
            console.log('DROP');
            return Action_1.Action.DROP; // First drop: placeholder for now to exit early, troll stays in place
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
            return Action_1.Action.UP;
        }
        else if (yDirection > 0) {
            console.log('go back v');
            return Action_1.Action.DOWN;
        }
        else if (xDirection < 0) {
            console.log('go back <-');
            return Action_1.Action.LEFT;
        }
        else if (xDirection > 0) {
            console.log('go back ->');
            return Action_1.Action.RIGHT;
        }
        else {
            console.log('nothing to backtrack to');
            return Action_1.Action.DROP; // placeholder for now, troll stays in place
        }
    };
    // Derives next Action based on our coordinates (could remove this.origin since always 0):
    Stacker.prototype.getNextAction = function () {
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
        if (!this.path.some(function (e) { return e.x === position.x && e.y === position.y; })) {
            this.path.push(__assign({}, position));
        }
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
            !this.explored.some(function (e) {
                return e.x === _this.current.x + dx && e.y === _this.current.y + dy;
            })) {
            if (!this.towerLocation)
                this.findTower(direction, dx, dy);
            if (Math.abs(direction.level - cell.level) <= 1)
                return true;
        }
        return false;
        // TODO: what about for CellType.GOLD?
    };
    // Check if tower is found and update its location
    Stacker.prototype.findTower = function (direction, dx, dy) {
        if (direction.level === 8 && !this.towerLocation) {
            this.towerLocation = {
                x: this.current.x + dx,
                y: this.current.y + dy,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL1N0YWNrZXIudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9BY3Rpb24udHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyLy4vc3JjL2xpYi9DZWxsVHlwZS50cyIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8qXG5Qcm9ncmFtIG9ubHkgY2FwYWJsZSBvZiBkcm9wcGluZyBhIHNpbmdsZSBibG9jayBuZWFyIGZvdW5kIHRvd2VyLlxuWWV0IHRvIGNvbGxlY3QgYWRkaXRpb25hbCBibG9ja3MgYW5kIGJ1aWxkIHN0YWlyY2FzZS5cblByb2dyYW0gd2lsbCBjb25zb2xlLmxvZygpOiBiYWNrdHJhY2sgZGlyZWN0aW9uIChpZiBuZWVkZWQpLCBwaWNrdXAvZHJvcCwgYW5kIHRvd2VyIGxvY2F0aW9uXG5cbjQgbWFpbiBhbGdvcyB0byBmaW5kOlxuMS4gdHJhdmVyc2FsIGFsZ28gKGRvbmUpXG4gICAgLSBzYXZlIHRvd2VyIGxvY2F0aW9uIChkb25lKVxuMi4gVHJhdmVyc2FsIG5lZWRzIGJhY2t0cmFja2luZyBhbGdvIHRvbyAoZG9uZSlcbjMuIGNvbGxlY3QgYmxvY2tzIGFsZ28gKGNhbiBqdXN0IHBvcCBvZmYgcGF0aFtdIGZvciBub3cpIChUT0RPKVxuNC4gYnVpbGQgc3RhaXJjYXNlIGFsZ28gKFRPRE8pXG4gICAgLSBhbGlnbiAoKGgtMSkoaCkpLzIgIGJsb2NrcyBpbiB0b3RhbCAod2hlcmUgaCA9IHRvd2VyIGhlaWdodClcblxuLSBFYWNoIHJ1biBoYXMgc2V2ZXJhbCBwYXRocyBjcmVhdGVkIC0tIHBhdGhbXSBjbGVhcmVkIGVhY2ggdGltZSB0cm9sbCBhdCB0b3dlciAoVE9ETylcbi0gZXhwbG9yZWQgaXMgYSBsaXN0IG9mIGFsbCBleHBsb3JlZCBjZWxscyBpbiBydW4sIG5ldmVyIHRvIGJlIHJlc2V0IGluIGEgc2luZ2xlIHJ1bi5cbiovXG52YXIgQWN0aW9uXzEgPSByZXF1aXJlKFwiLi9saWIvQWN0aW9uXCIpO1xudmFyIENlbGxUeXBlXzEgPSByZXF1aXJlKFwiLi9saWIvQ2VsbFR5cGVcIik7XG52YXIgU3RhY2tlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFja2VyKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSBudWxsOyAvLyB4LHkgbG9jYXRpb24gb2YgdG93ZXIgb24gbWFwXG4gICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7IC8vIGlmIHdlIGFyZSBob2xkaW5nIGEgYmxvY2tcbiAgICAgICAgdGhpcy5leHBsb3JlZCA9IFtdOyAvLyBsaXN0IG9mIGFsbCBjZWxscyB2aXNpdGVkIGluIGpvdXJuZXkvcGF0aCwgbmV2ZXIgcmVtb3ZlZCAodXNpbmcgc2V0IHdvdWxkIHByb2JhYmx5IGJlIGJldHRlciBsb29rdXAgdGltZSBpZiBldmVyIG5lZWRlZClcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDsgLy8gY3VycmVudCB4LHkgcG9zaXRpb24gb24gbWFwXG4gICAgICAgIHRoaXMub3JpZ2luID0geyB4OiAwLCB5OiAwIH07IC8vIG9yb2dpbiBjZWxsIG9mIGVudGlyZSBjb29yZGluYXRlIHN5c3RlbVxuICAgICAgICAvLyBGb3IgQkZTL0RGUyB0cmF2ZXJzYWwgYW5kIGJhY2t0cmFja2luZzpcbiAgICAgICAgdGhpcy5wYXRoID0gW107IC8vIFRoZSBwYXRoIGFjdHVhbGx5IHRha2VuIHRodXMgZmFyIGZvciBlYWNoIGpvdXJuZXkvcnVuICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIG5lZWRlZClcbiAgICAgICAgdGhpcy50b1Zpc2l0ID0gW107IC8vIGxpc3Qgb2YgY2VsbHMgdG8gdmlzaXQgbmV4dFxuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGN1cnJlbnRseSBiYWNrdHJhY2tpbmdcbiAgICAgICAgLy8gVXNpbmcgdGhlIHRyaWFuZ3VsYXIgbnVtYmVyIGZvcm11bGE6IChoLTEpaC8yICg4IGhhcmRjb2RlZCBmb3Igbm93IHNpbmNlIG9ubHkgZXZlciBzZWVuIDggbGV2ZWwgdG93ZXJzLiBoID0gdG93ZXIgaGVpZ2h0KVxuICAgICAgICAvLyBwcml2YXRlIHN0YWlyY2FzZVRvdGFsOiBudW1iZXIgPSBNYXRoLmFicygoOCAtIDEpICogOCkgLyAyOyAvLyAobm90IHVzZWQpIHRvdGFsIG51bWJlciBvZiBibG9ja3MgcmVxdWlyZWQgdG8gYnVpbGQgc3RhaXJjYXNlXG4gICAgICAgIHRoaXMudHVybiA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICAvLyBwaWNrdXAgYmxvY2sgYWxvbmcgdGhlIHdheSBpZiB5b3UgY2FuXG4gICAgICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLmhvbGRpbmdCbG9jayAmJlxuICAgICAgICAgICAgICAgICFfdGhpcy50b3dlckxvY2F0aW9uIC8vIFRPRE86IHNob3VsZCBiZSBhYmxlIHRvIHBpY2sgdXAgYmxvY2sgd2hlbiB0b3dlciBpcyBmb3VuZCB0b28gb2J2LiwgYnV0IGF2b2lkcyBuZXZlci1lbmRpbmcgcGlja3VwL2Ryb3AgbG9vcCBhdCBlbmQgZm9yIG5vd1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUElDS1VQJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAxOiBVcGRhdGUgcG9zaXRpb24gYW5kIHRyYXZlcnNlIG1hcCBmb3IgdG93ZXIgKGJhY2t0cmFjayBpZiBuZWMuKS5cbiAgICAgICAgICAgIGlmICghX3RoaXMuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIC8vIGF0IGJlZ2lubmluZyBvZiBydW5cbiAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX19hc3NpZ24oe30sIF90aGlzLm9yaWdpbik7XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghX3RoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnBhdGgucG9wKCk7IC8vIHNob3VsZCBzeW5jIHdpdGggY2VsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnRvVmlzaXQucG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF90aGlzLnVwZGF0ZVBhdGgoX3RoaXMuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRyYXZlcnNlTWFwKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gUGhhc2UgMjogVG93ZXIgbG9jYXRlZFxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTVE9QIHwgdG93ZXIgZm91bmQ6ICcgK1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy50b3dlckxvY2F0aW9uLnggK1xuICAgICAgICAgICAgICAgICAgICAnLCcgK1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy50b3dlckxvY2F0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGlmIChfdGhpcy5ob2xkaW5nQmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0RST1AnKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRPRE86IG5lZWRzIHRvIGRyb3Agb25seSB1bmRlciBjZXJ0YWluIGNvbmRpdGlvbnNcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIDJuZCBkcm9wOiBwbGFjZWhvbGRlciBmb3Igbm93IChzdGF5cyBpbiBwbGFjZSB3aGlsZSBkcm9wcGluZyB0b28pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAzOiBDb2xsZWN0IGJsb2NrcyAoVE9ETylcbiAgICAgICAgICAgIC8vIFBoYXNlIDQ6IEJ1aWxkIHN0YWlyY2FzZSB0byB0cmVhc3VyZSAoVE9ETylcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVHJhdmVyc2UgbWFwIGJ5IGFkZGluZyB0byB0b1Zpc2l0IChERlM/KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnRyYXZlcnNlTWFwID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgdmFyIGNhbk1vdmUgPSBmYWxzZTtcbiAgICAgICAgdmFyIG5laWdoYm9ycyA9IFtcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLnVwLCBkeDogMCwgZHk6IC0xIH0sXG4gICAgICAgICAgICB7IGRpcjogY2VsbC5sZWZ0LCBkeDogLTEsIGR5OiAwIH0sXG4gICAgICAgICAgICB7IGRpcjogY2VsbC5kb3duLCBkeDogMCwgZHk6IDEgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLnJpZ2h0LCBkeDogMSwgZHk6IDAgfSxcbiAgICAgICAgXTtcbiAgICAgICAgLy8gQWRkIHZhbGlkIG5laWdoYm9ycyB0byB0b1Zpc2l0IHN0YWNrIGZvciB0cmF2ZXJzYWwsIGNoZWNrIGZvciB0b3dlciB0b29cbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBuZWlnaGJvcnNfMSA9IG5laWdoYm9yczsgX2kgPCBuZWlnaGJvcnNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBuID0gbmVpZ2hib3JzXzFbX2ldO1xuICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tOZWlnaGJvcnMoY2VsbCwgbi5kaXIsIG4uZHgsIG4uZHkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b1Zpc2l0LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIG4uZHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgbi5keSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAvLyBUb3dlciBsb2NhdGVkIHNvbWV3aGVyZSBpbiBjZWxsJ3MgaW1tZWQuIG5laWdoYm9yaW5nIGNlbGxzLi4uXG4gICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RST1AnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gRmlyc3QgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyB0byBleGl0IGVhcmx5LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE5leHRBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnQueCA9PT0gMCAmJiB0aGlzLmN1cnJlbnQueSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVhY2hlZCBydW4ncyBlbmQgd2l0aG91dCBmaW5kaW5nIHRvd2VyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGVsc2Ugd2UganVzdCBjYW50IG1vdmUgdG8gdmFsaWQgY2VsbHMsIHNvIGJhY2t0cmFja1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3RyYWNrQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZyBpZiBzdHVjayBmb3IgYW55IHJlYXNvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2tJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgLy8geCBhbmQgeSBkaXJlY3Rpb24gdG8gYmFja3RyYWNrIHRvOlxuICAgICAgICB0aGlzLnBhdGgucG9wKCk7XG4gICAgICAgIHZhciB4RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS54IC0gdGhpcy5jdXJyZW50Lng7XG4gICAgICAgIHZhciB5RGlyZWN0aW9uID0gdGhpcy5wYXRoLnNsaWNlKC0xKVswXS55IC0gdGhpcy5jdXJyZW50Lnk7XG4gICAgICAgIGlmICh5RGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgXicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5RGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dvIGJhY2sgdicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayA8LScpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayAtPicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdub3RoaW5nIHRvIGJhY2t0cmFjayB0bycpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBEZXJpdmVzIG5leHQgQWN0aW9uIGJhc2VkIG9uIG91ciBjb29yZGluYXRlcyAoY291bGQgcmVtb3ZlIHRoaXMub3JpZ2luIHNpbmNlIGFsd2F5cyAwKTpcbiAgICBTdGFja2VyLnByb3RvdHlwZS5nZXROZXh0QWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeCA9IHRoaXMub3JpZ2luLnggLSB0aGlzLmN1cnJlbnQueCArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueDsgLy8gbGFzdCB0b1Zpc2l0IGR1ZSB0byB1c2luZyBwb3AoKVxuICAgICAgICB2YXIgeSA9IHRoaXMub3JpZ2luLnkgLSB0aGlzLmN1cnJlbnQueSArIHRoaXMudG9WaXNpdC5zbGljZSgtMSlbMF0ueTtcbiAgICAgICAgaWYgKHggPCAwKSB7XG4gICAgICAgICAgICAvLyBsZWZ0OiAtMXhcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4ID4gMCkge1xuICAgICAgICAgICAgLy8gcmlnaHQ6ICsxeFxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5IDwgMCkge1xuICAgICAgICAgICAgLy8gdXA6IC0xeVxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5ID4gMCkge1xuICAgICAgICAgICAgLy8gZG93bjogKzF5XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBXaGVuIHg9MCBhbmQgeT0wIHdoZW4gdmlzaXRlZCBhbGwgY2VsbHMgb24gbWFwXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gbmV4dCBhY3Rpb24nKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdywgdHJvbGwgc3RheXMgaW4gcGxhY2VcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQWRkIHRvIGV4cGxvcmVkIGFuZCBwYXRoIGxpc3QgaWYgbm90IGFscmVhZHkgaW4gdGhlcmVcbiAgICBTdGFja2VyLnByb3RvdHlwZS51cGRhdGVQYXRoID0gZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICghdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5leHBsb3JlZC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGgucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gRmluZCB3aGljaCBuZWlnaGJvcnMgYXJlIHZhbGlkIHRvIG1vdmUgdG8gKG5vdCB3YWxsLCBub3QgdmlzaXRlZCwgYW5kIDEgbGV2ZWwgYXdheSlcbiAgICAvLyBhcyB3ZWxsIGFzIGlmIGFueSBhcmUgYSB0b3dlciBhcyB3ZWxsXG4gICAgU3RhY2tlci5wcm90b3R5cGUuY2hlY2tOZWlnaGJvcnMgPSBmdW5jdGlvbiAoY2VsbCwgLy8gY3VycmVudCBjZWxsXG4gICAgZGlyZWN0aW9uLCBkeCwgZHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgLy8gY3VycmVudCBzaG91bGQgPT09IGNlbGxcbiAgICAgICAgaWYgKGRpcmVjdGlvbi50eXBlICE9PSBDZWxsVHlwZV8xLkNlbGxUeXBlLldBTEwgJiZcbiAgICAgICAgICAgICF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwLnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIHAueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSAmJlxuICAgICAgICAgICAgIXRoaXMuZXhwbG9yZWQuc29tZShmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlLnggPT09IF90aGlzLmN1cnJlbnQueCArIGR4ICYmIGUueSA9PT0gX3RoaXMuY3VycmVudC55ICsgZHk7XG4gICAgICAgICAgICB9KSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRvd2VyTG9jYXRpb24pXG4gICAgICAgICAgICAgICAgdGhpcy5maW5kVG93ZXIoZGlyZWN0aW9uLCBkeCwgZHkpO1xuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGRpcmVjdGlvbi5sZXZlbCAtIGNlbGwubGV2ZWwpIDw9IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBUT0RPOiB3aGF0IGFib3V0IGZvciBDZWxsVHlwZS5HT0xEP1xuICAgIH07XG4gICAgLy8gQ2hlY2sgaWYgdG93ZXIgaXMgZm91bmQgYW5kIHVwZGF0ZSBpdHMgbG9jYXRpb25cbiAgICBTdGFja2VyLnByb3RvdHlwZS5maW5kVG93ZXIgPSBmdW5jdGlvbiAoZGlyZWN0aW9uLCBkeCwgZHkpIHtcbiAgICAgICAgaWYgKGRpcmVjdGlvbi5sZXZlbCA9PT0gOCAmJiAhdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnRvd2VyTG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy5jdXJyZW50LnggKyBkeCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLmN1cnJlbnQueSArIGR5LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIFN0YWNrZXI7XG59KCkpO1xud2luZG93LlN0YWNrZXIgPSBTdGFja2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkFjdGlvbiA9IHZvaWQgMDtcbi8vIFRoaXMgaXMgdGhlIGxpc3Qgb2YgYWN0aW9ucyB0aGF0IHRoZSBTdGFja2VyIGNhbiB0YWtlXG52YXIgQWN0aW9uO1xuKGZ1bmN0aW9uIChBY3Rpb24pIHtcbiAgICBBY3Rpb25bXCJMRUZUXCJdID0gXCJsZWZ0XCI7XG4gICAgQWN0aW9uW1wiVVBcIl0gPSBcInVwXCI7XG4gICAgQWN0aW9uW1wiUklHSFRcIl0gPSBcInJpZ2h0XCI7XG4gICAgQWN0aW9uW1wiRE9XTlwiXSA9IFwiZG93blwiO1xuICAgIEFjdGlvbltcIlBJQ0tVUFwiXSA9IFwicGlja3VwXCI7XG4gICAgQWN0aW9uW1wiRFJPUFwiXSA9IFwiZHJvcFwiO1xufSkoQWN0aW9uIHx8IChleHBvcnRzLkFjdGlvbiA9IEFjdGlvbiA9IHt9KSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQ2VsbFR5cGUgPSB2b2lkIDA7XG52YXIgQ2VsbFR5cGU7XG4oZnVuY3Rpb24gKENlbGxUeXBlKSB7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJFTVBUWVwiXSA9IDBdID0gXCJFTVBUWVwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiV0FMTFwiXSA9IDFdID0gXCJXQUxMXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJCTE9DS1wiXSA9IDJdID0gXCJCTE9DS1wiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiR09MRFwiXSA9IDNdID0gXCJHT0xEXCI7XG59KShDZWxsVHlwZSB8fCAoZXhwb3J0cy5DZWxsVHlwZSA9IENlbGxUeXBlID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9TdGFja2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9