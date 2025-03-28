const randomTextFromArray = (texts: string[]) => {
	  return texts[Math.floor(Math.random() * texts.length)];
};
const randomText = (text: string) => {
	const nightOnlyTexts = [
		`Good evening, ${text}.`,
	];

	const afternoonOnlyTexts = [
		`Good afternoon, ${text}.`,
	];

	const morningOnlyTexts = [
		`Good morning, ${text}.`,
	];

	const date = new Date();
	const hour = date.getHours();
	if (hour >= 18) return randomTextFromArray(nightOnlyTexts);
	if (hour >= 12) return randomTextFromArray(afternoonOnlyTexts);
	return randomTextFromArray(morningOnlyTexts);
}

export default randomText;