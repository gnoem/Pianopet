import "./ManageWearables.css";
import { Wearable } from "../../../api";
import { useFormError } from "../../../hooks";
import { ManageColor } from "./ManageColor";
import { ManageWallpaper } from "./ManageWallpaper";
import { ManageWearable as ManageRegularWearable } from "./ManageWearable";

export const ManageWearable = (props) => {
    const { type, wearable, refreshData } = props;
    const addingNew = !wearable;
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = (formData) => {
        if (addingNew) return Wearable.createWearable(formData);
        return Wearable.editWearable(wearable._id, formData);
    }
    const handleSuccess = () => {
        refreshData();
    }
    const inherit = {
        ...props,
        addingNew,
        formHandle: { handleSubmit, handleSuccess },
        formError: { updateFormError, resetFormError, warnFormError }
    }
    switch (type) {
        case 'color': return <ManageColor {...inherit} />;
        case 'wallpaper': return <ManageWallpaper {...inherit} />;
        case 'wearable': return <ManageRegularWearable {...inherit} />;
        default: return null;
    }
}

export { ManageColor, ManageWallpaper, ManageRegularWearable }