"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
require("./App.css");
const useScm_ts_1 = require("./client/useScm.ts");
const Changes_tsx_1 = require("./components/Changes.tsx");
const Stages_tsx_1 = require("./components/Stages.tsx");
const MockButton_tsx_1 = require("./components/MockButton.tsx");
const x_tree_view_1 = require("@mui/x-tree-view");
const icons_material_1 = require("@mui/icons-material");
const material_1 = require("@mui/material");
require("./reset.css");
// const useMockScmMessenger = () => {
//     useEffect(() => {
//         const onMessage = (e: MessageEvent) => {
//             switch (e.data.type) {
//                 case "stage":
//                     window.postMessage({
//                         type: "staged",
//                         meta: e.data.meta
//                     } as StagedMessage, "*");
//                     break;
//                 case "unStage":
//                     window.postMessage({
//                         type: "unStaged",
//                         meta: e.data.meta
//                     }, "*")
//             }
//         }
//         window.addEventListener("message", onMessage)
//         return () => {
//             window.addEventListener("message", onMessage)
//         };
//     }, [])
// }
const App = () => {
    const scm = (0, useScm_ts_1.useScm)();
    // useMockScmMessenger()
    return (<useScm_ts_1.ScmContext.Provider value={scm}>
            <material_1.Box sx={{ minHeight: 180, flexGrow: 1 }}>
                <x_tree_view_1.TreeView defaultCollapseIcon={<icons_material_1.ExpandMore height={30} width={30}/>} defaultExpandIcon={<icons_material_1.ChevronRight />}>
                    <Stages_tsx_1.Stages />
                    <Changes_tsx_1.Changes />
                </x_tree_view_1.TreeView>
                <MockButton_tsx_1.MockButton />
            </material_1.Box>
        </useScm_ts_1.ScmContext.Provider>);
};
exports.App = App;
//# sourceMappingURL=App.js.map