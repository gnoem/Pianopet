import { useState, useEffect, useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import Loading from "../Loading";
import PianopetBase from "../PianopetBase";

export const Avatar = ({ student }) => {
    const { isStudent, avatar, wearables, categories, createAvatarObject } = useContext(DataContext);
    const [avatarObject, setAvatarObject] = useState(null);
    const [color, setColor] = useState(null);
    const { updateView } = useContext(ViewContext);
    const updateAvatarObject = (obj) => {
        setAvatarObject(obj);
        setColor(obj?.Color?.src);
    }
    useEffect(() => {
        if (avatar) updateAvatarObject(avatar);
    }, [avatar]);
    useEffect(() => {
        const obj = createAvatarObject(student?.avatar, wearables, categories);
        updateAvatarObject(obj);
    }, [student]);
    const handleClick = () => {
        if (isStudent) updateView({ type: 'closet' });
    }
    const generateAvatar = () => {
        if (avatarObject === null) return <Loading />;
        return Object.keys(avatarObject).map(key => {
            if (key === 'Color') return null;
            if (avatarObject[key].isOccupied) return null;
            const { _id, src, image } = avatarObject[key];
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