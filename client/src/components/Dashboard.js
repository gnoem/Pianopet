import React, { Component } from 'react';

class Dashboard extends Component {
    logout = async () => {
        fetch('/logout').then(() => window.location.assign('/'));
    }
    render() {
        console.dir(this.props);
        return (
            <div className="Dashboard">
                <div className="Sidebar"></div>
                <div className="Window"><button className="stealth link" onClick={this.logout}>Log out</button></div>
            </div>
        )
    }
}

export default Dashboard;