import { stringifyObject } from "./utils"

type TypeNames = "string" | "number" | "boolean" | "undefined" | "function" | "object"
type Types = string | number | boolean | undefined | Function | object | null

type TypeNameType<T extends TypeNames> = T extends "string"
	? string
	: T extends "number"
	? number
	: T extends "boolean"
	? boolean
	: T extends "undefined"
	? undefined
	: T extends "function"
	? Function
	: object | null

const isType = <T extends TypeNames>(name: T, value: unknown): value is TypeNameType<T> => typeof value === name

export type CheckValid<U> = [null, U]
export type CheckError = [string[]]
export type ErrorLog = CheckError[0][]
export type Check<U> = CheckError | CheckValid<U>
export type Checker<A, B> = { (value: A): Check<B> }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type CheckerInput<M> = M extends Checker<infer A, infer B> ? A : never
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type CheckerSuccess<M> = M extends Checker<infer A, infer B> ? B : never

export const isCheckValid = <U>(args: Check<U>): args is CheckValid<U> => args[0] === null
export const isCheckError = <U>(args: Check<U>): args is CheckError => args[0] !== null
export const Type =
	<T extends TypeNames>(name: T): Checker<unknown, TypeNameType<T>> =>
	(value) =>
		isType(name, value) ? [null, value] : [["expected " + name + " found " + stringifyObject(value)]]
export const CheckerRef =
	<A, B>(checkerRef: () => Checker<A, B>) =>
	(value: A) =>
		checkerRef()(value)
export const Accept =
	<A>(): Checker<A, A> =>
	(value) =>
		[null, value]
export const OneOf = <T extends Types[]>(...items: T): Checker<unknown, T[number]> => {
	return (value) => {
		for (const item of items) {
			if (item === value) {
				return [null, item]
			}
		}

		return [["expected one of " + stringifyObject(items) + " found " + stringifyObject(value)]]
	}
}
export type ItemsSchema<T, U = unknown> = Checker<U, T>
export const ItemsPartial = <U, T>(items: ItemsSchema<T, U>): Checker<U[], T[]> => {
	const test = items

	return (values) => {
		let index = 0
		const obj: T[] = []
		for (const value of values) {
			const result = test(value)
			if (isCheckError(result)) {
				return [result[0].map((error) => "[" + index + "] " + error)]
			}
			obj.push(result[1])
			++index
		}

		return [null, obj]
	}
}

type KeysSchema1<T> = {
	readonly [key in keyof T]: Checker<unknown, T[key]>
}
export type KeysSchema<T> = KeysSchema1<Required<T>>
export type KeysUnknown<T> = Partial<Record<keyof T, unknown>>

export const KeysObject = ((schema, optional) => {
	if (optional === undefined) {
		return KeysObject1(schema)
	}
	return KeysObject2(schema, optional)
}) as typeof KeysObject1 & typeof KeysObject2

export const KeysObject1 = <T>(schema: KeysSchema<T>): Checker<KeysUnknown<T>, T> => {
	return KeysObject2(schema, [])
}

export const KeysObject2 = <T, O extends keyof T>(
	schema: KeysSchema<T>,
	optional: Iterable<O> | readonly O[],
): Checker<KeysUnknown<T>, Omit<T, O> & Partial<Pick<T, O>>> => {
	const optionalSet = new Set<keyof T>(optional)
	const keys = Object.keys(schema) as (keyof T)[]
	const tests = keys.map((key): [keyof T, boolean, (value: KeysUnknown<T>) => Check<T[keyof T]>] => {
		const test = schema[key]

		return [
			key,
			optionalSet.has(key),
			(value) => {
				const result = test(value[key])
				if (isCheckError(result)) {
					return [result[0].map((error) => "." + key + " " + error)]
				}

				return result
			},
		]
	})

	return (value) => {
		const obj: Partial<T> = {}
		for (const [key, optional, test] of tests) {
			if (!(key in value)) {
				if (optional) {
					continue
				} else {
					return [[`expected required property: ${key}`]]
				}
			}
			const result = test(value)
			if (isCheckError(result)) {
				return result
			}
			obj[key] = result[1]
		}

		return [null, obj as T]
	}
}

export const AndNot = <U, A, B>(
	a: Checker<U, A>,
	b: Checker<U, B>,
	error: string = "ERROR",
): Checker<U, Exclude<A, B>> => {
	const testA = a
	const testB = b

	return (value) => {
		if (isCheckValid(testB(value))) {
			return [[error]]
		}
		const result = <Check<Exclude<A, B>>>testA(value)

		return result
	}
}
type IAndChain<U, A> = Checker<U, A> & {
	then: <B>(b: Checker<A, B>) => IAndChain<U, B>
}
export const And = <U, A, B>(a: Checker<U, A>, b: Checker<A, B>): Checker<U, B> => {
	const testA = a
	const testB = b

	return (value) => {
		const result = testA(value)
		if (isCheckError(result)) {
			return result
		}

		return testB(result[1])
	}
}
const AndChain = <U, A>(a: Checker<U, A>) => {
	const checker: Checker<U, A> & Partial<IAndChain<U, A>> = a.bind(null)
	checker.then = <B>(b: Checker<A, B>) => AndChain(And(a, b))

	return <IAndChain<U, A>>checker
}
And.then = AndChain

export const Merge = <U, A, B>(a: Checker<U, A>, b: Checker<U, B>): Checker<U, A & B> => {
	const testA = a
	const testB = b

	return (value) => {
		const resultA = testA(value)
		if (isCheckError(resultA)) {
			return resultA
		}
		const resultB = testB(value)
		if (isCheckError(resultB)) {
			return resultB
		}

		return [null, { ...resultA[1], ...resultB[1] }]
	}
}

export const Or = <T extends unknown[]>(
	...types: { [key in keyof T]: Checker<unknown, T[key]> }
): Checker<unknown, T[number]> => {
	return (value) => {
		const errors: string[][] = []
		for (const test of types) {
			const result = test(value)
			if (isCheckValid(result)) {
				return result
			}
			errors.push(result[0])
		}

		return [(<string[]>[]).concat(...errors)]
	}
}

export const Catch =
	<A, B>(check: Checker<A, B>, fallback: () => B) =>
	(value: A): CheckValid<B> => {
		const result = check(value)
		if (isCheckError(result)) {
			return [null, fallback()]
		}

		return result
	}

export const Fallback =
	<A, B>(check: Checker<A | undefined, B>, fallback: () => B): Checker<A | undefined, B> =>
	(value) => {
		if (value === undefined) {
			return [null, fallback()]
		}
		return check(value)
	}

export const withDefault = <T>(check: Check<T>, defaultValue: T): T => {
	if (isCheckError(check)) {
		return defaultValue
	}
	return check[1]
}
