export function encrypt(inputString, shift) {
  let encryptedString = "";

  // Function to calculate numeric shift from a string
  function calculateShift(shiftValue) {
    if (typeof shiftValue === "string") {
      return [...shiftValue].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    } else if (typeof shiftValue === "number") {
      return shiftValue;
    } else {
      throw new Error("Shift must be a number or a string");
    }
  }

  const numericShift = calculateShift(shift);

  // Iterate over each character in the input string
  for (let i = 0; i < inputString.length; i++) {
    let char = inputString[i];
    let charCode = char.charCodeAt(0); // Get ASCII code of character

    // Apply the shift
    let shiftedCharCode = charCode + numericShift;

    // Convert back to character and add to result
    encryptedString += String.fromCharCode(shiftedCharCode);
  }

  return encryptedString;
}

export function decrypt(encryptedString, shift) {
  let decryptedString = "";

  // Function to calculate numeric shift from a string
  function calculateShift(shiftValue) {
    if (typeof shiftValue === "string") {
      return [...shiftValue].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    } else if (typeof shiftValue === "number") {
      return shiftValue;
    } else {
      throw new Error("Shift must be a number or a string");
    }
  }

  const numericShift = calculateShift(shift);

  // Iterate over each character in the encrypted string
  for (let i = 0; i < encryptedString.length; i++) {
    let char = encryptedString[i];
    let charCode = char.charCodeAt(0); // Get ASCII code of character

    // Reverse the shift
    let shiftedCharCode = charCode - numericShift;

    // Convert back to character and add to result
    decryptedString += String.fromCharCode(shiftedCharCode);
  }

  return decryptedString;
}
function unitTest() {
  let encrypted = encrypt("hello", "judeallanhill@icloud.com");
  if (encrypted === "৮৫৲৲৵") {
    if (decrypt(encrypted, "judeallanhill@icloud.com")) {
      return true;
    }
  }
}
// Example usage
console.log("Unit Test", unitTest());
