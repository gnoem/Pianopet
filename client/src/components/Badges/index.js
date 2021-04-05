import "./Badges.css";
import React, { useContext, useRef } from "react";
import { Student } from "../../api";
import { DataContext, ModalContext } from "../../contexts";
import { handleError } from "../../services";

export const Badges = ({ badgeList, ifNoneMessage, checkClassName }) => {
    const { createContextMenu, createModal } = useContext(ModalContext);
    const { isStudent, student, refreshData } = useContext(DataContext);
    const badgeRefs = useRef({});
    const listItems = () => {
        if (!badgeList?.length) return ifNoneMessage;
        return badgeList.map(badge => {
            const onClick = () => {
                if (isStudent) {
                    Student.updateBadgeRedeemed(student._id, badge).then(() => {
                        refreshData();
                    }).catch(err => {
                        handleError(err, { createModal });
                    });
                    return;
                }
                createModal('awardBadge', 'form', { badge });
            }
            const onContextMenuClick = (e, badge) => {
                e.preventDefault();
                const editBadge = () => createModal('editBadge', 'form', { badge });
                const deleteBadge = () => createModal('deleteBadge', 'form', { badge, element: badgeRefs.current[badge._id] });
                const listItems = [
                    { display: 'Edit', onClick: editBadge },
                    { display: 'Delete', onClick: deleteBadge }
                ];
                createContextMenu(e, listItems, {
                    className: 'editdelete'
                });
            }
            return (
                <BadgeListItem
                    ref={(el) => badgeRefs.current[badge._id] = el}
                    key={`badgeListItem-${badge._id}`}
                    className={checkClassName?.(badge)}
                    {...{ isStudent, badge, onClick, onContextMenuClick }} />
            )
        });
    }
    return (
        <div className="BadgeList">
            {listItems()}
        </div>
    );
}

const BadgeListItem = React.forwardRef(({ isStudent, badge, className, onClick, onContextMenuClick }, ref) => {
    return (
        <div ref={ref} className={`badgeItem ${className ?? ''}`}>
            <img className="badgeImage"
                 alt={badge.name}
                 src={badge.src}
                 onClick={isStudent ? null : onClick}
                 onContextMenu={isStudent ? null : (e) => onContextMenuClick(e, badge)} />
            <span className="badgeName">{badge.name}</span>
            <span onClick={isStudent ? onClick : null}>
                <img className="coin" alt="coin icon" src="assets/Coin_ico.png" />
                <span className="badgeValue">{badge.value}</span>
            </span>
        </div>
    );
})