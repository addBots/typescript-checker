import { same, Keys, TypeNumber, TypeString, And, Checker, OneOf, Cast, MinLength } from ".."
import { Items, TypeBoolean, TypeUndefined } from "../common"
import { CheckerSuccess, Or } from "../core"

type A1 = { a: number; b: number | undefined }
type B1 = { a: number; b: number | undefined }
;() => same<A1, B1>("yes")
;() => same.because<A1, B1>("same")

type A4 = { a: number; b: number | undefined }
type B4 = { a: number; b: number }
;() => same<A4, B4>("no")
;() =>
	same.because<A4, B4>({
		path: ["b"],
		error: ["A is", {} as number | undefined, "and B is", {} as number],
	})

type A3 = { a: number; b?: number }
type B3 = { a: number; b: number }
;() => same<A3, B3>("no")
;() =>
	same.because<A3, B3>({
		path: [],
		error: ["key", "b", "is not required in", {} as A3, "but it is in", {} as B3],
	})

type A2 = { a: number; b?: number | undefined }
type B2 = { a: number; b: number | undefined }
;() => same<A2, B2>("no")
;() =>
	same.because<A2, B2>({
		path: [],
		error: ["key", "b", "is not required in", {} as A2, "but it is in", {} as B2],
	})

type A5 = { kind: 1; a: number } | { kind: 2; b?: number | undefined }
type B5 = { kind: 1; a: number } | { kind: 2; b: number | undefined }
;() => same<A5, B5>("no")

type A6 = { a: number; b?: number }
type B6 = { a: number }
;() => same<A6, B6>("no")
;() =>
	same.because<A6, B6>({
		path: [],
		error: ["key", "b", "is not in A"],
	})

export namespace README_Cast {
	export type Body = {
		name: string
		age: number
		meta: {
			canFly: boolean
			pickupItems: ("egg" | "grass" | "stone")[]
		}
	}

	// everything ok
	export const checkBody1 = Cast<Body>().as(
		Keys({
			name: And(TypeString, MinLength(2)),
			age: TypeNumber,
			meta: Keys({
				canFly: TypeBoolean,
				pickupItems: Items(OneOf("egg", "grass", "stone")),
			}),
		}),
		"same",
	)

	// compiler error -> key "meta" is missing
	export const checkBody2 = Cast<Body>().as(
		// @ts-expect-error
		Keys({
			name: And(TypeString, MinLength(2)),
			age: TypeNumber,
		}),
		"same",
	)

	export type Egg = {
		kind: "egg"
		weight?: number
	}

	export type Grass = {
		kind: "grass"
	}

	export type Pickup = Egg | Grass

	// compiler error -> key "weight" is missing
	export const checkSomeEgg1 = Cast<Egg>().as(
		Keys({
			kind: OneOf("egg"),
		}),
		// @ts-expect-error
		"same",
	)

	export const checkSomeEgg2 = {} as Checker<unknown, Egg>

	// compiler error -> missing Grass
	export const checkSomePickup = Cast<Pickup>().as(
		Or(checkSomeEgg2),
		// @ts-expect-error
		"same",
	)
}

export namespace Fish {
	export const checkFish1 = Keys({
		species: TypeString,
		amount: TypeNumber,
	})
	;() =>
		same<
			CheckerSuccess<typeof checkFish1>,
			{
				species: string
				amount: number
			}
		>("yes")

	export const checkFish2 = Keys(
		{
			species: TypeString,
			amount: TypeNumber,
		},
		["amount"],
	)
	;() =>
		same<
			CheckerSuccess<typeof checkFish2>,
			{
				species: string
				amount?: number
			}
		>("yes")

	export const checkFish3 = Keys(
		{
			species: TypeString,
			amount: Or(TypeUndefined, TypeNumber),
		},
		["amount"],
	)
	;() =>
		same<
			CheckerSuccess<typeof checkFish3>,
			{
				species: string
				amount?: number | undefined
			}
		>("yes")
}
