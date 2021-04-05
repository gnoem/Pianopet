import { useContext } from "react"
import { DataContext, ModalContext } from "../../../contexts"
import { Badges } from "../../Badges"

export const TeacherBadges = () => {
    const { badges } = useContext(DataContext);
    const { createModal } = useContext(ModalContext);
    const addNewBadge = () => createModal('createBadge', 'form');
    const ifNoneMessage = "You haven't added any badges yet!";
    return (
        <div className="TeacherBadges">
            <h1>Badges</h1>
            <Badges
                badgeList={badges}
                {...{ ifNoneMessage }} />
            <button onClick={addNewBadge}>Add new badge</button>
        </div>
    );
}