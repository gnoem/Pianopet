import { Form, Submit } from "../../Form";

export const TeacherSettings = () => {
    return (
        <div className="Settings">
            <h1>Settings</h1>
            <SettingsForm />
        </div>
    );
}

const SettingsForm = () => {
    const handleSubmit = () => Promise.resolve('yay');
    const handleSuccess = (body) => {
        console.log(body);
    }
    return (
        <Form onSubmit={handleSubmit} handleSuccess={handleSuccess}
              submit={<Submit value="Save changes" cancel={false} />}>
            <HomeworkSettings />
            <StudentSettings />
        </Form>
    );
}

const HomeworkSettings = () => {
    return (
        <div>
            <h2>Homework and assignments</h2>
            <ul>
                <li>Default # of assignments per homework</li>
                <li>Each assignment is worth _____ coins</li>
                <li>Divide assignments into chunks (y/n) - if yes, ____ chunks</li>
            </ul>
        </div>
    );
}

const StudentSettings = () => {
    return (
        <div>
            <h2>Students</h2>
            <ul>
                <li>Allow students to edit their own:</li>
                <li>profile picture</li>
                <li>first name</li>
                <li>last name</li>
                <li>email address</li>
                <li>username</li>
                <li>password</li>
            </ul>
        </div>
    );
}