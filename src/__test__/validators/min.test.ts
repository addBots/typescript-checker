import { isCheckValid, Min } from "../.."

const checker = Min(42)

test("value > min succeeds", () => {
	expect(isCheckValid(checker(1337))).toBeTrue()
})

test("value = min succeeds", () => {
	expect(isCheckValid(checker(42))).toBeTrue()
})

test("value < min fails", () => {
	expect(isCheckValid(checker(8))).toBeFalse()
})
