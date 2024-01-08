"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScmItemText = void 0;
const file_ts_1 = require("meltos_ts_lib/src/file.ts");
const css_1 = require("@emotion/css");
const ScmItemText = ({ meta }) => {
    const scmItem = (0, css_1.css) `
        display: flex;
        align-items: center;
        justify-content: start;
        gap: 8px;
    `;
    const scmAbsolutePath = (0, css_1.css) `
        font-size: 0.8em;
        color: #888888;
    `;
    return (<div className={scmItem}>
            <p>{(0, file_ts_1.fileName)(meta.filePath)}</p>
            <p className={scmAbsolutePath}>{meta.filePath}</p>
        </div>);
};
exports.ScmItemText = ScmItemText;
//# sourceMappingURL=ScmItem.js.map