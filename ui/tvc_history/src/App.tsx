import './App.css'

import 'split-pane-react/esm/themes/default.css';
import {Box, Typography} from "@mui/material";
import React from "react";

import {useHistory} from "./useHistory.ts";
import {CommitPanel} from "./Commit/CommitPanel.tsx";
import {VSCodePanels, VSCodePanelTab, VSCodePanelView} from "@vscode/webview-ui-toolkit/react";


export default function App() {
    const branches = useHistory();

    return (
        <VSCodePanels
            className={"max-width max-height"}
            aria-label="basic tabs example"
        >
            {branches.map((b) => (
                <VSCodePanelTab key={b.name} id={b.name}>
                    {b.name}
                </VSCodePanelTab>
            ))}
            {branches.map((b) => (
                <VSCodePanelView className={"max-width max-height"} key={b.name} id={b.name}>
                    <CommitPanel commits={b.commits} key={b.name}/>
                </VSCodePanelView>
            ))}
        </VSCodePanels>
    );
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


