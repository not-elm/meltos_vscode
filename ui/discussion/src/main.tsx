import React from "react";
import ReactDOM from "react-dom/client";
import {DiscussionContext, DiscussionThread,} from "./discussion/DiscussionThread.tsx";
import "./index.css";
import "./reset.css";
import "./color.css";
import {VscodeDiscussionClient} from "./discussion/client/vscode.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <DiscussionContext.Provider value={new VscodeDiscussionClient()}>
            <DiscussionThread/>
        </DiscussionContext.Provider>
    </React.StrictMode>
);
