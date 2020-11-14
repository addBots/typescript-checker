# typescript-checker

Powerful data type validation library enabling type safety

-   🔒️ enables type safety on your typescript projects
-   ✔️ compatibility with typescript 3.x or higher
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
		pickupItems: ["egg", "gras"],
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
		pickupItems: ("egg" | "gras" | "stone")[]
	}
}

// there are more ways to execute a checker and handle errors, see the detailed API docs!
```

## Installation

Requires typescript 3.x or higher

```
npm i typescript-checker

OR

yarn add typescript-checker
```

## API Docs

### Checker

A `Checker` is a function to which a `value` can be passed, which should be validated. The `Checker` itself can be a base type checker like `TypeString`, a more complex checker with nested properties like `Keys` or `Items`, or a chain of different (logically connected) checker like `And(TypeString, MinLength(2))` or `And.then(Fallback(TypeString, () => "[]")).then(parseFilterQuery)`.

The `Checker` can be invoked like a function, returning a tuple `[errors, validValue]`. Either `errors` or `validValue` is null, which can be convienentily checked via `isCheckError(<result>)` and `isCheckValid(<result>)`.
Alternatively, you can use the provided `check(<checker>, <value>)` function throwing a JavaScript `Error`, which can be `try/catch`ed.

```typescript
const validBody = {
	name: "Dodo",
	age: 42,
	meta: {
		canFly: false,
		pickupItems: ["egg", "gras"],
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
-   `TypeEnumString` (typescript only)

### Common Type Checker

-   `TypeMatches` (tests for a regex match)

-   `TypeParseInt` (string which holds an integer value)
-   `TypeParseFloat` (string which holds an integer value)
-   `TypeParseBoolean` (string which holds an boolean value)
-   `TypeParseDate` (string which holds an stringified Date value)

-   `ConvertParseInt` (string which holds an integer value, returns number)
-   `ConvertParseFloat` (string which holds a float value, returns number)
-   `ConvertParseBoolean` (string which holds a boolean value, returns boolean)
-   `ConvertDate` (string/number representing a valid Date, returns Date)

### Logic Checker

-   `And` logical `and` operation (lhs and rhs must be valid)

    ```typescript
    And(TypeString, MinLength(10)) // string which is at least 10 characters long
    ```

-   `Or` logical `or` operation (lhs or rhs must be valid)
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

### Chaining

`And` provide an API for chaining checkers.

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
		return [[`expected string with all uppercase letters, found ${vlaue}`], null]
	}
}
```

### Type Inference

The interface `CheckerSuccess` enables you to infer the type of a checker.

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
		pickupItems: ("egg" | "gras" | "stone")[]
	}
}
```

In some cases, for complex or deeply nested checkers, typescript is not able to infer the type (anymore). In this cases, or if you prefer to declare your interfaces and types separately, you can just provide the type to the checker to make sure your types and checkers are in sync.

```typescript
interface IBody = {
	name: string
	age: number
	meta: {
		canFly: boolean
		pickupItems: ("egg" | "gras" | "stone")[]
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

## Roadmap / Todo

-   [ ] JS docs annotations
-   [ ] unit tests
-   [ ] convinient `express` integration
-   [ ] extend common checkers
-   [ ] convinient `graphql` integration

## Contributors

-   Karl Kraus ([@pyBlob](<(https://github.com/pyBlob)>)) [Contributor & Library Founder]
-   Yannick Stachelscheid ([@yss14](<(https://github.com/yss14)>)) [Contributor & GitHub Moderator]
-   Martin Wepner ([@martinwepner](<(https://github.com/martinwepner)>)) [Contributor]
-   Simon Trieb ([@strieb](<(https://github.com/strieb)>)) [Contributor]
-   Tobias Klesel ([@tobi12345](<(https://github.com/tobi12345)>)) [Contributor]

## License

This project is licensed under the [MIT](LICENSE) license.
