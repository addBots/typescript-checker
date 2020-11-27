import { checkPair, TypeBoolean, TypeNumber, TypeString } from "../../common"
import { CheckerSuccess, isCheckValid } from "../../core"

const simplePairChecker = checkPair(TypeString, TypeNumber)

type CustomTuple = [string, boolean]
const customTupleTypeChecker = checkPair<CustomTuple>(TypeString, TypeBoolean)

test("valid value succeeds", () => {
	const result = simplePairChecker(["Hello World", 42])

	expect(isCheckValid(result)).toBeTrue()
})

test("invalid value types fail", () => {
	const result = simplePairChecker([42, "Hello World"])

	expect(isCheckValid(result)).toBeFalse()
})

test("wrong tuple length fails", () => {
	const result = simplePairChecker(["Hello World", 42, false])

	expect(isCheckValid(result)).toBeFalse()
})

test("type inference", () => {
	;(x: CheckerSuccess<typeof simplePairChecker>): [string, number] => x
	;(x: CheckerSuccess<typeof customTupleTypeChecker>): CustomTuple => x
})
