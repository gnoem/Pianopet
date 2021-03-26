import { useContext } from "react";
import { DataContext } from "../../contexts";

export const Badges = ({ badgeList, ifNoneMessage, checkClassName, onClick, onContextMenuClick }) => {
    const listItems = () => {
        if (!badgeList?.length) return ifNoneMessage;
        return badgeList.map(badge => (
            <BadgeListItem
                key={`badgeListItem-${badge._id}`}
                className={checkClassName(badge)}
                {...{ badge, onClick, onContextMenuClick }} />
        ));
    }
    return (
        <div className="BadgeList">
            {listItems()}
        </div>
    );
}

const BadgeListItem = ({ badge, className, onClick, onContextMenuClick }) => {
    const { isStudent } = useContext(DataContext);
    return (
        <div className={`badgeItem ${className ?? ''}`}>
            <img className="badgeImage"
                 alt={badge.name}
                 src={badge.src}
                 onClick={isStudent ? null : onClick}
                 onContextMenu={isStudent ? null : onContextMenuClick} />
            <span className="badgeName">{badge.name}</span>
            <span onClick={isStudent ? onClick : null}>
                <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                <span className="badgeValue">{badge.value}</span>
            </span>
        </div>
    );
}