import { Keys, TypeBoolean, TypeNumber, TypeString } from "../../common"
import { TypeGuard } from "../../typeguard"

interface SomeObject {
	propertyA: string
	propertyB: boolean
}

interface SomeMoreComplexObject extends SomeObject {
	propertyC: number
}

const obj: SomeObject = {
	propertyA: "peter",
	propertyB: false,
}
const moreComplexObj: SomeMoreComplexObject = {
	propertyA: "allan",
	propertyB: true,
	propertyC: 42,
}
const checkMoreComplexObj = Keys<SomeMoreComplexObject>({
	propertyA: TypeString,
	propertyB: TypeBoolean,
	propertyC: TypeNumber,
})

test("typeguard should return true for valid input value", () => {
	const testObj: any = moreComplexObj
	const myGuard = TypeGuard(checkMoreComplexObj)

	expect(myGuard(testObj)).toBe(true)
})

test("typeguard should return false for invalid input value", () => {
	const testObj: any = obj
	const myGuard = TypeGuard(checkMoreComplexObj)

	expect(myGuard(testObj)).toBe(false)
})

test("typeguard should guard for valid input value", () => {
	const testObj: any = moreComplexObj
	const myGuard = TypeGuard(checkMoreComplexObj)

	if (myGuard(testObj)) {
		expect(testObj.propertyC).toBe(42)
	} else {
		throw new Error("TypeGuard failed")
	}
})
