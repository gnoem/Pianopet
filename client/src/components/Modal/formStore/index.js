import "./formStore.css";
import dayjs from "dayjs";
import { Category, Badge, Wearable } from "../../../api";
import { useFormData, useFormError } from "../../../hooks";
import { Form, Input, Submit } from "../../Form";
import { ManageWearable } from "./ManageWearable";

export const ModalForm = (props) => {
    const { children } = props;
    return (
        <Form modal={true} {...props}>
            {children}
        </Form>
    );
}

export const formStore = {
    createHomework: (props) => <ManageHomework {...props} />,
    editHomework: (props) => <ManageHomework {...props} />,
    deleteHomework: (props) => <DeleteHomework {...props} />,
    createWearable: (props) => <ManageWearable {...props} />,
    editWearable: (props) => <ManageWearable {...props} />,
    deleteWearable: (props) => <DeleteWearable {...props} />,
    createCategory: (props) => <CreateCategory {...props} />,
    editCategory: (props) => <EditCategory {...props} />,
    deleteCategory: (props) => <DeleteCategory {...props} />,
    createBadge: (props) => <CreateBadge {...props} />,
    editBadge: (props) => <EditBadge {...props} />,
    deleteBadge: (props) => <DeleteBadge {...props} />
}

// Homework
// Wearable

const ManageHomework = ({ user: student, homework }) => {
    const addingNew = !homework;
    const emptyAssignment = { label: '', progress: 0 };
    const defaultAssignments = ['', '', '', ''].map(() => emptyAssignment)
    const [formData, updateFormData, setFormDataDirectly] = useFormData({
        studentId: homework?.studentId ?? student._id,
        date: homework?.date?.split('T')[0] ?? dayjs().format('YYYY-MM-DD'),
        headline: homework?.headline ?? '',
        assignments: homework?.assignments ?? defaultAssignments
    });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const updateAssignment = (index, value) => {
        const updatedAssignmentsArray = (prevArray = defaultAssignments) => {
            const arrayToReturn = [...prevArray];
            const assignment = {
                label: value,
                progress: 0
            }
            arrayToReturn[index] = assignment;
            return arrayToReturn;
        }
        setFormDataDirectly(prevState => ({
            ...prevState,
            assignments: updatedAssignmentsArray(prevState?.assignments)
        }));
    }
    const handleSubmit = async () => {
        if (addingNew) return console.log('adding new homework');
        return console.log('editing existing homework');
    }
    const handleSuccess = () => {
        console.log('success');
        //refreshData(); // refresh homework!
        //closeModal();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
              title={addingNew ? 'Add new homework' : 'Edit this homework'}>
            <div className="homeworkForm">
                <Input type="date"
                       name="date"
                       label="Date:"
                       defaultValue={formData?.date}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('date')} />
                <Input type="text"
                       name="headline"
                       label="Headline:"
                       defaultValue={formData?.headline}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('headline')} />
                <div className="homeworkAssignments">
                    <label htmlFor="assignments">Assignments:</label>
                    <Input type="text"
                           name="assignment1"
                           label="1."
                           defaultValue={formData?.assignments[0]?.label ?? ''}
                           onChange={(e) => updateAssignment(0, e.target.value)}
                           onInput={resetFormError}
                           inputHint={warnFormError('assignment1')} />
                    <Input type="text"
                           name="assignment2"
                           label="2."
                           defaultValue={formData?.assignments[1]?.label ?? ''}
                           onChange={(e) => updateAssignment(1, e.target.value)}
                           onInput={resetFormError}
                           inputHint={warnFormError('assignment2')} />
                    <Input type="text"
                           name="assignment3"
                           label="3."
                           defaultValue={formData?.assignments[2]?.label ?? ''}
                           onChange={(e) => updateAssignment(2, e.target.value)}
                           onInput={resetFormError}
                           inputHint={warnFormError('assignment3')} />
                    <Input type="text"
                           name="assignment4"
                           label="4."
                           defaultValue={formData?.assignments[3]?.label ?? ''}
                           onChange={(e) => updateAssignment(3, e.target.value)}
                           onInput={resetFormError}
                           inputHint={warnFormError('assignment4')} />
                </div>
            </div>
        </ModalForm>
    );
}

