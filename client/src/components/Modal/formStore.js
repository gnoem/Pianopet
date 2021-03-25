import { Badge } from '../../api';
import { useFormData, useFormError } from '../../hooks';
import { Form, Input } from '../Form';

export const formStore = {
    createBadge: (props) => <CreateBadge {...props} />,
    editBadge: (props) => <EditBadge {...props} />
}

const CreateBadge = ({ teacher, refreshData, gracefullyCloseModal }) => {
    const [formData, updateFormData] = useFormData({ teacherCode: teacher._id });
    const [setFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Badge.createBadge(formData);
    const handleSuccess = () => {
        refreshData();
        gracefullyCloseModal();
    }
    const handleFormError = (error) => setFormError({ ...error });
    return (
        <Form onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={handleFormError}
              title="Add new badge">
            <Input type="text"
                   name="name"
                   label="Badge name:"
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('name')} />
            <Input type="text"
                   name="src"
                   label="Badge image:"
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('src')} />
            <Input type="number"
                   name="value"
                   label="Badge value:"
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('value')} />
        </Form>
    );
}

const EditBadge = ({ badge, refreshData, gracefullyCloseModal }) => {
    const { _id, name, src, value } = badge;
    const [formData, updateFormData] = useFormData({ name, src, value });
    const [setFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Badge.editBadge(_id, formData);
    const handleSuccess = () => {
        refreshData();
        gracefullyCloseModal();
    }
    const handleFormError = (error) => setFormError({ ...error });
    return (
        <Form onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={handleFormError}
              title="Edit this badge">
            <Input type="text"
                   name="name"
                   label="Badge name:"
                   defaultValue={formData?.name}
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('name')} />
            <Input type="text"
                   name="src"
                   label="Badge image:"
                   defaultValue={formData?.src}
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('src')} />
            <Input type="number"
                   name="value"
                   label="Badge value:"
                   defaultValue={formData?.value}
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('value')} />
        </Form>
    );
}