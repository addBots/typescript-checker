import { isCheckValid, IsUUID } from "../.."
import faker from "faker"

const checker = IsUUID

test("v1 uuid passes", () => {
	expect(isCheckValid(checker("9f0c6f32-2749-11eb-adc1-0242ac120002"))).toBeTrue()
})

test("v4 uuid passes", () => {
	expect(isCheckValid(checker("bc3ca315-f3f8-428c-ad39-a146a76c1ff6"))).toBeTrue()
})

test("v5 uuid passes", () => {
	expect(isCheckValid(checker("a6edc906-2f9f-5fb2-a373-efac406f0ef2"))).toBeTrue()
})

test("invalid uuid fails", () => {
	expect(isCheckValid(checker("bc3ca35-f3f8-428c-ad39-a146a76c1ff6"))).toBeFalse()
	expect(isCheckValid(checker("bc3ca315-f38-428c-ad39-a146a76c1ff6"))).toBeFalse()
	expect(isCheckValid(checker("bc3ca315-f3f8-48c-ad39-a146a76c1ff6"))).toBeFalse()
	expect(isCheckValid(checker("bc3ca315-f3f8-428c-a39-a146a76c1ff6"))).toBeFalse()
	expect(isCheckValid(checker("bc3ca315-f3f8-428c-ad39-a146a7c1ff6"))).toBeFalse()
	expect(isCheckValid(checker("bc3ca315f3f8428cad39a146a76c1ff6"))).toBeFalse()
})

test("large-scale generated uuids passes", () => {
	faker.seed(42)
	for (let i = 0; i < 1000; i++) {
		const uuid = faker.random.uuid()

		expect(isCheckValid(checker(uuid))).toBeTrue()
	}
})
