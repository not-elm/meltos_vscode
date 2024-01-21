import {useEffect, useState} from "react";
import {BranchCommit} from "meltos_ts_lib/src/scm/commit/CommitMeta";

// const mockRandomBranches = (): BranchCommit[] => {

//     return [...Array(10)]
//         .map((v, i) => ({
//             name: `Branch${i}`,
//             commits: [...Array(10)]
//                 .map((c, ci) => ({
//                     hash: (Math.random() * Math.pow(10, 50)).toString().slice(0, 40),
//                     message: `Message${ci}`,
//                     objs: [...Array(10)]
//                         .map(() => ({
//                             file_path: "workspace/hello.txt",
//                             hash: (Math.random() * Math.pow(10, 50)).toString().slice(0, 40),
//                         } as ObjMeta))
//                 } as CommitMeta))
//         } as BranchCommit))
// }

export const useHistory = () => {
    const [commits, $commits] = useState<BranchCommit[]>([]);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            $commits(() => e.data);
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return commits;
};
