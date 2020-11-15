import { isCheckValid, Between } from "../.."

const checker = Between(42, 1337)

test("value between succeeds", () => {
	expect(isCheckValid(checker(50))).toBeTrue()
})

test("value outside fails", () => {
	expect(isCheckValid(checker(9000))).toBeFalse()
})

test("value is min succeeds", () => {
	expect(isCheckValid(checker(42))).toBeTrue()
})

test("value is max succeeds", () => {
	expect(isCheckValid(checker(1337))).toBeTrue()
})

test("reversed min max fails", () => {
	const checker = Between(1337, 42)

	expect(isCheckValid(checker(50))).toBeFalse()
})
