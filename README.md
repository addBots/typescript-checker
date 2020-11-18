# typescript-checker

Powerful data type validation library enabling type safety

![Node.js CI](https://github.com/addBots/typescript-checker/workflows/Node.js%20CI/badge.svg)
<a href="https://npmjs.com/package/typescript-checker" target="\_parent">
<img alt="" src="https://img.shields.io/npm/dm/typescript-checker.svg" />
</a>
<a href="https://bundlephobia.com/result?p=typescript-checker@latest" target="\_parent">
<img alt="" src="https://badgen.net/bundlephobia/minzip/typescript-checker@latest" />
</a><a href="#badge">
<img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
</a>

-   🔒️ enables type safety on your TypeScript projects
-   ✔️ compatibility with TypeScript 3.x, (4.x after known issues are resolved)
-   0️⃣️ zero dependencies
-   🚀️ super small bundle size
-   👵️ es5 compatibility
-   🔀️ nodejs and browser ready

## Examples

```typescript
const validBody = {
	name: "Dodo",
	age: 42,
	meta: {
		canFly: false,
		pickupItems: ["egg", "grass"],
	},
}
const invalidBody = {
	name: null,
	age: 42,
	meta: [false, true],
}

const checkBody = Keys({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
	meta: Keys({
		canFly: TypeBoolean,
		pickupItems: Items(OneOf("egg", "grass", "stone")),
	}),
})

const checkedValue = check(checkBody, validBody) // valid, returns value
const checkedValue = check(checkBody, invalidBody) // throws CheckerError

type IBody = CheckerSuccess<typeof checkBody>
// equals type/interface
type IBody = {
	name: string
	age: number
	meta: {
		canFly: boolean
		pickupItems: ("egg" | "grass" | "stone")[]
	}
}

// there are more ways to execute a checker and handle errors, see the detailed API docs!
```

## Installation

Requires TypeScript 3.x or higher

```
npm i typescript-checker

OR

yarn add typescript-checker
```

## API Docs

### Checker

A `Checker` is a function to which a `value` can be passed, which should be validated. The `Checker` itself can be a base type checker like `TypeString`, a more complex checker with nested properties like `Keys` or `Items`, or a chain of different (logically connected) checker like `And(TypeString, MinLength(2))` or `And.then(Fallback(TypeString, () => "[]")).then(parseFilterQuery)`.

The `Checker` can be invoked like a function, returning a tuple `[errors] | [null, validValue]`. Either `errors` contains a list of errors, or `validValue` returns the validated and stripped value. Both cases can be conveniently checked via `isCheckError(<result>)` and `isCheckValid(<result>)`.
Alternatively, you can use the provided `check(<checker>, <value>)` function throwing a JavaScript `Error`, which can be `try/catch`ed.

```typescript
const validBody = {
	name: "Dodo",
	age: 42,
	meta: {
		canFly: false,
		pickupItems: ["egg", "grass"],
	},
}
const invalidBody = {
	name: null,
	age: 42,
	meta: [false, true],
}

const checkBody = Keys({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
	meta: Keys({
		canFly: TypeBoolean,
		pickupItems: Items(OneOf("egg", "grass", "stone")),
	}),
})

const checkResultValid = checkBody(validBody) // returns [null, validBody] indicating a valid checker result
const checkResultInvalid = checkBody(invalidBody) // returns [['.name expected string found null'], null] indicating an error checker result

if (isCheckValid(checkResultValid)) {
	// ...true
}

if (isCheckError(checkResultInvalid)) {
	// ...true
}

try {
	const value = check(checkBody, validBody)
	console.log(value) // outputs <value>
} catch (err) {
	console.error(err) // not executed
}

try {
	const value = check(checkBody, invalidBody)
	console.log(value) // not executed
} catch (err) {
	console.error(err) // err is CheckerError

	if (err instanceof CheckerError) {
		consoe.error(err.errors) // logs [['.name expected string found null']]
	}
}
```

### JS/TS Types

-   `TypeUndefined`
-   `TypeNull`
-   `TypeString`
-   `TypeBoolean`
-   `TypeNumber`
-   `TypeUnknown`
-   `TypeFunction`
-   `TypeObject`
-   `TypeArray`
-   `TypeEnum` (typescript only)

    ```typescript
    enum Status {
    	Pending,
    	Accepted,
    	Closed,
    }

    const checkStatus = TypeEnum(Status)
    ```

-   `TypeEnumString` (typescript only)

    ```typescript
    enum Status {
    	Pending = "pending",
    	Accepted = "accepted",
    	Closed = "closed",
    }

    const checkStatus = TypeEnumString(Status)
    ```

### Common Type Checker

-   `TypeMatches` (tests for a regex match)

-   `TypeParseInt` (string which holds an integer value, returns string)
-   `TypeParseFloat` (string which holds an integer value, returns string)
-   `TypeParseBoolean` (string which holds an boolean value, returns string)
-   `TypeParseDate` (string which holds an stringified Date value, returns string)

-   `ConvertParseInt` (string which holds an integer value, returns number)
-   `ConvertParseFloat` (string which holds a float value, returns number)
-   `ConvertParseBoolean` (string which holds a boolean value, returns boolean)
-   `ConvertDate` (string/number representing a valid Date, returns Date)

### Checker Composition

-   `And(checkerA, checkerB)` like function composition (if checkerA succeeds, check the result using checkerB)

    ```typescript
    And(TypeString, MinLength(10)) // string which is at least 10 characters long
    ```

-   `Or(checkerA, checkerB, ...)` check union type (if checkerA fails, check original value using checkerB)
    ```typescript
    Or(TypeNull, TypeString) // accepts a string or null
    Or(TypeUndefined, TypeNumber) // accepts a number or undefined
    ```

### Helper / Util Checker

-   `Keys` checks for an object containing certain keys with their corresponding value type

    ```typescript
    const checkBody = Keys({
    	name: And(TypeString, MinLength(2)),
    	age: TypeNumber,
    })

    const checkNestedBody = Keys({
    	name: And(TypeString, MinLength(2)),
    	age: Or(TypeUndefined, TypeNumber), // optional property
    	meta: Keys({
    		canFly: TypeBoolean,
    	}),
    })
    ```

-   `Items` checks for an array containing certain item types

    ```typescript
    Items(TypeString) // array containing only string values
    Items(TypeNumber) // array containing only number values
    Items(Keys({ name: And(TypeString, MinLength(2)) })) // array containing only objects with a <name> property of type string
    Items(Items(TypeNumber)) // 2d array containing only number values
    Items(Or(TypeString, TypeBoolean)) // array containing strings or booleans, e.g. ["hello world", false, true]
    ```

-   `OneOf` checks for defined literals

    ```typescript
    OneOf(42, 1337) // only value 42 or 1337 is accepted
    OneOf("dodo", "raptor") // only value "dodo" or "raptor" is accepted
    OneOf("dodo", 42, false) // only value "dodo" or 42 or false is accepted
    ```

-   `Fallback` provides a way to take a default value if the checked value is `undefined`

    ```typescript
    const myChecker = Fallback(TypeSting, () => "Take this as default value")

    const validResult = myChecker("Hello World") // validResult is "Hello World"
    const fallbackResult = myChecker(undefined) // fallbackResult is "Take this as default value"
    ```

-   `Catch` provides a way to take a default value if the checker fails

    ```typescript
    const myChecker = Catch(TypeSting, () => "Take this as default value")

    const validResult = myChecker("Hello World") // validResult is "Hello World"
    const fallbackResult = myChecker(42) // fallbackResult is "Take this as default value"
    ```

-   `withDefault` is not a checker, but takes a checker result and a default value

    ```typescript
    const myChecker = TypeSting

    const validResult = withDefault(myChecker("Hello World"), "Take this as default value") // validResult is "Hello World"
    const fallbackResult = withDefault(myChecker(42), "Take this as default value") // fallbackResult is "Take this as default value"
    ```

-   `ConvertJSON` takes a string value and tries to parse its JSON content

    ```typescript
    const myJSONChecker = ConvertJSON

    const validObject = myJSONChecker('{"a": 42}') // validObject is {a: 42}
    const validArray = myJSONChecker("[1,2,3,4,5]") // validArray is [1,2,3,4,5]
    const invalidResult = myJSONChecker("dodo") // invalidResult holds an error
    ```

### Validators

-   `MinLength(number)` checks if a given string has a minimum length
-   `MaxLength(number)` checks if a given string has a maximum length
-   `Min(number)` checks if a given number is greater-equals a certain value
-   `Max(number)` checks if a given number is less-equals a certain value
-   `Between(number, number)` checks if a given number is between two given values
-   `IsUUID` checks if a given string is a valid uuid (v1, v4, or v5)
-   `EMail` checks if a given string is a valid email address

### Chaining

`And` provides an API for chaining checkers.

```typescript
// Example 1

// takes a stringified JSON, parses it, and on success checks keys of the JSON object
const parseStringJSONPayload = And.then(TypeString)
	.then(ConvertJSON)
	.then(
		Keys({
			answer: TypeString,
			freeTextEnabled: TypeBoolean,
			next: TypeNumber,
		}),
	)

// Example 2

interface IFilterItem {
	key: string
	values: (string | number)[]
}

type FilterItems = IFilterItem[]

const checkFilterItem = Keys<IFilterItem>({ key: TypeString, values: Items(Or(TypeString, TypeNumber)) })
const checkFilterItems = Items(checkFilterItem)

const parseFilterQuery: Checker<string, FilterItems> = (value) => {
	try {
		const data = JSON.parse(value)
		const checkResult = checkFilterItems(data)

		return checkResult
	} catch (err) {
		return [err.message]
	}
}

// if value is undefined, we want to provide a fallback value before continue checking by parsing the
// stringified JSON by a custom checker
const checkPaginationFilter = And.then(Fallback(TypeString, () => "[]")).then(parseFilterQuery)
```

### Custom Checker

By using the `Checker<A,B>` type you can build whatever checker you want.

```typescript
// a custom Moment checker
const TypeMoment: Checker<unknown, Moment> = checkInstanceOf(Moment, "Moment")

// a custom checker for all uppercase letters
const checkAllUppercase: Checker<string, string> = (value) => {
	if (value === value.toUpperCase()) {
		return [null, value]
	} else {
		return [[`expected string with all uppercase letters, found ${value}`]]
	}
}
```

### Type Inference

The type `CheckerSuccess` enables you to infer the type of a checker.

```typescript
const checkBody = Keys({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
	meta: Keys({
		canFly: TypeBoolean,
		pickupItems: Items(OneOf("egg", "grass", "stone")),
	}),
})

type IBody = CheckerSuccess<typeof checkBody>
// equals type/interface
type IBody = {
	name: string
	age: number
	meta: {
		canFly: boolean
		pickupItems: ("egg" | "grass" | "stone")[]
	}
}
```

If you prefer to declare your interfaces and types separately, you can just provide the type to the checker to make sure your checked types are assignable to the interface types ahead of time. This can't ensure equivalence for optional members and union types.

```typescript
type IBody = {
	name: string
	age: number
	meta: {
		canFly: boolean
		pickupItems: ("egg" | "grass" | "stone")[]
	}
}

// no compiler error
const checkBody = Keys<IBody>({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
	meta: Keys({
		canFly: TypeBoolean,
		pickupItems: Items(OneOf("egg", "grass", "stone")),
	}),
})

// compiler error -> key "meta" is missing in checker
const checkBody = Keys<IBody>({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
})
```

When providing generics manually, following checkers will only succeed on some instances of IEgg and IPickup.

```typescript
type IEgg = {
	type: "egg"
	weight?: number
}

type IGrass = {
	type: "grass"
}

type IPickup = IEgg | IGrass

const checkSomeEgg = Keys<IEgg>({
	type: OneOf("egg"),
	// missing weight
})

const checkSomePickup = Or<IPickup[]>(checkSomeEgg) // missing grass
```

## Roadmap / Todo

-   [ ] Support TypeScript 4.x
-   [ ] JS docs annotations
-   [ ] unit tests
-   [ ] convenient `express` integration
-   [ ] extend common checkers
-   [ ] convenient `graphql` integration

## Contributors

-   Karl Kraus ([@pyBlob](<(https://github.com/pyBlob)>)) [Contributor & Library Founder]
-   Yannick Stachelscheid ([@yss14](<(https://github.com/yss14)>)) [Contributor & GitHub Moderator]
-   Martin Wepner ([@martinwepner](<(https://github.com/martinwepner)>)) [Contributor]
-   Simon Trieb ([@strieb](<(https://github.com/strieb)>)) [Contributor]
-   Tobias Klesel ([@tobi12345](<(https://github.com/tobi12345)>)) [Contributor]

## License

This project is licensed under the [MIT](LICENSE) license.
