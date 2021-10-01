import { same } from ".."

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
