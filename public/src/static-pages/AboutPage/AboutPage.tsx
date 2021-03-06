import { grey300, grey800 } from "material-ui/styles/colors"
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

const Question = styled.h3`
    margin-bottom: 5px;
    border-bottom: 1px solid ${grey300};
    padding-bottom: 5px;
`

const Answer = styled.div`
    margin-bottom: 25px;
    font-size: 14px;
    line-height: 24px;
    color: ${grey800};
    width: 75%;
`

type TComponentProps = IProps & IStoreProps & IDispatchProps
export class AboutPage extends React.Component<TComponentProps, IStateProps> {
    componentDidMount() {
        document.title = "Democracy Sausage | FAQs and About Us"
    }

    render() {
        return (
            <PageWrapper>
                <Question>What's is this?</Question>
                <Answer>A map of sausage and cake availability on election day.</Answer>
                <Question>I still don't understand</Question>
                <Answer>It's practically part of the Australian Constitution. Or something.</Answer>
                <Question>But how do you get all of the sausage sizzles?</Question>
                <Answer>
                    We crowdsource (or is it crowdsauce?) data from Twitter, Facebook, and Instagram and from the stalls that people submit
                    to us on this here website.
                    <br />
                    To let us know about sausage and cake availability (or the absence thereof), tweet using the hashtag{" "}
                    <a href="https://twitter.com/intent/tweet?hashtags=democracysausage">#democracysausage</a>. We'll be watching.
                </Answer>
                <Answer>
                    To make this work, we've also used:
                    <ul>
                        <li>
                            <a href="http://www.aec.gov.au/election/downloads.htm">AEC polling place data</a> (as well as from the various
                            state electoral commissions);
                        </li>
                        <li>
                            Images from <a href="http://openclipart.org">openclipart.org</a>; specifically:{" "}
                            <a href="http://openclipart.org/detail/7983/red-+-green-ok-not-ok-icons-by-tzeeniewheenie">
                                these tick and cross icons
                            </a>
                            , <a href="http://openclipart.org/detail/6165/sausage-by-mcol">this sausage icon</a> and{" "}
                            <a href="http://openclipart.org/detail/181486/cake-by-vectorsme-181486">this cake icon</a> (with our
                            acknowledgements and appreciation to the artists).
                        </li>
                    </ul>
                </Answer>
                <Question>Who are you?</Question>
                <Answer>
                    We're six people, a baby, and some parrots.
                    <br />
                    <br />
                    Well, that and a whole bunch of dedicated and hard working volunteers on election days who help out with crowdsaucing
                    sausage sizzle locations.
                    <br />
                    <br />
                    We're enthusiastic about democracy sausage and making elections just a little bit more fun. You can find us on Twitter
                    at <a href="http://twitter.com/DemSausage">@DemSausage</a> or email us at{" "}
                    <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>.
                </Answer>
                <Question>Who do we need permission from to run a sausage sizzle fundraiser at our school?</Question>
                <Answer>
                    Well your school, first of all (but you knew that already). Beyond that, your local government may require you to get a
                    permit to run a temporary food stall - so give them a call to find out. There's also some pretty basic food safety
                    regulations you'll need to abide by - check out foodstandards.gov.au{" "}
                    <a href="http://www.foodstandards.gov.au/consumer/safety/faqsafety/pages/foodsafetyfactsheets/charitiesandcommunityorganisationsfactsheets/sausagesizzlesandbar1478.aspx">
                        for more information
                    </a>
                    .
                </Answer>
                <Question>Are you part of any political parties?</Question>
                <Answer>Nope! Democracy Sausage is 100% non-partisan, organic, hormone free, and grass fed.</Answer>
                <Question>Will you share my info with others?</Question>
                <Answer>
                    If you submit a stall to us, we won't share any personal information about you - such as your email address, Twitter
                    handle, et cetera.
                    <br />
                    We do occasionally work with other websites to share data about sausage sizzles, but we only ever send them information
                    about the stalls and locations and polling booths.
                </Answer>
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
)(AboutPage)

export default AboutPageWrapped
