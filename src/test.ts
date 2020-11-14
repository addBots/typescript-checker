import { Items, Keys, MinLength, TypeBoolean, TypeNumber, TypeString } from "./common"
import { And, OneOf } from "./core"

const validBody = {
	name: "Dodo",
	age: 42,
	meta: {
		canFly: false,
		pickupItems: ["egg", "gras"],
	},
}
const invalidBody = {
	name: null,
	age: 42,
	meta: [false, true],
}

const checkBody = Keys({
	name: And(TypeString, MinLength(2)),
	age: TypeNumber,
	meta: Keys({
		canFly: TypeBoolean,
		pickupItems: Items(OneOf("egg", "grass", "stone")),
	}),
})

//const checkResult = checkBody(validBody) // return [null, validBody] indicating a valid checker result
const checkResult = checkBody(invalidBody) // return [["expected"], validBody] indicating a valid checker result

console.log(checkResult)
