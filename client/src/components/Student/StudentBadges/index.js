import { useContext } from "react"
import { DataContext } from "../../../contexts"
import { Badges } from "../../Badges"

export const StudentBadges = () => {
    const { student, badges } = useContext(DataContext);
    const badgeList = (() => {
        const unfilteredList = student.badges.map(studentBadge => {
            return badges.find(badge => badge._id === studentBadge.id);
        });
        const filteredList = unfilteredList.filter(el => el); // filtering out nulls? todo look closer later
        return filteredList;
    })();
    const ifNoneMessage = "You haven't earned any badges yet!";
    const badgeHasBeenRedeemed = (badge) => {
        const index = student.badges.findIndex(studentBadge => studentBadge.id === badge._id);
        if (index === -1) return '';
        if (student.badges[index].redeemed) return 'redeemed';
        return '';
    }
    const checkClassName = badgeHasBeenRedeemed;
    return (
        <div className="StudentBadges">
            <h1>Badges</h1>
            <Badges {...{ badgeList, ifNoneMessage, checkClassName }} />
        </div>
    );
}