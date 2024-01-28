import {FC, useMemo} from "react";
import {ChevronRight, ExpandMore} from "@mui/icons-material";

import {TreeView} from "@mui/x-tree-view";
import {vscodeApi} from "../client/VscodeApi.ts";
import {Stages} from "./Stages.tsx";
import {Changes} from "./Changes.tsx";

export const SourceTrees: FC = () => {
    const defaultExpanded = useMemo(() => {
        const {expandStages, expandChanges} = vscodeApi.state()
        const e = [];
        if (expandStages) {
            e.push("stages")
        }
        if (expandChanges) {
            e.push("changes")
        }
        return e;
    }, []);

    return (
        <TreeView
            defaultExpanded={defaultExpanded}
            defaultCollapseIcon={<ExpandMore height={30} width={30}/>}
            defaultExpandIcon={<ChevronRight/>}
            onNodeToggle={(_, expands) => {
                vscodeApi.setState({
                    expandStages: expands.some(id => id === "stages"),
                    expandChanges: expands.some(id => id === "changes")
                })
            }}
        >
            <Stages/>
            <Changes/>
        </TreeView>
    )
}