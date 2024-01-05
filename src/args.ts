import path from "path";
import * as vscode from "vscode";
export type ClientType = "user" | "owner";

export const loadArgs = (context: vscode.ExtensionContext): OwnerArgs | UserArgs => {
    const args = context.globalState.get("args");
    if(typeof args === "object" && args && "clientType" in args ){
        switch(args["clientType"]){
            case "owner":
                return args as OwnerArgs;
            case "user":
                return args as UserArgs;
            default:
                throw new Error("invalid args type");
        }

    }else{
        throw new Error("invalid args type");
    }

};

export const createOwnerArgs = (
    workspaceSource: string
): OwnerArgs => {
    return {
        userId: "owner",
        workspaceSource,
        clientType: "owner"
    };
};

export const createUserArgs = (
    userInput: string,
): UserArgs => {
    const [userId, roomId] = userInput.split("@");
    return {
        roomId,
        userId,
        clientType: "user"
    };
};

export const isOwner = (args: OwnerArgs | UserArgs) : args is OwnerArgs => {
    return args.clientType === "owner";
}

export interface OwnerArgs {
    clientType: "user" | "owner",
    userId: string,
    workspaceSource: string,
}

export interface UserArgs {
    userId: string,
    roomId?: string,
    clientType: "user" | "owner",
}