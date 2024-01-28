"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockButton = void 0;
const MockButton = () => {
    return (<button onClick={() => {
            window.postMessage({
                type: "change",
                meta: {
                    filePath: `workspace/${Date.now()}.txt`,
                }
            }, "*");
        }}>TEST</button>);
};
exports.MockButton = MockButton;
//# sourceMappingURL=MockButton.js.map