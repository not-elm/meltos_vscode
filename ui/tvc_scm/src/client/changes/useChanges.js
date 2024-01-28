"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChanges = void 0;
const react_1 = require("react");
const useChanges = () => {
    const [changes, $changes] = (0, react_1.useState)([]);
    return {
        changes,
        setChanges: $changes,
        feedChange: (meta) => {
            $changes(metas => [
                ...metas.filter(m => m.filePath != meta.filePath),
                meta
            ]);
        },
        remove: (meta) => {
            $changes(metas => metas.filter(m => meta.filePath !== m.filePath));
        }
    };
};
exports.useChanges = useChanges;
//# sourceMappingURL=useChanges.js.map