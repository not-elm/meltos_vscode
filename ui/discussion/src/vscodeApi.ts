import type {WebviewApi} from "vscode-webview";
import {useEffect, useState} from "react";
import {DiscussionData} from "./DiscussionData";


class VSCodeAPIWrapper<State> {
    private readonly vsCodeApi: WebviewApi<State> | undefined;

    constructor() {
        // Check if the acquireVsCodeApi function exists in the current development
        // context (i.e. VS Code development window or web browser)
        if (typeof acquireVsCodeApi === "function") {
            this.vsCodeApi = acquireVsCodeApi();
        }
    }

    public postMessage(message: unknown) {
        if (this.vsCodeApi) {
            this.vsCodeApi.postMessage(message);
        }
    }


    public getState(): State | undefined {
        if (this.vsCodeApi) {
            return this.vsCodeApi.getState();
        }
    }


    public setState(newState: State) {
        if (this.vsCodeApi) {
            return this.vsCodeApi.setState(newState);
        } else {
            return newState;
        }
    }
}


export const useDiscussionState = () => {
    const {state, set} = useVscodeState()
    return {
        discussion: state?.discussion,
        set: (discussion: DiscussionData) => {
            set(() => ({
                discussion: discussion
            }))
        }
    }
}

export const useVscodeState = () => {
    const [state, $state] = useState(vscodeApi.getState())

    useEffect(() => {
        if (state) {
            vscodeApi.setState(state);
        }
    }, [state])

    return {
        state,
        set: $state
    }
}

// Exports class singleton to prevent multiple invocations of acquireVsCodeApi.
export const vscodeApi = new VSCodeAPIWrapper<VscodeState>();


export interface VscodeState {
    discussion: DiscussionData | undefined
}