"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeItem = exports.Changes = void 0;
const react_1 = require("react");
const x_tree_view_1 = require("@mui/x-tree-view");
const useScm_ts_1 = require("../client/useScm.ts");
const ScmItem_tsx_1 = require("./ScmItem.tsx");
const icons_material_1 = require("@mui/icons-material");
const css_1 = require("@emotion/css");
const Changes = () => {
    const { changes } = (0, react_1.useContext)(useScm_ts_1.ScmContext);
    return (<x_tree_view_1.TreeItem key={"changes"} nodeId={"changes"} label={"changes"}>
            {changes.map(meta => (<exports.ChangeItem meta={meta} key={meta.filePath}/>))}
        </x_tree_view_1.TreeItem>);
};
exports.Changes = Changes;
const ChangeItem = ({ meta }) => {
    return (<x_tree_view_1.TreeItem nodeId={meta.filePath} label={<StageLabel meta={meta}/>}/>);
};
exports.ChangeItem = ChangeItem;
const StageLabel = ({ meta }) => {
    const stageLabel = (0, css_1.css) `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    return (<div className={stageLabel}>
            <ScmItem_tsx_1.ScmItemText meta={meta}/>
            <StageButton meta={meta}/>
        </div>);
};
const StageButton = ({ meta }) => {
    const { stage } = (0, react_1.useContext)(useScm_ts_1.ScmContext);
    return (<icons_material_1.Add onClick={() => {
            console.log("click stage");
            stage(meta);
        }}>
        </icons_material_1.Add>);
};
//# sourceMappingURL=Changes.js.map