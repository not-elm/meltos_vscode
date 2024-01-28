"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useScm = exports.ScmContext = void 0;
const useChanges_ts_1 = require("./changes/useChanges.ts");
const react_1 = __importStar(require("react"));
exports.ScmContext = react_1.default.createContext({
    changes: [],
    stages: [],
    stage: () => { },
    unStage: () => { },
});
const useScm = () => {
    const { changes, setChanges, feedChange, remove } = (0, useChanges_ts_1.useChanges)();
    const [stages, $stages] = (0, react_1.useState)([]);
    const stagesRef = (0, react_1.useRef)([]); //  ref オブジェクト作成する
    stagesRef.current = stages; // countを.currentプロパティへ保持する
    const feedChangeRef = (0, react_1.useRef)(null);
    feedChangeRef.current = feedChange;
    let vscodeApi = (0, react_1.useMemo)(() => {
        // @ts-ignore
        return acquireVsCodeApi();
    }, []);
    (0, react_1.useEffect)(() => {
        const onMessage = (e) => {
            switch (e.data?.type) {
                case "initial":
                    $stages(() => e.data.stages);
                    setChanges(() => e.data.changes);
                    break;
                case "change":
                    feedChangeRef.current?.(e.data.meta);
                    break;
                case "staged":
                    const meta = e.data.meta;
                    remove(meta);
                    $stages(() => [
                        ...stagesRef.current.filter((m) => m.filePath !== meta.filePath),
                        meta,
                    ]);
                    break;
                case "unStaged":
                    const meta2 = e.data.meta;
                    $stages(() => stagesRef.current.filter((m) => m.filePath !== meta2.filePath));
                    feedChange(meta2);
            }
        };
        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);
    return {
        changes,
        stages,
        stage: (meta) => {
            vscodeApi.postMessage({
                type: "stage",
                meta,
            });
        },
        unStage: (meta) => {
            vscodeApi.postMessage({
                type: "unStage",
                meta,
            });
        },
    };
};
exports.useScm = useScm;
//# sourceMappingURL=useScm.js.map