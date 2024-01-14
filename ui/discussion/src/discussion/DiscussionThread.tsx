import React, {useContext, useEffect} from "react";
import {DiscussionData} from "../DiscussionData";
import {DiscussionMessages} from "./Message.tsx";
import {useDiscussionState} from "../vscodeApi.ts";
import "../index.css"
import {MockDiscussionClient} from "./client/mock.ts";
import {SpeakBox} from "./InputText.tsx";
import {DiscussionIo} from "./client/interface.ts";

export const DiscussionThread = () => {
    const discussion = useDiscussion();
    const client = useContext(DiscussionContext);
    return (
        <div id={"panel"}>
            <DiscussionMessages messages={discussion?.messages || []}/>
            <SpeakBox onClick={text => {
                client.speak(text);
            }}/>
        </div>
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
            console.log("+++++++++++++++++++++++++");
            console.log(data);
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
