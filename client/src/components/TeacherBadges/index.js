import { useContext } from "react"
import { DataContext } from "../../contexts"
import { Badges } from "../Badges"

export const TeacherBadges = () => {
    const { badges } = useContext(DataContext);
    const addNewBadge = () => console.log('add new badge');
    const ifNoneMessage = "You haven't added any badges yet!";
    const onClick = () => console.log('handle click badge');
    const onContextMenuClick = (e) => {
        e.preventDefault();
        console.log('edit or delete badge');
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