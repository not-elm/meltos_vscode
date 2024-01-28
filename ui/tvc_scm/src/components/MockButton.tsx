
import {ChangeMessage} from "meltos_ts_lib/src/scm/changes/ScmToWebMessage.ts";

export const MockButton = () => {

    return (
        <button onClick={() => {
           window.postMessage({
               type: "change",
               meta: {
                   filePath: `workspace/${Date.now()}.txt`,
                   changeType: "change"
               }
           } as ChangeMessage, "*")
        }}>TEST</button>
    )
}