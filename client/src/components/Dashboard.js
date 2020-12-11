import React from 'react';

function Dashboard(props) {
    return (
        <div className={`${(props.teacher) ? 'Teacher' : 'Student'} Dashboard`}>
            {props.children}
        </div>
    )
}

function Window(props) {
    return (
        <div className="Window">
            {props.children}
        </div>
    )
}

function Sidebar(props) {
    return (
        <div className="Sidebar">
            {props.children}
        </div>
    )
}

function Topbar(props) {
    return (
        <div className="Topbar">
            {props.children}
        </div>
    )
}

export { Dashboard, Window, Sidebar, Topbar };