import * as React from "react"
import { connect } from "react-redux"
import { getLiveElections, IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import AddStall from "./AddStall"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {
    liveElections: Array<IElection>
}

export interface IStateProps {
    formSubmitted: boolean
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
export class AddStallFormContainer extends React.Component<TComponentProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { formSubmitted: false }

        this.onStallAdded = this.onStallAdded.bind(this)
    }

    componentDidMount() {
        document.title = "Democracy Sausage | Report your sausage sizzle or cake stall"
    }

    onStallAdded() {
        this.setState({ formSubmitted: true })
    }

    render() {
        const { liveElections } = this.props
        const { formSubmitted } = this.state

        const showNoLiveElections = liveElections.length === 0

        return (
            <AddStall
                showNoLiveElections={showNoLiveElections}
                showWelcome={!formSubmitted && !showNoLiveElections}
                showThankYou={formSubmitted && !showNoLiveElections}
                showForm={!formSubmitted && !showNoLiveElections}
                onStallAdded={this.onStallAdded}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    return {
        liveElections: getLiveElections(state),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const AddStallFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(AddStallFormContainer)

export default AddStallFormContainerWrapped
