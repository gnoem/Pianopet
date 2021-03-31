import { useRef } from "react";
import { Wearable } from "../../../api";
import { useFormData, useFormError } from "../../../hooks";
import { ntc } from "../../../utils";
import { ModalForm } from "."
import PianopetBase from "../../PianopetBase";
import { Input, Submit } from "../../Form";

export const ManageColor = ({ user: teacher, wearable, cancel, refreshData }) => {
    const addingNew = !wearable;
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16);
    const [formData, updateFormData] = useFormData({
        teacherCode: wearable?.teacherCode ?? teacher._id,
        name: wearable?.name ?? '',
        src: wearable?.src ?? randomHex,
        value: wearable?.value ?? '',
        category: 0
    });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const colorInput = useRef(null);
    const handleSubmit = () => {
        if (addingNew) return Wearable.createWearable(formData);
        return Wearable.editWearable(wearable._id, formData);
    }
    const handleSuccess = (body) => {
        console.dir(body);
        refreshData();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
                   title={addingNew ? 'Add new color' : 'Edit this color'}
                   submit={addingNew ? <Submit nvm="Back" cancel={cancel} /> : <Submit value="Save changes" />}>
            {addingNew ? 'Add a new' : 'Edit this'} color by clicking on the Pianopet icon below.
            <div className="manageColor formGrid">
                <div className="colorPicker">
                    <PianopetBase color={formData?.src} zoom={true} />
                    <input name="src" type="color" defaultValue={formData?.src} onChange={updateFormData} ref={colorInput} />
                    <span onClick={() => colorInput.current.click()}></span>
                </div>
                <Input type="text"
                       name="name"
                       label="Color name:"
                       placeholder={formData.src && `How about ${ntc.name(formData.src)[1]}?`}
                       defaultValue={formData?.name}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('name')} />
                <Input type="number"
                       name="value"
                       label="Cost:"
                       defaultValue={formData?.value}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('value')} />
            </div>
            {addingNew || <div className="tip" style={{ marginTop: '1rem' }}>Tip: Clear the text box to see color name suggestions!</div>}
        </ModalForm>
    );
}