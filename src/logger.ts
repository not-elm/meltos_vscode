import path from "path";
import {workspace} from "vscode";
import * as fs from "fs";

export const initLogger = () => {

};


export const info = (message: string) => {
    
};

export const error = (message: string) => {
    console.error(message);
    // fs.writeFileSync(infoFilePath, message);
};



// const logDirPath = path.join(process.env.APPDATA!, 'meltos', "log");

// const date = new Date();
// const dateStr = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
// const infoFilePath = path.join(logDirPath, "info", dateStr);
// const errorFilePath =path.join(logDirPath, "error", dateStr);