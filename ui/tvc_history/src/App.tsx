import "./App.css";

import "split-pane-react/esm/themes/default.css";
import React, { FC, useState } from "react";

import { useHistory } from "./useHistory.ts";
import { CommitPanel } from "./Commit/CommitPanel.tsx";
import { FormControl, MenuItem, Select } from "@mui/material";
import { BranchCommit } from "meltos_ts_lib/dist/scm/commit/CommitMeta";

export default function App() {
    const branches = useHistory();
    const [selectBranch, $selectBranch] = useState(
        branches.length === 0 ? "owner" : branches[0].name
    );

    return (
        <div className={"max-width max-height flex-column"}>
            <SelectBranchForm
                branches={branches}
                onChange={(branchName) => {
                    const nextBranch = branches.find(
                        (b) => b.name == branchName
                    );
                    if (nextBranch) {
                        $selectBranch(nextBranch.name);
                    }
                }}
            />
            <CommitPanel
                commits={
                    branches.find((b) => b.name == selectBranch)?.commits || []
                }
            />
        </div>
    );
}

const SelectBranchForm: FC<{
    branches: BranchCommit[];
    onChange: (branchName: string) => void;
}> = ({ branches, onChange }) => {
    console.log(branches);
    return (
        <div id={"branch-select-form-container"}>
            <FormControl id={"select-branch-form"}>
                {/*<InputLabel id="branch-select-label">Branch</InputLabel>*/}
                <Select
                    defaultValue="owner"
                    id={"branch-select"}
                    onChange={(e) => {
                        onChange(e.target.value);
                    }}
                >
                    {branches.map((b) => (
                        <MenuItem key={b.name} value={b.name}>
                            {b.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};
