import { Checkbox } from "../../Form";

export const WearableOptions = ({ formData, setFormDataDirectly }) => {
    return (
        <>
            <Checkbox
                detailedLabel={['Make active', 'Wearables set to active are made visible to students.']}
                checked={formData?.active}
                onChange={(e) => setFormDataDirectly(prevState => ({ ...prevState, active: e.target.checked }))}
            />
            <Checkbox
                detailedLabel={['Add "new" label', 'Add a "new" sticker to this wearable.']}
                checked={formData?.flag}
                onChange={(e) => setFormDataDirectly(prevState => ({ ...prevState, flag: e.target.checked }))}
            />
        </>
    );
}