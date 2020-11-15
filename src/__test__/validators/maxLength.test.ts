import { isCheckValid, MaxLength } from "../.."

const checker = MaxLength(5)

test("actual length > max fails", () => {
	expect(isCheckValid(checker("hello world"))).toBeFalse()
})

test("actual length = max succeeds", () => {
	expect(isCheckValid(checker("hello"))).toBeTrue()
})

test("actual length < max succeeds", () => {
	expect(isCheckValid(checker("dodo"))).toBeTrue()
})

test("whitespaces count into length", () => {
	expect(isCheckValid(checker("      "))).toBeFalse()
})
