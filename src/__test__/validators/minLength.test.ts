import { isCheckValid, MinLength } from "../.."

const checker = MinLength(5)

test("actual length > min succeeds", () => {
	expect(isCheckValid(checker("hello world"))).toBeTrue()
})

test("actual length = min succeeds", () => {
	expect(isCheckValid(checker("hello"))).toBeTrue()
})

test("actual length < min fails", () => {
	expect(isCheckValid(checker("dodo"))).toBeFalse()
})

test("whitespaces count into length", () => {
	expect(isCheckValid(checker("      "))).toBeTrue()
})
