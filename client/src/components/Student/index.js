import { useEffect, useContext } from "react";
import { DataContext, MobileContext, ViewContext } from "../../contexts";
import { Account } from "../Account";
import { Header, Nav, ProfileDropdown } from "../Page";
import { Homework } from "../Homework";
import { StudentSidebar } from "./StudentSidebar";
import { StudentCloset } from "./StudentCloset";
import { StudentMarketplace } from "./StudentMarketplace";
import { StudentBadges } from "./StudentBadges";

export const Student = () => {
    const { isMobile } = useContext(MobileContext);
    const { student, updateAvatar, createAvatarObject } = useContext(DataContext);
    const { view, updateView } = useContext(ViewContext);
    useEffect(() => {
        if (isMobile) updateAvatar(createAvatarObject(student.avatar));
    }, [view]);
    return (
        <>
            <Header {...{ view, updateView }}>
                <Nav>
                    <button className="stealth" onClick={() => updateView({ type: 'home' })}>Home</button>
                    <button className="stealth" onClick={() => updateView({ type: 'closet' })}>Closet</button>
                    <button className="stealth" onClick={() => updateView({ type: 'marketplace' })}>Marketplace</button>
                    <button className="stealth" onClick={() => updateView({ type: 'badges' })}>Badges</button>
                </Nav>
                <ProfileDropdown {...{ isStudent: true, user: student, updateView }} />
            </Header>
            <StudentSidebar {...{ view, student }} />
            <StudentMain {...{ view, updateView, student }} />
        </>
    );
}

const StudentMain = ({ view, updateView, student }) => {
    const content = () => {
        switch (view.type) {
            case 'home': return <Homework {...{ student }} />;
            case 'closet': return <StudentCloset {...{ updateView }} />;
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