const DeleteHomework = ({ refreshData }) => {
    const handleSubmit = () => Promise.resolve('deleting hoemwork');
    const handleSuccess = () => refreshData();
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Are you sure?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete this homework? This action cannot be undone.
        </ModalForm>
    );
}

const DeleteWearable = ({ wearable, element, refreshData }) => {
    const handleSubmit = () => Wearable.deleteWearable(wearable._id);
    const handleSuccess = () => {
        if (element) {
            element.classList.add('goodbye');
            setTimeout(() => {
                refreshData();
            }, 200);
            return;
        }
        refreshData();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Are you sure?"
              className="hasImage"
              submit={<Submit value="Yes, I'm sure" />}>
            <div>Are you sure you want to delete the wearable <b>{wearable.name}</b>? This will remove it from the inventories of any students who have purchased it. This action cannot be undone.</div>
            <img src={wearable.src} alt={wearable.name} />
        </ModalForm>
    );
}

const CreateCategory = ({ user: teacher, refreshData }) => {
    const [formData, updateFormData] = useFormData({ teacherCode: teacher._id });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Category.createCategory(formData);
    const handleSuccess = () => refreshData();
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
              title="Create new category">
            <Input type="text"
                   name="name"
                   label="Category name:"
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('name')} />
        </ModalForm>
    );
}

const EditCategory = ({ category, refreshData }) => {
    const [formData, updateFormData] = useFormData({ name: category.name });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Category.editCategory(category._id, formData);
    const handleSuccess = () => refreshData();
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
              title="Edit this category">
            <Input type="text"
                   name="name"
                   label="Category name:"
                   defaultValue={formData.name}
                   onChange={updateFormData}
                   onInput={resetFormError}
                   inputHint={warnFormError('name')} />
        </ModalForm>
    );
}

const DeleteCategory = ({ category, wearables, refreshData }) => {
    const handleSubmit = () => Category.deleteCategory(category._id);
    const handleSuccess = (result) => {
        console.log(result);
        refreshData();
    }
    const categoryIsEmpty = (() => {
        const someWearableHasCategory = wearables.find(wearable => wearable.category === category._id);
        if (someWearableHasCategory) return false;
        return true;
    })();
    if (!categoryIsEmpty) return (
        <div>
            can't delete this category because it contains  wearlbles
        </div>
    );
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Are you sure?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete the category <b>{category.name}</b>? This action cannot be undone.
        </ModalForm>
    );
}

const CreateBadge = ({ user: teacher, refreshData, closeModal }) => {
    const [formData, updateFormData] = useFormData({ teacherCode: teacher._id });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => Badge.createBadge(formData);
    const handleSuccess = () => {
        refreshData();
        closeModal();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
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
        </ModalForm>
    );
}

const EditBadge = ({ badge, refreshData, closeModal }) => {
    const { _id, name, src, value } = badge;
    const [formData, updateFormData] = useFormData({ name, src, value });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    if (!badge) return null;
    const handleSubmit = () => Badge.editBadge(_id, formData);
    const handleSuccess = () => {
        refreshData();
        closeModal();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={updateFormError}
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
        </ModalForm>
    );
}

const DeleteBadge = ({ badge, element, refreshData }) => {
    const handleSubmit = () => Badge.deleteBadge(badge._id);
    const handleSuccess = () => {
        if (element) {
            element.classList.add('goodbye');
            setTimeout(() => {
                refreshData();
            }, 200);
            return;
        }
        refreshData();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Are you sure?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete this badge? This action cannot be undone.
        </ModalForm>
    );
}