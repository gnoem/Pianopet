import React from 'react';
import { Dashboard, Window, Sidebar, Topbar } from './Dashboard'

function Student(props) {
    return (
        <Dashboard teacher={false}>
            <Sidebar />
            <Topbar>
                <button className="stealth link" onClick={props.logout}>Log out</button>
            </Topbar>
            <Window>
                <h1>Dashboard</h1>
                student
            </Window>
        </Dashboard>
    )
}

export default Student;