import { useEffect, useState } from "react";
import { CommitMeta } from "meltos_ts_lib/dist/scm/commit/CommitMeta";

export const useHistory = () => {
    const [commits, $commits] = useState<CommitMeta[]>([]);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            console.log(e);
            $commits(() => e.data);
        };

        window.addEventListener("message", onMessage);
        return () => {
            window.removeEventListener("message", onMessage);
        };
    }, []);

    return commits;
};
