export const greenText = "\x1b[32m";
export const blueText = "\x1b[34m";
export const redText = "\x1b[31m";
export const yellowText = "\x1b[33m";

export const redLogger = (obj: any) => {
  console.log(redText, obj, redText);
};

export const FOLDER_PATH = {
  PUBLIC: "public",
  UPLOADS: "uploads",
};
