import {useEffect, useState} from "react";
import {BranchCommit, CommitMeta, ObjMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";


const mockRandomBranches = (): BranchCommit[] => {

    return [...Array(100)]
        .map((v, i) => ({
            name: `Branch${i}`,
            commits: [...Array(100)]
                .map((c, ci) => ({
                    hash: (Math.random() * Math.pow(10, 50)).toString().slice(0, 40),
                    message: `Message${ci}`,
                    objs: [...Array(100)]
                        .map(() => ({
                            file_path: "workspace/hello.txt",
                            hash: (Math.random() * Math.pow(10, 50)).toString().slice(0, 40),
                        } as ObjMeta))
                } as CommitMeta))
        } as BranchCommit))
}

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
    console.log(commits)
    return commits;
};
