import { useRef } from "react";
import { useFormData } from "../../../hooks";
import { ntc } from "../../../utils";
import { ModalForm } from ".."
import { PianopetBase } from "../../Avatar/PianopetBase";
import { Input, Submit } from "../../Form";
import { WearableOptions } from "./utils";

export const ManageColor = ({ user: teacher, wearable, cancel, addingNew, formHandle, formError }) => {
    const { handleSubmit, handleSuccess } = formHandle;
    const { updateFormError, resetFormError, warnFormError } = formError;
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16);
    const [formData, updateFormData, setFormDataDirectly] = useFormData({
        teacherCode: wearable?.teacherCode ?? teacher._id,
        name: wearable?.name ?? '',
        src: wearable?.src ?? randomHex,
        value: wearable?.value ?? '',
        category: '0',
        active: wearable?.active ?? addingNew,
        flag: wearable?.flag ?? addingNew
    });
    const colorInput = useRef(null);
    return (
        <ModalForm onSubmit={() => handleSubmit(formData)} handleSuccess={handleSuccess} handleFormError={updateFormError}
                   className="manageColorForm"
                   title={addingNew ? 'Add new color' : 'Edit this color'}
                   submit={addingNew ? <Submit nvm="Back" cancel={cancel} /> : <Submit value="Save changes" />}>
            {addingNew ? 'Add a new' : 'Edit this'} color by clicking on the Pianopet icon below.
            <div className="manageColor formComponent">
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
            {addingNew || <div className="tip">Tip: Clear the text box to see color name suggestions!</div>}
            <div className="checkboxContainer">
                <WearableOptions {...{ formData, setFormDataDirectly }} />
            </div>
        </ModalForm>
    );
}