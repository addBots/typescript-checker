import { TypeMatches } from "./common"
import { Checker } from "./core"

export const MinLength = (minLength: number): Checker<string, string> => (value) =>
	value.length >= minLength ? [null, value] : [[`expected minimum string length ${minLength}`]]

export const MaxLength = (maxLength: number): Checker<string, string> => (value) =>
	value.length <= maxLength ? [null, value] : [[`expected maximum string length ${maxLength}`]]

export const Min = (min: number): Checker<number, number> => (value) =>
	value >= min ? [null, value] : [[`expected number >= ${min}, found ${value}`]]

export const Max = (max: number): Checker<number, number> => (value) =>
	value <= max ? [null, value] : [[`expected number <= ${max}, found ${value}`]]

export const Between = (min: number, max: number): Checker<number, number> => (value) =>
	value >= min && value <= max ? [null, value] : [[`expected number between ${min} and ${max}, found ${value}`]]

export const IsUUID: Checker<string, string> = TypeMatches(
	"UUID",
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
)

// opinionated validators

export const EMail = TypeMatches(
	"email",
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
)
