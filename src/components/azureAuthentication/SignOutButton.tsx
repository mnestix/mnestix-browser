import { useMsal } from '@azure/msal-react';
import { IPublicClientApplication } from '@azure/msal-browser';

function handleLogout(instance: IPublicClientApplication) {
    instance.logoutPopup().catch((e) => {
        console.error(e);
    });
}

/**
 * Renders a button which, when selected, will open a popup for logout
 */
const SignOutButton = () => {
    const { instance } = useMsal();

    return <button onClick={() => handleLogout(instance)}>Sign out Azure</button>;
};

export default SignOutButton;
