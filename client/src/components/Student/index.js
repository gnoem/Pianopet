import { useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import { Account } from "../Account";
import { Header, Nav, ProfileDropdown } from "../Page";
import { StudentBadges } from "../StudentBadges";
import { StudentCloset } from "../StudentCloset";
import { Homework } from "../Homework";
import { StudentMarketplace } from "../StudentMarketplace";
import { StudentSidebar } from "../StudentSidebar";

export const Student = () => {
    const { student } = useContext(DataContext);
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
            <StudentMain {...{ view, student }} />
        </>
    );
}

const StudentMain = ({ view, student }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return <Homework {...{ student }} />;
            case 'closet': return <StudentCloset />;
            case 'marketplace': return <StudentMarketplace />;
            case 'badges': return <StudentBadges />;
            case 'my-account': return <Account />;
            default: return 'uhhhh'
        }
    }
    return (
        <div className="Main">
            {content()}
        </div>
    );
}