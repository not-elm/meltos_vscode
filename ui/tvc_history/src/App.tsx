import './App.css'
import SplitPane, {Pane} from "split-pane-react";
import {useState} from "react";
import 'split-pane-react/esm/themes/default.css';
import {CommitItems} from "./CommitItem.tsx";
import {SelectObj} from "./SelectObj.tsx";
import {css} from "@emotion/css";
import {useHistory} from "./useHistory.ts";
import SashContent from "split-pane-react/src/SashContent.tsx";

function App() {
    // const selectObj = useState<ObjMeta | undefined>();
    const commits = useHistory();
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
                    <CommitItems key={"top"} commits={commits}/>
                </Pane>
                <Pane minSize={0} className={splitBorder}>
                    <SelectObj key={"bottom"} commit={{
                        hash: "2323131",
                        message: "UPDATE: TODO",
                        objs: [
                            {
                                file_path: "/workspace/hello.txt",
                                hash: "dada"
                            }
                        ]
                    }}/>
                </Pane>
            </SplitPane>
        </div>
    )
}

// {/*<Pane minSize={50} maxSize='50%'>*/}

//   {/*        }*/}
//   {/*    ]}/>*/}
//   {/*</Pane>*/}


export default App
