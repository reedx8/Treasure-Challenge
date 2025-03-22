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
        this.backtrack = {
            inProgress: false,
        };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGFBQWEsY0FBYyxjQUFjOzs7Ozs7Ozs7OztBQ1o3QjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxlQUFlLGdCQUFnQixnQkFBZ0I7Ozs7Ozs7VUNUaEQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9TdGFja2VyLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQWN0aW9uLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQ2VsbFR5cGUudHMiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vdHJlYXN1cmUtaHVudGVyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8qXG4zIG1haW4gYWxnb3MgdG8gZmluZDpcbjEuIHRyYXZlcnNhbCBhbGdvIChkb25lKVxuICAgIC0gbmVlZHMgYmFja3RyYWNraW5nIHRvbyAoZG9uZSlcbiAgICAtIHNhdmUgdG93ZXIgbG9jYXRpb24gKGRvbmUpXG4yLiBjb2xsZWN0IGJsb2NrcyBhbGdvIChjYW4ganVzdCBwb3Agb2ZmIHBhdGhbXSBmb3Igbm93KVxuMy4gYnVpbGQgc3RhaXJjYXNlIGFsZ29cbiAgICAtIGFsaWduICgoaC0xKShoKSkvMiAgYmxvY2tzIGluIHRvdGFsICh3aGVyZSBoID0gdG93ZXIgaGVpZ2h0KVxuXG5cbi0gRWFjaCBydW4gaGFzIHNldmVyYWwgcGF0aHMgY3JlYXRlZCAtLSBwYXRoW10gY2xlYXJlZCBlYWNoIHRpbWUgdHJvbGwgYXQgdG93ZXJcbi0gZXhwbG9yZWQgaXMgYSBsaXN0IG9mIGFsbCBleHBsb3JlZCBjZWxscyBpbiBydW4sIG5ldmVyIHRvIGJlIHJlc2V0IGluIGEgc2luZ2xlIHJ1bi5cbi0gUHJvZ3JhbSB3aWxsIGNvbnNvbGUubG9nKCk6IGJhY2t0cmFjayBkaXJlY3Rpb24gKGlmIG5lZWRlZCksIHBpY2t1cC9kcm9wLCBhbmQgdG93ZXIgbG9jYXRpb25cbiovXG52YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEFjdGlvbl8xID0gcmVxdWlyZShcIi4vbGliL0FjdGlvblwiKTtcbnZhciBDZWxsVHlwZV8xID0gcmVxdWlyZShcIi4vbGliL0NlbGxUeXBlXCIpO1xudmFyIFN0YWNrZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3RhY2tlcigpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50cmVhc3VyZUZvdW5kID0gZmFsc2U7IC8vIGlmIHdlIGhhdmUgZm91bmQgdGhlIHRyZWFzdXJlIG9uIG1hcCAobm90IHVzZWQpXG4gICAgICAgIHRoaXMudG93ZXJMb2NhdGlvbiA9IG51bGw7IC8vIHgseSBsb2NhdGlvbiBvZiB0b3dlciBvbiBtYXBcbiAgICAgICAgdGhpcy5ob2xkaW5nQmxvY2sgPSBmYWxzZTsgLy8gaWYgd2UgYXJlIGhvbGRpbmcgYSBibG9ja1xuICAgICAgICB0aGlzLmV4cGxvcmVkID0gW107IC8vIGxpc3Qgb2YgYWxsIGNlbGxzIHZpc2l0ZWQgaW4gam91cm5leS9wYXRoLCBuZXZlciByZW1vdmVkICh1c2luZyBzZXQgd291bGQgcHJvYmFibHkgYmUgYmV0dGVyIGxvb2t1cCB0aW1lIGlmIGV2ZXIgbmVlZGVkKVxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsOyAvLyBjdXJyZW50IHgseSBwb3NpdGlvbiBvbiBtYXBcbiAgICAgICAgdGhpcy5vcmlnaW4gPSB7IHg6IDAsIHk6IDAgfTsgLy8gb3JvZ2luIGNlbGwgb2YgZW50aXJlIGNvb3JkaW5hdGUgc3lzdGVtXG4gICAgICAgIHRoaXMuYmFja3RyYWNrID0ge1xuICAgICAgICAgICAgaW5Qcm9ncmVzczogZmFsc2UsXG4gICAgICAgIH07XG4gICAgICAgIC8vIHVzaW5nIHRoZSB0cmlhbmd1bGFyIG51bWJlciBmb3JtdWxhOiAoaC0xKWgvMiAoOCBoYXJkY29kZWQgZm9yIG5vdyBzaW5jZSBvbmx5IGV2ZXIgc2VlbiA4IGxldmVsIHRvd2Vycy4gaCA9IHRvd2VyIGhlaWdodClcbiAgICAgICAgLy8gcHJpdmF0ZSBzdGFpcmNhc2VUb3RhbCA9IE1hdGguYWJzKCg4IC0gMSkgKiA4KSAvIDI7IC8vIChub3QgdXNlZCB0byBrZWVwIHNpbXBsZSkgdG90YWwgbnVtYmVyIG9mIGJsb2NrcyByZXF1aXJlZCB0byBidWlsZCBzdGFpcmNhc2VcbiAgICAgICAgdGhpcy5zdGFpcmNhc2VUb3RhbCA9IDM7IC8vIGR1bW15IHZhbHVlIGZvciBub3cgKHRvIGtlZXAgaXQgc2ltcGxlKVxuICAgICAgICAvLyBGb3IgQkZTL0RGUyB0cmF2ZXJzYWwgYW5kIGJhY2t0cmFja2luZ1xuICAgICAgICB0aGlzLnBhdGggPSBbXTsgLy8gVGhlIHBhdGggYWN0dWFsbHkgdGFrZW4gdGh1cyBmYXIgZm9yIGVhY2ggam91cm5leS9ydW4gKHVzaW5nIHNldCB3b3VsZCBwcm9iYWJseSBiZSBiZXR0ZXIgbG9va3VwIHRpbWUgaWYgbmVlZGVkKVxuICAgICAgICB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gbGlzdCBvZiBjZWxscyB0byB2aXNpdCBuZXh0XG4gICAgICAgIHRoaXMudHVybiA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgICAgICAgICBpZiAoY2VsbC50eXBlID09PSBDZWxsVHlwZV8xLkNlbGxUeXBlLkJMT0NLICYmXG4gICAgICAgICAgICAgICAgIV90aGlzLmhvbGRpbmdCbG9jayAmJlxuICAgICAgICAgICAgICAgICFfdGhpcy50b3dlckxvY2F0aW9uIC8vIFRPRE86IHNob3VsZCBiZSBhYmxlIHRvIHBpY2sgdXAgYmxvY2sgd2hlbiB0b3dlciBpcyBmb3VuZCB0b28gb2J2LCBidXQgYXZvaWRzIG5ldmVyLWVuZGluZyBwaWNrdXAvZHJvcCBsb29wIGF0IGVuZCBmb3Igbm93XG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBHcmVlZHkgcGlja3VwXG4gICAgICAgICAgICAgICAgX3RoaXMuaG9sZGluZ0Jsb2NrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUElDS1VQJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5QSUNLVVA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQaGFzZSAxOiBVcGRhdGUgcG9zaXRpb24gYW5kIHRyYXZlcnNlIG1hcCBmb3IgdG93ZXIgKGJhY2t0cmFjayBpZiBuZWMuKS5cbiAgICAgICAgICAgIGlmIChfdGhpcy5jdXJyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gYXQgYmVnaW5uaW5nIG9mIHJ1blxuICAgICAgICAgICAgICAgIF90aGlzLmN1cnJlbnQgPSBfX2Fzc2lnbih7fSwgX3RoaXMub3JpZ2luKTtcbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICAgIC8vICAgICAnY3VycmVudCAoYmVnaW4pOiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueVxuICAgICAgICAgICAgICAgIC8vICk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnRyYXZlcnNlTWFwKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIV90aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuYmFja3RyYWNrLmluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnBhdGgucG9wKCk7IC8vIHNob3VsZCBzeW5jIHdpdGggY2VsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3VycmVudCA9IF90aGlzLnRvVmlzaXQucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMudXBkYXRlUGF0aCh0aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfdGhpcy51cGRhdGVQYXRoKF90aGlzLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdjdXJyZW50OiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jdXJyZW50ID0gdGhpcy50b1Zpc2l0LnBvcCgpOyAvLyBUaGlzIHdvbnQgd29yayBvbiBpdHMgb3duIGFzIHdlIHdhbnQgaXQgd2hlbiBzdHVjay9zaG91bGQgYmFja3RyYWNrIGFuZCB3aWxsIGNvbnRpbnVlIHB1bGxpbmcgZnJvbSB0b1Zpc2l0IGF0IHRob3NlIHBvaW50c1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy50cmF2ZXJzZU1hcChjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFBoYXNlIDI6IFRvd2VyIGxvY2F0ZWRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnU1RPUCB8IHRvd2VyIGZvdW5kOiAnICtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudG93ZXJMb2NhdGlvbi54ICtcbiAgICAgICAgICAgICAgICAgICAgJywnICtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMudG93ZXJMb2NhdGlvbi55KTtcbiAgICAgICAgICAgICAgICBpZiAoX3RoaXMuaG9sZGluZ0Jsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEUk9QJyk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUT0RPXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5wYXRoID0gW107IC8vIHJlc2V0IHBhdGhcbiAgICAgICAgICAgICAgICAvLyB0aGlzLnRvVmlzaXQgPSBbXTsgLy8gcmVzZXQgdG9WaXNpdFxuICAgICAgICAgICAgICAgIC8vIHJldHVybiB0aGlzLnRyYXZlcnNlTWFwKGNlbGwpOyAvLyB0cmF2ZXJzZSBtYXAgYWdhaW5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBuZWVkcyB0byBkcm9wIG9ubHkgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyAybmQgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyAoc3RheXMgaW4gcGxhY2Ugd2hpbGUgZHJvcHBpbmcgdG9vKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGhhc2UgMzogQ29sbGVjdCBibG9ja3NcbiAgICAgICAgICAgIC8vIFBoYXNlIDQ6IEJ1aWxkIHN0YWlyY2FzZSB0byB0cmVhc3VyZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyB0cmF2ZXJzZSBtYXAgYnkgYWRkaW5nIHRvIHRvVmlzaXQgKEJGUz8pXG4gICAgU3RhY2tlci5wcm90b3R5cGUudHJhdmVyc2VNYXAgPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAvLyBsZXQgdHJhdmVyc2VkRW50aXJlTWFwID0gNDtcbiAgICAgICAgdmFyIGNhbk1vdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKCF0aGlzLnRvd2VyTG9jYXRpb24pIHtcbiAgICAgICAgICAgIC8vIG9ubHkgZmluZCB0b3dlciBvbmNlXG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLnVwLCAwLCAtMSk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLmxlZnQsIC0xLCAwKTtcbiAgICAgICAgICAgIHRoaXMuZmluZFRvd2VyKGNlbGwuZG93biwgMCwgMSk7XG4gICAgICAgICAgICB0aGlzLmZpbmRUb3dlcihjZWxsLnJpZ2h0LCAxLCAwKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBZGQgdG8gdG9WaXNpdCBzdGFjayBpZiB2YWxpZCBjZWxsIGluIG9yZGVyIHRvIHRyYXZlcnNlIG1hcFxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQ2VsbChjZWxsLCBjZWxsLnVwLCAwLCAtMSkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LngsIHk6IHRoaXMuY3VycmVudC55IC0gMSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3VwJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5sZWZ0LCAtMSwgMCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LnggLSAxLCB5OiB0aGlzLmN1cnJlbnQueSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2xlZnQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkQ2VsbChjZWxsLCBjZWxsLmRvd24sIDAsIDEpKSB7XG4gICAgICAgICAgICB0aGlzLnRvVmlzaXQucHVzaCh7IHg6IHRoaXMuY3VycmVudC54LCB5OiB0aGlzLmN1cnJlbnQueSArIDEgfSk7XG4gICAgICAgICAgICBjYW5Nb3ZlID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdkb3duJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZENlbGwoY2VsbCwgY2VsbC5yaWdodCwgMSwgMCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9WaXNpdC5wdXNoKHsgeDogdGhpcy5jdXJyZW50LnggKyAxLCB5OiB0aGlzLmN1cnJlbnQueSB9KTtcbiAgICAgICAgICAgIGNhbk1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ3JpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgLy8gVG93ZXIgbGNhdGVkIHNvbWV3aGVyZSBpbiBjZWxsJ3MgaW1tZWQuIG5laWdoYm9yaW5nIGNlbGxzLi4uXG4gICAgICAgICAgICB0aGlzLmhvbGRpbmdCbG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RST1AnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRFJPUDsgLy8gRmlyc3QgZHJvcDogcGxhY2Vob2xkZXIgZm9yIG5vdyB0byBleGl0IGVhcmx5LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICB9XG4gICAgICAgIGlmIChjYW5Nb3ZlKSB7XG4gICAgICAgICAgICB0aGlzLmJhY2t0cmFjay5pblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROZXh0QWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY2FudCBtb3ZlOiAnICsgdGhpcy5jdXJyZW50LnggKyAnLCcgKyB0aGlzLmN1cnJlbnQueSk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50LnggPT09IDAgJiYgdGhpcy5jdXJyZW50LnkgPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRW5kIG9mIGpvdXJuZXkvcnVuJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QOyAvLyBwbGFjZWhvbGRlciBmb3Igbm93LCB0cm9sbCBzdGF5cyBpbiBwbGFjZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3RyYWNrQWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuZ2V0TmV4dEFjdGlvbigpOyAvLyBERlMgZHVlIHRvIHBvcCgpP1xuICAgIH07XG4gICAgU3RhY2tlci5wcm90b3R5cGUuZmluZFRvd2VyID0gZnVuY3Rpb24gKGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIGlmIChkaXJlY3Rpb24ubGV2ZWwgPT09IDggJiYgIXRoaXMudG93ZXJMb2NhdGlvbikge1xuICAgICAgICAgICAgdGhpcy50b3dlckxvY2F0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMuY3VycmVudC54ICsgZHgsXG4gICAgICAgICAgICAgICAgeTogdGhpcy5jdXJyZW50LnkgKyBkeSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIEJlZ2luIGJhY2t0cmFja2luZ1xuICAgIFN0YWNrZXIucHJvdG90eXBlLmJhY2t0cmFja0FjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrdHJhY2suaW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgIC8vIHggYW5kIHkgZGlyZWN0aW9uIHRvIGJhY2t0cmFjayB0bzpcbiAgICAgICAgdGhpcy5wYXRoLnBvcCgpO1xuICAgICAgICB2YXIgeERpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueCAtIHRoaXMuY3VycmVudC54O1xuICAgICAgICB2YXIgeURpcmVjdGlvbiA9IHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueSAtIHRoaXMuY3VycmVudC55O1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcbiAgICAgICAgLy8gICAgICdwcmV2IHBhdGg6ICcgK1xuICAgICAgICAvLyAgICAgICAgIHRoaXMucGF0aC5zbGljZSgtMSlbMF0ueCArXG4gICAgICAgIC8vICAgICAgICAgJywnICtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnBhdGguc2xpY2UoLTEpWzBdLnlcbiAgICAgICAgLy8gKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2N1cnJlbnQgKGJ0KTogJyArIHRoaXMuY3VycmVudC54ICsgJywnICsgdGhpcy5jdXJyZW50LnkpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygneERpcmVjdGlvbjogJyArIHhEaXJlY3Rpb24pO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygneURpcmVjdGlvbjogJyArIHlEaXJlY3Rpb24pO1xuICAgICAgICBpZiAoeURpcmVjdGlvbiA8IDApIHtcbiAgICAgICAgICAgIC8vIHRoaXMuYmFja3RyYWNrLnVwID0gTWF0aC5hYnMoeURpcmVjdGlvbik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayBeJyk7XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHlEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5kb3duID0geURpcmVjdGlvbjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnbyBiYWNrIHYnKTtcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh4RGlyZWN0aW9uIDwgMCkge1xuICAgICAgICAgICAgLy8gdGhpcy5iYWNrdHJhY2subGVmdCA9IHhEaXJlY3Rpb247XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayA8LScpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHhEaXJlY3Rpb24gPiAwKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmJhY2t0cmFjay5yaWdodCA9IHhEaXJlY3Rpb247XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZ28gYmFjayAtPicpO1xuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdub3RoaW5nIHRvIGJhY2t0cmFjayB0bycpO1xuICAgICAgICAgICAgLy8gVE9ETzogc2hvdWxkIHJldHVybiBhbiBhY3Rpb24gaGVyZVxuICAgICAgICB9XG4gICAgfTtcbiAgICBTdGFja2VyLnByb3RvdHlwZS5nZXROZXh0QWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBkZXJpdmVzIG5leHQgQWN0aW9uIGJhc2VkIG9uIG91ciBjb29yZGluYXRlcyAoY291bGQgcmVtb3ZlIG9yaWdpbiBzaW5jZSBhbHdheXMgMCk6XG4gICAgICAgIHZhciB4ID0gdGhpcy5vcmlnaW4ueCAtIHRoaXMuY3VycmVudC54ICsgdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXS54OyAvLyBsYXN0IHRvVmlzaXQgZHVlIHRvIHVzaW5nIHBvcCgpXG4gICAgICAgIHZhciB5ID0gdGhpcy5vcmlnaW4ueSAtIHRoaXMuY3VycmVudC55ICsgdGhpcy50b1Zpc2l0LnNsaWNlKC0xKVswXS55O1xuICAgICAgICBpZiAoeCA8IDApIHtcbiAgICAgICAgICAgIC8vIGxlZnQ6IC0xeFxuICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5MRUZUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHggPiAwKSB7XG4gICAgICAgICAgICAvLyByaWdodDogKzF4XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlJJR0hUO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPCAwKSB7XG4gICAgICAgICAgICAvLyB1cDogLTF5XG4gICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlVQO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHkgPiAwKSB7XG4gICAgICAgICAgICAvLyBkb3duOiArMXlcbiAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uRE9XTjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRPRE86IHg9MCBhbmQgeT0wIHdoZW4gdmlzaXRlZCBhbGwgY2VsbHMgb24gbWFwXG4gICAgICAgICAgICAvLyB0aGlzLnRvVmlzaXQucG9wKCk7XG4gICAgICAgICAgICAvLyB0aGlzLmRvbmVWaXNpdGluZyA9IHRydWU7XG4gICAgICAgICAgICAvLyByZXR1cm4gQWN0aW9uLlBJQ0tVUDsgLy8gcGxhY2Vob2xkZXIgZm9yIG5vdyAsIHN0YXlzIGluIHBsYWNlXG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vIGFkZCB0byBleHBsb3JlZCBhbmQgcGF0aCBsaXN0IGlmIG5vdCBhbHJlYWR5IGluIHRoZXJlXG4gICAgU3RhY2tlci5wcm90b3R5cGUudXBkYXRlUGF0aCA9IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICBpZiAoIXRoaXMuZXhwbG9yZWQuc29tZShmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS54ID09PSBwb3NpdGlvbi54ICYmIGUueSA9PT0gcG9zaXRpb24ueTsgfSkpIHtcbiAgICAgICAgICAgIHRoaXMuZXhwbG9yZWQucHVzaChfX2Fzc2lnbih7fSwgcG9zaXRpb24pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucGF0aC5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnggPT09IHBvc2l0aW9uLnggJiYgZS55ID09PSBwb3NpdGlvbi55OyB9KSkge1xuICAgICAgICAgICAgdGhpcy5wYXRoLnB1c2goX19hc3NpZ24oe30sIHBvc2l0aW9uKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2N1cnJlbnQ6ICcgKyB0aGlzLmN1cnJlbnQueCArICcsJyArIHRoaXMuY3VycmVudC55KTtcbiAgICB9O1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIEZpbmQgd2hpY2ggbmVpZ2hib3JzIGFyZSB2YWxpZCB0byBtb3ZlIHRvIChpZiBub3Qgd2FsbCwgbm90IGFscmVhZHkgdmlzaXRlZCBpbiBwYXRoLCBhbmQgMSBsZXZlbCBhd2F5KVxuICAgIFN0YWNrZXIucHJvdG90eXBlLmlzVmFsaWRDZWxsID0gZnVuY3Rpb24gKGNlbGwsIC8vIGN1cnJlbnQgY2VsbFxuICAgIGRpcmVjdGlvbiwgZHgsIGR5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIC8vIGN1cnJlbnQgc2hvdWxkID09PSBjZWxsXG4gICAgICAgIGlmIChkaXJlY3Rpb24udHlwZSAhPT0gQ2VsbFR5cGVfMS5DZWxsVHlwZS5XQUxMICYmXG4gICAgICAgICAgICBNYXRoLmFicyhkaXJlY3Rpb24ubGV2ZWwgLSBjZWxsLmxldmVsKSA8PSAxICYmXG4gICAgICAgICAgICAhdGhpcy5wYXRoLnNvbWUoZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdi54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiB2LnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkgJiZcbiAgICAgICAgICAgICF0aGlzLmV4cGxvcmVkLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZS54ID09PSBfdGhpcy5jdXJyZW50LnggKyBkeCAmJiBlLnkgPT09IF90aGlzLmN1cnJlbnQueSArIGR5O1xuICAgICAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gVE9ETzogd2hhdCBhYm91dCBmb3IgQ2VsbFR5cGUuR09MRD9cbiAgICB9O1xuICAgIHJldHVybiBTdGFja2VyO1xufSgpKTtcbndpbmRvdy5TdGFja2VyID0gU3RhY2tlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BY3Rpb24gPSB2b2lkIDA7XG4vLyBUaGlzIGlzIHRoZSBsaXN0IG9mIGFjdGlvbnMgdGhhdCB0aGUgU3RhY2tlciBjYW4gdGFrZVxudmFyIEFjdGlvbjtcbihmdW5jdGlvbiAoQWN0aW9uKSB7XG4gICAgQWN0aW9uW1wiTEVGVFwiXSA9IFwibGVmdFwiO1xuICAgIEFjdGlvbltcIlVQXCJdID0gXCJ1cFwiO1xuICAgIEFjdGlvbltcIlJJR0hUXCJdID0gXCJyaWdodFwiO1xuICAgIEFjdGlvbltcIkRPV05cIl0gPSBcImRvd25cIjtcbiAgICBBY3Rpb25bXCJQSUNLVVBcIl0gPSBcInBpY2t1cFwiO1xuICAgIEFjdGlvbltcIkRST1BcIl0gPSBcImRyb3BcIjtcbn0pKEFjdGlvbiB8fCAoZXhwb3J0cy5BY3Rpb24gPSBBY3Rpb24gPSB7fSkpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkNlbGxUeXBlID0gdm9pZCAwO1xudmFyIENlbGxUeXBlO1xuKGZ1bmN0aW9uIChDZWxsVHlwZSkge1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiRU1QVFlcIl0gPSAwXSA9IFwiRU1QVFlcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIldBTExcIl0gPSAxXSA9IFwiV0FMTFwiO1xuICAgIENlbGxUeXBlW0NlbGxUeXBlW1wiQkxPQ0tcIl0gPSAyXSA9IFwiQkxPQ0tcIjtcbiAgICBDZWxsVHlwZVtDZWxsVHlwZVtcIkdPTERcIl0gPSAzXSA9IFwiR09MRFwiO1xufSkoQ2VsbFR5cGUgfHwgKGV4cG9ydHMuQ2VsbFR5cGUgPSBDZWxsVHlwZSA9IHt9KSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvU3RhY2tlci50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==