import { Checker } from "./core"

export const MinLength = (minLength: number): Checker<string, string> => (value) =>
	value.length >= minLength ? [null, value] : [[`expected minimum string length ${minLength}`]]

export const MaxLength = (maxLength: number): Checker<string, string> => (value) =>
	value.length <= maxLength ? [null, value] : [[`expected maximum string length ${maxLength}`]]

export const Min = (min: number): Checker<number, number> => (value) =>
	value >= min ? [null, value] : [[`expected number >= ${value}, found ${value}`]]

export const Max = (max: number): Checker<number, number> => (value) =>
	value <= max ? [null, value] : [[`expected number <= ${value}, found ${value}`]]
