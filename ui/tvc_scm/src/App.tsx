import "./App.css";
import {ScmContext, useScm} from "./client/useScm.ts";
import {Changes} from "./components/Changes.tsx";
import {Stages} from "./components/Stages.tsx";

import {MockButton} from "./components/MockButton.tsx";
import {TreeView} from "@mui/x-tree-view";
import {ChevronRight, ExpandMore} from "@mui/icons-material";
import {Box, Divider} from "@mui/material";
import "./reset.css"
import {FC} from "react";
import {CommitArea} from "./components/CommitArea.tsx";
import {css} from "@emotion/css";

// const useMockScmMessenger = () => {
//     useEffect(() => {
//
//         const onMessage = (e: MessageEvent) => {
//             switch (e.data.type) {
//                 case "stage":
//                     window.postMessage({
//                         type: "staged",
//                         meta: e.data.meta
//                     }, "*");
//                     break;
//                 case "unStage":
//                     window.postMessage({
//                         type: "unStaged",
//                         meta: e.data.meta
//                     }, "*")
//             }
//         }
//         window.addEventListener("message", onMessage)
//
//         return () => {
//             window.addEventListener("message", onMessage)
//         };
//     }, [])
// }

export const App = () => {
    const scm = useScm();
    // useMockScmMessenger()

    return (
        <ScmContext.Provider value={scm}>
            <Box sx={{minHeight: 180, flexGrow: 1}}>
                <CommitArea/>
                <Divider/>

                <SpaceHeight height={32}/>

                <TreeView
                    defaultCollapseIcon={<ExpandMore height={30} width={30}/>}
                    defaultExpandIcon={<ChevronRight/>}
                >
                    <Stages/>
                    <Changes/>
                </TreeView>
                <MockButton/>
            </Box>
        </ScmContext.Provider>
    );
}


const SpaceHeight: FC<{
    height: number
}> = ({height}) => {
    const space = css`
        height: ${height}px;
    `

    return (
        <div className={space}>
        </div>
    )
}