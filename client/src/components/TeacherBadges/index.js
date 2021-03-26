import { useContext } from "react"
import { DataContext, ModalContext } from "../../contexts"
import { Badges } from "../Badges"

export const TeacherBadges = () => {
    const { badges } = useContext(DataContext);
    const { createModal, createContextMenu } = useContext(ModalContext);
    const addNewBadge = () => createModal('createBadge', 'form');
    const ifNoneMessage = "You haven't added any badges yet!";
    const onClick = () => console.log('handle click badge');
    const onContextMenuClick = (e, badge) => {
        e.preventDefault();
        const editBadge = () => createModal('editBadge', 'form', { badge });
        const deleteBadge = () => createModal('deleteBadge', 'form', { badge });
        const listItems = [
            { display: 'Edit', onClick: editBadge },
            { display: 'Delete', onClick: deleteBadge }
        ];
        createContextMenu(e, listItems, {
            className: 'editdelete'
        });
    }
    return (
        <div className="TeacherBadges">
            <h1>Badges</h1>
            <Badges
                badgeList={badges}
                {...{ ifNoneMessage, onClick, onContextMenuClick }} />
            <button onClick={addNewBadge}>Add new badge</button>
        </div>
    );
}