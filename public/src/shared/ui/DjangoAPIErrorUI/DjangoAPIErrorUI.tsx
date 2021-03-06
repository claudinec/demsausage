import * as React from "react"

export interface IProps {
    errors: IDjangoAPIError | undefined
}

export interface IDjangoAPIError {
    [key: string]: string[]
}

export default class DjangoAPIErrorUI extends React.PureComponent<IProps, {}> {
    render() {
        const { errors } = this.props

        if (errors !== undefined) {
            if (Object.keys(errors).length === 1 && "detail" in errors) {
                return (
                    <div>
                        <h2>Sorry about this, but we've found a snag (geddit?) in what you're trying to do:</h2>
                        {errors.detail}
                    </div>
                )
            }

            return (
                <div>
                    <h4>Sorry about this, but we found a few problems with your submission:</h4>
                    <ul>
                        {Object.keys(errors).map((key: string) => {
                            return (
                                <li key={key}>
                                    <strong>{key}:</strong> {errors[key].join("; ")}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }
        return null
    }
}
