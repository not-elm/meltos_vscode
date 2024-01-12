import { useEffect, useState } from "react";
import {BranchCommit, CommitMeta} from "meltos_ts_lib/dist/scm/commit/CommitMeta";

export const useHistory = () => {
    const [commits, $commits] = useState<BranchCommit[]>([]);
    console.log("COMMITS");
    console.log(commits);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            console.log(e);
            $commits(() => e.data.data);
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return commits;
};
