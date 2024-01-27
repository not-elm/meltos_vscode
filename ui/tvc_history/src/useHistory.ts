import { useEffect, useRef, useState } from "react";
import {
    BranchCommit,
    CommitMeta,
    ObjMeta,
} from "meltos_ts_lib/src/scm/commit/CommitMeta";

const mockRandomBranches = (): BranchCommit[] => {
    return [...Array(20)].map(
        (v, i) =>
            ({
                name: `Branch${i}`,
                commits: [...Array(20)].map(
                    (c, ci) =>
                        ({
                            hash: (Math.random() * Math.pow(10, 50))
                                .toString()
                                .slice(0, 40),
                            message: `Message${ci}\nTESTDADA`,
                            objs: [...Array(10)].map(
                                () =>
                                    ({
                                        file_path: "/workspace/hello.txt",
                                        hash: (Math.random() * Math.pow(10, 50))
                                            .toString()
                                            .slice(0, 40),
                                    } as ObjMeta)
                            ),
                        } as CommitMeta)
                ),
            } as BranchCommit)
    );
};

export const useHistory = () => {
    const [commits, $commits] = useState<BranchCommit[]>([]);
    const commitsRef = useRef($commits);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            console.log("useHistory");
            console.log(e.data);
            commitsRef.current(() => e.data);
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return commits;
};
