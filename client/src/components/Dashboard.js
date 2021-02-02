import React from 'react';

function Dashboard(props) {
    return (
        <div className={`${(props.teacher) ? 'Teacher' : 'Student'} Dashboard`}>
            {props.children}
        </div>
    )
}

function Header(props) {
    return (
        <>
            <div className="Logo">
                <img src="assets/logo.svg" alt="pianopet logo" />
            </div>
            <div className="Header">
                <h1>My Dashboard</h1>
            </div>
            <div className="User">
                {props.children}
            </div>
        </>
    )
}

function Sidebar(props) {
    return (
        <div className="Sidebar">
            {props.children}
        </div>
    )
}

function Nav(props) {
    return (
        <div className="Nav">
            {props.children}
        </div>
    )
}

export { Dashboard, Header, Sidebar, Nav };