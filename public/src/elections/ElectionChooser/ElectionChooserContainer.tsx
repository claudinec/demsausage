import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { getLiveElections, getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import ElectionChooser from "./ElectionChooser"

export interface IProps {
    pageTitle: string
    pageBaseURL: string
}

export interface IDispatchProps {
    onChooseElection: Function
}

export interface IStoreProps {
    elections: Array<IElection>
    liveElections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    browserBreakpoint: string
}

export interface IStateProps {
    isElectionChooserOpen: boolean
}

export class ElectionChooserContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { isElectionChooserOpen: false }

        this.onOpenElectionChooser = this.onOpenElectionChooser.bind(this)
        this.onCloseElectionChooserDialog = this.onCloseElectionChooserDialog.bind(this)

        document.title = `${props.pageTitle} | ${props.currentElection.name}`
    }

    onOpenElectionChooser() {
        gaTrack.event({
            category: "ElectionChooserContainer",
            action: "onOpenElectionChooser",
        })
        this.setState({ isElectionChooserOpen: true })
    }

    onCloseElectionChooserDialog() {
        gaTrack.event({
            category: "ElectionChooserContainer",
            action: "onCloseElectionChooserDialog",
        })
        this.setState({ isElectionChooserOpen: false })
    }

    componentWillUpdate(nextProps: IProps & IStoreProps & IDispatchProps) {
        document.title = `${nextProps.pageTitle} | ${nextProps.currentElection.name}`
    }

    render() {
        const { pageBaseURL, elections, liveElections, currentElection, browserBreakpoint, onChooseElection } = this.props
        const { isElectionChooserOpen } = this.state

        return (
            <ElectionChooser
                elections={elections}
                liveElections={liveElections}
                currentElection={currentElection}
                isElectionChooserOpen={isElectionChooserOpen}
                browserBreakpoint={browserBreakpoint}
                onOpenElectionChooser={this.onOpenElectionChooser}
                onCloseElectionChooserDialog={this.onCloseElectionChooserDialog}
                onChooseElection={(election: IElection) => {
                    this.onCloseElectionChooserDialog()
                    gaTrack.event({
                        category: "ElectionChooserContainer",
                        action: "onChooseElectionFromDialog",
                    })
                    onChooseElection(election, pageBaseURL)
                }}
                onChooseElectionTab={(electionId: number) => {
                    // Navigate to the Current Elections tab (and change our current election to the defaultElection)
                    if (electionId === -1) {
                        gaTrack.event({
                            category: "ElectionChooserContainer",
                            action: "onChooseCurrentElectionsTab",
                            label: "Go to Current Elections",
                        })
                        browserHistory.push(pageBaseURL)
                    } else {
                        // Navigate to the election chosen by the user
                        gaTrack.event({
                            category: "ElectionChooserContainer",
                            action: "onClickElectionTab",
                            label: "Go to a specific election",
                        })
                        onChooseElection(elections.find((election: IElection) => election.id === electionId), pageBaseURL)
                    }
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections, browser } = state

    return {
        elections: elections.elections,
        liveElections: getLiveElections(state),
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        browserBreakpoint: browser.mediaType,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onChooseElection(election: IElection, pageBaseURL: string) {
            browserHistory.push(`${pageBaseURL}/${getURLSafeElectionName(election)}`)
        },
    }
}

const ElectionChooserContainerWrapped = connect<IStoreProps, IDispatchProps, IProps>(
    // @ts-ignore
    mapStateToProps,
    mapDispatchToProps
)(ElectionChooserContainer)

export default ElectionChooserContainerWrapped
