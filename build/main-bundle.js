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
4 main algos to find:
1. traversal algo (done)
    - save tower location (done)
2. Traversal needs backtracking algo too (done)
3. collect blocks algo (can just pop off path[] for now) (TODO)
4. build staircase algo (TODO)
    - align ((h-1)(h))/2  blocks in total (where h = tower height)

- Each run has several paths created -- path[] cleared each time troll at tower (TODO)
- explored is a list of all explored cells in run, never to be reset in a single run.
- Program will console.log(): backtrack direction (if needed), pickup/drop, and tower location
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9TdGFja2VyLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQWN0aW9uLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQ2VsbFR5cGUudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vKlxuNCBtYWluIGFsZ29zIHRvIGZpbmQ6XG4xLiB0cmF2ZXJzYWwgYWxnbyAoZG9uZSlcbiAgICAtIHNhdmUgdG93ZXIgbG9jYXRpb24gKGRvbmUpXG4yLiBUcmF2ZXJzYWwgbmVlZHMgYmFja3RyYWNraW5nIGFsZ28gdG9vIChkb25lKVxuMy4gY29sbGVjdCBibG9ja3MgYWxnbyAoY2FuIGp1c3QgcG9wIG9mZiBwYXRoW10gZm9yIG5vdykgKFRPRE8pXG40LiBidWlsZCBzdGFpcmNhc2UgYWxnbyAoVE9ETylcbiAgICAtIGFsaWduICgoaC0xKShoKSkvMiAgYmxvY2tzIGluIHRvdGFsICh3aGVyZSBoID0gdG93ZXIgaGVpZ2h0KVxuXG4tIEVhY2ggcnVuIGhhcyBzZXZlcmFsIHBhdGhzIGNyZWF0ZWQgLS0gcGF0aFtdIGNsZWFyZWQgZWFjaCB0aW1lIHRyb2xsIGF0IHRvd2VyIChUT0RPKVxuLSBleHBsb3JlZCBpcyBhIGxpc3Qgb2YgYWxsIGV4cGxvcmVkIGNlbGxzIGluIHJ1biwgbmV2ZXIgdG8gYmUgcmVzZXQgaW4gYSBzaW5nbGUgcnVuLlxuLSBQcm9ncmFtIHdpbGwgY29uc29sZS5sb2coKTogYmFja3RyYWNrIGRpcmVjdGlvbiAoaWYgbmVlZGVkKSwgcGlja3VwL2Ryb3AsIGFuZCB0b3dlciBsb2NhdGlvblxuKi9cbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgQ2VsbFR5cGVfMSA9IHJlcXVpcmUoXCIuL2xpYi9DZWxsVHlwZVwiKTtcbnZhciBTdGFja2VyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFN0YWNrZXIoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IG51bGw7IC8vIHgseSBsb2NhdGlvbiBvZiB0b3dlciBvbiBtYXBcbiAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGhvbGRpbmcgYSBibG9ja1xuICAgICAgICB0aGlzLmV4cGxvcmVkID0gW107IC8vIGxpc3Qgb2YgYWxsIGNlbGxzIHZpc2l0ZWQgaW4gam91cm5leS9wYXRoLCBuZXZlciByZW1vdmVkICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIGV2ZXIgbmVlZGVkKVxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsOyAvLyBjdXJyZW50IHgseSBwb3NpdGlvbiBvbiBtYXBcbiAgICAgICAgdGhpcy5vcmlnaW4gPSB7IHg6IDAsIHk6IDAgfTsgLy8gb3JvZ2luIGNlbGwgb2YgZW50aXJlIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICAgIC8vIEZvciBCRlMvREZTIHRyYXZlcnNhbCBhbmQgYmFja3RyYWNraW5nOlxuICAgICAgICB0aGlzLnBhdGggPSBbXTsgLy8gVGhlIHBhdGggYWN0dWFsbHkgdGFrZW4gdGh1cyBmYXIgZm9yIGVhY2ggam91cm5leS9ydW4gKHVzaW5nIHNldCB3b3VsZCBwcm9iYWJseSBiZSBiZXR0ZXIgbG9va3VwIHRpbWUgaWYgbmVlZGVkKVxuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byB2aXNpdCBuZXh0XG4gICAgICAgIHRoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcyA9IGZhbHNlOyAvLyBpZiB3ZSBhcmUgY3VycmVudGx5IGJhY2t0cmFja2luZ1xuICAgICAgICAvLyBVc2luZyB0aGUgdHJpYW5ndWxhciBudW1iZXIgZm9ybXVsYTogKGgtMSloLzIgKDggaGFyZGNvZGVkIGZvciBub3cgc2luY2Ugb25seSBldmVyIHNlZW4gOCBsZXZlbCB0b3dlcnMuIGggPSB0b3dlciBoZWlnaHQpXG4gICAgICAgIC8vIHByaXZhdGUgc3RhaXJjYXNlVG90YWw6IG51bWJlciA9IE1hdGguYWJzKCg4IC0gMSkgKiA4KSAvIDI7IC8vIChub3QgdXNlZCkgdG90YWwgbnVtYmVyIG9mIGJsb2NrcyByZXF1aXJlZCB0byBidWlsZCBzdGFpcmNhc2VcbiAgICAgICAgdGhpcy50dXJuID0gZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICAgIC8vIHBpY2t1cCBibG9jayBhbG9uZyB0aGUgd2F5IGlmIHlvdSBjYW5cbiAgICAgICAgICAgIGlmIChjZWxsLnR5cGUgPT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuQkxPQ0sgJiZcbiAgICAgICAgICAgICAgICAhX3RoaXMuaG9sZGluZ0Jsb2NrICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLnRvd2VyTG9jYXRpb24gLy8gVE9ETzogc2hvdWxkIGJlIGFibGUgdG8gcGljayB1cCBibG9jayB3aGVuIHRvd2VyIGlzIGZvdW5kIHRvbyBvYnYuLCBidXQgYXZvaWRzIG5ldmVyLWVuZGluZyBwaWNrdXAvZHJvcCBsb29wIGF0IGVuZCBmb3Igbm93XG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQSUNLVVAnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlBJQ0tVUDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDE6IFVwZGF0ZSBwb3NpdGlvbiBhbmQgdHJhdmVyc2UgbWFwIGZvciB0b3dlciAoYmFja3RyYWNrIGlmIG5lYy4pLlxuICAgICAgICAgICAgaWYgKCFfdGhpcy5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gYXQgYmVnaW5uaW5nIG9mIHJ1blxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfX2Fzc2lnbih7fSwgX3RoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFfdGhpcy50b3dlckxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgcG9zaXRpb25cbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX3RoaXMucGF0aC5wb3AoKTsgLy8gc2hvdWxkIHN5bmMgd2l0aCBjZWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jdXJyZW50ID0gX3RoaXMudG9WaXNpdC5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3RoaXMudXBkYXRlUGF0aChfdGhpcy5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhdmVyc2VNYXAoY2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBQaGFzZSAyOiBUb3dlciBsb2NhdGVkXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1NUT1AgfCB0b3dlciBmb3VuZDogJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueCArXG4gICAgICAgICAgICAgICAgICAgICcsJyArXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRvd2VyTG9jYXRpb24ueSk7XG4gICAgICAgICAgICAgICAgaWYgKF90aGlzLmhvbGRpbmdCbG9jaykge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZHMgdG8gZHJvcCBvbmx5IHVuZGVyIGNlcnRhaW4gY29uZGl0aW9uc1xuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gMm5kIGRyb3A6IHBsYWNlaG9sZGVyIGZvciBub3cgKHN0YXlzIGluIHBsYWNlIHdoaWxlIGRyb3BwaW5nIHRvbylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFBoYXNlIDM6IENvbGxlY3QgYmxvY2tzIChUT0RPKVxuICAgICAgICAgICAgLy8gUGhhc2UgNDogQnVpbGQgc3RhaXJjYXNlIHRvIHRyZWFzdXJlIChUT0RPKVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBUcmF2ZXJzZSBtYXAgYnkgYWRkaW5nIHRvIHRvVmlzaXQgKERGUz8pXG4gICAgU3RhY2tlci5wcm90b3R5cGUudHJhdmVyc2VNYXAgPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICB2YXIgY2FuTW92ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgbmVpZ2hib3JzID0gW1xuICAgICAgICAgICAgeyBkaXI6IGNlbGwudXAsIGR4OiAwLCBkeTogLTEgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLmxlZnQsIGR4OiAtMSwgZHk6IDAgfSxcbiAgICAgICAgICAgIHsgZGlyOiBjZWxsLmRvd24sIGR4OiAwLCBkeTogMSB9LFxuICAgICAgICAgICAgeyBkaXI6IGNlbGwucmlnaHQsIGR4OiAxLCBkeTogMCB9LFxuICAgICAgICBdO1xuICAgICAgICAvLyBBZGQgdmFsaWQgbmVpZ2hib3JzIHRvIHRvVmlzaXQgc3RhY2sgZm9yIHRyYXZlcnNhbCwgY2hlY2sgZm9yIHRvd2VyIHRvb1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIG5laWdoYm9yc18xID0gbmVpZ2hib3JzOyBfaSA8IG5laWdoYm9yc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIG4gPSBuZWlnaGJvcnNfMVtfaV07XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja05laWdoYm9ycyhjZWxsLCBuLmRpciwgbi5keCwgbi5keSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgbi5keCxcbiAgICAgICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBuLmR5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIC8vIFRvd2VyIGxvY2F0ZWQgc29tZXdoZXJlIGluIGNlbGwncyBpbW1lZC4gbmVpZ2hib3JpbmcgY2VsbHMuLi5cbiAgICAgICAgICAgIHRoaXMuaG9sZGluZ0Jsb2NrID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRFJPUCcpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBGaXJzdCBkcm9wOiBwbGFjZWhvbGRlciBmb3Igbm93IHRvIGV4aXQgZWFybHksIHRyb2xsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgICAgICAgIHRoaXMuYmFja3RyYWNrSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudC54ID09PSAwICYmIHRoaXMuY3VycmVudC55ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZWFjaGVkIHJ1bidzIGVuZCB3aXRob3V0IGZpbmRpbmcgdG93ZXJcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSB3ZSBqdXN0IGNhbnQgbW92ZSB0byB2YWxpZCBjZWxscywgc28gYmFja3RyYWNrXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5iYWNrdHJhY2tBY3Rpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gQmVnaW4gYmFja3RyYWNraW5nIGlmIHN0dWNrIGZvciBhbnkgcmVhc29uXG4gICAgU3RhY2tlci5wcm90b3R5cGUuYmFja3RyYWNrQWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJhY2t0cmFja0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAvLyB4IGFuZCB5IGRpcmVjdGlvbiB0byBiYWNrdHJhY2sgdG86XG4gICAgICAgIHRoaXMucGF0aC5wb3AoKTtcbiAgICAgICAgdmFyIHhEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnggLSB0aGlzLmN1cnJlbnQueDtcbiAgICAgICAgdmFyIHlEaXJlY3Rpb24gPSB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnkgLSB0aGlzLmN1cnJlbnQueTtcbiAgICAgICAgaWYgKHlEaXJlY3Rpb24gPCAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayBeJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHlEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayB2Jyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIDwtJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkxFRlQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeERpcmVjdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIC0+Jyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vdGhpbmcgdG8gYmFja3RyYWNrIHRvJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLkRST1A7IC8vIHBsYWNlaG9sZGVyIGZvciBub3csIHRyb2xsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIERlcml2ZXMgbmV4dCBBY3Rpb24gYmFzZWQgb24gb3VyIGNvb3JkaW5hdGVzIChjb3VsZCByZW1vdmUgdGhpcy5vcmlnaW4gc2luY2UgYWx3YXlzIDApOlxuICAgIFN0YWNrZXIucHJvdG90eXBlLmdldE5leHRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB4ID0gdGhpcy5vcmlnaW4ueCAtIHRoaXMuY3VycmVudC54ICsgdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXS54OyAvLyBsYXN0IHRvVmlzaXQgZHVlIHRvIHVzaW5nIHBvcCgpXG4gICAgICAgIHZhciB5ID0gdGhpcy5vcmlnaW4ueSAtIHRoaXMuY3VycmVudC55ICsgdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXS55O1xuICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgIC8vIGxlZnQ6IC0xeFxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHggPiAwKSB7XG4gICAgICAgICAgICAvLyByaWdodDogKzF4XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPCAwKSB7XG4gICAgICAgICAgICAvLyB1cDogLTF5XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPiAwKSB7XG4gICAgICAgICAgICAvLyBkb3duOiArMXlcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFdoZW4geD0wIGFuZCB5PTAgd2hlbiB2aXNpdGVkIGFsbCBjZWxscyBvbiBtYXBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBuZXh0IGFjdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBBZGQgdG8gZXhwbG9yZWQgYW5kIHBhdGggbGlzdCBpZiBub3QgYWxyZWFkeSBpbiB0aGVyZVxuICAgIFN0YWNrZXIucHJvdG90eXBlLnVwZGF0ZVBhdGggPSBmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUueCA9PT0gcG9zaXRpb24ueCAmJiBlLnkgPT09IHBvc2l0aW9uLnk7IH0pKSB7XG4gICAgICAgICAgICB0aGlzLmV4cGxvcmVkLnB1c2goX19hc3NpZ24oe30sIHBvc2l0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnBhdGguc29tZShmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS54ID09PSBwb3NpdGlvbi54ICYmIGUueSA9PT0gcG9zaXRpb24ueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aC5wdXNoKF9fYXNzaWduKHt9LCBwb3NpdGlvbikpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBGaW5kIHdoaWNoIG5laWdoYm9ycyBhcmUgdmFsaWQgdG8gbW92ZSB0byAobm90IHdhbGwsIG5vdCB2aXNpdGVkLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIC8vIGFzIHdlbGwgYXMgaWYgYW55IGFyZSBhIHRvd2VyIGFzIHdlbGxcbiAgICBTdGFja2VyLnByb3RvdHlwZS5jaGVja05laWdoYm9ycyA9IGZ1bmN0aW9uIChjZWxsLCAvLyBjdXJyZW50IGNlbGxcbiAgICBkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBjdXJyZW50IHNob3VsZCA9PT0gY2VsbFxuICAgICAgICBpZiAoZGlyZWN0aW9uLnR5cGUgIT09IENlbGxUeXBlXzEuQ2VsbFR5cGUuV0FMTCAmJlxuICAgICAgICAgICAgIXRoaXMucGF0aC5zb21lKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgcC55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pICYmXG4gICAgICAgICAgICAhdGhpcy5leHBsb3JlZC5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUueCA9PT0gX3RoaXMuY3VycmVudC54ICsgZHggJiYgZS55ID09PSBfdGhpcy5jdXJyZW50LnkgKyBkeTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudG93ZXJMb2NhdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihkaXJlY3Rpb24sIGR4LCBkeSk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGlyZWN0aW9uLmxldmVsIC0gY2VsbC5sZXZlbCkgPD0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFRPRE86IHdoYXQgYWJvdXQgZm9yIENlbGxUeXBlLkdPTEQ/XG4gICAgfTtcbiAgICAvLyBDaGVjayBpZiB0b3dlciBpcyBmb3VuZCBhbmQgdXBkYXRlIGl0cyBsb2NhdGlvblxuICAgIFN0YWNrZXIucHJvdG90eXBlLmZpbmRUb3dlciA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGR4LCBkeSkge1xuICAgICAgICBpZiAoZGlyZWN0aW9uLmxldmVsID09PSA4ICYmICF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmN1cnJlbnQueCArIGR4LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuY3VycmVudC55ICsgZHksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gU3RhY2tlcjtcbn0oKSk7XG53aW5kb3cuU3RhY2tlciA9IFN0YWNrZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQWN0aW9uID0gdm9pZCAwO1xuLy8gVGhpcyBpcyB0aGUgbGlzdCBvZiBhY3Rpb25zIHRoYXQgdGhlIFN0YWNrZXIgY2FuIHRha2VcbnZhciBBY3Rpb247XG4oZnVuY3Rpb24gKEFjdGlvbikge1xuICAgIEFjdGlvbltcIkxFRlRcIl0gPSBcImxlZnRcIjtcbiAgICBBY3Rpb25bXCJVUFwiXSA9IFwidXBcIjtcbiAgICBBY3Rpb25bXCJSSUdIVFwiXSA9IFwicmlnaHRcIjtcbiAgICBBY3Rpb25bXCJET1dOXCJdID0gXCJkb3duXCI7XG4gICAgQWN0aW9uW1wiUElDS1VQXCJdID0gXCJwaWNrdXBcIjtcbiAgICBBY3Rpb25bXCJEUk9QXCJdID0gXCJkcm9wXCI7XG59KShBY3Rpb24gfHwgKGV4cG9ydHMuQWN0aW9uID0gQWN0aW9uID0ge30pKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5DZWxsVHlwZSA9IHZvaWQgMDtcbnZhciBDZWxsVHlwZTtcbihmdW5jdGlvbiAoQ2VsbFR5cGUpIHtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkVNUFRZXCJdID0gMF0gPSBcIkVNUFRZXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJXQUxMXCJdID0gMV0gPSBcIldBTExcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkJMT0NLXCJdID0gMl0gPSBcIkJMT0NLXCI7XG4gICAgQ2VsbFR5cGVbQ2VsbFR5cGVbXCJHT0xEXCJdID0gM10gPSBcIkdPTERcIjtcbn0pKENlbGxUeXBlIHx8IChleHBvcnRzLkNlbGxUeXBlID0gQ2VsbFR5cGUgPSB7fSkpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL1N0YWNrZXIudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=