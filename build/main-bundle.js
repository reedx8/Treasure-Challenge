/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!************************!*\
  !*** ./src/Stacker.ts ***!
  \************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
var Action_1 = __webpack_require__(/*! ./lib/Action */ "./src/lib/Action.ts");
var Stacker = /** @class */ (function () {
    function Stacker() {
        this.turn = function (cell) {
            // Pick an action randomly
            // replace this with your own logic
            var n = Math.random() * 6 >> 0;
            if (n == 0)
                return Action_1.Action.LEFT;
            if (n == 1)
                return Action_1.Action.UP;
            if (n == 2)
                return Action_1.Action.RIGHT;
            if (n == 3)
                return Action_1.Action.DOWN;
            if (n == 4)
                return Action_1.Action.PICKUP;
            if (n == 5)
                return Action_1.Action.DROP;
        };
    }
    return Stacker;
}());
window.Stacker = Stacker;

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFhO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLGFBQWEsY0FBYyxjQUFjOzs7Ozs7O1VDWjFDO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7Ozs7Ozs7QUN0QmE7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZUFBZSxtQkFBTyxDQUFDLHlDQUFjO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCIsInNvdXJjZXMiOlsid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci8uL3NyYy9saWIvQWN0aW9uLnRzIiwid2VicGFjazovL3RyZWFzdXJlLWh1bnRlci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90cmVhc3VyZS1odW50ZXIvLi9zcmMvU3RhY2tlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQWN0aW9uID0gdm9pZCAwO1xuLy8gVGhpcyBpcyB0aGUgbGlzdCBvZiBhY3Rpb25zIHRoYXQgdGhlIFN0YWNrZXIgY2FuIHRha2VcbnZhciBBY3Rpb247XG4oZnVuY3Rpb24gKEFjdGlvbikge1xuICAgIEFjdGlvbltcIkxFRlRcIl0gPSBcImxlZnRcIjtcbiAgICBBY3Rpb25bXCJVUFwiXSA9IFwidXBcIjtcbiAgICBBY3Rpb25bXCJSSUdIVFwiXSA9IFwicmlnaHRcIjtcbiAgICBBY3Rpb25bXCJET1dOXCJdID0gXCJkb3duXCI7XG4gICAgQWN0aW9uW1wiUElDS1VQXCJdID0gXCJwaWNrdXBcIjtcbiAgICBBY3Rpb25bXCJEUk9QXCJdID0gXCJkcm9wXCI7XG59KShBY3Rpb24gfHwgKGV4cG9ydHMuQWN0aW9uID0gQWN0aW9uID0ge30pKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBBY3Rpb25fMSA9IHJlcXVpcmUoXCIuL2xpYi9BY3Rpb25cIik7XG52YXIgU3RhY2tlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBTdGFja2VyKCkge1xuICAgICAgICB0aGlzLnR1cm4gPSBmdW5jdGlvbiAoY2VsbCkge1xuICAgICAgICAgICAgLy8gUGljayBhbiBhY3Rpb24gcmFuZG9tbHlcbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhpcyB3aXRoIHlvdXIgb3duIGxvZ2ljXG4gICAgICAgICAgICB2YXIgbiA9IE1hdGgucmFuZG9tKCkgKiA2ID4+IDA7XG4gICAgICAgICAgICBpZiAobiA9PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBBY3Rpb25fMS5BY3Rpb24uTEVGVDtcbiAgICAgICAgICAgIGlmIChuID09IDEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5VUDtcbiAgICAgICAgICAgIGlmIChuID09IDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5SSUdIVDtcbiAgICAgICAgICAgIGlmIChuID09IDMpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5ET1dOO1xuICAgICAgICAgICAgaWYgKG4gPT0gNClcbiAgICAgICAgICAgICAgICByZXR1cm4gQWN0aW9uXzEuQWN0aW9uLlBJQ0tVUDtcbiAgICAgICAgICAgIGlmIChuID09IDUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjdGlvbl8xLkFjdGlvbi5EUk9QO1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gU3RhY2tlcjtcbn0oKSk7XG53aW5kb3cuU3RhY2tlciA9IFN0YWNrZXI7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=