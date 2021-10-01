import { Checker } from "./core"

type Compound = object | readonly unknown[]

type DeepRequired1<T> = { [key in keyof T]: DeepRequired<T> }
type DeepRequired<T> = T extends Compound ? DeepRequired1<Required<T>> : T
type Same<A, B> = [A, B, DeepRequired<A>, DeepRequired<B>] extends [B, A, DeepRequired<B>, DeepRequired<A>]
	? "yes"
	: "no"

export declare const same: {
	<A, B>(same: Same<A, B>): void
	because<A, B>(reason: Reason<A, B>): void
}

export type Cast<T> = {
	as<A, B extends T>(checker: Checker<A, B>, same: Reason<T, B>): Checker<A, T>
}

export const Cast = <T>(): Cast<T> => ({
	as(checker) {
		return checker
	},
})

type IsOptional<A, keyA extends keyof A> = [Pick<A, keyA>, Pick<Required<A>, keyA>] extends [
	Pick<Required<A>, keyA>,
	Pick<A, keyA>,
]
	? 1
	: 0
type IsDifferentOptional<path extends unknown[], A, B, otherwise> = {
	[key in keyof A | keyof B]: [key] extends [keyof A]
		? [key] extends [keyof B]
			? [
					[otherwise, { path: path; error: ["key", key, "is not required in", A, "but it is in", B] }],
					[{ path: path; error: ["key", key, "is required in", A, "but not in", B] }, otherwise],
			  ][IsOptional<A, key>][IsOptional<B, key>]
			: otherwise
		: otherwise
}[keyof A | keyof B]
type IsDifferentPrimtive1<path extends unknown[], A, B, otherwise> = [A, B] extends [B, A]
	? otherwise
	: { path: path; error: ["A is", A, "and B is", B] }
type IsDifferentPrimitive<path extends unknown[], A, B, otherwise> = IsDifferentPrimtive1<
	path,
	Exclude<A, Compound>,
	Exclude<B, Compound>,
	otherwise
>
type HasDifferentMembers<path extends unknown[], A, B, otherwise> = {
	[key in keyof A | keyof B]: [key] extends [keyof A]
		? [key] extends [keyof B]
			? WhatIsDifferent<[...path, key], A[key], B[key], otherwise>
			: { path: path; error: ["key", key, "is not in A"] }
		: { path: path; error: ["key", key, "is not in B"] }
}[keyof A | keyof B]
type IsDifferentCompound1<path extends unknown[], A, B, otherwise> = 1 extends 1
	? HasDifferentMembers<path, A, B, IsDifferentOptional<path, A, B, otherwise>>
	: never
type IsDifferentCompound<path extends unknown[], A, B, otherwise> =
	| (A extends A
			? [A, DeepRequired<A>] extends [B, DeepRequired<B>]
				? never
				: IsDifferentCompound1<path, A, B, otherwise>
			: never)
	| (B extends B
			? [B, DeepRequired<B>] extends [A, DeepRequired<A>]
				? never
				: IsDifferentCompound1<path, A, B, otherwise>
			: never)
type WhatIsDifferent<path extends unknown[], A, B, otherwise> = Same<A, B> extends "yes"
	? otherwise
	: IsDifferentPrimitive<path, A, B, IsDifferentCompound<path, A, B, otherwise>>

type Reason<A, B> = WhatIsDifferent<[], A, B, never> extends infer Diff
	? [Diff] extends [never]
		? "same"
		: Diff
	: never
