import { useState, useEffect, useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import Loading from "../Loading";
import PianopetBase from "../PianopetBase";

export const Avatar = () => {
    const [color, setColor] = useState(null);
    const { updateView } = useContext(ViewContext);
    const { isStudent, avatar } = useContext(DataContext);
    useEffect(() => {
        if (!avatar) return;
        setColor(avatar.Color?.src);
    }, [avatar]);
    const handleClick = () => {
        if (isStudent) updateView({ type: 'closet' });
    }
    const generateAvatar = () => {
        if (avatar === null) return <Loading />;
        return Object.keys(avatar).map(key => {
            if (key === 'Color') return null;
            if (avatar[key].isOccupied) return null;
            const { _id, src, image } = avatar[key];
            const style = {
                top: `${image.y}%`,
                left: `${image.x}%`,
                width: `${image.w}%`
            }
            return (
                <img
                    key={`studentAvatar-${key}-${_id}`}
                    className={`${key} avatarItem`}
                    alt={src}
                    src={src}
                    style={style} />
            );
        });
    }
    return (
        <div className="Avatar">
            <div className="avatarBox" onClick={handleClick}>
                <PianopetBase color={color} />
                {generateAvatar()}
            </div>
        </div>
    );
}