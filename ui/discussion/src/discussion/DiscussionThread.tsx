import React, {useContext, useEffect} from "react";
import {DiscussionData} from "../DiscussionData";
import {useDiscussionState} from "../vscodeApi.ts";

import {MockDiscussionClient} from "./client/mock.ts";
import {DiscussionIo} from "./client/interface.ts";

import Split from "@uiw/react-split";
import {DiscussionMessages} from "./Message.tsx";
import {SpeakBox} from "./speak/SpeakBox.tsx";
import "../index.css"
import "./DiscussionThread.css";

export const DiscussionThread = () => {
    const discussion = useDiscussion();
    const client = useContext(DiscussionContext);
    return (
        <Split
            id={"discussion-thread"}
            mode={"vertical"}
          >
            <DiscussionMessages
                messages={discussion?.messages || []}/>
            <SpeakBox onClick={text => {
                client.speak(text);
            }}/>
        </Split>
    );
}

export const DiscussionContext = React.createContext<DiscussionIo>(new MockDiscussionClient());

const useDiscussion = () => {
    const {discussion, set} = useDiscussionState();

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data;
            if (!(data && data.type)) {
                return;
            }

            switch (data.type) {
                case "discussion":

                    set(data.data as DiscussionData);
            }
        };
        window.addEventListener("message", handler);
        return () => {
            window.removeEventListener("message", handler)
        }
    }, [set, discussion])

    return discussion;
}
