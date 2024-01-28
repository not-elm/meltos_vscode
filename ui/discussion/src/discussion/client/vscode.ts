import {DiscussionIo} from "./interface.ts";
import {vscodeApi} from "../../vscodeApi.ts";

export class VscodeDiscussionClient implements DiscussionIo {
    speak(text: string): void {
        vscodeApi.postMessage({
            type: "speak",
            text
        });
    }

    reply(to: string, text: string): void {
        vscodeApi.postMessage({
            type: "reply",
            to,
            text
        })
    }

}