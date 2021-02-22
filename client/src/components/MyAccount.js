import { useState, useEffect, useRef } from 'react';
import Button from './Button';

export default function MyAccount(props) {
    const { user, userType } = props;
    const [formData, setFormData] = useState({
        role: userType,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        username: user.username ?? '',
        email: user.email ?? '',
        profilePic: user.profilePic || '',
    });
    const [formSuccess, setFormSuccess] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordFormSuccess, setPasswordFormSuccess] = useState(false);
    const changePasswordForm = useRef(null);
    useEffect(() => {
        // todo if (passwordFormSuccess) then password form is cleared and button needs to be disabled again
    }, [passwordFormSuccess]);
    const updateFormData = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const updatePasswordFormData = (e) => {
        setPasswordFormData(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    }
    const passwordsMatch = () => {
        const { newPassword, confirmNewPassword } = passwordFormData;
        if (newPassword === '' || confirmNewPassword === '') return false;
        if (newPassword === confirmNewPassword) return true;
        return false;
    }
    const handleSubmit = async () => {
        const response = await fetch(`/${userType}/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        if (userType === 'teacher') props.refreshTeacher();
        else props.refreshData();
        setFormSuccess(true);
        setFormSuccess(false);
    }
    const handleChangePassword = async () => {
        if (!passwordsMatch()) return;
        const { newPassword } = passwordFormData;
        const response = await fetch(`/${userType}/${user._id}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: userType,
                newPassword
            })
        });
        const body = await response.json();
        if (!body) return console.log('no response from server');
        if (!body.success) return console.log('no success response from server');
        if (userType === 'teacher') props.refreshTeacher();
        else props.refreshData();
        setPasswordFormSuccess(true);
        setPasswordFormSuccess(false);
        setTimeout(() => {
            changePasswordForm.current.reset();
        }, 2000);
    }
    return (
        <div className="Main MyAccount">
            <h1>My Account</h1>
            <form className="dark divide" autoComplete="off">
                <h2>Edit account details</h2>
                <div className="profilePic">
                    <img alt="profile pic" src={user.profilePic || 'assets/defaultpfp.jpg'} />
                    <div>
                        <label htmlFor="profilePic">Profile picture:</label>
                        <input
                          name="profilePic"
                          type="text"
                          defaultValue={user.profilePic}
                          onChange={updateFormData} />
                    </div>
                </div>
                <div className="half">
                    <div>
                        <label htmlFor="firstName">First name:</label>
                        <input
                          name="firstName"
                          type="text"
                          defaultValue={user.firstName}
                          onChange={updateFormData} />
                    </div>
                    <div>
                        <label htmlFor="lastName">Last name:</label>
                        <input
                          name="lastName"
                          type="text"
                          defaultValue={user.lastName}
                          onChange={updateFormData} />
                    </div>
                </div>
                <div className="half">
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input
                          name="username"
                          type="text"
                          defaultValue={user.username}
                          onChange={updateFormData} />
                    </div>
                    <div>
                        <label htmlFor="email">Email address:</label>
                        <input
                          name="email"
                          type="text"
                          defaultValue={user.email}
                          onChange={updateFormData} />
                    </div>
                </div>
                <Button type="submit" success={formSuccess} onClick={handleSubmit}>Save Changes</Button>
            </form>
            <form className="dark divide" autoComplete="off" ref={changePasswordForm}>
                <h2>Change password</h2>
                <div className="half">
                    <div>
                        <label htmlFor="newPassword">New password:</label>
                        <input name="newPassword" type="password" onInput={updatePasswordFormData} />
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword">Confirm new password:</label>
                        <input name="confirmNewPassword" type="password" onInput={updatePasswordFormData} />
                    </div>
                </div>
                <Button type="submit" success={passwordFormSuccess} onClick={handleChangePassword} disabled={!passwordsMatch()}>Save Changes</Button>
            </form>
        </div>
    );
}