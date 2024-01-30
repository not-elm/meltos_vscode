import * as vscode from 'vscode';
export const roomCapacity = () : bigint | undefined => {
	const config = vscode.workspace.getConfiguration("meltos");
	const roomCapacity: number | undefined = config.get("roomCapacity");
    if(roomCapacity){
        return BigInt(roomCapacity);
    }else{
        return undefined;
    }
};

export const roomLifetimeSecs = () : bigint | undefined  => {
	const config = vscode.workspace.getConfiguration("meltos");
	const roomLifetimeSecs: number | undefined = config.get("roomLifetimeSecs");
    if(roomLifetimeSecs){
        return BigInt(roomLifetimeSecs);
    }else{
        return undefined;
    }
};
