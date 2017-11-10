import * as React from "react"
import Dialog from "material-ui/Dialog"
import { SocialLoginButton } from "../social-login-button/SocialLoginButton"

export interface LoginDialogProps {
    open: boolean
}
export interface LoginDialogState {}

export class LoginDialog extends React.Component<LoginDialogProps, LoginDialogState> {
    render() {
        const { open } = this.props
        const providerUrl = window.location.host.startsWith("localhost:")
            ? "http://localhost:8000/login.php"
            : "http://api.democracysausage.org/login.php"

        return (
            <Dialog title="Please login to access Democracy Sausage" modal={true} open={open}>
                <SocialLoginButton providerName="Google" providerUrl={providerUrl} colour={"#DD4B39"} />
            </Dialog>
        )
    }
}
