import { Checker, isCheckValid } from "./core"

export const TypeGuard = <TInput, TCheck extends TInput>(checker: Checker<TInput, TCheck>) => (
	val: TInput,
): val is TCheck => {
	return isCheckValid(checker(val))
}
