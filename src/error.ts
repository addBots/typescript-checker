import { Checker, isCheckError } from "./core"

export class CheckerError<E> extends Error {
	public readonly value: E
	public readonly errors: string[]

	constructor(value: E, errors: string[]) {
		super(errors.join("; "))

		this.value = value
		this.errors = errors
	}
}

export const check = <A, B>(checker: Checker<A, B>, value: A): B => {
	const result = checker(value)

	if (isCheckError(result)) {
		throw new CheckerError(value, result[0])
	}

	return result[1]
}
