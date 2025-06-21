export const getDateTime = (): string => {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	const hr = `${date.getHours()}`.padStart(2, '0');
	const min = `${date.getMinutes()}`.padStart(2, '0');

	return `${year}-${month}-${day}-${hr}${min}`;
};

export const downloadFile = (buffer: ArrayBuffer | Uint8Array, filename: string) => {
	const blob = new Blob([buffer], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
