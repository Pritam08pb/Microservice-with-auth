"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = asyncHandler;
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=asyncHandler.js.map