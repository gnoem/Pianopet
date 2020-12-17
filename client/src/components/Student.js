import React from 'react';
import { Dashboard, Window, Sidebar, Topbar } from './Dashboard'

function Student(props) {
    const { student } = props;
    return (
        <Dashboard teacher={false}>
            <Sidebar />
            <Topbar>
                <button className="stealth link" onClick={props.logout}>Log out</button>
            </Topbar>
            <Window>
                <h1>Dashboard</h1> 
                {student._id}
            </Window>
        </Dashboard>
    )
}

export default Student;