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
export type CheckerInput<M> = M extends Checker<infer A, infer B> ? A : never
export type CheckerSuccess<M> = M extends Checker<infer A, infer B> ? B : never

const stringify = (value: unknown): string => {
	try {
		return JSON.stringify(value)
	} catch (err) {
		return "<complexs object>"
	}
}
export const isCheckValid = <U>(args: Check<U>): args is CheckValid<U> => args[0] === null
export const isCheckError = <U>(args: Check<U>): args is CheckError => args[0] !== null
export const Type = <T extends TypeNames>(name: T): Checker<unknown, TypeNameType<T>> => (value) =>
	isType(name, value) ? [null, value] : [["expected " + name + " found " + stringify(value)]]
export const CheckerRef = <A, B>(checkerRef: () => Checker<A, B>) => (value: A) => checkerRef()(value)
export const Accept = <A>(): Checker<A, A> => (value) => [null, value]
export const OneOf = <T extends Types[]>(...items: T): Checker<unknown, T[number]> => {
	return (value) => {
		for (const item of items) {
			if (item === value) {
				return [null, item]
			}
		}

		return [["expected one of " + stringify(items) + " found " + stringify(value)]]
	}
}
export type ItemsSchema<T> = Checker<unknown, T>
export const ItemsPartial = <T>(items: ItemsSchema<T>): Checker<unknown[], T[]> => {
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
export type KeysSchema<T> = { [key in keyof T]: Checker<unknown, T[key]> }
export const KeysPartial = <T>(schema: KeysSchema<T>): Checker<Partial<Record<keyof T, unknown>>, T> => {
	const keys = <(keyof T)[]>Object.keys(schema)
	const tests = keys.map((key): [keyof T, (value: Partial<Record<keyof T, unknown>>) => Check<T[keyof T]>] => {
		const test = schema[key]

		return [
			key,
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
		for (const [key, test] of tests) {
			const result = test(value)
			if (isCheckError(result)) {
				return result
			}
			obj[key] = result[1]
		}

		return [null, <T>obj]
	}
}
export const RecordPartial = <K extends string, T>(
	checkKey: Checker<string, K>,
	checkItem: Checker<unknown, T>,
): Checker<unknown, Partial<Record<K, T>>> =>
	And(TypeObject, (value) => {
		const obj: Partial<Record<K, T>> = {}
		for (const [key, item] of Object.entries(value)) {
			const keyResult = checkKey(key)
			if (isCheckError(keyResult)) {
				return [keyResult[0].map((error) => "invalid key, " + error)]
			}
			const result = checkItem(item)
			if (isCheckError(result)) {
				return [result[0].map((error) => "." + key + " " + error)]
			}
			obj[keyResult[1]] = result[1]
		}
		return [null, obj]
	})
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
		const result = testA(value)
		if (isCheckError(result)) {
			return result
		}

		return <Check<A & B>>(<unknown>testB(value))
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

export const TypeParseInt: Checker<unknown, string> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}
	const number = parseInt(string[1], 10)
	if (isNaN(number)) {
		return [["expected a string containing a number, found " + stringify(value)]]
	}

	return string
}

export const TypeMatches = (name: string, regexp: RegExp): Checker<string, string> => (value) => {
	if (!regexp.test(value)) {
		return [[`value does not match ${name}, found '${value}'`]]
	}

	return [null, value]
}

export const ConvertJson: Checker<string, unknown> = (value) => {
	try {
		return [null, JSON.parse(value)]
	} catch (e) {
		return [["failed parsing string as json, " + e.message]]
	}
}

export const ConvertParseInt: Checker<unknown, number> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}
	const number = parseInt(string[1], 10)
	if (isNaN(number)) {
		return [["expected a string containing a number, found " + stringify(value)]]
	}

	return [null, number]
}

export const Catch = <A, B>(check: Checker<A, B>, fallback: () => B) => (value: A): CheckValid<B> => {
	const result = check(value)
	if (isCheckError(result)) {
		return [null, fallback()]
	}

	return result
}
export const Fallback = <A, B>(check: Checker<A | undefined, B>, fallback: () => B): Checker<A | undefined, B> => (
	value,
) => {
	if (value === undefined) {
		return [null, fallback()]
	}
	return check(value)
}

export const TypeUndefined = Type("undefined")
export const TypeObject = AndNot(Type("object"), OneOf(null), " is null expected object")
export const TypeString = Type("string")
export const TypeBoolean = Type("boolean")
export const TypeNumber = Type("number")
export const TypeUnknown: Checker<unknown, unknown> = (value) => [null, value]
export const TypeArray = (value: unknown): Check<unknown[]> =>
	Array.isArray(value) ? [null, value] : [["expected an array"]]
export const TypeCheck = <U, T extends U>(check: (value: U) => value is T, type = "custom type") => (
	value: U,
): Check<T> => (check(value) ? [null, value] : [[`expected ${type}`]])
export const TypeEnum = <T>(_enum: T) =>
	<Checker<unknown, T[keyof T]>>(
		(<unknown>OneOf(...Object.values(_enum).filter((x): x is number => typeof x === "number")))
	)
export const TypeEnumString = <T>(_enum: T) =>
	<Checker<unknown, T[keyof T]>>(
		(<unknown>OneOf(...Object.values(_enum).filter((x): x is string => typeof x === "string")))
	)
export const checkInstanceOf = <T>(constructor: { new (...args: any): T; name: string }) => (
	value: unknown,
): Check<T> => (value instanceof constructor ? [null, value] : [[`expected ${constructor.name}`]])

export const Keys = <T>(schema: KeysSchema<T>) => And(TypeObject, KeysPartial(schema))
export const Items = <T>(schema: ItemsSchema<T>) => And(TypeArray, ItemsPartial(schema))

export const parsesAs = <T = never>(check: Checker<T, unknown>): Checker<T, T> => (value: T) => {
	const result = check(value)
	if (isCheckError(result)) {
		return result
	}

	return [null, value]
}
export const ConvertDate: Checker<unknown, Date> = And(TypeString, (value: string) => {
	try {
		return [null, new Date(value)]
	} catch (e) {
		return [[e.message]]
	}
})
export const checkDate = And(TypeString, parsesAs<string>(ConvertDate))

export const MinLegth = (minLength: number): Checker<string, string> => (value) =>
	value.length >= minLength ? [null, value] : [[`expected minimum string length ${minLength}`]]
export const MaxLegth = (maxLength: number): Checker<string, string> => (value) =>
	value.length <= maxLength ? [null, value] : [[`expected maximum string length ${maxLength}`]]

export const selectType = <T>(_enum: T) => {
	const checkType = Keys({
		type: TypeEnumString(_enum),
	})
	return <W>(value: W): value is Extract<W, { type: T[keyof T] }> => isCheckValid(checkType(value))
}
