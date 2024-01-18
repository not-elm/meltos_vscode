import "./App.css";
import {ScmContext, useScm} from "./client/useScm.ts";
import {Box} from "@mui/material";

import {FC} from "react";
import {CommitArea} from "./components/CommitArea.tsx";
import {css} from "@emotion/css";
import {VSCodeDivider} from "@vscode/webview-ui-toolkit/react";
import {MockButton} from "./components/MockButton.tsx";
import {SourceTrees} from "./client/SourceTrees.tsx";


export const App = () => {
    const scm = useScm();

    return (
        <ScmContext.Provider value={scm}>
            <Box sx={{minHeight: 180, flexGrow: 1}}>
                <CommitArea/>
                <VSCodeDivider/>

                <SpaceHeight height={32}/>

                <SourceTrees/>

                <MockButton/>
            </Box>
        </ScmContext.Provider>
    );
};

const SpaceHeight: FC<{
    height: number;
}> = ({height}) => {
    const space = css`
        height: ${height}px;
    `;

    return <div className={space}></div>;
};

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
