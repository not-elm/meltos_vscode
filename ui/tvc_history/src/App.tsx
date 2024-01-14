import './App.css'

import 'split-pane-react/esm/themes/default.css';
import {Box, Tab, Tabs, Typography} from "@mui/material";
import React from "react";
import {useHistory} from "./useHistory.ts";
import {CommitPanel} from "./CommitPanel.tsx";

function App() {
    const branches = useHistory();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{width: '100%'}}>

            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                >
                    {branches.map((b, i) => (
                        <Tab label={b.name} {...a11yProps(i)}/>
                    ))}
                </Tabs>
            </Box>
            {branches.map((b, i) => (
                <CustomTabPanel value={value} index={i}>
                    <CommitPanel commits={b.commits}/>
                </CustomTabPanel>
            ))}
        </Box>
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


export default App
