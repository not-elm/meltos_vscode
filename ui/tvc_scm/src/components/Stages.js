"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageItem = exports.Stages = void 0;
const react_1 = require("react");
const x_tree_view_1 = require("@mui/x-tree-view");
const useScm_ts_1 = require("../client/useScm.ts");
const ScmItem_tsx_1 = require("./ScmItem.tsx");
require("./Stages.css");
const Stages = () => {
    const { stages } = (0, react_1.useContext)(useScm_ts_1.ScmContext);
    return (<x_tree_view_1.TreeItem nodeId={"stages"} label={"stages"} key={"stages"}>
            {stages.map(meta => (<exports.StageItem meta={meta} key={meta.filePath}/>))}
        </x_tree_view_1.TreeItem>);
};
exports.Stages = Stages;
const StageItem = ({ meta }) => {
    return (<x_tree_view_1.TreeItem nodeId={meta.filePath} label={<ScmItem_tsx_1.ScmItemText meta={meta}/>}/>);
};
exports.StageItem = StageItem;
//# sourceMappingURL=Stages.js.map