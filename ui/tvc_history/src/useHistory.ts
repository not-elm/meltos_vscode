import { useEffect, useState } from "react";
import {BranchCommit, CommitMeta, ObjMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";



const mockRandomBranches = (): BranchCommit[] => {
    const limit = Math.random() *100;
    return [...Array(100)]
        .map((v, i) => ({
            name: `Branch${i}`,
            commits: [...Array(100)]
                .map((c, ci) => ({
                    hash: "1212dadadsdsda",
                    message: `Message${ci}`,
                    objs: [...Array(100)]
                        .map((o, i) => ({
                            file_path: "workspace/hello.txt",
                            hash: "23312135311321312"
                        } as ObjMeta))
                } as CommitMeta))
        } as BranchCommit))
}

export const useHistory = () => {
    const [commits, $commits] = useState<BranchCommit[]>(mockRandomBranches);
    console.log("COMMITS");
    console.log(commits);

    // useEffect(() => {
    //     const onMessage = (e: MessageEvent) => {
    //         console.log(e);
    //         $commits(() => e.data.data);
    //     };
    //
    //     window.addEventListener("message", onMessage);
    //     return () => {
    //         window.removeEventListener("message", onMessage);
    //     };
    // }, []);

    return commits;
};
