import * as dotProp from "dot-prop-immutable"
import { memoize } from "lodash-es"
import { createSelector } from "reselect"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IAPIClient } from "../../shared/api/APIClient"
import { IGeoJSONPoint } from "./interfaces"
import { INoms } from "./polling_places"
import { IStore } from "./reducer"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_PENDING = "ealgis/stalls/LOAD_PENDING"
const REMOVE = "ealgis/stalls/REMOVE"

const initialState: Partial<IModule> = {
    pending: [] as Array<IPendingStall>,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_PENDING:
            return dotProp.set(state, "pending", action.stalls)
        case REMOVE:
            const pending = state.pending!.filter((stall: IPendingStall) => stall.id !== action.stallId)
            return dotProp.set(state, "pending", pending)
        default:
            return state
    }
}

// Selectors
const getPendingStalls = (state: IStore) => state.stalls.pending

export const getPendingStallsForCurrentElection = createSelector(
    [getPendingStalls],
    stalls =>
        memoize((electionId: number) => {
            return stalls.filter((stall: IPendingStall) => stall.election_id === electionId)
        })
)

// Action Creators
export function loadPendingStalls(stalls: Array<IPendingStall>) {
    return {
        type: LOAD_PENDING,
        stalls,
    }
}
export function removePendingStall(stallId: number) {
    return {
        type: REMOVE,
        stallId,
    }
}

// Models
export interface IModule {
    pending: Array<IPendingStall>
}

export interface IAction {
    type: string
    stalls: Array<IPendingStall>
    stallId: number
    errors?: object
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

export interface IStallLocationInfo {
    id?: number // An id is present if election.polling_places_loaded is True
    geom: IGeoJSONPoint
    name: string
    address: string
    state: string
}

export interface IStallPollingPlaceInfo {
    id: number
    name: string
    premises: string
    address: string
    state: string
}

export enum StallStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    DECLINED = "Declined",
}

export interface IStall {
    id: number
    name: string
    description: string
    website: string
    noms: INoms
    email: string
    election_id: number
    location_info: IStallLocationInfo | null
    polling_place: IStallPollingPlaceInfo | null
}

export interface IStallDiff {
    field: string
    old: any
    new: any
}

export interface IPendingStall extends IStall {
    diff: IStallDiff[] | null
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchPendingStalls() {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        const { response, json } = await api.get("/0.1/stalls/pending/", dispatch)

        if (response.status === 200) {
            dispatch(loadPendingStalls(json))
            return json.rows
        }
    }
}

export function approveStall(id: number) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        const { response, json } = await api.patch(`/0.1/stalls/${id}/approve/`, {}, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall updated! 🍽🎉"))
            dispatch(removePendingStall(id))
            // dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

export function approveStallAndAddUnofficialPollingPlace(id: number) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        const { response, json } = await api.patch(`/0.1/stalls/${id}/approve_and_add/`, {}, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall updated and new polling place added! 🍽🎉"))
            dispatch(removePendingStall(id))
            // dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

export function declineStall(id: number) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        const { response, json } = await api.patch(`/0.1/stalls/${id}/`, { status: StallStatus.DECLINED }, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall declined! 🍽🎉"))
            dispatch(removePendingStall(id))
            // dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

// Utilities
export const getStallLocationName = (stall: IStall) => {
    if (stall.polling_place !== null) {
        return stall.polling_place.premises
    }

    if (stall.location_info !== null) {
        return stall.location_info.name
    }

    return "Error: Couldn't get stall location name"
}
export const getStallLocationAddress = (stall: IStall) => {
    if (stall.polling_place !== null) {
        return stall.polling_place.address
    }

    if (stall.location_info !== null) {
        return stall.location_info.address
    }

    return "Error: Couldn't get stall location address"
}
