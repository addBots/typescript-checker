import { isCheckValid, EMail } from "../.."
import faker from "faker"

const checker = EMail

test("valid email passes", () => {
	expect(isCheckValid(checker("some@valid.email"))).toBeTrue()
})

test("without @ fails", () => {
	expect(isCheckValid(checker("somevalid.email"))).toBeFalse()
})

test("with whitespace fails", () => {
	expect(isCheckValid(checker("so me@valid.email"))).toBeFalse()
	expect(isCheckValid(checker("so me@valid.em ail"))).toBeFalse()
	expect(isCheckValid(checker("some@val id.email"))).toBeFalse()
})

test("without domain fails", () => {
	expect(isCheckValid(checker("some@"))).toBeFalse()
	expect(isCheckValid(checker("some@.com"))).toBeFalse()
})

test("without tld fails", () => {
	expect(isCheckValid(checker("some@valid"))).toBeFalse()
	expect(isCheckValid(checker("some@valid."))).toBeFalse()
})

test("large-scale generated emails passes", () => {
	faker.seed(42)
	for (let i = 0; i < 1000; i++) {
		const email = faker.internet.email()

		expect(isCheckValid(checker(email))).toBeTrue()
	}
})
