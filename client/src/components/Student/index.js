import { useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Header, Nav, ProfileDropdown } from "../Page";
import { StudentCloset } from "../StudentCloset";
import { StudentHomework } from "../StudentHomework";
import { StudentMarketplace } from "../StudentMarketplace";
import { StudentSidebar } from "../StudentSidebar";

export const Student = () => {
    const { student, refreshData } = useContext(DataContext);
    const { view, updateView } = useContext(ViewContext);
    return (
        <>
            <Header {...{ view, updateView }}>
                <Nav>
                    <button className="stealth" onClick={() => updateView({ type: 'home' })}>Home</button>
                    <button className="stealth" onClick={() => updateView({ type: 'closet' })}>Closet</button>
                    <button className="stealth" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button>
                    <button className="stealth" onClick={() => updateView({ type: 'badges' })}>Badges</button>
                </Nav>
                <ProfileDropdown {...{ user: student, updateView }} />
            </Header>
            <StudentSidebar />
            <StudentMain {...{ view, student, refreshData }} />
        </>
    );
}

const StudentMain = ({ view, student, refreshData }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return <StudentHomework {...{ student }} />;
            case 'closet': return <StudentCloset {...{ student, refreshData }} />;
            case 'marketplace': return <StudentMarketplace />;
            case 'badges': return 'badges';
            case 'my-account': return 'my account';
            default: return 'uhhhh'
        }
    }
    return (
        <div className="Main">
            {content()}
        </div>
    );
}