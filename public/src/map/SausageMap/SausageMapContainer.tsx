import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import SausageMap from "./SausageMap"
import { IStore, IElection, IMapPollingPlace, IPollingPlace } from "../../redux/modules/interfaces"

import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { setCurrentElection, getURLSafeElectionName } from "../../redux/modules/elections"

export interface IStoreProps {
    elections: Array<IElection>
    currentElection: IElection
}

export interface IDispatchProps {
    onChooseElection: Function
    fetchQueriedPollingPlaces: Function
}

export interface IStateProps {
    isElectionChooserOpen: boolean
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { isElectionChooserOpen: false, queriedPollingPlaces: [], hasSeenElectionAnnouncement: false }

        this.onClickElectionChooser = this.onClickElectionChooser.bind(this)
        this.onCloseElectionChooserDialog = this.onCloseElectionChooserDialog.bind(this)
        this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
        this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
        this.onElectionAnnounceClose = this.onElectionAnnounceClose.bind(this)
    }

    componentDidMount() {
        const { currentElection } = this.props
        document.title = `Democracy Sausage | ${currentElection.name}`
    }

    onClickElectionChooser() {
        this.setState(Object.assign(this.state, { isElectionChooserOpen: true }))
    }

    onCloseElectionChooserDialog() {
        this.setState(Object.assign(this.state, { isElectionChooserOpen: false }))
    }

    onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: pollingPlaces }))
    }

    onClearQueriedPollingPlaces() {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: [] }))
    }

    onElectionAnnounceClose() {
        this.setState(Object.assign(this.state, { hasSeenElectionAnnouncement: true }))
    }

    render() {
        const { elections, currentElection, fetchQueriedPollingPlaces, onChooseElection } = this.props
        const { isElectionChooserOpen, queriedPollingPlaces, hasSeenElectionAnnouncement } = this.state

        return (
            <SausageMap
                elections={elections}
                currentElection={currentElection}
                queriedPollingPlaces={queriedPollingPlaces}
                hasSeenElectionAnnouncement={hasSeenElectionAnnouncement}
                onClickElectionChooser={this.onClickElectionChooser}
                isElectionChooserOpen={isElectionChooserOpen}
                onCloseElectionChooserDialog={this.onCloseElectionChooserDialog}
                onChooseElection={(election: IElection) => {
                    this.onCloseElectionChooserDialog()
                    onChooseElection(election)
                }}
                onChooseElectionTab={(electionId: number) => {
                    onChooseElection(elections.find((election: IElection) => election.id === electionId))
                }}
                onQueryMap={async (features: Array<IMapPollingPlace>) => {
                    const pollingPlaceIds: Array<number> = features.map((feature: IMapPollingPlace) => feature.id)
                    const pollingPlaces = await fetchQueriedPollingPlaces(currentElection, pollingPlaceIds)
                    this.onSetQueriedPollingPlaces(pollingPlaces)
                }}
                onCloseQueryMapDialog={() => this.onClearQueriedPollingPlaces()}
                onElectionAnnounceClose={() => this.onElectionAnnounceClose()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onChooseElection(election: IElection) {
            dispatch(setCurrentElection(election.id))
            browserHistory.push(getURLSafeElectionName(election))
        },
        fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
            return await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))
        },
    }
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
