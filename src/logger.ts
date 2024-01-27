import path from "path";
import {workspace} from "vscode";
import * as fs from "fs";

export const initLogger = () => {
    if(!fs.existsSync(logDirPath)){
        fs.mkdirSync(logDirPath);
    }
};


export const info = (message: string) => {
    fs.writeFileSync(infoFilePath, message);
};

export const error = (message: string) => {
    fs.writeFileSync(infoFilePath, message);
};



const logDirPath = path.join(process.env.APPDATA!, 'meltos', "log");

const date = new Date();
const dateStr = `${date.getFullYear()}${date.getMonth()}${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
const infoFilePath = path.join(logDirPath, "info", dateStr);
const errorFilePath =path.join(logDirPath, "error", dateStr);