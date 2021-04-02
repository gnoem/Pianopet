import { useState } from "react";
import { User } from "../../api";
import { useFormData, useFormError } from "../../hooks";
import { Form, Input, Submit } from "../Form";

const notAllowed = { type: 'not-allowed', message: "You don't have permission to edit this. Contact your teacher if you would like to make changes!" };

export const AccountDetails = ({ user, isStudent, refreshData }) => {
    const [formData, updateFormData] = useFormData({
        role: isStudent ? 'student' : 'teacher',
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        username: user?.username ?? '',
        profilePic: user?.profilePic ?? '',
    });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.editAccount(user._id, formData);
    const onSuccess = ({ user }) => {
        console.dir(user);
        refreshData();
    }
    return (
        <Form onSubmit={handleSubmit} handleSuccess={onSuccess} handleFormError={updateFormError}
              title="Edit account details"
              submit={<Submit value="Save Changes" cancel={false} />}>
            <div className="profilePic">
                <img alt="profile pic" src={formData.profilePic || 'assets/defaultpfp.jpg'} />
                <Input type="text"
                       name="profilePic"
                       label="Profile picture URL:"
                       defaultValue={formData.profilePic}
                       onChange={updateFormData} />
            </div>
            <div className="half">
                <Input type="text"
                       name="firstName"
                       label="First name:"
                       defaultValue={formData.firstName}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('firstName')} />
                <Input type="text"
                       name="lastName"
                       label="Last name:"
                       defaultValue={formData.lastName}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('lastName')} />
            </div>
            <div className="half">
                <Input type="text"
                       name="username"
                       label="Username:"
                       defaultValue={formData.username}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       disabled={isStudent}
                       inputHint={isStudent ? notAllowed : warnFormError('username')} />
                <Input type="text"
                       name="email"
                       label="Email address:"
                       defaultValue={formData.email}
                       onChange={updateFormData}
                       onInput={resetFormError}
                       inputHint={warnFormError('email')} />
            </div>
        </Form>
    );
}

export const ChangePassword = ({ user, isStudent, refreshData }) => {
    const [reset, setReset] = useState(false);
    const [formData, updateFormData, _, resetFormData] = useFormData({
        role: isStudent ? 'student' : 'teacher'
    });
    const [updateFormError, resetFormError, warnFormError] = useFormError({});
    const handleSubmit = () => User.changePassword(user._id, formData);
    const onSuccess = () => {
        resetForm();
        refreshData();
    }
    const passwordsMatch = (() => {
        if (!formData) return false;
        const { newPassword, confirmNewPassword } = formData;
        if (!newPassword || !confirmNewPassword) return false;
        if (newPassword === confirmNewPassword) return true;
        return false;
    })();
    const resetForm = () => {
        resetFormData();
        setReset(true);
    }
    const submit = (
        <Submit
            value="Save Changes"
            disabled={!passwordsMatch}
            cancel={passwordsMatch && resetForm} />
    );
    return (
        <Form onSubmit={handleSubmit} handleSuccess={onSuccess} handleFormError={updateFormError}
              title="Change password"
              {...{ submit, reset, updateReset: setReset }}>
            <div className="half">
                <Input type="password"
                       name="newPassword"
                       label="New password:"
                       onChange={updateFormData}
                       onInput={resetFormError}
                       disabled={isStudent}
                       inputHint={isStudent ? notAllowed : warnFormError('newPassword')} />
                <Input type="password"
                       name="confirmNewPassword"
                       label="Confirm new password:"
                       onChange={updateFormData}
                       onInput={resetFormError}
                       disabled={isStudent}
                       inputHint={isStudent ? notAllowed : warnFormError('confirmNewPassword')} />
            </div>
        </Form>
    );
}