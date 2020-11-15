import { isCheckValid, Max } from "../.."

const checker = Max(42)

test("value > min fails", () => {
	expect(isCheckValid(checker(1337))).toBeFalse()
})

test("value = min succeeds", () => {
	expect(isCheckValid(checker(42))).toBeTrue()
})

test("value < min succeeds", () => {
	expect(isCheckValid(checker(8))).toBeTrue()
})
