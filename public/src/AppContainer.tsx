import * as React from "react"
// import styled from "styled-components"
import {
    // deepPurple900,
    // deepPurple800,
    // deepPurple700,
    // deepPurple600,
    deepPurple500,
    deepPurple400,
    deepPurple300,
    // deepPurple200,
    deepPurple100,
    white,
    fullBlack,
    yellow500,
} from "material-ui/styles/colors"
import { fade } from "material-ui/utils/colorManipulator"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import getMuiTheme from "material-ui/styles/getMuiTheme"

import App from "./App"
import { connect } from "react-redux"
import { fetchInitialAppState, toggleSidebarState } from "./redux/modules/app"
import { getURLSafeElectionName, setCurrentElection } from "./redux/modules/elections"
import { iterate as iterateSnackbar } from "./redux/modules/snackbars"

// import CircularProgress from "material-ui/CircularProgress"
import LinearProgress from "material-ui/LinearProgress"

import { IElection } from "./redux/modules/elections"
import { IStore, IAppModule, ISnackbarsModule } from "./redux/modules/interfaces"
// const Config: IConfig = require("Config") as any

import { setDrawerOpen } from "material-ui-responsive-drawer"

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple500, // AppBar and Tabs, Buttons, Active textfield et cetera
        primary2Color: deepPurple400, // Used for the selected date in DatePicker
        primary3Color: deepPurple100, // Switch background
        accent1Color: deepPurple500, // Active tab highlight colour
        accent2Color: deepPurple400, // Toolbars and switch buttons
        accent3Color: deepPurple300, // Our app LinearProgress bar and Tabs
        textColor: fullBlack,
        alternateTextColor: white, // Buttons and Tabs
        canvasColor: white,
        borderColor: deepPurple100, // Unselected textfield, Divider, et cetera fields
        disabledColor: fade(fullBlack, 0.5), // Unselected textfield et cetera label colour
        pickerHeaderColor: deepPurple300, // Used for DatePicker
        clockCircleColor: fade(yellow500, 0.07), // Unused
        shadowColor: fullBlack,
    },
    appBar: {
        height: 50,
    },
})

export interface IStoreProps {
    // From Props
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    browser: any
    responsiveDrawer: any
}

export interface IDispatchProps {
    fetchInitialAppState: Function
    setElectionFromRoute: Function
    handleSnackbarClose: Function
    toggleSidebar: Function
    onClickDrawerLink: Function
}

export interface IStateProps {}

export interface IRouterProps {
    content: any
    location: any
}

export interface IRouteProps {
    electionName: string
}

interface IOwnProps {
    params: IRouteProps
}

const DEFAULT_BREAK_POINT = "small"
function isResponsiveAndOverBreakPoint(browser: any, responsiveDrawer: any, breakPoint: any = DEFAULT_BREAK_POINT) {
    return browser.greaterThan[breakPoint] && responsiveDrawer.responsive
}

export class AppContainer extends React.Component<IStoreProps & IDispatchProps & IRouterProps & IOwnProps, IStateProps> {
    async componentDidMount() {
        const { fetchInitialAppState, params } = this.props
        await fetchInitialAppState(params.electionName)

        document.title = "Democracy Sausage"
    }

    componentWillReceiveProps(nextProps: IStoreProps & IDispatchProps & IRouterProps & IOwnProps) {
        // Handle setting the currentElection in Redux based on route changes
        if ("params" in nextProps && "electionName" in nextProps.params && nextProps.elections.length > 0) {
            // Fallback to our default election if the route hasn't specified an election
            if (nextProps.params.electionName === undefined) {
                if (nextProps.defaultElection !== undefined) {
                    nextProps.setElectionFromRoute(nextProps.defaultElection.id)
                }
            } else {
                // Otherwise, set the election the route wants to use
                const election = nextProps.elections.find(
                    (election: IElection) => getURLSafeElectionName(election) === nextProps.params.electionName
                )
                if (election !== undefined) {
                    nextProps.setElectionFromRoute(election.id)
                }
            }
        }
    }

    render() {
        const {
            app,
            snackbars,
            elections,
            currentElection,
            browser,
            responsiveDrawer,
            handleSnackbarClose,
            toggleSidebar,
            onClickDrawerLink,
            location,
            children,
            content,
        } = this.props

        if (app.loading === true) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: "100%", height: "100%" }}>
                        <LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
                    </div>
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <App
                    muiThemePalette={muiTheme.palette}
                    app={app}
                    snackbars={snackbars}
                    elections={elections}
                    currentElection={currentElection}
                    defaultBreakPoint={DEFAULT_BREAK_POINT}
                    isResponsiveAndOverBreakPoint={isResponsiveAndOverBreakPoint(browser, responsiveDrawer)}
                    handleSnackbarClose={handleSnackbarClose}
                    toggleSidebar={toggleSidebar}
                    onClickDrawerLink={onClickDrawerLink}
                    locationPathName={location.pathname}
                    children={children}
                    content={content}
                />
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { app, snackbars, elections, browser, responsiveDrawer } = state

    return {
        app: app,
        snackbars: snackbars,
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        browser: browser,
        responsiveDrawer: responsiveDrawer,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchInitialAppState: (initialElectionName: string) => {
            dispatch(fetchInitialAppState(initialElectionName))
        },
        setElectionFromRoute: (electionId: number) => {
            dispatch(setCurrentElection(electionId))
        },
        handleSnackbarClose: (reason: string) => {
            if (reason === "timeout") {
                dispatch(iterateSnackbar())
            }
        },
        toggleSidebar: () => {
            dispatch(toggleSidebarState())
        },
        onClickDrawerLink: () => {
            dispatch(setDrawerOpen(false))
        },
    }
}

const AppContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AppContainer)

export default AppContainerWrapped
