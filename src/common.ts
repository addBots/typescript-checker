import { stringifyObject } from "./utils"
import {
	Type,
	OneOf,
	AndNot,
	Checker,
	Check,
	KeysSchema,
	And,
	KeysPartial,
	ItemsSchema,
	ItemsPartial,
	isCheckError,
} from "./core"

export const TypeUndefined = Type("undefined")
export const TypeNull = OneOf(null)
export const TypeString = Type("string")
export const TypeBoolean = Type("boolean")
export const TypeNumber = Type("number")
export const TypeUnknown: Checker<unknown, unknown> = (value) => [null, value]
export const TypeFunction = Type("function")

export const TypeObject = AndNot(Type("object"), OneOf(null), " is null expected object")
export const TypeArray = (value: unknown): Check<unknown[]> =>
	Array.isArray(value) ? [null, value] : [[`expected an array, found: ${value}`]]

export const TypeEnum = <T>(_enum: T) =>
	<Checker<unknown, T[keyof T]>>(
		(<unknown>OneOf(...Object.values(_enum).filter((x): x is number => typeof x === "number")))
	)
export const TypeEnumString = <T>(_enum: T) =>
	<Checker<unknown, T[keyof T]>>(
		(<unknown>OneOf(...Object.values(_enum).filter((x): x is string => typeof x === "string")))
	)

export const TypeParseInt: Checker<unknown, string> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}

	const number = parseInt(string[1], 10)
	if (isNaN(number)) {
		return [["expected a string containing an integer, found " + stringifyObject(value)]]
	}

	return string
}

export const TypeParseFloat: Checker<unknown, string> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}

	const number = parseFloat(string[1])
	if (isNaN(number)) {
		return [["expected a string containing a float, found " + stringifyObject(value)]]
	}

	return string
}

export const TypeParseBoolean: Checker<unknown, string> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}

	if (string[1] !== "true" && string[1] !== "false") {
		return [["expected a string containing a boolean, found " + stringifyObject(value)]]
	}

	return string
}

export const TypeMatches = (name: string, regexp: RegExp): Checker<string, string> => (value) => {
	if (value.match(regexp) === null) {
		return [[`value does not match ${name}, found '${value}'`]]
	}

	return [null, value]
}

export const TypeMatchesNot = (name: string, regexp: RegExp): Checker<string, string> => (value) => {
	if (value.match(regexp) !== null) {
		return [[`value does match ${name} but should not, found '${value}'`]]
	}

	return [null, value]
}

export const ConvertJSON: Checker<string, unknown> = (value) => {
	try {
		return [null, JSON.parse(value)]
	} catch (e) {
		return [["failed parsing string as json, " + (e as SyntaxError).message]]
	}
}

export const ConvertParseInt: Checker<unknown, number> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}
	const number = parseInt(string[1], 10)
	if (isNaN(number)) {
		return [["expected a string containing a number, found " + stringifyObject(value)]]
	}

	return [null, number]
}

export const ConvertParseFloat: Checker<unknown, number> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}
	const number = parseFloat(string[1])
	if (isNaN(number)) {
		return [["expected a string containing a number, found " + stringifyObject(value)]]
	}

	return [null, number]
}

export const ConvertParseBoolean: Checker<unknown, boolean> = (value) => {
	const string = TypeString(value)
	if (isCheckError(string)) {
		return string
	}
	if (string[1] !== "true" && string[1] !== "false") {
		return [["expected a string representing a boolean, found " + stringifyObject(value)]]
	}

	return [null, string[1] === "true"]
}

export const Record = <K extends string, T>(
	checkKey: Checker<string, K>,
	checkItem: Checker<unknown, T>,
): Checker<unknown, Record<K, T>> =>
	And(TypeObject, (value) => {
		const obj: Record<K, T> = {} as any
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

export const TypeCheck = <U, T extends U>(check: (value: U) => value is T, type = "custom type") => (
	value: U,
): Check<T> => (check(value) ? [null, value] : [[`expected ${type}, found: ${value}`]])

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
	const date = new Date(value)
	if (isNaN(date.valueOf())) {
		return [[`invalid date: ${value}`]]
	}
	return [null, date]
})
export const TypeParseDate = And(TypeString, parsesAs<string>(ConvertDate))

export const Transform = <T, R>(transformFn: (value: T) => R): Checker<T, R> => (value) => [null, transformFn(value)]

export const HasKeys = <T>(schema: KeysSchema<T>): Checker<unknown, T> => {
	const check = And(TypeObject, KeysPartial(schema))
	return (value) => {
		const result = check(value)
		if (isCheckError(result)) {
			return result
		}
		return [null, value as T]
	}
}

type CheckPair = {
	<T1, T2>(firstChecker: Checker<unknown, T1>, secondChecker: Checker<unknown, T2>): Checker<unknown, [T1, T2]>
	<T extends unknown[]>(UCheck: Checker<unknown, T[0]>, TCheck: Checker<unknown, T[1]>): Checker<
		unknown,
		[T[0], T[1]]
	>
}

export const checkPair: CheckPair = (
	firstChecker: Checker<unknown, unknown>,
	secondChecker: Checker<unknown, unknown>,
): Checker<unknown, [unknown, unknown]> => (value) => {
	const checkArray = TypeArray(value)
	if (isCheckError(checkArray)) {
		return checkArray
	}

	const tuple = checkArray[1]
	if (tuple.length !== 2) {
		return [["array length !== 2"]]
	}
	const firstCheck = firstChecker(tuple[0])
	if (isCheckError(firstCheck)) {
		return firstCheck
	}
	const secondCheck = secondChecker(tuple[1])
	if (isCheckError(secondCheck)) {
		return secondCheck
	}

	return [null, [firstCheck[1], secondCheck[1]]]
}
