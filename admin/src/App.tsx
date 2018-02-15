import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import { IAppModule, ISnackbarsModule, IElections, IElection, IUser } from "./redux/modules/interfaces"
import "./App.css"

import SelectField from "material-ui/SelectField"
// import MenuItem from "material-ui/MenuItem"

// import AutoComplete from "material-ui/AutoComplete"
import { List, ListItem } from "material-ui/List"
import Badge from "material-ui/Badge"
import ContentInbox from "material-ui/svg-icons/content/inbox"
import ActionGrade from "material-ui/svg-icons/action/grade"
import ContentSend from "material-ui/svg-icons/content/send"
import ContentDrafts from "material-ui/svg-icons/content/drafts"

import AppBar from "material-ui/AppBar"
import { ToolbarGroup } from "material-ui/Toolbar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"
import IconMenu from "material-ui/IconMenu"
import MenuItem from "material-ui/MenuItem"
import IconButton from "material-ui/IconButton"
import FlatButton from "material-ui/FlatButton"
import ActionFace from "material-ui/svg-icons/action/face"
import ActionExitToApp from "material-ui/svg-icons/action/exit-to-app"

// const logo = require("./logo.svg")

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
`

const TitleLogo = styled.img`
    width: 35px; /* 80% */
    height: 32px;
    margin-right: 10px;
`

const HiddenIconButton = styled(IconButton)`
    width: 0px !important;
    height: 0px !important;
    padding: 0px !important;
`

const HeaderBarButton = styled(FlatButton)`
    color: #ffffff !important;
    margin: 4px 0px !important;
`

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
    elections: IElections
    currentElection: IElection
    pendingStallCount: number
    handleSnackbarClose: any
    onChangeElection: any
    doLogout: any
    content: any
}

class App extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            app,
            user,
            snackbars,
            elections,
            currentElection,
            pendingStallCount,
            handleSnackbarClose,
            doLogout,
            onChangeElection,
            content,
        } = this.props

        const styles: React.CSSProperties = {
            linearProgressStyle: {
                position: "fixed",
                top: "0px",
                zIndex: 1200,
                display: app.requestsInProgress > 0 ? "block" : "none",
            },
        }

        return (
            <div className="page">
                <div className="page-header">
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={styles.linearProgressStyle} />
                    <AppBar
                        title={
                            <TitleContainer>
                                <TitleLogo src="/sausage+cake_big.png" /> Democracy Sausage Admin Console
                            </TitleContainer>
                        }
                        iconElementRight={
                            <ToolbarGroup>
                                <HeaderBarButton label="Home" containerElement={<Link to={"/"} />} />
                                {user !== null && <HeaderBarButton label={user.email} icon={<ActionFace color={"white"} />} />}
                                {user !== null && (
                                    <IconMenu iconButtonElement={<HiddenIconButton />}>
                                        <MenuItem primaryText="Logout" leftIcon={<ActionExitToApp />} onClick={doLogout} />
                                    </IconMenu>
                                )}
                            </ToolbarGroup>
                        }
                    />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <LoginDialog open={user === null} />
                    <main className="page-main-content">{content || this.props.children}</main>
                    <nav className="page-nav">
                        <List>
                            <ListItem disabled={true} leftIcon={<ContentInbox />}>
                                <SelectField floatingLabelText="Elections" value={currentElection.id} onChange={onChangeElection}>
                                    {Object.keys(elections)
                                        .map(k => elections[k])
                                        .sort((a: IElection, b: IElection) => b.id - a.id)
                                        .map((election: IElection) => (
                                            <MenuItem key={election.id} value={election.id} primaryText={election.name} />
                                        ))}
                                </SelectField>
                            </ListItem>

                            <ListItem
                                primaryText="Review Pending Stalls"
                                leftIcon={<ContentSend />}
                                rightIcon={<Badge badgeContent={pendingStallCount} secondary={true} />}
                                containerElement={<Link to={`/stalls`} />}
                            />
                            <ListItem
                                primaryText="Edit Polling Places"
                                leftIcon={<ActionGrade />}
                                containerElement={<Link to={`/election/${currentElection.id}/polling_places/`} />}
                            />
                            <ListItem
                                primaryText="Edit Polling Place Types"
                                leftIcon={<ContentDrafts />}
                                containerElement={<Link to={`/election/${currentElection.id}/polling_place_types`} />}
                            />
                            <ListItem
                                primaryText="Election Management"
                                leftIcon={<ContentInbox />}
                                containerElement={<Link to={`/elections`} />}
                            />
                            {/* <ListItem primaryText="User Management" leftIcon={<ContentInbox />} /> */}
                        </List>
                    </nav>
                </div>
                <Snackbar
                    open={snackbars.open}
                    message={snackbars.active.message}
                    action={snackbars.active.action}
                    autoHideDuration={snackbars.active.autoHideDuration}
                    onActionTouchTap={() => {
                        if ("onActionTouchTap" in snackbars.active) {
                            snackbars.active.onActionTouchTap!()
                        }
                    }}
                    onRequestClose={handleSnackbarClose}
                />
            </div>
        )
    }
}

export default App
