import { Keys, TypeBoolean, TypeNumber, TypeString } from "../../common"
import { And, isCheckValid, Merge } from "../../core"
import { EMail } from "../../validators"

const checkA = Keys({
	name: TypeString,
	age: TypeNumber,
	meta: Keys({
		acceptedNewsletter: TypeBoolean,
	}),
})

const checkB = Keys({
	phonenumber: TypeString,
	email: And(TypeString, EMail),
})

test("value is valid, merged result is returned", () => {
	const value = {
		name: "Franz",
		age: 42,
		meta: {
			acceptedNewsletter: true,
		},
		email: "franz@bavaria.one",
		phonenumber: "+4913374242",
	}

	const result = Merge(checkA, checkB)(value)

	expect(isCheckValid(result)).toBeTrue()
	expect(result[1]).toEqual(value)
})

test("value is invalid, error returned", () => {
	const value = {
		name: "Franz",
		age: 42,
		meta: {
			acceptedNewsletter: true,
		},
		email: "franz@bavaria",
		phonenumber: "+4913374242",
	}

	const result = Merge(checkA, checkB)(value)

	expect(isCheckValid(result)).toBeFalse()
})
