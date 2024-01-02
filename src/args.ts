import path from "path";
import * as fs from "fs";

export type ClientType = "user" | "owner";

export const loadArgs = (): OwnerArgs | UserArgs => {
    const uri = path.join(process.env.APPDATA!, "meltos", "args");
    const args = fs.readFileSync(uri);
    const json =  JSON.parse(args.toString());
    if (json.clientType === "owner"){
        return json as OwnerArgs;
    }else {
        return json as UserArgs;
    }
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