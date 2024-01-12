import SplitPane, {Pane} from "split-pane-react";
import SashContent from "split-pane-react/src/SashContent.tsx";
import {CommitItems} from "./CommitItem.tsx";
import {SelectObj} from "./SelectObj.tsx";
import {FC, useState} from "react";
import {CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta.ts";
import {css} from "@emotion/css";

export const CommitPanel: FC<{
    commits: CommitMeta[]
}> = ({commits}) => {
    const [selectCommit, $selectCommit] = useState<null | CommitMeta>(null);
    const [sizes, setSizes] = useState([100, '30%', 'auto']);
    const splitBorder = css`
        padding: 8px 0;
        border-top: 7px solid #727070;
    `;

    return (
        <div style={{height: 500}}>
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={setSizes}
                sashRender={(_, active) =>
                    <SashContent active={active} type='vscode'/>
                }>

                <Pane minSize={50} maxSize='50%'>
                    <CommitItems key={"top"} commits={commits} onSelect={commit => $selectCommit(commit)}/>
                </Pane>

                {selectCommit && (
                    <Pane minSize={0} className={splitBorder}>
                        <SelectObj
                            key={"bottom"}
                            commit={selectCommit}
                            onClose={() => $selectCommit(null)}
                        />
                    </Pane>
                ) || <></>}

            </SplitPane>
        </div>
    )
}