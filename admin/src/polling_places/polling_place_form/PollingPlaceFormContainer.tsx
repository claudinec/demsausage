import { cloneDeep } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
// import { formValueSelector, getFormValues, isDirty, initialize, submit, change } from "redux-form"
import { isDirty, submit } from "redux-form"
import { IElection } from "../../redux/modules/elections"
import {
    buildNomsObject,
    IPollingPlace,
    IPollingPlaceFacilityType,
    pollingPlaceHasReports,
    updatePollingPlace,
} from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { IStall } from "../../redux/modules/stalls"
import { deepValue } from "../../utils"
import PollingPlaceForm from "./PollingPlaceForm"

export interface IProps {
    election: IElection
    stall?: IStall
    pollingPlace: IPollingPlace
    onPollingPlaceEdited: Function
}

export interface IDispatchProps {
    onFormSubmit: Function
    onSaveForm: Function
}

export interface IStoreProps {
    isDirty: boolean
    pollingPlaceTypes: IPollingPlaceFacilityType[]
}

export interface IStateProps {}

interface IOwnProps {}

const toFormValues = (pollingPlace: IPollingPlace): any => {
    return {
        ...buildNomsObject(pollingPlace.stall !== null ? pollingPlace.stall.noms : null),
        name: deepValue(pollingPlace, "stall.name"),
        description: deepValue(pollingPlace, "stall.description"),
        website: deepValue(pollingPlace, "stall.website"),
        extra_info: deepValue(pollingPlace, "stall.extra_info"),
        source: deepValue(pollingPlace, "stall.source"),
        facility_type: deepValue(pollingPlace, "facility_type"),
    }
}

const fromFormValues = (formValues: any) => {
    return {
        stall: {
            noms: buildNomsObject(formValues),
            name: formValues.name || "",
            description: formValues.description || "",
            website: formValues.website || "",
            extra_info: formValues.extra_info || "",
            source: formValues.source || "",
        },
        facility_type: formValues.facility_type,
    }
}

export class PollingPlaceFormContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    initialValues: any

    canStallPropsBeMerged() {
        const { pollingPlace, stall } = this.props
        return stall !== undefined && pollingPlaceHasReports(pollingPlace) === false
    }

    getInitialValues(pollingPlace: IPollingPlace, stall?: IStall) {
        // Each layer mounts this component anew, so store their initial layer form values.
        // e.g. For use in resetting the form state (Undo/Discard Changes)
        let initialValues = cloneDeep(toFormValues(pollingPlace))

        // If there's no reports for this polling place yet then we can
        // safely merge in the stall's props
        if (stall !== undefined && this.canStallPropsBeMerged()) {
            initialValues.bbq = stall.noms.bbq
            initialValues.cake = stall.noms.cake
            initialValues.coffee = stall.noms.coffee
            initialValues.halal = stall.noms.halal
            initialValues.vego = stall.noms.vego
            initialValues.bacon_and_eggs = stall.noms.bacon_and_eggs
            initialValues.free_text = stall.noms.free_text
            initialValues.name = stall.name
            initialValues.description = stall.description
            initialValues.website = stall.website
            initialValues.source = "Direct"
            initialValues.extra_info = ""
        }

        return initialValues
    }

    componentWillReceiveProps(nextProps: IProps & IStoreProps & IDispatchProps) {
        if (this.props.pollingPlace.id !== nextProps.pollingPlace.id || this.props.election.id !== nextProps.election.id) {
            this.initialValues = this.getInitialValues(nextProps.pollingPlace, nextProps.stall)
        }
    }

    componentWillMount() {
        this.initialValues = this.getInitialValues(this.props.pollingPlace, this.props.stall)
    }

    render() {
        const { election, pollingPlace, onPollingPlaceEdited, isDirty, pollingPlaceTypes, onFormSubmit, onSaveForm } = this.props

        return (
            <PollingPlaceForm
                election={election}
                pollingPlace={pollingPlace}
                initialValues={this.initialValues}
                isDirty={isDirty}
                stallWasMerged={this.canStallPropsBeMerged()}
                pollingPlaceTypes={pollingPlaceTypes}
                onSubmit={(values: object, dispatch: Function, props: IProps) => {
                    onFormSubmit(values, election, pollingPlace, onPollingPlaceEdited)
                }}
                onSaveForm={() => {
                    onSaveForm(pollingPlace, isDirty)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { polling_places } = state

    return {
        isDirty: isDirty("pollingPlace")(state),
        pollingPlaceTypes: polling_places.types,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        async onFormSubmit(values: object, election: IElection, pollingPlace: IPollingPlace, onPollingPlaceEdited: Function) {
            const pollingPlaceNew /* Partial<IPollingPlace> */ = fromFormValues(values)

            const json = await dispatch(updatePollingPlace(election, pollingPlace, pollingPlaceNew))
            if (json) {
                onPollingPlaceEdited()
            }
            // dispatch(initialize("layerForm", layerFormValues, false))
        },
        onSaveForm: (pollingPlace: IPollingPlace, isDirty: boolean) => {
            dispatch(submit("pollingPlace"))
        },
    }
}

const PollingPlaceFormContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceFormContainer)

export default PollingPlaceFormContainerWrapped
