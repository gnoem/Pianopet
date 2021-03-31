import "./formStore.css";
import { useState } from "react";
import { Student, Category, Badge, Wearable, Homework } from "../../../api";
import { useFormData, useFormError } from "../../../hooks";
import { formatNumber } from "../../../utils";
import { Form, Input, Submit } from "../../Form";
import { StudentDropdown } from "../../Dropdown/index.js";
import { ManageWearable } from "./ManageWearable";
import dayjs from "dayjs";
import { Coins } from "../../Coins";
import { ManageColor } from "./ManageColor";
import Splat from "../../Splat";
import PianopetBase from "../../PianopetBase";

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
    createColor: (props) => <ManageColor {...props} />,
    editColor: (props) => <ManageColor {...props} />,
    deleteWearable: (props) => <DeleteWearable {...props} />,
    buyWearable: (props) => <BuyWearable {...props} />,
    createCategory: (props) => <CreateCategory {...props} />,
    editCategory: (props) => <EditCategory {...props} />,
    deleteCategory: (props) => <DeleteCategory {...props} />,
    createBadge: (props) => <CreateBadge {...props} />,
    editBadge: (props) => <EditBadge {...props} />,
    deleteBadge: (props) => <DeleteBadge {...props} />,
    awardBadge: (props) => <AwardBadge {...props} />
}

const ManageHomework = ({ student, homework, refreshHomework }) => {
    const addingNew = !homework;
    const emptyAssignment = { label: '', progress: 0, recorded: false };
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
                progress: prevArray[index].progress,
                recorded: prevArray[index].recorded
            }
            arrayToReturn[index] = assignment;
            return arrayToReturn;
        }
        setFormDataDirectly(prevState => ({
            ...prevState,
            assignments: updatedAssignmentsArray(prevState?.assignments)
        }));
    }
    const handleSubmit = () => {
        if (addingNew) return Homework.createHomework(formData);
        else return Homework.editHomework(homework._id, formData)
    }
    const handleSuccess = () => {
        refreshHomework();
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

const DeleteHomework = ({ homework, refreshHomework }) => {
    const handleSubmit = () => Homework.deleteHomework(homework._id);
    const handleSuccess = () => refreshHomework();
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Are you sure?"
              submit={<Submit value="Yes, I'm sure" />}>
            Are you sure you want to delete this homework? This action cannot be undone.
        </ModalForm>
    );
}

const DeleteWearable = ({ wearable, element, refreshData }) => {
    const isColor = wearable && !wearable.image;
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
            <div>Are you sure you want to delete the {isColor ? 'color' : 'wearable'} <b>{wearable.name}</b>? This will remove it from the inventories of any students who have purchased it. This action cannot be undone.</div>
            {isColor
                ? <Splat color={wearable.src} /> // OR: <PianopetBase zoom={true} color={wearable.src} />
                : <img src={wearable.src} alt={wearable.name} />}
        </ModalForm>
    );
}

const BuyWearable = ({ user: student, wearable, refreshData, closeModal }) => {
    const isColor = !wearable.image;
    const handleSubmit = () => {
        return Student.updateCloset(student._id, {
            wearableId: wearable._id,
            wearableCost: wearable.value
        });
    }
    const handleSuccess = () => {
        refreshData();
    }
    const remainder = student.coins - wearable.value;
    if (remainder < 0) return (
        <div>
            <h2>Not enough coins</h2>
            You don't have enough coins to buy this item!
            <Submit onClick={closeModal} value="Close" cancel={false} />
        </div>
    );
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess}
              title="Confirm purchase"
              className="hasImage"
              submit={<Submit value="Yes, I'm sure" />}>
            <div>Are you sure you want to purchase the {isColor ? 'color' : 'wearable'} <b>{wearable.name}</b> for <Coins inline={true}>{wearable.value}</Coins>? This will leave you with <Coins inline={true}>{remainder}</Coins>.</div>
            {isColor
                ? <Splat color={wearable.src} /> // OR: <PianopetBase zoom={true} color={wearable.src} />
                : <img src={wearable.src} alt={wearable.name} />}
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
    const [formData, updateFormData] = useFormData({
        teacherCode: category.teacherCode,
        name: category.name
    });
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

const AwardBadge = ({ students, badge, refreshData }) => {
    const [recipientId, setRecipientId] = useState(null);
    const [error, setError] = useState({});
    const handleSubmit = () => Student.updateBadges(recipientId, { badgeId: badge._id });
    const handleSuccess = () => {
        refreshData();
    }
    return (
        <ModalForm onSubmit={handleSubmit} handleSuccess={handleSuccess} handleFormError={setError}
              title="Award badge">
            <p>Choose a student to award this badge to:</p>
            <div style={{ textAlign: 'center' }}>
                <StudentDropdown students={students} onChange={setRecipientId} error={error.student} />
            </div>
        </ModalForm>
    );
}