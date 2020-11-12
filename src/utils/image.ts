export function getBase64OfImage(fileImage: File | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (fileImage) {
      reader.readAsDataURL(fileImage);
      // tslint:disable-next-line: no-object-mutation
      reader.onload = () =>
        resolve(
          reader.result
            ? reader.result.toString().replace(/^data:image\/png;base64,/, "")
            : undefined
        );
      // tslint:disable-next-line: no-object-mutation
      reader.onerror = error => reject(error);
    }
  });
}
