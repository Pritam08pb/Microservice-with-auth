"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = void 0;
const tryCatch = async (promise) => {
    try {
        const data = await promise;
        return [data, null];
    }
    catch (err) {
        return [null, err];
    }
};
exports.tryCatch = tryCatch;
//# sourceMappingURL=tryCatch.js.map