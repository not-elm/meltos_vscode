import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
	DiscussionContext,
	DiscussionThread,
} from "./discussion/DiscussionThread.tsx";
import { MockDiscussionClient } from "./discussion/client/mock.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<DiscussionContext.Provider value={new MockDiscussionClient()}>
			<DiscussionThread />
		</DiscussionContext.Provider>
	</React.StrictMode>
);
