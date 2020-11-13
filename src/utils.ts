export const stringifyObject = (value: unknown): string => {
	try {
		return JSON.stringify(value)
	} catch (err) {
		return "<complexs object>"
	}
}
