import { List, ListItem } from "material-ui/List"
import { CommunicationEmail, FileFileDownload } from "material-ui/svg-icons"
import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { IStore } from "../../redux/modules/reducer"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {}

export interface IStateProps {}

const PageWrapper = styled.div`
    padding-left: 15px;
    padding-right: 15px;
`

type TComponentProps = IProps & IStoreProps & IDispatchProps
export class MediaPage extends React.Component<TComponentProps, IStateProps> {
    componentDidMount() {
        document.title = "Democracy Sausage | Media"
    }
    render() {
        return (
            <PageWrapper>
                <h2>Media</h2>
                Do you love sausage? We do!
                <List>
                    <ListItem
                        primaryText="Media Contact"
                        secondaryText="ausdemocracysausage@gmail.com"
                        secondaryTextLines={2}
                        leftIcon={<CommunicationEmail />}
                        disabled={true}
                    />

                    <h3>Media Releases</h3>
                    <ListItem
                        primaryText="Federal Election 2016"
                        leftIcon={<FileFileDownload />}
                        containerElement={<a href={"/media/Democracy%20Sausage%20-%202016%20Federal%20Election%20Release.pdf"} />}
                    />
                    <ListItem
                        primaryText="Canning By-election"
                        leftIcon={<FileFileDownload />}
                        containerElement={<a href={"/media/Canning%20Press%20Release%20-%20DemSausage.pdf"} />}
                    />
                </List>
            </PageWrapper>
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    // const { elections } = state

    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const AboutPageWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(MediaPage)

export default AboutPageWrapped
