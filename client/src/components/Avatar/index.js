import { useState, useEffect, useContext } from "react";
import { DataContext, ViewContext } from "../../contexts";
import Loading from "../Loading";
import PianopetBase from "../PianopetBase";
import { PianopetWallpaper } from "../PianopetWallpaper";

export const Avatar = ({ student }) => {
    const { view } = useContext(ViewContext);
    const { isStudent, avatar, createAvatarObject } = useContext(DataContext);
    const [color, setColor] = useState(null);
    const [wallpaper, setWallpaper] = useState(null);
    const [avatarObject, setAvatarObject] = useState(null);
    const { updateView } = useContext(ViewContext);
    const updateAvatarObject = (obj) => {
        setAvatarObject(obj);
        setWallpaper(obj?.Wallpaper);
        setColor(obj?.Color?.src);
    }
    useEffect(() => {
        if (avatar) updateAvatarObject(avatar);
    }, [avatar]);
    useEffect(() => {
        const obj = createAvatarObject(student?.avatar);
        updateAvatarObject(obj);
    }, [student, view]);
    const handleClick = () => {
        if (isStudent) updateView({ type: 'closet' });
    }
    const generateAvatar = () => {
        if (avatarObject === null) return <Loading />;
        return Object.keys(avatarObject).map(key => {
            if (['Color', 'Wallpaper'].includes(key)) return null;
            if (avatarObject[key].isOccupied) return null;
            const { _id, src, image } = avatarObject[key];
            const style = {
                top: `${image?.y}%`,
                left: `${image?.x}%`,
                width: `${image?.w}%`
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
                <PianopetWallpaper {...wallpaper} />
                <PianopetBase color={color} />
                {generateAvatar()}
            </div>
        </div>
    );
}